import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("nc_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401; surface upgrade prompt on 402
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (typeof window !== "undefined") {
      if (err.response?.status === 401) {
        localStorage.removeItem("nc_token");
        localStorage.removeItem("nc_coach");
        window.location.href = "/login";
      } else if (err.response?.status === 402) {
        const message: string =
          err.response?.data?.message ??
          "You've reached your client limit. Upgrade your plan to add more clients.";
        window.dispatchEvent(
          new CustomEvent("nutricoach:upgrade-required", { detail: { message } })
        );
      }
    }
    return Promise.reject(err);
  }
);

export default api;
