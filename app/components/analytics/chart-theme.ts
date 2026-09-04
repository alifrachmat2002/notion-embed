/** Shared chart styling, matched to the activity calendar's dark palette. */

export const AXIS = "#8b949e";
export const GRID = "#2a2a2c";
export const SURFACE = "#1c1c1e";
export const BORDER = "rgba(255,255,255,0.08)";

const BRIGHT_GREEN = "#39d353";
const GREEN = "#26a641";
const BLUE = "#58a6ff";

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
    "#39d353",
    "#58a6ff",
    "#d29922",
    "#f778ba",
    "#a371f7",
    "#ff7b72",
];

export function weightColour(index: number): string {
    return WEIGHT_COLOURS[index % WEIGHT_COLOURS.length];
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
