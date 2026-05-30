import { STORAGE_KEYS } from './constants';
import type { User } from '@/types/auth.types';

export const tokenStorage = {
    getAccessToken(): string | null {
        return localStorage.getItem(STORAGE_KEYS.accessToken);
    },
    getRefreshToken(): string | null {
        return localStorage.getItem(STORAGE_KEYS.refreshToken);
    },
    setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
        localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
    },
    clearTokens(): void {
        localStorage.removeItem(STORAGE_KEYS.accessToken);
        localStorage.removeItem(STORAGE_KEYS.refreshToken);
    },
};

export const userStorage = {
    getUser(): User | null {
        const value = localStorage.getItem(STORAGE_KEYS.user);
        return value ? (JSON.parse(value) as User) : null;
    },
    setUser(user: User): void {
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    },
    clearUser(): void {
        localStorage.removeItem(STORAGE_KEYS.user);
    },
};
