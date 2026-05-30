import { Box, Paper, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import BusinessIcon from '@mui/icons-material/Business';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PeopleIcon from '@mui/icons-material/People';
import BadgeIcon from '@mui/icons-material/Badge';
import { useCompanies } from '@/hooks/useCompanies';
import { useDepartments } from '@/hooks/useDepartments';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/context/AuthContext';
import { Loader } from '@/components/Loader';

export function DashboardPage() {
    const { user } = useAuth();
    const canSeeCompanyStats = user?.role === 'ADMIN';
    const companies = useCompanies(canSeeCompanyStats ? { page: 1, page_size: 200 } : undefined);
    const departments = useDepartments({ page: 1, page_size: 500 });
    const employees = useEmployees({ page: 1, page_size: 500 });

    const cards = useMemo(() => ([
        ...(canSeeCompanyStats ? [{ label: 'Companies', value: companies.data?.count ?? 0 }] : []),
        { label: 'Departments', value: departments.data?.count ?? 0 },
        { label: 'Employees', value: employees.data?.count ?? 0 },
        { label: 'Role', value: user?.role ?? 'Guest' },
    ]), [canSeeCompanyStats, companies.data?.count, departments.data?.count, employees.data?.count, user?.role]);

    const employeeReport = useMemo(() => {
        const rows = employees.data?.results ?? [];
        const applications = rows.filter((row) => row.workflow_state === 'APPLICATION_RECEIVED').length;
        const interviews = rows.filter((row) => row.workflow_state === 'INTERVIEW_SCHEDULED').length;
        const hired = rows.filter((row) => row.workflow_state === 'HIRED').length;
        const notAccepted = rows.filter((row) => row.workflow_state === 'NOT_ACCEPTED').length;
        const withDepartment = rows.filter((row) => Boolean(row.department_id)).length;
        return [
            { label: 'Applications Received', value: applications },
            { label: 'Interviews Scheduled', value: interviews },
            { label: 'Hired', value: hired },
            { label: 'Not Accepted', value: notAccepted },
            { label: 'Assigned departments', value: withDepartment },
        ];
    }, [employees.data]);

    if ((canSeeCompanyStats && companies.isLoading) || departments.isLoading || employees.isLoading) return <Loader />;

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h3" fontWeight={800}>Dashboard</Typography>
                <Typography color="text.secondary">Overview of the current workspace.</Typography>
            </Box>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
                {cards.map((card) => {
                    let Icon = BadgeIcon;
                    if (card.label === 'Companies') Icon = BusinessIcon;
                    if (card.label === 'Departments') Icon = AccountTreeIcon;
                    if (card.label === 'Employees') Icon = PeopleIcon;
                    return (
                        <Paper key={card.label} sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', transition: 'transform 160ms ease', '&:hover': { transform: 'translateY(-4px)' } }}>
                            <Box sx={{ bgcolor: 'rgba(0,191,99,0.08)', color: 'primary.main', p: 1.25, borderRadius: 1.5 }}>
                                <Icon />
                            </Box>
                            <Box>
                                <Typography variant="overline" color="text.secondary">{card.label}</Typography>
                                <Typography variant="h4" fontWeight={800}>{card.value}</Typography>
                            </Box>
                        </Paper>
                    );
                })}
            </Box>
            <Box>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Employee Report</Typography>
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' } }}>
                    {employeeReport.map((card) => (
                        <Paper key={card.label} sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Box sx={{ bgcolor: 'rgba(50,65,88,0.04)', color: 'text.primary', p: 1, borderRadius: 1 }}>
                                <PeopleIcon />
                            </Box>
                            <Box>
                                <Typography variant="overline" color="text.secondary">{card.label}</Typography>
                                <Typography variant="h4" fontWeight={800}>{card.value}</Typography>
                            </Box>
                        </Paper>
                    ))}
                </Box>
            </Box>
        </Stack>
    );
}
