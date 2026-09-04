import { WorkoutEntry } from "@/types/workout";
import { Client, collectPaginatedAPI } from "@notionhq/client";

export const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

type TitleProperty = { title?: { plain_text: string }[] };

function parseTitle(property: TitleProperty | undefined): string {
    return (property?.title ?? [])
        .map((fragment) => fragment.plain_text)
        .join("");
}

// Notion also exposes `Volume` and `1RM Estimate` formula properties. They are
// deliberately not read: Notion computes them across every record, so they bake
// in the timed-hold and missing-rep artifacts that lib/analytics filters out.
// Both quantities are recomputed there instead, after hygiene filtering.
//
// `RPE`, `Cardio Type` and `Workout Type` are not read either. Across the whole
// log RPE is empty on every record, and the other two carry a single value
// ("Running", "Easy Run"), so reading them would add fields no view can use.
export function parseWorkoutPage(page: any): WorkoutEntry | null {
    const date = page.properties.Date.date?.start;

    if (!date) {
        console.warn(`Skipping workout with no date set (page ${page.id})`);
        return null;
    }

    return {
        date,
        completed: page.properties.Completed.checkbox,
        activityType: page.properties["Activity Type"].select?.name ?? null,
        muscle: page.properties.Muscle.select?.name ?? null,
        name: parseTitle(page.properties.Name),
        exercise: page.properties.Exercise.select?.name ?? null,
        weight: page.properties.Weight.number,
        reps: page.properties.Reps.number,
        distanceKm: page.properties["Distance (km)"].number,
        durationMin: page.properties["Duration(min)"].number,
    };
}

export async function getWorkouts(): Promise<WorkoutEntry[]> {
    const pages = await collectPaginatedAPI(notion.dataSources.query, {
        data_source_id: process.env.NOTION_DATA_SOURCE_ID!,

        filter: {
            property: "Completed",
            checkbox: {
                equals: true,
            },
        },
    });

    return pages
        .map(parseWorkoutPage)
        .filter((workout): workout is WorkoutEntry => workout !== null);
}
