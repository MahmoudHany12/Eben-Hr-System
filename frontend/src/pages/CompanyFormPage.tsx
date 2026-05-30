import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCompany } from '@/hooks/useCompanies';
import { useCreateCompany, useUpdateCompany } from '@/hooks/useCompanyMutations';
import { Loader } from '@/components/Loader';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/utils/apiErrors';

const companySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    address: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export function CompanyFormPage() {
    const params = useParams();
    const id = params.id ? Number(params.id) : undefined;
    const isCreate = window.location.pathname.endsWith('/new');
    const navigate = useNavigate();
    const { showToast } = useToast();

    const { data: company, isLoading: loadingCompany } = useCompany(id);
    const create = useCreateCompany();
    const update = useUpdateCompany();

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CompanyFormValues>({ resolver: zodResolver(companySchema) });

    useEffect(() => {
        if (company) {
            reset({ name: company.name, address: company.address });
        }
    }, [company, reset]);

    if (loadingCompany && !isCreate) return <Loader />;

    const onSubmit = async (values: CompanyFormValues) => {
        try {
            if (isCreate) {
                await create.mutateAsync(values);
                showToast('Company created', 'success');
            } else if (id) {
                await update.mutateAsync({ id, payload: values });
                showToast('Company updated', 'success');
            }
            navigate('/companies');
        } catch (err) {
            showToast(getApiErrorMessage(err, 'Unable to save company'), 'error');
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>{isCreate ? 'Create Company' : 'Edit Company'}</Typography>
            <Paper sx={{ p: 3 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2}>
                        <TextField label="Name" {...register('name')} error={!!errors.name} helperText={errors.name?.message} fullWidth />
                        <TextField label="Address" {...register('address')} error={!!errors.address} helperText={errors.address?.message} fullWidth multiline rows={3} />

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button onClick={() => navigate('/companies')} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" variant="contained" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
                        </Box>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
}
