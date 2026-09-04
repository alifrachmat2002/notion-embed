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
import { WeeklyPoint } from "@/lib/cardio/types";
import {
    AXIS,
    GRID,
    WEEKLY_DISTANCE,
    shortDate,
    tooltipStyle,
} from "../analytics/chart-theme";

/**
 * Kilometres per week. Weeks with no runs are drawn as empty columns rather
 * than closed up, so a break in training reads as a gap instead of vanishing.
 */
export function WeeklyDistanceChart({ data }: { data: WeeklyPoint[] }) {
    return (
        <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 12 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
                <XAxis
                    dataKey="weekStart"
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
                    unit=" km"
                    width="auto"
                />
                <Tooltip
                    {...tooltipStyle}
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;

                        const week = payload[0].payload as WeeklyPoint;

                        return (
                            <div className="rounded-lg border border-white/10 bg-[#1c1c1e] px-3 py-2 text-xs text-white">
                                <p className="text-white/50">
                                    Week of {shortDate(week.weekStart)}
                                </p>
                                <p className="mt-0.5">{week.km} km</p>
                                <p className="text-white/50">
                                    {week.runs} {week.runs === 1 ? "run" : "runs"}
                                    {week.runs > 0 &&
                                        `, ${Math.round(week.minutes)} min`}
                                </p>
                            </div>
                        );
                    }}
                />
                <Bar
                    dataKey="km"
                    fill={WEEKLY_DISTANCE}
                    radius={[3, 3, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
