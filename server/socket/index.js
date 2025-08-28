class SocketHandler {
    constructor(socket) {
        this.socket = socket
        this.initializeEvents()
    }

    initializeEvents() {
        console.log("User connected to socket")

        this.socket.on("setup", (userData) => this.handleSetup(userData))
        this.socket.on("joinChat", (room) => this.handleJoinChat(room))
        this.socket.on("typing", (room) => this.handleTyping(room))
        this.socket.on("stopTyping", (room) => this.handleStopTyping(room))
        this.socket.on("messageReceived", (message) =>
            this.handleMessageReceived(message)
        )
        this.socket.on("disconnect", () => this.handleDisconnect())
    }

    handleSetup(userData) {
        try {
            if (!userData || !userData._id) {
                throw new Error("User data or user ID is missing")
            }
            this.socket.join(userData._id)
            this.socket.emit("connected")
            console.log(`User setup complete for: ${userData._id}`)
        } catch (error) {
            console.error(`Error in setup: ${error.message}`)
        }
    }

    handleJoinChat(room) {
        try {
            if (!room) {
                throw new Error("Room ID is missing")
            }
            this.socket.join(room)
            console.log(`User joined room: ${room}`)
        } catch (error) {
            console.error(`Error in joinChat: ${error.message}`)
        }
    }

    handleTyping(room) {
        try {
            if (!room) {
                throw new Error("Room ID is missing for typing event")
            }
            this.socket.in(room).emit("typing")
            console.log(`User is typing in room: ${room}`)
        } catch (error) {
            console.error(`Error in typing: ${error.message}`)
        }
    }

    handleStopTyping(room) {
        try {
            if (!room) {
                throw new Error("Room ID is missing for stop typing event")
            }
            this.socket.in(room).emit("stopTyping")
            console.log(`User stopped typing in room: ${room}`)
        } catch (error) {
            console.error(`Error in stopTyping: ${error.message}`)
        }
    }

    handleMessageReceived(newMessage) {
        try {
            if (!newMessage || !newMessage.chat) {
                throw new Error("Message or chat ID is missing")
            }
            if (!newMessage.sender) {
                throw new Error("Sender not defined in the message")
            }

            this.socket.in(newMessage.chat).emit("messageReceived", newMessage)
            console.log(`Message received in room: ${newMessage.chat}`)
        } catch (error) {
            console.error(`Error in messageReceived: ${error.message}`)
        }
    }

    handleDisconnect() {
        console.log("User disconnected")
    }
}

// Function to initialize socket connection with the class
export const initializeSocket = (io) => {
    io.on("connection", (socket) => {
        new SocketHandler(socket)
    })
}

export default SocketHandler
