Status: done

# Colour the pace scatter by workout type

## Problem

`PaceChart` draws every run in one colour. Distance is already encoded as mark
size, but *why* a run was slow — an easy run, a tempo run, an interval session,
a long run — is not on the chart at all. Two runs at the same pace can be a good
easy run and a poor tempo run, and today they look identical.

Notion has carried the answer all along. `Workout Type` is a select with seven
options, four of which are run types:

    Easy Run, Tempo Run, Interval, Long Run, Upper Body, Lower Body, Full Body

## Why it was not read before

`lib/notion.ts` declines to read `Workout Type`, on the recorded grounds that it
"carries a single value". That was true when written; it is not true now. The
log holds 28 `Easy Run` and 1 `Long Run`, and the schema already lists `Tempo
Run` and `Interval` for records not yet logged. The comment is the blocker and
has to go with the change, not after it.

## Decisions

- **Colour keys off the tag verbatim.** Not a bucketing of `distanceKm`: the
  user tags intent at entry time, and intent is what the chart could not show.
- **Colours are assigned from the known run-type order, not from what falls in
  the selected period.** Indexing into the palette by order-of-appearance would
  let `Easy Run` change colour when the period changes from 30d to 90d, which
  would make the legend lie about every earlier reading of the chart.
- **Unknown and untagged runs fall back to one neutral `Unspecified` series.**
  Two runs were mistagged `Upper Body` (2026-08-31, 2026-08-12); the user is
  retagging those in Notion by hand. The fallback is not for them — it is for
  the next mistag, and for the 32 records that already carry no type at all.
- **The legend only appears when more than one type is present**, matching
  `RepChart`, so a single-type period does not grow a one-row legend.

## Files (as implemented)

- `lib/notion.ts` — read the property; drop the stale justification
- `types/workout.ts` — `workoutType: string | null`
- `lib/cardio/types.ts` — carry it on `CardioRun` and `PacePoint`
- `lib/cardio/build-cardio-view.ts` — thread it through
- `lib/cardio/pace-series.ts` (+ test) — **not in the original plan.** The split
  started inside the chart, where `vitest.config.mts` cannot reach it ("components
  hold no logic once the view model is built"). Grouping runs into ordered series
  is logic, and the ordering decision above is the part most worth locking down,
  so it moved to `lib/` where a test can hold it.
- `app/components/dashboard-chrome/chart-theme.ts` — run-type palette
- `app/components/cardio/pace-chart.tsx` — one series per type, legend, tooltip
- `app/components/cardio/cardio-dashboard.tsx` — panel hint
- `CONTEXT.md` — "Run type" and "Unspecified run" entered the glossary
- Three strength fixtures gained a `workoutType`, forced by the field being
  non-optional: `lib/is-cardio.test.ts`,
  `lib/analytics/build-analytics-view.test.ts`,
  `lib/muscles/build-muscle-heatmap.test.ts`

## What review changed

- **The tooltip was missing.** Series and legend landed; the tooltip still named
  only date, pace and distance. With the legend suppressed on a single-type
  period, the tag was readable nowhere on the chart.
- **`PACE` had become a dead export.** Colouring `Easy Run` with `BLUE` directly
  left `PACE` with no readers while the file header still explained why it was
  chosen. Easy Run now takes `PACE`, which is what it means.
- **The palette was hand-synced to the vocabulary.** `RUN_TYPE_COLOURS` was a
  `Record<string, string>` with no link to `RUN_TYPES`; a renamed Notion option
  would have compiled and fallen silently to the default grey, indistinguishable
  from a genuine `Unspecified`. It is keyed by `PaceSeriesLabel` now, so a new
  run type fails to compile until it is given a colour. Verified by adding a
  fifth type and watching `tsc` reject it.
- **Long Run was green**, colliding with the `WEEKLY_DISTANCE` bars directly
  beneath it — the exact drift the shared palette exists to prevent. It is
  violet now: a long run is not more intense, only longer, so it steps off the
  warm intensity scale rather than sitting at the top of it.

## Left undone

- `lib/notion.ts` trips `@typescript-eslint/no-explicit-any` on
  `parseWorkoutPage(page: any)`. It predates this change (line 24 at
  `2c3f59b`) and is untouched here.
- The chart was not verified in a browser: the Chrome extension was not
  connected, and recharts renders client-side, so the server HTML carries no
  marks. The data reaching the client was confirmed from the RSC payload.
