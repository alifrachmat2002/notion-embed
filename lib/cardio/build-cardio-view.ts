import { filterByDateRange } from "@/lib/muscles/filter-by-date-range";
import { workoutsToCalendarData } from "@/lib/transform";
import { DateRangeValue } from "@/types/date-range";
import { WorkoutEntry } from "@/types/workout";
import { isCardioRecord } from "./is-cardio";
import {
    CardioExclusions,
    CardioOptions,
    CardioRun,
    CardioStats,
    CardioUnchartableReason,
    CardioView,
    PacePoint,
    WeeklyPoint,
} from "./types";

/**
 * Everything the cardio dashboard renders, from one call.
 *
 * The mirror of `buildAnalyticsView`, and deliberately not a branch inside it:
 * a run has no weight, reps or volume, and there is only one cardio exercise in
 * the log, so there is nothing to select and nothing the strength panels could
 * plot. Keeping them apart lets each view model say only true things.
 */
export function buildCardioView(
    workouts: WorkoutEntry[],
    { range, now = new Date() }: CardioOptions,
): CardioView {
    // The cardio rule is derived from the whole log, then the period applied:
    // a run mistagged as strength is only recognisable by the company its
    // exercise keeps elsewhere, which a filtered window might not contain.
    const isCardio = isCardioRecord(workouts);
    const runs = workouts.filter(
        (workout) => workout.completed && Boolean(workout.date) && isCardio(workout),
    );

    const attended = filterByDateRange(runs, range, now);
    const usable = attended.filter(isUsable).map(toCardioRun);
    const calendarYear = now.getFullYear();

    return {
        stats: summarise(attended, usable),
        exclusions: countExclusions(attended),
        pacePoints: orderByDate(usable.map(toPacePoint)),
        weeklyPoints: weeklySeries(attended, range, now),
        calendar: workoutsToCalendarData(runs, calendarYear),
        calendarYear,
        unchartable: diagnose(attended.length, usable.length),
    };
}

/**
 * A run needs both numbers to say anything about speed. Six August runs record
 * a duration but no distance; counted as zero they would read as a run of no
 * length and divide into an infinite pace.
 */
function isUsable(workout: WorkoutEntry): boolean {
    return positive(workout.distanceKm) && positive(workout.durationMin);
}

function positive(value: number | null): boolean {
    return value !== null && value > 0;
}

/** Narrowed once, past the `isUsable` gate, so nothing downstream re-asserts. */
function toCardioRun(workout: WorkoutEntry): CardioRun {
    return {
        date: normalizeDate(workout.date),
        distanceKm: workout.distanceKm ?? 0,
        durationMin: workout.durationMin ?? 0,
    };
}

function paceOf(run: CardioRun): number {
    return round(run.durationMin / run.distanceKm);
}

function toPacePoint(run: CardioRun): PacePoint {
    return {
        date: run.date,
        paceMinPerKm: paceOf(run),
        distanceKm: run.distanceKm,
        durationMin: run.durationMin,
    };
}

function summarise(attended: WorkoutEntry[], usable: CardioRun[]): CardioStats {
    const totalKm = sum(usable.map((run) => run.distanceKm));
    const totalMin = sum(usable.map((run) => run.durationMin));

    return {
        runs: attended.length,
        totalKm,
        // Weighted by distance rather than averaged across runs. See the note
        // on CardioStats: a long run is more of the evidence, not one vote.
        avgPaceMinPerKm: totalKm > 0 ? round(totalMin / totalKm) : null,
        bestPaceMinPerKm: min(usable.map(paceOf)),
    };
}

function countExclusions(attended: WorkoutEntry[]): CardioExclusions {
    return {
        missingDistance: attended.filter(
            (workout) => !positive(workout.distanceKm),
        ).length,
        // Distance gaps are already accounted for; don't report a run twice.
        missingDuration: attended.filter(
            (workout) =>
                positive(workout.distanceKm) && !positive(workout.durationMin),
        ).length,
    };
}

/**
 * Weekly totals rather than per-run ones: runs alternate roughly 4 km and 7 km,
 * so a per-run distance chart is a zigzag that hides the trend it exists to
 * show. Weeks smooth that out, and an empty week left in the series is what
 * makes a break in training legible.
 *
 * The series starts at the first run in the period and always reaches the
 * current week, so having stopped recently shows as trailing empty weeks.
 */
function weeklySeries(
    attended: WorkoutEntry[],
    range: DateRangeValue,
    now: Date,
): WeeklyPoint[] {
    if (attended.length === 0) return [];

    const totals = new Map<string, WeeklyPoint>();

    // Bucketed from attendance, not from the usable runs: a week you ran twice
    // without recording a distance contributes no kilometres, but reporting it
    // as nought runs would be false. Each field sums what is actually known.
    for (const workout of attended) {
        const weekStart = mondayOf(normalizeDate(workout.date));
        const existing = totals.get(weekStart);
        const point = existing ?? { weekStart, km: 0, runs: 0, minutes: 0 };

        if (isUsable(workout)) point.km += workout.distanceKm!;
        if (positive(workout.durationMin)) point.minutes += workout.durationMin!;
        point.runs += 1;

        if (!existing) totals.set(weekStart, point);
    }

    const firstRun = min(attended.map((workout) => normalizeDate(workout.date)))!;
    const last = mondayOf(toIsoDate(now));

    return weeksBetween(mondayOf(openingOf(range, firstRun, now)), last).map(
        (weekStart) => {
            const point = totals.get(weekStart);

            if (!point) return { weekStart, km: 0, runs: 0, minutes: 0 };

            // Rounded once the week is complete: summing 4 and 3.69 as they
            // arrive lands on 7.690000000000001.
            return {
                ...point,
                km: round(point.km),
                minutes: round(point.minutes),
            };
        },
    );
}

/**
 * Where the series starts. A bounded period opens at its own boundary, so weeks
 * you did not run at the start of it still show; all-time opens at the first
 * run, because the log has no earlier edge to run in from.
 */
function openingOf(
    range: DateRangeValue,
    firstRun: string,
    now: Date,
): string {
    if (range === "all") return firstRun;

    const opening = new Date(now);

    opening.setDate(opening.getDate() - range);

    return toIsoDate(opening);
}

function weeksBetween(first: string, last: string): string[] {
    const weeks: string[] = [];

    for (
        let current = new Date(`${first}T00:00:00Z`);
        toIsoDate(current) <= last;
        current.setUTCDate(current.getUTCDate() + 7)
    ) {
        weeks.push(toIsoDate(current));
    }

    return weeks;
}

/** UTC throughout, so a week boundary does not move with the viewer's clock. */
function mondayOf(date: string): string {
    const parsed = new Date(`${date}T00:00:00Z`);
    const daysSinceMonday = (parsed.getUTCDay() + 6) % 7;

    parsed.setUTCDate(parsed.getUTCDate() - daysSinceMonday);

    return toIsoDate(parsed);
}

function toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function diagnose(
    attended: number,
    usable: number,
): CardioUnchartableReason | null {
    if (usable > 0) return null;

    return attended === 0 ? "none-in-period" : "no-distance";
}

function normalizeDate(date: string): string {
    return date.slice(0, 10);
}

function orderByDate<T extends { date: string }>(points: T[]): T[] {
    return points.sort((a, b) => a.date.localeCompare(b.date));
}

function sum(values: number[]): number {
    return round(values.reduce((total, value) => total + value, 0));
}

function min<T extends number | string>(values: T[]): T | null {
    return values.length
        ? values.reduce((lowest, value) => (value < lowest ? value : lowest))
        : null;
}

/** Guard against float drift from fractional distances (3.69, 3.82). */
function round(value: number): number {
    return Math.round(value * 100) / 100;
}
