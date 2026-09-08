import Link from "next/link";
import { MUSCLE_RANGES, MuscleRange } from "@/types/date-range";

type Props = {
    selected: MuscleRange;
};

export function RangeSelector({ selected }: Props) {
    return (
        <div className="fixed top-0 left-9 z-50 flex gap-1">
            {MUSCLE_RANGES.map((range) => {
                const active = selected === range;

                return (
                    <Link
                        key={range}
                        href={`?range=${range}`}
                        className={[
                            "flex h-8 min-w-8 items-center justify-center rounded-md",
                            "border border-white/10",
                            "bg-transparent backdrop-blur",
                            "text-sm transition",

                            active
                                ? "bg-white/10 text-white"
                                : "text-white/60 hover:bg-black/70 hover:text-white",
                        ].join(" ")}
                    >
                        {range}D
                    </Link>
                );
            })}
        </div>
    );
}
