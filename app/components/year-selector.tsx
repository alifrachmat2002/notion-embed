import Link from "next/link";

type Props = {
    years: number[];
    selected: number;
};

/**
 * The consistency calendar's year, on `/`.
 *
 * Links rather than buttons because `/` builds its calendar on the server: the
 * year is a query param, so choosing one is a navigation. The dashboards hold
 * the whole log client-side and use `CalendarYearPicker` instead — two
 * mechanisms, because the two routes genuinely render differently.
 *
 * In normal flow, not pinned: the calendar labels its columns by month across
 * the full width, so anything floating along the top edge covers one end or the
 * other. `pl-9` leaves the corner to `ManualRefreshButton`, which is still
 * fixed there.
 */
export function YearSelector({ years, selected }: Props) {
    return (
        <div className="flex gap-1 pl-9">
            {years.map((year) => {
                const active = selected === year;

                return (
                    <Link
                        key={year}
                        href={`?year=${year}`}
                        aria-current={active ? "page" : undefined}
                        className={[
                            "flex h-8 items-center justify-center rounded-md px-2",
                            "border border-border",
                            "bg-transparent backdrop-blur",
                            "text-xs transition",

                            active
                                ? "bg-active-wash text-strong"
                                : "text-muted hover:bg-hover-wash hover:text-strong",
                        ].join(" ")}
                    >
                        {year}
                    </Link>
                );
            })}
        </div>
    );
}
