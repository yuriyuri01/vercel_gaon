import { NextResponse } from "next/server";
import clientPromiseFn from "@/lib/mongodb"; // GAON DB 반환

export async function GET() {
    try {
        const client = await clientPromiseFn(); // MongoClient 반환
        const db = client.db("GAON");

        const posts = await db
            .collection("community")
            .find({})
            .sort({ createdAt: -1 }) // 최신 글 먼저
            .toArray();

        return NextResponse.json({ posts });
    } catch (err) {
        console.error("게시글 조회 에러:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
