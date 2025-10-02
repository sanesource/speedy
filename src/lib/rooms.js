import crypto from "crypto";
import { getDb } from "./mongodb.js";

const ROOM_ID_LENGTH = 6;
const MAX_CAPACITY = 8;

const inMemoryRooms = global.__SPEEDY_ROOMS_STORE ?? new Map();
if (process.env.NODE_ENV === "development") {
  global.__SPEEDY_ROOMS_STORE = inMemoryRooms;
}

function cloneRoom(room) {
  if (!room) {
    return null;
  }
  return {
    ...room,
    participants: room.participants.map((participant) => ({ ...participant })),
    testResults: room.testResults.map((result) => ({ ...result })),
  };
}

function countActiveParticipants(participants) {
  return participants.filter((participant) => participant.isActive).length;
}

function determineLobbyStatus(participants, currentStatus) {
  if (currentStatus === "testing" || currentStatus === "results") {
    return currentStatus;
  }

  return countActiveParticipants(participants) >= 2 ? "ready" : "waiting";
}

function generateRoomId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let roomId = "";

  while (roomId.length < ROOM_ID_LENGTH) {
    const randomIndex = crypto.randomInt(0, chars.length);
    roomId += chars[randomIndex];
  }

  return roomId;
}

async function ensureUniqueRoomId(db) {
  let roomId;
  let exists = true;

  while (exists) {
    roomId = generateRoomId();

    if (db) {
      const count = await db.collection("rooms").countDocuments({ roomId });
      exists = count > 0;
    } else {
      exists = inMemoryRooms.has(roomId);
    }
  }

  return roomId;
}

function updateStatusInMemory(room) {
  room.status = determineLobbyStatus(room.participants, room.status);
  return room;
}

export async function createRoom({ adminId, username }) {
  const db = await getDb();
  const roomId = await ensureUniqueRoomId(db);
  const createdAt = new Date();

  const room = {
    roomId,
    adminId,
    participants: [
      {
        userId: adminId,
        username,
        joinedAt: createdAt,
        isActive: true,
      },
    ],
    status: "waiting",
    maxCapacity: MAX_CAPACITY,
    testResults: [],
    createdAt,
  };

  if (db) {
    await db.collection("rooms").insertOne(room);
  } else {
    inMemoryRooms.set(roomId, room);
  }

  return cloneRoom(room);
}

export async function getRoom(roomId) {
  const db = await getDb();

  if (db) {
    return db.collection("rooms").findOne({ roomId });
  }

  return cloneRoom(inMemoryRooms.get(roomId));
}

export async function updateRoom(roomId, updates) {
  const db = await getDb();

  if (db) {
    const value = await db
      .collection("rooms")
      .findOneAndUpdate(
        { roomId },
        { $set: updates },
        { returnDocument: "after" }
      );
    return value;
  }

  const room = inMemoryRooms.get(roomId);
  if (!room) {
    return null;
  }

  Object.assign(room, updates);
  inMemoryRooms.set(roomId, room);

  return cloneRoom(room);
}

export async function addParticipant(roomId, participant) {
  const db = await getDb();

  if (db) {
    const room = await db.collection("rooms").findOne({ roomId });
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.status === "testing") {
      const error = new Error("Room is locked while testing");
      error.code = "ROOM_LOCKED";
      throw error;
    }

    if (room.participants.length >= room.maxCapacity) {
      const error = new Error("Room is full");
      error.code = "ROOM_FULL";
      throw error;
    }

    const participantDoc = {
      ...participant,
      joinedAt: new Date(),
      isActive: true,
    };

    const value = await db.collection("rooms").findOneAndUpdate(
      { roomId },
      {
        $push: {
          participants: participantDoc,
        },
      },
      { returnDocument: "after" }
    );

    if (!value) {
      const error = new Error("Room not found");
      error.code = "ROOM_NOT_FOUND";
      throw error;
    }

    const status = determineLobbyStatus(value.participants, value.status);
    if (status !== value.status) {
      await db.collection("rooms").updateOne({ roomId }, { $set: { status } });
      value.status = status;
    }

    return value;
  }

  const room = inMemoryRooms.get(roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  if (room.status === "testing") {
    const error = new Error("Room is locked while testing");
    error.code = "ROOM_LOCKED";
    throw error;
  }

  if (room.participants.length >= room.maxCapacity) {
    const error = new Error("Room is full");
    error.code = "ROOM_FULL";
    throw error;
  }

  const participantDoc = {
    ...participant,
    joinedAt: new Date(),
    isActive: true,
  };

  room.participants = [...room.participants, participantDoc];
  updateStatusInMemory(room);
  inMemoryRooms.set(roomId, room);

  return cloneRoom(room);
}

export async function removeParticipant(roomId, userId) {
  const db = await getDb();

  if (db) {
    await db.collection("rooms").updateOne(
      { roomId },
      {
        $pull: {
          participants: { userId },
        },
      }
    );

    const room = await db.collection("rooms").findOne({ roomId });

    if (!room) {
      return null;
    }

    if (room.participants.length === 0) {
      await db.collection("rooms").deleteOne({ roomId });
      return null;
    }

    const status = determineLobbyStatus(room.participants, room.status);
    if (status !== room.status) {
      await db.collection("rooms").updateOne({ roomId }, { $set: { status } });
      room.status = status;
    }

    return room;
  }

  const room = inMemoryRooms.get(roomId);
  if (!room) {
    return null;
  }

  room.participants = room.participants.filter(
    (participant) => participant.userId !== userId
  );

  if (room.participants.length === 0) {
    inMemoryRooms.delete(roomId);
    return null;
  }

  updateStatusInMemory(room);
  inMemoryRooms.set(roomId, room);

  return cloneRoom(room);
}

export async function storeTestResult(roomId, result) {
  const db = await getDb();

  if (db) {
    await db.collection("rooms").updateOne(
      { roomId },
      {
        $pull: {
          testResults: { userId: result.userId },
        },
      }
    );

    const value = await db.collection("rooms").findOneAndUpdate(
      { roomId },
      {
        $push: {
          testResults: {
            ...result,
            testedAt: new Date(),
          },
        },
      },
      { returnDocument: "after" }
    );

    return value;
  }

  const room = inMemoryRooms.get(roomId);
  if (!room) {
    return null;
  }

  room.testResults = room.testResults.filter(
    (entry) => entry.userId !== result.userId
  );
  room.testResults.push({
    ...result,
    testedAt: new Date(),
  });
  inMemoryRooms.set(roomId, room);

  return cloneRoom(room);
}

export async function resetTestResults(roomId) {
  const db = await getDb();

  if (db) {
    const value = await db.collection("rooms").findOneAndUpdate(
      { roomId },
      {
        $set: {
          testResults: [],
        },
      },
      { returnDocument: "after" }
    );

    if (!value) {
      return null;
    }

    const status = determineLobbyStatus(value.participants, value.status);
    if (status !== value.status) {
      await db.collection("rooms").updateOne({ roomId }, { $set: { status } });
      value.status = status;
    }

    return value;
  }

  const room = inMemoryRooms.get(roomId);
  if (!room) {
    return null;
  }

  room.testResults = [];
  updateStatusInMemory(room);
  inMemoryRooms.set(roomId, room);

  return cloneRoom(room);
}

export async function setParticipantActivity(
  roomId,
  userId,
  isActive,
  username
) {
  const db = await getDb();

  if (db) {
    const setUpdate = {
      "participants.$.isActive": isActive,
    };

    if (username) {
      setUpdate["participants.$.username"] = username;
    }

    const value = await db.collection("rooms").findOneAndUpdate(
      { roomId, "participants.userId": userId },
      {
        $set: setUpdate,
      },
      { returnDocument: "after" }
    );

    if (!value) {
      return null;
    }

    const status = determineLobbyStatus(value.participants, value.status);
    if (status !== value.status) {
      await db.collection("rooms").updateOne({ roomId }, { $set: { status } });
      value.status = status;
    }

    return value;
  }

  const room = inMemoryRooms.get(roomId);
  if (!room) {
    return null;
  }

  const participant = room.participants.find(
    (entry) => entry.userId === userId
  );
  if (!participant) {
    return null;
  }

  participant.isActive = isActive;
  if (username) {
    participant.username = username;
  }

  updateStatusInMemory(room);
  inMemoryRooms.set(roomId, room);

  return cloneRoom(room);
}

export async function reactivateParticipant(roomId, userId, username) {
  const updated = await setParticipantActivity(roomId, userId, true, username);
  if (updated) {
    return updated;
  }
  return null;
}

export async function beginSpeedTest(roomId) {
  const db = await getDb();

  if (db) {
    return updateRoom(roomId, { status: "testing", testResults: [] });
  }

  const room = inMemoryRooms.get(roomId);
  if (!room) {
    return null;
  }

  room.status = "testing";
  room.testResults = [];
  inMemoryRooms.set(roomId, room);

  return cloneRoom(room);
}

export async function completeSpeedTest(roomId) {
  const db = await getDb();

  if (db) {
    return updateRoom(roomId, { status: "results" });
  }

  const room = inMemoryRooms.get(roomId);
  if (!room) {
    return null;
  }

  room.status = "results";
  inMemoryRooms.set(roomId, room);

  return cloneRoom(room);
}
