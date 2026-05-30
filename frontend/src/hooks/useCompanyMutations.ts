import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companyApi } from '@/api/companyApi';
import type { Company } from '@/types/company';
import { COMPANIES_QUERY_KEY } from './useCompanies';

export function useCreateCompany() {
    const qc = useQueryClient();
    return useMutation<Company, unknown, Partial<Company>>({
        mutationFn: (payload) => companyApi.createCompany(payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: COMPANIES_QUERY_KEY }),
    });
}

export function useUpdateCompany() {
    const qc = useQueryClient();
    return useMutation<Company, unknown, { id: number; payload: Partial<Company> }>({
        mutationFn: ({ id, payload }) => companyApi.updateCompany(id, payload),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: COMPANIES_QUERY_KEY });
            qc.invalidateQueries({ queryKey: ['company', variables.id] });
        },
    });
}

export function useDeleteCompany() {
    const qc = useQueryClient();
    return useMutation<void, unknown, number>({
        mutationFn: (id) => companyApi.deleteCompany(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: COMPANIES_QUERY_KEY }),
    });
}
