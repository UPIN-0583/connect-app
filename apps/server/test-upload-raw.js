import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

cloudinary.uploader.upload('data:text/plain;base64,SGVsbG8gV29ybGQ=', {
  folder: 'connect_app/messages',
  resource_type: 'raw',
  use_filename: true,
  unique_filename: true,
  filename_override: 'Bao Cao Tai Chinh.pdf'
}, function(error, result) {
  if (error) {
    console.error('ERROR:', error);
  } else {
    console.log('SUCCESS:', result.public_id, result.secure_url);
  }
});
