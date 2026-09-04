import { describe, expect, it } from "vitest";
import { DateRangeValue } from "@/types/date-range";
import { WorkoutEntry } from "@/types/workout";
import { buildCardioView } from "./build-cardio-view";

const NOW = new Date("2026-09-04T00:00:00Z");

function run(overrides: Partial<WorkoutEntry> = {}): WorkoutEntry {
    return {
        date: "2026-08-01",
        completed: true,
        activityType: "Cardio",
        muscle: "Legs",
        name: "Easy 4km Run @ 7:43/km",
        exercise: "Running",
        weight: null,
        reps: null,
        distanceKm: 4,
        durationMin: 30.88,
        ...overrides,
    };
}

function lift(overrides: Partial<WorkoutEntry> = {}): WorkoutEntry {
    return {
        date: "2026-08-01",
        completed: true,
        activityType: "Strength",
        muscle: "Legs",
        name: "Goblet Squat - Set 1",
        exercise: "Goblet Squat",
        weight: 7,
        reps: 12,
        distanceKm: null,
        durationMin: null,
        ...overrides,
    };
}

function view(workouts: WorkoutEntry[], range: DateRangeValue = "all") {
    return buildCardioView(workouts, { range, now: NOW });
}

describe("what counts as a run", () => {
    it("takes a record tagged as cardio", () => {
        expect(view([run(), lift()]).stats.runs).toBe(1);
    });

    it("takes a run mistagged as strength, so August is not short two runs", () => {
        const result = view([
            run(),
            run({ date: "2026-08-31", activityType: "Strength" }),
        ]);

        expect(result.stats.runs).toBe(2);
    });

    it("leaves strength work out of every series", () => {
        const result = view([lift(), lift({ exercise: "Bench Press" })]);

        expect(result.stats.runs).toBe(0);
        expect(result.pacePoints).toEqual([]);
        expect(result.unchartable).toBe("none-in-period");
    });

    it("ignores a run that was never marked complete", () => {
        expect(view([run({ completed: false })]).stats.runs).toBe(0);
    });
});

describe("pace", () => {
    it("divides duration by distance", () => {
        expect(view([run()]).pacePoints).toEqual([
            {
                date: "2026-08-01",
                paceMinPerKm: 7.72,
                distanceKm: 4,
                durationMin: 30.88,
            },
        ]);
    });

    it("orders points by date", () => {
        const result = view([
            run({ date: "2026-08-17" }),
            run({ date: "2026-07-06" }),
        ]);

        expect(result.pacePoints.map((point) => point.date)).toEqual([
            "2026-07-06",
            "2026-08-17",
        ]);
    });

    it("weights the average by distance, so long runs are not under-counted", () => {
        // A naive mean of 8.0 and 7.0 would report 7.5; the 8 km run is twice
        // the work of the 4 km one and has to pull the average further.
        const result = view([
            run({ date: "2026-08-01", distanceKm: 4, durationMin: 32 }),
            run({ date: "2026-08-08", distanceKm: 8, durationMin: 56 }),
        ]);

        expect(result.stats.avgPaceMinPerKm).toBe(7.33);
    });

    it("reports the fastest run as the best pace", () => {
        const result = view([
            run({ date: "2026-08-01", distanceKm: 4, durationMin: 32 }),
            run({ date: "2026-08-08", distanceKm: 8, durationMin: 56 }),
        ]);

        expect(result.stats.bestPaceMinPerKm).toBe(7);
    });

    it("totals the distance actually covered", () => {
        const result = view([
            run({ date: "2026-08-01", distanceKm: 3.69 }),
            run({ date: "2026-08-08", distanceKm: 7 }),
        ]);

        expect(result.stats.totalKm).toBe(10.69);
    });
});

describe("runs with no distance recorded", () => {
    const log = [
        run({ date: "2026-08-01", distanceKm: 4, durationMin: 32 }),
        run({ date: "2026-08-15", distanceKm: null, durationMin: 30 }),
    ];

    it("keeps them out of pace, totals and weekly distance", () => {
        const result = view(log);

        expect(result.pacePoints).toHaveLength(1);
        expect(result.stats.totalKm).toBe(4);
        expect(result.stats.avgPaceMinPerKm).toBe(8);
    });

    it("still counts them as runs you went out for", () => {
        expect(view(log).stats.runs).toBe(2);
    });

    it("still marks the day on the calendar, since you did run", () => {
        const result = view(log);

        expect(
            result.calendar.find((day) => day.date === "2026-08-15")?.count,
        ).toBe(1);
    });

    it("reports them as excluded, naming what is missing", () => {
        expect(view(log).exclusions).toEqual({
            missingDistance: 1,
            missingDuration: 0,
        });
    });

    it("treats a zero distance as unrecorded rather than as a run of no length", () => {
        const result = view([run({ distanceKm: 0 })]);

        expect(result.exclusions.missingDistance).toBe(1);
        expect(result.pacePoints).toEqual([]);
    });

    it("refuses a negative distance, which would plot as a negative pace", () => {
        const result = view([run({ distanceKm: -4 })]);

        expect(result.pacePoints).toEqual([]);
        expect(result.exclusions.missingDistance).toBe(1);
    });

    it("says there is nothing to chart when no run in the period has one", () => {
        const result = view([run({ distanceKm: null })]);

        expect(result.unchartable).toBe("no-distance");
    });
});

describe("weekly distance", () => {
    it("buckets runs into Monday-anchored weeks", () => {
        // 1 Aug 2026 is a Saturday, so it belongs to the week of Monday 27 Jul.
        const result = view([run({ date: "2026-08-01", distanceKm: 4 })]);

        expect(result.weeklyPoints[0]).toEqual({
            weekStart: "2026-07-27",
            km: 4,
            runs: 1,
            minutes: 30.88,
        });
    });

    it("sums every run in the same week", () => {
        const result = view([
            run({ date: "2026-07-30", distanceKm: 4, durationMin: 30 }),
            run({ date: "2026-08-01", distanceKm: 3.69, durationMin: 30 }),
        ]);

        expect(result.weeklyPoints[0]).toEqual({
            weekStart: "2026-07-27",
            km: 7.69,
            runs: 2,
            minutes: 60,
        });
    });

    it("includes a week you did not run, so a break reads as a gap", () => {
        const result = view([
            run({ date: "2026-08-01" }),
            run({ date: "2026-08-17" }),
        ]);

        expect(result.weeklyPoints.map((point) => point.weekStart)).toEqual([
            "2026-07-27",
            "2026-08-03",
            "2026-08-10",
            "2026-08-17",
            "2026-08-24",
            "2026-08-31",
        ]);
        expect(result.weeklyPoints[1]).toEqual({
            weekStart: "2026-08-03",
            km: 0,
            runs: 0,
            minutes: 0,
        });
    });

    it("runs up to the current week, so stopping recently is visible", () => {
        const result = view([run({ date: "2026-08-01" })]);

        expect(result.weeklyPoints.at(-1)?.weekStart).toBe("2026-08-31");
        expect(result.weeklyPoints.at(-1)?.runs).toBe(0);
    });

    /**
     * Attendance is not a data-quality question. A week of runs logged without
     * a distance contributes no kilometres, but saying you ran nought times
     * that week is simply false.
     */
    it("counts a run with no distance as a run, even though it adds no distance", () => {
        const result = view([
            run({ date: "2026-08-01", distanceKm: null, durationMin: 30 }),
            run({ date: "2026-07-30", distanceKm: null, durationMin: 30 }),
        ]);

        expect(result.weeklyPoints[0]).toEqual({
            weekStart: "2026-07-27",
            km: 0,
            runs: 2,
            minutes: 60,
        });
    });

    it("starts at the opening of the selected period, not at the first run", () => {
        // The 28-day window opens 7 Aug, inside the week of Monday 3 Aug, so
        // the fortnight before the run has to show as empty rather than vanish.
        const result = view([run({ date: "2026-08-25" })], 28);

        expect(result.weeklyPoints.map((point) => point.weekStart)).toEqual([
            "2026-08-03",
            "2026-08-10",
            "2026-08-17",
            "2026-08-24",
            "2026-08-31",
        ]);
    });

    it("starts at the first run for all time, so there is no empty run-in", () => {
        const result = view([run({ date: "2026-08-25" })], "all");

        expect(result.weeklyPoints[0].weekStart).toBe("2026-08-24");
    });
});

describe("periods", () => {
    const log = [
        run({ date: "2026-09-02" }),
        run({ date: "2026-08-01" }),
        run({ date: "2026-06-02" }),
    ];

    it("keeps only runs within four weeks", () => {
        // The window opens 7 Aug, so the 1 Aug run falls outside it.
        expect(view(log, 28).stats.runs).toBe(1);
    });

    it("keeps only runs within three months", () => {
        // The window opens 6 Jun, so the 2 Jun run falls outside it.
        expect(view(log, 90).stats.runs).toBe(2);
    });

    it("keeps everything for all time", () => {
        expect(view(log, "all").stats.runs).toBe(3);
    });

    it("says so when there are no runs in the period", () => {
        const result = view([run({ date: "2026-01-01" })], 28);

        expect(result.stats.runs).toBe(0);
        expect(result.unchartable).toBe("none-in-period");
        expect(result.weeklyPoints).toEqual([]);
    });

    it("reports no average pace rather than zero when nothing qualifies", () => {
        const result = view([], "all");

        expect(result.stats.avgPaceMinPerKm).toBeNull();
        expect(result.stats.bestPaceMinPerKm).toBeNull();
    });
});

describe("consistency calendar", () => {
    it("spans the full year regardless of the selected period", () => {
        const result = view([run({ date: "2026-08-01" })], 28);

        expect(result.calendar).toHaveLength(365);
        expect(result.calendarYear).toBe(2026);
        // Outside the 28-day window, yet still on the calendar.
        expect(
            result.calendar.find((day) => day.date === "2026-08-01")?.count,
        ).toBe(1);
    });

    it("counts runs and not strength sets", () => {
        const result = view([
            run({ date: "2026-08-01" }),
            lift({ date: "2026-08-01" }),
            lift({ date: "2026-08-01" }),
        ]);

        expect(
            result.calendar.find((day) => day.date === "2026-08-01")?.count,
        ).toBe(1);
    });
});
