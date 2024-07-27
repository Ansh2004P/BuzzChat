import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadOnCloudinary = async (localFilePath) => {
    const folderName = "BuzzChat"
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: folderName,
        })
        // console.log(response)
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}

const deleteFromCloudinary = async (FileName) => {
    const folderName = "BuzzChat"
    try {
        if (!FileName) return null

        const filePath = `${folderName}/${FileName}`
        await cloudinary.uploader.destroy(filePath, function (response) {
            // console.log(response)
        })
    } catch (error) {
        return null
    }
}

export { uploadOnCloudinary, deleteFromCloudinary }
