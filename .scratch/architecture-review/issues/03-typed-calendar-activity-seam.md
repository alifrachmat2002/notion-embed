Status: ready-for-agent

# Name the calendar-activity shape at the transform seam

From the 2026-08-31 codebase architecture review (candidate #6, "Worth exploring"). Not yet grilled — walk the `/grilling` decision tree before implementing, the way candidates #1, #2, and #4 from the same review were.

## Files

- `lib/transform.ts:46-50` — `workoutsToCalendarData` returns `{ date, count, level }[]`, shape never named
- `app/components/activity-calendar-wrapper.tsx:12` — accepts it as `data: any[]`

## Problem

`workoutsToCalendarData` returns an array shaped to match `react-activity-calendar`'s `Activity` type, but the shape is never named as a type — `ActivityCalendarWrapper` just accepts `any[]`. This is the app's own derived data shape losing its type identity at the client-component boundary: nothing would catch a shape mismatch between what `transform.ts` produces and what the wrapper (and the underlying library) expects.

## Solution sketch

Export `type CalendarActivity = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }` from `lib/transform.ts`; `workoutsToCalendarData` returns `CalendarActivity[]`; `ActivityCalendarWrapper`'s prop becomes `data: CalendarActivity[]`.

## Adjacent, unrelated-but-trivial cleanup on the same call path

Two stray `console.log`s in `app/page.tsx:13,15` (`console.log(contributions[...])`, `console.log(workouts[0])`) fire on every server render. Not an architecture issue — just worth deleting whenever this file is next touched.

## Deletion test

The `any` itself isn't extractable module complexity — it's a missing type, not a pass-through to delete. Worth fixing because the shape-drift risk it represents is real, not because the module is shallow.

## Severity

Worth exploring (type gap) / speculative footnote (the console.logs).
