import mongoose from "mongoose"
import dotenv from "dotenv"
import colors from "colors"
import { DB_NAME } from "../constant.js"

dotenv.config()

const connectDB = async () => {
    try {
        const connect = await mongoose.connect(
            `${process.env.MONGO_URI}/${DB_NAME}`
        )
        console.log(
            `MongoDB connected: ${connect.connection.host}`.cyan.underline
        )
    } catch (error) {
        console.error(`Error: ${error.message}`.red.underline.bold)
        process.exit(1)
    }
}

export default connectDB
