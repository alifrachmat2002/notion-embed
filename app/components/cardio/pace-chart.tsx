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
import { formatPace } from "@/lib/cardio/format-pace";
import { runTypeLabel, toPaceSeries } from "@/lib/cardio/pace-series";
import { PacePoint } from "@/lib/cardio/types";
import {
    AXIS,
    GRID,
    runTypeColour,
    shortDate,
    tooltipStyle,
} from "../dashboard-chrome/chart-theme";

type Mark = PacePoint & { t: number };

/**
 * Pace over time, coloured by run type, with run length encoded as mark size.
 *
 * Three things would mislead if left alone. Pace is minutes per kilometre, so
 * lower is faster — the axis is inverted to keep a rising chart meaning
 * progress, as it does everywhere else in the app. Runs alternate roughly 4 km
 * and 7 km, where the longer run is always the slower one; sizing the marks by
 * distance lets "slower because further" be read off the chart rather than
 * mistaken for a bad week. And a run has an *intent* — easy, tempo, interval,
 * long — which pace alone hides: two marks at the same height can be a good
 * easy run and a poor tempo one, so colour carries the tag.
 *
 * Splitting on the tag rather than on distance is the point. An earlier version
 * drew one series because bucketing a continuous distance would have invented a
 * dozen near-identical groups; the workout type is already discrete, already
 * recorded, and says what the distance only implied.
 */
export function PaceChart({ data }: { data: PacePoint[] }) {
    const series = toPaceSeries(data);

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
                            <div className="rounded-lg border border-border bg-control px-3 py-2 text-xs text-strong">
                                <p className="text-dim">
                                    {shortDate(mark.date)}
                                </p>
                                <p className="mt-0.5">
                                    {formatPace(mark.paceMinPerKm)} /km
                                </p>
                                <p className="text-dim">
                                    {mark.distanceKm} km in{" "}
                                    {Math.round(mark.durationMin)} min
                                </p>
                                {/* Named here as well as in the legend: the
                                    legend is suppressed when the period holds
                                    one type, and the tag would then be
                                    readable nowhere on the chart. */}
                                <p className="mt-0.5 text-dim">
                                    {runTypeLabel(mark.workoutType)}
                                </p>
                            </div>
                        );
                    }}
                />
                {/* One type is the whole chart; a one-row legend labels nothing
                    the panel hint has not already said. Matches RepChart. */}
                {series.length > 1 && (
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                )}

                {series.map(({ label, points }) => (
                    <Scatter
                        key={label}
                        name={label}
                        data={points.map(
                            (point): Mark => ({
                                ...point,
                                t: Date.parse(`${point.date}T00:00:00Z`),
                            }),
                        )}
                        fill={runTypeColour(label)}
                    />
                ))}
            </ScatterChart>
        </ResponsiveContainer>
    );
}
