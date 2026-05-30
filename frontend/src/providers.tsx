import type { PropsWithChildren } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import { appTheme } from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

export function AppProviders({ children }: PropsWithChildren) {
    return (
        <ThemeProvider theme={appTheme}>
            <CssBaseline />
            <QueryClientProvider client={queryClient}>
                <ToastProvider>
                    <AuthProvider>{children}</AuthProvider>
                </ToastProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
}