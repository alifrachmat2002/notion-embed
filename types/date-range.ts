/**
 * A selectable period: a number of days back from today, or the whole log.
 *
 * Each view owns its own list of presets (the muscle heatmap offers 7/30/90,
 * analytics offers 28/90/180/365/all), so this admits any day count rather than
 * fixing one vocabulary for every caller.
 */
export type DateRangeValue = number | "all";

export type DateRange = 7 | 30 | 90;
