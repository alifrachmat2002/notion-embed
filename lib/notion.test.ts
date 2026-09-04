import { describe, expect, it } from "vitest";
import { parseWorkoutPage } from "./notion";

/**
 * Shaped like a real Notion page from the fitness log. Most parse failures here
 * are loud, but an empty `Name` is not: it silently switches off hold detection
 * in lib/analytics, putting a 40-second hold back at the top of the PR list.
 */
function page(overrides: Record<string, unknown> = {}) {
    return {
        id: "page-1",
        properties: {
            Date: { date: { start: "2026-06-22" } },
            Completed: { checkbox: true },
            "Activity Type": { select: { name: "Strength" } },
            Muscle: { select: { name: "Biceps" } },
            Name: {
                title: [{ plain_text: "Hammer Curl - Set 1 (40s hold)" }],
            },
            Exercise: { select: { name: "Hammer Curl" } },
            Weight: { number: 6.5 },
            Reps: { number: 40 },
            "Distance (km)": { number: null },
            "Duration(min)": { number: null },
            ...overrides,
        },
    };
}

describe("parseWorkoutPage", () => {
    it("reads the fields the analytics view depends on", () => {
        expect(parseWorkoutPage(page())).toEqual({
            date: "2026-06-22",
            completed: true,
            activityType: "Strength",
            muscle: "Biceps",
            name: "Hammer Curl - Set 1 (40s hold)",
            exercise: "Hammer Curl",
            weight: 6.5,
            reps: 40,
            distanceKm: null,
            durationMin: null,
        });
    });

    it("reads the distance and duration a run records", () => {
        const parsed = parseWorkoutPage(
            page({
                "Activity Type": { select: { name: "Cardio" } },
                Name: { title: [{ plain_text: "Easy 7km Run @ 7:59/km" }] },
                Exercise: { select: { name: "Running" } },
                Weight: { number: null },
                Reps: { number: null },
                "Distance (km)": { number: 7 },
                "Duration(min)": { number: 55.95 },
            }),
        );

        expect(parsed).toMatchObject({ distanceKm: 7, durationMin: 55.95 });
    });

    /**
     * Six August runs record duration but no distance. Parsed as 0 they would
     * read as a zero-kilometre run and divide into an infinite pace, so the
     * gap has to stay distinguishable from a logged value.
     */
    it("keeps a run's unset distance distinguishable as null", () => {
        const parsed = parseWorkoutPage(
            page({
                "Activity Type": { select: { name: "Cardio" } },
                Exercise: { select: { name: "Running" } },
                "Distance (km)": { number: null },
                "Duration(min)": { number: 30 },
            }),
        );

        expect(parsed).toMatchObject({ distanceKm: null, durationMin: 30 });
    });

    it("joins a title split across rich-text fragments", () => {
        const parsed = parseWorkoutPage(
            page({
                Name: {
                    title: [
                        { plain_text: "Bicep Curl Hold" },
                        { plain_text: " - Set 1" },
                    ],
                },
            }),
        );

        expect(parsed?.name).toBe("Bicep Curl Hold - Set 1");
    });

    it("yields an empty title rather than throwing when none is set", () => {
        expect(parseWorkoutPage(page({ Name: { title: [] } }))?.name).toBe("");
    });

    it("keeps an unset exercise, weight or reps distinguishable as null", () => {
        const parsed = parseWorkoutPage(
            page({
                Exercise: { select: null },
                Weight: { number: null },
                Reps: { number: null },
            }),
        );

        expect(parsed).toMatchObject({
            exercise: null,
            weight: null,
            reps: null,
        });
    });

    it("distinguishes a logged zero from an unrecorded value", () => {
        const parsed = parseWorkoutPage(
            page({ Weight: { number: 0 }, Reps: { number: 0 } }),
        );

        expect(parsed).toMatchObject({ weight: 0, reps: 0 });
    });

    it("skips a record with no date", () => {
        expect(parseWorkoutPage(page({ Date: { date: null } }))).toBeNull();
    });
});
