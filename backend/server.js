import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import "./config/database.js";

import requestLogger from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

import { log } from "./utils/logger.js";

// ============================================================
// APP
// ============================================================

const app = express();

// ============================================================
// CONFIG
// ============================================================

const PORT = Number(process.env.PORT) || 5000;

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ============================================================
// SECURITY
// ============================================================

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

// Basic API rate limit
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

// ============================================================
// CORS
// ============================================================

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ============================================================
// BODY PARSERS
// ============================================================

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

// Cookies
app.use(cookieParser());

// ============================================================
// REQUEST LOGGER
// ============================================================

app.use(requestLogger);

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API işləyir.",
    database: "SQLite",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// API INFO
// ============================================================

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

// ============================================================
// ROUTES
// ============================================================

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notes", noteRoutes);

// ============================================================
// 404
// ============================================================

app.use((req, res) => {
  log.warn(`404 Route: ${req.method} ${req.originalUrl}`);

  return res.status(404).json({
    success: false,
    message: "Endpoint tapılmadı.",
    path: req.originalUrl,
    method: req.method,
  });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(errorHandler);

// ============================================================
// START SERVER
// ============================================================

const server = app.listen(PORT, () => {
  console.log("");

  console.log("========================================");
  console.log("          NOTES API SERVER");
  console.log("========================================");
  console.log(`ENVIRONMENT: ${process.env.NODE_ENV || "development"}`);
  console.log(`PORT: ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log(`HEALTH: http://localhost:${PORT}/api/health`);
  console.log(`AUTH: http://localhost:${PORT}/api/auth`);
  console.log(`PROFILE: http://localhost:${PORT}/api/profile`);
  console.log(`NOTES: http://localhost:${PORT}/api/notes`);
  console.log(`CLIENT: ${CLIENT_URL}`);
  console.log("========================================");

  console.log("");

  log.success("Server uğurla başladıldı.");
});

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

const shutdown = (signal) => {
  log.warn(`${signal} alındı. Server dayandırılır...`);

  server.close(() => {
    log.success("HTTP server bağlandı.");
    process.exit(0);
  });
};

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

// ============================================================
// UNHANDLED ERRORS
// ============================================================

process.on("uncaughtException", (error) => {
  log.error(`Uncaught Exception: ${error.message}`);
  console.error(error);
});

process.on("unhandledRejection", (reason) => {
  log.error(`Unhandled Rejection: ${reason}`);
  console.error(reason);
});
