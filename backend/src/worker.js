import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { secureHeaders } from "hono/secure-headers"

import authRoutes from "../routes/authRoutes.js"
import noteRoutes from "../routes/noteRoutes.js"
import profileRoutes from "../routes/profileRoutes.js"

const app = new Hono()

app.use(
    "*",
    cors({
        origin: (origin, c) => {
            const clientUrl = c.env.CLIENT_URL || "http://localhost:5173"

            return origin === clientUrl ? origin : clientUrl
        },
        credentials: true,
        allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
    }),
)

app.use("*", secureHeaders())
app.use("*", logger())

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

app.get("/api/db-test", async (c) => {
    const result = await c.env.DB.prepare(
        `
            SELECT name
            FROM sqlite_master
            WHERE type = 'table'
            ORDER BY name
            `,
    ).all()

    return c.json({
        success: true,
        tables: result.results,
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
    console.error(error)

    return c.json(
        {
            success: false,
            message: "Serverdə gözlənilməz xəta baş verdi.",
        },
        500,
    )
})

export default app
