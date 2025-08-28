import { User } from "../model/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"
import FetchImageName from "../utils/fetchImageName.js"
import fs from "fs"

class AuthService {
    constructor() {
        console.log("AuthService initialized")
    }

    // Generate access and refresh tokens
    async generateTokens(userId) {
        try {
            const user = await User.findById(userId)
            if (!user) {
                throw new ApiError(404, "User not found")
            }

            const accessToken = await user.generateAccessToken()
            const refreshToken = await user.generateRefreshToken()

            user.refreshToken = refreshToken
            await user.save({ validateBeforeSave: false })

            return { accessToken, refreshToken }
        } catch (error) {
            throw new ApiError(500, "Failed to generate tokens")
        }
    }

    // Cookie options for secure token handling
    getCookieOptions() {
        return {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        }
    }

    // Validate user registration data
    validateRegistrationData(username, email, password) {
        if ([username, email, password].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "All fields are required")
        }
    }

    // Check if user already exists
    async checkUserExists(email) {
        const existedUser = await User.findOne({ email })
        if (existedUser) {
            throw new ApiError(409, "User already exists")
        }
    }

    // Handle avatar upload
    async handleAvatarUpload(file) {
        // If no file provided, return null (avatar is optional)
        if (!file) {
            return null
        }

        const avatarLocalPath = file.path

        try {
            const avatar = await uploadOnCloudinary(avatarLocalPath)
            if (!avatar) {
                throw new ApiError(400, "Avatar upload failed")
            }
            return avatar.url
        } catch (error) {
            // Clean up local file if upload fails
            if (avatarLocalPath && fs.existsSync(avatarLocalPath)) {
                fs.unlinkSync(avatarLocalPath)
            }
            throw error
        }
    }

    // Create new user
    async createUser(userData) {
        const user = await User.create(userData)
        const createdUser = await User.findById(user._id).select("-password -refreshToken")
        
        if (!createdUser) {
            throw new ApiError(500, "Failed to create user")
        }
        
        return createdUser
    }

    // Authenticate user login
    async authenticateUser(email, password) {
        if (!email?.trim()) {
            throw new ApiError(400, "Email is required")
        }

        const user = await User.findOne({ email })
        if (!user) {
            throw new ApiError(404, "User not found")
        }

        const isPasswordCorrect = await user.isPasswordCorrect(password)
        if (!isPasswordCorrect) {
            throw new ApiError(401, "Invalid credentials")
        }

        return user
    }

    // Get user without sensitive data
    async getUserSafe(userId) {
        return await User.findById(userId).select("-password -refreshToken")
    }

    // Logout user (clear refresh token)
    async logoutUser(userId) {
        await User.findByIdAndUpdate(
            userId,
            { $unset: { refreshToken: 1 } },
            { new: true }
        )
    }

    // Verify refresh token
    async verifyRefreshToken(refreshToken) {
        if (!refreshToken) {
            throw new ApiError(401, "Unauthorized request")
        }

        try {
            const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            const user = await User.findById(decodedToken._id)

            if (!user || refreshToken !== user.refreshToken) {
                throw new ApiError(401, "Invalid refresh token")
            }

            return user
        } catch (error) {
            throw new ApiError(401, "Invalid refresh token")
        }
    }

    // Search users (excluding current user)
    async searchUsers(currentUserId, searchQuery = "") {
        const matchStage = { _id: { $ne: currentUserId } }
        
        if (searchQuery) {
            matchStage.$or = [
                { username: { $regex: searchQuery, $options: "i" } },
                { email: { $regex: searchQuery, $options: "i" } }
            ]
        }

        return await User.find(matchStage).select("-password -refreshToken")
    }

    // Update user password
    async updatePassword(userId, currentPassword, newPassword) {
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found")
        }

        const isPasswordCorrect = await user.isPasswordCorrect(currentPassword)
        if (!isPasswordCorrect) {
            throw new ApiError(401, "Invalid current password")
        }

        user.password = newPassword
        await user.save({ validateBeforeSave: false })
    }

    // Update user avatar
    async updateAvatar(userId, file) {
        if (!file) {
            throw new ApiError(400, "Avatar file is required")
        }

        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found")
        }

        // Get current avatar for cleanup
        const currentAvatarName = FetchImageName(user.avatar)

        // Upload new avatar
        const newAvatar = await uploadOnCloudinary(file.path)
        if (!newAvatar) {
            throw new ApiError(500, "Avatar upload failed")
        }

        // Delete old avatar (if not default)
        if (currentAvatarName && currentAvatarName !== "default") {
            await deleteFromCloudinary(currentAvatarName)
        }

        // Update user avatar
        user.avatar = newAvatar.url
        await user.save()

        return await this.getUserSafe(userId)
    }

    // Delete user avatar (set to default)
    async deleteAvatar(userId) {
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found")
        }

        const defaultAvatar = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
        
        if (user.avatar === defaultAvatar) {
            throw new ApiError(400, "Cannot delete default avatar")
        }

        // Delete current avatar from cloudinary
        const currentAvatarName = FetchImageName(user.avatar)
        await deleteFromCloudinary(currentAvatarName)

        // Set to default avatar
        user.avatar = defaultAvatar
        await user.save()

        return await this.getUserSafe(userId)
    }

    // Update username
    async updateUsername(userId, username) {
        if (!username?.trim()) {
            throw new ApiError(400, "Username is required")
        }

        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found")
        }

        user.username = username.trim()
        await user.save()

        return await this.getUserSafe(userId)
    }

    // Delete user account
    async deleteUser(userId) {
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found")
        }

        // Delete avatar from cloudinary if not default
        if (user.avatar) {
            const avatarName = FetchImageName(user.avatar)
            if (avatarName && avatarName !== "default") {
                await deleteFromCloudinary(avatarName)
            }
        }

        // Delete user from database
        await User.findByIdAndDelete(userId)
    }
}

export default new AuthService()