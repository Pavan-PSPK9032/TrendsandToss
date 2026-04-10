import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import '../config/cloudinary.js'; // Import and configure Cloudinary

// Custom multer storage engine for Cloudinary
const cloudinaryStorage = {
  _handleFile: (req, file, cb) => {
    try {
      console.log('Starting Cloudinary upload for:', file.originalname);
      
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'trends-and-toss-products',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
          transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error.message);
            cb(error);
          } else {
            console.log('Cloudinary upload success:', result.secure_url);
            cb(null, {
              path: result.secure_url,
              filename: result.public_id
            });
          }
        }
      );

      // Handle both stream and buffer
      if (file.stream) {
        file.stream.pipe(uploadStream);
      } else if (file.buffer) {
        const { Readable } = require('stream');
        Readable.from(file.buffer).pipe(uploadStream);
      } else {
        cb(new Error('No file data available'));
      }
    } catch (error) {
      console.error('Upload handler error:', error.message);
      cb(error);
    }
  },
  _removeFile: (req, file, cb) => {
    cb(null);
  }
};

export const upload = multer({ 
  storage: cloudinaryStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export default upload;
