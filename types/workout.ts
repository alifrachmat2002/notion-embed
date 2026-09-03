export type WorkoutEntry = {
    date: string;
    completed: boolean;
    activityType: string | null;
    muscle: string | null;
    /** Record title, e.g. "Bicep Curl Hold - Set 1 (40s hold)". */
    name: string;
    exercise: string | null;
    weight: number | null;
    reps: number | null;
};
