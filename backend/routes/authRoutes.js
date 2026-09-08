import { Hono } from "hono"

import { register, login, logout, getMe } from "../controllers/authController.js"

import { protect } from "../middleware/authMiddleware.js"

const router = new Hono()

router.post("/register", register)
router.post("/login", login)
router.post("/logout", protect, logout)
router.get("/me", protect, getMe)

export default router
