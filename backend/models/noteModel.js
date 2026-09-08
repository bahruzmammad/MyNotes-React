export const getAllNotes = async (db, userId) => {
    const result = await db
        .prepare(
            `
            SELECT
                id,
                user_id,
                title,
                content,
                category,
                is_pinned,
                is_archived,
                created_at,
                updated_at
            FROM notes
            WHERE user_id = ?
            ORDER BY
                is_pinned DESC,
                updated_at DESC,
                id DESC
            `,
        )
        .bind(userId)
        .all()

    return result.results
}

export const getNoteById = async (db, id, userId) => {
    return await db
        .prepare(
            `
            SELECT
                id,
                user_id,
                title,
                content,
                category,
                is_pinned,
                is_archived,
                created_at,
                updated_at
            FROM notes
            WHERE id = ?
              AND user_id = ?
            LIMIT 1
            `,
        )
        .bind(id, userId)
        .first()
}

export const createNote = async (db, userId, title, content, category = "general") => {
    const result = await db
        .prepare(
            `
            INSERT INTO notes (
                user_id,
                title,
                content,
                category,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `,
        )
        .bind(userId, title, content, category)
        .run()

    return {
        id: result.meta.last_row_id,
    }
}

export const updateNote = async (db, id, userId, title, content, category) => {
    return await db
        .prepare(
            `
            UPDATE notes
            SET
                title = ?,
                content = ?,
                category = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
              AND user_id = ?
            `,
        )
        .bind(title, content, category, id, userId)
        .run()
}

export const patchNote = async (db, id, userId, fields) => {
    const allowedFields = ["title", "content", "category", "is_pinned", "is_archived"]

    const updates = []
    const values = []

    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(fields, field)) {
            updates.push(`${field} = ?`)
            values.push(fields[field])
        }
    }

    if (updates.length === 0) {
        throw new Error("Yenilənəcək sahə yoxdur.")
    }

    updates.push("updated_at = CURRENT_TIMESTAMP")

    values.push(id, userId)

    return await db
        .prepare(
            `
            UPDATE notes
            SET ${updates.join(", ")}
            WHERE id = ?
              AND user_id = ?
            `,
        )
        .bind(...values)
        .run()
}

export const deleteNote = async (db, id, userId) => {
    return await db
        .prepare(
            `
            DELETE FROM notes
            WHERE id = ?
              AND user_id = ?
            `,
        )
        .bind(id, userId)
        .run()
}
