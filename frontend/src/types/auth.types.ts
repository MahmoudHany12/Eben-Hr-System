export type UserRole = 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE';

export interface User {
    id: number;
    username: string;
    role: UserRole;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    access: string;
    refresh: string;
}

export interface RefreshTokenResponse {
    access: string;
}
