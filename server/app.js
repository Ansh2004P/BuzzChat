import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// Load environment variables
dotenv.config({ path: "./.env" })

// Define __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize express app
const app = express()

// CORS Configuration for allowing requests from frontend
const corsOptions = {
    origin: process.env.CORS_ORIGIN , // Update with your frontend URL
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    credentials: true, // Allow cookies if needed
}

// Use CORS middleware
app.use(cors(corsOptions))

// Body parsers for JSON and URL-encoded data
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))

// Serve static files from 'public' folder (if any)
app.use(express.static("public"))
app.use(cookieParser())

// Serve static React frontend from 'dist' (production build)
app.use(express.static(path.join(__dirname, "../client/dist")))

// Routes
import userRoutes from "./routes/user.routes.js"
import chatRoutes from "./routes/chat.routes.js"
import messageRoutes from "./routes/message.routes.js"

// API routes
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/chat", chatRoutes)
app.use("/api/v1/message", messageRoutes)

// HTTP to HTTPS redirection middleware
app.use((req, res, next) => {
    if (req.protocol === "http") {
        return res.redirect(301, "https://" + req.headers.host + req.url)
    }
    next()
})

// Serve index.html for all other routes (React Router handling frontend routes)
app.get("*", (req, res) => {
    if (process.env.NODE_ENV === "production") {
        // In production, serve the React app's index.html
        res.sendFile(path.join(__dirname, "../client/dist", "index.html"))
    } else {
        // For local development, redirect to frontend dev server
        res.redirect("http://localhost:5173") // Replace with your local frontend URL
    }
})

export { app, corsOptions }
