"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerApi } from "@/features/auth/services/auth.api";

export default function RegisterPage() {
  const router = useRouter();

  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Xử lý khi gõ bàn phím vào các ô input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Xử lý khi bấm nút "Tạo tài khoản"
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Kiểm tra nếu password và confirmPassword không khớp nhau
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setLoading(true);

      // Gọi hàm registerApi truyền vào: username, email, displayName, password
      await registerApi({
        username: formData.username,
        displayName: formData.displayName,
        email: formData.email,
        password: formData.password
      });

      // Đăng ký thành công -> Chuyển hướng sang trang Đăng nhập
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi đăng ký");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Tạo tài khoản mới
        </h2>

        {/* Hiển thị thông báo lỗi màu đỏ nếu có */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị</label>
            <input
              type="text"
              name="displayName"
              required
              value={formData.displayName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Tên hiển thị"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Tối thiểu 8 ký tự"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Nhập lại mật khẩu"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:bg-blue-300"
          >
            {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}