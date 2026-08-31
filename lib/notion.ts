import { WorkoutEntry } from "@/types/workout";
import { Client, collectPaginatedAPI } from "@notionhq/client";

export const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

function parseWorkoutPage(page: any): WorkoutEntry | null {
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
