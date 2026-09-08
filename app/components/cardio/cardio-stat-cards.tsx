import { formatPace } from "@/lib/cardio/format-pace";
import { CardioExclusions, CardioStats } from "@/lib/cardio/types";
import { formatStatValue } from "@/lib/format-stat-value";
import { StatCardGrid } from "../dashboard-chrome/stat-card-grid";

type Props = {
    stats: CardioStats;
    exclusions: CardioExclusions;
};

export function CardioStatCards({ stats, exclusions }: Props) {
    const excluded = exclusions.missingDistance + exclusions.missingDuration;

    const cards = [
        // Deliberately unabbreviated: a run count never reaches the thousands,
        // and a log this size reading "10.0k" would be stranger than a wide card.
        { label: "Runs", value: String(stats.runs) },
        { label: "Distance", value: formatStatValue(stats.totalKm), unit: "km" },
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
        <StatCardGrid
            cards={cards}
            footnote={
                excluded > 0
                    ? `${excluded} of ${stats.runs} runs excluded from these figures${describe(exclusions)}.`
                    : null
            }
        />
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
