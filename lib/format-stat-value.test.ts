import { describe, expect, it } from "vitest";
import { formatStatValue } from "./format-stat-value";

describe("formatStatValue", () => {
    it("abbreviates from ten thousand up", () => {
        expect(formatStatValue(10_000)).toBe("10.0k");
        expect(formatStatValue(48_320)).toBe("48.3k");
    });

    it("leaves anything below ten thousand unabbreviated", () => {
        expect(formatStatValue(9_999)).toBe("9999");
    });

    it("keeps one decimal place on a fractional value", () => {
        expect(formatStatValue(7.25)).toBe("7.3");
    });

    it("drops a trailing zero decimal", () => {
        expect(formatStatValue(42)).toBe("42");
    });

    it("formats zero as zero", () => {
        expect(formatStatValue(0)).toBe("0");
    });
});
