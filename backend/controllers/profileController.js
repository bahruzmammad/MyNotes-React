import db from "../config/database.js"
import { log } from "../utils/logger.js"

export const getProfile = (req, res) => {
    const userId = req.user.userId

    db.get(
        `
    SELECT
      id,
      name,
      email,
      avatar_url,
      bio,
      created_at,
      updated_at
    FROM users
    WHERE id = ?
    `,
        [userId],
        (err, user) => {
            if (err) {
                log.error(`Profil oxuma xətası: ${err.message}`)

                return res.status(500).json({
                    success: false,
                    message: "Profil məlumatlarını əldə etmək mümkün olmadı.",
                })
            }

            if (!user) {
                log.warn(`Profil tapılmadı. User ID: ${userId}`)

                return res.status(404).json({
                    success: false,
                    message: "İstifadəçi tapılmadı.",
                })
            }

            log.info(`Profil əldə edildi. User ID: ${userId}`)

            return res.status(200).json({
                success: true,
                user,
            })
        },
    )
}

export const updateProfile = (req, res) => {
    const userId = req.user.userId

    let { name, bio, avatar_url } = req.body

    if (name !== undefined && typeof name !== "string") {
        return res.status(400).json({
            success: false,
            message: "name string olmalıdır.",
        })
    }

    if (bio !== undefined && typeof bio !== "string") {
        return res.status(400).json({
            success: false,
            message: "bio string olmalıdır.",
        })
    }

    if (avatar_url !== undefined && typeof avatar_url !== "string") {
        return res.status(400).json({
            success: false,
            message: "avatar_url string olmalıdır.",
        })
    }
    name = name !== undefined ? name.trim() : undefined
    bio = bio !== undefined ? bio.trim() : undefined
    avatar_url = avatar_url !== undefined ? avatar_url.trim() : undefined

    if (name !== undefined && name.length < 2) {
        return res.status(400).json({
            success: false,
            message: "Ad ən azı 2 simvol olmalıdır.",
        })
    }

    if (name !== undefined && name.length > 100) {
        return res.status(400).json({
            success: false,
            message: "Ad maksimum 100 simvol ola bilər.",
        })
    }

    if (bio !== undefined && bio.length > 500) {
        return res.status(400).json({
            success: false,
            message: "Bio maksimum 500 simvol ola bilər.",
        })
    }

    if (avatar_url !== undefined && avatar_url.length > 500) {
        return res.status(400).json({
            success: false,
            message: "Avatar URL maksimum 500 simvol ola bilər.",
        })
    }

    if (name === undefined && bio === undefined && avatar_url === undefined) {
        return res.status(400).json({
            success: false,
            message: "Dəyişdiriləcək məlumat göndərilməyib.",
        })
    }

    db.get(
        `
    SELECT
      name,
      bio,
      avatar_url
    FROM users
    WHERE id = ?
    `,
        [userId],
        (err, currentUser) => {
            if (err) {
                log.error(`Profil məlumatı oxunmadı: ${err.message}`)

                return res.status(500).json({
                    success: false,
                    message: "Profil məlumatlarını oxumaq mümkün olmadı.",
                })
            }

            if (!currentUser) {
                log.warn(`User tapılmadı. User ID: ${userId}`)

                return res.status(404).json({
                    success: false,
                    message: "İstifadəçi tapılmadı.",
                })
            }

            const newName = name !== undefined ? name : currentUser.name

            const newBio = bio !== undefined ? bio : currentUser.bio

            const newAvatar = avatar_url !== undefined ? avatar_url : currentUser.avatar_url

            db.run(
                `
        UPDATE users
        SET
          name = ?,
          bio = ?,
          avatar_url = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
                [newName, newBio, newAvatar, userId],
                function (err) {
                    if (err) {
                        log.error(`Profil update xətası: ${err.message}`)

                        return res.status(500).json({
                            success: false,
                            message: "Profil yenilənmədi.",
                        })
                    }

                    if (this.changes === 0) {
                        return res.status(404).json({
                            success: false,
                            message: "İstifadəçi tapılmadı.",
                        })
                    }

                    log.success(`Profil yeniləndi. User ID: ${userId}`)

                    return res.status(200).json({
                        success: true,
                        message: "Profil uğurla yeniləndi.",
                        user: {
                            id: userId,
                            name: newName,
                            bio: newBio,
                            avatar_url: newAvatar,
                        },
                    })
                },
            )
        },
    )
}
