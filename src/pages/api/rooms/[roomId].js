import { getRoom } from "@/lib/rooms";

export default async function handler(req, res) {
  const {
    query: { roomId },
  } = req;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const room = await getRoom(roomId);
  if (!room) {
    res.status(404).json({ message: "Room not found" });
    return;
  }

  res.status(200).json({ room });
}
