import { asyncHandler } from "../utils/asyncHandler.js"
import { Chat } from "../model/chat.model.js"
import { User } from "../model/user.model.js"
import { Message } from "../model/message.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import mongoose from "mongoose"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

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
    const { userId, isGroupChat } = req.body

    if (!userId) {
        console.log("User ID is required")
        throw new ApiError(400, "User ID is required")
    }

    let chat

    try {
        if (isGroupChat) {
            // Check if it's a valid group chat
            chat = await Chat.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(userId),
                        isGroupChat: true,
                    },
                },
                ...chatCommonAggregation(), // Apply common aggregation logic
            ])

            if (chat.length === 0) {
                throw new ApiError(404, "Group chat does not exist")
            }

            const payload = chat[0]

            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        payload,
                        "Group chat retrieved successfully"
                    )
                )
        } else {
            // Check if it's a valid receiver for one-on-one chat
            const receiver = await User.findById(userId)

            if (!receiver) {
                throw new ApiError(404, "Receiver does not exist")
            }

            // Check if the receiver is not the same as the user making the request
            if (receiver._id.toString() === req.user._id.toString()) {
                throw new ApiError(400, "You cannot chat with yourself")
            }

            // Find if a one-on-one chat already exists between the two users
            chat = await Chat.aggregate([
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
                        new ApiResponse(
                            200,
                            chat[0],
                            "Chat retrieved successfully"
                        )
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
                .json(
                    new ApiResponse(201, payload, "Chat created successfully")
                )
        }
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
            .status(200)
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
    let avatarLocalURL = req.file.path

    const avatar = await uploadOnCloudinary(avatarLocalURL)

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
            avatar: avatar.url,
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
            // Stage 1: Match the chat by Id
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(chatId),
                },
            },

            // Stage 2: Check if the requester is an admin or not
            {
                $addFields: {
                    isAdmin: {
                        $in: [
                            new mongoose.Types.ObjectId(req.user._id),
                            "$admin",
                        ],
                    },
                },
            },

            // Stage 3: Conditionally add the user to the participants array
            {
                $addFields: {
                    participants: {
                        $concatArrays: [
                            "$participants",
                            {
                                $cond: [
                                    {
                                        $in: [
                                            new mongoose.Types.ObjectId(userId),
                                            "$participants",
                                        ],
                                    },
                                    [],
                                    [new mongoose.Types.ObjectId(userId)],
                                ],
                            },
                        ],
                    },
                },
            },

            // Stage 4: Lookup to populate the fields
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
                    as: "adminDetails",
                },
            },

            // Stage 5: Project the necessary fields (inclusion only)
            {
                $project: {
                    "participants._id": 1,
                    "participants.username": 1,
                    "participants.avatar": 1,
                    "adminDetails._id": 1,
                    "adminDetails.username": 1,
                    "adminDetails.avatar": 1,
                    chatName: 1,
                    isGroupChat: 1,
                    lastMessage: 1,
                    avatar: 1,
                    isAdmin: 1,
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
            .populate("participants", "-password")
            .populate("admin", "-password")

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
            .populate("participants", "-password")
            .populate("admin", "-password")

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
    const { chatId } = req.body

    // Check if the chat is a group
    const groupChat = await Chat.findOne({
        _id: new mongoose.Types.ObjectId(chatId),
        isGroupChat: true,
    })

    if (!groupChat) {
        throw new ApiError(404, "Chat is not a group chat")
    }

    const existingParticipants = groupChat.participants

    // Check if the participant leaving the group is part of the group
    if (
        !existingParticipants.includes(
            new mongoose.Types.ObjectId(req.user._id)
        )
    ) {
        throw new ApiError(400, "You are not part of this group")
    }

    // Step 1: Remove the user from the participants array
    await Chat.findByIdAndUpdate(
        new mongoose.Types.ObjectId(chatId),
        {
            $pull: { participants: new mongoose.Types.ObjectId(req.user._id) },
        },
        { new: true }
    )

    // Step 2: Remove the user from the admin array (if they are an admin)
    await Chat.findByIdAndUpdate(
        new mongoose.Types.ObjectId(chatId),
        {
            $pull: { admin: new mongoose.Types.ObjectId(req.user._id) },
        },
        { new: true }
    )

    // Fetch the updated chat to check the state of participants and admin arrays
    const updatedChat = await Chat.findById(new mongoose.Types.ObjectId(chatId))

    if (updatedChat.participants.length === 0) {
        // Step 3: If no participants left, delete the group chat
        await Chat.findByIdAndDelete(new mongoose.Types.ObjectId(chatId))
        return res.status(200).json({
            message: "Group chat deleted as it has no participants left",
        })
    }

    if (updatedChat.admin.length === 0 && updatedChat.participants.length > 0) {
        // Step 4: If admin array is empty, choose a random participant as the new admin
        const randomIndex = Math.floor(
            Math.random() * updatedChat.participants.length
        )
        const newAdmin = updatedChat.participants[randomIndex]

        // Add the new admin to the admin array
        await Chat.findByIdAndUpdate(
            new mongoose.Types.ObjectId(chatId),
            {
                $push: { admin: new mongoose.Types.ObjectId(newAdmin) },
            },
            { new: true }
        )
    }

    // Step 5: Re-run the aggregation pipeline to fetch the updated chat details
    const chatPipeline = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(chatId),
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

const updateGroupChatAvatar = asyncHandler(async (req, res) => {
    const { chatId } = req.body

    if (!req.file) {
        throw new ApiError(400, "Avatar is required")
    }

    const avatarLocalURL = req.file.path

    const avatar = await uploadOnCloudinary(avatarLocalURL)

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            avatar: avatar.url,
        },
        {
            new: true,
        }
    )

    if (!updatedChat) {
        throw new ApiError(400, "Unable to update group chat avatar")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedChat,
                "Group chat avatar updated successfully"
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
    updateGroupChatAvatar,
}
