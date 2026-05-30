import { Box, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import { Link } from 'react-router-dom';
import Logo from '@/assets/eben-image.png';
import type { UserRole } from '@/types/auth';

interface SidebarProps {
    open?: boolean;
    onClose?: () => void;
    userRole: UserRole | null;
}

const navigation: Array<{ label: string; to: string; roles: UserRole[] }> = [
    { label: 'Dashboard', to: '/dashboard', roles: ['ADMIN'] },
    { label: 'Companies', to: '/companies', roles: ['ADMIN'] },
    { label: 'Departments', to: '/departments', roles: ['ADMIN', 'HR_MANAGER'] },
    { label: 'Employees', to: '/employees', roles: ['ADMIN', 'HR_MANAGER'] },
    { label: 'My Profile', to: '/profile', roles: ['EMPLOYEE'] },
];

export function Sidebar({ open = true, onClose, userRole }: SidebarProps) {
    const items = navigation.filter((item) => userRole && item.roles.includes(userRole));

    return (
        <Drawer
            variant={onClose ? 'temporary' : 'permanent'}
            open={onClose ? open : true}
            onClose={onClose}
            sx={{
                display: { xs: onClose ? 'block' : 'none', md: 'block' },
                width: 280,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: 280, boxSizing: 'border-box', pt: 10, px: 2, borderRight: '1px solid rgba(50,65,88,0.08)', background: 'linear-gradient(180deg, #ffffff 0%, #f9fbfa 100%)' },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1, mb: 2.5 }}>
                <Box sx={{ display: 'grid', placeItems: 'center', width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(0,191,99,0.08)' }}>
                    <Box component="img" src={Logo} alt="eBen" sx={{ height: 28, width: 'auto' }} />
                </Box>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1 }}>eBen</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>HR management workspace</Typography>
                </Box>
            </Box>
            <Divider sx={{ mb: 2, borderColor: 'rgba(50,65,88,0.08)' }} />
            <List>
                {items.map((item) => {
                    let Icon = DashboardIcon;
                    if (item.to === '/companies') Icon = BusinessIcon;
                    if (item.to === '/departments') Icon = AccountTreeIcon;
                    if (item.to === '/employees') Icon = PeopleIcon;
                    if (item.to === '/profile') Icon = PersonIcon;
                    return (
                    <ListItemButton key={item.to} component={Link} to={item.to} onClick={onClose} sx={{ mb: 0.75, px: 1.5, py: 1.1, borderRadius: 2 }}>
                        <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                            <Icon />
                        </ListItemIcon>
                        <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
                    </ListItemButton>
                    );
                })}
            </List>
        </Drawer>
    );
}
