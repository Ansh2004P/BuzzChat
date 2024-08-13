import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// Configuration options for cors
const corsOptions = {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    credentials: true,
}

app.use(cors(corsOptions))

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


export { app, corsOptions }
