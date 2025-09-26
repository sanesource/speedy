import { io } from "socket.io-client";

let socket;

export function getSocketClient() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!socket) {
    const origin = process.env.NEXT_PUBLIC_APP_ORIGIN || window.location.origin;
    socket = io(origin, {
      path: "/api/socket",
      autoConnect: true,
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = undefined;
  }
}
