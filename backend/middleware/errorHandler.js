import { log } from "../utils/logger.js";

export function errorHandler(err, req, res, next) {
  log.error(`Unhandled error: ${err.stack || err.message}`);

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Serverdə gözlənilməz xəta baş verdi.",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
}
