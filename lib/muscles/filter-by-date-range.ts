import { DateRangeValue } from "@/types/date-range";
import { WorkoutEntry } from "@/types/workout";

/**
 * Keep the workouts falling within `range` days of `now`; `"all"` keeps every
 * dated workout. `now` is injectable so range boundaries are testable.
 */
export function filterByDateRange(
    workouts: WorkoutEntry[],
    range: DateRangeValue,
    now: Date = new Date(),
) {
    if (range === "all") {
        return workouts.filter((workout) => Boolean(workout.date));
    }

    const cutoff = new Date(now);

    cutoff.setDate(cutoff.getDate() - range);

    return workouts.filter((workout) => {
        if (!workout.date) return false;

        return new Date(workout.date) >= cutoff;
    });
}
