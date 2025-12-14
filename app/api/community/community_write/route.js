import { NextResponse } from "next/server";
import clientPromiseFn from "@/lib/mongodb"; // GAON DB 연결
import { getSessionTokenFromCookies, verifySession } from "@/api/_lib/auth"; // ⚡ 세션 관련

export async function POST(req) {
  try {
    const client = await clientPromiseFn(); // MongoClient 반환
    const db = client.db("GAON");

    // ⚡ 세션에서 로그인 사용자 가져오기
    const sessionToken = await getSessionTokenFromCookies();
    const session = await verifySession(sessionToken);

    if (!session?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const formData = await req.formData();

    const title = formData.get("title");
    const content = formData.get("content");
    const category = formData.get("category");

    if (!title || !content) {
      return NextResponse.json({ error: "제목, 내용 필수" }, { status: 400 });
    }

    const userId = session.id;                        // 글 작성자 식별용
    const userName = session.name || session.id;

    const images = formData.getAll("images"); // File 객체 배열
    const uploadedUrls = []; // ⭐ GitHub raw URL 저장용

    // GitHub 정보
    const GITHUB_USER = "yuriyuri01";
    const GITHUB_REPO = "gaon_img";
    const GITHUB_PATH = "uploads"; // GitHub 업로드 폴더

    for (const file of images) {
      if (!file) continue;

      const arrayBuffer = await file.arrayBuffer();
      const base64Content = Buffer.from(arrayBuffer).toString("base64");
      const filename = `${Date.now()}_${file.name}`;

      // GitHub API 업로드
      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${GITHUB_PATH}/${filename}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `upload community image ${filename}`,
            content: base64Content,
          }),
        }
      );

      const result = await res.json();

      if (result?.content?.path) {
        const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${GITHUB_PATH}/${filename}`;
        uploadedUrls.push(rawUrl);
      }
    }

    const doc = await db.collection("community").insertOne({
      title,
      content,
      userId,    // ⚡ _id 기준, 수정/삭제 체크용
      userName,  // ⚡ 닉네임 저장, 화면 표시용
      category,
      createdAt: new Date(),
      images: uploadedUrls, // ⭐ GitHub raw URL
    });

    return NextResponse.json({ success: true, id: doc.insertedId });
  } catch (err) {
    console.error("게시글 작성 에러:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
