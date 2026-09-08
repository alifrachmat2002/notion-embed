/**
 * A number as a stat card shows it: at most one decimal place, abbreviated to
 * thousands once it is long enough to crowd the card it sits in.
 *
 * Applied per figure rather than to every card, because whether a figure reads
 * better abbreviated is a question about that figure, which only the dashboard
 * showing it can answer.
 */
export function formatStatValue(value: number): string {
    if (value >= 10_000) return `${(value / 1000).toFixed(1)}k`;

    return String(Math.round(value * 10) / 10);
}
