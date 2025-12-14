import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI, {
    ssl: true,
    tlsAllowInvalidCertificates: false, // 테스트용, 실제 운영 시 false로 변경
});

const uri = process.env.MONGODB_URI; // 이미 쓰는 URI로 교체

let clientP;
export async function getDb() {
    if (!clientP) clientP = client.connect();
    await clientP;
    return client.db(process.env.MONGODB_DB || "GAON");
}
