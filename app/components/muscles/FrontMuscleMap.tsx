import { frontPaths } from "@/assets/front-paths";
import { FRONT_LOOKUP } from "@/lib/muscles/front-lookup";
import { getMuscleColor } from "@/lib/muscles/get-muscle-colors";
import { DEFAULT_BODY_COLOR } from "@/lib/muscles/muscle-colors";
import { MuscleIntensity } from "@/types/muscle";

type Props = {
    intensity: MuscleIntensity;
};

export function FrontMuscleMap({ intensity }: Props) {
    return (
        <svg
            viewBox="0 0 750 1544"
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
        >
            <rect width="100%" height="100%" fill="none" />

            {frontPaths.map((d, index) => {
                const muscle = FRONT_LOOKUP[index] as keyof MuscleIntensity | undefined;

                const fill = muscle
                    ? getMuscleColor(intensity[muscle])
                    : DEFAULT_BODY_COLOR;

                return <path key={index} d={d} fill={fill} />;
            })}
        </svg>
    );
}
