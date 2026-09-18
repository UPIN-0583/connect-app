const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  let accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const headers = new Headers(options.headers || {});
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const initialResponse = await fetch(url, { ...options, headers });

  if (initialResponse.status === 401) {
    if (isRefreshing) {
      return new Promise<Response>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(newToken => {
        headers.set("Authorization", `Bearer ${newToken}`);
        return fetch(url, { ...options, headers });
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      const refreshJson = await refreshRes.json();

      if (!refreshRes.ok || !refreshJson.success) {
        throw new Error("Phien dang nhap het han.");
      }

      const newAccessToken = refreshJson.data.accessToken;
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", newAccessToken);
      }

      processQueue(null, newAccessToken);

      headers.set("Authorization", `Bearer ${newAccessToken}`);
      const retryResponse = await fetch(url, { ...options, headers });
      return retryResponse;
    } catch (err: any) {
      processQueue(err, null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  return initialResponse;
}

// Wrapper cho XMLHttpRequest de ho tro upload co tien do
export function xhrWithAuth(
  url: string,
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    let accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    const executeRequest = (token: string | null) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
      }

      xhr.onload = async () => {
        if (xhr.status === 401) {
          if (isRefreshing) {
            failedQueue.push({
              resolve: (newToken: string) => executeRequest(newToken),
              reject: (err: any) => reject(err)
            });
            return;
          }

          isRefreshing = true;
          try {
            const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
              method: "POST",
              credentials: "include",
            });
            const refreshJson = await refreshRes.json();
            if (!refreshRes.ok || !refreshJson.success) throw new Error("That bai");

            const newAccessToken = refreshJson.data.accessToken;
            if (typeof window !== "undefined") localStorage.setItem("accessToken", newAccessToken);
            
            processQueue(null, newAccessToken);
            executeRequest(newAccessToken);
          } catch (err) {
            processQueue(new Error("Phien het han"), null);
            if (typeof window !== "undefined") {
              localStorage.removeItem("accessToken");
              window.location.href = "/login";
            }
            reject(new Error("Phien dang nhap het han. Vui long dang nhap lai."));
          } finally {
            isRefreshing = false;
          }
          return;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const json = JSON.parse(xhr.responseText);
            resolve(json.data || json);
          } catch (e) {
            resolve(xhr.responseText);
          }
        } else {
          try {
            const json = JSON.parse(xhr.responseText);
            reject(new Error(json.error?.message || "Loi mang"));
          } catch (e) {
            reject(new Error("Loi mang"));
          }
        }
      };

      xhr.onerror = () => reject(new Error("Loi mang"));
      xhr.send(formData);
    };

    executeRequest(accessToken);
  });
}