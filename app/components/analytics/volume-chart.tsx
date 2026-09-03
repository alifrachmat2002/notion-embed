"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { ExerciseKind, VolumePoint } from "@/lib/analytics/types";
import { AXIS, GRID, VOLUME, shortDate, tooltipStyle } from "./chart-theme";

export function VolumeChart({
    data,
    kind,
}: {
    data: VolumePoint[];
    kind: ExerciseKind;
}) {
    const unit = kind === "bodyweight" ? "reps" : "kg";

    return (
        <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 12 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
                <XAxis
                    dataKey="date"
                    tickFormatter={shortDate}
                    stroke={AXIS}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                />
                <YAxis
                    stroke={AXIS}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    unit={` ${unit}`}
                    width="auto"
                />
                <Tooltip
                    {...tooltipStyle}
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    labelFormatter={shortDate}
                    formatter={(value) => [`${value} ${unit}`, "Session volume"]}
                />
                <Bar dataKey="volume" fill={VOLUME} radius={[3, 3, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
