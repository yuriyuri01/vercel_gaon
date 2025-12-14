import { NextResponse } from "next/server";
import clientPromiseFn from "@/lib/mongodb"; // GAON DB 반환
import { ObjectId } from "mongodb";
import fs from "fs";
import path from "path";

export async function DELETE(req) {
    try {
        const client = await clientPromiseFn(); // MongoClient 반환
        const db = client.db("GAON");

        const postId = req.nextUrl.searchParams.get("id");
        if (!postId) {
            return NextResponse.json({ error: "게시글 ID가 없습니다." }, { status: 400 });
        }

        const post = await db.collection("community").findOne({ _id: new ObjectId(postId) });
        if (!post) {
            return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
        }

        // ✅ 이미지 파일 삭제
        if (post.images && post.images.length > 0) {
            for (const img of post.images) {
                const filePath = path.join(process.cwd(), "public", "uploads", img);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }

        // ✅ DB에서 삭제
        await db.collection("community").deleteOne({ _id: new ObjectId(postId) });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("게시글 삭제 에러:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
