const COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"] as const;

function getIntensity(count: number) {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 6) return 3;
    return 4;
}

export function workoutsToContributions(
    workouts: {
        date: string;
        completed: boolean;
    }[],
) {
    const grouped = new Map<string, number>();

    for (const workout of workouts) {
        if (!workout.completed) continue;

        grouped.set(workout.date, (grouped.get(workout.date) ?? 0) + 1);
    }

    return Array.from(grouped.entries()).map(([date, count]) => {
        const intensity = getIntensity(count);

        return {
            date,
            count,
            intensity,
            color: COLORS[intensity],
        };
    });
}
