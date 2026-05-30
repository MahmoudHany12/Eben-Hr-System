import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '@/api/employeeApi';
import { EMPLOYEES_QUERY_KEY } from './useEmployees';

export function useCreateEmployee() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Record<string, any>) => employeeApi.createEmployee(payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY }),
    });
}

export function useUpdateEmployee() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: Record<string, any> }) => employeeApi.updateEmployee(id, payload),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
            qc.invalidateQueries({ queryKey: ['employee', variables.id] });
        },
    });
}

export function usePatchEmployee() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: Record<string, any> }) => employeeApi.patchEmployee(id, payload),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
            qc.invalidateQueries({ queryKey: ['employee', variables.id] });
        },
    });
}

export function useDeleteEmployee() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => employeeApi.deleteEmployee(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY }),
    });
}
