import { describe, expect, it } from "vitest";
import { PacePoint } from "./types";
import {
    RUN_TYPES,
    UNSPECIFIED_RUN,
    runTypeLabel,
    toPaceSeries,
} from "./pace-series";

function point(overrides: Partial<PacePoint> = {}): PacePoint {
    return {
        date: "2026-08-01",
        paceMinPerKm: 7.72,
        distanceKm: 4,
        durationMin: 30.88,
        workoutType: "Easy Run",
        ...overrides,
    };
}

function labels(points: PacePoint[]): string[] {
    return toPaceSeries(points).map((series) => series.label);
}

describe("grouping runs by type", () => {
    it("gives each tagged type its own series", () => {
        expect(
            labels([
                point({ workoutType: "Easy Run" }),
                point({ workoutType: "Long Run" }),
            ]),
        ).toEqual(["Easy Run", "Long Run"]);
    });

    it("keeps every run of a type together in one series", () => {
        const series = toPaceSeries([
            point({ date: "2026-08-01", workoutType: "Easy Run" }),
            point({ date: "2026-08-03", workoutType: "Long Run" }),
            point({ date: "2026-08-05", workoutType: "Easy Run" }),
        ]);

        expect(series[0].points.map((p) => p.date)).toEqual([
            "2026-08-01",
            "2026-08-05",
        ]);
    });

    it("leaves out a type nobody ran, rather than drawing it empty", () => {
        expect(labels([point({ workoutType: "Interval" })])).toEqual([
            "Interval",
        ]);
    });
});

describe("series order", () => {
    /**
     * The legend reads easy → tempo → interval → long, by effort rather than
     * alphabetically, because that is the order a reader compares them in.
     * Order never depends on what the period happens to contain.
     */
    it("follows the canonical effort order, not the order encountered", () => {
        expect(
            labels([
                point({ workoutType: "Long Run" }),
                point({ workoutType: "Interval" }),
                point({ workoutType: "Easy Run" }),
                point({ workoutType: "Tempo Run" }),
            ]),
        ).toEqual([...RUN_TYPES]);
    });

    it("puts unspecified runs last, after every real type", () => {
        expect(
            labels([
                point({ workoutType: null }),
                point({ workoutType: "Easy Run" }),
            ]),
        ).toEqual(["Easy Run", UNSPECIFIED_RUN]);
    });
});

describe("runs the tag cannot explain", () => {
    /**
     * Two runs were once tagged `Upper Body` by mis-entry. A strength label on
     * a running chart's legend says nothing true, so anything outside the run
     * vocabulary joins the untagged runs rather than inventing a series.
     */
    it("folds a non-run workout type into the unspecified series", () => {
        expect(labels([point({ workoutType: "Upper Body" })])).toEqual([
            UNSPECIFIED_RUN,
        ]);
    });

    it("folds untagged runs into the same series, not a separate one", () => {
        const series = toPaceSeries([
            point({ workoutType: "Upper Body" }),
            point({ workoutType: null }),
        ]);

        expect(series).toHaveLength(1);
        expect(series[0].points).toHaveLength(2);
    });

});

describe("naming a single run", () => {
    /**
     * The tooltip labels one mark at a time, because the legend is suppressed
     * when the period holds a single type — without this the tag would be
     * readable nowhere on the chart.
     */
    it("names a tagged run by its type", () => {
        expect(runTypeLabel("Tempo Run")).toBe("Tempo Run");
    });

    it("names an untagged run, and a mistagged one, the same way", () => {
        expect(runTypeLabel(null)).toBe(UNSPECIFIED_RUN);
        expect(runTypeLabel("Upper Body")).toBe(UNSPECIFIED_RUN);
    });
});

describe("nothing to draw", () => {
    it("yields no series for no points", () => {
        expect(toPaceSeries([])).toEqual([]);
    });
});
