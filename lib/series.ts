/**
 * The arithmetic both view builders do on their way to a chart series.
 *
 * Small enough that each was written twice before it was written here; shared
 * because a date normalised one way on `/analytics` and another on `/cardio`
 * would put the two dashboards' calendars out of step over the same log.
 */

/** `2026-08-28T14:30:00+07:00` is a date with a time Notion attached to it. */
export function normalizeDate(date: string): string {
    return date.slice(0, 10);
}

/**
 * Oldest first, which is the only order a progression chart can be read in.
 *
 * Generic over the date, so points carrying weights, paces or kilometres all
 * sort through this rather than each series growing its own comparator.
 */
export function orderByDate<T extends { date: string }>(points: T[]): T[] {
    return points.sort((a, b) => a.date.localeCompare(b.date));
}

/** Rounded on the way out: an unrounded total is a stat card showing drift. */
export function sum(values: number[]): number {
    return round(values.reduce((total, value) => total + value, 0));
}

/**
 * Guard against float drift. Both dashboards log fractional numbers — dumbbell
 * weights of 5.5 and 6.5 kg, run distances of 3.69 and 3.82 km — and summing
 * either lands on figures like 7.690000000000001 that reach a stat card.
 */
export function round(value: number): number {
    return Math.round(value * 100) / 100;
}
