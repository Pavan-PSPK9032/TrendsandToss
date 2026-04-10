import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import '../config/cloudinary.js'; // Import and configure Cloudinary

// Custom multer storage engine for Cloudinary
const cloudinaryStorage = {
  _handleFile: (req, file, cb) => {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'trends-and-toss-products',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
          transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            cb(error);
          } else {
            cb(null, {
              path: result.secure_url,
              filename: result.public_id
            });
          }
        }
      );

      // Pipe the file stream directly to Cloudinary
      file.stream.pipe(uploadStream);
    } catch (error) {
      console.error('Upload handler error:', error);
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
