import axios from "axios";

// Single axios instance for the whole app. Base URL comes from the .env file,
// so switching between local development and a deployed API is a one-line change.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach the logged-in user's token (if any) to every outgoing request.
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("kokwet_user");
  if (stored) {
    const user = JSON.parse(stored);
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

// Turn every failed request into a plain, readable message the UI can just display.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export default api;
