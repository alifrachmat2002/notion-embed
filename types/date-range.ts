/**
 * A selectable period: a number of days back from today, or the whole log.
 *
 * Each view owns its own list of presets (the muscle heatmap offers 7/30/90,
 * analytics offers 28/90/180/365/all), so this admits any day count rather than
 * fixing one vocabulary for every caller.
 */
export type DateRangeValue = number | "all";

/**
 * The periods `/muscles` offers, default first.
 *
 * Narrower than `DateRangeValue` on purpose: that is what `lib/` filters by and
 * admits any day count, this is the fixed set a request may actually ask for.
 */
export const MUSCLE_RANGES = [7, 30, 90] as const;

export type MuscleRange = (typeof MUSCLE_RANGES)[number];

function isMuscleRange(value: number): value is MuscleRange {
    return MUSCLE_RANGES.some((range) => range === value);
}

/**
 * The period a request is actually asking for, or the default seven days.
 *
 * Membership of the offered presets is the whole check, which is why this is
 * not a bounds comparison: it rejects `42` by the same rule that rejects
 * `banana` and `30.5`, and nothing downstream has to re-assert that the range
 * is one the heatmap can highlight. Anything unrecognised falls back rather
 * than erroring — `/muscles` is an embed, and a 404 there breaks the frame
 * rather than the request.
 *
 * Takes `string[]` because a query string can repeat a key: `?range=7&range=30`
 * arrives as an array, and an ambiguous request is one the app cannot honour.
 */
export function parseDateRange(raw: string | string[] | undefined): MuscleRange {
    const requested = Number(raw);

    return isMuscleRange(requested) ? requested : MUSCLE_RANGES[0];
}
