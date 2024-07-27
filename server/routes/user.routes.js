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

router.route("/").get((_, res) => {
    res.send("User Route")
})

router
    .route("/")
    .post(uploadAvatar.single("avatar"), registerUser)
    .get(verifyJWT, getAllUsers)
router.route("/login").post(loginUser)

//secured Routes
router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/update-username").patch(verifyJWT, updateUsername)
router
    .route("/update-avatar")
    .patch(verifyJWT, uploadAvatar.single("avatar"), updateAvatar)
router.route("/delete-avatar").delete(verifyJWT, deleteAvatar)
router.route("/delete-user").delete(verifyJWT, deleteUser)

export default router
