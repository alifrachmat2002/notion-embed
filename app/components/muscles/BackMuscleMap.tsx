import { backPaths } from "@/assets/back-paths";
import { BACK_LOOKUP } from "@/lib/muscles/back-lookup";
import { getMuscleColor } from "@/lib/muscles/get-muscle-colors";
import { DEFAULT_BODY_COLOR } from "@/lib/muscles/muscle-colors";
import { MuscleIntensity, HeatmapMuscle } from "@/types/muscle";

type Props = {
    intensity: MuscleIntensity;
    hoveredMuscle: HeatmapMuscle | null;
    onHover: (muscle: HeatmapMuscle, e: React.MouseEvent) => void;
    onLeave: () => void;
};

export function BackMuscleMap({ intensity, hoveredMuscle, onHover, onLeave }: Props) {
    return (
        <svg
            viewBox="789 0 750 1544"
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
        >
            <rect width="100%" height="100%" fill="none" />

            {backPaths.map((d, index) => {
                const muscle = BACK_LOOKUP[index] as HeatmapMuscle | undefined;

                const fill = muscle
                    ? getMuscleColor(intensity[muscle])
                    : DEFAULT_BODY_COLOR;

                const isHovered = muscle && muscle === hoveredMuscle;
                const isDimmed = hoveredMuscle && muscle !== hoveredMuscle;

                return (
                    <path
                        key={index}
                        d={d}
                        fill={fill}
                        className="transition-all duration-200 cursor-pointer"
                        style={{
                            opacity: isDimmed ? 0.35 : 1,
                            stroke: isHovered ? "#ffffff" : "none",
                            strokeWidth: isHovered ? 4 : 0,
                            strokeLinejoin: "round",
                        }}
                        onMouseEnter={muscle ? (e) => onHover(muscle, e) : undefined}
                        onMouseMove={muscle ? (e) => onHover(muscle, e) : undefined}
                        onMouseLeave={muscle ? onLeave : undefined}
                    />
                );
            })}
        </svg>
    );
}

