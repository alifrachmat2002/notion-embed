import { describe, expect, it } from "vitest";
import { parseDateRange } from "./date-range";

describe("resolving a requested muscle-heatmap range", () => {
    it("defaults to seven days when none is asked for", () => {
        expect(parseDateRange(undefined)).toBe(7);
    });

    it("honours a period the heatmap actually offers", () => {
        expect(parseDateRange("30")).toBe(30);
        expect(parseDateRange("90")).toBe(90);
    });

    it("falls back on a number the heatmap does not offer", () => {
        // The bug this parser exists for: `?range=42` used to filter to a
        // 42-day window with no button highlighted in RangeSelector.
        expect(parseDateRange("42")).toBe(7);
        expect(parseDateRange("0")).toBe(7);
        expect(parseDateRange("-30")).toBe(7);
    });

    it("falls back on input that is not a number", () => {
        expect(parseDateRange("banana")).toBe(7);
        expect(parseDateRange("")).toBe(7);
        expect(parseDateRange("30abc")).toBe(7);
    });

    it("takes the range from a query key that was sent once, as an array", () => {
        expect(parseDateRange(["30"])).toBe(30);
    });

    it("falls back when a repeated query key asks for two ranges at once", () => {
        expect(parseDateRange(["30", "90"])).toBe(7);
    });

    it("rejects a fractional range rather than truncating it", () => {
        expect(parseDateRange("30.5")).toBe(7);
    });
});
