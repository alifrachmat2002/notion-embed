function getLevel(count: number) {
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

export function workoutsToCalendarData(
    workouts: {
        date: string;
        completed: boolean;
    }[],
    year = new Date().getFullYear(),
) {
    const grouped = new Map<string, number>();

    for (const workout of workouts) {
        if (!workout.completed) continue;

        grouped.set(workout.date, (grouped.get(workout.date) ?? 0) + 1);
    }

    const result = [];

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    for (
        let current = new Date(startDate);
        current <= endDate;
        current.setDate(current.getDate() + 1)
    ) {
        // const date = current.toISOString().split("T")[0];
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