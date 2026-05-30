import { api } from './axios';
import type { Department } from '@/types/department';
import type { PaginatedResponse } from '@/types/api.types';

export const departmentApi = {
    async getDepartments(params?: Record<string, any>): Promise<PaginatedResponse<Department>> {
        const { data } = await api.get<PaginatedResponse<Department>>('/departments/', { params });
        return data;
    },
    async getDepartment(id: number): Promise<Department> {
        const { data } = await api.get<Department>(`/departments/${id}/`);
        return data;
    },
    async createDepartment(payload: Partial<Department>): Promise<Department> {
        const { data } = await api.post<Department>('/departments/', payload);
        return data;
    },
    async updateDepartment(id: number, payload: Partial<Department>): Promise<Department> {
        const { data } = await api.put<Department>(`/departments/${id}/`, payload);
        return data;
    },
    async deleteDepartment(id: number): Promise<void> {
        await api.delete(`/departments/${id}/`);
    },
};
