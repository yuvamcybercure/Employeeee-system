const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const attendancePhotoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'employee-mgmt/attendance',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    },
});

const profilePhotoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'employee-mgmt/profiles',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
    },
});

const documentStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'employee-mgmt/documents',
        resource_type: 'auto',
    },
});

const uploadAttendance = multer({ storage: attendancePhotoStorage });
const uploadProfile = multer({ storage: profilePhotoStorage });
const uploadDocument = multer({ storage: documentStorage });

// Upload base64 image directly (for camera capture)
const uploadBase64 = async (base64String, folder = 'employee-mgmt/attendance') => {
    const result = await cloudinary.uploader.upload(base64String, {
        folder,
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    });
    return { url: result.secure_url, publicId: result.public_id };
};

const deleteFile = async (publicId) => {
    if (publicId) await cloudinary.uploader.destroy(publicId);
};

module.exports = { cloudinary, uploadAttendance, uploadProfile, uploadDocument, uploadBase64, deleteFile };
