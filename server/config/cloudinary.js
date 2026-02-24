const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const STORAGE_PATH = path.join(__dirname, '../public/uploads');

// Helper to construct URL
const getFileUrl = (folder, filename) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/public/uploads/${folder}/${filename}`;
};

// Disk Storage Configuration
const createStorage = (folder) => multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = path.join(STORAGE_PATH, folder);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
    }
});

const uploadAttendance = multer({ storage: createStorage('attendance') });
const uploadProfile = multer({ storage: createStorage('profiles') });
const uploadDocument = multer({ storage: createStorage('documents') });

// Upload base64 image directly (for camera capture)
const uploadBase64 = async (base64String, folder = 'attendance') => {
    // Extract base64 data
    const matches = base64String.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 string');
    }

    const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const data = Buffer.from(matches[2], 'base64');
    const filename = `${uuidv4()}.${extension}`;
    const destFolder = path.join(STORAGE_PATH, folder);
    const filePath = path.join(destFolder, filename);

    // Ensure directory exists
    if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder, { recursive: true });
    }

    fs.writeFileSync(filePath, data);

    return {
        url: getFileUrl(folder, filename),
        publicId: filename // Using filename as ID for local storage
    };
};

const deleteFile = async (publicId) => {
    // In local storage, we'd need to know the folder too. 
    // This is a simplified version. For now we just log it.
    console.log(`Local deletion requested for: ${publicId}`);
};

module.exports = { uploadAttendance, uploadProfile, uploadDocument, uploadBase64, deleteFile };
