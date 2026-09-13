import { describe, expect, it } from "vitest";
import { WorkoutEntry } from "@/types/workout";
import { buildMuscleHeatmap } from "./build-muscle-heatmap";

const NOW = new Date("2026-09-04T00:00:00Z");

function workout(overrides: Partial<WorkoutEntry> = {}): WorkoutEntry {
    return {
        date: "2026-09-01",
        completed: true,
        activityType: "Strength",
        muscle: "Chest",
        name: "Set 1",
        exercise: "Bench Press",
        weight: 20,
        reps: 10,
        distanceKm: null,
        durationMin: null,
        workoutType: "Upper Body",
        ...overrides,
    };
}

/** Repeat a set the way a real session logs several identical working sets. */
function sets(count: number, overrides: Partial<WorkoutEntry> = {}) {
    return Array.from({ length: count }, () => workout(overrides));
}

function heatmap(workouts: WorkoutEntry[]) {
    return buildMuscleHeatmap(workouts, 30, NOW);
}

describe("what counts toward a muscle", () => {
    it("counts one logged set as one unit of volume", () => {
        const result = heatmap(sets(3, { muscle: "Chest" }));

        expect(result.volume.chest).toBe(3);
    });

    it("gives every muscle the heatmap knows a group to land on", () => {
        const result = heatmap([
            workout({ muscle: "Chest" }),
            workout({ muscle: "Back" }),
            workout({ muscle: "Shoulders" }),
            workout({ muscle: "Biceps" }),
            workout({ muscle: "Triceps" }),
            workout({ muscle: "Core" }),
            workout({ muscle: "Legs" }),
        ]);

        expect(result.volume).toEqual({
            chest: 1,
            back: 1,
            shoulders: 1,
            arms: 2,
            core: 1,
            legs: 1,
        });
        expect(result.unmapped).toEqual({});
    });

    it("counts biceps and triceps as the one arms group the body map draws", () => {
        const result = heatmap([
            ...sets(2, { muscle: "Biceps" }),
            ...sets(3, { muscle: "Triceps" }),
        ]);

        expect(result.volume.arms).toBe(5);
    });

    it("ignores a set that was planned and never ticked", () => {
        const result = heatmap([
            ...sets(2, { muscle: "Chest" }),
            ...sets(4, { muscle: "Chest", completed: false }),
        ]);

        expect(result.volume.chest).toBe(2);
    });

    it("ignores a record with no muscle on it, as cardio usually has", () => {
        const result = heatmap([
            workout({ muscle: "Chest" }),
            workout({ muscle: null, activityType: "Cardio" }),
        ]);

        expect(result.volume.chest).toBe(1);
        expect(result.unmapped).toEqual({});
    });

    it("adds no volume for a muscle name it does not recognise", () => {
        const result = heatmap([
            workout({ muscle: "Chest" }),
            workout({ muscle: "Forearms" }),
        ]);

        expect(result.volume).toEqual({
            chest: 1,
            back: 0,
            shoulders: 0,
            arms: 0,
            core: 0,
            legs: 0,
        });
    });
});

describe("muscles the log names but the heatmap does not know", () => {
    it("reports the unrecognised name rather than dropping it silently", () => {
        const result = heatmap([workout({ muscle: "Forearms" })]);

        expect(result.unmapped).toEqual({ Forearms: 1 });
    });

    it("sums the sets logged against one unrecognised name", () => {
        const result = heatmap([
            ...sets(3, { muscle: "Forearms" }),
            ...sets(2, { muscle: "Glutes" }),
        ]);

        expect(result.unmapped).toEqual({ Forearms: 3, Glutes: 2 });
    });

    it("counts only the unrecognised sets that would have counted", () => {
        const result = heatmap([
            workout({ muscle: "Forearms" }),
            workout({ muscle: "Forearms", completed: false }),
            workout({ muscle: "Forearms", date: "2026-01-01" }),
        ]);

        expect(result.unmapped).toEqual({ Forearms: 1 });
    });

    it("reports nothing when every muscle in the log mapped", () => {
        const result = heatmap(sets(4, { muscle: "Legs" }));

        expect(result.unmapped).toEqual({});
    });
});

describe("intensity levels", () => {
    function levelFor(count: number) {
        return heatmap(sets(count, { muscle: "Chest" })).intensity.chest;
    }

    it("leaves an untrained group at level 0", () => {
        expect(levelFor(0)).toBe(0);
    });

    it("shades a group from its first set", () => {
        expect(levelFor(1)).toBe(1);
        expect(levelFor(4)).toBe(1);
    });

    it("steps up at five sets", () => {
        expect(levelFor(5)).toBe(2);
        expect(levelFor(9)).toBe(2);
    });

    it("steps up at ten sets", () => {
        expect(levelFor(10)).toBe(3);
        expect(levelFor(14)).toBe(3);
    });

    it("tops out at fifteen sets", () => {
        expect(levelFor(15)).toBe(4);
        expect(levelFor(40)).toBe(4);
    });
});

describe("the selected range", () => {
    it("counts only the sets inside the range asked for", () => {
        const workouts = [
            ...sets(2, { muscle: "Chest", date: "2026-09-01" }),
            ...sets(3, { muscle: "Chest", date: "2026-08-20" }),
        ];

        expect(buildMuscleHeatmap(workouts, 7, NOW).volume.chest).toBe(2);
        expect(buildMuscleHeatmap(workouts, 30, NOW).volume.chest).toBe(5);
    });

    it("excludes a set that falls a day the far side of the cutoff", () => {
        const workouts = [
            workout({ muscle: "Chest", date: "2026-08-28" }),
            workout({ muscle: "Chest", date: "2026-08-27" }),
        ];

        expect(buildMuscleHeatmap(workouts, 7, NOW).volume.chest).toBe(1);
    });

    it("reaches back ninety days for the widest range", () => {
        const workouts = sets(3, { muscle: "Legs", date: "2026-07-01" });

        expect(buildMuscleHeatmap(workouts, 30, NOW).volume.legs).toBe(0);
        expect(buildMuscleHeatmap(workouts, 90, NOW).volume.legs).toBe(3);
    });
});

describe("every group the body map draws", () => {
    it("reports an untrained group as zero sets at level 0", () => {
        const result = heatmap(sets(3, { muscle: "Chest" }));

        expect(result.volume).toEqual({
            chest: 3,
            back: 0,
            shoulders: 0,
            arms: 0,
            core: 0,
            legs: 0,
        });
        expect(result.intensity).toEqual({
            chest: 1,
            back: 0,
            shoulders: 0,
            arms: 0,
            core: 0,
            legs: 0,
        });
    });

    it("reports every group for an empty log", () => {
        const result = heatmap([]);

        expect(Object.keys(result.volume).sort()).toEqual([
            "arms",
            "back",
            "chest",
            "core",
            "legs",
            "shoulders",
        ]);
        expect(Object.keys(result.intensity).sort()).toEqual([
            "arms",
            "back",
            "chest",
            "core",
            "legs",
            "shoulders",
        ]);
    });
});
