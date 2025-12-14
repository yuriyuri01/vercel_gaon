'use server';
import 'server-only';
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "gaon_session";
const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "")?.replace(/\/$/, "") || "";
const isProd = process.env.NODE_ENV === "production";
const secureOption = isProd && process.env.NEXT_PUBLIC_USE_HTTPS === "true";

export async function signSession(payload, expiresIn = "7d") {
    const raw = process.env.JWT_SECRET;
    if (!raw) throw new Error("JWT_SECRET not set");
    const secret = new TextEncoder().encode(raw);

    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(secret);
}

export async function verifySession(token) {
    const raw = process.env.JWT_SECRET;
    if (!raw) return null;
    const secret = new TextEncoder().encode(raw);

    try {
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch {
        return null;
    }
}

export async function setSessionCookie(user, { remember = false } = {}) {
    const mongoId = user._id?.toString();
    const token = await signSession({
        sub: user._id?.toString?.() || user.id || user.email,
        id: mongoId,
        email: user.email,
        name: user.name,
        provider: user.provider,
        picture: user.picture || user.avatar_url || null,
    }, remember ? "30d" : "7d");

    const cookieStore = await cookies();
    cookieStore.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: secureOption, // 환경 변수로 제어
        sameSite: "lax",
        path: "/",
        maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7,
        ...(!isProd || !DOMAIN ? {} : { domain: DOMAIN }),
    });
}

export async function clearSessionCookie() {
    const cookieStore = await cookies();
    cookieStore.set({
        name: COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
        ...(!isProd || !DOMAIN ? {} : { domain: DOMAIN }),
    });
}

export async function getSessionTokenFromCookies() {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAME)?.value || null;
} 