import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

export function EmployeeLayout() {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box>
                <Outlet />
            </Box>
        </Container>
    );
}
