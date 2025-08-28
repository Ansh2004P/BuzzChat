import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import authService from "../services/AuthService.js"

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    // Validate input data
    authService.validateRegistrationData(username, email, password)

    // Check if user already exists
    await authService.checkUserExists(email)

    // Handle avatar upload
    const avatarUrl = await authService.handleAvatarUpload(req.file)

    // Create user
    const userData = { username, email, password, avatar: avatarUrl }
    const createdUser = await authService.createUser(userData)

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User created successfully"))
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const user = await authService.authenticateUser(email, password)
    const { accessToken, refreshToken } = await authService.generateTokens(
        user._id
    )
    const loggedInUser = await authService.getUserSafe(user._id)
    const options = authService.getCookieOptions()

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, loggedInUser, "User logged in successfully"))
})

const logoutUser = asyncHandler(async (req, res) => {
    await authService.logoutUser(req.user._id)
    const options = authService.getCookieOptions()
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body.refreshToken
    const user = await authService.verifyRefreshToken(incomingRefreshToken)
    const { accessToken, refreshToken } = await authService.generateTokens(
        user._id
    )
    const options = authService.getCookieOptions()
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "Access token refreshed successfully"
            )
        )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User fetched successfully"))
})

const getAllUsers = asyncHandler(async (req, res) => {
    const { search } = req.query
    const users = await authService.searchUsers(req.user._id, search)

    if (!users || users.length === 0) {
        throw new ApiError(404, "No users found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, users, "Users fetched successfully"))
})

const updateAvatar = asyncHandler(async (req, res) => {
    const updatedUser = await authService.updateAvatar(req.user._id, req.file)
    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"))
})

const deleteAvatar = asyncHandler(async (req, res) => {
    const updatedUser = await authService.deleteAvatar(req.user._id)

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Avatar deleted successfully"))
})

const updateUsername = asyncHandler(async (req, res) => {
    const { username } = req.body
    const updatedUser = await authService.updateUsername(req.user._id, username)

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedUser, "Username updated successfully")
        )
})

const deleteUser = asyncHandler(async (req, res) => {
    await authService.deleteUser(req.user._id)

    const options = authService.getCookieOptions()

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User deleted successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    getAllUsers,
    updateAvatar,
    deleteAvatar,
    updateUsername,
    deleteUser,
}
