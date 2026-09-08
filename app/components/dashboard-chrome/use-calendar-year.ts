"use client";

import { useMemo, useState } from "react";
import { listCalendarYears } from "@/types/calendar";

/**
 * The consistency calendar's selected year on a dashboard, and the years it
 * could be. Shared by `/analytics` and `/cardio`, which hold identical state.
 *
 * The clock is read once on mount rather than per render, so the offered years
 * and the default cannot drift apart if the page is left open across midnight.
 *
 * Read on the client rather than handed down from the page: both routes are
 * statically rendered, so a year resolved on the server would be the year of
 * the *build*, frozen until the next one. Prerendered HTML can therefore carry
 * a stale year across a New Year boundary, and hydration correcting it is the
 * intended behaviour rather than a fault.
 */
export function useCalendarYear() {
    const years = useMemo(() => listCalendarYears(new Date()), []);
    const [year, setYear] = useState(() => years[0]);

    return { years, year, setYear };
}
