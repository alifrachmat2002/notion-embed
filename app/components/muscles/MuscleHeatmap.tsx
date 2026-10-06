"use client";

import { useState } from "react";
import { MuscleBodyMap } from "./MuscleBodyMap";
import { MuscleHeatmapData, HeatmapMuscle } from "@/types/muscle";

type Props = {
    heatmap: MuscleHeatmapData;
};

interface TooltipState {
    name: string;
    sets: number;
    x: number;
    y: number;
}

export function MuscleHeatmap({ heatmap }: Props) {
    const [hoveredMuscle, setHoveredMuscle] = useState<HeatmapMuscle | null>(null);
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    const handleHover = (muscle: HeatmapMuscle, e: React.MouseEvent) => {
        setHoveredMuscle(muscle);
        setTooltip({
            name: muscle.charAt(0).toUpperCase() + muscle.slice(1),
            sets: heatmap.volume[muscle],
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
            <MuscleBodyMap
                intensity={heatmap.intensity}
                hoveredMuscle={hoveredMuscle}
                onHover={handleHover}
                onLeave={handleLeave}
            />

            {tooltip && (
                <div
                    className="fixed pointer-events-none z-50 px-3 py-2 rounded-lg shadow-xl text-sm transition-all duration-75 backdrop-blur-md bg-surface/90 border border-border text-strong flex flex-col gap-0.5"
                    style={{
                        left: `${tooltip.x + 15}px`,
                        top: `${tooltip.y + 15}px`,
                    }}
                >
                    <span className="text-[10px] text-muted font-bold tracking-wider uppercase">
                        {tooltip.name}
                    </span>
                    <span className="text-xs text-foreground">
                        <span className="font-extrabold text-accent text-sm mr-1">
                            {tooltip.sets}
                        </span>
                        {tooltip.sets === 1 ? "set" : "sets"}
                    </span>
                </div>
            )}
        </div>
    );
}

