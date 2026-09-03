import { DateRangeValue } from "@/types/date-range";

/** Analytics periods, longest last. `/muscles` keeps its own 7/30/90 list. */
export const ANALYTICS_RANGES = [28, 90, 180, 365, "all"] as const;

export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export const RANGE_LABELS: Record<string, string> = {
    "28": "4 weeks",
    "90": "3 months",
    "180": "6 months",
    "365": "1 year",
    all: "All time",
};

/**
 * Whether an exercise is loaded externally or by bodyweight alone.
 *
 * Bodyweight exercises record every set at weight 0 or null, so `weight × reps`
 * is permanently zero for them. They measure volume in reps instead.
 */
export type ExerciseKind = "weighted" | "bodyweight";

/** A set that survived hygiene filtering, so its numbers can be relied on. */
export type AnalyticsSet = {
    /** `YYYY-MM-DD`, normalised from the record's date. */
    date: string;
    exercise: string;
    weight: number;
    reps: number;
};

export type ExerciseOption = {
    name: string;
    kind: ExerciseKind;
    /** Every set logged against this exercise, including unusable ones. */
    setCount: number;
    /**
     * Sets whose numbers can actually be plotted. Zero means the exercise is
     * logged entirely as timed holds or without rep counts — it stays in the
     * selector so the work is not silently invisible, but its panels explain
     * themselves rather than drawing empty axes.
     */
    usableSets: number;
};

export type WeightPoint = {
    date: string;
    /** Heaviest weight used that session. Always 0 for bodyweight exercises. */
    maxWeight: number;
    /**
     * Epley (`weight × (1 + reps / 30)`) for the session's best set.
     *
     * A relative progression index only — comparable against itself for one
     * exercise, never a real one-rep max. Null for bodyweight exercises.
     */
    strengthIndex: number | null;
};

export type RepPoint = {
    date: string;
    weight: number;
    reps: number;
    /** Sets sharing this exact date/weight/reps, collapsed into one mark. */
    setCount: number;
};

export type VolumePoint = {
    date: string;
    /** Σ(weight × reps), or Σ(reps) when the exercise is bodyweight. */
    volume: number;
};

export type ExerciseStats = {
    sessions: number;
    /** Every set logged, including those excluded from the figures below. */
    sets: number;
    volume: number;
    /**
     * Heaviest weight recorded. Bodyweight exercises log every set at 0, so
     * this reads 0 kg for them rather than being suppressed — a deliberate
     * choice to keep all four cards literal.
     */
    maxWeight: number;
};

/** What was withheld from the figures, so the page can disclose it. */
export type Exclusions = {
    /** Sets dropped for a missing or zero rep count. */
    missingReps: number;
    /** Sets dropped as timed holds, where reps actually store seconds. */
    holds: number;
};

/** Why an exercise has nothing to plot, so the page can say so. */
export type UnchartableReason = "all-holds" | "no-reps" | "none-in-period";

export type CalendarActivity = {
    date: string;
    count: number;
    level: number;
};

export type AnalyticsView = {
    exercises: ExerciseOption[];
    /** The resolved selection: the requested exercise, or the default. */
    selected: string | null;
    kind: ExerciseKind;
    stats: ExerciseStats;
    exclusions: Exclusions;
    weightSeries: WeightPoint[];
    repSeries: RepPoint[];
    volumeSeries: VolumePoint[];
    /** Full calendar year for `calendarYear`, filtered to `selected`. */
    calendar: CalendarActivity[];
    calendarYear: number;
    /** Set when the charts have nothing to draw and why; null when they do. */
    unchartable: UnchartableReason | null;
};

export type AnalyticsOptions = {
    exercise: string | null;
    range: DateRangeValue;
    /** Injectable clock, so range boundaries and the calendar year are testable. */
    now?: Date;
};
