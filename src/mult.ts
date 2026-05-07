import multer from 'multer';
import fs from 'fs';
import path from 'path';

const uploadDir1 = './static/candidates';
if (!fs.existsSync(uploadDir1)) {
    fs.mkdirSync(uploadDir1, { recursive: true });
}

const storage1 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './static/candidates');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './static');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const uploadCandidate = multer({ storage: storage1 });
const upload = multer({ storage: storage2 });
export { uploadCandidate, upload };