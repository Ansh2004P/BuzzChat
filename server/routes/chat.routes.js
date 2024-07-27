import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    accessChat,
    addParticipant,
    createGroupChat,
    fetchChats,
    removeFromGroup,
    renameGroup,
} from "../controllers/chat.controller.js"

const router = express.Router()

router.use(verifyJWT)

router.route("/").get(fetchChats)

router.route("/").post(accessChat)
router.route("/group").post(createGroupChat)

router.route("/rename").put(renameGroup)
router.route("/groupRemove").put(removeFromGroup)
router.route("/groupAdd").put(addParticipant)

export default router
