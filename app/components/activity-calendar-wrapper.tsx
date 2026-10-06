// components/activity-calendar-wrapper.tsx
"use client";

import { ActivityCalendar } from "react-activity-calendar";
import "react-activity-calendar/tooltips.css";
import { CalendarActivity } from "@/types/calendar";

// Both arrays hold the same `var()` references and the colour scheme stays
// pinned, so the library never picks a scheme in JS: the stylesheet switches
// the values (see globals.css and docs/adr/0003).
const levels = [0, 1, 2, 3, 4].map((level) => `var(--calendar-${level})`);
const theme = { light: levels, dark: levels };

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
    data: CalendarActivity[];
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
