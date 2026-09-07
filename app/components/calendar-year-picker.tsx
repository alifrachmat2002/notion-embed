"use client";

type Props = {
    years: number[];
    selected: number;
    onSelect: (year: number) => void;
};

/**
 * The consistency calendar's year, on `/analytics` and `/cardio`.
 *
 * Smaller than the period buttons above it, and rendered inside the panel it
 * governs: the period moves every chart on the page, this moves one calendar,
 * and a control that looks global but is not is worse than no control at all.
 */
export function CalendarYearPicker({ years, selected, onSelect }: Props) {
    return (
        <div className="flex gap-1">
            {years.map((year) => {
                const active = year === selected;

                return (
                    <button
                        key={year}
                        type="button"
                        onClick={() => onSelect(year)}
                        aria-pressed={active}
                        className={[
                            "h-7 rounded-md border border-white/10 px-2 text-xs transition",
                            active
                                ? "bg-white/10 text-white"
                                : "text-white/50 hover:bg-white/5 hover:text-white",
                        ].join(" ")}
                    >
                        {year}
                    </button>
                );
            })}
        </div>
    );
}
