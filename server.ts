import { createServer } from "http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { parse } from "url";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Global reference for server-side socket emission
declare global {
  var ioServer: SocketIOServer | undefined;
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  global.ioServer = io;

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join outlet room (e.g., KDS tablet at Kondapur)
    socket.on("join:outlet", (outletId: string) => {
      const room = `outlet:${outletId}`;
      socket.join(room);
      console.log(`👨‍🍳 Socket ${socket.id} joined KDS room: ${room}`);
    });

    // Join customer live order tracking room
    socket.on("join:order", (orderId: string) => {
      const room = `order:${orderId}`;
      socket.join(room);
      console.log(`📦 Socket ${socket.id} joined live tracking room: ${room}`);
    });

    // Join admin / catering desk room
    socket.on("join:admin", () => {
      socket.join("admin");
      console.log(`📊 Socket ${socket.id} joined admin room`);
    });

    // KDS order status change (e.g. New -> Preparing -> Ready for pickup -> Rider handoff)
    socket.on("kds:update_status", (data: { orderId: string; outletId: string; status: string; actualReadyAt?: string }) => {
      console.log(`⚡ Order ${data.orderId} status changed to ${data.status}`);
      // Notify customer tracking
      io.to(`order:${data.orderId}`).emit("order:status_updated", data);
      // Notify outlet KDS screens
      io.to(`outlet:${data.outletId}`).emit("kds:ticket_updated", data);
      // Notify central dashboard
      io.to("admin").emit("admin:order_updated", data);
    });

    // KDS manager override (extends promised time or adjusts prep)
    socket.on("kds:manager_override", (data: { orderId: string; outletId: string; overrideMinutes: number; newPromisedAt: string }) => {
      console.log(`⚠️ Manager override for ${data.orderId}: +${data.overrideMinutes} mins`);
      io.to(`order:${data.orderId}`).emit("order:promised_time_adjusted", data);
      io.to(`outlet:${data.outletId}`).emit("kds:ticket_updated", data);
      io.to("admin").emit("admin:order_updated", data);
    });

    // Central CMS 86-ing / item availability toggle
    socket.on("menu:toggle_availability", (data: { outletId: string; menuItemId: string; isAvailable: number }) => {
      console.log(`🛑 Item ${data.menuItemId} at outlet ${data.outletId} set to isAvailable: ${data.isAvailable}`);
      // Broadcast to ALL connected ordering customers & KDS
      io.emit("menu:item_availability_changed", data);
    });

    socket.on("disconnect", () => {
      console.log(`👋 Client disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> 🚀 Company A Biryani & Kitchen Platform ready on http://${hostname}:${port}`);
    console.log(`> 🔌 Real-time WebSockets active on ws://${hostname}:${port}`);
  });
});

