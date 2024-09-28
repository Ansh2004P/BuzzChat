import dotenv from "dotenv"
import connectDB from "./db/connect.js"
import { app, corsOptions } from "./app.js"
import { Server } from "socket.io"
import { PeerServer } from "peer"
import helmet from "helmet"
import compression from "compression"
import rateLimit from "express-rate-limit"

dotenv.config({ path: "./.env" })

const port = process.env.PORT || 8000
const peerPort = process.env.PEER_PORT || 9000

// Set rate limiting (adjust to your needs)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
})

// Apply rate limiting and security headers middleware
app.use(limiter)
app.use(helmet()) // Secure HTTP headers
app.use(compression()) // Compress response bodies

let server
connectDB()
    .then(() => {
        server = app.listen(port, () => {
            console.log(
                `⚙️ Server is running at port: ${port} in ${process.env.NODE_ENV} mode`
            )
        })

        // Socket.io setup
        const io = new Server(server, {
            pingTimeout: 60000,
            cors: corsOptions,
        })

        // PeerJs setup (for video/audio communication)
        const peerServer = PeerServer({
            port: peerPort,
            path: "/peerjs",
            proxied: true, // Ensure this if you're behind a proxy (like Vercel)
        })

        app.use("/peerjs", peerServer)

        // Handle socket connections
        io.on("connection", (socket) => {
            console.log("Connected to socket.io")

            socket.on("setup", (userData) => {
                try {
                    if (!userData || !userData._id)
                        throw new Error("User data or user ID is missing")
                    socket.join(userData._id)
                    socket.emit("connected")
                    console.log(`User setup complete for: ${userData._id}`)
                } catch (error) {
                    console.error(`Error in setup: ${error.message}`)
                }
            })

            socket.on("joinChat", (room) => {
                try {
                    if (!room) throw new Error("Room ID is missing")
                    socket.join(room)
                    console.log(`User Joined Room: ${room}`)
                } catch (error) {
                    console.error(`Error in joinChat: ${error.message}`)
                }
            })

            socket.on("typing", (room) => {
                try {
                    if (!room)
                        throw new Error("Room ID is missing for typing event")
                    socket.in(room).emit("typing")
                    console.log(`User is typing in room: ${room}`)
                } catch (error) {
                    console.error(`Error in typing: ${error.message}`)
                }
            })

            socket.on("stopTyping", (room) => {
                try {
                    if (!room)
                        throw new Error(
                            "Room ID is missing for stop typing event"
                        )
                    socket.in(room).emit("stopTyping")
                    console.log(`User stopped typing in room: ${room}`)
                } catch (error) {
                    console.error(`Error in stopTyping: ${error.message}`)
                }
            })

            socket.on("messageRecieved", (newMessageRecieved) => {
                try {
                    if (!newMessageRecieved || !newMessageRecieved.chat)
                        throw new Error("Message or chat ID is missing")
                    const chatId = newMessageRecieved.chat
                    if (!newMessageRecieved.sender)
                        throw new Error("Sender not defined in the message")
                    socket
                        .in(chatId)
                        .emit("messageRecieved", newMessageRecieved)
                    console.log(`Message received in room: ${chatId}`)
                } catch (error) {
                    console.error(`Error in messageRecieved: ${error.message}`)
                }
            })

            // Handling video/audio call events
            socket.on("callUser", ({ userToCall, from, signal }) => {
                io.to(userToCall).emit("incomingCall", { signal, from })
            })

            socket.on("answerCall", (data) => {
                io.to(data.to).emit("callAccepted", data.signal)
            })

            // User disconnect event
            socket.on("disconnect", () => {
                console.log("User Disconnected")
            })
        })
    })
    .catch((error) => {
        console.error(`❌ MongoDB connection failed: ${error.message}`)
    })

// Gracefully handle shutdown
process.on("SIGINT", () => {
    console.log("Shutting down gracefully...")
    if (server) {
        server.close(() => {
            console.log("HTTP server closed.")
            process.exit(0)
        })
    }
})

process.on("unhandledRejection", (err) => {
    console.error(`Unhandled rejection: ${err.name}, ${err.message}`)
    console.log("Shutting down due to unhandled promise rejection...")
    server.close(() => {
        process.exit(1)
    })
})
