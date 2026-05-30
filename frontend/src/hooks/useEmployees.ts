import { useQuery } from '@tanstack/react-query';
import { employeeApi } from '@/api/employeeApi';
import type { Employee } from '@/types/employee';
import type { PaginatedResponse } from '@/types/api.types';

export const EMPLOYEES_QUERY_KEY = ['employees'];

export function useEmployees(params?: Record<string, any>) {
    return useQuery<PaginatedResponse<Employee>>({
        queryKey: [...EMPLOYEES_QUERY_KEY, params ?? {}],
        queryFn: async () => employeeApi.getEmployees(params),
    });
}

export function useEmployee(id?: number) {
    return useQuery<Employee | null>({
        queryKey: ['employee', id],
        queryFn: async () => (id ? employeeApi.getEmployee(id) : null),
        enabled: Boolean(id),
    });
}

export function useMyEmployee() {
    return useQuery<Employee | null>({
        queryKey: ['employee', 'me'],
        queryFn: async () => employeeApi.getMe(),
    });
}
