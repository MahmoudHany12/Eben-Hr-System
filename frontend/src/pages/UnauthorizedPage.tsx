import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
    return (
        <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ minHeight: '70vh' }}>
            <Typography variant="h3" fontWeight={800}>Unauthorized</Typography>
            <Typography color="text.secondary">You do not have permission to access this page.</Typography>
            <Button component={Link} to="/dashboard" variant="contained">Back to dashboard</Button>
        </Stack>
    );
}
