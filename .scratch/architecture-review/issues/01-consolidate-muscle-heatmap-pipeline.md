Status: ready-for-agent

# Consolidate the muscle-heatmap pipeline into one module

From the 2026-08-31 codebase architecture review (candidate #3, "Worth exploring"). Not yet grilled — walk the `/grilling` decision tree before implementing, the way candidates #1, #2, and #4 from the same review were.

## Files

- `lib/muscles/muscle-mapper.ts` — `MUSCLE_TO_HEATMAP`, Notion muscle name → heatmap group
- `lib/muscles/calculate-muscle-volume.ts` — counts workouts per heatmap group, silently drops unmapped muscles (`if (!mapped) continue`)
- `lib/muscles/normalize-intensity.ts` — volume → 0-4 intensity level
- `lib/muscles/get-muscle-colors.ts` — one-line pass-through: `getMuscleColor(level) { return MUSCLE_COLORS[level]; }`
- `lib/muscles/muscle-colors.ts` — the color table
- `lib/muscles/create-lookup.ts`, `front-lookup.ts`, `back-lookup.ts` — SVG path-index → muscle name (see note below)

## Problem

Answering "why is this muscle uncolored on the heatmap" means tracing 6+ files. The real bugs live in the silent-drop points between stages — an unrecognized Notion muscle string dropped in `calculate-muscle-volume.ts:19`, an SVG path with no lookup entry falling back to the default color in `MuscleBodyMap.tsx` — and neither drop is logged.

`get-muscle-colors.ts` is a pure pass-through: deleting it and inlining `MUSCLE_COLORS[level]` at its call site loses nothing (deletion test: complexity vanishes).

## Solution sketch

One module, e.g. `lib/muscles/heatmap.ts`, exporting `buildMuscleHeatmap(workouts: WorkoutEntry[]): { front: ...; back: ... }` (or a smaller `MuscleIntensity`-shaped return, whatever the grilling settles on). Volume, intensity, and color computation become private helpers behind that one interface instead of separate public modules, so a coloring bug has one file to open and tests exercise one public function.

## Note: front-lookup.ts / back-lookup.ts are probably out of scope

When candidate #2 (Front/BackMuscleMap duplication) was grilled and implemented, the conclusion was that `front-lookup.ts`/`back-lookup.ts` hold genuinely different data (different SVG index → muscle mappings per side) — a real "two adapters" case, not duplication. `create-lookup.ts` is a shared 11-line generic helper, which is thin but not obviously worth collapsing further. Whoever grills this candidate should re-confirm that reasoning still holds rather than assume it, but the volume/intensity/color chain is the part worth deepening, not the lookup tables.

## Deletion test

Mixed: volume/intensity logic earns its keep as real transformation steps (deleting them relocates real logic to callers). The file-per-function *packaging* (`get-muscle-colors.ts` especially) is where complexity truly vanishes on deletion.

## Severity

Worth exploring.
