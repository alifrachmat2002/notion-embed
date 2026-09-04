"use client";

import {
    CartesianGrid,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
    ZAxis,
} from "recharts";
import { formatPace } from "@/lib/cardio/format-pace";
import { PacePoint } from "@/lib/cardio/types";
import {
    AXIS,
    GRID,
    PACE,
    shortDate,
    tooltipStyle,
} from "../analytics/chart-theme";

type Mark = PacePoint & { t: number };

/**
 * Pace over time, with run length encoded as mark size.
 *
 * Two things would mislead if left alone. Pace is minutes per kilometre, so
 * lower is faster — the axis is inverted to keep a rising chart meaning
 * progress, as it does everywhere else in the app. And runs alternate roughly
 * 4 km and 7 km, where the longer run is always the slower one; sizing the
 * marks by distance lets "slower because further" be read off the chart rather
 * than mistaken for a bad week.
 *
 * Unlike the rep scatter this draws a single series. That chart splits by
 * weight because weights are genuinely discrete (5, 6.5, 7); distances are
 * continuous (3.53 … 7.00) and would yield a dozen near-identical series.
 */
export function PaceChart({ data }: { data: PacePoint[] }) {
    const marks = data.map(
        (point): Mark => ({
            ...point,
            t: Date.parse(`${point.date}T00:00:00Z`),
        }),
    );

    return (
        <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 4, right: 8, bottom: 0, left: 12 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                <XAxis
                    type="number"
                    dataKey="t"
                    domain={["dataMin - 86400000", "dataMax + 86400000"]}
                    tickFormatter={(t: number) =>
                        shortDate(new Date(t).toISOString().slice(0, 10))
                    }
                    stroke={AXIS}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                />
                <YAxis
                    type="number"
                    dataKey="paceMinPerKm"
                    // Inverted: a lower min/km is a faster run, and every other
                    // chart here reads upward as improvement.
                    reversed
                    domain={["dataMin - 0.2", "dataMax + 0.2"]}
                    tickFormatter={formatPace}
                    stroke={AXIS}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width="auto"
                />
                {/* Marks scale with how far the run was. */}
                <ZAxis type="number" dataKey="distanceKm" range={[45, 170]} />
                <Tooltip
                    {...tooltipStyle}
                    cursor={{ strokeDasharray: "3 3", stroke: GRID }}
                    content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;

                        const mark = payload[0].payload as Mark;

                        return (
                            <div className="rounded-lg border border-white/10 bg-[#1c1c1e] px-3 py-2 text-xs text-white">
                                <p className="text-white/50">
                                    {shortDate(mark.date)}
                                </p>
                                <p className="mt-0.5">
                                    {formatPace(mark.paceMinPerKm)} /km
                                </p>
                                <p className="text-white/50">
                                    {mark.distanceKm} km in{" "}
                                    {Math.round(mark.durationMin)} min
                                </p>
                            </div>
                        );
                    }}
                />
                <Scatter name="Pace" data={marks} fill={PACE} />
            </ScatterChart>
        </ResponsiveContainer>
    );
}
