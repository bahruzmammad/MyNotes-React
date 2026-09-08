import { Hono } from "hono"

import { getProfile, updateProfile } from "../controllers/profileController.js"

import { protect } from "../middleware/authMiddleware.js"

const router = new Hono()

router.get("/", protect, getProfile)
router.put("/", protect, updateProfile)

export default router
