import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import messageService from "../services/messageService.js"

const getAllMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params

    await messageService.validateChatAccess(chatId, req.user._id)
    const messages = await messageService.getMessagesByChat(chatId)

    res.status(200).json(
        new ApiResponse(200, messages, "Messages fetched successfully")
    )
})

const sendMessage = asyncHandler(async (req, res) => {
    const { chatId } = req.params
    const { content } = req.body

    const message = await messageService.createMessage(
        chatId,
        content,
        req.files?.attachment,
        req.user._id,
        req
    )

    res.status(201).json(
        new ApiResponse(201, message, "Message sent successfully")
    )
})

const deleteMessage = asyncHandler(async (req, res) => {
    const { chatId, messageId } = req.params

    await messageService.validateUserInChat(chatId, req.user._id)
    const message = await messageService.deleteMessage(messageId, req.user._id)
    await messageService.updateLastMessageAfterDeletion(chatId, messageId)

    res.status(200).json(
        new ApiResponse(200, message, "Message deleted successfully")
    )
})

export { getAllMessages, sendMessage, deleteMessage }
