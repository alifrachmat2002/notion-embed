Status: needs-triage

# Share the dashboard chrome between /analytics and /cardio

Raised by the `/code-review` Standards axis on the `/cardio` feature (2026-09-05). Deferred deliberately: the cardio plan settled that `/analytics` would be left working exactly as it is, and every extraction here touches it. Not yet grilled.

## Problem

`/cardio` was built to mirror `/analytics`, and mirroring produced three near-verbatim clones.

**Stat cards.** `app/components/cardio/cardio-stat-cards.tsx` against `app/components/analytics/stat-cards.tsx`: byte-identical `format()`, identical card-grid JSX, identical `excluded > 0` footnote block, and a `describe()` of the same shape under a reworded copy of the same doc comment. Only the card list and the exclusion vocabulary genuinely differ.

**Range toolbar.** The `ANALYTICS_RANGES.map(...)` button row in `cardio-dashboard.tsx` is lifted verbatim from `analytics-dashboard.tsx`, class strings included. Note `app/components/range-selector.tsx` already exists but is a different thing — URL-driven, `/muscles`-only, fixed to `7 | 30 | 90`.

**Builder helpers.** `normalizeDate`, `orderByDate`, `sum` and `round` are re-declared identically in `lib/cardio/build-cardio-view.ts` and `lib/analytics/build-analytics-view.ts`; `round` carries the same doc comment verbatim.

## Solution sketch

- One `StatCards` taking `cards: { label; value; unit? }[]` plus an optional footnote node, with each view composing its own cards and its own exclusion sentence.
- One `RangePicker` taking the range list, labels, selected value and a change handler.
- The four date/number helpers into a shared module, e.g. `lib/series.ts`.

## Counter-argument, to be weighed during grilling

The helper duplication may be the intended price of the "one public export per logic module" rule both builders follow — sharing them means a second public module either way. And the two stat-card sets are not obviously converging: strength counts sets and kilograms, cardio counts runs and paces, so a shared component risks becoming a props-bag that neither view reads clearly.

## Deletion test

Clear win for the range toolbar (pure presentation, no logic lost). Mixed for the stat cards and helpers, where a shared abstraction may cost more in indirection than the duplication costs in maintenance.

## Severity

Worth exploring. Nothing here is a defect; all three clones work and are covered.
