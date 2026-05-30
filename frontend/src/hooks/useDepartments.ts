import { useQuery } from '@tanstack/react-query';
import { departmentApi } from '@/api/departmentApi';
import type { Department } from '@/types/department';
import type { PaginatedResponse } from '@/types/api.types';

export const DEPARTMENTS_QUERY_KEY = ['departments'];

export function useDepartments(params?: Record<string, any>) {
    return useQuery<PaginatedResponse<Department>>({
        queryKey: [...DEPARTMENTS_QUERY_KEY, params ?? {}],
        queryFn: async () => departmentApi.getDepartments(params),
    });
}

export function useDepartment(id?: number) {
    return useQuery<Department | null>({
        queryKey: ['department', id],
        queryFn: async () => (id ? departmentApi.getDepartment(id) : null),
        enabled: Boolean(id),
    });
}
