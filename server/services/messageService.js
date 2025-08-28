import { Message } from "../model/message.model.js"
import { Chat } from "../model/chat.model.js"
import { ApiError } from "../utils/ApiError.js"
import {
    getLocalPath,
    getStaticFilePath,
    removeLocalFile,
} from "../utils/helpers.js"

class MessageService {
    constructor() {
        console.log("MessageService initialized")
    }

    // Validate message content or attachments
    validateMessageData(content, files) {
        if (!content && !files?.length) {
            throw new ApiError(400, "Message content or attachment is required")
        }
    }

    // Process file attachments
    processAttachments(files, req) {
        if (!files?.length) return []

        return files.map((file) => ({
            url: getStaticFilePath(req, file.filename),
            localPath: getLocalPath(file.filename),
        }))
    }

    // Clean up file attachments
    cleanupAttachments(attachments) {
        if (!attachments?.length) return

        attachments.forEach((asset) => {
            try {
                removeLocalFile(asset.localPath)
            } catch (error) {
                console.error(`Failed to remove file: ${asset.localPath}`)
            }
        })
    }

    // Validate chat access
    async validateChatAccess(chatId, userId) {
        const chat = await Chat.findById(chatId)
        if (!chat) {
            throw new ApiError(404, "Chat not found")
        }
        if (!chat.participants?.includes(userId)) {
            throw new ApiError(400, "You are not a part of this chat")
        }
        return chat
    }

    // Get messages by chat
    async getMessagesByChat(chatId) {
        return await Message.find({ chat: chatId })
            .populate("sender", "username avatar email")
            .sort({ createdAt: -1 })
            .select("-createdAt -updatedAt")
    }

    // Create a new message
    async createMessage(chatId, content, files, userId, req) {
        this.validateMessageData(content, files)

        const messageFiles = this.processAttachments(files, req)

        const message = await Message.create({
            sender: userId,
            content: content || "",
            chat: chatId,
            attachment: messageFiles,
        })

        await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id })

        return await Message.findById(message._id).populate(
            "sender",
            "username avatar email"
        )
    }

    // Delete a message
    async deleteMessage(messageId, userId) {
        const message = await Message.findById(messageId)
        if (!message) {
            throw new ApiError(404, "Message not found")
        }

        if (message.sender.toString() !== userId.toString()) {
            throw new ApiError(403, "You are not the sender of this message")
        }

        this.cleanupAttachments(message.attachment)
        await Message.findByIdAndDelete(messageId)
        return message
    }

    // Update last message after deletion
    async updateLastMessageAfterDeletion(chatId, deletedMessageId) {
        const chat = await Chat.findById(chatId)

        if (chat.lastMessage?.toString() === deletedMessageId) {
            const lastMessage = await Message.findOne({ chat: chatId }).sort({
                createdAt: -1,
            })

            await Chat.findByIdAndUpdate(chatId, {
                lastMessage: lastMessage?._id || null,
            })
        }
    }

    // Validate user in chat
    async validateUserInChat(chatId, userId) {
        const chat = await Chat.findOne({ _id: chatId, participants: userId })
        if (!chat) {
            throw new ApiError(404, "Chat not found")
        }
        return chat
    }
}

export default new MessageService()
