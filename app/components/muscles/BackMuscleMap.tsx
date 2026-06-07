import { backPaths } from "@/assets/back-paths";
import { BACK_LOOKUP } from "@/lib/muscles/back-lookup";
import { getMuscleColor } from "@/lib/muscles/get-muscle-colors";
import { DEFAULT_BODY_COLOR } from "@/lib/muscles/muscle-colors";
import { MuscleIntensity } from "@/types/muscle";

type Props = {
    intensity: MuscleIntensity;
};

export function BackMuscleMap({ intensity }: Props) {
    return (
        <svg
            viewBox="789 0 750 1544"
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
        >
            <rect width="100%" height="100%" fill="none" />

            {backPaths.map((d, index) => {
                const muscle = BACK_LOOKUP[index] as keyof MuscleIntensity | undefined;

                const fill = muscle
                    ? getMuscleColor(intensity[muscle])
                    : DEFAULT_BODY_COLOR;

                return <path key={index} d={d} fill={fill} />;
            })}
        </svg>
    );
}
