"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMeApi, logoutApi } from "@/features/auth/services/auth.api";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  status: string;
}

export default function AppPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      // Lấy accessToken từ localStorage
      const token = localStorage.getItem("accessToken");

      // Nếu không có token -> người dùng chưa đăng nhập -> chuyển về /login
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Gọi hàm getMeApi(token) để lấy thông tin profile từ server
        const profile = await getMeApi(token);
        setUser(profile);
      } catch {
        // Nếu token hết hạn hoặc lỗi 401 -> xóa token và chuyển về /login
        localStorage.removeItem("accessToken");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await logoutApi();
    } finally {
      localStorage.removeItem("accessToken");
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600 font-medium">
        Đang tải thông tin tài khoản...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* Profile Card */}
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex flex-col items-center text-center">
        {/* Avatar Placeholder */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-md mb-4">
          {user.displayName.charAt(0).toUpperCase()}
        </div>

        {/* Thông tin người dùng */}
        <h3 className="text-xl font-bold text-gray-800">{user.displayName}</h3>
        <p className="text-sm font-medium text-blue-600 mb-1">@{user.username}</p>
        <p className="text-xs text-gray-500 mb-4">{user.email}</p>

        {/* Trạng thái Status */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          {user.status}
        </div>

        {/* Nút thao tác */}
        <div className="w-full space-y-2">
          <button
            type="button"
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
            onClick={() => alert("Tính năng chỉnh sửa sẽ làm ở Day tiếp theo!")}
          >
            Chỉnh sửa Profile
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}