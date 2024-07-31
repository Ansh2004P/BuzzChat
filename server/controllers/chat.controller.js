import {asyncHandler} from "../utils/asyncHandler.js"
import { Chat } from "../model/chat.model.js"
import { User } from "../model/user.model.js"
import { Message } from "../model/message.model.js"
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import mongoose from "mongoose"

const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body

    if (!userId) {
        console.log("User ID is required")
        throw new ApiError(400, "User Id is required")
    }

    try {
        const isChat = await Chat.aggregate([
            {
                $match: {
                    isGroupChat: false,
                    users: { $all: [req.user._id, userId] },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "users",
                    foreignField: "_id",
                    as: "users",
                },
            },
            {
                $lookup: {
                    from: "messages",
                    localField: "latestMessage",
                    foreignField: "_id",
                    as: "latestMessage",
                },
            },
            {
                $unwind: {
                    path: "$latestMessage",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "latestMessage.sender",
                    foreignField: "_id",
                    as: "latestMessage.sender",
                },
            },
            {
                $unwind: {
                    path: "$latestMessage.sender",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    "users.password": 0,
                    "latestMessage.sender.password": 0,
                },
            },
        ])

        if (isChat.length > 0) {
            return res.status(200).json(isChat[0])
        } else {
            // Create a new chat if not found
            const chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [req.user._id, userId],
            }

            const createChat = await Chat.create(chatData)

            const fullChat = await Chat.findOne({
                _id: createChat._id,
            }).populate("users", "-password", "-refreshToken")

            return res
                .status(200)
                .json(
                    new ApiResponse(200, fullChat, "Chat created successfully")
                )
        }
    } catch (error) {
        throw new ApiError(500, error.message || "Unable to access chats")
    }
})

const fetchChats = asyncHandler(async (req, res) => {
    const userId = req.user._id

    if (!userId) throw new ApiError(400, "User ID is required")

    try {
        const chats = await Chat.aggregate([
            {
                $match: {
                    participants: userId,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "participants",
                    foreignField: "_id",
                    as: "participants",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "admin",
                    foreignField: "_id",
                    as: "admin",
                },
            },
            {
                $lookup: {
                    from: "messages",
                    localField: "lastMessage",
                    foreignField: "_id",
                    as: "lastMessage",
                },
            },
            {
                $unwind: {
                    path: "$latestMessage",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "latestMessage.sender",
                    foreignField: "_id",
                    as: "latestMessage.sender",
                },
            },
            {
                $unwind: {
                    path: "$latestMessage.sender",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $sort: {
                    updatedAt: -1,
                },
            },
            {
                $project: {
                    "participants.password": 0,
                    "latestMessage.sender.password": 0,
                    "admin.password": 0,
                },
            },
        ])

        return res.status.json(
            new ApiResponse(200, chats, "Chats fetched successfully")
        )
    } catch (error) {
        throw new ApiError(500, error.message || "Unable to fetch chats")
    }
})

const createGroupChat = asyncHandler(async (req, res) => {
    if (!req.body.participants || !req.body.username) {
        throw new ApiError(400, "Participants and group name are required")
    }

    let users = JSON.parse(req.body.participants)
    if (users.length < 2) {
        throw new ApiError(400, "Group chat requires at least 2 participants")
    }

    users.push(req.user)

    try {
        const groupChat = await Chat.create({
            chatName: req.body.username,
            participants: users,
            isGroupChat: true,
            admin: [req.user],
        })

        const fullGroupChat = await Chat.findOne({
            _id: groupChat._id,
        })
            .populate("participants", "-password", "-refreshToken")
            .populate("admin", "-password", "-refreshToken")

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    fullGroupChat,
                    "Group chat created successfully"
                )
            )
    } catch (error) {
        throw new ApiError(500, error.message || "Unable to create group chat")
    }
})

const addParticipant = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body

    if (!chatId || !userId) {
        throw new ApiError(400, "Chat ID and User ID are required")
    }

    try {
        const [updatedChat] = await Chat.aggregate([
            //Stage 1: Match the chat by Id
            {
                $match: {
                    _id: chatId,
                },
            },

            // Stage 2: Check if the requester is admin or not
            {
                $addFields: {
                    isAdmin: {
                        $in: [req.user._id, "$admin"],
                    },
                },
            },

            //Stage 3: Update the chat by pushing the userId into the users array
            {
                $addFields: {
                    participants: {
                        $concatArrays: [
                            "$participants",
                            {
                                $cond: [
                                    {
                                        $in: [userId, "$participants"],
                                    },
                                    [],
                                    [userId],
                                ],
                            },
                        ],
                    },
                },
            },

            //Stage 4: Lookup to populate the fields
            {
                $lookup: {
                    from: "users",
                    localField: "participants",
                    foreignField: "_id",
                    as: "participants",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "admin",
                    foreignField: "_id",
                    as: "admin",
                },
            },
            {
                $project: {
                    "participants.password": 0,
                    "admin.password": 0,
                    admin: 1,
                },
            },
        ])

        if (!updatedChat) {
            throw new ApiError(400, "Unable to add participant")
        }

        if (!updatedChat.isAdmin) {
            throw new ApiError(
                403,
                "You are not authorized to add participants"
            )
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedChat,
                    "Participant added successfully"
                )
            )
    } catch (error) {
        throw new ApiError(500, error.message || "Unable to add participant")
    }
})

const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body

    if (!chatId || !userId) {
        throw new ApiError(400, "Chat ID and User ID are required")
    }

    try {
        //check if the user is the admin
        const removed = await Chat.findByIdAndUpdate(
            chatId,
            {
                $pull: { participants: userId },
            },
            {
                new: true,
            }
        )
            .populate("participants", "-password", "-refreshToken")
            .populate("admin", "-password", "-refreshToken")

        if (!removed) {
            throw new ApiError(400, "Unable to remove participant")
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    removed,
                    "Participant removed successfully"
                )
            )
    } catch (error) {
        throw new ApiError(500, error.message || "Unable to remove participant")
    }
})

const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body

    try {
        const updatedName = await Chat.findByIdAndUpdate(
            chatId,
            {
                chatName,
            },
            {
                new: true,
            }
        )
            .populate("participants", "-password", "-refreshToken")
            .populate("admin", "-password", "-refreshToken")

        if (!updatedName) {
            throw new ApiError(400, "Unable to rename group")
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedName,
                    "Group name updated successfully"
                )
            )
    } catch (error) {
        throw new ApiError(500, error.message || "Unable to rename group")
    }
})

const leaveGroupChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params

    // Check if the chat is a group
    const groupChat = await Chat.findOne({
        _id: mongoose.Types.ObjectId(chatId),
        isGroupChat: true,
    })

    if (!groupChat) {
        throw new ApiError(404, "Chat is not a group chat")
    }

    const existingParticipants = groupChat.participants

    // Check if the participant leaving the group is part of the group
    if (!existingParticipants.includes(req.user._id)) {
        throw new ApiError(400, "You are not part of this group")
    }

    // Remove the user from the participants array
    await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { participants: req.user._id },
        },
        { new: true }
    )

    // Check if the chat is empty and optionally delete
    const updatedChat = await Chat.findById(chatId)

    if (updatedChat.participants.length === 0) {
        await Chat.findByIdAndDelete(chatId)
        return res.status(200).json({
            message: "Group chat deleted as it has no participants left",
        })
    }

    // Aggregation pipeline to enrich the chat document
    const chatPipeline = [
        {
            $match: {
                _id: mongoose.Types.ObjectId(chatId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "participants",
                foreignField: "_id",
                as: "participants",
                pipeline: [
                    {
                        $project: {
                            password: 0,
                            refreshToken: 0,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "chatmessages",
                localField: "lastMessage",
                foreignField: "_id",
                as: "lastMessage",
                pipeline: [
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
                            sender: { $first: "$sender" },
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                lastMessage: { $first: "$lastMessage" },
            },
        },
    ]

    // Fetch the updated chat with aggregation pipeline
    const enrichedChat = await Chat.aggregate(chatPipeline).exec()

    if (!enrichedChat) {
        throw new ApiError(500, "Internal server error")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                enrichedChat,
                "You have left the group chat successfully"
            )
        )
})

export {
    accessChat,
    fetchChats,
    createGroupChat,
    addParticipant,
    removeFromGroup,
    renameGroup,
    leaveGroupChat,
}
