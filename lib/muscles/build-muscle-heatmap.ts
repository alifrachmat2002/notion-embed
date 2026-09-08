import { filterByDateRange } from "@/lib/filter-by-date-range";
import { MuscleRange } from "@/types/date-range";
import {
    HeatmapMuscle,
    MuscleHeatmapData,
    MuscleIntensity,
    MuscleLevel,
    MuscleVolume,
} from "@/types/muscle";
import { WorkoutEntry } from "@/types/workout";

/**
 * Everything the muscle heatmap renders, from one call.
 *
 * This is the module's only export by design. The derivation used to run in
 * three places at once — the counting on the server, the bucketing inside a
 * client component, the colour in its child — so answering "why is this muscle
 * pale" meant reading across a serialization boundary. Range filtering lives
 * in here for the same reason: `/muscles` asks one question and gets one
 * answer.
 *
 * Colour is deliberately not part of that answer. Levels are what the
 * derivation knows; which hex paints a level, and what paints the paths that
 * are no muscle at all, is the body map's vocabulary.
 */
export function buildMuscleHeatmap(
    workouts: WorkoutEntry[],
    range: MuscleRange,
    now: Date = new Date(),
): MuscleHeatmapData {
    const volume = emptyVolume();
    const unmapped: Record<string, number> = {};

    for (const workout of filterByDateRange(workouts, range, now)) {
        if (!workout.completed) continue;
        if (!workout.muscle) continue;

        const group = MUSCLE_TO_HEATMAP[workout.muscle];

        if (!group) {
            unmapped[workout.muscle] = (unmapped[workout.muscle] ?? 0) + 1;
            continue;
        }

        volume[group] += 1;
    }

    return { volume, intensity: toIntensity(volume), unmapped };
}

/**
 * The Notion `Muscle` select, in the six groups the body map can shade.
 *
 * Biceps and Triceps share `arms` because the SVG draws one arm group, not two
 * — the collapse is the illustration's, not the log's. `Muscle` is a select, so
 * an option added in Notion lands here as an unrecognised name rather than a
 * type error, which is what `unmapped` exists to say out loud.
 */
const MUSCLE_TO_HEATMAP: Partial<Record<string, HeatmapMuscle>> = {
    Chest: "chest",
    Back: "back",
    Shoulders: "shoulders",
    Biceps: "arms",
    Triceps: "arms",
    Core: "core",
    Legs: "legs",
};

/**
 * Every group at zero, so an untrained muscle reports 0 sets rather than going
 * missing and blanking a limb.
 */
function emptyVolume(): MuscleVolume {
    return { chest: 0, back: 0, shoulders: 0, arms: 0, core: 0, legs: 0 };
}

/**
 * Set counts, in the five shading buckets.
 *
 * The thresholds ignore the range, so ninety days saturates where seven reads
 * well. Deliberately left as it was — see
 * `.scratch/architecture-review/issues/06-range-blind-intensity-thresholds.md`.
 */
function toIntensity(volume: MuscleVolume): MuscleIntensity {
    const intensity = {} as MuscleIntensity;

    for (const [muscle, sets] of Object.entries(volume) as [
        HeatmapMuscle,
        number,
    ][]) {
        intensity[muscle] = level(sets);
    }

    return intensity;
}

function level(sets: number): MuscleLevel {
    if (sets >= 15) return 4;
    if (sets >= 10) return 3;
    if (sets >= 5) return 2;
    if (sets >= 1) return 1;

    return 0;
}
