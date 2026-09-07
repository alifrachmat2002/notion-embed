import { ReactNode } from "react";

type Props = {
    title: string;
    hint?: string;
    /**
     * A control on the title row. For one that governs this panel alone — the
     * page's own controls belong in the row above, where they read as global.
     */
    action?: ReactNode;
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
export function Panel({ title, hint, action, empty, children }: Props) {
    return (
        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <header className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-sm font-medium text-white">{title}</h2>
                    {hint && (
                        <p className="mt-0.5 text-xs text-white/40">{hint}</p>
                    )}
                </div>
                {action && <div className="shrink-0">{action}</div>}
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
