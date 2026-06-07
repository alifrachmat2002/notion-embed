import { WorkoutEntry } from "@/types/workout";

export function filterByDateRange(workouts: WorkoutEntry[], days: 7 | 30 | 90) {
    const cutoff = new Date();

    cutoff.setDate(cutoff.getDate() - days);

    return workouts.filter((workout) => {
        if (!workout.date) return false;

        return new Date(workout.date) >= cutoff;
    });
}
