import { FrontMuscleMap } from "./FrontMuscleMap";
import { BackMuscleMap } from "./BackMuscleMap";
import { MuscleVolume } from "@/types/muscle";

import { normalizeIntensity } from "@/lib/muscles/normalize-intensity";

type Props = {
    volume: MuscleVolume;
};

export function MuscleHeatmap({ volume }: Props) {
    const intensity = normalizeIntensity(volume);

    return (
        <div className="flex gap-2">
            <div className="w-1/2 max-w-[360px]">
                <FrontMuscleMap intensity={intensity} />
            </div>

            <div className="w-1/2 max-w-[360px]">
                <BackMuscleMap intensity={intensity} />
            </div>
        </div>
    );
}
