import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7196/api',
  // withCredentials: true, // Only for specific endpoints now (Refresh/Logout)
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Always send cookies to these endpoints (for refresh token)
    if (config.url?.includes('/auth/refresh-token') || config.url?.includes('/auth/logout')) {
      config.withCredentials = true;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loops
    if (originalRequest.url === '/auth/refresh-token' || originalRequest.url === '/auth/login' || originalRequest.url === '/auth/register') {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 1. Fetch CSRF token first
        const csrfRes = await axios.get(`${api.defaults.baseURL}/auth/csrf`, {
          withCredentials: true, // Needed to set the cookie
        });
        const csrfToken = csrfRes.data.csrfToken;

        // 2. Refresh Token call
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
            headers: {
              'X-XSRF-TOKEN': csrfToken,
            },
          }
        );

        const newAccessToken = refreshResponse.data.accessToken;

        // 3. Update Zustand Store
        useAuthStore.getState().setAccessToken(newAccessToken);

        // 4. Update Original Request Header
        api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

        // 5. Process Queue
        processQueue(null, newAccessToken);

        // 6. Retry original request
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().setAccessToken(null); // Clear invalid state

        if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
