import { ReactNode } from "react";

export type StatCard = {
    label: string;
    value: string;
    /** Shown small beside the value: `kg`, `km`, `/km`, `reps`. */
    unit?: string;
};

type Props = {
    cards: StatCard[];
    /**
     * A line under the grid, for a dashboard to say what its figures leave
     * out. Written by the caller: holds and missing reps are not the same
     * omission as runs with no distance, and neither sentence generalises.
     */
    footnote?: ReactNode;
};

/**
 * The row of headline figures at the top of a dashboard.
 *
 * Layout only — it knows nothing of sets, runs, holds or distances, and takes
 * every value already formatted, because whether to abbreviate is the
 * dashboard's decision rather than the grid's.
 */
export function StatCardGrid({ cards, footnote }: Props) {
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

            {footnote && (
                <p className="mt-2 text-xs text-white/40">{footnote}</p>
            )}
        </div>
    );
}
