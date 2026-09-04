import { getWorkouts } from "@/lib/notion";
import CardioDashboard from "../components/cardio/cardio-dashboard";
import ManualRefreshButton from "../components/manual-refresh-button";

/**
 * Fetches once and hands the whole log to the client, as /analytics does.
 *
 * The client needs every record rather than just the runs: a run mistagged as
 * strength is only recognisable from the whole log, so the filtering happens in
 * the view builder rather than here.
 */
export default async function Cardio() {
    const workouts = await getWorkouts();

    return (
        <>
            <ManualRefreshButton />
            <CardioDashboard workouts={workouts} />
        </>
    );
}
