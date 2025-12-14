import clientPromiseFn from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { id, password, email } = await req.json();

        if (!id || !password || !email)
            return new Response(JSON.stringify({ error: "모든 필드를 입력해주세요." }), { status: 400 });

        // MongoClient 가져오기
        const client = await clientPromiseFn(); 
        const db = client.db("GAON"); // GAON DB 선택

        const existingUser = await db.collection("users").findOne({ id });
        if (existingUser)
            return new Response(JSON.stringify({ error: "이미 존재하는 아이디입니다." }), { status: 409 });

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.collection("users").insertOne({
            id,
            password: hashedPassword,
            email,
            createdAt: new Date()
        });

        return new Response(JSON.stringify({ message: "회원가입 성공", status: "success" }), { status: 201 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message, status: "error" }), { status: 500 });
    }
}
