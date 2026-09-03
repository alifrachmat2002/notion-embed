import { ExerciseKind, ExerciseStats, Exclusions } from "@/lib/analytics/types";

type Props = {
    stats: ExerciseStats;
    kind: ExerciseKind;
    exclusions: Exclusions;
};

function format(value: number): string {
    if (value >= 10_000) return `${(value / 1000).toFixed(1)}k`;

    return String(Math.round(value * 10) / 10);
}

export function StatCards({ stats, kind, exclusions }: Props) {
    const excluded = exclusions.holds + exclusions.missingReps;

    const cards = [
        { label: "Sessions", value: String(stats.sessions) },
        { label: "Sets", value: String(stats.sets) },
        {
            label: "Volume",
            value: format(stats.volume),
            // The unit genuinely differs: bodyweight work is counted in reps,
            // since weight x reps would be zero for every set.
            unit: kind === "bodyweight" ? "reps" : "kg",
        },
        { label: "Max Weight", value: format(stats.maxWeight), unit: "kg" },
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
                    {excluded} of {stats.sets} sets excluded from these figures
                    {describe(exclusions)}.
                </p>
            )}
        </div>
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
