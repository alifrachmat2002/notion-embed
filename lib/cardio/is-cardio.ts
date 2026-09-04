import { WorkoutEntry } from "@/types/workout";

/**
 * Which records are cardio, judged across the whole log.
 *
 * Activity type is set per record and gets mistyped during entry: two runs in
 * the log carry `Strength`. Trusting the tag alone would drag those into the
 * strength views and drop them from the cardio ones, so an exercise counts as
 * cardio if it is *ever* logged that way, and every record of it follows.
 *
 * Both sides of the split read this rule, which is why it lives here rather
 * than inside either view builder.
 */
export function isCardioRecord(
    workouts: WorkoutEntry[],
): (workout: WorkoutEntry) => boolean {
    const exercises = new Set(
        workouts
            .filter((workout) => workout.activityType === "Cardio")
            .map((workout) => workout.exercise)
            .filter((exercise): exercise is string => exercise !== null),
    );

    return (workout) =>
        workout.activityType === "Cardio" ||
        exercises.has(workout.exercise ?? "");
}
