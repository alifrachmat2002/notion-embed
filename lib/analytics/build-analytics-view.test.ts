import { describe, expect, it } from "vitest";
import { WorkoutEntry } from "@/types/workout";
import { buildAnalyticsView } from "./build-analytics-view";

const NOW = new Date("2026-09-04T00:00:00Z");

function workout(overrides: Partial<WorkoutEntry> = {}): WorkoutEntry {
    return {
        date: "2026-08-01",
        completed: true,
        activityType: "Strength",
        muscle: null,
        name: "Set 1",
        exercise: "Goblet Squat",
        weight: 7,
        reps: 12,
        ...overrides,
    };
}

/** Repeat a set the way a real session logs three identical working sets. */
function sets(count: number, overrides: Partial<WorkoutEntry> = {}) {
    return Array.from({ length: count }, () => workout(overrides));
}

function view(workouts: WorkoutEntry[], exercise: string | null = null) {
    return buildAnalyticsView(workouts, { exercise, range: "all", now: NOW });
}

describe("exercise options", () => {
    it("omits cardio, which records distance and duration rather than load", () => {
        const result = view([
            ...sets(3, { exercise: "Goblet Squat" }),
            workout({
                exercise: "Running",
                activityType: "Cardio",
                weight: null,
                reps: null,
            }),
        ]);

        expect(result.exercises.map((e) => e.name)).toEqual(["Goblet Squat"]);
    });

    it("omits a cardio exercise even where a record is mistagged strength", () => {
        const result = view([
            ...sets(3, { exercise: "Goblet Squat" }),
            workout({
                exercise: "Running",
                activityType: "Cardio",
                weight: null,
                reps: null,
            }),
            workout({
                exercise: "Running",
                activityType: "Strength",
                weight: null,
                reps: null,
            }),
        ]);

        expect(result.exercises.map((e) => e.name)).toEqual(["Goblet Squat"]);
    });

    it("keeps exercises with nothing to plot, marked as such", () => {
        const result = view([
            ...sets(3, { exercise: "Goblet Squat" }),
            ...sets(6, {
                exercise: "Bicep curl hold",
                name: "Bicep Curl Hold - Set 1 (40s hold)",
                reps: 40,
            }),
        ]);

        expect(result.exercises).toEqual([
            {
                name: "Bicep curl hold",
                kind: "weighted",
                setCount: 6,
                usableSets: 0,
            },
            {
                name: "Goblet Squat",
                kind: "weighted",
                setCount: 3,
                usableSets: 3,
            },
        ]);
    });

    it("never defaults to an exercise with nothing to plot", () => {
        const result = view([
            ...sets(3, { exercise: "Goblet Squat" }),
            ...sets(6, {
                exercise: "Bicep curl hold",
                name: "Bicep Curl Hold - Set 1 (40s hold)",
                reps: 40,
            }),
        ]);

        expect(result.selected).toBe("Goblet Squat");
        expect(result.unchartable).toBeNull();
    });

    it("omits records with no exercise assigned", () => {
        const result = view([
            ...sets(3, { exercise: "Goblet Squat" }),
            ...sets(3, {
                exercise: null,
                name: "Declined Push up - Set 1",
                weight: 0,
                reps: 10,
            }),
        ]);

        expect(result.exercises).toHaveLength(1);
        expect(result.stats.sets).toBe(3);
    });

    it("orders by set count, breaking ties alphabetically", () => {
        const result = view([
            ...sets(3, { exercise: "Shoulder Press" }),
            ...sets(3, { exercise: "Front Raise" }),
            ...sets(5, { exercise: "Goblet Squat" }),
        ]);

        expect(result.exercises.map((e) => e.name)).toEqual([
            "Goblet Squat",
            "Front Raise",
            "Shoulder Press",
        ]);
    });

    it("explains an unchartable exercise when you ask for it directly", () => {
        const result = view(
            [
                ...sets(3, { exercise: "Goblet Squat" }),
                ...sets(6, {
                    exercise: "Bicep curl hold",
                    name: "Bicep Curl Hold - Set 1 (40s hold)",
                    reps: 40,
                }),
            ],
            "Bicep curl hold",
        );

        expect(result.selected).toBe("Bicep curl hold");
        expect(result.unchartable).toBe("all-holds");
        expect(result.stats).toMatchObject({ sets: 6, volume: 0, maxWeight: 0 });
        expect(result.exclusions).toEqual({ holds: 6, missingReps: 0 });
    });

    it("selects the first option when none is requested", () => {
        const result = view([
            ...sets(3, { exercise: "Shoulder Press" }),
            ...sets(5, { exercise: "Goblet Squat" }),
        ]);

        expect(result.selected).toBe("Goblet Squat");
    });

    it("falls back to the default when an unknown exercise is requested", () => {
        const result = view(sets(3, { exercise: "Goblet Squat" }), "Deadlift");

        expect(result.selected).toBe("Goblet Squat");
    });

    it("reports an empty view when there is nothing at all", () => {
        const result = view([]);

        expect(result.selected).toBeNull();
        expect(result.stats.sets).toBe(0);
        expect(result.weightSeries).toEqual([]);
        expect(result.unchartable).toBe("none-in-period");
    });
});

describe("timed holds", () => {
    const log = [
        ...sets(2, { date: "2026-06-22", weight: 6.5, reps: 12 }),
        workout({
            date: "2026-06-22",
            name: "Hammer Curl - Set 1 (40s hold)",
            weight: 6.5,
            reps: 40,
        }),
    ];

    it("keeps seconds-as-reps out of volume and the strength index", () => {
        const result = view(log);

        // 6.5 x 40 = 260 would otherwise be the largest volume in the log.
        expect(result.stats.volume).toBe(156);
        expect(result.weightSeries[0].strengthIndex).toBe(9.1);
    });

    it("still counts the hold as a set you performed", () => {
        const result = view(log);

        expect(result.stats.sets).toBe(3);
        expect(result.stats.sessions).toBe(1);
    });

    it("reports the hold as excluded", () => {
        expect(view(log).exclusions).toEqual({ holds: 1, missingReps: 0 });
    });

    it("recognises a bare seconds marker, not just the word hold", () => {
        const result = view([
            ...sets(2, { date: "2026-06-30", weight: 6.5, reps: 12 }),
            workout({
                date: "2026-06-30",
                name: "Bicep Curl - Set 1 (40s)",
                weight: 6.5,
                reps: 0,
            }),
        ]);

        // Excluded either way; the point is that the reason is reported right.
        expect(result.exclusions).toEqual({ holds: 1, missingReps: 0 });
    });

    it("does not mistake an ordinary set title for a hold", () => {
        const result = view(sets(2, { name: "Bicep Curl - Set 1" }));

        expect(result.exclusions).toEqual({ holds: 0, missingReps: 0 });
        expect(result.stats.volume).toBe(168);
    });
});

describe("sets with no rep count", () => {
    const log = [
        ...sets(2, { date: "2026-08-28", weight: 7, reps: 12 }),
        workout({ date: "2026-08-29", weight: 7, reps: 0 }),
        workout({ date: "2026-08-29", weight: 7, reps: null }),
    ];

    it("treats a missing count as unrecorded rather than as zero effort", () => {
        const result = view(log);

        expect(result.stats.volume).toBe(168);
        expect(result.volumeSeries).toHaveLength(1);
    });

    it("still counts them as sets and sessions attended", () => {
        const result = view(log);

        expect(result.stats.sets).toBe(4);
        expect(result.stats.sessions).toBe(2);
    });

    it("reports them as excluded", () => {
        expect(view(log).exclusions).toEqual({ holds: 0, missingReps: 2 });
    });
});

describe("weighted exercises", () => {
    const log = [
        ...sets(3, { date: "2026-06-03", weight: 5.5, reps: 12 }),
        ...sets(3, { date: "2026-06-21", weight: 6.5, reps: 15 }),
        ...sets(3, { date: "2026-08-28", weight: 7, reps: 16 }),
    ];

    it("plots the heaviest weight of each session in date order", () => {
        expect(view(log).weightSeries.map((p) => p.maxWeight)).toEqual([
            5.5, 6.5, 7,
        ]);
    });

    it("keeps rising when weight goes up and reps come down", () => {
        const result = view([
            ...sets(3, { date: "2026-07-01", weight: 7, reps: 16 }),
            ...sets(3, { date: "2026-08-01", weight: 9, reps: 12 }),
        ]);

        expect(result.weightSeries.map((p) => p.strengthIndex)).toEqual([
            10.73, 12.6,
        ]);
    });

    it("sums session volume as weight times reps", () => {
        expect(view(log).volumeSeries.map((p) => p.volume)).toEqual([
            198, 292.5, 336,
        ]);
    });

    it("reports the heaviest weight reached", () => {
        expect(view(log).stats.maxWeight).toBe(7);
    });
});

describe("bodyweight exercises", () => {
    const log = sets(3, { exercise: "Push-up", weight: 0, reps: 15 });

    it("is classified by never recording a load", () => {
        expect(view(log).kind).toBe("bodyweight");
    });

    it("measures volume in reps, so progress is visible rather than zero", () => {
        expect(view(log).stats.volume).toBe(45);
        expect(view(log).volumeSeries[0].volume).toBe(45);
    });

    it("reports a max weight of zero and plots no weight series", () => {
        // Deliberate: all four stat cards stay literal, so an unloaded
        // exercise reads 0 kg rather than being blanked out.
        expect(view(log).stats.maxWeight).toBe(0);
        expect(view(log).weightSeries).toEqual([]);
    });

    it("treats a null weight as unloaded rather than as missing", () => {
        const result = view(sets(2, { exercise: "Push-up", weight: null }));

        expect(result.kind).toBe("bodyweight");
        expect(result.exclusions.missingReps).toBe(0);
    });
});

describe("rep scatter", () => {
    it("collapses identical sets into one mark carrying the count", () => {
        const result = view(sets(3, { date: "2026-08-01", weight: 7, reps: 12 }));

        expect(result.repSeries).toEqual([
            { date: "2026-08-01", weight: 7, reps: 12, setCount: 3 },
        ]);
    });

    it("keeps sets that differ in weight or reps apart", () => {
        const result = view([
            ...sets(2, { date: "2026-08-01", weight: 6.5, reps: 16 }),
            workout({ date: "2026-08-01", weight: 6.5, reps: 8 }),
        ]);

        expect(result.repSeries).toHaveLength(2);
        expect(result.repSeries.map((p) => p.setCount)).toEqual([2, 1]);
    });
});

describe("periods", () => {
    const log = [
        workout({ date: "2026-09-01" }),
        workout({ date: "2026-07-01" }),
        workout({ date: "2026-01-01" }),
    ];

    function inRange(range: number | "all") {
        return buildAnalyticsView(log, {
            exercise: null,
            range,
            now: NOW,
        }).stats.sets;
    }

    it("keeps only sessions within four weeks", () => {
        expect(inRange(28)).toBe(1);
    });

    it("keeps only sessions within three months", () => {
        expect(inRange(90)).toBe(2);
    });

    it("keeps everything for all time", () => {
        expect(inRange("all")).toBe(3);
    });

    it("says so when the exercise has nothing in the period", () => {
        const result = buildAnalyticsView(
            [workout({ date: "2026-01-01" })],
            { exercise: null, range: 28, now: NOW },
        );

        expect(result.stats.sets).toBe(0);
        expect(result.unchartable).toBe("none-in-period");
    });
});

describe("consistency calendar", () => {
    it("spans the full year regardless of the selected period", () => {
        const result = buildAnalyticsView(sets(3, { date: "2026-08-01" }), {
            exercise: null,
            range: 28,
            now: NOW,
        });

        expect(result.calendar).toHaveLength(365);
        expect(result.calendarYear).toBe(2026);
        // Outside the 28-day window, yet still on the calendar.
        expect(
            result.calendar.find((day) => day.date === "2026-08-01")?.count,
        ).toBe(3);
    });

    it("counts only the selected exercise", () => {
        const result = view(
            [
                ...sets(3, { date: "2026-08-01", exercise: "Goblet Squat" }),
                ...sets(2, { date: "2026-08-01", exercise: "Front Raise" }),
            ],
            "Front Raise",
        );

        expect(
            result.calendar.find((day) => day.date === "2026-08-01")?.count,
        ).toBe(2);
    });

    it("counts attendance, including sets excluded from the figures", () => {
        const result = view([
            ...sets(2, { date: "2026-08-01" }),
            workout({ date: "2026-08-01", reps: 0 }),
        ]);

        expect(
            result.calendar.find((day) => day.date === "2026-08-01")?.count,
        ).toBe(3);
    });
});
