Status: needs-triage

# `/muscles` counts cardio as muscle volume

Deferred out of ticket 01 (2026-09-08) rather than lost. Filed ungrilled: this is a product question, and the answer decides the shape of the change.

## Problem

`buildMuscleHeatmap` counts every completed, in-range record that carries a `Muscle` value. Nothing in the path asks whether the record is strength. A run tagged `Muscle: Legs` in Notion therefore becomes leg volume and shades the heatmap exactly as a set of squats would.

`/analytics` does not have this: `buildAnalyticsView` filters through `isCardioRecord` before it counts anything.

## Why it was not folded into ticket 01

Two reasons, both still standing.

**It is not obviously wrong.** A run *is* leg work, and the heatmap answers "what have I trained lately", not "what have I lifted lately". Whether a 5k should shade the quads is a decision about what the picture means, not a defect to patch quietly.

**`isCardioRecord` needs the whole log.** It classifies an exercise by looking at every record bearing that exercise name, so it cannot be applied to the already-range-filtered slice inside `buildMuscleHeatmap`. Folding it in changes the function's contract — it would need the unfiltered log alongside the range — which is precisely the kind of thing a packaging ticket should not decide on the way past.

## Questions to settle before writing code

- Should a cardio record contribute muscle volume at all?
- If not: does it disappear, or does the heatmap distinguish it — a run is not a set, and "3 sets" in the tooltip would be a lie either way?
- If it should count, is one set the right unit for a 5k?
- Does the answer change what a *set* means in `CONTEXT.md`'s **Muscle volume** entry, which today says "one logged set is one unit"?

## Notes

The existing shape, if the answer is "exclude": `buildMuscleHeatmap(workouts, range, now)` would need the unfiltered `workouts` to build the cardio classification before filtering, the way `buildAnalyticsView` does — it already receives the full log for that reason.
