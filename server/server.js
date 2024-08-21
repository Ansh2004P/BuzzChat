import dotenv from "dotenv"
import connectDB from "./db/connect.js"
import { app, corsOptions } from "./app.js"
import { Server } from "socket.io"
import winston from "winston"

dotenv.config({
    path: "./.env",
})

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "combined.log" }),
    ],
})

const port = process.env.PORT || 8000

let server
connectDB()
    .then(() => {
        server = app.listen(port, () => {
            logger.info(`⚙️ Server is running at port: ${port}`)
        })

        const io = new Server(server, {
            pingTimeout: 60000,
            cors: corsOptions,
        })

        logger.info("Socket.io is running")

        io.on("connection", (socket) => {
            logger.info("Connected to socket.io")

            // When a user connects, they join a room with their user ID
            socket.on("setup", (userData) => {
                if (!userData || !userData._id) {
                    logger.error("User data or user ID is missing")
                    return
                }
                socket.join(userData._id)
                socket.emit("connected")
                logger.info(`User setup complete for: ${userData._id}`)
            })

            // User joins a specific chat room
            socket.on("joinChat", (room) => {
                if (!room) {
                    logger.error("Room ID is missing")
                    return
                }
                socket.join(room)
                logger.info(`User Joined Room: ${room}`)
            })

            // Handling typing notifications
            socket.on("typing", (room) => {
                if (!room) {
                    logger.error("Room ID is missing for typing event")
                    return
                }
                socket.in(room).emit("typing")
                logger.info(`User is typing in room: ${room}`)
            })

            socket.on("stopTyping", (room) => {
                if (!room) {
                    logger.error("Room ID is missing for stop typing event")
                    return
                }
                socket.in(room).emit("stopTyping")
                logger.info(`User stopped typing in room: ${room}`)
            })

            // Handling message received
            socket.on("messageRecieved", (newMessageRecieved) => {
                if (!newMessageRecieved || !newMessageRecieved.chat) {
                    logger.error("Message or chat ID is missing")
                    return
                }

                const chatId = newMessageRecieved.chat

                if (!newMessageRecieved.sender) {
                    logger.error("Sender not defined in the message")
                    return
                }

                socket.in(chatId).emit("messageRecieved", newMessageRecieved)
                logger.info(`Message received in room: ${chatId}`)
            })

            // Handle disconnects
            socket.on("disconnect", () => {
                logger.info("User Disconnected")
            })
        })
    })
    .catch((error) => {
        logger.error(`❌ MongoDB connection failed: ${error.message}`)
    })
