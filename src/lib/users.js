import crypto from "crypto";
import { getDb } from "@/lib/mongodb";

const inMemorySessions = global.__SPEEDY_SESSION_STORE ?? new Map();
if (process.env.NODE_ENV === "development") {
  global.__SPEEDY_SESSION_STORE = inMemorySessions;
}

export function generateUserId() {
  return crypto.randomUUID();
}

export async function upsertSession({
  userId,
  username,
  socketId,
  currentRoom,
}) {
  const db = await getDb();
  const now = new Date();

  if (db) {
    await db.collection("sessions").updateOne(
      { userId },
      {
        $set: {
          username,
          currentRoom,
          socketId,
          lastActive: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );
    return;
  }

  inMemorySessions.set(userId, {
    userId,
    username,
    currentRoom,
    socketId,
    createdAt: inMemorySessions.get(userId)?.createdAt ?? now,
    lastActive: now,
  });
}

export async function getSessionBySocket(socketId) {
  const db = await getDb();
  if (db) {
    return db.collection("sessions").findOne({ socketId });
  }

  for (const session of inMemorySessions.values()) {
    if (session.socketId === socketId) {
      return { ...session };
    }
  }

  return null;
}

export async function clearSession(userId) {
  const db = await getDb();
  if (db) {
    await db.collection("sessions").deleteOne({ userId });
    return;
  }

  inMemorySessions.delete(userId);
}

export async function assignRoomToSession({ userId, roomId }) {
  const db = await getDb();
  if (db) {
    await db
      .collection("sessions")
      .updateOne({ userId }, { $set: { currentRoom: roomId } });
    return;
  }

  const session = inMemorySessions.get(userId);
  if (!session) {
    return;
  }

  inMemorySessions.set(userId, {
    ...session,
    currentRoom: roomId,
    lastActive: new Date(),
  });
}
