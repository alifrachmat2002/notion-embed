import { describe, expect, it } from "vitest";
import { normalizeDate, orderByDate, round, sum } from "./series";

describe("normalizeDate", () => {
    it("keeps a bare date as it is", () => {
        expect(normalizeDate("2026-08-28")).toBe("2026-08-28");
    });

    it("drops the time component Notion appends", () => {
        expect(normalizeDate("2026-08-28T14:30:00.000+07:00")).toBe(
            "2026-08-28",
        );
    });
});

describe("orderByDate", () => {
    it("sorts oldest first", () => {
        const points = [{ date: "2026-08-28" }, { date: "2026-08-01" }];

        expect(orderByDate(points)).toEqual([
            { date: "2026-08-01" },
            { date: "2026-08-28" },
        ]);
    });

    it("orders across year and month boundaries, not by string length", () => {
        const points = [
            { date: "2026-01-05" },
            { date: "2025-12-31" },
            { date: "2026-01-10" },
        ];

        expect(orderByDate(points).map((point) => point.date)).toEqual([
            "2025-12-31",
            "2026-01-05",
            "2026-01-10",
        ]);
    });

    it("carries the rest of each point through untouched", () => {
        const points = [
            { date: "2026-08-28", km: 7.2 },
            { date: "2026-08-01", km: 4 },
        ];

        expect(orderByDate(points)).toEqual([
            { date: "2026-08-01", km: 4 },
            { date: "2026-08-28", km: 7.2 },
        ]);
    });

    it("returns an empty list unchanged", () => {
        expect(orderByDate([])).toEqual([]);
    });
});

describe("sum", () => {
    it("totals a list", () => {
        expect(sum([1, 2, 3])).toBe(6);
    });

    it("is zero for nothing", () => {
        expect(sum([])).toBe(0);
    });

    it("rounds the total, so float drift never reaches a stat card", () => {
        expect(sum([4, 3.69])).toBe(7.69);
    });
});

describe("round", () => {
    it("keeps two decimals", () => {
        expect(round(7.690000000000001)).toBe(7.69);
    });

    it("leaves a whole number whole", () => {
        expect(round(12)).toBe(12);
    });

    it("rounds a third decimal place away", () => {
        expect(round(3.456)).toBe(3.46);
    });

    it("keeps a negative sign", () => {
        expect(round(-3.456)).toBe(-3.46);
    });
});
