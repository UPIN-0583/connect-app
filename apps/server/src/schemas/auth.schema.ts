import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("Email không đúng định dạng"),
  
  username: z
    .string()
    .min(3, "Username tối thiểu 3 ký tự")
    .max(30, "Username tối đa 30 ký tự")
    .regex(/^[a-zA-Z0-9_]+$/, "Username chỉ được chứa chữ cái, chữ số và dấu gạch dưới"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),

  displayName: z.string().min(1, "Tên hiển thị không được để trống").max(50, "Tên hiển thị tối đa 50 ký tự")
});


export const loginSchema = z.object({
  email: z.email("Email không đúng định dạng"),

  password: z.string().min(1, "Vui lòng nhập mật khẩu")
});


export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;