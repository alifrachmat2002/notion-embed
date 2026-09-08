Status: done

# Validate the date-range query param instead of casting it

From the 2026-08-31 codebase architecture review (candidate #5, "Worth exploring"). Picked up 2026-09-08. Not formally grilled — see "Why no grilling" below.

## Files (as implemented)

- `types/date-range.ts` — `MUSCLE_RANGES`, `MuscleRange` derived from it, and `parseDateRange`
- `types/date-range.test.ts` — new, 7 tests
- `CONTEXT.md` — new **Muscle range** glossary entry
- `.scratch/architecture-review/issues/04-…md` — its now-moot criterion about this ticket struck through
- `app/muscles/page.tsx` — calls `parseDateRange`; both `as 7 | 30 | 90` casts gone
- `app/components/range-selector.tsx` — imports `MUSCLE_RANGES` and `MuscleRange` instead of restating both

## Problem (original, 2026-08-31)

`DateRange` was declared but never imported anywhere — other files independently restated `7 | 30 | 90`. Worse, the query-param parsing didn't validate: `app/muscles/page.tsx:17` did `const range = Number(params.range) || 7` (any numeric string passed through), then lines 20 and 25 did `range as 7 | 30 | 90` — a bare assertion with no runtime check. A request like `/muscles?range=42` silently filtered to a 42-day range with no button highlighted in `RangeSelector`. Wrong behavior, no crash, and the type system offered false confidence throughout.

## What had already changed by the time this was picked up

The original file list was stale in two ways, both found by reading the code rather than the ticket:

- **`lib/muscles/filter-by-date-range.ts` no longer restated the union.** The analytics and cardio work had already retyped it against `DateRangeValue` (`number | "all"`), a genuinely different type. So the "third path" in the original list did not exist.
- **The "Depends on ticket 04" note therefore evaporated.** It existed because 04 moves `filter-by-date-range.ts` out of `lib/muscles/`; since this ticket no longer touches that file, the two are independent and this one went first. Ticket 04's acceptance criterion "Ticket 02's file list is amended for the `filterByDateRange` move" is now moot.

The analytics spec's closing note claimed "the date-range parser described above closes this ticket". It did not: no parser ever shipped. Both dashboards hold their period in `useState<AnalyticsRange>(90)` and never read a query param, so `/muscles` was the only route parsing one, and it was the unvalidated one.

## Solution (as implemented)

One array is the source of truth: `MUSCLE_RANGES = [7, 30, 90] as const`, with `MuscleRange` derived as `(typeof MUSCLE_RANGES)[number]` so the presets and the type cannot drift. `parseDateRange` checks membership of that array through a `value is MuscleRange` type guard, which is what lets `app/muscles/page.tsx` drop both assertions without gaining any new ones.

Membership is the whole check, mirroring `parseCalendarYear`: `42` is rejected by the same rule as `banana` and `30.5`, and the fallback is silent because `/muscles` is an embed where a 404 breaks the frame rather than the request. `raw` is `string | string[] | undefined` because a query key can repeat — the original sketch's `string | undefined` was wrong for Next's `searchParams`.

### Where it lives, and why not in the UI

Ticket 04's rule — anything used by more than one feature leaves that feature's folder; preset lists are UI vocabulary — was applied and landed on `types/`, not on the component:

- 04's actual acceptance criterion is that nothing in **`lib/`** imports a preset list. `types/` is not `lib/`; it is the neutral shared home ticket 03's grilling established for cross-feature shapes. Nothing in `lib/` imports `MUSCLE_RANGES`, `MuscleRange` or the parser, so the criterion holds. `DateRangeValue` stays here too, and `lib/muscles/filter-by-date-range.ts` still reads that one.
- 04 pushed `ANALYTICS_RANGES` into `RangePicker` because it was stranded in `lib/analytics/types.ts`, where `lib/` should not hold UI vocabulary. That reason does not reach `types/`, and following 04's letter here would have split the preset array from the union type it defines — reintroducing the drift this ticket exists to remove.
- Putting a *value* export in `app/components/range-selector.tsx` would have been a latent trap. That file is not `"use client"` today, but thirteen other components are; adding the directive later would turn its exports into client-reference proxies and break `app/muscles/page.tsx`, an async server component, at runtime. `types/calendar.ts` already demonstrates the working shape — `app/page.tsx` (server) and `use-calendar-year.ts` (`"use client"`) both import from it precisely because it is neutral.

`docs/adr/0002` is untouched and still holds: `RangeSelector` remains its own control, and the dashboards' preset list is not merged with this one. No ADR was written — this ticket picks a file, it does not settle a contested direction.

## Tests

`types/date-range.test.ts`, 7 tests, following `types/calendar.test.ts`: the default, the offered presets, an unoffered number (`42`, `0`, `-30`), non-numeric input, the single-element array, the repeated key, and the fractional case. Two of them drove implementation red-to-green; the rest passed on the membership check as written and are kept as characterisation.

`npm run typecheck`, `npm test` (116 passing) and `npm run build` all pass. `npm run lint` reports only the pre-existing `no-explicit-any` in the Notion client.

### Review findings applied

Two-axis `/code-review` before commit. Standards raised two, both actioned: the union was renamed `DateRange` → `MuscleRange`, because `DateRange` and `DateRangeValue` sitting side by side gave the *narrower*, `/muscles`-only set the more general-sounding name; and `CONTEXT.md` gained a **Muscle range** entry, following `a6de0fe`, which added **Selected year** in the same breath as `parseCalendarYear`. Standards also declined to extract a shared `parseOffered` from `parseDateRange`/`parseCalendarYear` at two instances — the trigger is a third parser, not the resemblance.

Spec confirmed no scope creep and verified all four factual claims in this record. It logged two spec instructions knowingly not followed: the "walk the `/grilling` decision tree" line (see Comments) and "Do 04 first" — the latter verified harmless, since this ticket never touches `filter-by-date-range.ts`.

## Comments

- 2026-09-08: Implemented. A full grilling was judged unnecessary and skipped deliberately: the "not yet grilled" line was boilerplate applied to tickets 01, 02 and 04 alike at batch filing (`2f14651`), and `parseCalendarYear` — shipped a week earlier in `1190182` — had already settled every design question this ticket raises (where a query-param guard lives, what it returns, that it falls back rather than 404s, that it takes `string[]`). The one question that was genuinely open, whether ticket 04's rule sends the presets into the UI, was settled with the user before implementation and is recorded above.
