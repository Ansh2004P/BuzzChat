import dotenv from "dotenv"
import connectDB from "./db/connect.js"
import { app, corsOptions } from "./app.js"
import { Server } from "socket.io"

dotenv.config({
    path: "./.env",
})

let server
connectDB()
    .then(() => {
        server = app.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`)
        })
        const io = new Server(server, {
            pingTimeout: 60000,
            cors: corsOptions, // Ensure correct property name
        })

        console.log("Socket.io is running")

        io.on("connection", (socket) => {
            console.log("Connected to socket.io")

            // When a user connects, they join a room with their user ID
            socket.on("setup", (userData) => {
                console.log(userData)
                socket.join(userData._id)
                socket.emit("connected")
                console.log("User setup complete for:", userData._id)
            })

            // User joins a specific chat room
            socket.on("joinChat", (room) => {
                socket.join(room)
                console.log("User Joined Room:", room)
            })

            // Handling typing notifications
            socket.on("typing", (room) => {
                socket.in(room).emit("typing")
                console.log(`User is typing in room: ${room}`)
            })

            socket.on("stopTyping", (room) => {
                socket.in(room).emit("stopTyping")
                console.log(`User stopped typing in room: ${room}`)
            })

            // Handling message received
            socket.on("messageRecieved", (newMessageRecieved) => {
                const chatId = newMessageRecieved.chat // Directly using chat ID since it's a string

                if (!newMessageRecieved.sender) {
                    return console.log("Sender not defined")
                }

                // Ensure that the message is emitted to the correct room
                socket.in(chatId).emit("messageRecieved", newMessageRecieved)
                console.log(`Message received in room: ${chatId}`)
            })

            // Handle disconnects
            socket.on("disconnect", () => {
                console.log("USER DISCONNECTED")
            })
        })
    })
    .catch((error) => {
        console.log(`❌ MONGO db connection failed !!!`, error)
    })
