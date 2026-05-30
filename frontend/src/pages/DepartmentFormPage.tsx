import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDepartment } from '@/hooks/useDepartments';
import { useCreateDepartment, useUpdateDepartment } from '@/hooks/useDepartmentMutations';
import { useCompanies } from '@/hooks/useCompanies';
import { Loader } from '@/components/Loader';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/utils/apiErrors';

const departmentSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    company_id: z.number(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

export function DepartmentFormPage() {
    const params = useParams();
    const id = params.id ? Number(params.id) : undefined;
    const isCreate = window.location.pathname.endsWith('/new');
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

    const { data: department, isLoading: loadingDepartment } = useDepartment(id);
    const companiesResp = useCompanies({ page: 1, page_size: 100 });

    const create = useCreateDepartment();
    const update = useUpdateDepartment();

    const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DepartmentFormValues>({ resolver: zodResolver(departmentSchema) });

    useEffect(() => {
        if (department) {
            reset({ name: department.name, company_id: department.company_id });
        } else if (isCreate && user?.assigned_company_id) {
            // For HR managers, preselect assigned company
            reset({ company_id: user.assigned_company_id, name: '' } as DepartmentFormValues);
        }
    }, [department, isCreate, reset, user]);

    if (loadingDepartment && !isCreate) return <Loader />;

    const onSubmit = async (values: DepartmentFormValues) => {
        try {
            if (isCreate) {
                await create.mutateAsync(values);
                showToast('Department created', 'success');
            } else if (id) {
                await update.mutateAsync({ id, payload: values });
                showToast('Department updated', 'success');
            }
            navigate('/departments');
        } catch (err) {
            const message = getApiErrorMessage(err, 'Unable to save department');
            showToast(message, 'error');
        }
    };

    const companies = companiesResp.data?.results ?? [];

    // If user is HR_MANAGER and assigned_company_id exists, disable company select
    const disableCompanySelect = user?.role === 'HR_MANAGER' && !!user?.assigned_company_id;

    return (
        <Box>
            <Typography variant="h5" gutterBottom>{isCreate ? 'Create Department' : 'Edit Department'}</Typography>
            <Paper sx={{ p: 3 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2}>
                        <TextField label="Name" {...register('name')} error={!!errors.name} helperText={errors.name?.message} fullWidth />

                        <Controller
                            control={control}
                            name="company_id"
                            render={({ field }) => (
                                <TextField select label="Company" {...field} disabled={disableCompanySelect} error={!!errors.company_id} helperText={errors.company_id?.message} fullWidth>
                                    {companies.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button onClick={() => navigate('/departments')} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" variant="contained" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
                        </Box>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
}

