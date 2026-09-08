# The dashboards and /muscles keep separate range controls

There are two period controls in this codebase and there will go on being two. The dashboards (`/analytics`, `/cardio`) share one; `/muscles` keeps its own. They look alike — a row of small pill buttons picking a number of days — and they are not the same component, because almost nothing they do is shared: one drives `useState` on a client-rendered dashboard, the other drives a query param through `Link`s; one sits in the page flow, the other is a fixed overlay on an embed; one offers 28/90/180/365/all, the other 7/30/90.

## Considered Options

- **One control for all three routes**, taking both an `onSelect` handler and an href builder, plus a positioning mode and its own preset list. Rejected: every one of those props exists to switch between the two callers, which is a component that has stopped deciding anything and become a branch with a JSX body. The duplication it removes is a row of Tailwind classes; the coupling it adds is between an embed and a dashboard, which have no reason to change together.
- **Two controls, no shared code** (chosen). The dashboards' control is dashboard chrome and lives with the rest of it; `/muscles` keeps `RangeSelector`.

## Consequences

A code review will flag these two as duplication — this ADR exists because one already did, in the review that opened `.scratch/architecture-review/issues/04-share-dashboard-chrome-between-analytics-and-cardio.md`. They are similar on purpose and the similarity is not load-bearing: if the dashboards' presets or styling change, `/muscles` should not follow.

If the two ever genuinely converge — same mechanism, same placement, same presets — merging them is cheap. The trigger is that convergence, not the visual resemblance, which was there from the start.
