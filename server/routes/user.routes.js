import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { uploadAvatar } from "../middlewares/multer.middleware.js"
import {
    deleteAvatar,
    deleteUser,
    getAllUsers,
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAvatar,
    updateUsername,
} from "../controllers/user.controller.js"

const router = Router()

// Public routes
router.route("/register").post(uploadAvatar.single("avatar"), registerUser)
router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)

// Protected routes
router.use(verifyJWT) // Apply JWT middleware to all routes below

// User info routes
router.route("/current-user").get(getCurrentUser)
router.route("/users").get(getAllUsers)

// Auth routes
router.route("/logout").post(logoutUser)

// Profile update routes
router.route("/update-username").patch(updateUsername)
router.route("/update-avatar").patch(uploadAvatar.single("avatar"), updateAvatar)
router.route("/delete-avatar").delete(deleteAvatar)

// Account management
router.route("/delete-account").delete(deleteUser)

export default router
