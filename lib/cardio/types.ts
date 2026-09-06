import { CalendarActivity } from "@/types/calendar";
import { DateRangeValue } from "@/types/date-range";

/** A run that survived hygiene filtering, so its numbers can be relied on. */
export type CardioRun = {
    /** `YYYY-MM-DD`, normalised from the record's date. */
    date: string;
    distanceKm: number;
    durationMin: number;
};

/** One run, plotted against the date it was logged. */
export type PacePoint = {
    date: string;
    /**
     * Minutes per kilometre, so a *lower* number is faster. The chart inverts
     * its axis to keep "up means better" true across the whole app.
     */
    paceMinPerKm: number;
    /**
     * Carried for the mark size and the tooltip: a slower long run is not a
     * worse run, and the chart has to let that be read.
     */
    distanceKm: number;
    durationMin: number;
};

/** A Monday-anchored week. Weeks with no runs are present and zeroed. */
export type WeeklyPoint = {
    /** The week's Monday, `YYYY-MM-DD`. */
    weekStart: string;
    km: number;
    runs: number;
    minutes: number;
};

export type CardioStats = {
    /** Every run attended in the period, including those missing a distance. */
    runs: number;
    totalKm: number;
    /**
     * Distance-weighted (total minutes over total kilometres), not a mean of
     * per-run paces: an 8 km run is twice the work of a 4 km one and has to
     * pull the average twice as hard. Null when no run had a usable distance.
     */
    avgPaceMinPerKm: number | null;
    /** The fastest single run, or null when none had a usable distance. */
    bestPaceMinPerKm: number | null;
};

/** What was withheld from the figures, so the page can disclose it. */
export type CardioExclusions = {
    /** Runs dropped for a missing or zero distance — six of them, all August. */
    missingDistance: number;
    /** Runs dropped for a missing or zero duration. None so far. */
    missingDuration: number;
};

/** Why there is nothing to draw, so the page can say so. */
export type CardioUnchartableReason = "none-in-period" | "no-distance";

export type CardioView = {
    stats: CardioStats;
    exclusions: CardioExclusions;
    pacePoints: PacePoint[];
    weeklyPoints: WeeklyPoint[];
    /** Full calendar year for `calendarYear`, filtered to runs. */
    calendar: CalendarActivity[];
    calendarYear: number;
    /** Set when the charts have nothing to draw and why; null when they do. */
    unchartable: CardioUnchartableReason | null;
};

export type CardioOptions = {
    range: DateRangeValue;
    /** Injectable clock, so range boundaries and the calendar year are testable. */
    now?: Date;
};
