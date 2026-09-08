import { describe, expect, it } from "vitest";
import { listCalendarYears, parseCalendarYear } from "./calendar";

const NOW = new Date("2026-09-04T00:00:00Z");

describe("the years a consistency calendar offers", () => {
    it("offers five years, most recent first", () => {
        expect(listCalendarYears(NOW)).toEqual([2026, 2025, 2024, 2023, 2022]);
    });

    it("keeps the window fixed rather than trimming it to the years with training", () => {
        // The log begins in 2025, so 2024 and earlier are empty. They are still
        // offered: a stable selector beats one that grows a button each January.
        expect(listCalendarYears(NOW)).toHaveLength(5);
    });

    it("moves with the clock", () => {
        expect(listCalendarYears(new Date("2027-06-15T00:00:00Z"))).toEqual([
            2027, 2026, 2025, 2024, 2023,
        ]);
    });
});

describe("resolving a requested calendar year", () => {
    it("defaults to the current year when none is asked for", () => {
        expect(parseCalendarYear(undefined, NOW)).toBe(2026);
    });

    it("honours a year inside the window", () => {
        expect(parseCalendarYear("2025", NOW)).toBe(2025);
    });

    it("honours the oldest year in the window", () => {
        expect(parseCalendarYear("2022", NOW)).toBe(2022);
    });

    it("falls back to the current year outside the window", () => {
        expect(parseCalendarYear("2021", NOW)).toBe(2026);
        expect(parseCalendarYear("2027", NOW)).toBe(2026);
    });

    it("falls back to the current year on input that is not a year", () => {
        expect(parseCalendarYear("banana", NOW)).toBe(2026);
        expect(parseCalendarYear("", NOW)).toBe(2026);
        expect(parseCalendarYear("2025abc", NOW)).toBe(2026);
    });

    it("takes the year from a query key that was sent once, as an array", () => {
        expect(parseCalendarYear(["2025"], NOW)).toBe(2025);
    });

    it("falls back when a repeated query key asks for two years at once", () => {
        expect(parseCalendarYear(["2025", "2024"], NOW)).toBe(2026);
    });

    it("rejects a fractional year rather than truncating it", () => {
        // 2025.5 must not be read as 2025: a request the app cannot honour
        // should land on the default, not on a neighbouring year.
        expect(parseCalendarYear("2025.5", NOW)).toBe(2026);
    });
});
