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
            corsOptions,
        })
        console.log("Socket.io is running")

        io.on("connection", (socket) => {
            console.log("Connected to socket.io")

            socket.on("setup", (userData) => {
                socket.join(userData._id)
                socket.emit("connected")
                console.log("setup")
            })

            socket.on("join chat", (room) => {
                socket.join(room)
                console.log("User Joined Room: " + room)
            })

            socket.on("typing", (room) => socket.in(room).emit("typing"))
            socket.on("stopTyping", (room) =>
                socket.in(room).emit("stopTyping")
            )

            socket.on("messageRecieved", (newMessageRecieved) => {
                var chat = newMessageRecieved.chat

                if (!chat.users) return console.log("chat.users not defined")

                chat.users.forEach((user) => {
                    if (user._id == newMessageRecieved.sender._id) return

                    socket
                        .in(user._id)
                        .emit("messageRecieved", newMessageRecieved)
                })
            })

            socket.off("setup", (userData) => {
                console.log("USER DISCONNECTED")
                socket.leave(userData._id)
            })
        })
    })
    .catch((error) => {
        console.log(`❌ MONGO db connection failed !!!`, error)
    })
