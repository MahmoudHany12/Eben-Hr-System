import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import { APP_NAME } from '@/utils/constants';
import { ROLE_LABELS } from '@/utils/permissions';
import type { User } from '@/types/auth';

interface NavbarProps {
    user: User | null;
    onMenuClick?: () => void;
}

export function Navbar({ user, onMenuClick }: NavbarProps) {
    return (
        <AppBar position="fixed" elevation={0} sx={{ borderBottom: '1px solid rgba(148, 163, 184, 0.18)', backdropFilter: 'blur(12px)', backgroundColor: 'rgba(248, 250, 252, 0.88)', color: 'text.primary' }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {onMenuClick ? (
                        <IconButton color="inherit" edge="start" onClick={onMenuClick} sx={{ display: { md: 'none' } }}>
                            <MenuIcon />
                        </IconButton>
                    ) : null}
                    <Typography variant="h6" component={Link} to="/dashboard" sx={{ fontWeight: 800 }}>
                        {APP_NAME}
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {user ? `${user.username} · ${ROLE_LABELS[user.role]}` : 'Guest'}
                </Typography>
            </Toolbar>
        </AppBar>
    );
}
