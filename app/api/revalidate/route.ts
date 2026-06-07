// app/api/revalidate/route.ts
import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

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

    revalidatePath("/");
    revalidatePath("/muscles");

    return Response.json({
        ok: true,
        revalidated: "/",
        at: new Date().toISOString(),
    });
}
