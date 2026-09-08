import { Hono } from "hono"

import {
    getNotes,
    getNote,
    createNoteHandler,
    updateNoteHandler,
    patchNoteHandler,
    deleteNoteHandler,
} from "../controllers/noteController.js"

import { protect } from "../middleware/authMiddleware.js"

const router = new Hono()

router.use("*", protect)

router.get("/", getNotes)
router.get("/:id", getNote)
router.post("/", createNoteHandler)
router.put("/:id", updateNoteHandler)
router.patch("/:id", patchNoteHandler)
router.delete("/:id", deleteNoteHandler)

export default router
