import { NextResponse } from "next/server";
import clientPromiseFn from "@/lib/mongodb";
import fs from "fs";
import path from "path";
import { ObjectId } from "mongodb";

export async function POST(req) {
    try {
        const client = await clientPromiseFn();
        const db = client.db("GAON");


        // URL에서 id 받기
        const postId = req.nextUrl.searchParams.get("id");
        if (!postId) {
            return NextResponse.json({ error: "게시글 ID가 없습니다." }, { status: 400 });
        }

        const formData = await req.formData();
        const title = formData.get("title");
        const content = formData.get("content");
        const category = formData.get("category");

        if (!title || !content) {
            return NextResponse.json({ error: "제목과 내용은 필수입니다." }, { status: 400 });
        }

        // 기존 게시글
        const existing = await db.collection("community")
            .findOne({ _id: new ObjectId(postId) });

        if (!existing) {
            return NextResponse.json({ error: "존재하지 않는 게시글입니다." }, { status: 404 });
        }

        // 삭제할 이미지 목록
        const removedImagesStr = formData.get("removedImages");
        const removedImages = removedImagesStr ? JSON.parse(removedImagesStr) : [];

        let imageNames = existing.images || [];

        // 삭제 처리
        if (removedImages.length > 0) {
            imageNames = imageNames.filter(img => !removedImages.includes(img));
        }

        // 새 업로드 이미지 처리
        const images = formData.getAll("images");

        for (const file of images) {
            if (!file) continue;
            // GitHub 업로드
            const arrayBuffer = await file.arrayBuffer();
            const base64Content = Buffer.from(arrayBuffer).toString("base64");
            const filename = `${Date.now()}_${file.name}`;

            // GitHub API
            const GITHUB_USER = "yuriyuri01";
            const GITHUB_REPO = "gaon_img";
            const GITHUB_PATH = "uploads";

            const res = await fetch(
                `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${GITHUB_PATH}/${filename}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        message: `update community image ${filename}`,
                        content: base64Content,
                    }),
                }
            );

            const result = await res.json();
            if (result?.content?.path) {
                const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${GITHUB_PATH}/${filename}`;
                imageNames.push(rawUrl); // ✅ DB에는 GitHub raw URL 저장
            }

        }

        // DB 업데이트
        await db.collection("community").updateOne(
            { _id: new ObjectId(postId) },
            {
                $set: {
                    title,
                    content,
                    category,
                    images: imageNames,
                    updatedAt: new Date(),
                },
            }
        );

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error("게시글 수정 에러:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
