import { PacePoint } from "./types";

/**
 * The run types the log can tag, in the order a reader compares them: easy,
 * then the two hard sessions, then the long one. Deliberately not alphabetical
 * and not ordered by what the period contains — see `toPaceSeries`.
 *
 * These are the four cardio values of Notion's `Workout Type` select. The other
 * three ("Upper Body", "Lower Body", "Full Body") tag strength work; a run
 * carrying one is a mis-entry, which `runTypeLabel` handles.
 */
export const RUN_TYPES = [
    "Easy Run",
    "Tempo Run",
    "Interval",
    "Long Run",
] as const;

export type RunType = (typeof RUN_TYPES)[number];

/** Where untagged runs, and runs tagged with something else, end up. */
export const UNSPECIFIED_RUN = "Unspecified" as const;

/**
 * Every name the chart can draw a series under. The palette in `chart-theme`
 * is keyed by this, so adding a run type above is a type error there until it
 * is given a colour, rather than a silent fall through to the default grey.
 */
export type PaceSeriesLabel = RunType | typeof UNSPECIFIED_RUN;

/** One drawable series: every run sharing a type, under the name to label it. */
export type PaceSeries = {
    label: PaceSeriesLabel;
    points: PacePoint[];
};

/**
 * Which series a run belongs to.
 *
 * Anything outside the run vocabulary is treated as untagged rather than given
 * a series of its own: two runs carry `Upper Body` from a mis-entry, and a
 * strength label in a running chart's legend says nothing true about them.
 */
export function runTypeLabel(workoutType: string | null): PaceSeriesLabel {
    return (
        RUN_TYPES.find((type) => type === workoutType) ?? UNSPECIFIED_RUN
    );
}

/**
 * Splits pace points into one series per workout type.
 *
 * Order comes from `RUN_TYPES`, never from the data. Deriving it from what the
 * period contains would re-index the palette whenever the period changed, so
 * `Easy Run` could be blue across 30 days and green across 90 — which would
 * make the legend disagree with every earlier reading of the same chart.
 *
 * A type nobody ran is left out rather than drawn empty, so the legend lists
 * what happened rather than what was possible.
 */
export function toPaceSeries(points: PacePoint[]): PaceSeries[] {
    const byLabel = new Map<PaceSeriesLabel, PacePoint[]>();

    for (const point of points) {
        const label = runTypeLabel(point.workoutType);
        const existing = byLabel.get(label);

        if (existing) existing.push(point);
        else byLabel.set(label, [point]);
    }

    // Unspecified trails the real types: it is the absence of an answer, not
    // another kind of run, and leading with it would bury the ones that mean
    // something.
    const order: PaceSeriesLabel[] = [...RUN_TYPES, UNSPECIFIED_RUN];

    return order.flatMap((label) => {
        const points = byLabel.get(label);

        return points ? [{ label, points }] : [];
    });
}
