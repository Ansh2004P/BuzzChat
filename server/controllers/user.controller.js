import { User } from "../model/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import fs from "fs"
import { ApiError } from "../utils/ApiError.js"
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js"
import FetchImageName from "../utils/fetchImageName.js"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(
            500,
            error?.message ||
                "Something went wrong while generating refresh and access token"
        )
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // Steps: 1. Get the user data from frontend
    // 2. validate the user data
    // 3.check for avatar
    // 4. check if user already exists
    // 5. upload them to cloudinary
    // 6. create a new user
    // 7. remove password and refresh token field from response
    // 8. check for user creation
    // 9. return response

    const { username, email, password } = req.body
    let avatarLocalPath

    if ([username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }
    // console.log(req.file)

    if (req.file) {
        avatarLocalPath = req.file.path
    } else {
        avatarLocalPath = ""
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }],
    })

    if (existedUser) {
        if (avatarLocalPath.trim() !== "") fs.unlinkSync(avatarLocalPath)
        res.status(400)
        throw new ApiError(409, "User already exists")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar) {
        res.status(400)
        throw new ApiError("Something went wrong while uploading avatar")
    }

    const user = await User.create({
        username,
        avatar: avatar.url,
        email,
        password,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        res.status(400)
        throw new ApiError("Something went wrong while creating user")
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User created successfully"))
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body

    if (username.trim() === "" && email.trim() === "") {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ email }, { username }],
    })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    )

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly: true,
        secure: true,
    }
    console.log("user login successfully")

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, loggedInUser, "User logged in successfully"))
})

const logoutUser = asyncHandler(async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1,
                },
            },
            {
                new: true,
            }
        )

        const options = {
            httpOnly: true,
            secure: true,
        }

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged out successfully"))
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong")
    }
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken =
            req.cookies?.refreshToken || req.body.refreshToken

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodeToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodeToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid refresh token")
        }

        const options = {
            httpOnly: true,
            secure: true,
        }

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user._id)

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
    } catch (ApiError) {
        throw new ApiError(500, ApiError?.message || "Invalid refresh token")
    }
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User fetched successfully"))
})

const deleteUser = asyncHandler(async (req, res) => {
    // Set cookie options for security
    const options = {
        httpOnly: true,
        secure: true, // Set secure flag based on environment
        // sameSite: 'Strict', // Optional, for extra security
    }

    const userId = req.user?._id
    const avatarUrl = req.user?.avatar

    if (!userId) {
        throw new ApiError(400, "User ID is required")
    }

    // Optionally, delete the user's avatar from Cloudinary
    if (avatarUrl) {
        const imageName = FetchImageName(avatarUrl)
        await deleteFromCloudinary(imageName)
    }

    // Delete the user from the database
    await User.findByIdAndDelete(userId)

    // Clear authentication cookies
    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({ message: "User deleted successfully" })
})
const updateCurrentPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid current password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const currentAvatar = FetchImageName(user.avatar)

    const newAvatar = await uploadOnCloudinary(avatarLocalPath)
    if (!newAvatar) {
        newAvatar = currentAvatar
        throw new ApiError(500, "Avatar upload failed")
    }

    await deleteFromCloudinary(currentAvatar)
    user.avatar = newAvatar.url
    await user.save()

    const updatedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"))
})

const deleteAvatar = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const currentAvatar = FetchImageName(user.avatar)
    const defaultAvatar =
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"

    if (user.avatar === defaultAvatar) {
        throw new ApiError(400, "Cannot delete default avatar")
    }

    await deleteFromCloudinary(currentAvatar)
    user.avatar = defaultAvatar
    await user.save()

    res.status(200).json({ message: "Avatar deleted and set to default" })
})

const updateUsername = asyncHandler(async (req, res) => {
    const { username } = req.body

    if (!username) {
        throw new ApiError(400, "Username is required")
    }

    // Find the user by ID
    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    // Update the username
    user.username = username
    await user.save()

    res.status(200).json({
        message: "Username updated successfully",
        user: {
            _id: user._id,
            username: user.username,
        },
    })
})

const getAllUsers = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if (!userId) {
        return res.status(400).json(new ApiError(400, "User ID is required"))
    }

    try {
        // Construct the match stage for the aggregate pipeline
        const matchStage = { _id: { $ne: userId } } // Exclude the current user

        // Build the aggregate pipeline
        const pipeline = [
            { $match: matchStage },
            {
                $project: {
                    password: 0,
                },
            },
        ]

        // Execute the aggregate pipeline
        const users = await User.aggregate(pipeline)

        if (!users || users.length === 0) {
            return res.status(404).json(new ApiError(404, "No users found"))
        }

        return res
            .status(200)
            .json(new ApiResponse(200, users, "All users fetched successfully"))
    } catch (error) {
        return res.status(500).json(new ApiError(500, error.message))
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    updateCurrentPassword,
    updateAvatar,
    deleteAvatar,
    updateUsername,
    deleteUser,
    getAllUsers,
}
