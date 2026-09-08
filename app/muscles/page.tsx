import { MuscleHeatmap } from "../components/muscles/MuscleHeatmap";
import { getWorkouts } from "@/lib/notion";
import { buildMuscleHeatmap } from "@/lib/muscles/build-muscle-heatmap";
import { parseDateRange } from "@/types/date-range";
import { RangeSelector } from "../components/range-selector";
import ManualRefreshButton from "../components/manual-refresh-button";

type Props = {
    searchParams: Promise<{
        // A query key can repeat, so Next hands back an array for
        // `?range=7&range=30`. `parseDateRange` treats that ambiguity as
        // unaskable and defaults.
        range?: string | string[];
    }>;
};

export default async function Muscles({ searchParams }: Props) {

    const params = await searchParams;
    const range = parseDateRange(params.range);
    const workouts = await getWorkouts();

    const heatmap = buildMuscleHeatmap(workouts, range);

    return (
        <>
            <RangeSelector selected={range} />
            <ManualRefreshButton />
            <MuscleHeatmap heatmap={heatmap} />
        </>
    );
}
