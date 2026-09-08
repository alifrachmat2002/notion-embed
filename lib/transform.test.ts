import { describe, expect, it } from "vitest";
import { workoutsToCalendarData } from "./transform";

function set(date: string, completed = true) {
    return { date, completed };
}

/** `count` sets all logged on the same day, to exercise the shading buckets. */
function setsOn(date: string, count: number) {
    return Array.from({ length: count }, () => set(date));
}

function dayOf(days: ReturnType<typeof workoutsToCalendarData>, date: string) {
    return days.find((day) => day.date === date)!;
}

describe("building a consistency calendar for a year", () => {
    it("emits every day of the requested year, January to December", () => {
        const days = workoutsToCalendarData([], 2026);

        expect(days).toHaveLength(365);
        expect(days[0].date).toBe("2026-01-01");
        expect(days.at(-1)!.date).toBe("2026-12-31");
    });

    it("emits the leap day in a leap year", () => {
        const days = workoutsToCalendarData([], 2024);

        expect(days).toHaveLength(366);
        expect(dayOf(days, "2024-02-29")).toBeDefined();
    });

    it("counts the sets logged on each day", () => {
        const days = workoutsToCalendarData(
            [...setsOn("2026-03-01", 3), set("2026-03-02")],
            2026,
        );

        expect(dayOf(days, "2026-03-01").count).toBe(3);
        expect(dayOf(days, "2026-03-02").count).toBe(1);
        expect(dayOf(days, "2026-03-03").count).toBe(0);
    });

    it("ignores sets that were never completed", () => {
        const days = workoutsToCalendarData(
            [set("2026-03-01", false), set("2026-03-01")],
            2026,
        );

        expect(dayOf(days, "2026-03-01").count).toBe(1);
    });

    it("ignores sets from outside the requested year", () => {
        const days = workoutsToCalendarData(
            [set("2025-06-01"), set("2027-06-01")],
            2026,
        );

        expect(days.every((day) => day.count === 0)).toBe(true);
    });

    it("answers a year with no training with an empty grid, not with another year's", () => {
        // The January-1st case this ticket exists for. Asking for a year you
        // have not trained in yet is answered honestly with zeros; reaching the
        // year you did train in is the selector's job, not this function's.
        const days = workoutsToCalendarData(setsOn("2026-05-05", 4), 2027);

        expect(days).toHaveLength(365);
        expect(days.every((day) => day.count === 0)).toBe(true);
    });
});

describe("shading levels", () => {
    it.each([
        { sets: 0, level: 0 },
        { sets: 1, level: 1 },
        { sets: 2, level: 2 },
        { sets: 3, level: 2 },
        { sets: 4, level: 3 },
        { sets: 6, level: 3 },
        { sets: 7, level: 4 },
        { sets: 20, level: 4 },
    ])("shades a day of $sets sets at level $level", ({ sets, level }) => {
        const days = workoutsToCalendarData(setsOn("2026-03-01", sets), 2026);

        expect(dayOf(days, "2026-03-01").level).toBe(level);
    });
});
