import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1/student",
  withCredentials: true, // allows sending cookies
});

// Add a simple interceptor to include the token from localStorage if missing from cookies
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('studentToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses globally to log out the user if the token expires
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('studentToken');
        localStorage.removeItem('student');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
