import { useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentApi } from '@/api/departmentApi';
import type { Department } from '@/types/department';
import { DEPARTMENTS_QUERY_KEY } from './useDepartments';

export function useCreateDepartment() {
    const qc = useQueryClient();
    return useMutation<Department, unknown, Partial<Department>>({
        mutationFn: (payload) => departmentApi.createDepartment(payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY }),
    });
}

export function useUpdateDepartment() {
    const qc = useQueryClient();
    return useMutation<Department, unknown, { id: number; payload: Partial<Department> }>({
        mutationFn: ({ id, payload }) => departmentApi.updateDepartment(id, payload),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
            qc.invalidateQueries({ queryKey: ['department', variables.id] });
        },
    });
}

export function useDeleteDepartment() {
    const qc = useQueryClient();
    return useMutation<void, unknown, number>({
        mutationFn: (id) => departmentApi.deleteDepartment(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY }),
    });
}
