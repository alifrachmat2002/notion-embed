import {
    PaceSeriesLabel,
    UNSPECIFIED_RUN,
} from "@/lib/cardio/pace-series";

/**
 * Shared chart styling, matched to the activity calendar's palette.
 *
 * Every colour is a `var(--chart-…)` reference: the dark and light values live
 * in globals.css, swapped by `prefers-color-scheme`, so the server-rendered
 * SVG is the right theme on first paint (docs/adr/0003). Recharts writes these
 * strings into fill and stroke attributes, where the browser resolves them.
 *
 * One palette for both dashboards on purpose, not an accident of `/cardio`
 * having been written second: PACE and STRENGTH_INDEX are picked against each
 * other, and splitting this per feature would let two charts a reader compares
 * side by side drift onto colours chosen in isolation.
 */

export const AXIS = "var(--chart-axis)";
export const GRID = "var(--chart-grid)";
export const SURFACE = "var(--control)";
export const BORDER = "var(--chart-border)";

const BRIGHT_GREEN = "var(--chart-bright-green)";
const GREEN = "var(--chart-green)";
const BLUE = "var(--chart-blue)";
const AMBER = "var(--chart-amber)";
const PINK = "var(--chart-pink)";
const VIOLET = "var(--chart-violet)";
const SALMON = "var(--chart-salmon)";

// Picked for the pace scatter against the four already above it — see
// RUN_TYPE_COLOURS for why these three and not the nearer neighbours.
const YELLOW = "var(--chart-yellow)";
const CRIMSON = "var(--chart-crimson)";
const CYAN = "var(--chart-cyan)";

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
 * The exact steps are measured, not chosen by eye, against the dark surface
 * (#1c1c1e) and, in light mode, the light panel (#f7f7f5):
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
 * Light mode keeps each hue family at a darker step. Every pair is ΔE >= 17.3
 * apart across normal, protan and deutan vision (dark: >= 20.3), and every
 * series has at least 3:1 against the panel:
 *
 * - `Easy Run` #0969da 4.8:1, `Long Run` #0e7490 5.0:1, `Tempo Run` #b08400
 *   3.2:1, `Interval` #a40e26 7.3:1, `Unspecified` (axis) #848d97 3.1:1.
 * - `Tempo Run` and `Interval` collapse to ΔE 9.3 for deutan at the obvious
 *   #9a6700 / #cf222e, because yellow and red differ mostly in lightness
 *   there; a lighter yellow and a darker crimson open the gap.
 * - The axis grey is lighter than the obvious #6e7781, which sat ΔE 13.4 from
 *   `Long Run` under protan.
 * - The weight colours are #2da44e, #0969da, #9a6700, #bf3989, #8250df and
 *   #c4432b (3.0:1 to 4.7:1), the first the lightest; weekly distance and
 *   volume take #1a7f37 (4.7:1).
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
