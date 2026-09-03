"use client";

import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { WeightPoint } from "@/lib/analytics/types";
import {
    AXIS,
    GRID,
    MAX_WEIGHT,
    STRENGTH_INDEX,
    shortDate,
    tooltipStyle,
} from "./chart-theme";

export function WeightChart({ data }: { data: WeightPoint[] }) {
    return (
        <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 12 }}>
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
                    unit=" kg"
                    width="auto"
                />
                <Tooltip
                    {...tooltipStyle}
                    labelFormatter={shortDate}
                    formatter={(value, name) => [`${value} kg`, name]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                    type="monotone"
                    dataKey="maxWeight"
                    name="Max weight"
                    stroke={MAX_WEIGHT}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                />
                <Line
                    type="monotone"
                    dataKey="strengthIndex"
                    name="Strength index (est.)"
                    stroke={STRENGTH_INDEX}
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    dot={{ r: 3 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
