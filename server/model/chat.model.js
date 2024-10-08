import mongoose, { Schema } from "mongoose"

const chatSchema = new Schema(
    {
        chatName: {
            type: String,
            required: true,
        },
        isGroupChat: {
            type: Boolean,
            default: false,
        },
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        admin: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        avatar: {
            type: String,
        }
    },
    { timestamps: true }
)

export const Chat = mongoose.model("Chat", chatSchema)
