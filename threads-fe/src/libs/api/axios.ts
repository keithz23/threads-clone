import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";
import { Auth } from "../../constants/auth/auth.constant";

const API = import.meta.env.DEV
  ? import.meta.env.VITE_API_LOCAL
  : import.meta.env.VITE_API_PROD;

export const instance = axios.create({
  baseURL: API,
  withCredentials: true,
});

let isRefreshing = false as boolean;
type Queued = {
  resolve: (v?: any) => void;
  reject: (e: any) => void;
  config: AxiosRequestConfig;
};
let queue: Queued[] = [];

function drainQueue(error: any = null) {
  queue.forEach(({ reject, resolve, config }) =>
    error ? reject(error) : resolve(config)
  );
  queue = [];
}

function isAuthRefreshUrl(url?: string) {
  return !!url && url.includes(Auth.REFRESH);
}
function isPublicAuthUrl(url?: string) {
  if (!url) return false;
  return url.includes(Auth.LOGIN) || url.includes(Auth.REGISTER);
}

instance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    const status = error.response?.status;
    const url = original?.url || "";

    if (status !== 401) return Promise.reject(error);

    if (original._retry || isAuthRefreshUrl(url) || isPublicAuthUrl(url)) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (cfg) => resolve(instance(cfg || original)),
          reject,
          config: original,
        });
      });
    }

    isRefreshing = true;
    try {
      await instance.post(Auth.REFRESH);

      isRefreshing = false;
      drainQueue();
      return instance(original);
    } catch (e: any) {
      isRefreshing = false;
      drainQueue(e);

      return Promise.reject(e);
    }
  }
);
