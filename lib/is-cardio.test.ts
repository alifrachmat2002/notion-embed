import { describe, expect, it } from "vitest";
import { WorkoutEntry } from "@/types/workout";
import { isCardioRecord } from "./is-cardio";

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
        distanceKm: null,
        durationMin: null,
        ...overrides,
    };
}

function run(overrides: Partial<WorkoutEntry> = {}): WorkoutEntry {
    return workout({
        activityType: "Cardio",
        muscle: "Legs",
        name: "Easy 7km Run @ 7:59/km",
        exercise: "Running",
        weight: null,
        reps: null,
        distanceKm: 7,
        durationMin: 55.95,
        ...overrides,
    });
}

describe("telling a run from a lift", () => {
    it("recognises a record tagged as cardio", () => {
        const log = [workout(), run()];

        expect(log.filter(isCardioRecord(log))).toEqual([run()]);
    });

    it("recognises a run mistagged as strength, by the company it keeps", () => {
        // Two August runs carry Activity Type = Strength. The exercise is
        // logged as cardio elsewhere, which is what gives them away.
        const mistagged = run({ activityType: "Strength", distanceKm: null });
        const log = [workout(), run(), mistagged];

        expect(log.filter(isCardioRecord(log))).toEqual([run(), mistagged]);
    });

    it("leaves strength alone when the log holds no cardio at all", () => {
        const log = [workout(), workout({ exercise: "Bench Press" })];

        expect(log.filter(isCardioRecord(log))).toEqual([]);
    });

    it("does not sweep up records with no exercise assigned", () => {
        const log = [run(), workout({ exercise: null })];

        expect(log.filter(isCardioRecord(log))).toEqual([run()]);
    });
});
