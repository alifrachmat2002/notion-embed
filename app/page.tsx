import { getWorkouts } from "@/lib/notion";
import { workoutsToCalendarData } from "@/lib/transform";
import ActivityCalendarWrapper from "./components/activity-calendar-wrapper";

export default async function Home() {

  const workouts = await getWorkouts();

  const contributions =
    workoutsToCalendarData(workouts);

  console.log(contributions[contributions.length - 1]);

  console.log(workouts[0]);

  return (
    <ActivityCalendarWrapper data={contributions} loading={!workouts} />
    // <GithubContributionChart contributions={contributions} />
  );
}
