import { describe, expect, it } from "vitest";
import { formatPace } from "./format-pace";

describe("pace as minutes and seconds", () => {
    it("reads a decimal pace the way the log titles write it", () => {
        // "Easy 4km Run @ 7:43/km": 30.88 min over 4 km.
        expect(formatPace(30.88 / 4)).toBe("7:43");
    });

    /**
     * The log's own titles truncate: 55.95 min over 7 km is 7:59.57, written
     * "@ 7:59/km" but rounding to 8:00. Rounding is the honest arithmetic, so
     * a handful of runs read one second slower here than in their title.
     */
    it("rounds to the nearest second rather than truncating", () => {
        expect(formatPace(55.95 / 7)).toBe("8:00");
    });

    it("pads seconds to two digits", () => {
        expect(formatPace(8.05)).toBe("8:03");
    });

    it("carries into the next minute rather than reporting sixty seconds", () => {
        // 7.999 rounds to 480 s. Reported naively this reads "7:60".
        expect(formatPace(7.999)).toBe("8:00");
    });

    it("has nothing to say about a pace that could not be computed", () => {
        expect(formatPace(null)).toBe("—");
    });
});
