import { MuscleHeatmap } from "../components/muscles/MuscleHeatmap";
import { getWorkouts } from "@/lib/notion";
import { calculateMuscleVolume } from "@/lib/muscles/calculate-muscle-volume";
import { filterByDateRange } from "@/lib/muscles/filter-by-date-range";
import { RangeSelector } from "../components/range-selector";
import ManualRefreshButton from "../components/manual-refresh-button";

type Props = {
    searchParams: Promise<{
        range?: string;
    }>;
};

export default async function Muscles({ searchParams }: Props) {

    const params = await searchParams;
    const range = Number(params.range) || 7;
    const workouts = await getWorkouts();

    const filtered = filterByDateRange(workouts, range as 7 | 30 | 90);

    const volume = calculateMuscleVolume(filtered);
    return (
        <>
            <RangeSelector selected={range as 7 | 30 | 90} />
            <ManualRefreshButton />
            <MuscleHeatmap volume={volume} />
        </>
    );
}
