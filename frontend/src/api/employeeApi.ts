import { api } from './axios';
import type { Employee } from '@/types/employee';
import type { PaginatedResponse } from '@/types/api.types';

export const employeeApi = {
    async getEmployees(params?: Record<string, any>): Promise<PaginatedResponse<Employee>> {
        const { data } = await api.get<PaginatedResponse<Employee>>('/employees/', { params });
        return data;
    },
    async getEmployee(id: number): Promise<Employee> {
        const { data } = await api.get<Employee>(`/employees/${id}/`);
        return data;
    },
    async getMe(): Promise<Employee> {
        const { data } = await api.get<Employee>(`/employees/me/`);
        return data;
    },
    async createEmployee(payload: Record<string, any>): Promise<Employee> {
        const { data } = await api.post<Employee>('/employees/', payload);
        return data;
    },
    async updateEmployee(id: number, payload: Record<string, any>): Promise<Employee> {
        const { data } = await api.put<Employee>(`/employees/${id}/`, payload);
        return data;
    },
    async patchEmployee(id: number, payload: Record<string, any>): Promise<Employee> {
        const { data } = await api.patch<Employee>(`/employees/${id}/`, payload);
        return data;
    },
    async deleteEmployee(id: number): Promise<void> {
        await api.delete(`/employees/${id}/`);
    },
};
