import express, { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { mongoIdPathVariableValidator } from "../validators/mongodb.validators.js"
import { validate } from "../validators/validate.js"
import {
    deleteMessage,
    getAllMessages,
    sendMessage,
} from "../controllers/message.controller.js"
import { uploadAttachment } from "../middlewares/multer.middleware.js"

const router = Router()

router.use(verifyJWT)

// route to get all messages of a chat and to send a message to a chat
router
    .route("/:chatId")
    .get(mongoIdPathVariableValidator("chatId"), validate, getAllMessages)
    .post(
        uploadAttachment.fields([{ name: "attachment", maxCount: 5 }]),
        mongoIdPathVariableValidator("chatId"),
        validate,
        sendMessage
    )

// route to delete a message from a chat based on message id
router
    .route("/:chatId/:messageId")
    .delete(
        mongoIdPathVariableValidator("chatId"),
        mongoIdPathVariableValidator("messageId"),
        validate,
        deleteMessage
    )

export default router
