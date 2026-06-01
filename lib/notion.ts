import { Client } from "@notionhq/client";

export const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

export async function getWorkouts() {
    const response = await notion.dataSources.query({
        data_source_id: process.env.NOTION_DATA_SOURCE_ID!,
            filter: {
                property: "Completed",
                checkbox: {
                    equals: true,
                },
            },
    });

    return response.results.map((page: any) => ({
        date: page.properties.Date.date?.start,
        completed: page.properties.Completed.checkbox,
    }));
}
