"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginApi } from "@/features/auth/services/auth.api";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      // Gọi hàm loginApi truyền vào: email và password
      const result = await loginApi({
        email: formData.email,
        password: formData.password
      });

      // Lưu accessToken vào localStorage để trang /app có thể đọc được
      localStorage.setItem("accessToken", result.accessToken);

      // Chuyển hướng sang trang ứng dụng chính (/app)
      router.push("/app");
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Đăng nhập Connect App
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="huy@example.com"
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
              placeholder="Nhập mật khẩu của bạn"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:bg-blue-300"
          >
            {loading ? "Đang kiểm tra..." : "Đăng nhập"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Đăng ký tài khoản mới
          </Link>
        </p>
      </div>
    </div>
  );
}