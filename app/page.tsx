import { getWorkouts } from "@/lib/notion";
import { workoutsToCalendarData } from "@/lib/transform";
import { listCalendarYears, parseCalendarYear } from "@/types/calendar";
import ActivityCalendarWrapper from "./components/activity-calendar-wrapper";
import ManualRefreshButton from "./components/manual-refresh-button";
import { YearSelector } from "./components/year-selector";

type Props = {
  searchParams: Promise<{
    // A query key can repeat, so Next hands back an array for `?year=1&year=2`.
    // `parseCalendarYear` treats that ambiguity as unaskable and defaults.
    year?: string | string[];
  }>;
};

/**
 * Reading the year from the query string makes this route dynamic, which `/`
 * accepts to keep building the calendar on the server: only the 365 days go to
 * the browser, where the dashboards ship the whole log.
 */
export default async function Home({ searchParams }: Props) {

  const params = await searchParams;
  const now = new Date();
  const year = parseCalendarYear(params.year, now);

  const workouts = await getWorkouts();

  const calendar = workoutsToCalendarData(workouts, year);

  return (
    <>
      <YearSelector years={listCalendarYears(now)} selected={year} />
      <ActivityCalendarWrapper data={calendar} loading={!workouts} />
      <ManualRefreshButton />
    </>
  );
}
