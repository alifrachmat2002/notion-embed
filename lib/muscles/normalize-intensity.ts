import { MuscleVolume, MuscleIntensity } from "@/types/muscle";

export function normalizeIntensity(volume: MuscleVolume): MuscleIntensity {
    const result = {} as MuscleIntensity;

    for (const [muscle, sets] of Object.entries(volume)) {
        let level: 0 | 1 | 2 | 3 | 4 = 0;

        if (sets >= 15) level = 4;
        else if (sets >= 10) level = 3;
        else if (sets >= 5) level = 2;
        else if (sets >= 1) level = 1;

        result[muscle as keyof MuscleIntensity] = level;
    }

    return result;
}
