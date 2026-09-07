import db from "../config/database.js"

export const getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        db.get(
            `
            SELECT
                id,
                name,
                email,
                password_hash,
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
                    reject(err)
                    return
                }

                resolve(user)
            },
        )
    })
}

export const getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.get(
            `
            SELECT
                id,
                name,
                email,
                password_hash,
                avatar_url,
                bio,
                created_at,
                updated_at
            FROM users
            WHERE email = ?
            `,
            [email],
            (err, user) => {
                if (err) {
                    reject(err)
                    return
                }

                resolve(user)
            },
        )
    })
}

export const createUser = ({ name, email, passwordHash }) => {
    return new Promise((resolve, reject) => {
        db.run(
            `
            INSERT INTO users (
                name,
                email,
                password_hash
            )
            VALUES (?, ?, ?)
            `,
            [name, email, passwordHash],
            function (err) {
                if (err) {
                    reject(err)
                    return
                }

                resolve({
                    id: this.lastID,
                    name,
                    email,
                })
            },
        )
    })
}

export const updateUserProfile = (userId, { name, bio, avatar_url }) => {
    return new Promise((resolve, reject) => {
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
            [name, bio, avatar_url, userId],
            function (err) {
                if (err) {
                    reject(err)
                    return
                }

                resolve({
                    changes: this.changes,
                })
            },
        )
    })
}

export const emailExists = (email) => {
    return new Promise((resolve, reject) => {
        db.get(
            `
            SELECT id
            FROM users
            WHERE email = ?
            `,
            [email],
            (err, user) => {
                if (err) {
                    reject(err)
                    return
                }

                resolve(Boolean(user))
            },
        )
    })
}
