import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";

dotenv.config();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.APP_URL || "http://localhost:3000",
      process.env.API_URL || "http://localhost:3001",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store active conversations
const activeConversations = new Map<string, string>(); // socketId -> conversationId

io.on("connection", (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);

  // Join conversation room
  socket.on("join_conversation", (conversationId: string) => {
    socket.join(`conv:${conversationId}`);
    activeConversations.set(socket.id, conversationId);
    console.log(`[WS] ${socket.id} joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on("leave_conversation", (conversationId: string) => {
    socket.leave(`conv:${conversationId}`);
    activeConversations.delete(socket.id);
    console.log(`[WS] ${socket.id} left conversation ${conversationId}`);
  });

  // Typing indicator
  socket.on("typing", (conversationId: string) => {
    socket.to(`conv:${conversationId}`).emit("user_typing", {
      conversationId,
      socketId: socket.id,
    });
  });

  // Stop typing
  socket.on("stop_typing", (conversationId: string) => {
    socket.to(`conv:${conversationId}`).emit("user_stop_typing", {
      conversationId,
      socketId: socket.id,
    });
  });

  // Handle stream chunks from API
  socket.on("stream_chunk", (data: { conversationId: string; chunk: any }) => {
    socket.to(`conv:${data.conversationId}`).emit("stream_chunk", data.chunk);
  });

  // Disconnect
  socket.on("disconnect", () => {
    const conversationId = activeConversations.get(socket.id);
    if (conversationId) {
      socket.leave(`conv:${conversationId}`);
      activeConversations.delete(socket.id);
    }
    console.log(`[WS] Client disconnected: ${socket.id}`);
  });
});

// Health check endpoint
httpServer.on("request", (req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", connections: io.engine.clientsCount }));
  }
});

const port = parseInt(process.env.PORT || "3003");

httpServer.listen(port, () => {
  console.log(`🔥 Phoenix WebSocket server running on port ${port}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Shutting down WebSocket server...");
  io.close(() => {
    httpServer.close(() => {
      process.exit(0);
    });
  });
});
