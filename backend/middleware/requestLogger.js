import { log } from "../utils/logger.js";

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    log.request(req.method, req.originalUrl, res.statusCode, duration);
  });

  next();
};

export default requestLogger;
