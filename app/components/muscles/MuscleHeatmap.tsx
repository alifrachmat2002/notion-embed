"use client";

import { useState } from "react";
import { FrontMuscleMap } from "./FrontMuscleMap";
import { BackMuscleMap } from "./BackMuscleMap";
import { MuscleVolume, HeatmapMuscle } from "@/types/muscle";
import { normalizeIntensity } from "@/lib/muscles/normalize-intensity";

type Props = {
    volume: MuscleVolume;
};

interface TooltipState {
    name: string;
    sets: number;
    x: number;
    y: number;
}

export function MuscleHeatmap({ volume }: Props) {
    const intensity = normalizeIntensity(volume);
    const [hoveredMuscle, setHoveredMuscle] = useState<HeatmapMuscle | null>(null);
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    const handleHover = (muscle: HeatmapMuscle, e: React.MouseEvent) => {
        setHoveredMuscle(muscle);
        setTooltip({
            name: muscle.charAt(0).toUpperCase() + muscle.slice(1),
            sets: volume[muscle] || 0,
            x: e.clientX,
            y: e.clientY,
        });
    };

    const handleLeave = () => {
        setHoveredMuscle(null);
        setTooltip(null);
    };

    return (
        <div className="w-full relative">
            <div className="flex justify-center gap-4">
                <div className="w-full max-w-[260px]">
                    <FrontMuscleMap
                        intensity={intensity}
                        hoveredMuscle={hoveredMuscle}
                        onHover={handleHover}
                        onLeave={handleLeave}
                    />
                </div>

                <div className="w-full max-w-[260px]">
                    <BackMuscleMap
                        intensity={intensity}
                        hoveredMuscle={hoveredMuscle}
                        onHover={handleHover}
                        onLeave={handleLeave}
                    />
                </div>
            </div>

            {tooltip && (
                <div
                    className="fixed pointer-events-none z-50 px-3 py-2 rounded-lg shadow-xl text-sm transition-all duration-75 backdrop-blur-md bg-neutral-900/90 border border-neutral-700/40 text-white flex flex-col gap-0.5"
                    style={{
                        left: `${tooltip.x + 15}px`,
                        top: `${tooltip.y + 15}px`,
                    }}
                >
                    <span className="text-[10px] text-neutral-400 font-bold tracking-wider uppercase">
                        {tooltip.name}
                    </span>
                    <span className="text-xs text-neutral-200">
                        <span className="font-extrabold text-emerald-400 text-sm mr-1">
                            {tooltip.sets}
                        </span>
                        {tooltip.sets === 1 ? "set" : "sets"}
                    </span>
                </div>
            )}
        </div>
    );
}

