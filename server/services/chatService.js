import { Chat } from "../model/chat.model.js"
import { User } from "../model/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

class ChatService {
    constructor() {
        console.log("ChatService initialized")
    }

    // Get chat with populated participants and last message
    async getChatById(chatId) {
        return await Chat.findById(chatId)
            .populate("participants", "username avatar email")
            .populate("admin", "username avatar email")
            .populate({
                path: "lastMessage",
                populate: {
                    path: "sender",
                    select: "username avatar email",
                },
            })
    }

    // Get all user chats
    async getUserChats(userId) {
        return await Chat.find({ participants: userId })
            .populate("participants", "username avatar email")
            .populate("admin", "username avatar email")
            .populate({
                path: "lastMessage",
                populate: {
                    path: "sender",
                    select: "username avatar email",
                },
            })
            .sort({ updatedAt: -1 })
    }

    // Find existing one-on-one chat
    async findOneOnOneChat(user1Id, user2Id) {
        return await Chat.findOne({
            isGroupChat: false,
            participants: { $all: [user1Id, user2Id] },
        })
            .populate("participants", "username avatar email")
            .populate({
                path: "lastMessage",
                populate: {
                    path: "sender",
                    select: "username avatar email",
                },
            })
    }

    // Create one-on-one chat
    async createOneOnOneChat(user1Id, user2Id) {
        const newChat = await Chat.create({
            chatName: "One-on-one chat",
            participants: [user1Id, user2Id],
            admin: [user1Id],
            isGroupChat: false,
        })

        return await this.getChatById(newChat._id)
    }

    // Create group chat
    async createGroupChat(chatName, participants, adminId, avatarUrl = null) {
        if (participants.length < 2) {
            throw new ApiError(
                400,
                "Group chat requires at least 2 participants"
            )
        }

        // Add admin to participants if not already included
        if (!participants.includes(adminId)) {
            participants.push(adminId)
        }

        const groupData = {
            chatName,
            participants,
            admin: [adminId],
            isGroupChat: true,
        }

        if (avatarUrl) {
            groupData.avatar = avatarUrl
        }

        const newGroup = await Chat.create(groupData)
        return await this.getChatById(newGroup._id)
    }

    // Add participant to group
    async addParticipant(chatId, participantId, adminId) {
        const chat = await Chat.findById(chatId)

        if (!chat) {
            throw new ApiError(404, "Chat not found")
        }

        if (!chat.isGroupChat) {
            throw new ApiError(
                400,
                "Cannot add participants to one-on-one chat"
            )
        }

        if (!chat.admin.includes(adminId)) {
            throw new ApiError(403, "Only admins can add participants")
        }

        if (chat.participants.includes(participantId)) {
            throw new ApiError(400, "User is already a participant")
        }

        const user = await User.findById(participantId)
        if (!user) {
            throw new ApiError(404, "User not found")
        }

        chat.participants.push(participantId)
        await chat.save()

        return await this.getChatById(chatId)
    }

    // Remove participant from group
    async removeParticipant(chatId, participantId, adminId) {
        const chat = await Chat.findById(chatId)

        if (!chat) {
            throw new ApiError(404, "Chat not found")
        }

        if (!chat.isGroupChat) {
            throw new ApiError(
                400,
                "Cannot remove participants from one-on-one chat"
            )
        }

        if (!chat.admin.includes(adminId)) {
            throw new ApiError(403, "Only admins can remove participants")
        }

        if (!chat.participants.includes(participantId)) {
            throw new ApiError(400, "User is not a participant")
        }

        chat.participants = chat.participants.filter(
            (id) => !id.equals(participantId)
        )

        // Remove from admin if they were admin
        chat.admin = chat.admin.filter((id) => !id.equals(participantId))

        await chat.save()

        return await this.getChatById(chatId)
    }

    // Leave group chat
    async leaveGroup(chatId, userId) {
        const chat = await Chat.findById(chatId)

        if (!chat) {
            throw new ApiError(404, "Chat not found")
        }

        if (!chat.isGroupChat) {
            throw new ApiError(400, "Cannot leave one-on-one chat")
        }

        if (!chat.participants.includes(userId)) {
            throw new ApiError(400, "You are not a participant of this chat")
        }

        chat.participants = chat.participants.filter((id) => !id.equals(userId))
        chat.admin = chat.admin.filter((id) => !id.equals(userId))

        // If no participants left, delete the chat
        if (chat.participants.length === 0) {
            await Chat.findByIdAndDelete(chatId)
            return null
        }

        // If no admins left, make first participant admin
        if (chat.admin.length === 0 && chat.participants.length > 0) {
            chat.admin.push(chat.participants[0])
        }

        await chat.save()
        return await this.getChatById(chatId)
    }

    // Rename group chat
    async renameGroup(chatId, newName, userId) {
        const chat = await Chat.findById(chatId)

        if (!chat) {
            throw new ApiError(404, "Chat not found")
        }

        if (!chat.isGroupChat) {
            throw new ApiError(400, "Cannot rename one-on-one chat")
        }

        if (!chat.admin.includes(userId)) {
            throw new ApiError(403, "Only admins can rename the group")
        }

        chat.chatName = newName
        await chat.save()

        return await this.getChatById(chatId)
    }

    // Update group avatar
    async updateGroupAvatar(chatId, file, userId) {
        const chat = await Chat.findById(chatId)

        if (!chat) {
            throw new ApiError(404, "Chat not found")
        }
        if (!chat.isGroupChat) {
            throw new ApiError(400, "Cannot update avatar for one-on-one chat")
        }
        if (!chat.admin.includes(userId)) {
            throw new ApiError(403, "Only admins can update group avatar")
        }

        if (!file) {
            throw new ApiError(400, "Avatar file is required")
        }

        const avatar = await uploadOnCloudinary(file.path)
        if (!avatar) {
            throw new ApiError(500, "Avatar upload failed")
        }

        chat.avatar = avatar.url
        await chat.save()

        return await this.getChatById(chatId)
    }

    // Search users for chat
    async searchUsers(currentUserId, searchQuery = "") {
        const matchQuery = { _id: { $ne: currentUserId } }

        if (searchQuery) {
            matchQuery.$or = [
                { username: { $regex: searchQuery, $options: "i" } },
                { email: { $regex: searchQuery, $options: "i" } },
            ]
        }

        return await User.find(matchQuery).select("username avatar email")
    }

    // Validate user access to chat
    async validateChatAccess(chatId, userId) {
        const chat = await Chat.findById(chatId)

        if (!chat) {
            throw new ApiError(404, "Chat not found")
        }

        if (!chat.participants.includes(userId)) {
            throw new ApiError(403, "You are not a participant of this chat")
        }

        return chat
    }
}

export default new ChatService()
