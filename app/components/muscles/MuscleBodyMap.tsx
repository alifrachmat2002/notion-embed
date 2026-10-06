import { frontPaths } from "@/assets/front-paths";
import { backPaths } from "@/assets/back-paths";
import { FRONT_LOOKUP, BACK_LOOKUP } from "@/lib/muscles/lookups";
import { DEFAULT_BODY_COLOR, MUSCLE_COLORS } from "./muscle-colors";
import { MuscleIntensity, HeatmapMuscle } from "@/types/muscle";

type Props = {
    intensity: MuscleIntensity;
    hoveredMuscle: HeatmapMuscle | null;
    onHover: (muscle: HeatmapMuscle, e: React.MouseEvent) => void;
    onLeave: () => void;
};

const SIDES = [
    { key: "front", viewBox: "0 0 750 1544", paths: frontPaths, lookup: FRONT_LOOKUP },
    { key: "back", viewBox: "789 0 750 1544", paths: backPaths, lookup: BACK_LOOKUP },
] as const;

export function MuscleBodyMap({ intensity, hoveredMuscle, onHover, onLeave }: Props) {
    return (
        <div className="flex justify-center gap-4">
            {SIDES.map((side) => (
                <div key={side.key} className="w-full max-w-[260px]">
                    <svg
                        viewBox={side.viewBox}
                        className="h-full w-full"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <rect width="100%" height="100%" fill="none" />

                        {side.paths.map((d, index) => {
                            const muscle = side.lookup[index] as HeatmapMuscle | undefined;

                            const fill = muscle
                                ? MUSCLE_COLORS[intensity[muscle]]
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
                                        stroke: isHovered ? "var(--strong)" : "none",
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
                </div>
            ))}
        </div>
    );
}
