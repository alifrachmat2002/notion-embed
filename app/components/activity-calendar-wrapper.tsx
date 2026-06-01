// components/activity-calendar-wrapper.tsx
"use client";

import { ActivityCalendar } from "react-activity-calendar";
import "react-activity-calendar/tooltips.css";

const theme = {
    light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
};

export default function ActivityCalendarWrapper({ data, loading }: { data: any[], loading: boolean }) {
    return (
        <ActivityCalendar
            loading={loading}
            data={data}
            theme={theme}
            colorScheme="dark"
            showWeekdayLabels
            tooltips={{
                activity: {
                    text: (activity) =>
                        `${activity.count} sets on ${activity.date}`,
                },
                colorLegend: {
                    text: (level) => `Activity level ${level + 1}`,
                },
            }}
        />
    );
}
