import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEmployee } from '@/hooks/useEmployees';
import { useCreateEmployee, useUpdateEmployee } from '@/hooks/useEmployeeMutations';
import { useCompanies } from '@/hooks/useCompanies';
import { useDepartments } from '@/hooks/useDepartments';
import { Loader } from '@/components/Loader';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/utils/apiErrors';

const employeeSchema = z.object({
    email: z.string().email('Invalid email').min(1, 'Email is required'),
    mobile: z.string().optional().refine((v) => !v || /^\+?[0-9]{7,15}$/.test(v), 'Invalid mobile'),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    title: z.string().optional(),
    hire_date: z.string().optional(),
    company_id: z.number(),
    department_id: z.number().nullable().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    role: z.enum(['ADMIN', 'HR_MANAGER', 'EMPLOYEE']).optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

export function EmployeeFormPage() {
    const params = useParams();
    const id = params.id ? Number(params.id) : undefined;
    const isCreate = !id;
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

    const { data: employee, isLoading: loadingEmployee } = useEmployee(id);
    const companiesResp = useCompanies({ page: 1, page_size: 200 });
    const [selectedCompany, setSelectedCompany] = useState<number | null>(null);

    const departmentsResp = useDepartments(selectedCompany ? { company: selectedCompany, page: 1, page_size: 200 } : { page: 1, page_size: 200 });

    const create = useCreateEmployee();
    const update = useUpdateEmployee();

    const isOwnProfile = !isCreate && user?.id === employee?.user_id;
    const isRestrictedEdit = (user?.role === 'EMPLOYEE' || user?.role === 'HR_MANAGER') && isOwnProfile;
    const isHrCreateLocked = isCreate && user?.role === 'HR_MANAGER' && !!user?.assigned_company_id;

    const roleOptions = useMemo(() => ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'] as const, []);

    const { control, register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<EmployeeFormValues>({ resolver: zodResolver(employeeSchema) });

    useEffect(() => {
        if (employee) {
            reset({
                email: employee.email,
                mobile: employee.mobile ?? undefined,
                first_name: undefined,
                last_name: undefined,
                title: employee.title ?? undefined,
                hire_date: employee.hire_date ?? undefined,
                company_id: employee.company_id,
                department_id: employee.department_id ?? null,
            });
            setSelectedCompany(employee.company_id);
        } else if (isCreate && user?.assigned_company_id) {
            setSelectedCompany(user.assigned_company_id);
            setValue('company_id', user.assigned_company_id);
        }
    }, [employee, isCreate, reset, setValue, user]);

    useEffect(() => {
        if (selectedCompany) {
            setValue('department_id', null);
        }
    }, [selectedCompany, setValue]);

    if (loadingEmployee && !isCreate) return <Loader />;

    const companies = companiesResp.data?.results ?? [];
    const departments = departmentsResp.data?.results ?? [];

    const onSubmit = async (values: EmployeeFormValues) => {
        try {
            const payload: Record<string, any> = {
                ...values,
                department_id: values.department_id || null,
            };
            if (isCreate && user?.role === 'HR_MANAGER' && user.assigned_company_id) {
                payload.company_id = user.assigned_company_id;
            }
            if (isCreate) {
                await create.mutateAsync(payload);
                showToast('Employee created', 'success');
            } else if (id) {
                await update.mutateAsync({ id, payload });
                showToast('Employee updated', 'success');
            }
            navigate('/employees');
        } catch (err) {
            showToast(getApiErrorMessage(err, 'Unable to save employee'), 'error');
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>{isCreate ? 'Create Employee' : 'Edit Employee'}</Typography>
            <Paper sx={{ p: 3 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2}>
                        <TextField label="Email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} fullWidth />
                        <TextField label="Mobile" {...register('mobile')} error={!!errors.mobile} helperText={errors.mobile?.message} fullWidth />

                        <Controller control={control} name="company_id" render={({ field }) => (
                            <TextField select label="Company" {...field} value={field.value ?? ''} onChange={(e) => { const next = Number(e.target.value); field.onChange(next); setSelectedCompany(next); }} fullWidth disabled={isRestrictedEdit || isHrCreateLocked}>
                                {companies.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                            </TextField>
                        )} />

                        <Controller control={control} name="department_id" render={({ field }) => (
                            <TextField select label="Department" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} fullWidth disabled={isRestrictedEdit}>
                                <MenuItem value="">None</MenuItem>
                                {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                            </TextField>
                        )} />

                        <TextField label="Title" {...register('title')} error={!!errors.title} helperText={errors.title?.message} fullWidth />
                        <TextField label="Hire Date" type="date" InputLabelProps={{ shrink: true }} {...register('hire_date')} error={!!errors.hire_date} helperText={errors.hire_date?.message} fullWidth />

                        {/* Optional credentials for creating user record */}
                        <TextField label="Username" {...register('username')} error={!!errors.username} helperText={errors.username?.message} fullWidth />
                        <TextField label="Password" type="password" {...register('password')} error={!!errors.password} helperText={errors.password?.message} fullWidth />

                        {(user?.role === 'ADMIN' || (user?.role === 'HR_MANAGER' && !isOwnProfile)) && (
                            <Controller control={control} name="role" render={({ field }) => (
                                <TextField select label="Role" {...field} fullWidth>
                                    {roleOptions.map((r) => (
                                        <MenuItem key={r} value={r}>{r}</MenuItem>
                                    ))}
                                </TextField>
                            )} />
                        )}

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button onClick={() => navigate('/employees')} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" variant="contained" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
                        </Box>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
}
