import { NextResponse } from "next/server";
import { setSessionCookie } from "app/api/_lib/auth";
import { upsertOAuthUser } from "app/api/_lib/user";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");
        if (!code) return NextResponse.json({ error: "code가 없습니다" }, { status: 400 });

        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`;

        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        });
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || tokenData.error) {
            return NextResponse.json(tokenData, { status: 400 });
        }

        const accessToken = tokenData.access_token;

        const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const u = await userRes.json();

        const email = u.email;
        const name = u.name || u.given_name || "Google User";
        const picture = u.picture || null;
        const providerId = String(u.id);

        const user = await upsertOAuthUser({
            provider: "google",
            providerId,
            email,
            name,
            picture,
        });

        await setSessionCookie({ ...user, provider: "google" });

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/mypage`);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
