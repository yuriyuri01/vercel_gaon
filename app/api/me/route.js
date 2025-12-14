// app/api/me/route.js
import { NextResponse } from "next/server";
import { getSessionTokenFromCookies, verifySession } from "@/app/api/_lib/auth";

export async function GET() {
    const token = await getSessionTokenFromCookies();
    if (!token) return NextResponse.json({ ok: false }, { status: 401 });

    const payload = await verifySession(token);
    if (!payload) return NextResponse.json({ ok: false }, { status: 401 });

    // 필요한 필드만 반환
    const user = {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        provider: payload.provider,
        picture: payload.picture || null,
    };
    return NextResponse.json({ ok: true, user }, { status: 200 });
}
