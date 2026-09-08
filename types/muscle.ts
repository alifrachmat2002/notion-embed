export type HeatmapMuscle =
    | "chest"
    | "back"
    | "shoulders"
    | "arms"
    | "core"
    | "legs";

export type MuscleVolume = Record<HeatmapMuscle, number>;

/** One group's shading bucket, `0` (untrained) through `4` (heaviest). */
export type MuscleLevel = 0 | 1 | 2 | 3 | 4;

/** Every group's level at once — what the body map paints from. */
export type MuscleIntensity = Record<HeatmapMuscle, MuscleLevel>;

/**
 * The heatmap, derived. Volume rides along with intensity because the tooltip
 * reports set counts, and `unmapped` names the Notion muscles the log used and
 * the heatmap has no group for, so a schema change is visible rather than
 * silent.
 */
export type MuscleHeatmapData = {
    volume: MuscleVolume;
    intensity: MuscleIntensity;
    /** Notion muscle names the heatmap has no group for, with their set counts. */
    unmapped: Record<string, number>;
};
