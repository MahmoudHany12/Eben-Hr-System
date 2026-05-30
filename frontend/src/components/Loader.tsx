import { CircularProgress, Stack, Box, Skeleton } from '@mui/material';

export function Loader() {
    return (
        <Stack alignItems="center" justifyContent="center" minHeight={200} spacing={2}>
            <Box sx={{ width: 160 }}>
                <Skeleton variant="rectangular" height={12} sx={{ borderRadius: 1 }} />
            </Box>
            <CircularProgress />
        </Stack>
    );
}
