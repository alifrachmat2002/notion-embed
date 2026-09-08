Status: done

# Share the dashboard chrome between /analytics and /cardio

Raised by the `/code-review` Standards axis on the `/cardio` feature (2026-09-05). Deferred deliberately at the time: the cardio plan settled that `/analytics` would be left working exactly as it is, and every extraction here touches it.

Grilled via `/grill-with-docs` on 2026-09-07 (14 questions). The grilling **widened** this ticket: what was filed as three clones is a folder reorganisation with three extractions inside it. See "What grilling changed" below.

## Problem (original, 2026-09-05)

`/cardio` was built to mirror `/analytics`, and mirroring produced three near-verbatim clones.

**Stat cards.** `CardioStatCards` against `StatCards`: byte-identical `format()`, identical card-grid JSX, identical `excluded > 0` footnote block, and a `describe()` of the same shape under a reworded copy of the same doc comment. Only the card list and the exclusion vocabulary genuinely differ.

**Range toolbar.** The `ANALYTICS_RANGES.map(...)` button row in the cardio dashboard is lifted verbatim from the analytics one, class strings included. `RangeSelector` already exists but is a different thing — URL-driven, `/muscles`-only, fixed to `7 | 30 | 90`.

**Builder helpers.** `normalizeDate`, `orderByDate`, `sum` and `round` are re-declared identically in both view builders.

## What grilling changed

**The clones are a symptom; the cause is that shared code has no home.** Four modules are used by more than one feature while living inside one feature's folder:

| Module | Lives in | Actually used by |
| --- | --- | --- |
| `Panel` | analytics components | both dashboards |
| `chart-theme` | analytics components | both dashboards — it already exports cardio's own `PACE` and `WEEKLY_DISTANCE` colours |
| `ANALYTICS_RANGES`, `AnalyticsRange`, `RANGE_LABELS` | analytics view-model types | both dashboards, and **nothing in `lib/` at all** |
| `filterByDateRange` | muscles lib | analytics, cardio and muscles |

So `/cardio` didn't introduce the disease; it inherited a codebase where "shared" meant "wherever it was written first". Deduplicating the three clones without fixing that just adds a fifth mis-homed module.

**Two corrections to the original text.** `round`'s doc comment is *not* verbatim — analytics cites fractional dumbbell weights, cardio fractional distances. And "all three clones work and are covered" is half true: the builder helpers are exercised through the view-builder tests, but the stat cards and the range toolbar have **no coverage at all**, because this repo has no component tests by decision (see Out of scope).

**The "one public export per logic module" rule cited in the original counter-argument is not documented anywhere.** It is a pattern `lib/muscles/` happens to follow, not a standard, and it does not constrain this work.

## Files (as implemented)

*Moved, unchanged (commit 1):*

- `app/components/dashboard-chrome/panel.tsx`, `chart-theme.ts` — out of the analytics folder; chart-theme's doc comment gained the one-palette rationale
- `app/components/dashboard-chrome/calendar-year-picker.tsx`, `use-calendar-year.ts` — out of the components root
- `lib/filter-by-date-range.ts` — out of `lib/muscles/`
- `lib/is-cardio.ts`, `lib/is-cardio.test.ts` — out of `lib/cardio/`; the fifth mis-homed module, see the comment below

*New (commit 2):*

- `app/components/dashboard-chrome/period-picker.tsx` — `PeriodPicker`, `DASHBOARD_PERIODS`, `DashboardPeriod`, `PERIOD_LABELS`
- `app/components/dashboard-chrome/stat-card-grid.tsx` — `StatCardGrid`, `StatCard`
- `lib/series.ts` + `lib/series.test.ts` — 13 tests
- `lib/format-stat-value.ts` + `lib/format-stat-value.test.ts` — 5 tests

*Changed:*

- `lib/analytics/types.ts` — the preset list, union type and labels deleted
- `lib/analytics/build-analytics-view.ts`, `lib/cardio/build-cardio-view.ts` — import the series helpers; `max`/`unique` and `min` respectively stay local
- `app/components/analytics/stat-cards.tsx`, `app/components/cardio/cardio-stat-cards.tsx` — wrappers over `StatCardGrid`, each keeping its own `describe()`
- `app/components/analytics/analytics-dashboard.tsx`, `app/components/cardio/cardio-dashboard.tsx` — render `PeriodPicker`
- `app/muscles/page.tsx`, and the four chart components — import paths only


## Agent Brief

**Category:** enhancement

**Summary:** Give shared dashboard code an honest home, then remove the three clones that the lack of one produced.

**Current behavior:**
`/analytics` and `/cardio` render the same shell — title, control row, stat cards, titled panels — from two sets of components. Three pieces of it are duplicated near-verbatim, and four more are shared already but reached for across feature-folder boundaries. A reader of the cardio dashboard learns that its period state has the type `AnalyticsRange` and that its chart colours are defined in the analytics folder.

**Desired behavior:**
One rule decides where a module lives: **anything used by more than one feature leaves that feature's folder.** Shared UI belongs to a dashboard-chrome module; shared logic belongs at the root of `lib/`. A module used by exactly one feature stays in that feature's folder, however much it resembles another feature's.

Applying that rule end to end:

*Dashboard chrome* — a module holding UI shared by the two dashboards and nothing else. It gains `Panel` and `chart-theme` from the analytics folder; `CalendarYearPicker` and `useCalendarYear` from the components root (both are used by exactly the two dashboards, so the components root can go back to meaning "app-wide"); a new `RangePicker`; and a new `StatCardGrid`.

*Shared logic at the `lib/` root* — `filterByDateRange` moves out of the muscles folder. A new series module holds `normalizeDate`, `orderByDate`, `sum` and `round`, with a doc comment on `round` that names both drifts it guards against rather than picking one feature's example. A new format module holds the number-abbreviating `format()` under a name that says what it formats.

*The three extractions* —

- `RangePicker`: a button row driving a callback. It owns the dashboard preset list and labels, which move out of the analytics view-model types entirely (nothing in `lib/` reads them) and are renamed so neither name says "analytics".
- `StatCardGrid`: pure layout, taking the cards to render and an optional footnote node. Each dashboard keeps its own small wrapper that composes its own cards and writes its own exclusion sentence — "3 timed holds" and "6 with no distance recorded" are different languages and stay per-feature.
- The series and format helpers, called by both view builders.

**Key interfaces:**

- `StatCardGrid`: takes a list of cards (label, value, optional unit) and an optional footnote node. It knows nothing about sets, runs, holds or distances. Value formatting is the caller's decision — cardio deliberately does not abbreviate its run count while analytics abbreviates volume, and that asymmetry must survive.
- `RangePicker`: takes the preset list, the labels, the selected value and a change handler. Button-driven, in normal page flow.
- The dashboard preset list and its derived union type: renamed so that neither carries "analytics". The union is the type of *both* dashboards' period state.
- The series helpers keep their current signatures exactly; `orderByDate` stays generic over `{ date: string }`.
- `AnalyticsOptions` and `CardioOptions` are **not** merged (see Out of scope).

**Acceptance criteria:**

- [x] No module under a feature folder is imported by a different feature.
- [x] Nothing in `lib/` imports the dashboard preset list, its union type, or the labels — they are UI vocabulary and live in the UI.
- [x] Neither the preset list nor its union type has a name containing "analytics".
- [x] The card-grid markup, the `excluded > 0` footnote block and `format()` each exist exactly once.
- [x] `normalizeDate`, `orderByDate`, `sum` and `round` each exist exactly once and are imported by both view builders.
- [x] `min`, `max` and `unique` are untouched — one caller each.
- [x] The series helpers and the stat-value formatter have direct unit tests. This is a coverage *increase*: all five have zero direct tests today.
- [x] `npm run typecheck`, `npm test` and `npm run build` all pass. `npm run lint` reports only the pre-existing `no-explicit-any` in the Notion client.
- [x] `/analytics` and `/cardio` render identically to before — same cards, same numbers, same footnotes, same panels, same colours.
- [x] Delivered as two commits: pure moves and renames first (imports updated, no behaviour touched, so git reads it as renames), then the extractions and their tests.
- [x] ~~Ticket 02's file list is amended for the `filterByDateRange` move, in this ticket's work.~~ Moot as of 2026-09-08: ticket 02 shipped first and is `done`. It never touched `filter-by-date-range.ts` — by the time it was picked up, that file had already been retyped against `DateRangeValue` and no longer restated `7 | 30 | 90`, so the move cannot invalidate anything in it.

**Out of scope:**

- **`RangeSelector` and `/muscles`.** The dashboards' range control and the one on `/muscles` are deliberately separate — see `docs/adr/0002`. Do not merge them, and do not touch `RangeSelector`: ticket 02 owns that file.
- **`types/date-range.ts`.** Ticket 02 owns it. The preset list goes to the UI, not into that file.
- **Merging `AnalyticsOptions` and `CardioOptions`.** They share `{ range, year?, now? }` and identical doc comments; leaving them literal is a decision, not an oversight. A shared options type is the first step toward merging two builders that are deliberately separate.
- **Splitting `chart-theme` per feature.** It is one palette on purpose, so that `PACE` and `STRENGTH_INDEX` are picked against each other. Record this in its doc comment; do not act on it.
- **Component tests, jsdom, or testing-library.** `vitest.config.mts` documents the seam: node, not jsdom, because components hold no logic once the view model is built. `StatCardGrid` and `RangePicker` ship untested. Changing that is its own ticket and its own argument.
- **Renaming `CardioStatCards` / `CardioDashboard`.** The prefix is redundant beside the folder, but it is a cosmetic rename on an already-wide ticket.
- **`formatPace`.** Cardio-only, so by the rule above it stays in the cardio folder.

## Comments

- 2026-09-08: Implemented in two commits, as asked. `/code-review` run on both axes before the second was finalised; the Spec axis found nothing, and three Standards findings were folded in.

  **The control is `PeriodPicker`, not `RangePicker`.** The one deliberate deviation from this brief. `CONTEXT.md` names the four chrome pieces — "the panel frame, the stat-card grid, the period control, the chart palette" — and three of them landed on their glossary terms while the fourth did not; the same entry reserves "range" for `/muscles` (`MuscleRange`) and marks "period control" as the phrase that *belongs to dashboard chrome*. `RangePicker` sitting beside `RangeSelector` is the conflation `docs/adr/0002` exists to prevent, so the component, its presets (`DASHBOARD_PERIODS`), its union (`DashboardPeriod`) and its labels (`PERIOD_LABELS`) all say "period". No acceptance criterion named the component, and the one that did constrain the names — no "analytics" in them — still holds.

  **A fifth mis-homed module.** The table above lists four, but `lib/analytics/build-analytics-view.ts` already imported `isCardioRecord` from `lib/cardio/`, so the first acceptance criterion could not pass without moving it to `lib/`. The rule was taken as binding over the table's count.

  **The `excluded > 0` guard still appears twice**, in the two wrappers, though the footnote `<p>` block exists once. That is Desired behavior's "each dashboard … writes its own exclusion sentence" rather than a missed dedupe: a sentence written only when there is something to exclude needs the condition beside the sentence.

  Two smaller review fixes went in: the stat-value formatter's doc comment no longer explains itself through cardio's run count (a `lib/` util documenting one dashboard's UI decision), and `PERIOD_LABELS` is keyed to the union rather than `Record<string, string>`, so a preset added without a label is now a type error. Left alone deliberately: `PeriodPicker`'s `periods`/`labels` props, which Key interfaces prescribes, and `StatCardGrid`'s `footnote?: ReactNode`, which is wider than both callers need but is the honest type for a slot.

- 2026-09-08: Ticket 02 shipped ahead of this one. It added `MUSCLE_RANGES`, a derived `DateRange` and `parseDateRange` to `types/date-range.ts`, and `RangeSelector` now imports the presets instead of restating them — both files this ticket lists as 02's to own, so nothing here is blocked. Note for whoever picks this up: 02 applied this ticket's rule and landed the muscle presets in `types/`, not beside their component, on the grounds that the rule's criterion names `lib/` (which `types/` is not) and that splitting the preset array from the union type it defines would reintroduce drift. If `RangePicker` ends up wanting the same shape, follow `types/date-range.ts` rather than the letter of the "preset lists live in the UI" phrasing.
- 2026-09-07: Triaged and grilled (14 questions). Category `enhancement`, moved `needs-triage` to `ready-for-agent`. Redundancy check: none of this exists yet. No `.out-of-scope/` in this repo, so no prior rejection to match against. The grilling widened the ticket from three clones to a folder reorganisation, on the finding that four modules were *already* shared across feature boundaries — deduplicating without fixing that would have added a fifth. Two decisions went against the recommendation: the options types stay literal, and the `Cardio` prefix stays. `docs/adr/0002` was written so the two range controls are not "fixed" into one later, and `CONTEXT.md` gained **Dashboard** and **Dashboard chrome**.
