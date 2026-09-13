import {
    PaceSeriesLabel,
    UNSPECIFIED_RUN,
} from "@/lib/cardio/pace-series";

/**
 * Shared chart styling, matched to the activity calendar's dark palette.
 *
 * One palette for both dashboards on purpose, not an accident of `/cardio`
 * having been written second: PACE and STRENGTH_INDEX are picked against each
 * other, and splitting this per feature would let two charts a reader compares
 * side by side drift onto colours chosen in isolation.
 */

export const AXIS = "#8b949e";
export const GRID = "#2a2a2c";
export const SURFACE = "#1c1c1e";
export const BORDER = "rgba(255,255,255,0.08)";

const BRIGHT_GREEN = "#39d353";
const GREEN = "#26a641";
const BLUE = "#58a6ff";
const AMBER = "#d29922";
const PINK = "#f778ba";
const VIOLET = "#a371f7";
const SALMON = "#ff7b72";

// Picked for the pace scatter against the four already above it — see
// RUN_TYPE_COLOURS for why these three and not the nearer neighbours.
const YELLOW = "#e3b341";
const CRIMSON = "#f85149";
const CYAN = "#5ad6e1";

export const MAX_WEIGHT = BRIGHT_GREEN;
export const STRENGTH_INDEX = BLUE;
export const VOLUME = GREEN;

/** Cardio reuses the palette: the measured series blue, the workload green. */
export const PACE = BLUE;
export const WEEKLY_DISTANCE = GREEN;

/**
 * Colours for the rep scatter, one per weight lifted. Ordered light to dark so
 * heavier weights read as heavier marks.
 */
const WEIGHT_COLOURS = [
    BRIGHT_GREEN,
    BLUE,
    AMBER,
    PINK,
    VIOLET,
    SALMON,
];

export function weightColour(index: number): string {
    return WEIGHT_COLOURS[index % WEIGHT_COLOURS.length];
}

/**
 * Colours for the pace scatter, keyed by the series label rather than by
 * position.
 *
 * Keyed, not indexed, so a run type keeps its colour whatever else the period
 * contains — `weightColour` can be positional because a weight's rank among the
 * weights lifted is itself stable, and a run type's rank is not.
 *
 * The split is cool-for-steady, warm-for-hard: `Easy Run` and `Long Run` are
 * both aerobic and sit on blue and cyan; `Tempo Run` and `Interval` are the
 * sessions that hurt, and warm with intensity from yellow to crimson.
 * `Unspecified` takes the axis grey, so a run whose tag says nothing recedes
 * instead of competing.
 *
 * The exact steps are measured, not chosen by eye, against the dark surface:
 *
 * - `Easy Run` keeps PACE, the colour every mark wore when this drew one
 *   series, so the common case looks unchanged.
 * - `Long Run` is cyan because the violet it replaced collapsed to ΔE 5.8
 *   against PACE for deuteranopes — the one comparison this chart exists to
 *   support. Cyan holds ΔE >= 14.7 across normal, protan and deutan vision and
 *   contrasts 9.8:1 with the surface, against violet's 5.1:1.
 * - `Interval` is crimson, not the salmon first tried, which sat ΔE 14.0 from
 *   `Tempo Run` in normal vision — under the 15 floor, and 5.9 for deutan.
 * - Green is unavailable at any step: the weekly-distance bars and the
 *   consistency calendar have it on the same page.
 *
 * Typed by `PaceSeriesLabel`, so adding a run type is a compile error here
 * until it is given a colour.
 */
const RUN_TYPE_COLOURS: Record<PaceSeriesLabel, string> = {
    "Easy Run": PACE,
    "Tempo Run": YELLOW,
    Interval: CRIMSON,
    "Long Run": CYAN,
    [UNSPECIFIED_RUN]: AXIS,
};

export function runTypeColour(label: PaceSeriesLabel): string {
    return RUN_TYPE_COLOURS[label];
}

export const tooltipStyle = {
    contentStyle: {
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        fontSize: 12,
    },
    labelStyle: { color: AXIS },
} as const;

/**
 * `2026-08-28` reads as `Aug 28` on an axis.
 *
 * Recharts types axis and tooltip labels as ReactNode, so this accepts whatever
 * it is handed and passes anything undateable straight through.
 */
export function shortDate(date: unknown): string {
    const raw = String(date ?? "");
    const parsed = new Date(`${raw}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) return raw;

    return parsed.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
    });
}
