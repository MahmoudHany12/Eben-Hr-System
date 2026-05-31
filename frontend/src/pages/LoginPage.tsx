import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types/auth';
import type { ApiErrorResponse } from '@/types/api.types';

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [serverError, setServerError] = useState<string | null>(null);

    const getHomeRoute = (role: UserRole) => (role === 'EMPLOYEE' ? '/profile' : '/dashboard');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (values: LoginFormValues) => {
        setServerError(null);
        try {
            const currentUser = await login(values);
            navigate(getHomeRoute(currentUser.role), { replace: true });
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                const detail = error.response?.data?.error?.detail;
                if (typeof detail === 'string' && detail.trim()) {
                    setServerError(detail);
                    return;
                }

                if (error.response?.status === 401) {
                    setServerError('Invalid username or password.');
                    return;
                }
            }

            setServerError(error instanceof Error ? error.message : 'Unable to sign in');
        }
    };

    return (
        <Stack spacing={3} component="form" onSubmit={handleSubmit(onSubmit)}>
            <div>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                    Sign in to your account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Enter your credentials to access the eBen HR dashboard.
                </Typography>
            </div>

            {serverError ? <Alert severity="error">{serverError}</Alert> : null}

            <TextField label="Username" autoComplete="username" {...register('username')} error={Boolean(errors.username)} helperText={errors.username?.message} fullWidth sx={{ input: { padding: '12px 14px' } }} />
            <TextField label="Password" type="password" autoComplete="current-password" {...register('password')} error={Boolean(errors.password)} helperText={errors.password?.message} fullWidth sx={{ input: { padding: '12px 14px' } }} />
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting} fullWidth>
                {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
        </Stack>
    );
}
