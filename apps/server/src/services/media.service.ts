import { AppError } from "../utils/errors.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// THIẾT LẬP GIỚI HẠN
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_FILE_SIZE = 20 * 1024 * 1024;

// DANH SÁCH FILE AN TOÀN (Kiểm tra MIME Type chuẩn xác)
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_FILE_TYPES = [
  "application/pdf", 
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/zip"
];

// Hàm Upload File lên Mây
export const uploadMedia = async (file: Express.Multer.File, type: "IMAGE" | "FILE") => {
  const isImage = type === "IMAGE";
  
  // 1. Kiểm duyệt dung lượng cực ngặt
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
  if (file.size > maxSize) {
    throw new AppError(400, "BAD_REQUEST", `Kích thước file vượt quá dung lượng cho phép (${maxSize / (1024 * 1024)}MB)`);
  }

  // 2. Kiểm duyệt MIME Type (Chống upload mã độc .exe, .bat đổi đuôi giả mạo)
  const allowedTypes = isImage ? ALLOWED_IMAGE_TYPES : ALLOWED_FILE_TYPES;
  if (!allowedTypes.includes(file.mimetype)) {
    throw new AppError(400, "BAD_REQUEST", `Định dạng ${isImage ? "ảnh" : "file"} không được hỗ trợ`);
  }

  // 3. Đẩy dữ liệu (Buffer) lên Cloudinary
  return new Promise<{ mediaUrl: string; mediaPublicId: string; fileName: string; fileSize: number; mimeType: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "connect_app/messages",
        resource_type: isImage ? "image" : "raw", // Quan trọng: Cloudinary dùng "raw" để lưu tài liệu (PDF, DOC)
        use_filename: true,
        unique_filename: true,
        filename_override: file.originalname,
      },
      (error, result) => {
        if (error || !result) return reject(new Error("Lỗi upload lên máy chủ Cloudinary"));
        
        // Trả về bộ Metadata để đưa vào PostgreSQL
        resolve({
          mediaUrl: result.secure_url,
          mediaPublicId: result.public_id,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype
        });
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

// Hàm Xoá File trên Mây (Sẽ dùng khi user Xoá tin nhắn)
export const deleteMedia = async (publicId: string, isImage: boolean = true) => {
  try {
    // Để xoá file "raw", phải báo cho Cloudinary biết nó là "raw"
    await cloudinary.uploader.destroy(publicId, { resource_type: isImage ? "image" : "raw" });
  } catch (error) {
    console.error("[Media Service] Lỗi xóa file:", error);
  }
};
