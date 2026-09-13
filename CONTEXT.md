# Fitness Log

A personal fitness tracker reading a Notion database of logged sets, surfaced through `/`, `/analytics`, `/cardio`, and `/muscles`.

## Language

**Dashboard**:
A full-page analytics view built from one shell: a title, a row of page-level controls, a row of stat cards, and titled panels below. `/analytics` and `/cardio` are the two, and there are no others — `/` is an embed and `/muscles` is a heatmap page, and neither shares the shell.
_Avoid_: "dashboard" for `/` or `/muscles`; "the analytics page" when both dashboards are meant.

**Dashboard chrome**:
The furniture the dashboards share, as opposed to the figures they show: the panel frame, the stat-card grid, the period control, the chart palette. Chrome belongs to no one dashboard — anything only one of them uses is that dashboard's own, however similar it looks to the other's.

**Run type**:
What a run was *for*, as tagged on the record: easy, tempo, interval or long. Four of the seven values of Notion's `Workout Type` column; the other three ("Upper Body", "Lower Body", "Full Body") tag strength work. The pace chart draws one series per run type, because pace alone cannot separate a good easy run from a poor tempo one at the same minutes per kilometre.
_Avoid_: "workout type" for the cardio subset — that is the whole column, strength values included, and is the name of the field on `WorkoutEntry`; "run kind"; "session type".

**Unspecified run**:
A run the tag cannot explain: one logged before the column was used, or one carrying a strength value by mis-entry. Collected into a single grey series rather than given one of its own, because a strength label in a running chart's legend says nothing true. Not a run type; an admission that the type is unknown.

**Consistency calendar**:
The GitHub-style day-grid showing training frequency across one calendar year, as the user sees it — `/`'s heading is unlabelled, `/analytics` and `/cardio` both title it "Consistency". Always a whole named year, January to December; never a rolling window.
_Avoid_: "activity calendar" outside the rendering layer, "contributions" (GitHub's word; means nothing in a fitness log), "the last year" for its window (it shows a year, not a trailing period).

**Selected year**:
Which calendar year a consistency calendar is showing. Every view defaults to the current one and offers the five most recent to choose from. Early in a year the default grid is empty or nearly so; that is a true report of the training done that year, not a fault.

**Muscle range / `MuscleRange`**:
Which of the three periods `/muscles` offers — 7, 30 or 90 days back from today — the heatmap is showing. Carried in `?range=`, defaulting to 7; a request for any other number falls back to the default rather than erroring, because `/muscles` is an embed.
_Avoid_: "period control" for its selector (that phrase belongs to dashboard chrome, and `/muscles` is not a dashboard — see `docs/adr/0002`); "date range", which is `DateRangeValue`, the wider type `lib/` filters by and which admits any day count.

**Muscle volume**:
How much work a muscle group has taken over a muscle range, counted in sets — one logged set is one unit, whatever weight or reps are on it. Only sets actually completed count; a session planned and left unticked is not volume.
_Avoid_: bare "volume" where the analytics figure is also in view — that one is weight × reps, a different quantity wearing the same word.

**Muscle intensity / `MuscleLevel`, `MuscleIntensity`**:
Which of five shading buckets a group's muscle volume falls into on the heatmap, `0` (untrained) through `4` (heaviest). A `MuscleLevel` is one group's bucket; a `MuscleIntensity` is all six groups' at once, which is what the body map paints from. The same 0–4 convention as a calendar day, on its own thresholds, because the two grade different things: a calendar day grades one day against your other days, an intensity grades a whole range's work on one muscle.
_Avoid_: reading a level as an amount — it is a bucket, and the set count behind it is the amount.

**Activity calendar**:
The rendering-layer name for the same grid — the `ActivityCalendarWrapper` component and the underlying `react-activity-calendar` library both use this word. Fine at that layer; not the term to reach for anywhere else.

**Calendar day / `CalendarActivity`**:
One day's entry on a consistency calendar: a date, a set count, and a shading level. `level` is one of five buckets, `0` (no sets) through `4` (heaviest day), the same 0–4 shading-bucket convention as `MuscleIntensity`.
