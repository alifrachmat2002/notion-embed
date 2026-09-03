import { ReactNode } from "react";

type Props = {
    title: string;
    hint?: string;
    /** Shown instead of the children when there is nothing to draw. */
    empty?: string | null;
    children: ReactNode;
};

/**
 * A titled chart section.
 *
 * Renders its explanation rather than an empty set of axes when there is
 * nothing to plot — a chart with no marks reads as a broken chart.
 */
export function Panel({ title, hint, empty, children }: Props) {
    return (
        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <header className="mb-3">
                <h2 className="text-sm font-medium text-white">{title}</h2>
                {hint && <p className="mt-0.5 text-xs text-white/40">{hint}</p>}
            </header>

            {empty ? (
                <p className="flex h-[220px] items-center justify-center text-center text-sm text-white/35">
                    {empty}
                </p>
            ) : (
                children
            )}
        </section>
    );
}
