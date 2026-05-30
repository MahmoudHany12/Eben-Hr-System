export type UserRole = 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE';

export interface User {
    id: number;
    username: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    role: UserRole;
    assigned_company_id?: number | null;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    access: string;
    refresh: string;
}

export interface RefreshResponse {
    access: string;
}
