import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>{title}</Typography>
                {subtitle ? <Typography color="text.secondary">{subtitle}</Typography> : null}
            </Box>
            {actions}
        </Box>
    );
}
