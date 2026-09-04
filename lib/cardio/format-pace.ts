/**
 * Minutes per kilometre as `m:ss`, the way the log titles write it.
 *
 * Rounding is done in whole seconds before splitting, so a pace a hair under
 * eight minutes reports `8:00` rather than `7:60`.
 */
export function formatPace(minutesPerKm: number | null): string {
    if (minutesPerKm === null || !Number.isFinite(minutesPerKm)) return "—";

    const totalSeconds = Math.round(minutesPerKm * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
