"use client";

import {
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
    ZAxis,
} from "recharts";
import { ExerciseKind, RepPoint } from "@/lib/analytics/types";
import { AXIS, GRID, shortDate, tooltipStyle, weightColour } from "./chart-theme";

type Mark = RepPoint & { t: number };

/**
 * Reps over time, one series per weight.
 *
 * Splitting by weight is the point: "more reps at the same weight" becomes a
 * direct read along one series, and a session where reps fell because the
 * weight rose shows as a jump to a different series rather than a drop.
 */
export function RepChart({
    data,
    kind,
}: {
    data: RepPoint[];
    kind: ExerciseKind;
}) {
    const weights = [...new Set(data.map((point) => point.weight))].sort(
        (a, b) => a - b,
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
                    dataKey="reps"
                    stroke={AXIS}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    // No unit suffix: ScatterChart under-reserves axis width
                    // and a "16 reps" label overflows the surface. The panel
                    // title, hint and tooltip all name the unit already.
                    width="auto"
                />
                {/* Marks scale with how many sets they stand for. */}
                <ZAxis type="number" dataKey="setCount" range={[45, 170]} />
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
                                    {kind === "bodyweight"
                                        ? `${mark.reps} reps`
                                        : `${mark.weight} kg × ${mark.reps} reps`}
                                </p>
                                <p className="text-white/50">
                                    {mark.setCount}{" "}
                                    {mark.setCount === 1 ? "set" : "sets"}
                                </p>
                            </div>
                        );
                    }}
                />
                {weights.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}

                {weights.map((weight, index) => (
                    <Scatter
                        key={weight}
                        name={kind === "bodyweight" ? "Reps" : `${weight} kg`}
                        data={data
                            .filter((point) => point.weight === weight)
                            .map(
                                (point): Mark => ({
                                    ...point,
                                    t: Date.parse(`${point.date}T00:00:00Z`),
                                }),
                            )}
                        fill={weightColour(index)}
                    />
                ))}
            </ScatterChart>
        </ResponsiveContainer>
    );
}
