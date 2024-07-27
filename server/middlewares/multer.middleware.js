import multer from "multer"

// Storage configuration for avatars
const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/avatar")
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`)
    },
})

// Storage configuration for attachments
const attachmentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/attachments")
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`)
    },
})

export const uploadAvatar = multer({ storage: avatarStorage })
export const uploadAttachment = multer({ storage: attachmentStorage })
