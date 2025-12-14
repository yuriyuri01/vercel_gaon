"use server";

import { NextResponse } from "next/server";
import { getSessionTokenFromCookies, verifySession } from "../_lib/auth";

// GET 요청 처리
export async function GET() {
  try {
    const token = await getSessionTokenFromCookies();
    if (!token) return NextResponse.json({ user: null });

    const payload = await verifySession(token);
    return NextResponse.json({ user: payload || null });
  } catch (e) {
    return NextResponse.json({ user: null, error: e.message });
  }
}
