"use client";

import { useMemo, useState } from "react";
import { buildCardioView } from "@/lib/cardio/build-cardio-view";
import { CardioUnchartableReason } from "@/lib/cardio/types";
import {
    ANALYTICS_RANGES,
    AnalyticsRange,
    RANGE_LABELS,
} from "@/lib/analytics/types";
import { WorkoutEntry } from "@/types/workout";
import ActivityCalendarWrapper from "../activity-calendar-wrapper";
import { Panel } from "../analytics/panel";
import { CardioStatCards } from "./cardio-stat-cards";
import { PaceChart } from "./pace-chart";
import { WeeklyDistanceChart } from "./weekly-distance-chart";

/**
 * Holds the period and rebuilds the view model on every change.
 *
 * There is no exercise selector: every cardio record in the log is a run, so
 * there is nothing to choose between. The period is the only control.
 */
export default function CardioDashboard({
    workouts,
}: {
    workouts: WorkoutEntry[];
}) {
    const [range, setRange] = useState<AnalyticsRange>(90);

    const view = useMemo(
        () => buildCardioView(workouts, { range }),
        [workouts, range],
    );

    const chartsEmpty = explain(view.unchartable);

    return (
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 pt-12">
            <h1 className="text-xs tracking-[0.2em] text-white/40 uppercase">
                Cardio Analytics
            </h1>

            <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-1">
                    {ANALYTICS_RANGES.map((value) => (
                        <button
                            key={String(value)}
                            type="button"
                            onClick={() => setRange(value)}
                            className={[
                                "h-9 rounded-md border border-white/10 px-3 text-sm transition",
                                range === value
                                    ? "bg-white/10 text-white"
                                    : "text-white/50 hover:bg-white/5 hover:text-white",
                            ].join(" ")}
                        >
                            {RANGE_LABELS[String(value)]}
                        </button>
                    ))}
                </div>
            </div>

            <CardioStatCards stats={view.stats} exclusions={view.exclusions} />

            <Panel
                title="Pace Progression"
                hint="Minutes per kilometre, plotted so higher is faster. Larger marks are longer runs — a long run is slower by nature, not a worse one."
                empty={chartsEmpty}
            >
                <PaceChart data={view.pacePoints} />
            </Panel>

            <Panel
                title="Weekly Distance"
                hint="Kilometres per week. Weeks you did not run stay in the series, so a break shows as a gap rather than closing up."
                empty={chartsEmpty}
            >
                <WeeklyDistanceChart data={view.weeklyPoints} />
            </Panel>

            <Panel
                title="Running Consistency"
                hint={`Days you ran in ${view.calendarYear}. Shows the full year regardless of the period above.`}
            >
                <ActivityCalendarWrapper
                    data={view.calendar}
                    loading={false}
                    unit={{ one: "run", many: "runs" }}
                />
            </Panel>
        </main>
    );
}

function explain(reason: CardioUnchartableReason | null): string | null {
    switch (reason) {
        case "no-distance":
            return "No distance is recorded against these runs, so there is no pace to plot. Filling in the distance on Notion will populate this chart.";
        case "none-in-period":
            return "No runs in this period. Try a longer one.";
        default:
            return null;
    }
}
