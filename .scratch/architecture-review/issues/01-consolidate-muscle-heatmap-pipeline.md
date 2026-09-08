Status: done

# Consolidate the muscle-heatmap pipeline into one module

From the 2026-08-31 codebase architecture review (candidate #3, "Worth exploring"). Grilled via `/grill-with-docs` on 2026-09-08 (14 questions). Every design question below is settled; the code is a separate pass.

## Problem

Answering "why is this muscle uncolored on the heatmap" means tracing six files. But the file count is the lesser half of it — **the pipeline is split across three layers**, which the original ticket missed:

| Stage | Runs in | File |
| --- | --- | --- |
| filter by range, count sets per group | `app/muscles/page.tsx` (server) | `calculate-muscle-volume.ts` |
| bucket counts into 0–4 levels | `MuscleHeatmap.tsx` (`"use client"`) | `normalize-intensity.ts` |
| pick a fill colour | `MuscleBodyMap.tsx` | `get-muscle-colors.ts` |

No single file, and no single *runtime*, holds the derivation. That is why it is hard to follow, and collapsing files without closing the layer split would leave the real problem in place.

Alongside it, two straightforward faults:

- **Unticked sets count as trained volume.** `app/muscles/page.tsx:24-26` feeds every dated record in. `buildAnalyticsView` filters `completed`, and `workoutsToCalendarData` drops `!completed` inside the transform (`lib/transform.ts:37`); `/muscles` alone does not. A session planned and never done colours the heatmap.
- **An unrecognised `Muscle` value vanishes silently** (`lib/muscles/calculate-muscle-volume.ts:19`, `if (!mapped) continue`). `Muscle` is a Notion *select*, so this fires the day someone adds an option — "Forearms", "Glutes" — and nothing anywhere says the sets were dropped.

`get-muscle-colors.ts` is a pure pass-through; deleting it and inlining the table lookup loses nothing.

## What grilling changed

**One claim in the original is struck.** It named "an SVG path with no lookup entry falling back to the default colour in `MuscleBodyMap.tsx`" as a silent drop worth fixing. It is not a drop. `assets/front-paths.ts` holds ~179 paths and `FRONT_GROUPS` indexes about 50 — the rest are body outline, and `DEFAULT_BODY_COLOR` is the correct answer for them, not a fallback masking a fault. Only the Notion-side drop is real.

**One decision is reversed.** The solution sketch had colour computation become "a private helper" inside the new lib module. It goes the other way: `muscle-colors.ts` moves *out* to `app/components/muscles/`. A palette is UI vocabulary, `DEFAULT_BODY_COLOR` paints paths that have no muscle at all — a fact the volume→intensity pipeline knows nothing about — and having `lib/` return hex strings would re-create exactly the mis-homing ticket 04 finished undoing when it moved `chart-theme` into `app/components/dashboard-chrome/`. The module returns levels; the component owns the colours.

**The lookup note is re-confirmed, with one amendment.** `FRONT_GROUPS` and `BACK_GROUPS` are genuinely different index sets — front has no `back` key at all — so this stays a two-adapters case, not duplication, as candidate #2's grilling concluded. The two one-line modules that wrap them do collapse into one file, which the original did not propose.

**The scope of "consolidate" is fixed at packaging plus the `completed` fix.** Two live findings are recorded below and deliberately not acted on here.

**Ticket 04's observation applies here in reverse.** 04 found that "one public export per logic module" is not a documented standard, just a pattern `lib/muscles/` happens to follow. This ticket adopts that shape *for a stated reason* — the derivation is one thing and should be openable in one file — rather than by inheritance, which is the same justification `build-analytics-view.ts` carries in its own doc comment.

## Solution

One module, `lib/muscles/build-muscle-heatmap.ts`, sole export:

```ts
buildMuscleHeatmap(
    workouts: WorkoutEntry[],
    range: MuscleRange,
    now: Date = new Date(),
): MuscleHeatmapData
```

`MUSCLE_TO_HEATMAP`, the set counting and the 0–4 bucketing become private helpers behind it. Range filtering moves *inside*, as it is in `buildAnalyticsView`, so `/muscles`'s entire derivation is one call and `page.tsx` drops its `filterByDateRange` import. The signature is positional rather than an options bag — it mirrors `filterByDateRange(workouts, range, now)`, and one option does not earn the ceremony that `buildAnalyticsView`'s four do.

`MuscleHeatmapData` joins `types/muscle.ts`, not a new `lib/muscles/types.ts`: components read it, and ticket 03's grilling put cross-layer shapes in `types/`.

```ts
type MuscleHeatmapData = {
    volume: MuscleVolume;
    intensity: MuscleIntensity;
    /** Notion muscle names the heatmap has no group for, with their set counts. */
    unmapped: Record<string, number>;
};
```

Returning both `volume` and `intensity` is required, not redundant: `MuscleHeatmap.tsx:29` reads `volume[muscle]` for its tooltip, so a return of intensity alone breaks it. Carrying both also moves the bucketing off the client, where it has no reason to run.

`unmapped` is returned and asserted in tests but **not rendered**. It makes the drop observable instead of invisible, which is what this ticket's complaint is actually about; it stops short of UI because `/muscles` is an embed with no copy layer, and unlike analytics' timed holds — 17% of the log — this only fires if the Notion schema changes.

The type is `MuscleHeatmapData`, not `MuscleHeatmap`, because `app/components/muscles/MuscleHeatmap.tsx` already exports a component under that name and would be the file importing the type. Renaming the component to free the word was considered and rejected as scope this ticket did not ask for.

## Files

*New:*

- `lib/muscles/build-muscle-heatmap.ts` — the whole derivation, one export
- `lib/muscles/build-muscle-heatmap.test.ts` — first coverage `lib/muscles/` has ever had

*Deleted, folded in as private helpers:*

- `lib/muscles/muscle-mapper.ts`, `calculate-muscle-volume.ts`, `normalize-intensity.ts`

*Deleted outright:*

- `lib/muscles/get-muscle-colors.ts` — pass-through; `MuscleBodyMap` inlines `MUSCLE_COLORS[intensity[muscle]]`

*Moved:*

- `lib/muscles/muscle-colors.ts` → `app/components/muscles/muscle-colors.ts`

*Merged:*

- `lib/muscles/front-lookup.ts` + `back-lookup.ts` → `lib/muscles/lookups.ts`, exporting `FRONT_LOOKUP` and `BACK_LOOKUP`
- `create-lookup.ts` stays as it is. Worth noting for whoever implements: after the merge its only consumer is `lookups.ts`, so the case for it as a separate file is thinner than it was. Leaving it is the grilled decision; folding it in is a judgement call, not a licence.

*Changed:*

- `types/muscle.ts` — gains `MuscleHeatmapData`
- `app/muscles/page.tsx` — one call; `filterByDateRange` and `calculateMuscleVolume` imports gone
- `app/components/muscles/MuscleHeatmap.tsx` — prop `volume: MuscleVolume` becomes `heatmap: MuscleHeatmapData`; `normalizeIntensity` import gone; tooltip reads `heatmap.volume[muscle]`; passes `heatmap.intensity` down
- `app/components/muscles/MuscleBodyMap.tsx` — colour imports now local; signature otherwise unchanged
- `CONTEXT.md` — **done ahead of implementation**, see below

Net: `lib/muscles/` goes from eight files to four, and no stage of the derivation runs on the client.

## Tests

`lib/muscles/build-muscle-heatmap.test.ts`, in the siblings' style — fixture factory, injected `NOW`, behaviour-named sentences grouped by concern:

- **what counts toward a muscle** — every Notion name maps; `Biceps` and `Triceps` both land on `arms`; an unticked set is ignored; `muscle: null` is ignored; an unrecognised name is ignored
- **muscles the log names but the heatmap does not know** — the raw string is reported with its set count; repeats sum; the map is empty when everything mapped
- **intensity levels** — each boundary (0, 1, 5, 10, 15) and the off-by-ones (4→1, 14→3)
- **the selected range** — 7/30/90 against an injected `now`; a set just outside the cutoff is excluded. Thin, but it is what proves the filtering actually moved inside
- **every group is always present** — an untrained group reports 0 sets and level 0. Worth testing despite the type: `MuscleVolume` is built from an object literal, and a group missing from it type-checks nowhere near `MuscleBodyMap` but blanks a limb

Roughly sixteen tests. `npm run typecheck`, `npm test` and `npm run build` must pass.

## CONTEXT.md, and where it leads the code

Two entries were added during grilling (`CONTEXT.md:25-31`), because both terms were resolved there:

- **Muscle volume** — sets logged against a group over a muscle range, with an _Avoid_ line for analytics' "volume", which is weight × reps. Two different quantities sharing a word across `lib/` was the collision worth writing down.
- **Muscle intensity / `MuscleIntensity`** — the five shading buckets. This also closes a dangling reference: the existing **Calendar day** entry cited "the same 0–4 convention as `MuscleIntensity`" against a term the glossary never defined.

**The Muscle volume entry says only completed sets count, and the code does not do that yet.** Until this ticket lands, that sentence describes the settled intent rather than the behaviour. Closing the gap is an acceptance criterion.

## Out of scope

Two live findings, deliberately deferred. Both should be filed rather than lost.

**`/muscles` counts cardio.** No strength filter anywhere in the path, so a run tagged `Muscle: Legs` becomes leg volume. Unlike the `completed` case this is not obviously wrong — arguably it *is* leg work — and `isCardioRecord` needs the whole unfiltered log to work, so folding it in would change this function's contract. It is a product question, not a packaging one.

**The intensity thresholds are range-blind.** 1/5/10/15 sets, whatever range you asked for, so at 90 days nearly every trained group saturates at level 4 and the longest range is the least informative — the heatmap goes uniformly dark green. Scaling the buckets by range is a real decision about what a level *means* and deserves its own grilling, not a rider on a refactor.

## No ADR

The one candidate was the rule that `lib/` returns levels and the component owns the hex. It fails two of the three tests: cheap to reverse, and unsurprising given ticket 04 already settled it for `chart-theme`. A second application of an existing rule is not a decision. `docs/adr/0002` is untouched and still holds.

## Acceptance criteria

- [x] `buildMuscleHeatmap` is the only export of `lib/muscles/build-muscle-heatmap.ts`
- [x] `app/muscles/page.tsx` derives the heatmap in one call and imports neither `filterByDateRange` nor any volume/intensity helper
- [x] No stage of the derivation runs in a `"use client"` component
- [x] Records with `completed: false` contribute no volume, closing the gap `CONTEXT.md` currently leads on
- [x] Unrecognised Notion muscle names are reported on `unmapped` and asserted in tests
- [x] No hex colour is exported from anywhere under `lib/`
- [x] `lib/muscles/` contains exactly `build-muscle-heatmap.ts`, `build-muscle-heatmap.test.ts`, `create-lookup.ts`, `lookups.ts`
- [x] Rendering is unchanged for any log that has no unticked sets in the selected range
- [x] `npm run typecheck`, `npm test` (154 passing) and `npm run build` all pass

## Comments

- 2026-09-08: Grilled via `/grill-with-docs`, 14 questions over four rounds. The tree: scope → return shape → name and home → where colour lives → the lookups → the "volume" collision → drop diagnostics → filtering placement → threshold saturation → coverage → ADR → glossary shape → sequencing → return-type name. Implementation deliberately left to a separate pass. `CONTEXT.md` was written during the session rather than batched, per `/domain-modeling`.
- 2026-09-08: Implemented as specified, test-first. Twenty tests, not the sixteen estimated; the extra four came from the `unmapped` group, where "only the sets that would have counted" turned out to need saying — an unticked or out-of-range set with an unrecognised name is not a dropped set, so it is not reported as one.

  Two notes for the record. `create-lookup.ts` stayed, per the grilled decision, though `lookups.ts` is now its only consumer as predicted. And nothing outside `lib/muscles/` referenced the deleted modules — the pipeline was split across layers but not across features — so the rewiring was the four files this ticket lists and no others.

  The out-of-scope findings are filed as `05-muscles-counts-cardio.md` and `06-range-blind-intensity-thresholds.md`.

- 2026-09-08: `/code-review` run on both axes before committing. The Spec axis found no behavioural defects and confirmed all nine criteria independently; four findings were folded in.

  **The bucket has a name now.** `MuscleLevel = 0 | 1 | 2 | 3 | 4`, with `MuscleIntensity = Record<HeatmapMuscle, MuscleLevel>` on top of it. The union had been written out three times, and the private `level()` helper was reaching it as `MuscleIntensity[HeatmapMuscle]` — indexing a record to recover a concept sitting one line above. `CONTEXT.md`'s **Muscle intensity** entry now names both: a level is one group's bucket, an intensity is all six.

  **`MUSCLE_TO_HEATMAP` is `Partial<Record<...>>`.** Inherited from the deleted `muscle-mapper.ts`, the plain `Record<string, HeatmapMuscle>` typed every lookup as a hit, which made `if (!group)` — the branch this whole ticket is about — a guard TypeScript believed could never fire. It worked at runtime; it now says so in the type.

  Two smaller fixes: the range-blind comment cites ticket 06 by path instead of "see the ticket", and the tooltip's `|| 0` fallback is gone, since `emptyVolume()` guarantees the key that fallback was covering.

  **One finding deliberately not acted on.** The Spec axis observed that `unmapped` has no reader in the running app — the tests assert it, nothing else consumes it — so the day someone adds "Glutes" in Notion the behaviour is what it always was, and it suggested a server-side log, which the "not rendered" decision does not cover. That is a re-opening of a settled question rather than a defect: drop diagnostics were grilled as their own question and the answer was to return the field and stop. Left as decided; worth raising if anyone wants a log, but not a call to make while committing.

