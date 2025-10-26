import axios from "axios";
import { queryClient } from "../queryClient";
import { Auth } from "../../constants/auth/auth.constant";

const API = import.meta.env.DEV
  ? import.meta.env.VITE_API_LOCAL
  : import.meta.env.VITE_API_PROD;

export const instance = axios.create({
  baseURL: API,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

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

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error?.response?.status !== 401) {
      return Promise.reject(error);
    }

    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/me");

    if (isAuthEndpoint || originalRequest._retry) {
      queryClient.setQueryData(["me"], null);
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => instance(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      await instance.post(Auth.REFRESH);

      processQueue(null);
      isRefreshing = false;

      return instance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      isRefreshing = false;
      queryClient.setQueryData(["me"], null);

      return Promise.reject(refreshError);
    }
  }
);
