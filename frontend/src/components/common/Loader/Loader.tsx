import { CircularProgress, Stack } from '@mui/material';

export function Loader() {
    return (
        <Stack alignItems="center" justifyContent="center" minHeight={200}>
            <CircularProgress />
        </Stack>
    );
}
