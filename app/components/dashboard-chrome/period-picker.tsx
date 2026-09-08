"use client";

/**
 * The periods a dashboard offers, longest last.
 *
 * UI vocabulary, not a filtering rule: `lib/` takes a `DateRangeValue` and
 * admits any day count, and this is the fixed set a dashboard puts on screen.
 * `/muscles` offers its own 7/30/90 through `RangeSelector`, and the two stay
 * apart down to their names — see `docs/adr/0002`.
 */
export const DASHBOARD_PERIODS = [28, 90, 180, 365, "all"] as const;

export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number];

/** Keyed by the period written out, so `28` and `"all"` look up alike. */
export const PERIOD_LABELS: Record<`${DashboardPeriod}`, string> = {
    "28": "4 weeks",
    "90": "3 months",
    "180": "6 months",
    "365": "1 year",
    all: "All time",
};

type Props = {
    periods: readonly DashboardPeriod[];
    labels: Record<`${DashboardPeriod}`, string>;
    selected: DashboardPeriod;
    onChange: (period: DashboardPeriod) => void;
};

/**
 * The period control, governing every figure on a dashboard.
 *
 * Sits in the page's control row rather than inside a panel, because that is
 * what tells a reader it moves the whole page — the calendar's year picker is
 * smaller and lives in the panel it governs, and the difference is the point.
 */
export function PeriodPicker({ periods, labels, selected, onChange }: Props) {
    return (
        <div className="flex gap-1">
            {periods.map((value) => (
                <button
                    key={String(value)}
                    type="button"
                    onClick={() => onChange(value)}
                    className={[
                        "h-9 rounded-md border border-white/10 px-3 text-sm transition",
                        selected === value
                            ? "bg-white/10 text-white"
                            : "text-white/50 hover:bg-white/5 hover:text-white",
                    ].join(" ")}
                >
                    {labels[`${value}`]}
                </button>
            ))}
        </div>
    );
}
