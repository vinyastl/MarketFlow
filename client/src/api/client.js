import axios from "axios";

// In development the Vite dev server proxies /api to the Express backend.
// In production, point VITE_API_URL at the deployed backend, e.g. https://api.example.com
const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const api = axios.create({
  baseURL: `${apiUrl}/api`,
});

// Attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
