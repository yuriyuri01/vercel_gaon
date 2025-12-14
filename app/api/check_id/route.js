import clientPromiseFn from "@/lib/mongodb";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("uid");

    console.log("Requested ID:", id); // 🔹 입력 확인

    if (!id) {
      return new Response(
        JSON.stringify({ error: "아이디를 제공해야 합니다." }),
        { status: 400 }
      );
    }

    // MongoClient 가져오기
    const client = await clientPromiseFn();
    console.log("MongoClient 연결 성공"); // 🔹 연결 확인

    const db = client.db("GAON"); // GAON DB 선택

    const existingUser = await db.collection("users").findOne({ id });
    console.log("existingUser:", existingUser); // 🔹 쿼리 결과 확인

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "이미 존재하는 아이디입니다." }),
        { status: 409 }
      );
    }

    return new Response(
      JSON.stringify({ message: "사용 가능한 아이디입니다." }),
      { status: 200 }
    );
  } catch (err) {
    console.error("check_id GET 에러:", err); // 🔹 에러 로그
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
