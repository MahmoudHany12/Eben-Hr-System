import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    override state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Application error boundary caught an error', error, errorInfo);
    }

    override render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
                    <Paper sx={{ p: 4, maxWidth: 520, width: '100%' }}>
                        <Stack spacing={2}>
                            <Typography variant="h5" fontWeight={800}>
                                Something went wrong
                            </Typography>
                            <Alert severity="error">The app hit an unexpected error. Refresh the page to try again.</Alert>
                            <Button variant="contained" onClick={() => this.setState({ hasError: false })}>
                                Try again
                            </Button>
                        </Stack>
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}