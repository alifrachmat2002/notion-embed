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
        <div className="w-full">
            <div className="flex justify-center gap-4">
                <div className="w-full max-w-[260px]">
                    <FrontMuscleMap intensity={intensity} />
                </div>

                <div className="w-full max-w-[260px]">
                    <BackMuscleMap intensity={intensity} />
                </div>
            </div>
        </div>
    );
}
