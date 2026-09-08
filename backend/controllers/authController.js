import bcrypt from "bcryptjs"
import { SignJWT } from "jose"

import { getUserById, getUserByEmail, createUser, emailExists } from "../models/userModel.js"

const generateToken = async (c, user) => {
    const secret = c.env.JWT_SECRET

    if (!secret) {
        throw new Error("JWT_SECRET_MISSING")
    }

    const secretKey = new TextEncoder().encode(secret)

    return await new SignJWT({
        userId: user.id,
        email: user.email,
    })
        .setProtectedHeader({
            alg: "HS256",
            typ: "JWT",
        })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secretKey)
}

const safeUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url,
    bio: user.bio,
    created_at: user.created_at,
    updated_at: user.updated_at,
})

export const register = async (c) => {
    try {
        const body = await c.req.json().catch(() => ({}))

        let { name, email, password } = body

        if (!name || !email || !password) {
            return c.json(
                {
                    success: false,
                    message: "name, email və password tələb olunur.",
                },
                400,
            )
        }

        if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
            return c.json(
                {
                    success: false,
                    message: "Göndərilən məlumatların formatı yanlışdır.",
                },
                400,
            )
        }

        name = name.trim()
        email = email.trim().toLowerCase()

        if (name.length < 2) {
            return c.json(
                {
                    success: false,
                    message: "Ad ən azı 2 simvol olmalıdır.",
                },
                400,
            )
        }

        if (name.length > 100) {
            return c.json(
                {
                    success: false,
                    message: "Ad maksimum 100 simvol ola bilər.",
                },
                400,
            )
        }

        if (!email.includes("@")) {
            return c.json(
                {
                    success: false,
                    message: "Email düzgün deyil.",
                },
                400,
            )
        }

        if (password.length < 8) {
            return c.json(
                {
                    success: false,
                    message: "Şifrə ən azı 8 simvol olmalıdır.",
                },
                400,
            )
        }

        const exists = await emailExists(c.env.DB, email)

        if (exists) {
            return c.json(
                {
                    success: false,
                    message: "Bu email artıq qeydiyyatdan keçib.",
                },
                409,
            )
        }

        const passwordHash = await bcrypt.hash(password, 12)

        const user = await createUser(c.env.DB, {
            name,
            email,
            passwordHash,
        })

        const token = await generateToken(c, user)

        return c.json(
            {
                success: true,
                message: "Qeydiyyat uğurla tamamlandı.",
                user,
                token,
            },
            201,
        )
    } catch (error) {
        console.error("Register xətası:", error)

        if (error.message === "JWT_SECRET_MISSING") {
            return c.json(
                {
                    success: false,
                    message: "Authentication konfiqurasiyasında xəta var.",
                },
                500,
            )
        }

        if (String(error.message).includes("UNIQUE")) {
            return c.json(
                {
                    success: false,
                    message: "Bu email artıq qeydiyyatdan keçib.",
                },
                409,
            )
        }

        return c.json(
            {
                success: false,
                message: "Serverdə gözlənilməz xəta baş verdi.",
            },
            500,
        )
    }
}

export const login = async (c) => {
    try {
        const body = await c.req.json().catch(() => ({}))

        let { email, password } = body

        if (!email || !password) {
            return c.json(
                {
                    success: false,
                    message: "Email və password tələb olunur.",
                },
                400,
            )
        }

        if (typeof email !== "string" || typeof password !== "string") {
            return c.json(
                {
                    success: false,
                    message: "Göndərilən məlumatların formatı yanlışdır.",
                },
                400,
            )
        }

        email = email.trim().toLowerCase()

        const user = await getUserByEmail(c.env.DB, email)

        if (!user) {
            return c.json(
                {
                    success: false,
                    message: "Email və ya password yanlışdır.",
                },
                401,
            )
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash)

        if (!passwordMatch) {
            return c.json(
                {
                    success: false,
                    message: "Email və ya password yanlışdır.",
                },
                401,
            )
        }

        const token = await generateToken(c, user)

        return c.json({
            success: true,
            message: "Login uğurludur.",
            user: safeUser(user),
            token,
        })
    } catch (error) {
        console.error("Login xətası:", error)

        if (error.message === "JWT_SECRET_MISSING") {
            return c.json(
                {
                    success: false,
                    message: "Authentication konfiqurasiyasında xəta var.",
                },
                500,
            )
        }

        return c.json(
            {
                success: false,
                message: "Serverdə gözlənilməz xəta baş verdi.",
            },
            500,
        )
    }
}

export const logout = async (c) => {
    return c.json({
        success: true,
        message: "Logout uğurla tamamlandı.",
    })
}

export const getMe = async (c) => {
    try {
        const user = c.get("user")

        const dbUser = await getUserById(c.env.DB, user.userId)

        if (!dbUser) {
            return c.json(
                {
                    success: false,
                    message: "İstifadəçi tapılmadı.",
                },
                404,
            )
        }

        return c.json({
            success: true,
            user: safeUser(dbUser),
        })
    } catch (error) {
        console.error("GetMe xətası:", error)

        return c.json(
            {
                success: false,
                message: "İstifadəçi məlumatları alınmadı.",
            },
            500,
        )
    }
}
