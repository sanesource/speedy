import { Server } from "socket.io";
import {
  createRoom,
  addParticipant,
  removeParticipant,
  storeTestResult,
  beginSpeedTest,
  completeSpeedTest,
  resetTestResults,
} from "@/lib/rooms";
import {
  assignRoomToSession,
  clearSession,
  generateUserId,
  getSessionBySocket,
  upsertSession,
} from "@/lib/users";
import { isMongoConfigured } from "@/lib/mongodb";

let ioInstance;

function createSocketServer(server) {
  ioInstance = new Server(server, {
    path: "/api/socket",
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_ORIGIN || "*",
    },
  });

  ioInstance.on("connection", (socket) => {
    socket.on("create-room", async ({ username }) => {
      try {
        const userId = generateUserId();
        await upsertSession({
          userId,
          username,
          socketId: socket.id,
          currentRoom: null,
        });

        const room = await createRoom({
          adminId: userId,
          username: username || "Player",
        });
        await assignRoomToSession({ userId, roomId: room.roomId });

        socket.join(room.roomId);
        socket.emit("room-created", {
          roomId: room.roomId,
          adminId: userId,
          userId,
          participants: room.participants,
          status: room.status,
          maxCapacity: room.maxCapacity,
          isPersisted: isMongoConfigured(),
        });
        ioInstance.to(room.roomId).emit("participant-list-update", {
          participants: room.participants,
          status: room.status,
          maxCapacity: room.maxCapacity,
          adminId: room.adminId,
          isPersisted: isMongoConfigured(),
        });
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("join-room", async ({ roomId, username }) => {
      try {
        const userId = generateUserId();
        await upsertSession({
          userId,
          username,
          socketId: socket.id,
          currentRoom: roomId,
        });

        const room = await addParticipant(roomId, {
          userId,
          username: username || "Player",
        });

        socket.join(roomId);
        socket.emit("room-joined", {
          roomId,
          userId,
          status: room.status,
          participants: room.participants,
          adminId: room.adminId,
          maxCapacity: room.maxCapacity,
          isPersisted: isMongoConfigured(),
        });
        ioInstance.to(roomId).emit("participant-list-update", {
          participants: room.participants,
          status: room.status,
          maxCapacity: room.maxCapacity,
          adminId: room.adminId,
          isPersisted: isMongoConfigured(),
        });
      } catch (error) {
        if (error.code === "ROOM_FULL") {
          socket.emit("room-full");
        } else {
          socket.emit("error", { message: error.message });
        }
      }
    });

    socket.on("leave-room", async ({ roomId, userId }) => {
      const room = await removeParticipant(roomId, userId);
      socket.leave(roomId);
      if (room) {
        ioInstance.to(roomId).emit("participant-list-update", {
          participants: room.participants,
          status: room.status,
          maxCapacity: room.maxCapacity,
          adminId: room.adminId,
          isPersisted: isMongoConfigured(),
        });
      }
      await clearSession(userId);
    });

    socket.on("start-speed-test", async ({ roomId }) => {
      const room = await beginSpeedTest(roomId);
      ioInstance.to(roomId).emit("test-started", {
        status: room?.status ?? "testing",
        participants: room?.participants ?? [],
      });
    });

    socket.on("test-progress", ({ roomId, ...payload }) => {
      socket.to(roomId).emit("test-progress", payload);
    });

    socket.on("test-completed", async ({ roomId, ...result }) => {
      const room = await storeTestResult(roomId, result);
      ioInstance.to(roomId).emit("test-completed", result);

      if (room && room.testResults.length === room.participants.length) {
        const updatedRoom = await completeSpeedTest(roomId);
        ioInstance.to(roomId).emit("all-results-ready", {
          results: updatedRoom.testResults,
          roomId,
          isPersisted: isMongoConfigured(),
        });
      }
    });

    socket.on("restart-test", async ({ roomId }) => {
      const room = await resetTestResults(roomId);
      if (!room) {
        return;
      }
      ioInstance.to(roomId).emit("participant-list-update", {
        participants: room.participants,
        status: room.status,
        maxCapacity: room.maxCapacity,
        adminId: room.adminId,
        isPersisted: isMongoConfigured(),
      });
      ioInstance.to(roomId).emit("test-restarted");
    });

    socket.on("disconnect", async () => {
      const session = await getSessionBySocket(socket.id);
      if (!session) {
        return;
      }

      const { currentRoom, userId } = session;
      if (currentRoom) {
        const room = await removeParticipant(currentRoom, userId);
        if (room) {
          ioInstance.to(currentRoom).emit("participant-list-update", {
            participants: room.participants,
            status: room.status,
            maxCapacity: room.maxCapacity,
            adminId: room.adminId,
            isPersisted: isMongoConfigured(),
          });
        } else {
          ioInstance.to(currentRoom).emit("room-closed");
        }
      }

      await clearSession(userId);
    });
  });

  return ioInstance;
}

export function getIoInstance(server) {
  if (ioInstance) {
    return ioInstance;
  }
  if (!server) {
    throw new Error("Socket server not initialized");
  }
  return createSocketServer(server);
}
