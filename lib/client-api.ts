import axios from "axios";

const clientApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach client JWT on every request
clientApi.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("nc_client_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to portal login on 401
clientApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (typeof window !== "undefined" && err.response?.status === 401) {
      localStorage.removeItem("nc_client_token");
      localStorage.removeItem("nc_client");
      // Preserve the coachId from the current URL if possible
      const params = new URLSearchParams(window.location.search);
      const coachId = params.get("coach") ?? "";
      window.location.href = coachId ? `/portal/login?coach=${coachId}` : "/portal/login";
    }
    return Promise.reject(err);
  }
);

export default clientApi;
