import { revalidateWorkoutViews } from "@/lib/revalidate";

export async function POST() {
    const revalidated = revalidateWorkoutViews();

    return Response.json({
        ok: true,
        revalidated,
        at: new Date().toISOString(),
    });
}
