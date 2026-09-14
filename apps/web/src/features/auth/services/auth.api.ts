const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

//Gọi API Đăng ký
export async function registerApi(data: {
  username: string;
  email: string;
  password: string;
  displayName: string;
}) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || "Đăng ký thất bại");
  }
  return json.data;
}

//Gọi API Đăng nhập

export async function loginApi(data: { email: string; password: string }) {
  // Gọi fetch tới `${API_URL}/auth/login` bằng phương thức POST
  // LƯU Ý: Bắt buộc phải có `credentials: "include"` để nhận cookie refreshToken
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // CỰC KỲ QUAN TRỌNG
    body: JSON.stringify(data)
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || "Đăng nhập thất bại");
  }
  return json.data; // Trả về { accessToken, user }
}

//Gọi API Lấy thông tin cá nhân (/users/me)

export async function getMeApi(accessToken: string) {
  // Gọi fetch tới `${API_URL}/users/me` bằng phương thức GET
  // Gửi kèm accessToken ở header Authorization: `Bearer ${accessToken}`
  const res = await fetch(`${API_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || "Không thể lấy thông tin cá nhân");
  }
  return json.data;
}

//Gọi API Đăng xuất

export async function logoutApi() {
  //Gọi fetch tới `${API_URL}/auth/logout` bằng phương thức POST
  //Đừng quên `credentials: "include"` để trình duyệt xóa cookie
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include"
  });
}