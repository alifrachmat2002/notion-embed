import { formatPace } from "@/lib/cardio/format-pace";
import { CardioExclusions, CardioStats } from "@/lib/cardio/types";

type Props = {
    stats: CardioStats;
    exclusions: CardioExclusions;
};

function format(value: number): string {
    if (value >= 10_000) return `${(value / 1000).toFixed(1)}k`;

    return String(Math.round(value * 10) / 10);
}

export function CardioStatCards({ stats, exclusions }: Props) {
    const excluded = exclusions.missingDistance + exclusions.missingDuration;

    const cards = [
        { label: "Runs", value: String(stats.runs) },
        { label: "Distance", value: format(stats.totalKm), unit: "km" },
        {
            label: "Avg Pace",
            value: formatPace(stats.avgPaceMinPerKm),
            unit: "/km",
        },
        {
            label: "Best Pace",
            value: formatPace(stats.bestPaceMinPerKm),
            unit: "/km",
        },
    ];

    return (
        <div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
                    >
                        <p className="text-xs text-white/40">{card.label}</p>
                        <p className="mt-1 text-2xl text-white tabular-nums">
                            {card.value}
                            {card.unit && (
                                <span className="ml-1 text-sm text-white/40">
                                    {card.unit}
                                </span>
                            )}
                        </p>
                    </div>
                ))}
            </div>

            {excluded > 0 && (
                <p className="mt-2 text-xs text-white/40">
                    {excluded} of {stats.runs} runs excluded from these figures
                    {describe(exclusions)}.
                </p>
            )}
        </div>
    );
}

/**
 * Says which runs were withheld and why, so a run count that disagrees with the
 * distance above it reads as an explanation rather than a bug — and points at
 * exactly what to go and fill in.
 */
function describe({
    missingDistance,
    missingDuration,
}: CardioExclusions): string {
    const reasons = [
        missingDistance > 0 && `${missingDistance} with no distance recorded`,
        missingDuration > 0 && `${missingDuration} with no duration recorded`,
    ].filter(Boolean);

    return reasons.length ? ` (${reasons.join(", ")})` : "";
}
