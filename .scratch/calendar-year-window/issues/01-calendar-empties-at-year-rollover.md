Status: done

# The activity calendar cannot reach any year but the current one

Found while building the analytics dashboard (`.scratch/analytics-dashboard/spec.md`, listed there under Out of Scope as belonging in its own ticket). Grilled via `/grill-with-docs` on 2026-09-07, which **narrowed what this ticket is about** — see "The problem, reframed" below.

## Files (as implemented)

- `types/calendar.ts` — `listCalendarYears`, `parseCalendarYear`, and the 5-year window
- `lib/transform.ts` — `year` is now a required parameter
- `lib/analytics/types.ts`, `lib/cardio/types.ts` — `year?: number` on both options
- `lib/analytics/build-analytics-view.ts`, `lib/cardio/build-cardio-view.ts` — honour it
- `app/page.tsx` — reads `?year=`, renders the selector; now a dynamic route
- `app/components/year-selector.tsx` — new, links, for `/`
- `app/components/calendar-year-picker.tsx` — new, buttons, shared by both dashboards
- `app/components/use-calendar-year.ts` — new, the dashboards' shared year state
- `app/components/analytics/panel.tsx` — gained an `action` slot on the title row
- `lib/transform.test.ts`, `types/calendar.test.ts` — new
- `docs/adr/0001-consistency-calendar-defaults-to-the-current-year.md` — new

## Problem (original, 2026-08-31)

`workoutsToCalendarData` always emitted exactly one calendar year, defaulting to whatever year it was *right now*. On 2027-01-01 both `/` and `/analytics` would render a 2027 grid of zeros, and the previous year was never reachable again — nothing in the UI passed a different `year`, and there was no year selector.

The original text treated the empty January grid as the fault, and proposed a trailing-twelve-month window to remove it.

## The problem, reframed (2026-09-07)

Grilling rejected that framing. **An empty current-year grid in January is a true report of the training done that year, not a defect.** The actual fault was the second half of the original complaint: earlier years were unreachable. So the calendar still shows one calendar year, still defaults to the current one, and still renders empty on January 1st — deliberately. What changed is that every other recent year is now one click away.

The trailing-twelve-month sketch above was considered and rejected. `docs/adr/0001` records why, so this does not get "fixed" back.

`/cardio` was not in the original file list — it landed after this ticket was filed (`5fc0d2d`) and copied the same defaulting verbatim, so it was fixed here too.

## Solution (as implemented)

A fixed five-year window (current year first, `types/calendar.ts`), offered on all three routes. Years with no training in them are offered plainly and render blank, which keeps the selector stable rather than growing a button each January.

`workoutsToCalendarData`'s `year` parameter became **required** — the implicit `new Date().getFullYear()` default was the bug, and deleting it made the type checker point at the one call site (`app/page.tsx`) that had been relying on it. The view builders still default to the current year, but visibly, at a boundary where it is a product decision.

`/` carries the year as a `?year=` query param and renders `YearSelector` (links), keeping its calendar server-built so only 365 days cross the wire; this makes `/` a dynamic route, which was accepted. The dashboards already ship the whole log to the client, so they hold the year in `useState` via `useCalendarYear` and render `CalendarYearPicker` (buttons) inside the Consistency panel — the year governs that panel alone, unlike the period control above it. An unparseable, out-of-window, or repeated `?year=` falls back silently to the current year; `/` is an embed, where a 404 breaks the frame rather than the request.

`lib/transform.ts` had no tests at all before this. It has 14 now, including the year-window boundaries and the leap day.

## Comments

- 2026-09-07: Grilled (17 questions) and implemented. The headline outcome is that the ticket's own problem statement was narrowed by the user: the blank January grid is intended behaviour, and only the unreachability was a bug. Title and problem statement rewritten to match, and `docs/adr/0001` written so the rejected alternatives survive. Two-axis `/code-review` run before commit; it produced the `string[]` query-param fix, the `useCalendarYear` extraction, and a documented note on why the dashboards resolve the year client-side.
