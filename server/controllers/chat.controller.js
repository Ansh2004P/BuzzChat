import { asyncHandler } from "../utils/asyncHandler.js"
import { Chat } from "../model/chat.model.js"
import { User } from "../model/user.model.js"
import { Message } from "../model/message.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import mongoose from "mongoose"

const chatCommonAggregation = () => {
    return [
        {
            // lookup for the participants present
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "participants",
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
            // lookup for the group chats
            $lookup: {
                from: "chatmessages",
                foreignField: "_id",
                localField: "lastMessage",
                as: "lastMessage",
                pipeline: [
                    {
                        // get details of the sender
                        $lookup: {
                            from: "users",
                            foreignField: "_id",
                            localField: "sender",
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
}

const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body

    if (!userId) {
        console.log("User ID is required")
        throw new ApiError(400, "User Id is required")
    }

    // Check if it's a valid receiver
    const receiver = await User.findById(userId)

    if (!receiver) {
        throw new ApiError(404, "Receiver does not exist")
    }
    
    try {
        // Check if the receiver is not the same as the user making the request
        if (receiver._id.toString() === req.user._id.toString()) {
            throw new ApiError(400, "You cannot chat with yourself")
        }

        // Find if a one-on-one chat already exists between the two users
        const chat = await Chat.aggregate([
            {
                $match: {
                    isGroupChat: false, // Filter out group chats
                    participants: {
                        $all: [
                            req.user._id,
                            new mongoose.Types.ObjectId(userId),
                        ], // Ensure both users are participants
                    },
                },
            },
            ...chatCommonAggregation(), // Apply common aggregation logic
        ])

        if (chat.length > 0) {
            // If a chat already exists, return it
            return res
                .status(200)
                .json(
                    new ApiResponse(200, chat[0], "Chat retrieved successfully")
                )
        }

        // If no chat exists, create a new one
        const newChatInstance = await Chat.create({
            chatName: "One-on-one chat",
            participants: [req.user._id, userId], // Include both users as participants
            admin: [req.user._id], // Set the logged-in user as the admin
        })

        // Retrieve the newly created chat with the same aggregation logic
        const createdChat = await Chat.aggregate([
            {
                $match: {
                    _id: newChatInstance._id,
                },
            },
            ...chatCommonAggregation(), // Apply common aggregation logic
        ])

        const payload = createdChat[0]

        if (!payload) {
            throw new ApiError(500, "Internal server error")
        }

        // Return the created chat
        return res
            .status(201)
            .json(new ApiResponse(201, payload, "Chat created successfully"))
    } catch (error) {
        throw new ApiError(500, error.message || "Unable to access chats")
    }
})

const fetchChats = asyncHandler(async (req, res) => {
    const userId = req.user._id

    if (!userId) throw new ApiError(400, "Unauthorized request")

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

        return res
            .status(20)
            .json(new ApiResponse(200, chats, "Chats fetched successfully"))
    } catch (error) {
        throw new ApiError(500, error.message || "Unable to fetch chats")
    }
})

const getChat = asyncHandler(async (req, res) => {
    const userId = req.user._id
    try {
        // Sanitize the search query
        const searchQuery = req.query.search ? req.query.search.trim() : ""

        // Construct the match stage for the aggregate pipeline
        const matchStage = {
            $and: [
                { _id: { $ne: userId } }, // Exclude the current user
                searchQuery
                    ? {
                          $or: [
                              {
                                  username: {
                                      $regex: searchQuery,
                                      $options: "i",
                                  },
                              },
                              { email: { $regex: searchQuery, $options: "i" } },
                          ],
                      }
                    : {},
            ],
        }

        // Build the aggregate pipeline
        const pipeline = [
            { $match: matchStage },
            {
                $project: {
                    password: 0,
                },
            },
            // You can add more stages here if needed, such as $sort, $limit, etc.
        ]

        // Execute the aggregate pipeline
        const users = await User.aggregate(pipeline)
        // console.log(users)

        // Check if users were found
        if (!users || users.length === 0) {
            throw new ApiError(404, "No users found")
        }

        // Return the users in the response
        return res
            .status(200)
            .json(new ApiResponse(200, users, "All users fetched successfully"))
    } catch (error) {
        throw new ApiError(500, error.message || "Unable to fetch users")
    }
})

const createGroupChat = asyncHandler(async (req, res) => {
    if (!req.body.participants || !req.body.groupName) {
        throw new ApiError(400, "Participants and group name are required")
    }

    let users = JSON.parse(req.body.participants)
    if (users.length < 2) {
        throw new ApiError(400, "Group chat requires at least 2 participants")
    }

    users.push(req.user)

    try {
        const groupChat = await Chat.create({
            chatName: req.body.groupName,
            participants: users.map(
                (user) => new mongoose.Types.ObjectId(user._id)
            ), // Convert to ObjectId
            isGroupChat: true,
            admin: [req.user],
        })

        const fullGroupChat = await Chat.findOne({
            _id: groupChat._id,
        })
            .populate("participants", "-password -refreshToken")
            .populate("admin", "-password -refreshToken")

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
    getChat,
}
