import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import pkg from 'multer-storage-cloudinary';
const { CloudinaryStorage } = pkg;

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'trends-and-toss-products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  }
});

export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export default upload;