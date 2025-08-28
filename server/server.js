import dotenv from "dotenv"
import connectDB from "./db/connect.js"
import { app, corsOptions } from "./app.js"
import { Server } from "socket.io"
import { initializeSocket } from "./socket/index.js"
import helmet from "helmet"
import rateLimit from "express-rate-limit"

dotenv.config({ path: "./.env" })

const PORT = process.env.PORT || 8000

const setupMiddleware = () => {
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
    })

    app.use(limiter)
    app.use(helmet())
}

const setupSocket = (server) => {
    const io = new Server(server, {
        pingTimeout: 60000,
        cors: corsOptions,
    })

    initializeSocket(io)
    return io
}

// Graceful shutdown handler
const handleShutdown = (server) => {
    console.log("Shutting down gracefully...")
    if (server) {
        server.close(() => {
            console.log("HTTP server closed.")
            process.exit(0)
        })
    }
}

// Start server function
const startServer = async () => {
    try {
        setupMiddleware()
        await connectDB()
        const server = app.listen(PORT, () => {
            console.log(`⚙️ Server running on port ${PORT}`)
        })
        setupSocket(server)

        process.on("SIGINT", () => handleShutdown(server))
        process.on("unhandledRejection", (err) => {
            console.error(`Unhandled rejection: ${err.message}`)
            handleShutdown(server)
        })
    } catch (error) {
        console.error(`❌ Server startup failed: ${error.message}`)
        process.exit(1)
    }
}

startServer()
