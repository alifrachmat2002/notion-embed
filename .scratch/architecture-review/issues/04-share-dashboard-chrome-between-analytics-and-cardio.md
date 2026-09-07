Status: ready-for-agent

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

- [ ] No module under a feature folder is imported by a different feature.
- [ ] Nothing in `lib/` imports the dashboard preset list, its union type, or the labels — they are UI vocabulary and live in the UI.
- [ ] Neither the preset list nor its union type has a name containing "analytics".
- [ ] The card-grid markup, the `excluded > 0` footnote block and `format()` each exist exactly once.
- [ ] `normalizeDate`, `orderByDate`, `sum` and `round` each exist exactly once and are imported by both view builders.
- [ ] `min`, `max` and `unique` are untouched — one caller each.
- [ ] The series helpers and the stat-value formatter have direct unit tests. This is a coverage *increase*: all five have zero direct tests today.
- [ ] `npm run typecheck`, `npm test` and `npm run build` all pass. `npm run lint` reports only the pre-existing `no-explicit-any` in the Notion client.
- [ ] `/analytics` and `/cardio` render identically to before — same cards, same numbers, same footnotes, same panels, same colours.
- [ ] Delivered as two commits: pure moves and renames first (imports updated, no behaviour touched, so git reads it as renames), then the extractions and their tests.
- [ ] Ticket 02's file list is amended for the `filterByDateRange` move, in this ticket's work.

**Out of scope:**

- **`RangeSelector` and `/muscles`.** The dashboards' range control and the one on `/muscles` are deliberately separate — see `docs/adr/0002`. Do not merge them, and do not touch `RangeSelector`: ticket 02 owns that file.
- **`types/date-range.ts`.** Ticket 02 owns it. The preset list goes to the UI, not into that file.
- **Merging `AnalyticsOptions` and `CardioOptions`.** They share `{ range, year?, now? }` and identical doc comments; leaving them literal is a decision, not an oversight. A shared options type is the first step toward merging two builders that are deliberately separate.
- **Splitting `chart-theme` per feature.** It is one palette on purpose, so that `PACE` and `STRENGTH_INDEX` are picked against each other. Record this in its doc comment; do not act on it.
- **Component tests, jsdom, or testing-library.** `vitest.config.mts` documents the seam: node, not jsdom, because components hold no logic once the view model is built. `StatCardGrid` and `RangePicker` ship untested. Changing that is its own ticket and its own argument.
- **Renaming `CardioStatCards` / `CardioDashboard`.** The prefix is redundant beside the folder, but it is a cosmetic rename on an already-wide ticket.
- **`formatPace`.** Cardio-only, so by the rule above it stays in the cardio folder.

## Comments

- 2026-09-07: Triaged and grilled (14 questions). Category `enhancement`, moved `needs-triage` to `ready-for-agent`. Redundancy check: none of this exists yet. No `.out-of-scope/` in this repo, so no prior rejection to match against. The grilling widened the ticket from three clones to a folder reorganisation, on the finding that four modules were *already* shared across feature boundaries — deduplicating without fixing that would have added a fifth. Two decisions went against the recommendation: the options types stay literal, and the `Cardio` prefix stays. `docs/adr/0002` was written so the two range controls are not "fixed" into one later, and `CONTEXT.md` gained **Dashboard** and **Dashboard chrome**.
