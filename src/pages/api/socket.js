import { getIoInstance } from "@/lib/socket";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (!res.socket.server.io) {
    res.socket.server.io = getIoInstance(res.socket.server);
  }
  res.end();
}
