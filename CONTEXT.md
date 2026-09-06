# Fitness Log

A personal fitness tracker reading a Notion database of logged sets, surfaced through `/`, `/analytics`, `/cardio`, and `/muscles`.

## Language

**Consistency calendar**:
The GitHub-style day-grid showing training frequency over a year, as the user sees it — `/`'s heading is unlabelled, `/analytics` and `/cardio` both title it "Consistency". This is the domain's name for the concept.
_Avoid_: "activity calendar" outside the rendering layer, "contributions" (GitHub's word; means nothing in a fitness log).

**Activity calendar**:
The rendering-layer name for the same grid — the `ActivityCalendarWrapper` component and the underlying `react-activity-calendar` library both use this word. Fine at that layer; not the term to reach for anywhere else.

**Calendar day / `CalendarActivity`**:
One day's entry on a consistency calendar: a date, a set count, and a shading level. `level` is one of five buckets, `0` (no sets) through `4` (heaviest day), the same 0–4 shading-bucket convention as `MuscleIntensity`.
