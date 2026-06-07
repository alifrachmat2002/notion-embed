export type HeatmapMuscle =
    | "chest"
    | "back"
    | "shoulders"
    | "arms"
    | "core"
    | "legs";

export type MuscleVolume = Record<HeatmapMuscle, number>;

export type MuscleIntensity = Record<HeatmapMuscle, 0 | 1 | 2 | 3 | 4>;
