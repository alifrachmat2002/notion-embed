import { MuscleVolume } from "@/types/muscle";

import { MUSCLE_TO_HEATMAP } from "./muscle-mapper";
import { WorkoutEntry } from "@/types/workout";

export function calculateMuscleVolume(workouts: WorkoutEntry[]): MuscleVolume {
    const result: MuscleVolume = {
        chest: 0,
        back: 0,
        shoulders: 0,
        arms: 0,
        core: 0,
        legs: 0,
    };

    for (const workout of workouts) {
        const mapped = MUSCLE_TO_HEATMAP[workout.muscle];

        if (!mapped) continue;

        result[mapped] += 1;
    }

    return result;
}
