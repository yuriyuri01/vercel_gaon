import { NextResponse } from "next/server";
import clientPromiseFn from "@/lib/mongodb"; // GAON DB

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const postId = searchParams.get("id");

        if (!postId) {
            return NextResponse.json({ error: "게시글 ID 필요" }, { status: 400 });
        }

        const client = await clientPromiseFn(); // MongoClient 반환
        const db = client.db("GAON");
        const { ObjectId } = require("mongodb");
        const post = await db
            .collection("community")
            .findOne({ _id: new ObjectId(postId) });

        if (!post) {
            return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
        }

        return NextResponse.json({ post });
    } catch (err) {
        console.error("게시글 조회 에러:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
