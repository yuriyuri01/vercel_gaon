// app/api/login/route.js
export const runtime = "nodejs";

import clientPromiseFn from "@/lib/mongodb"; // GAON DB 반환하도록 수정
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { setSessionCookie } from "../_lib/auth";

export async function POST(req) {
  try {
    const { id, password, remember } = await req.json();
    if (!id || !password) {
      return NextResponse.json({ error: "아이디와 비밀번호를 입력해주세요." }, { status: 400 });
    }

    // ✅ GAON DB 직접 사용
    const client = await clientPromiseFn(); // MongoClient 반환
    const db = client.db("GAON");

    const user = await db.collection("users").findOne(
      { id },
      { projection: { _id: 1, id: 1, name: 1, email: 1, role: 1, password: 1 } }
    );
    if (!user) return NextResponse.json({ error: "존재하지 않는 아이디입니다." }, { status: 404 });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ error: "비밀번호가 일치하지 않습니다." }, { status: 401 });

    // ✅ 공통 세션 쿠키(gaon_session) 발급 — 소셜과 동일
    await setSessionCookie(
      {
        _id: user._id,
        id: user.id,
        email: user.email,
        name: user.name || user.id, // ← 여기 수정!
        provider: "local",
        role: user.role || "user",
      },
      { remember: !!remember }
    );


    return NextResponse.json({ message: "로그인 성공" }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
