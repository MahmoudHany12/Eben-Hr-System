import { AppBar, Box, Button, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Avatar, Divider, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import { useLocation } from 'react-router-dom';
import Logo from '@/assets/eben-image.png';
import { Link, Outlet } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { APP_NAME } from '@/utils/constants';
import { ROLE_LABELS } from '@/utils/permissions';

type NavItem = {
    label: string;
    to: string;
    roles: Array<'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE'>;
};

const navigation: NavItem[] = [
    { label: 'Dashboard', to: '/dashboard', roles: ['ADMIN', 'HR_MANAGER'] },
    { label: 'Companies', to: '/companies', roles: ['ADMIN'] },
    { label: 'Departments', to: '/departments', roles: ['ADMIN', 'HR_MANAGER'] },
    { label: 'Employees', to: '/employees', roles: ['ADMIN', 'HR_MANAGER'] },
    { label: 'My Profile', to: '/profile', roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
];

export function AppLayout() {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
    const location = useLocation();
    const drawerWidth = desktopSidebarOpen ? 300 : 88;

    const visibleNavigation = useMemo(
        () => navigation.filter((item) => user && item.roles.includes(user.role)),
        [user],
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AppBar
                position="fixed"
                elevation={1}
                color="transparent"
                sx={{
                    borderBottom: '1px solid rgba(50,65,88,0.06)',
                    backgroundColor: 'background.paper',
                    ml: { xs: 0, md: `${drawerWidth}px` },
                    width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
                    transition: 'margin-left 180ms ease, width 180ms ease',
                }}
            >
                <Toolbar
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'auto 1fr auto', md: 'auto 1fr auto' },
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                        <IconButton color="inherit" edge="start" onClick={() => setMobileOpen((open) => !open)} sx={{ display: { md: 'none' } }}>
                            <MenuIcon />
                        </IconButton>
                        <Tooltip title={desktopSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
                            <IconButton color="inherit" onClick={() => setDesktopSidebarOpen((open) => !open)} sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
                                {desktopSidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
                            </IconButton>
                        </Tooltip>
                        <Box component={Link} to="/dashboard" sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flexShrink: 0 }}>
                            <Box component="img" src={Logo} alt={APP_NAME} sx={{ height: 36 }} />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 800,
                                    color: 'text.primary',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'clip',
                                }}
                            >
                                {APP_NAME}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'block' } }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {user ? `${user.username} · ${ROLE_LABELS[user.role]}` : 'Guest'}
                        </Typography>
                        {user ? (
                            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>{user.username?.charAt(0).toUpperCase()}</Avatar>
                        ) : null}
                        {user ? (
                            <Button color="inherit" onClick={() => { logout(); window.location.href = '/login'; }}>Log out</Button>
                        ) : null}
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        pt: 10,
                        px: 2,
                        borderRight: '1px solid rgba(50,65,88,0.08)',
                        background: 'linear-gradient(180deg, #ffffff 0%, #f9fbfa 100%)',
                        transition: 'width 180ms ease',
                        overflowX: 'hidden',
                    },
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: desktopSidebarOpen ? 'flex-start' : 'center', gap: 2, px: 1, mb: 2.5 }}>
                    <Box
                        sx={{
                            display: 'grid',
                            placeItems: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: 'rgba(0,191,99,0.08)',
                        }}
                    >
                        <Box component="img" src={Logo} alt={APP_NAME} sx={{ height: 28, width: 'auto' }} />
                    </Box>
                    {desktopSidebarOpen ? (
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1 }}>{APP_NAME}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>HR management workspace</Typography>
                        </Box>
                    ) : null}
                </Box>
                <Divider sx={{ mb: 2, borderColor: 'rgba(50,65,88,0.08)' }} />
                <List>
                    {visibleNavigation.map((item) => {
                        const selected = location.pathname.startsWith(item.to);
                        let Icon = DashboardIcon;
                        if (item.to === '/companies') Icon = BusinessIcon;
                        if (item.to === '/departments') Icon = AccountTreeIcon;
                        if (item.to === '/employees') Icon = PeopleIcon;
                        if (item.to === '/profile') Icon = PersonIcon;
                        return (
                            <ListItemButton
                                key={item.to}
                                component={Link}
                                to={item.to}
                                selected={selected}
                                sx={{
                                    mb: 0.75,
                                    px: desktopSidebarOpen ? 1.5 : 1.25,
                                    py: 1.1,
                                    borderRadius: 2,
                                    transition: 'background-color 160ms ease, transform 160ms ease',
                                    '&:hover': {
                                        transform: 'translateX(2px)',
                                    },
                                    justifyContent: desktopSidebarOpen ? 'flex-start' : 'center',
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: selected ? 'primary.main' : 'text.secondary' }}>
                                    <Icon />
                                </ListItemIcon>
                                {desktopSidebarOpen ? <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: selected ? 700 : 600 }} /> : null}
                            </ListItemButton>
                        );
                    })}
                </List>
            </Drawer>

            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                sx={{ display: { xs: 'block', md: 'none' }, [`& .MuiDrawer-paper`]: { width: 280, px: 2, pt: 2, borderRight: '1px solid rgba(50,65,88,0.08)' } }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1, mt: 1, mb: 2 }}>
                    <Box sx={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 2, bgcolor: 'rgba(0,191,99,0.08)' }}>
                        <Box component="img" src={Logo} alt={APP_NAME} sx={{ height: 26, width: 'auto' }} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1 }}>{APP_NAME}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>HR management workspace</Typography>
                    </Box>
                </Box>
                <Divider sx={{ mb: 2, borderColor: 'rgba(50,65,88,0.08)' }} />
                <List>
                    {visibleNavigation.map((item) => (
                        <ListItemButton key={item.to} component={Link} to={item.to} onClick={() => setMobileOpen(false)} sx={{ mb: 0.75, px: 1.5, py: 1.1, borderRadius: 2 }}>
                            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItemButton>
                    ))}
                </List>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, mt: 10, minWidth: 0, transition: 'margin-left 180ms ease' }}>
                <Outlet />
            </Box>
        </Box>
    );
}
