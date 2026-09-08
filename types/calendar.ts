/**
 * One day's activity on a consistency calendar (`/`, `/analytics`, `/cardio`).
 *
 * Structurally identical to `react-activity-calendar`'s own `Activity` type,
 * but kept as our own rather than imported: this is data our transforms
 * produce, and the app's derived shapes shouldn't take a type dependency on
 * a rendering library. That the library happens to accept this shape is a
 * compatibility fact that belongs at the wrapper passing it in, not here.
 */
export type CalendarActivity = {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
};

/**
 * How many years the calendar offers, counting back from the current one.
 *
 * Fixed rather than derived from the log: a window that grows a button every
 * January is a selector that never looks the same twice, and offering a year
 * with no training in it is a truthful answer to being asked for that year.
 */
const CALENDAR_YEAR_COUNT = 5;

/** The selectable years, most recent first. */
export function listCalendarYears(now: Date): number[] {
    const current = now.getFullYear();

    return Array.from(
        { length: CALENDAR_YEAR_COUNT },
        (_, offset) => current - offset,
    );
}

/**
 * The year a request is actually asking for, or the current one.
 *
 * Membership of the offered window is the whole check, which is why this is not
 * a range comparison: it rejects `2025.5` and `banana` by the same rule that
 * rejects `2021`, and nothing downstream has to re-assert that the year is one
 * the app can render. Anything unrecognised falls back rather than erroring —
 * `/` is an embed, and a 404 there breaks the frame rather than the request.
 *
 * Takes `string[]` because a query string can repeat a key: `?year=1&year=2`
 * arrives as an array, and an ambiguous request is one the app cannot honour.
 */
export function parseCalendarYear(
    raw: string | string[] | undefined,
    now: Date,
): number {
    const years = listCalendarYears(now);
    const requested = Number(raw);

    return years.includes(requested) ? requested : years[0];
}
