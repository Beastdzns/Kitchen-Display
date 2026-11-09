import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocketClient(): Socket {
  if (!socket) {
    socket = io({
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("🟢 Connected to Company A Real-Time Socket Server");
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected from Real-Time Socket Server");
    });
  }

  return socket;
}
