import { ExerciseKind, ExerciseStats, Exclusions } from "@/lib/analytics/types";
import { formatStatValue } from "@/lib/format-stat-value";
import { StatCardGrid } from "../dashboard-chrome/stat-card-grid";

type Props = {
    stats: ExerciseStats;
    kind: ExerciseKind;
    exclusions: Exclusions;
};

export function StatCards({ stats, kind, exclusions }: Props) {
    const excluded = exclusions.holds + exclusions.missingReps;

    const cards = [
        { label: "Sessions", value: String(stats.sessions) },
        { label: "Sets", value: String(stats.sets) },
        {
            label: "Volume",
            value: formatStatValue(stats.volume),
            // The unit genuinely differs: bodyweight work is counted in reps,
            // since weight x reps would be zero for every set.
            unit: kind === "bodyweight" ? "reps" : "kg",
        },
        {
            label: "Max Weight",
            value: formatStatValue(stats.maxWeight),
            unit: "kg",
        },
    ];

    return (
        <StatCardGrid
            cards={cards}
            footnote={
                excluded > 0
                    ? `${excluded} of ${stats.sets} sets excluded from these figures${describe(exclusions)}.`
                    : null
            }
        />
    );
}

/**
 * Says which records were withheld and why, so a set count that disagrees with
 * the totals above it reads as an explanation rather than a bug — and points at
 * exactly what to go and fill in.
 */
function describe({ holds, missingReps }: Exclusions): string {
    const reasons = [
        holds > 0 && `${holds} timed ${holds === 1 ? "hold" : "holds"}`,
        missingReps > 0 && `${missingReps} with no reps recorded`,
    ].filter(Boolean);

    return reasons.length ? ` (${reasons.join(", ")})` : "";
}
