import cookie from "cookie"
import jwt from "jsonwebtoken"
import { User } from "../model/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { Server, Socket } from "socket.io"
import { ChatEventEnum } from "../constant.js"

/**
 * @description This function is responsible to allow user to join the chat represented by chatId (chatId). event happens when user switches between the chats
 * @param {Socket} socket
 */
const mountJoinChatEvent = (socket) => {
    socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
        console.log(`User joined the chat 🤝. chatId: `, chatId)
        socket.join(chatId)
    })
}

/**
 * @description This function is responsible to emit the typing event to the other participants of the chat
 * @param {Socket} socket
 */
const mountParticipantTypingEvent = (socket) => {
    socket.on(ChatEventEnum.TYPING_EVENT, (chatId) => {
        socket.in(chatId).emit(ChatEventEnum.TYPING_EVENT, chatId)
    })
}

/**
 * @description This function is responsible to emit the stopped typing event to the other participants of the chat
 * @param {Socket} socket
 */
const mountParticipantStoppedTypingEvent = (socket) => {
    socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId) => {
        socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId)
    })
}

/**
 * @description This function is responsible to handle WebRTC signaling events
 * @param {Socket} socket
 */
const mountWebRTCEvents = (socket) => {
    socket.on(ChatEventEnum.WEBRTC_OFFER, (data) => {
        const { chatId, offer } = data
        socket
            .to(chatId)
            .emit(ChatEventEnum.WEBRTC_OFFER, { from: socket.user._id, offer })
    })

    socket.on(ChatEventEnum.WEBRTC_ANSWER, (data) => {
        const { chatId, answer } = data
        socket.to(chatId).emit(ChatEventEnum.WEBRTC_ANSWER, {
            from: socket.user._id,
            answer,
        })
    })

    socket.on(ChatEventEnum.WEBRTC_ICE_CANDIDATE, (data) => {
        const { chatId, candidate } = data
        socket.to(chatId).emit(ChatEventEnum.WEBRTC_ICE_CANDIDATE, {
            from: socket.user._id,
            candidate,
        })
    })
}

/**
 * @description This function is responsible for initializing the socket connection
 * @param {Server} io
 */
const initializeSocketIO = (io) => {
    return io.on("connection", async (socket) => {
        try {
            let cookies = cookie.parse(socket.handshake.headers?.cookie || "")
            let token = cookies?.accessToken

            if (!token) {
                token = socket.handshake.auth?.token
            }

            if (!token) {
                throw new ApiError(
                    401,
                    "Unauthorized handShake, token is missing"
                )
            }

            const decodedToken = jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET
            )
            const user = await User.findById(decodedToken?._id).select(
                "-password -refreshToken"
            )

            if (!user) {
                throw new ApiError(
                    401,
                    "Unauthorized handShake, user not found"
                )
            }

            socket.user = user
            socket.join(user._id.toString())
            socket.emit(ChatEventEnum.CONNECTED_EVENT)
            console.log("User connected 🚀", user.username)

            mountJoinChatEvent(socket)
            mountParticipantTypingEvent(socket)
            mountParticipantStoppedTypingEvent(socket)
            mountWebRTCEvents(socket)

            socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
                console.log(
                    "user has disconnected 🚫. userId: " + socket.user?._id
                )
                if (socket.user?._id) {
                    socket.leave(socket.user._id)
                }
            })
        } catch (error) {
            socket.emit(
                ChatEventEnum.SOCKET_ERROR_EVENT,
                error.message ||
                    "An error occurred while connecting to the socket"
            )
        }
    })
}

/**
 * @param {import("express").Request} req - Request object to access the `io` instance set at the entry point
 * @param {string} roomId - Room where the event should be emitted
 * @param {AvailableChatEvents[0]} event - Event that should be emitted
 * @param {any} payload - Data that should be sent when emitting the event
 * @description Utility function responsible to abstract the logic of socket emission via the io instance
 */
const emitSocketEvent = (req, roomId, event, payload) => {
    req.app.get("io").in(roomId).emit(event, payload)
}

export { initializeSocketIO, emitSocketEvent }
