import { revalidatePath } from "next/cache";

const WORKOUT_VIEW_PATHS = ["/", "/muscles"] as const;

export function revalidateWorkoutViews(): string[] {
    for (const path of WORKOUT_VIEW_PATHS) {
        revalidatePath(path);
    }

    return [...WORKOUT_VIEW_PATHS];
}
