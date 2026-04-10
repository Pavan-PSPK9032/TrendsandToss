import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Custom multer storage engine for Cloudinary
const cloudinaryStorage = {
  _handleFile: (req, file, cb) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'trends-and-toss-products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      },
      (error, result) => {
        if (error) {
          cb(error);
        } else {
          cb(null, {
            path: result.secure_url,
            filename: result.public_id
          });
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    Readable.from(file.buffer).pipe(uploadStream);
  },
  _removeFile: (req, file, cb) => {
    cb(null);
  }
};

// Use memory storage to get file buffer, then override _handleFile
const storage = multer.memoryStorage();
storage._handleFile = cloudinaryStorage._handleFile;
storage._removeFile = cloudinaryStorage._removeFile;

export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export default upload;
