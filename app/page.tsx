import { getWorkouts } from "@/lib/notion";
import { workoutsToCalendarData } from "@/lib/transform";
import ActivityCalendarWrapper from "./components/activity-calendar-wrapper";
import ManualRefreshButton from "./components/manual-refresh-button";

export default async function Home() {

  const workouts = await getWorkouts();

  const calendar = workoutsToCalendarData(workouts);

  return (
    <>
      <ActivityCalendarWrapper data={calendar} loading={!workouts} />
      <ManualRefreshButton />
    </>
  );
}
