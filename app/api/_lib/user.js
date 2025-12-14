// app/api/_lib/user.js
import { getDb } from "./db";

export async function upsertOAuthUser({ provider, providerId, email, name, picture }) {
    const db = await getDb(); // 여기서 GAON DB가 반환됨
    const users = db.collection("users");

    const now = new Date();
    const query = { $or: [{ email }, { [`providers.${provider}.id`]: providerId }] };

    const update = {
        $setOnInsert: { createdAt: now },
        $set: {
            updatedAt: now,
            email,
            name,
            picture: picture || null,
            [`providers.${provider}`]: { id: providerId, linkedAt: now },
        },
    };

    const opts = { upsert: true, returnDocument: "after" };
    const doc = await users.findOneAndUpdate(query, update, opts);
    return doc.value || doc;
}
