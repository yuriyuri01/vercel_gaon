// app/api/auth/kakao/callback/route.js


import { NextResponse } from "next/server";
import { setSessionCookie } from "app/api/_lib/auth";
import { upsertOAuthUser } from "app/api/_lib/user";
import https from "https";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");

        if (!code) {
            return NextResponse.json({ error: "code가 없습니다" }, { status: 400 });
        }

        // 🔹 환경변수 확인
        const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
        const CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET || "";
        const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

        if (!REST_API_KEY) {
            console.error("KAKAO_REST_API_KEY가 정의되지 않았습니다!");
            return NextResponse.json({ error: "서버 환경변수 문제" }, { status: 500 });
        }

        const redirectUri = `${SITE_URL}/api/auth/kakao/callback`;


        console.log("REST_API_KEY:", process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY);
        console.log("redirectUri:", redirectUri);
        console.log("code:", code);

        // 🔹 토큰 요청용 body
        const body = new URLSearchParams({
            grant_type: "authorization_code",
            client_id: REST_API_KEY,
            redirect_uri: redirectUri,
            code,
        });
        if (CLIENT_SECRET) body.append("client_secret", CLIENT_SECRET);

        const agent = new https.Agent({ minVersion: "TLSv1.2" });

        // 🔹 카카오 토큰 요청
        const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
            agent,
        });

        const tokenData = await tokenRes.json();
        console.log("tokenData:", tokenData);

        if (!tokenRes.ok || tokenData.error) {
            return NextResponse.json(tokenData, { status: 400 });
        }

        const accessToken = tokenData.access_token;

        // 🔹 사용자 정보 조회
        const userRes = await fetch("https://kapi.kakao.com/v2/user/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
            agent,
        });

        const userData = await userRes.json();
        console.log("userData:", userData);

        const kakaoId = String(userData.id);
        const kakaoAccount = userData.kakao_account || {};
        const profile = kakaoAccount.profile || {};
        const email = kakaoAccount.email || `${kakaoId}@kakao.local`;
        const name = profile.nickname || "Kakao User";
        const picture = profile.profile_image_url || null;

        // 🔹 MongoDB에 저장
        const user = await upsertOAuthUser({
            provider: "kakao",
            providerId: kakaoId,
            email,
            name,
            picture,
        });

        // 🔹 세션 설정
        await setSessionCookie({ ...user, provider: "kakao" });

        return NextResponse.redirect(`${SITE_URL}/mypage`);
    } catch (err) {
        console.error("카카오 콜백 에러:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
