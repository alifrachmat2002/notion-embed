import { getWorkouts } from "@/lib/notion";
import AnalyticsDashboard from "../components/analytics/analytics-dashboard";
import ManualRefreshButton from "../components/manual-refresh-button";

/**
 * Fetches once and hands the whole log to the client.
 *
 * The dataset is a few hundred records, so shipping it wholesale costs less
 * than a round trip per selector change — and it keeps this route statically
 * renderable, refreshed by the same revalidation path as the other views.
 */
export default async function Analytics() {
    const workouts = await getWorkouts();

    return (
        <>
            <ManualRefreshButton />
            <AnalyticsDashboard workouts={workouts} />
        </>
    );
}
