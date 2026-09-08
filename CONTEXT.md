# Fitness Log

A personal fitness tracker reading a Notion database of logged sets, surfaced through `/`, `/analytics`, `/cardio`, and `/muscles`.

## Language

**Dashboard**:
A full-page analytics view built from one shell: a title, a row of page-level controls, a row of stat cards, and titled panels below. `/analytics` and `/cardio` are the two, and there are no others — `/` is an embed and `/muscles` is a heatmap page, and neither shares the shell.
_Avoid_: "dashboard" for `/` or `/muscles`; "the analytics page" when both dashboards are meant.

**Dashboard chrome**:
The furniture the dashboards share, as opposed to the figures they show: the panel frame, the stat-card grid, the period control, the chart palette. Chrome belongs to no one dashboard — anything only one of them uses is that dashboard's own, however similar it looks to the other's.

**Consistency calendar**:
The GitHub-style day-grid showing training frequency across one calendar year, as the user sees it — `/`'s heading is unlabelled, `/analytics` and `/cardio` both title it "Consistency". Always a whole named year, January to December; never a rolling window.
_Avoid_: "activity calendar" outside the rendering layer, "contributions" (GitHub's word; means nothing in a fitness log), "the last year" for its window (it shows a year, not a trailing period).

**Selected year**:
Which calendar year a consistency calendar is showing. Every view defaults to the current one and offers the five most recent to choose from. Early in a year the default grid is empty or nearly so; that is a true report of the training done that year, not a fault.

**Muscle range / `MuscleRange`**:
Which of the three periods `/muscles` offers — 7, 30 or 90 days back from today — the heatmap is showing. Carried in `?range=`, defaulting to 7; a request for any other number falls back to the default rather than erroring, because `/muscles` is an embed.
_Avoid_: "period control" for its selector (that phrase belongs to dashboard chrome, and `/muscles` is not a dashboard — see `docs/adr/0002`); "date range", which is `DateRangeValue`, the wider type `lib/` filters by and which admits any day count.

**Activity calendar**:
The rendering-layer name for the same grid — the `ActivityCalendarWrapper` component and the underlying `react-activity-calendar` library both use this word. Fine at that layer; not the term to reach for anywhere else.

**Calendar day / `CalendarActivity`**:
One day's entry on a consistency calendar: a date, a set count, and a shading level. `level` is one of five buckets, `0` (no sets) through `4` (heaviest day), the same 0–4 shading-bucket convention as `MuscleIntensity`.
