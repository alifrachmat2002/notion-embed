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
    /** Kilometres covered. Cardio only, and null on six August runs. */
    distanceKm: number | null;
    /**
     * Minutes spent. Not cardio-exclusive: timed strength holds record it too
     * (a 40-second hold logs 0.67), so it never identifies a record as a run.
     */
    durationMin: number | null;
};
