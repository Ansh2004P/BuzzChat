import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
)

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// routes Import
import userRoutes from "./routes/user.routes.js"
import chatRoutes from "./routes/chat.routes.js"
import messageRoutes from "./routes/message.routes.js"

// routes declaration
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/chat", chatRoutes)
app.use("/api/v1/message", messageRoutes)

export { app }
