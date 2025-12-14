// app/mypage/page.jsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";
// 표준 세션 유틸(조세/jose 기반)
import { verifySession } from "app/api/_lib/auth";
import MyPage from "./MyPage";

export default async function Page() {
  // Next 15: cookies()는 await 필요
  const store = await cookies();

  // 신규 세션 쿠키
  const sessionToken = store.get("gaon_session")?.value;

  let viewer = null;

  if (sessionToken) {
    const payload = await verifySession(sessionToken); // 검증 실패 시 null
    if (payload?.id) {
      try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB || "mydatabase");
        const user = await db
          .collection("users")
          .findOne(
            { id: payload.id },
            { projection: { _id: 0, id: 1, name: 1, email: 1, role: 1 } }
          );
        if (user) viewer = user;
      } catch {}
    }
  }
  return <MyPage user={viewer} />;
}
