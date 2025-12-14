// app/api/logout/route.js
import { NextResponse } from "next/server";
import { clearSessionCookie, getSessionTokenFromCookies } from "../_lib/auth"; // 세션 쿠키 제거 및 토큰 가져오기
import clientPromiseFn from "@/lib/mongodb"; // GAON DB 반환하도록 설정된 함수

export async function GET() {
    try {
        // 쿠키에서 세션 토큰 가져오기
        const sessionToken = await getSessionTokenFromCookies();
        if (!sessionToken) {
            return NextResponse.json({ error: "로그인된 상태가 아닙니다." }, { status: 400 });
        }

        // 세션 삭제: 세션 토큰을 기반으로 MongoDB에서 해당 세션 정보 삭제
        const client = await clientPromiseFn(); // MongoClient 반환
        const db = client.db("GAON");
        
        // 세션 토큰을 사용하여 session 컬렉션에서 해당 세션 삭제
        await db.collection("sessions").deleteOne({ sessionToken });

        // 세션 쿠키 삭제
        await clearSessionCookie();

        return NextResponse.json({ message: "로그아웃 성공" }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
