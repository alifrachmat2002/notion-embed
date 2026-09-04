import { isCardioRecord } from "@/lib/cardio/is-cardio";
import { filterByDateRange } from "@/lib/muscles/filter-by-date-range";
import { workoutsToCalendarData } from "@/lib/transform";
import { WorkoutEntry } from "@/types/workout";
import {
    AnalyticsOptions,
    AnalyticsSet,
    AnalyticsView,
    Exclusions,
    ExerciseKind,
    ExerciseOption,
    RepPoint,
    UnchartableReason,
    VolumePoint,
    WeightPoint,
} from "./types";

/**
 * Everything the analytics dashboard renders, from one call.
 *
 * This is the module's only export by design: the hygiene rules, session
 * grouping and per-chart aggregation below are decisions about what the numbers
 * mean, and pinning them behind a single view model keeps them testable without
 * freezing how this file is organised.
 */
export function buildAnalyticsView(
    workouts: WorkoutEntry[],
    { exercise, range, now = new Date() }: AnalyticsOptions,
): AnalyticsView {
    const strength = workouts.filter(isStrengthRecord(isCardioRecord(workouts)));

    const exercises = listExercises(strength);
    const selected = resolveSelection(exercise, exercises);
    const calendarYear = now.getFullYear();

    if (!selected) {
        return emptyView(exercises, calendarYear);
    }

    const kind = exercises.find((option) => option.name === selected)!.kind;

    // Attendance: every set of this exercise in the period, however incomplete.
    const attended = filterByDateRange(strength, range, now).filter(
        (workout) => workout.exercise === selected,
    );

    const usable = attended.filter(isUsable).map(toAnalyticsSet);
    const sessionDates = unique(attended.map((w) => normalizeDate(w.date)));
    const exclusions = countExclusions(attended);

    return {
        exercises,
        selected,
        kind,
        stats: {
            sessions: sessionDates.length,
            sets: attended.length,
            volume: sum(usable.map((set) => setVolume(set, kind))),
            maxWeight: max(usable.map((set) => set.weight)) ?? 0,
        },
        exclusions,
        weightSeries: kind === "bodyweight" ? [] : weightSeries(usable),
        repSeries: repSeries(usable),
        volumeSeries: volumeSeries(usable, kind),
        calendar: workoutsToCalendarData(
            strength.filter((workout) => workout.exercise === selected),
            calendarYear,
        ),
        calendarYear,
        unchartable: diagnose(usable.length, attended.length, exclusions),
    };
}

/**
 * Why there is nothing to draw. The page says this instead of rendering axes
 * with no marks on them.
 */
function diagnose(
    usable: number,
    attended: number,
    exclusions: Exclusions,
): UnchartableReason | null {
    if (usable > 0) return null;
    if (attended === 0) return "none-in-period";

    return exclusions.holds >= exclusions.missingReps ? "all-holds" : "no-reps";
}

/**
 * Cardio records distance and duration rather than weight and reps, so it has
 * nothing the weight/rep/volume panels can plot. `/cardio` charts it instead,
 * off the same shared rule for what counts as a run.
 */
function isStrengthRecord(isCardio: (workout: WorkoutEntry) => boolean) {
    return (workout: WorkoutEntry): boolean =>
        workout.completed &&
        Boolean(workout.date) &&
        workout.activityType === "Strength" &&
        !isCardio(workout);
}

/**
 * Timed holds put *seconds* in the reps field. The exercise select names an
 * ordinary curl on those records, so only the title gives them away — left in,
 * a 40-second hold becomes both the heaviest lift and the largest volume in the
 * log. They still count as sets; they just cannot be multiplied.
 *
 * Titles are inconsistent about saying "hold": the same session logs both
 * "(40s hold)" and a bare "(40s)". Matching the seconds marker too keeps the
 * reported reason honest, since either way the record is excluded.
 */
const SECONDS_MARKER = /\(\s*\d+\s*s\b/i;

function isHold(workout: WorkoutEntry): boolean {
    return (
        workout.name.toLowerCase().includes("hold") ||
        SECONDS_MARKER.test(workout.name)
    );
}

/** Reps of 0 or null mean "not recorded", never "no effort". */
function hasReps(workout: WorkoutEntry): boolean {
    return workout.reps !== null && workout.reps > 0;
}

function isUsable(workout: WorkoutEntry): boolean {
    return Boolean(workout.exercise) && !isHold(workout) && hasReps(workout);
}

function toAnalyticsSet(workout: WorkoutEntry): AnalyticsSet {
    return {
        date: normalizeDate(workout.date),
        exercise: workout.exercise!,
        weight: workout.weight ?? 0,
        reps: workout.reps!,
    };
}

function countExclusions(attended: WorkoutEntry[]): Exclusions {
    const holds = attended.filter(isHold);

    return {
        holds: holds.length,
        // Holds are already accounted for; don't report the same set twice.
        missingReps: attended.filter((w) => !isHold(w) && !hasReps(w)).length,
    };
}

/**
 * Selector contents, built from the whole log rather than the selected period
 * so the dropdown does not change shape as you switch periods.
 *
 * Exercises with no usable sets are kept and marked instead of dropped: the
 * bicep work is logged entirely as timed holds, and hiding it would make 17% of
 * the log silently vanish. Their panels explain themselves instead.
 */
function listExercises(strength: WorkoutEntry[]): ExerciseOption[] {
    const byName = new Map<string, WorkoutEntry[]>();

    for (const workout of strength) {
        if (!workout.exercise) continue;

        const existing = byName.get(workout.exercise);

        if (existing) existing.push(workout);
        else byName.set(workout.exercise, [workout]);
    }

    return [...byName]
        .map(([name, sets]) => ({
            name,
            kind: classify(sets),
            setCount: sets.length,
            usableSets: sets.filter(isUsable).length,
        }))
        .sort(
            (a, b) =>
                b.setCount - a.setCount || a.name.localeCompare(b.name),
        );
}

/**
 * Classified across the whole log, not the selected period: an exercise does
 * not stop being a bodyweight movement because you picked a shorter window.
 */
function classify(sets: WorkoutEntry[]): ExerciseKind {
    const loaded = sets.some((set) => set.weight !== null && set.weight > 0);

    return loaded ? "weighted" : "bodyweight";
}

/**
 * An explicit request always wins, including an exercise with nothing to plot —
 * you asked for it, so you get its explanation. The default skips those, so the
 * page never opens on an empty dashboard.
 */
function resolveSelection(
    requested: string | null,
    exercises: ExerciseOption[],
): string | null {
    if (requested && exercises.some((option) => option.name === requested)) {
        return requested;
    }

    const chartable = exercises.find((option) => option.usableSets > 0);

    return (chartable ?? exercises[0])?.name ?? null;
}

/** A session is one exercise on one date — dates carry no time component. */
function bySession(sets: AnalyticsSet[]): Map<string, AnalyticsSet[]> {
    const sessions = new Map<string, AnalyticsSet[]>();

    for (const set of sets) {
        const existing = sessions.get(set.date);

        if (existing) existing.push(set);
        else sessions.set(set.date, [set]);
    }

    return sessions;
}

function weightSeries(sets: AnalyticsSet[]): WeightPoint[] {
    return orderByDate(
        [...bySession(sets)].map(([date, session]) => ({
            date,
            maxWeight: max(session.map((set) => set.weight)) ?? 0,
            strengthIndex: round(
                max(session.map(strengthIndex)) ?? 0,
            ),
        })),
    );
}

/**
 * Epley. A relative progression index, not a one-rep max: roughly a third of
 * the logged sets sit above 12 reps, where Epley inflates badly. It earns its
 * place only because it rises through the transitions where weight goes up and
 * reps come down, which raw weight alone cannot show.
 */
function strengthIndex(set: AnalyticsSet): number {
    return set.weight * (1 + set.reps / 30);
}

/**
 * Sets repeated identically within a session land on the same coordinates, so
 * they collapse into one mark carrying the count rather than stacking
 * invisibly.
 */
function repSeries(sets: AnalyticsSet[]): RepPoint[] {
    const marks = new Map<string, RepPoint>();

    for (const set of sets) {
        const key = `${set.date}|${set.weight}|${set.reps}`;
        const existing = marks.get(key);

        if (existing) existing.setCount += 1;
        else
            marks.set(key, {
                date: set.date,
                weight: set.weight,
                reps: set.reps,
                setCount: 1,
            });
    }

    return orderByDate([...marks.values()]);
}

function volumeSeries(sets: AnalyticsSet[], kind: ExerciseKind): VolumePoint[] {
    return orderByDate(
        [...bySession(sets)].map(([date, session]) => ({
            date,
            volume: sum(session.map((set) => setVolume(set, kind))),
        })),
    );
}

/**
 * Bodyweight exercises log every set at weight 0, so `weight × reps` would
 * flatline at zero. Reps are the honest workload unit for them.
 */
function setVolume(set: AnalyticsSet, kind: ExerciseKind): number {
    return kind === "bodyweight" ? set.reps : set.weight * set.reps;
}

function emptyView(
    exercises: ExerciseOption[],
    calendarYear: number,
): AnalyticsView {
    return {
        exercises,
        selected: null,
        kind: "weighted",
        stats: { sessions: 0, sets: 0, volume: 0, maxWeight: 0 },
        exclusions: { missingReps: 0, holds: 0 },
        weightSeries: [],
        repSeries: [],
        volumeSeries: [],
        calendar: workoutsToCalendarData([], calendarYear),
        calendarYear,
        unchartable: "none-in-period",
    };
}

function normalizeDate(date: string): string {
    return date.slice(0, 10);
}

function orderByDate<T extends { date: string }>(points: T[]): T[] {
    return points.sort((a, b) => a.date.localeCompare(b.date));
}

function unique(values: string[]): string[] {
    return [...new Set(values)];
}

function sum(values: number[]): number {
    return round(values.reduce((total, value) => total + value, 0));
}

function max(values: number[]): number | null {
    return values.length ? Math.max(...values) : null;
}

/** Guard against float drift from fractional dumbbell weights (5.5, 6.5). */
function round(value: number): number {
    return Math.round(value * 100) / 100;
}
