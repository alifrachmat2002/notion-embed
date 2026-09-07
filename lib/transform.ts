import { CalendarActivity } from "@/types/calendar";

function getLevel(count: number): CalendarActivity["level"] {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 6) return 3;
    return 4;
}

function formatDate(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * One calendar year of training, every day present whether trained or not.
 *
 * `year` is required on purpose. It defaulted to the current year *here* once,
 * where no caller could see it happening, and that is how three views silently
 * agreed to empty themselves on January 1st. The view builders above still
 * default to the current year, but they do it in the open as a product
 * decision — see docs/adr/0001.
 */
export function workoutsToCalendarData(
    workouts: {
        date: string;
        completed: boolean;
    }[],
    year: number,
): CalendarActivity[] {
    const grouped = new Map<string, number>();

    for (const workout of workouts) {
        if (!workout.completed) continue;

        grouped.set(workout.date, (grouped.get(workout.date) ?? 0) + 1);
    }

    const result: CalendarActivity[] = [];

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    for (
        let current = new Date(startDate);
        current <= endDate;
        current.setDate(current.getDate() + 1)
    ) {
        const date = formatDate(current);

        const count = grouped.get(date) ?? 0;

        result.push({
            date,
            count,
            level: getLevel(count),
        });
    }

    return result;
}
