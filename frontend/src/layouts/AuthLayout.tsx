import { Box, Container, Paper, Typography, Grid } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { APP_NAME } from '@/utils/constants';
import Logo from '@/assets/eben-image.png';

export function AuthLayout() {
    return (
        <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, backgroundColor: 'background.default' }}>
            <Container maxWidth="sm">
                <Paper sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, boxShadow: '0 10px 30px rgba(50,65,88,0.06)' }}>
                    <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Grid item>
                            <Box component="img" src={Logo} alt={APP_NAME} sx={{ height: 44 }} />
                        </Grid>
                        <Grid item xs>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>{APP_NAME}</Typography>
                            <Typography variant="body2" color="text.secondary">Welcome back — please sign in to continue.</Typography>
                        </Grid>
                    </Grid>
                    <Outlet />
                </Paper>
            </Container>
        </Box>
    );
}
