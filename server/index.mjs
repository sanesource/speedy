import http from "http";
import express from "express";
import next from "next";

import { getIoInstance } from "../src/lib/socket.js";
import { createRoom, getRoom } from "../src/lib/rooms.js";
import { generateUserId } from "../src/lib/users.js";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT ?? "3000", 10);
const hostname = process.env.HOST ?? "0.0.0.0";

async function main() {
  const nextApp = next({ dev, hostname, port });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  const app = express();

  app.use(express.json());

  app.post("/api/rooms", async (req, res) => {
    try {
      const username = req.body?.username || "Player";
      const adminId = generateUserId();
      const room = await createRoom({ adminId, username });

      res.status(201).json({ room });
    } catch (error) {
      console.error("[speedy] Failed to create room", error);
      res.status(500).json({ message: "Failed to create room" });
    }
  });

  app.get("/api/rooms/:roomId", async (req, res) => {
    try {
      const room = await getRoom(req.params.roomId);
      if (!room) {
        res.status(404).json({ message: "Room not found" });
        return;
      }

      res.status(200).json({ room });
    } catch (error) {
      console.error("[speedy] Failed to fetch room", error);
      res.status(500).json({ message: "Failed to fetch room" });
    }
  });

  app.all("*", (req, res) => {
    return handle(req, res);
  });

  const server = http.createServer(app);

  getIoInstance(server);

  server.listen(port, hostname, () => {
    console.log(`[speedy] server ready on http://${hostname}:${port}`);
  });
}

main().catch((error) => {
  console.error("[speedy] Failed to start server", error);
  process.exit(1);
});
