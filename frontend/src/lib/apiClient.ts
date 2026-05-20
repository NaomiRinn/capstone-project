import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';

// ─── Token Storage ─────────────────────────────────────────────────────────
const TOKEN_KEY = 'auvra_access_token';
const REFRESH_KEY = 'auvra_refresh_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setRefresh: (token: string) => localStorage.setItem(REFRESH_KEY, token),
};

// ─── Retry Config ──────────────────────────────────────────────────────────
const MAX_RETRIES = 3;
const RETRY_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

function getExponentialDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt) + Math.random() * 500, 15_000);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Create Axios Instance ─────────────────────────────────────────────────
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: env.VITE_API_BASE_URL,
    timeout: 30_000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // ── Request Interceptor: attach JWT token ────────────────────────────────
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenStorage.get();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // ── Response Interceptor: handle 401 + retry logic ───────────────────────
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalConfig = error.config as AxiosRequestConfig & { _retryCount?: number; _retry401?: boolean };
      if (!originalConfig) return Promise.reject(error);

      const status = error.response?.status;

      // Handle 401: attempt token refresh
      if (status === 401 && !originalConfig._retry401) {
        originalConfig._retry401 = true;
        const refreshToken = tokenStorage.getRefresh();
        if (refreshToken) {
          try {
            const { data } = await axios.post(`${env.VITE_API_BASE_URL}/api/v1/auth/refresh`, { refreshToken });
            tokenStorage.set(data.accessToken);
            tokenStorage.setRefresh(data.refreshToken);
            return client(originalConfig);
          } catch {
            tokenStorage.clear();
            window.dispatchEvent(new CustomEvent('auvra:session-expired'));
          }
        }
        return Promise.reject(error);
      }

      // Exponential backoff retry for transient errors
      originalConfig._retryCount = originalConfig._retryCount ?? 0;
      if (
        originalConfig._retryCount < MAX_RETRIES &&
        status !== undefined &&
        RETRY_STATUS_CODES.has(status)
      ) {
        originalConfig._retryCount++;
        const delay = getExponentialDelay(originalConfig._retryCount);
        await sleep(delay);
        return client(originalConfig);
      }

      return Promise.reject(error);
    },
  );

  return client;
}

export const apiClient = createApiClient();

// ─── Cancellable Request Helper ────────────────────────────────────────────
export function createCancellableRequest<T>(
  requestFn: (signal: AbortSignal) => Promise<T>,
): { promise: Promise<T>; cancel: () => void } {
  const controller = new AbortController();
  return {
    promise: requestFn(controller.signal),
    cancel: () => controller.abort(),
  };
}

// ─── Error Parser ──────────────────────────────────────────────────────────
export interface ParsedApiError {
  message: string;
  code: string;
  status: number;
  isNetworkError: boolean;
  isTimeout: boolean;
}

export function parseApiError(error: unknown): ParsedApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
    const isNetworkError = !error.response && !isTimeout;
    const apiMsg = (error.response?.data as { message?: string })?.message;

    return {
      message: apiMsg ?? (isNetworkError ? 'Koneksi gagal. Periksa jaringan Anda.' : isTimeout ? 'Permintaan timeout. Coba lagi.' : `Kesalahan server (${status})`),
      code: (error.response?.data as { code?: string })?.code ?? error.code ?? 'UNKNOWN',
      status,
      isNetworkError,
      isTimeout,
    };
  }
  return {
    message: 'Terjadi kesalahan yang tidak diketahui.',
    code: 'UNKNOWN',
    status: 0,
    isNetworkError: false,
    isTimeout: false,
  };
}
