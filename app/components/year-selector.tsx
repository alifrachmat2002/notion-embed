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
 */
export function YearSelector({ years, selected }: Props) {
    return (
        <div className="fixed top-0 left-9 z-50 flex gap-1">
            {years.map((year) => {
                const active = selected === year;

                return (
                    <Link
                        key={year}
                        href={`?year=${year}`}
                        aria-current={active ? "page" : undefined}
                        className={[
                            "flex h-8 items-center justify-center rounded-md px-2",
                            "border border-white/10",
                            "bg-transparent backdrop-blur",
                            "text-xs transition",

                            active
                                ? "bg-white/10 text-white"
                                : "text-white/60 hover:bg-black/70 hover:text-white",
                        ].join(" ")}
                    >
                        {year}
                    </Link>
                );
            })}
        </div>
    );
}
