// app/api/revalidate/route.ts
import { NextRequest } from "next/server";
import { revalidateWorkoutViews } from "@/lib/revalidate";

export async function POST(request: NextRequest) {
    let body: { secret?: string };

    try {
        body = await request.json();
    } catch {
        return Response.json({ ok: false }, { status: 400 });
    }

    if (body.secret !== process.env.REVALIDATE_SECRET) {
        return Response.json({ ok: false }, { status: 401 });
    }

    const revalidated = revalidateWorkoutViews();

    return Response.json({
        ok: true,
        revalidated,
        at: new Date().toISOString(),
    });
}
