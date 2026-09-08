import { jwtVerify } from "jose"

export const protect = async (c, next) => {
    try {
        const authHeader = c.req.header("Authorization")

        if (!authHeader) {
            return c.json(
                {
                    success: false,
                    message: "Authentication tələb olunur.",
                },
                401,
            )
        }

        if (!authHeader.startsWith("Bearer ")) {
            return c.json(
                {
                    success: false,
                    message: "Authorization formatı yanlışdır.",
                },
                401,
            )
        }

        const token = authHeader.slice(7).trim()

        if (!token) {
            return c.json(
                {
                    success: false,
                    message: "Token göndərilməyib.",
                },
                401,
            )
        }

        const secret = c.env.JWT_SECRET

        if (!secret) {
            console.error("JWT_SECRET tapılmadı.")

            return c.json(
                {
                    success: false,
                    message: "Server authentication konfiqurasiyası hazır deyil.",
                },
                500,
            )
        }

        const secretKey = new TextEncoder().encode(secret)

        const { payload } = await jwtVerify(token, secretKey, {
            algorithms: ["HS256"],
        })

        if (!payload.userId || !payload.email) {
            return c.json(
                {
                    success: false,
                    message: "Token yanlışdır.",
                },
                401,
            )
        }

        c.set("user", {
            userId: Number(payload.userId),
            email: String(payload.email),
        })

        await next()
    } catch {
        return c.json(
            {
                success: false,
                message: "Token yanlışdır və ya müddəti bitib.",
            },
            401,
        )
    }
}
