import multer from 'multer';
import path from 'path';
import pkg from 'multer-storage-cloudinary';
const { CloudinaryStorage } = pkg;
import cloudinary from '../config/cloudinary.js';

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'trends-and-toss-products', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }] // Optimize images
  }
});

export const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpg|jpeg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, PNG, WEBP images are allowed'));
    }
  }
});

export default upload;