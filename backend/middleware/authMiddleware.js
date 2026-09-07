import jwt from "jsonwebtoken"
import { log } from "../utils/logger.js"

export const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authentication tələb olunur.",
            })
        }

        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization formatı yanlışdır.",
            })
        }

        const token = authHeader.split(" ")[1]

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token göndərilməyib.",
            })
        }

        if (!process.env.JWT_SECRET) {
            log.error("JWT_SECRET .env faylında yoxdur.")

            return res.status(500).json({
                success: false,
                message: "Server authentication konfiqurasiyası hazır deyil.",
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
        }

        next()
    } catch (error) {
        log.warn(`JWT yoxlanışı uğursuz oldu: ${error.message}`)

        return res.status(401).json({
            success: false,
            message: "Token yanlışdır və ya müddəti bitib.",
        })
    }
}
