import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useEmployees } from '@/hooks/useEmployees';
import { useCompanies } from '@/hooks/useCompanies';
import { useDepartments } from '@/hooks/useDepartments';
import { Loader } from '@/components/Loader';
import { useToast } from '@/context/ToastContext';
import { getWorkflowLabel, WORKFLOW_CHIP_STYLES } from '@/utils/employeeWorkflow';

export function EmployeesPage() {
    const [page, setPage] = useState(0);
    const pageSize = 25;
    const navigate = useNavigate();
    const { showToast } = useToast();

    const { data, isLoading, isError } = useEmployees({ page: page + 1, page_size: pageSize });
    const companiesResp = useCompanies({ page: 1, page_size: 200 });
    const departmentsResp = useDepartments({ page: 1, page_size: 500 });

    useEffect(() => {
        if (isError) {
            showToast('Unable to load employees', 'error');
        }
    }, [isError, showToast]);

    const companyMap = useMemo(() => {
        const map = new Map<number, string>();
        companiesResp.data?.results.forEach((c) => map.set(c.id, c.name));
        return map;
    }, [companiesResp.data]);

    const deptMap = useMemo(() => {
        const map = new Map<number, string>();
        departmentsResp.data?.results.forEach((d) => map.set(d.id, d.name));
        return map;
    }, [departmentsResp.data]);

    if (isLoading) return <Loader />;

    const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">Employees</Typography>
                <Button variant="contained" onClick={() => navigate('/employees/new')}>Add Employee</Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Username</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Mobile</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Hire Date</TableCell>
                            <TableCell>Workflow State</TableCell>
                            <TableCell>Company</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Days Employed</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.results.map((e) => (
                            <TableRow key={e.id} hover component={Link} to={`/employees/${e.id}`} sx={{ textDecoration: 'none', cursor: 'pointer' }}>
                                <TableCell>{e.username_display ?? e.email}</TableCell>
                                <TableCell>{e.email}</TableCell>
                                <TableCell>{e.mobile ?? ''}</TableCell>
                                <TableCell>{e.title ?? ''}</TableCell>
                                <TableCell>{e.hire_date ?? ''}</TableCell>
                                <TableCell>
                                    <Chip
                                        size="small"
                                        label={getWorkflowLabel(e.workflow_state)}
                                        sx={WORKFLOW_CHIP_STYLES[e.workflow_state]}
                                    />
                                </TableCell>
                                <TableCell>{companyMap.get(e.company_id) ?? e.company_id}</TableCell>
                                <TableCell>{e.department_id ? deptMap.get(e.department_id) ?? e.department_id : ''}</TableCell>
                                <TableCell>{e.days_employed ?? 0}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={data?.count ?? 0}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={pageSize}
                rowsPerPageOptions={[pageSize]}
            />
        </Box>
    );
}
