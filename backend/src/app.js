import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { secureHeaders } from "hono/secure-headers"

import authRoutes from "../routes/authRoutes.js"
import noteRoutes from "../routes/noteRoutes.js"
import profileRoutes from "../routes/profileRoutes.js"

const app = new Hono()

app.use("*", logger())
app.use("*", secureHeaders())

app.use(
    "*",
    cors({
        origin: (origin, c) => {
            const allowedOrigin = c.env.CLIENT_URL

            if (!origin) {
                return allowedOrigin
            }

            return origin === allowedOrigin ? origin : allowedOrigin
        },
        credentials: true,
        allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
    }),
)

app.get("/", (c) => {
    return c.json({
        success: true,
        message: "MyNotes API işləyir.",
    })
})

app.get("/api/health", (c) => {
    return c.json({
        success: true,
        message: "API işləyir.",
        environment: c.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
    })
})

app.get("/api", (c) => {
    return c.json({
        success: true,
        name: "Notes API",
        version: "1.0.0",
        endpoints: {
            health: "/api/health",
            auth: "/api/auth",
            profile: "/api/profile",
            notes: "/api/notes",
        },
    })
})

app.route("/api/auth", authRoutes)
app.route("/api/profile", profileRoutes)
app.route("/api/notes", noteRoutes)

app.notFound((c) => {
    return c.json(
        {
            success: false,
            message: "Endpoint tapılmadı.",
            path: new URL(c.req.url).pathname,
            method: c.req.method,
        },
        404,
    )
})

app.onError((error, c) => {
    console.error("Unhandled error:", error)

    return c.json(
        {
            success: false,
            message: "Serverdə gözlənilməz xəta baş verdi.",
        },
        500,
    )
})

export default app
