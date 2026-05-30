import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
    return (
        <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ minHeight: '70vh' }}>
            <Typography variant="h2" fontWeight={800}>404</Typography>
            <Typography color="text.secondary">The page you are looking for does not exist.</Typography>
            <Button component={Link} to="/dashboard" variant="contained">Go to dashboard</Button>
        </Stack>
    );
}
