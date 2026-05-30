import { api } from './axios';
import type { LoginRequest, LoginResponse, RefreshResponse, User } from '@/types/auth';

export const authApi = {
    async login(input: LoginRequest): Promise<LoginResponse> {
        const { data } = await api.post<LoginResponse>('/auth/login/', input);
        return data;
    },
    async refresh(refresh: string): Promise<RefreshResponse> {
        const { data } = await api.post<RefreshResponse>('/auth/refresh/', { refresh });
        return data;
    },
    async me(accessToken?: string): Promise<User> {
        const { data } = await api.get<User>('/auth/me/', {
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        });
        return data;
    },
};
