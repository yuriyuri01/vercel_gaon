// lib/mongodb_board.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI; // GAON DB URI 사용
const options = {};

let client;
let clientPromise;

if (!uri) throw new Error("MONGODB_URI is not defined");

if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromiseBoard) {
        client = new MongoClient(uri, options);
        global._mongoClientPromiseBoard = client.connect();
    }
    clientPromise = global._mongoClientPromiseBoard;
} else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

// ✅ 함수 형태로 감싸기
export default async function clientPromiseBoard() {
    return clientPromise;
}
