import { createRoom } from "@/lib/rooms";
import { generateUserId } from "@/lib/users";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const username = req.body?.username || "Player";
  const adminId = generateUserId();

  const room = await createRoom({ adminId, username });

  res.status(201).json({ room });
}
