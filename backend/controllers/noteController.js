import {
    getAllNotes,
    getNoteById,
    createNote,
    updateNote,
    patchNote,
    deleteNote,
} from "../models/noteModel.js"

export const getNotes = async (c) => {
    try {
        const user = c.get("user")

        const notes = await getAllNotes(c.env.DB, user.userId)

        return c.json({
            success: true,
            count: notes.length,
            data: notes,
        })
    } catch (error) {
        console.error("Notes GET xətası:", error)

        return c.json(
            {
                success: false,
                message: "Notlar alınmadı.",
            },
            500,
        )
    }
}

export const getNote = async (c) => {
    try {
        const user = c.get("user")
        const noteId = Number(c.req.param("id"))

        if (!Number.isInteger(noteId) || noteId <= 0) {
            return c.json(
                {
                    success: false,
                    message: "Yanlış note ID.",
                },
                400,
            )
        }

        const note = await getNoteById(c.env.DB, noteId, user.userId)

        if (!note) {
            return c.json(
                {
                    success: false,
                    message: "Note tapılmadı.",
                },
                404,
            )
        }

        return c.json({
            success: true,
            data: note,
        })
    } catch (error) {
        console.error("Note GET xətası:", error)

        return c.json(
            {
                success: false,
                message: "Note alınmadı.",
            },
            500,
        )
    }
}

export const createNoteHandler = async (c) => {
    try {
        const user = c.get("user")
        const body = await c.req.json().catch(() => ({}))

        const { title, content, category = "general" } = body

        if (typeof title !== "string" || title.trim().length === 0) {
            return c.json(
                {
                    success: false,
                    message: "Title tələb olunur.",
                },
                400,
            )
        }

        if (typeof content !== "string" || content.trim().length === 0) {
            return c.json(
                {
                    success: false,
                    message: "Content tələb olunur.",
                },
                400,
            )
        }

        const cleanTitle = title.trim()
        const cleanContent = content.trim()
        const cleanCategory = typeof category === "string" ? category.trim() : "general"

        const result = await createNote(
            c.env.DB,
            user.userId,
            cleanTitle,
            cleanContent,
            cleanCategory,
        )

        return c.json(
            {
                success: true,
                message: "Note yaradıldı.",
                data: {
                    id: result.id,
                    user_id: user.userId,
                    title: cleanTitle,
                    content: cleanContent,
                    category: cleanCategory,
                },
            },
            201,
        )
    } catch (error) {
        console.error("Note CREATE xətası:", error)

        return c.json(
            {
                success: false,
                message: "Note yaradılmadı.",
            },
            500,
        )
    }
}

export const updateNoteHandler = async (c) => {
    try {
        const user = c.get("user")
        const noteId = Number(c.req.param("id"))
        const body = await c.req.json().catch(() => ({}))

        const { title, content, category = "general" } = body

        if (!Number.isInteger(noteId) || noteId <= 0) {
            return c.json(
                {
                    success: false,
                    message: "Yanlış note ID.",
                },
                400,
            )
        }

        if (typeof title !== "string" || title.trim().length === 0) {
            return c.json(
                {
                    success: false,
                    message: "Title tələb olunur.",
                },
                400,
            )
        }

        if (typeof content !== "string" || content.trim().length === 0) {
            return c.json(
                {
                    success: false,
                    message: "Content tələb olunur.",
                },
                400,
            )
        }

        const result = await updateNote(
            c.env.DB,
            noteId,
            user.userId,
            title.trim(),
            content.trim(),
            typeof category === "string" ? category.trim() : "general",
        )

        if (result.meta.changes === 0) {
            return c.json(
                {
                    success: false,
                    message: "Note tapılmadı və ya sizə aid deyil.",
                },
                404,
            )
        }

        return c.json({
            success: true,
            message: "Note yeniləndi.",
        })
    } catch (error) {
        console.error("Note PUT xətası:", error)

        return c.json(
            {
                success: false,
                message: "Note yenilənmədi.",
            },
            500,
        )
    }
}

export const patchNoteHandler = async (c) => {
    try {
        const user = c.get("user")
        const noteId = Number(c.req.param("id"))
        const body = await c.req.json().catch(() => ({}))

        if (!Number.isInteger(noteId) || noteId <= 0) {
            return c.json(
                {
                    success: false,
                    message: "Yanlış note ID.",
                },
                400,
            )
        }

        if (
            body.title !== undefined &&
            (typeof body.title !== "string" || body.title.trim().length === 0)
        ) {
            return c.json(
                {
                    success: false,
                    message: "Title düzgün deyil.",
                },
                400,
            )
        }

        if (
            body.content !== undefined &&
            (typeof body.content !== "string" || body.content.trim().length === 0)
        ) {
            return c.json(
                {
                    success: false,
                    message: "Content düzgün deyil.",
                },
                400,
            )
        }

        const fields = {}

        if (body.title !== undefined) {
            fields.title = body.title.trim()
        }

        if (body.content !== undefined) {
            fields.content = body.content.trim()
        }

        if (body.category !== undefined) {
            if (typeof body.category !== "string") {
                return c.json(
                    {
                        success: false,
                        message: "Category düzgün deyil.",
                    },
                    400,
                )
            }

            fields.category = body.category.trim()
        }

        if (body.is_pinned !== undefined) {
            fields.is_pinned = body.is_pinned ? 1 : 0
        }

        if (body.is_archived !== undefined) {
            fields.is_archived = body.is_archived ? 1 : 0
        }

        const result = await patchNote(c.env.DB, noteId, user.userId, fields)

        if (result.meta.changes === 0) {
            return c.json(
                {
                    success: false,
                    message: "Note tapılmadı və ya sizə aid deyil.",
                },
                404,
            )
        }

        return c.json({
            success: true,
            message: "Note yeniləndi.",
        })
    } catch (error) {
        if (error.message === "Yenilənəcək sahə yoxdur.") {
            return c.json(
                {
                    success: false,
                    message: "Yenilənəcək sahə yoxdur.",
                },
                400,
            )
        }

        console.error("Note PATCH xətası:", error)

        return c.json(
            {
                success: false,
                message: "Note yenilənmədi.",
            },
            500,
        )
    }
}

export const deleteNoteHandler = async (c) => {
    try {
        const user = c.get("user")
        const noteId = Number(c.req.param("id"))

        if (!Number.isInteger(noteId) || noteId <= 0) {
            return c.json(
                {
                    success: false,
                    message: "Yanlış note ID.",
                },
                400,
            )
        }

        const result = await deleteNote(c.env.DB, noteId, user.userId)

        if (result.meta.changes === 0) {
            return c.json(
                {
                    success: false,
                    message: "Note tapılmadı və ya sizə aid deyil.",
                },
                404,
            )
        }

        return c.json({
            success: true,
            message: "Note silindi.",
        })
    } catch (error) {
        console.error("Note DELETE xətası:", error)

        return c.json(
            {
                success: false,
                message: "Note silinmədi.",
            },
            500,
        )
    }
}
