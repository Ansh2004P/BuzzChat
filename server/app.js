import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const app = express()
dotenv.config({ path: "./.env" })

// Define __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration options for cors
const corsOptions = {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    credentials: true,
}

// Rate limiter
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // Limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

app.use(cors(corsOptions))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// Serve static files from the React app
// app.use(express.static(path.join(__dirname, "../client/dist")))

// routes Import
import userRoutes from "./routes/user.routes.js"
import chatRoutes from "./routes/chat.routes.js"
import messageRoutes from "./routes/message.routes.js"

// routes declaration
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/chat", chatRoutes)
app.use("/api/v1/message", messageRoutes)

// Handle all other routes by serving the index.html file
app.get("/chats", (req, res) => {
    if (process.env.NODE_ENV === "production") {
        // Serve the index.html for /chats route in production
        res.redirect("https://buzzchat-fe.onrender.com/chats")
    } else {
        // Redirect to frontend dev server for /chats route in local
        res.sendFile(path.join(__dirname, "../client/dist", "index.html"))
    }
})

app.get("/login", (req, res) => {
    if (process.env.NODE_ENV === "production") {
        // Serve the index.html for /login route in production
        res.redirect("https://buzzchat-fe.onrender.com/login")
    } else {
        // Redirect to frontend dev server for /login route in local
        res.sendFile(path.join(__dirname, "../client/dist", "index.html"))
    }
})

app.get("/signup", (req, res) => {
    if (process.env.NODE_ENV === "production") {
        // Serve the index.html for /signup route in production
        res.redirect("https://buzzchat-fe.onrender.com/signup")
    } else {
        // Redirect to frontend dev server for /signup route in local
        res.sendFile(path.join(__dirname, "../client/dist", "index.html"))
    }
})

// Catch-all for other routes (those handled by React Router in the app)
app.get("*", (req, res) => {
    if (process.env.NODE_ENV === "production") {
        res.redirect("https://buzzchat-fe.onrender.com/")
        // Serve the index.html for all other routes in production
    } else {
        // Redirect to the frontend dev server for all other routes in local
        res.sendFile(path.join(__dirname, "../client/dist", "index.html"))
    }
})

export { app, corsOptions }
