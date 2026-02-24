import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (user._id) {
    config.headers.accessToken = user._id;
  }
  
  return config;
});

export default axiosInstance;
    