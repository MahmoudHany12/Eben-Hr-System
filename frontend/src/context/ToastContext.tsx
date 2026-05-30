import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { Alert, Snackbar } from '@mui/material';

type ToastSeverity = 'success' | 'info' | 'warning' | 'error';

interface ToastContextValue {
    showToast: (message: string, severity?: ToastSeverity) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<ToastSeverity>('info');

    const showToast = (nextMessage: string, nextSeverity: ToastSeverity = 'info') => {
        setMessage(nextMessage);
        setSeverity(nextSeverity);
        setOpen(true);
    };

    const value = useMemo(() => ({ showToast }), []);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert severity={severity} variant="filled" onClose={() => setOpen(false)} sx={{ width: '100%', boxShadow: '0 10px 30px rgba(50,65,88,0.08)' }}>
                    {message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
