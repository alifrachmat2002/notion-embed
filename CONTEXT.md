# Fitness Log

A personal fitness tracker reading a Notion database of logged sets, surfaced through `/`, `/analytics`, `/cardio`, and `/muscles`.

## Language

**Consistency calendar**:
The GitHub-style day-grid showing training frequency across one calendar year, as the user sees it — `/`'s heading is unlabelled, `/analytics` and `/cardio` both title it "Consistency". Always a whole named year, January to December; never a rolling window.
_Avoid_: "activity calendar" outside the rendering layer, "contributions" (GitHub's word; means nothing in a fitness log), "the last year" for its window (it shows a year, not a trailing period).

**Selected year**:
Which calendar year a consistency calendar is showing. Every view defaults to the current one and offers the five most recent to choose from. Early in a year the default grid is empty or nearly so; that is a true report of the training done that year, not a fault.

**Activity calendar**:
The rendering-layer name for the same grid — the `ActivityCalendarWrapper` component and the underlying `react-activity-calendar` library both use this word. Fine at that layer; not the term to reach for anywhere else.

**Calendar day / `CalendarActivity`**:
One day's entry on a consistency calendar: a date, a set count, and a shading level. `level` is one of five buckets, `0` (no sets) through `4` (heaviest day), the same 0–4 shading-bucket convention as `MuscleIntensity`.
