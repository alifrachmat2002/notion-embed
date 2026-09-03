Status: ready-for-agent

# Fitness Analytics Dashboard

Derived from the feature brief at `.scratch/feature-brief/01-analytics-dashboard.md`, refined through a full grilling pass against the live Notion data (481 records, 2026-05-28 to 2026-09-03, 56 training days).

## Problem Statement

The fitness log records one set per record and already surfaces two views: a year-long activity calendar of daily set counts, and a muscle-group heatmap over a rolling window. Both answer "did I train, and what did I hit" — neither answers "am I getting better".

To find out whether a given exercise is progressing, the owner has to read raw set rows in Notion and hold the comparison in their head: was 7 kg for 16 reps better than 6.5 kg for 16 reps three weeks ago? Because weight and reps move independently — and often in opposite directions during real progression — the raw log actively resists that judgement. Reps dropping while weight rises reads as regression at a glance, when it is usually the opposite.

The database also contains richer data than the app has ever read. Exercise, weight, reps, and equipment are all logged, and the app currently exposes only date, completion, activity type, and muscle.

## Solution

An exercise-centric analytics view. The owner picks an exercise and a time period, and sees, without further interaction:

- Four headline numbers: sessions, sets, volume, max weight.
- Whether the weight lifted is trending up, alongside a combined weight-and-reps index that keeps rising through the transitions where weight goes up and reps come down.
- Whether rep capacity at a given weight is improving, shown so that same-weight comparisons are read directly rather than inferred.
- Whether total workload per session is increasing.
- How consistently the exercise has been trained, using the same activity-calendar visual language already in the product, filtered to that exercise.

The existing logging structure is untouched. Every derived metric is computed from records as they are already entered.

## User Stories

1. As the log owner, I want to pick an exercise from a dropdown, so that I can focus on one movement at a time instead of an undifferentiated pile of sets.
2. As the log owner, I want the dropdown to list only exercises I have actually logged usable data for, so that I never select an option that renders an empty dashboard.
3. As the log owner, I want the dropdown ordered by how much I have logged, so that my main lifts are reachable first.
4. As the log owner, I want an exercise already selected when the page opens, so that I see a working dashboard rather than an empty prompt.
5. As the log owner, I want changing the exercise to update every panel at once, so that I never read a chart belonging to a different movement.
6. As the log owner, I want to pick a time period, so that I can distinguish a recent training block from my whole history.
7. As the log owner, I want period options spanning four weeks to all time, so that both short-term and long-term questions are answerable from the same page.
8. As the log owner, I want selector changes to feel instant, so that comparing exercises is fast enough to actually do.
9. As the log owner, I want to see the maximum weight I used in each session plotted over time, so that I can tell whether I am lifting heavier.
10. As the log owner, I want a combined weight-and-reps trend line, so that progression stays visible even though I only ever use three or four dumbbell weights.
11. As the log owner, I want that combined line explained on hover, so that I understand it is a relative index and not a claim about my true one-rep maximum.
12. As the log owner, I want that index never labelled as a one-rep max, so that I am not misled into believing a number my rep ranges do not support.
13. As the log owner, I want to see reps plotted against date with the weight distinguishable, so that I can judge whether my rep capacity is improving.
14. As the log owner, I want same-weight sessions visually grouped, so that "more reps at the same weight" is something I read off the chart rather than compute.
15. As the log owner, I want a session where reps fell because weight rose to be legible as progress, so that the dashboard does not mislead me into thinking I regressed.
16. As the log owner, I want repeated identical sets within a session collapsed into one point, so that overlapping marks do not hide how many sets a point represents.
17. As the log owner, I want the number of sets behind each point available on hover, so that collapsing them loses no information.
18. As the log owner, I want session volume plotted over time, so that I can tell whether my total workload is rising.
19. As the log owner, I want set volume, session volume, and period total kept distinct, so that I always know which quantity I am looking at.
20. As the log owner, I want volume for bodyweight exercises expressed in reps rather than kilograms, so that my push-up progress is visible instead of flatlining at zero.
21. As the log owner, I want the volume axis labelled for the exercise in view, so that I am never comparing kilograms against reps without noticing.
22. As the log owner, I want total sessions for the selected exercise and period, so that I know how often I trained it.
23. As the log owner, I want total sets, so that I know the accumulated work.
24. As the log owner, I want total volume for the period, so that I have a single workload figure.
25. As the log owner, I want the maximum weight reached in the period, so that I can see my ceiling at a glance.
26. As the log owner, I want the statistics limited to a handful of headline numbers, so that the page reads as a training history rather than a spreadsheet.
27. As the log owner, I want a calendar heatmap of the days I performed the selected exercise, so that I can see my consistency with that specific movement.
28. As the log owner, I want that heatmap to keep the existing visual style, so that it reads the same as the one I already use.
29. As the log owner, I want the heatmap to show a full year regardless of the selected period, so that the year grid never collapses into an unreadable stub.
30. As the log owner, I want the heatmap year labelled, so that it is obvious it spans a different window than the charts above it.
31. As the log owner, I want every session I showed up for counted in the heatmap, even sets whose numbers were incomplete, so that consistency reflects attendance rather than data quality.
32. As the log owner, I want cardio kept out of the exercise selector, so that I am not offered movements whose charts cannot be drawn.
33. As the log owner, I want timed holds excluded from weight, rep, and volume calculations, so that a forty-second hold does not appear as my heaviest lift or largest volume.
34. As the log owner, I want sets with no recorded rep count excluded from averages and totals, so that missing data is not silently counted as zero effort.
35. As the log owner, I want to be told when sets were excluded from the statistics and why, so that a set count disagreeing with the totals beneath it reads as an explanation rather than a bug.
36. As the log owner, I want that exclusion note to identify what is missing, so that I know which records to go back and complete in Notion.
37. As the log owner, I want charts with too little data to say so plainly, so that I am not shown a single dot on an axis and left to guess.
38. As the log owner, I want the analytics view to live at its own address, so that I can embed it in Notion alongside my existing embeds without disturbing them.
39. As the log owner, I want my existing calendar and muscle views to behave exactly as before, so that adding analytics costs me nothing I already rely on.
40. As the log owner, I want the analytics view refreshed by the same manual refresh path as the other views, so that there is one way to pull new data.

## Implementation Decisions

**Data layer**

- The workout entry type gains the exercise name, weight, reps, and the record title, added alongside the existing fields so the calendar and muscle views are unaffected. The Notion workout client reads these four additional properties.
- The database's own Volume and 1RM Estimate formulas are deliberately not read. Both are computed by Notion across unfiltered records, so they bake in the timed-hold and missing-rep artifacts described below. Both quantities are recomputed locally after hygiene filtering.

**The analytics view builder — the single public seam**

- One function takes the full set of workout entries plus a selection (exercise and period) and returns a complete view model. Everything the page renders comes from that one call.
- The returned view model carries: the ordered exercise options; the resolved selection; whether that exercise is weighted or bodyweight; the four stat-card values; the exclusion counts; the weight series; the rep scatter series; the volume series; and the full-year calendar activity.
- Passing a null exercise resolves the default, so default-selection behaviour is part of the seam rather than component state.
- All per-concern helpers — hygiene filtering, session grouping, per-chart aggregation, exercise listing — are internal to this module and not exported. This keeps the test surface at one function and leaves the internal decomposition free to change.

**Data hygiene rules, all applied inside the builder**

- Only strength records are considered. Cardio is excluded outright: it carries distance, duration, and RPE rather than weight and reps.
- Records whose title contains "hold" are excluded from all weight, rep, volume, and index arithmetic, but still count toward set totals and the heatmap. This is a title-string rule by necessity: on the affected records the exercise field names an ordinary curl, and only the title reveals a timed hold.
- Records with a rep count of zero or null are excluded from arithmetic and still counted as sets.
- Records with no exercise assigned are dropped from exercise-specific views and still counted in the all-exercise calendar.
- Exclusions are counted and returned so the interface can disclose them.

**Metrics**

- An exercise is classified bodyweight when every weight recorded against it is zero or null. Bodyweight exercises use total reps as their volume metric. No assumed bodyweight constant is introduced.
- A session is the pair of exercise and date. Dates carry no time component, so this is the only definition the data supports.
- The weight panel plots maximum weight per session, plus a second series computed as weight multiplied by one plus reps over thirty. It is surfaced as a strength index with an explanatory tooltip, and is never labelled a one-rep max.
- The rep panel is a scatter of date against reps with weight encoded by colour, deduplicated to one mark per distinct date, weight, and rep combination, carrying the underlying set count for the tooltip.
- Session volume is the sum of weight times reps for weighted exercises, and the sum of reps for bodyweight exercises.

**Selection and periods**

- The exercise list contains only exercises with at least one usable set, ordered by set count with an alphabetical tie-break. The default is the first entry.
- Periods are four weeks, three months, six months, one year, and all time. No custom range.
- The shared date-range type is generalised to admit an all-time value and gains a validating parser that takes the caller's permitted values and a fallback, replacing the current unchecked numeric cast. Each view keeps its own period list.

**Page and rendering**

- The dashboard is a new route, added to the set of workout view paths that the revalidation helper refreshes.
- The server fetches the workout entries once and hands them to a client component, which calls the view builder on every selection change. The dataset is small enough that this removes all further network traffic and keeps the route statically renderable.
- Charts are built with Recharts, themed to the existing dark palette.
- The heatmap reuses the existing calendar transform and calendar component unchanged, fed records pre-filtered to the selected exercise.
- Section order follows the brief: selectors, stat cards, weight, reps against weight, volume, heatmap.

## Testing Decisions

**What makes a good test here.** A test should assert only what the owner could observe: the numbers on the cards, the points in a series, which exercises are offered, which records were excluded and why. It should never assert how the builder decomposes its work internally, which helper produced a value, or the order in which filters ran. A test that breaks when the module is reorganised but the dashboard is unchanged is a bad test.

**Prior art: none.** The repository has no test runner and no existing tests. This feature introduces Vitest and establishes the pattern; the shape chosen here becomes the precedent, which is part of why the test surface is kept to a single function.

**Modules under test**

- The analytics view builder, exercised through its one exported function against fixture workout entries. This is the only seam for the feature's logic.
- The Notion workout parser, with one small fixture test covering the four newly read properties including a timed-hold record. This layer is otherwise thin mapping whose failures are loud, but an empty title would silently disable hold filtering and corrupt volume and maximum-weight figures with no error — the one quiet failure worth pinning down.

**Cases to cover**, drawn from real records in the log rather than invented data:

- Timed holds are excluded from arithmetic and still counted as sets, and no series carries the inflated volume or index values they otherwise produce.
- A whole session of records with a zero rep count is excluded from averages and totals while still contributing to set counts and the heatmap.
- Records with no assigned exercise are absent from exercise views and present in the unfiltered calendar.
- A bodyweight exercise reports volume in reps and is classified correctly.
- A weighted exercise's weight series steps upward and its index rises across sessions where reps fall as weight rises.
- Identical sets within a session collapse to one scatter point carrying the correct set count.
- Cardio never appears in the exercise options.
- Period filtering selects the right sessions at each boundary, and the all-time value applies no filter.
- The exercise list excludes movements with no usable sets, and default resolution picks the expected entry including the tie-break.
- Exclusion counts match the records actually withheld.

**Not tested.** Components, chart rendering, and the Notion client's network behaviour. The components hold no logic once the builder returns a complete view model, and testing Recharts output would assert the library's behaviour rather than ours.

## Out of Scope

- Cardio analytics. Distance, pace, duration, and RPE are a separate metric system and a separate feature.
- A custom date-range picker. The brief lists it; no success criterion depends on it.
- Any change to how workouts are logged, or any write back to Notion.
- Component, DOM, or visual-regression tests.
- Fitness scores, recovery scores, trend indicators, and statistical modelling beyond the stated index.
- Recovering the unassigned records by parsing titles into exercise names. A hardcoded alias table is not worth carrying for a one-off gap.
- Changing the calendar transform's fixed-year window, including its behaviour at year rollover. That is a pre-existing issue on the current calendar view and belongs in its own ticket.
- Adding an all-exercise mode to the analytics selector. The existing calendar view already serves the unfiltered heatmap.

## Further Notes

**Data findings that shaped this spec**, from profiling all 481 records:

- Weights only ever take three values across most exercises, which is why maximum weight alone cannot carry the headline question and the combined index exists.
- 117 push-up records carry a weight of zero or null, which is why bodyweight volume is measured in reps.
- Eight records store seconds in the rep field, titled as forty-second holds. Left in, they produce both the largest single-set volume and the highest index value in the database, from an exercise never loaded above 6.5 kg.
- 70 strength records have a zero or null rep count, including one entire session.
- Sets within a session are near-identical, which is why the scatter deduplicates and why maximum weight and best set collapse to the same value.
- The bicep family loses roughly 83% of its records to missing rep counts; one variant is excluded entirely because every one of its records is a hold. Those charts will be sparse until the values are filled in.

**Accepted consequences**, raised during grilling and confirmed:

- The default exercise is bodyweight, so the dashboard opens showing a maximum weight of zero. Pinning a weighted default was offered and declined.
- Six months, one year, and all time produce identical charts until the log passes six months. This resolves itself as data accumulates.

**Worth doing in Notion, not in code.** Setting the exercise field on the nine unassigned records from the first session recovers that day for exercise views; filling the missing rep counts restores the bicep charts. Both are data entry, not structural change.

**Related ticket.** The date-range parser described above closes `.scratch/architecture-review/issues/02-daterange-validation.md`. Migrating the muscle view onto the same parser is a small optional step; it can be left to that ticket if this work should stay narrow.
