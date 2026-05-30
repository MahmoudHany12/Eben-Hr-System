import { useQuery } from '@tanstack/react-query';
import { companyApi } from '@/api/companyApi';
import type { Company } from '@/types/company';
import type { PaginatedResponse } from '@/types/api.types';

export const COMPANIES_QUERY_KEY = ['companies'];

export function useCompanies(params?: Record<string, any>) {
    return useQuery<PaginatedResponse<Company>>({
        queryKey: [...COMPANIES_QUERY_KEY, params ?? {}],
        queryFn: async () => companyApi.getCompanies(params),
    });
}

export function useCompany(id?: number) {
    return useQuery<Company | null>({
        queryKey: ['company', id],
        queryFn: async () => (id ? companyApi.getCompany(id) : null),
        enabled: Boolean(id),
    });
}
