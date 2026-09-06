import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import requestLogger from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { log } from "./utils/logger.js";

import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Çox sayda sorğu göndərildi. Bir az sonra yenidən cəhd edin.",
  },
});

app.use("/api", apiLimiter);

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

app.use(cookieParser());
app.use(requestLogger);

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API işləyir.",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api", (req, res) => {
  return res.status(200).json({
    success: true,
    name: "Notes API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      profile: "/api/profile",
      notes: "/api/notes",
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notes", noteRoutes);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Endpoint tapılmadı.",
    path: req.originalUrl,
    method: req.method,
  });
});

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  log.success(`Notes API server başladı. Port: ${PORT}`);
  log.success(`URL: http://localhost:${PORT}`);
  log.success(`API: http://localhost:${PORT}/api`);
  log.success(`Health: http://localhost:${PORT}/api/health`);
});

process.on("SIGINT", () => {
  log.info("Server dayandırılır...");

  server.close(() => {
    log.success("Server dayandırıldı.");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  log.info("Server dayandırılır...");

  server.close(() => {
    log.success("Server dayandırıldı.");
    process.exit(0);
  });
});

export default app;
