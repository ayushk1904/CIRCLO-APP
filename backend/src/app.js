const express = require("express");
const cors = require("cors");
const path = require("path");

const circleRoutes = require("./routes/circle.routes");
const messageRoutes = require("./routes/message.routes");
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const aiRoutes = require("./routes/ai.routes");

const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS origin not allowed"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  credentials: true,
};

/* ================= MIDDLEWARE ================= */
app.use(cors(corsOptions));

app.options(/.*/, cors(corsOptions));




app.use(express.json());

/* ================= STATIC FILES ================= */
app.use(
  "/uploads",
  express.static(path.resolve(__dirname, "../../uploads"))
);

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/circles", circleRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("Circlo API is running 🚀");
});

module.exports = app;
