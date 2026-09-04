// components/activity-calendar-wrapper.tsx
"use client";

import { ActivityCalendar } from "react-activity-calendar";
import "react-activity-calendar/tooltips.css";

const theme = {
    light: ["#2a2a2c", "#0e4429", "#006d32", "#26a641", "#39d353"],
    dark: ["#2a2a2c", "#0e4429", "#006d32", "#26a641", "#39d353"],
};

/**
 * `unit` names what a day's count actually is. The calendar is fed sets by the
 * strength views and whole runs by /cardio, where "1 sets" would be wrong twice
 * over. Defaults to sets so the existing callers are unaffected.
 */
export default function ActivityCalendarWrapper({
    data,
    loading,
    unit = { one: "set", many: "sets" },
}: {
    data: any[];
    loading: boolean;
    unit?: { one: string; many: string };
}) {
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
                        `${activity.count} ${
                            activity.count === 1 ? unit.one : unit.many
                        } on ${activity.date}`,
                },
                colorLegend: {
                    text: (level) => `Activity level ${level + 1}`,
                },
            }}
        />
    );
}
