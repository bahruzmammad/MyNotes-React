import { getUserById, updateUserProfile } from "../models/userModel.js"

export const getProfile = async (c) => {
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
            user: {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                avatar_url: dbUser.avatar_url,
                bio: dbUser.bio,
                created_at: dbUser.created_at,
                updated_at: dbUser.updated_at,
            },
        })
    } catch (error) {
        console.error("Profil GET xətası:", error)

        return c.json(
            {
                success: false,
                message: "Profil məlumatlarını əldə etmək mümkün olmadı.",
            },
            500,
        )
    }
}

export const updateProfile = async (c) => {
    try {
        const user = c.get("user")
        const body = await c.req.json().catch(() => ({}))

        let { name, bio, avatar_url } = body

        if (name !== undefined && typeof name !== "string") {
            return c.json(
                {
                    success: false,
                    message: "name string olmalıdır.",
                },
                400,
            )
        }

        if (bio !== undefined && typeof bio !== "string") {
            return c.json(
                {
                    success: false,
                    message: "bio string olmalıdır.",
                },
                400,
            )
        }

        if (avatar_url !== undefined && typeof avatar_url !== "string") {
            return c.json(
                {
                    success: false,
                    message: "avatar_url string olmalıdır.",
                },
                400,
            )
        }

        name = name !== undefined ? name.trim() : undefined

        bio = bio !== undefined ? bio.trim() : undefined

        avatar_url = avatar_url !== undefined ? avatar_url.trim() : undefined

        if (name !== undefined && name.length < 2) {
            return c.json(
                {
                    success: false,
                    message: "Ad ən azı 2 simvol olmalıdır.",
                },
                400,
            )
        }

        if (name !== undefined && name.length > 100) {
            return c.json(
                {
                    success: false,
                    message: "Ad maksimum 100 simvol ola bilər.",
                },
                400,
            )
        }

        if (bio !== undefined && bio.length > 500) {
            return c.json(
                {
                    success: false,
                    message: "Bio maksimum 500 simvol ola bilər.",
                },
                400,
            )
        }

        if (avatar_url !== undefined && avatar_url.length > 500) {
            return c.json(
                {
                    success: false,
                    message: "Avatar URL maksimum 500 simvol ola bilər.",
                },
                400,
            )
        }

        if (name === undefined && bio === undefined && avatar_url === undefined) {
            return c.json(
                {
                    success: false,
                    message: "Dəyişdiriləcək məlumat göndərilməyib.",
                },
                400,
            )
        }

        const currentUser = await getUserById(c.env.DB, user.userId)

        if (!currentUser) {
            return c.json(
                {
                    success: false,
                    message: "İstifadəçi tapılmadı.",
                },
                404,
            )
        }

        const newName = name !== undefined ? name : currentUser.name

        const newBio = bio !== undefined ? bio : currentUser.bio

        const newAvatar = avatar_url !== undefined ? avatar_url : currentUser.avatar_url

        const result = await updateUserProfile(c.env.DB, user.userId, {
            name: newName,
            bio: newBio,
            avatar_url: newAvatar,
        })

        if (result.changes === 0) {
            return c.json(
                {
                    success: false,
                    message: "İstifadəçi tapılmadı.",
                },
                404,
            )
        }

        const updatedUser = await getUserById(c.env.DB, user.userId)

        return c.json({
            success: true,
            message: "Profil uğurla yeniləndi.",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                bio: updatedUser.bio,
                avatar_url: updatedUser.avatar_url,
            },
        })
    } catch (error) {
        console.error("Profil update xətası:", error)

        return c.json(
            {
                success: false,
                message: "Profil yenilənmədi.",
            },
            500,
        )
    }
}
