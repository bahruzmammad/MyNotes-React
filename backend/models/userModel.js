export const getUserById = async (db, userId) => {
    return await db
        .prepare(
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
            LIMIT 1
            `,
        )
        .bind(userId)
        .first()
}

export const getUserByEmail = async (db, email) => {
    return await db
        .prepare(
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
            LIMIT 1
            `,
        )
        .bind(email)
        .first()
}

export const createUser = async (db, { name, email, passwordHash }) => {
    const result = await db
        .prepare(
            `
            INSERT INTO users (
                name,
                email,
                password_hash
            )
            VALUES (?, ?, ?)
            `,
        )
        .bind(name, email, passwordHash)
        .run()

    return {
        id: result.meta.last_row_id,
        name,
        email,
    }
}

export const updateUserProfile = async (db, userId, { name, bio, avatar_url }) => {
    const result = await db
        .prepare(
            `
            UPDATE users
            SET
                name = ?,
                bio = ?,
                avatar_url = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            `,
        )
        .bind(name, bio, avatar_url, userId)
        .run()

    return {
        changes: result.meta.changes,
    }
}

export const emailExists = async (db, email) => {
    const user = await db
        .prepare(
            `
            SELECT id
            FROM users
            WHERE email = ?
            LIMIT 1
            `,
        )
        .bind(email)
        .first()

    return Boolean(user)
}
