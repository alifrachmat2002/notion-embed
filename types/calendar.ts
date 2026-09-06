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
