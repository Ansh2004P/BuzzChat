import dotenv from "dotenv"
import connectDB from "./db/connect.js"
import { app, corsOptions } from "./app.js"
import { Server } from "socket.io"
import { PeerServer } from "peer"

dotenv.config({ path: "./.env" })

const port = process.env.PORT || 8000
const peerPort = process.env.PEER_PORT || 9000

let server
connectDB()
    .then(() => {
        server = app.listen(port, () => {
            console.log(`⚙️ Server is running at port: ${port}`)
        })

        // Socket.io setup
        const io = new Server(server, {
            pingTimeout: 60000,
            cors: corsOptions,
        })

        // PeerJs setup
        const peerServer = PeerServer({
            port: peerPort,
            path: "/peerjs",
        })

        app.use("/peerjs", peerServer)

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
                    console.error(error.message)
                }
            })

            socket.on("joinChat", (room) => {
                try {
                    if (!room) throw new Error("Room ID is missing")
                    socket.join(room)
                    console.log(`User Joined Room: ${room}`)
                } catch (error) {
                    console.error(error.message)
                }
            })

            socket.on("typing", (room) => {
                try {
                    if (!room)
                        throw new Error("Room ID is missing for typing event")
                    socket.in(room).emit("typing")
                    console.log(`User is typing in room: ${room}`)
                } catch (error) {
                    console.error(error.message)
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
                    console.error(error.message)
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
                    console.error(error.message)
                }
            })

            socket.on("callUser", ({ userToCall, from, signal }) => {
                io.to(userToCall).emit("incomingCall", { signal, from })
            })

            socket.on("answerCall", (data) => {
                io.to(data.to).emit("callAccepted", data.signal)
            })

            socket.on("disconnect", () => {
                console.log("User Disconnected")
            })
        })
    })
    .catch((error) => {
        console.error(`❌ MongoDB connection failed: ${error.message}`)
    })

process.on("SIGINT", () => {
    console.log("Shutting down gracefully...")
    if (server) {
        server.close(() => {
            console.log("HTTP server closed.")
            process.exit(0)
        })
    }
})
