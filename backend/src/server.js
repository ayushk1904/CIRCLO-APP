require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { Server } = require("socket.io");

connectDB();

const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.length === 0) return true;
  return allowedOrigins.includes(origin);
};

const server = http.createServer(app);

/* Socket.io */
const io = new Server(server, {
  cors: {
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("call-user", (data) => {
    socket.to(data.circleId).emit("incoming-call", {
      offer: data.offer,
      callType: data.callType || "video",
      from: socket.id,
    });
  });

  socket.on("answer-call", (data) => {
    socket.to(data.to).emit("call-answered", {
      answer: data.answer,
      from: socket.id,
    });
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.to).emit("ice-candidate", {
      candidate: data.candidate,
      from: socket.id,
    });
  });

  socket.on("end-call", (data) => {
    if (data?.to) {
      socket.to(data.to).emit("call-ended", { from: socket.id });
      return;
    }

    if (data?.circleId) {
      socket.to(data.circleId).emit("call-ended", { from: socket.id });
    }
  });

  socket.on("join-circle", ({ circleId, userId }) => {
    socket.join(circleId);
    socket.circleId = circleId;
    socket.userId = userId;

    if (!onlineUsers[circleId]) {
      onlineUsers[circleId] = new Set();
    }

    onlineUsers[circleId].add(userId);

    io.to(circleId).emit("online-users", {
      circleId,
      users: Array.from(onlineUsers[circleId]),
    });
  });

  socket.on("disconnect", () => {
    const { circleId, userId } = socket;
    if (!circleId || !userId) return;

    onlineUsers[circleId]?.delete(userId);

    io.to(circleId).emit("online-users", {
      circleId,
      users: Array.from(onlineUsers[circleId] || []),
    });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on all interfaces on port ${PORT}`);
});
