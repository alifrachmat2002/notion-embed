Status: done

# Name the calendar-activity shape at the transform seam

From the 2026-08-31 codebase architecture review (candidate #6, "Worth exploring"). Grilled via `/grill-with-docs` on 2026-09-06.

## Files (as implemented)

- `types/calendar.ts` — new home for `CalendarActivity`
- `lib/transform.ts` — `workoutsToCalendarData` and `getLevel` now typed against it
- `lib/analytics/types.ts` — imports `CalendarActivity` instead of defining it
- `lib/cardio/types.ts` — imports from `@/types/calendar` instead of `@/lib/analytics/types`
- `app/components/activity-calendar-wrapper.tsx:12` — `data: any[]` replaced
- `app/page.tsx` — two stray `console.log`s deleted, `contributions` renamed to `calendar`

## Problem (original, 2026-08-31)

`workoutsToCalendarData` returns an array shaped to match `react-activity-calendar`'s `Activity` type, but the shape was never named as a type — `ActivityCalendarWrapper` just accepted `any[]`.

## What had already changed by the time this was picked up

By 2026-09-06, `d9edbe4` (exercise-centric analytics) and `5fc0d2d` (`/cardio`) had already landed most of the original sketch: `CalendarActivity` existed, exported from `lib/analytics/types.ts`, and `lib/cardio/types.ts` already imported it from there — with a comment pointing at this very ticket as the reason it was parked in the wrong place. The remaining gaps, resolved here:

- The type lived in a feature module (`lib/analytics`) that a sibling feature (`lib/cardio`) depended on, rather than in a neutral shared location.
- `level` was typed `number`, not narrowed, unlike the sibling `MuscleIntensity` convention in `types/muscle.ts`.
- `ActivityCalendarWrapper`'s `data: any[]` was still unchecked — the actual hole, and the only path (`/`) with zero type coverage end to end.

## Solution (as implemented)

`CalendarActivity` moved to `types/calendar.ts` — this repo's established home for cross-feature shapes (alongside `date-range.ts`, `muscle.ts`, `workout.ts`) — with `level: 0 | 1 | 2 | 3 | 4` and a doc comment explaining why it isn't just `react-activity-calendar`'s structurally identical `Activity` type (our derived data shouldn't take a type dependency on a rendering library). `lib/analytics/types.ts` and `lib/cardio/types.ts` both import from there now, closing the analytics→cardio dependency. `getLevel`'s return type is `CalendarActivity["level"]` rather than restating the union, so the two can't drift.

`app/page.tsx`'s two debug `console.log`s were deleted and its `contributions` variable renamed to `calendar`, matching `AnalyticsView.calendar` / `CardioView.calendar` — both sanctioned by this ticket's original "Adjacent cleanup" note.

No new tests: this is a type-only change with zero runtime behaviour change (confirmed no existing test asserts on `.level`, only `.date`/`.count`). `lib/transform.ts`'s test coverage is left to `.scratch/calendar-year-window/issues/01-calendar-empties-at-year-rollover.md`, which will actually change `workoutsToCalendarData`'s behaviour. A `typecheck` npm script (`tsc --noEmit`) was added since this ticket's whole deliverable is type-level.

## Comments

- 2026-09-06: Grilled and implemented. Most of the original sketch (candidate #6) had already shipped incidentally via `d9edbe4`/`5fc0d2d` before this ticket was picked up — what actually shipped here was relocating `CalendarActivity` out of `lib/analytics` into `types/`, narrowing `level`, and closing the `any[]` hole in the wrapper. Implemented in `e7145a3`.
