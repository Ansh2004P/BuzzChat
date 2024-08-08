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
} from "../controllers/chat.controller.js"

const router = express.Router()

router.use(verifyJWT)

router.route("/").get(fetchChats)

router.route("/").post(accessChat)
router.route("/group").post(createGroupChat)
router.route("/search-user").get(getChat)

router.route("/rename").put(renameGroup)
router.route("/groupRemove").put(removeFromGroup)
router.route("/groupAdd").put(addParticipant)
router.route(`/leaveGroup/:chatId`).put(leaveGroupChat)

export default router
