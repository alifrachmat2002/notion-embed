"use client";

import { useMemo, useState } from "react";
import { buildAnalyticsView } from "@/lib/analytics/build-analytics-view";
import {
    ANALYTICS_RANGES,
    AnalyticsRange,
    RANGE_LABELS,
    UnchartableReason,
} from "@/lib/analytics/types";
import { WorkoutEntry } from "@/types/workout";
import ActivityCalendarWrapper from "../activity-calendar-wrapper";
import { Panel } from "./panel";
import { RepChart } from "./rep-chart";
import { StatCards } from "./stat-cards";
import { VolumeChart } from "./volume-chart";
import { WeightChart } from "./weight-chart";

/**
 * Holds the selection and rebuilds the view model on every change.
 *
 * All the filtering and aggregation is a pure function over records already in
 * memory, so switching exercise or period costs no network round trip.
 */
export default function AnalyticsDashboard({
    workouts,
}: {
    workouts: WorkoutEntry[];
}) {
    const [exercise, setExercise] = useState<string | null>(null);
    const [range, setRange] = useState<AnalyticsRange>(90);

    const view = useMemo(
        () => buildAnalyticsView(workouts, { exercise, range }),
        [workouts, exercise, range],
    );

    const chartsEmpty = explain(view.unchartable, view.kind === "bodyweight");

    return (
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 pt-12">
            <h1 className="text-xs tracking-[0.2em] text-white/40 uppercase">
                Fitness Analytics
            </h1>

            <div className="flex flex-wrap items-center gap-2">
                <select
                    value={view.selected ?? ""}
                    onChange={(event) => setExercise(event.target.value)}
                    className="h-9 rounded-md border border-white/10 bg-[#1c1c1e] px-3 text-sm text-white"
                    aria-label="Exercise"
                >
                    {view.exercises.map((option) => (
                        <option key={option.name} value={option.name}>
                            {option.name}
                            {option.usableSets === 0 ? " (no data)" : ""}
                        </option>
                    ))}
                </select>

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

            <StatCards
                stats={view.stats}
                kind={view.kind}
                exclusions={view.exclusions}
            />

            <Panel
                title="Weight Progression"
                hint="Heaviest set each session. The dashed line combines weight and reps — compare it against itself, not as a true 1RM."
                empty={
                    view.kind === "bodyweight"
                        ? "This is a bodyweight exercise, so there is no load to chart. Rep progression below is the measure that applies."
                        : chartsEmpty
                }
            >
                <WeightChart data={view.weightSeries} />
            </Panel>

            <Panel
                title="Reps / Weight Progression"
                hint="One series per weight. Rising within a series means more reps at that weight; a step up to a heavier series is progress even when reps drop."
                empty={chartsEmpty}
            >
                <RepChart data={view.repSeries} kind={view.kind} />
            </Panel>

            <Panel
                title="Volume Progression"
                hint={
                    view.kind === "bodyweight"
                        ? "Total reps per session — bodyweight sets record no load, so reps are the workload."
                        : "Weight × reps, summed across every set in the session."
                }
                empty={chartsEmpty}
            >
                <VolumeChart data={view.volumeSeries} kind={view.kind} />
            </Panel>

            <Panel
                title="Exercise Consistency"
                hint={`Days you performed this exercise in ${view.calendarYear}. Shows the full year regardless of the period above.`}
            >
                <ActivityCalendarWrapper data={view.calendar} loading={false} />
            </Panel>
        </main>
    );
}

function explain(
    reason: UnchartableReason | null,
    bodyweight: boolean,
): string | null {
    switch (reason) {
        case "all-holds":
            return "Every set of this exercise is logged as a timed hold, where the reps field records seconds. There is nothing to plot as weight × reps.";
        case "no-reps":
            return "No rep counts are recorded for these sets. Filling them in on Notion will populate this chart.";
        case "none-in-period":
            return bodyweight
                ? "No sets in this period."
                : "No sets in this period. Try a longer one.";
        default:
            return null;
    }
}
