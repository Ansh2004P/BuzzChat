import { asyncHandler } from "../utils/asyncHandler.js"
import { Message } from "../model/message.model.js"
import { User } from "../model/user.model.js"
import mongoose from "mongoose"
import { Chat } from "../model/chat.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {
    getLocalPath,
    getStaticFilePath,
    removeLocalFile,
} from "../utils/helpers.js"
import { emitSocketEvent } from "../socket/index.js"
import { ChatEventEnum } from "../constant.js"

const chatMessageCommonAggregation = () => {
    return [
        {
            $lookup: {
                from: "users",
                localField: "sender",
                foreignField: "_id",
                as: "sender",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            email: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                sender: {
                    $first: "$sender",
                },
            },
        },
    ]
}

const getAllMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params

    const selectedChat = await Chat.findById(chatId)

    if (!selectedChat) {
        throw new ApiError(404, "Chat not found")
    }

    // Only send messages if the logged in user is a part of the chat he is requesting messages of
    if (!selectedChat.participants?.includes(req.user?._id)) {
        throw new ApiError(400, "You are not a part of this chat")
    }

    const messages = await Message.aggregate([
        {
            $match: {
                chat: new mongoose.Types.ObjectId(chatId),
            },
        },
        ...chatMessageCommonAggregation(),
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $project: {
                createdAt: 0,
                updatedAt: 0,
            },
        },
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                messages || [],
                "Messages fetched successfully"
            )
        )
})

const sendMessage = asyncHandler(async (req, res) => {
    const { chatId } = req.params
    const { content } = req.body

    // console.log(chatId)

    if (!content && (!req.files || req.files.attachment.length === 0)) {
        throw new ApiError(400, "Message content or attachment is required")
    }

    const selectedChat = await Chat.findById(chatId)
    // console.log(selectedChat +" i")
    if (!selectedChat) {
        throw new ApiError(404, "Chat not found")
    }

    const messageFiles = []
    if (req.files && req.files.attachment?.length > 0) {
        req.files.attachment.map((file) => {
            messageFiles.push({
                url: getStaticFilePath(req, file.filename),
                localPath: getLocalPath(file.filename),
            })
        })
    }

    const message = await Message.create({
        sender: new mongoose.Types.ObjectId(req.user._id),
        content: content || "",
        chat: new mongoose.Types.ObjectId(chatId),
        attachment: messageFiles,
    })

    const chat = await Chat.findByIdAndUpdate(
        chatId,
        { $set: { lastMessage: message._id } },
        { new: true }
    )

    const messages = await Message.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(message._id) } },
        ...chatMessageCommonAggregation(),
    ])

    const receivedMessage = messages[0]
    if (!receivedMessage) {
        throw new ApiError(500, "Error while sending message")
    }

    // chat.participants.forEach((participantObjectId) => {
    //     if (participantObjectId.toString() === req.user._id.toString()) return

    //     emitSocketEvent(
    //         req,
    //         participantObjectId.toString(),
    //         ChatEventEnum.MESSAGE_RECEIVED_EVENT,
    //         receivedMessage
    //     )
    // })

    return res
        .status(201)
        .json(
            new ApiResponse(201, receivedMessage, "Message sent successfully")
        )
})

const deleteMessage = asyncHandler(async (req, res) => {
    const { chatId, messageId } = req.params

    const chat = await Chat.findOne({
        _id: chatId,
        participants: req.user._id,
    })

    if (!chat) {
        throw new ApiError(404, "Chat not found")
    }

    // Find the message to be deleted based on message id
    const message = await Message.findOne({
        _id: new mongoose.Types.ObjectId(messageId),
    })

    if (!message) {
        throw new ApiError(404, "Message not found")
    }

    //Check if user is the sender of the message
    if (message.sender.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not the sender of this message")
    }

    if (message.attachment.length > 0) {
        // If the message is attachment, remove the attachments from the server
        message.attachments.map((asset) => {
            removeLocalFile(asset.localPath)
        })
    }

    // Delete the message from the database
    await Message.deleteOne({
        _id: new mongoose.Types.ObjectId(messageId),
    })

    //Updating the last message of the chat to the previous message after deletion if the message deleted was last message
    if (chat.lastMessage.toString() === messageId._id.toString()) {
        const lastMessage = await Message.findOne(
            {
                chat: chatId,
            },
            {},
            {
                sort: { createdAt: -1 },
            }
        )

        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: lastMessage ? lastMessage?._id : null,
        })
    }

    // logic to emit socket event about the message deleted  to the other participants
    chat.participants.forEach((participantObjectId) => {
        // avoid emitting event to the user who is deleting the message
        if (participantObjectId.toString() === req.user._id.toString()) return

        // emit the delete message event to the other participants frontend with delete messageId as the payload
        emitSocketEvent(
            req,
            participantObjectId.toString(),
            ChatEventEnum.MESSAGE_DELETE_EVENT,
            message
        )
    })

    return res
        .status(200)
        .json(new ApiResponse(200, message, "Message deleted successfully"))
})

export { getAllMessages, sendMessage, deleteMessage }
