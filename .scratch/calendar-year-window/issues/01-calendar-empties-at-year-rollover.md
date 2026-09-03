Status: ready-for-agent

# The activity calendar empties itself at year rollover

Found while building the analytics dashboard (`.scratch/analytics-dashboard/spec.md`, listed there under Out of Scope as belonging in its own ticket). This is a pre-existing bug on `/`, not something the analytics work introduced — but analytics inherited it, so it now affects two routes.

Not yet grilled — walk the `/grilling` decision tree before implementing, the way the architecture-review candidates were.

## Files

- `lib/transform.ts:21` — `year = new Date().getFullYear()` as the default parameter
- `lib/transform.ts:33-34` — `startDate = new Date(year, 0, 1)`, `endDate = new Date(year, 11, 31)`
- `app/page.tsx:11` — calls `workoutsToCalendarData(workouts)`, taking that default
- `lib/analytics/build-analytics-view.ts:33,64-68` — passes `now.getFullYear()`, inheriting the same window
- `app/components/analytics/analytics-dashboard.tsx:120` — copy reads "Days you performed this exercise in {year}", which would need rewording if the window stops being a calendar year

## Problem

`workoutsToCalendarData` always emits exactly one calendar year, January 1st to December 31st of `year`, defaulting to whatever year it is *right now*.

On **2027-01-01**, both `/` and `/analytics` will render a 2027 grid in which every square is zero. The entire training history disappears from view overnight. It refills only as 2027 accumulates, and the previous year is never reachable again — nothing in the UI passes a different `year`, and there is no year selector.

There is a milder version of the same fault every January: the grid always spans the full year, so in early January roughly eleven months of the grid are empty future squares, and the visible history is whatever few days have happened so far.

The data is fine throughout — `getWorkouts` returns every record. This is purely the window the transform chooses.

## Solution sketch

The likely fix is a **trailing twelve months** ending today, rather than a fixed calendar year: always a full-width grid, never a cliff on January 1st, and it matches what GitHub's own contribution graph does. The loop already walks day by day between two dates, so this is a change to how `startDate`/`endDate` are derived, not to the shape of the output.

Decisions worth settling first:

- Trailing twelve months, a year selector, or both? A selector is the only option that makes older years reachable, but it adds UI to two routes.
- If the window stops being a calendar year, `AnalyticsView.calendarYear` and the panel copy that consumes it both need to become something like a formatted range.
- Whether `/` and `/analytics` must agree. They currently do, by accident rather than intent.

## Relationship to other tickets

Touches the same function as `.scratch/architecture-review/issues/03-typed-calendar-activity-seam.md`, which names the return shape as `CalendarActivity`. Doing 03 first would give this ticket a typed seam to change against; doing them together is also reasonable, since both edit `lib/transform.ts`. Note that `lib/analytics/types.ts` already declares its own `CalendarActivity`, which 03 should probably absorb rather than duplicate.

## Severity

Real bug with a known trigger date. Silent — nothing errors, the grid simply reads as though no training ever happened.
