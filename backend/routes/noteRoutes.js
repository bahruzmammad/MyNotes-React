import express from "express"

import {
    getNotes,
    getNote,
    createNote,
    updateNote,
    patchNote,
    deleteNote,
} from "../controllers/noteController.js"

import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

router.use(protect)

router.get("/", getNotes)
router.get("/:id", getNote)
router.post("/", createNote)
router.put("/:id", updateNote)
router.patch("/:id", patchNote)
router.delete("/:id", deleteNote)

export default router
