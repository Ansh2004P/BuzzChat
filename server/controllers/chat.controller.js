import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import chatService from "../services/chatService.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const accessChat = asyncHandler(async (req, res) => {
    const { userId, isGroupChat } = req.body

    if (!userId) {
        throw new ApiError(400, "User ID is required")
    }

    let chat

    if (isGroupChat) {
        // Access existing group chat
        chat = await chatService.getChatById(userId)
        if (!chat || !chat.isGroupChat) {
            throw new ApiError(404, "Group chat not found")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, chat, "Group chat retrieved successfully"))
    } else {
        // Handle one-on-one chat
        if (userId === req.user._id.toString()) {
            throw new ApiError(400, "You cannot chat with yourself")
        }

        // Check if chat already exists
        chat = await chatService.findOneOnOneChat(req.user._id, userId)
        
        if (chat) {
            return res
                .status(200)
                .json(new ApiResponse(200, chat, "Chat retrieved successfully"))
        }

        // Create new one-on-one chat
        chat = await chatService.createOneOnOneChat(req.user._id, userId)

        return res
            .status(201)
            .json(new ApiResponse(201, chat, "Chat created successfully"))
    }
})

const fetchChats = asyncHandler(async (req, res) => {
    const chats = await chatService.getUserChats(req.user._id)

    return res
        .status(200)
        .json(new ApiResponse(200, chats, "Chats fetched successfully"))
})

const getChat = asyncHandler(async (req, res) => {
    const { search } = req.query
    const users = await chatService.searchUsers(req.user._id, search)

    return res
        .status(200)
        .json(new ApiResponse(200, users, "Users fetched successfully"))
})

const createGroupChat = asyncHandler(async (req, res) => {
    let { chatName, participants } = req.body

    if (!chatName) {
        throw new ApiError(400, "Group chat name is required")
    }

    // Parse participants if it's a string (from form-data)
    if (typeof participants === 'string') {
        participants = JSON.parse(participants)
    }

    if (!participants || !Array.isArray(participants)) {
        throw new ApiError(400, "Participants array is required")
    }

    // Handle avatar upload
    let avatarUrl = null
    if (req.file) {
        const avatar = await uploadOnCloudinary(req.file.path)
        if (avatar) {
            avatarUrl = avatar.url
        }
    }

    const groupChat = await chatService.createGroupChat(
        chatName,
        participants,
        req.user._id,
        avatarUrl
    )

    return res
        .status(201)
        .json(new ApiResponse(201, groupChat, "Group chat created successfully"))
})

const addParticipant = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body

    if (!chatId || !userId) {
        throw new ApiError(400, "Chat ID and User ID are required")
    }

    const updatedChat = await chatService.addParticipant(chatId, userId, req.user._id)

    return res
        .status(200)
        .json(new ApiResponse(200, updatedChat, "Participant added successfully"))
})

const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body

    if (!chatId || !userId) {
        throw new ApiError(400, "Chat ID and User ID are required")
    }

    const updatedChat = await chatService.removeParticipant(chatId, userId, req.user._id)

    return res
        .status(200)
        .json(new ApiResponse(200, updatedChat, "Participant removed successfully"))
})

const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body

    if (!chatId || !chatName) {
        throw new ApiError(400, "Chat ID and new name are required")
    }

    const updatedChat = await chatService.renameGroup(chatId, chatName, req.user._id)

    return res
        .status(200)
        .json(new ApiResponse(200, updatedChat, "Group renamed successfully"))
})

const leaveGroupChat = asyncHandler(async (req, res) => {
    const { chatId } = req.body

    if (!chatId) {
        throw new ApiError(400, "Chat ID is required")
    }

    const result = await chatService.leaveGroup(chatId, req.user._id)

    if (!result) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Group chat deleted (no participants left)"))
    }

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Left group successfully"))
})

const updateGroupChatAvatar = asyncHandler(async (req, res) => {
    const { chatId } = req.body

    if (!chatId) {
        throw new ApiError(400, "Chat ID is required")
    }

    const updatedChat = await chatService.updateGroupAvatar(chatId, req.file, req.user._id)

    return res
        .status(200)
        .json(new ApiResponse(200, updatedChat, "Group avatar updated successfully"))
})

export {
    accessChat,
    fetchChats,
    createGroupChat,
    addParticipant,
    removeFromGroup,
    renameGroup,
    leaveGroupChat,
    getChat,
    updateGroupChatAvatar,
}
