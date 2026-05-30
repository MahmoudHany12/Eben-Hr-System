import axios from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage, userStorage } from '@/utils/storage';
import type { ApiErrorResponse } from '@/types/api.types';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

const notifySubscribers = (token: string | null) => {
    pendingQueue.forEach((callback) => callback(token));
    pendingQueue = [];
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as RetryableRequestConfig | undefined;
        const status = error.response?.status;
        const refreshToken = tokenStorage.getRefreshToken();

        if (status === 401 && originalRequest && refreshToken && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push((newToken) => {
                        if (!newToken) {
                            reject(error);
                            return;
                        }
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        resolve(api(originalRequest));
                    });
                });
            }

            isRefreshing = true;

            try {
                const { authApi } = await import('@/api/authApi');
                const refreshed = await authApi.refresh(refreshToken);
                tokenStorage.setTokens(refreshed.access, refreshToken);
                notifySubscribers(refreshed.access);
                originalRequest.headers.Authorization = `Bearer ${refreshed.access}`;
                return api(originalRequest);
            } catch {
                tokenStorage.clearTokens();
                userStorage.clearUser();
                notifySubscribers(null);
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    },
);
