import { api } from './axios';
import type { Company } from '@/types/company';
import type { PaginatedResponse } from '@/types/api.types';

export const companyApi = {
    async getCompanies(params?: Record<string, any>): Promise<PaginatedResponse<Company>> {
        const { data } = await api.get<PaginatedResponse<Company>>('/companies/', { params });
        return data;
    },
    async getCompany(id: number): Promise<Company> {
        const { data } = await api.get<Company>(`/companies/${id}/`);
        return data;
    },
    async createCompany(payload: Partial<Company>): Promise<Company> {
        const { data } = await api.post<Company>('/companies/', payload);
        return data;
    },
    async updateCompany(id: number, payload: Partial<Company>): Promise<Company> {
        const { data } = await api.put<Company>(`/companies/${id}/`, payload);
        return data;
    },
    async deleteCompany(id: number): Promise<void> {
        await api.delete(`/companies/${id}/`);
    },
};
