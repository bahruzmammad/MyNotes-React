import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

import { getUserById, getUserByEmail, createUser, emailExists } from "../models/userModel.js"

import { log } from "../utils/logger.js"

const generateToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET .env faylında təyin edilməyib.")
    }

    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        },
    )
}

export const register = async (req, res) => {
    try {
        const body = req.body || {}

        let { name, email, password } = body

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "name, email və password tələb olunur.",
            })
        }

        if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Göndərilən məlumatların formatı yanlışdır.",
            })
        }

        name = name.trim()
        email = email.trim().toLowerCase()

        if (name.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Ad ən azı 2 simvol olmalıdır.",
            })
        }

        if (name.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Ad maksimum 100 simvol ola bilər.",
            })
        }

        if (!email.includes("@")) {
            return res.status(400).json({
                success: false,
                message: "Email düzgün deyil.",
            })
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Şifrə ən azı 8 simvol olmalıdır.",
            })
        }

        const userExists = await emailExists(email)

        if (userExists) {
            return res.status(409).json({
                success: false,
                message: "Bu email artıq qeydiyyatdan keçib.",
            })
        }

        const passwordHash = await bcrypt.hash(password, 12)

        const user = await createUser({
            name,
            email,
            passwordHash,
        })

        const token = generateToken(user)

        log.success(`Yeni user qeydiyyatdan keçdi. ID: ${user.id}`)

        return res.status(201).json({
            success: true,
            message: "Qeydiyyat uğurla tamamlandı.",
            user,
            token,
        })
    } catch (error) {
        log.error(`Register xətası: ${error.message}`)

        if (error.code === "SQLITE_CONSTRAINT") {
            return res.status(409).json({
                success: false,
                message: "Bu email artıq qeydiyyatdan keçib.",
            })
        }

        if (error.message === "JWT_SECRET .env faylında təyin edilməyib.") {
            return res.status(500).json({
                success: false,
                message: "Authentication konfiqurasiyasında xəta var.",
            })
        }

        return res.status(500).json({
            success: false,
            message: "Serverdə gözlənilməz xəta baş verdi.",
        })
    }
}

export const login = async (req, res) => {
    try {
        let { email, password } = req.body || {}

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email və password tələb olunur.",
            })
        }

        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Göndərilən məlumatların formatı yanlışdır.",
            })
        }

        email = email.trim().toLowerCase()

        const user = await getUserByEmail(email)

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email və ya password yanlışdır.",
            })
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash)

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Email və ya password yanlışdır.",
            })
        }

        const token = generateToken(user)

        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar_url: user.avatar_url,
            bio: user.bio,
            created_at: user.created_at,
            updated_at: user.updated_at,
        }

        log.success(`User login oldu. ID: ${user.id}`)

        return res.status(200).json({
            success: true,
            message: "Login uğurludur.",
            user: safeUser,
            token,
        })
    } catch (error) {
        log.error(`Login xətası: ${error.message}`)

        if (error.message === "JWT_SECRET .env faylında təyin edilməyib.") {
            return res.status(500).json({
                success: false,
                message: "Authentication konfiqurasiyasında xəta var.",
            })
        }

        return res.status(500).json({
            success: false,
            message: "Serverdə gözlənilməz xəta baş verdi.",
        })
    }
}

export const logout = (req, res) => {
    const userId = req.user.userId

    log.info(`User logout etdi. ID: ${userId}`)

    return res.status(200).json({
        success: true,
        message: "Logout uğurla tamamlandı.",
    })
}

export const getMe = async (req, res) => {
    try {
        const userId = req.user.userId

        const user = await getUserById(userId)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "İstifadəçi tapılmadı.",
            })
        }

        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar_url: user.avatar_url,
            bio: user.bio,
            created_at: user.created_at,
            updated_at: user.updated_at,
        }

        return res.status(200).json({
            success: true,
            user: safeUser,
        })
    } catch (error) {
        log.error(`GetMe xətası: ${error.message}`)

        return res.status(500).json({
            success: false,
            message: "İstifadəçi məlumatları alınmadı.",
        })
    }
}
