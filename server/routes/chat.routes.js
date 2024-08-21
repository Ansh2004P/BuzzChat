import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    accessChat,
    addParticipant,
    createGroupChat,
    fetchChats,
    getChat,
    leaveGroupChat,
    removeFromGroup,
    renameGroup,
    updateGroupChatAvatar,
} from "../controllers/chat.controller.js"
import { uploadAvatar } from "../middlewares/multer.middleware.js"

const router = express.Router()

router.use(verifyJWT)

router.route("/").get(fetchChats)

router.route("/").post(accessChat)
router.route("/group").post(uploadAvatar.single("avatar"), createGroupChat)
router.route("/search-user").get(getChat)

router
    .route("/update-avatar")
    .put(uploadAvatar.single("avatar"), updateGroupChatAvatar)
router.route("/rename").put(renameGroup)
router.route("/groupRemove").put(removeFromGroup)
router.route("/groupAdd").put(addParticipant)
router.route(`/leaveGroup`).put(leaveGroupChat)

export default router
