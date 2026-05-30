import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onClose: () => void;
}

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onClose,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="h6" fontWeight={800} color="error.main">
                    {title}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <Alert severity="warning" variant="outlined" sx={{ alignItems: 'center' }}>
                        This action is permanent and cannot be undone.
                    </Alert>
                    <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                        {description}
                    </Typography>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="text">{cancelLabel}</Button>
                <Button variant="contained" color="error" onClick={onConfirm}>{confirmLabel}</Button>
            </DialogActions>
        </Dialog>
    );
}
