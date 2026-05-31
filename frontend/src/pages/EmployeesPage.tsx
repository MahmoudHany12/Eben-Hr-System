import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '@/hooks/useEmployees';
import { useCompanies } from '@/hooks/useCompanies';
import { useDepartments } from '@/hooks/useDepartments';
import { useDeleteEmployee } from '@/hooks/useEmployeeMutations';
import { Loader } from '@/components/Loader';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/utils/apiErrors';
import { getWorkflowLabel, WORKFLOW_CHIP_STYLES } from '@/utils/employeeWorkflow';

export function EmployeesPage() {
    const [page, setPage] = useState(0);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
    const pageSize = 25;
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

    const { data, isLoading, isError } = useEmployees({ page: page + 1, page_size: pageSize });
    const companiesResp = useCompanies({ page: 1, page_size: 200 });
    const departmentsResp = useDepartments({ page: 1, page_size: 500 });
    const deleteEmployee = useDeleteEmployee();
    const canDelete = user?.role === 'ADMIN';

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
    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteEmployee.mutateAsync(deleteTarget.id);
            showToast('Employee deleted', 'success');
            setDeleteTarget(null);
        } catch (err) {
            showToast(getApiErrorMessage(err, 'Unable to delete employee'), 'error');
        }
    };

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
                            {canDelete ? <TableCell align="right">Actions</TableCell> : null}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.results.map((e) => {
                            const isHired = e.workflow_state === 'HIRED';
                            const displayName = e.username_display ?? e.email;
                            return (
                            <TableRow key={e.id} hover onClick={() => navigate(`/employees/${e.id}`)} sx={{ cursor: 'pointer' }}>
                                <TableCell>{e.username_display ?? e.email}</TableCell>
                                <TableCell>{e.email}</TableCell>
                                <TableCell>{e.mobile ?? ''}</TableCell>
                                <TableCell>{e.title ?? ''}</TableCell>
                                <TableCell>{isHired ? e.hire_date ?? 'N/A' : 'N/A'}</TableCell>
                                <TableCell>
                                    <Chip
                                        size="small"
                                        label={getWorkflowLabel(e.workflow_state)}
                                        sx={WORKFLOW_CHIP_STYLES[e.workflow_state]}
                                    />
                                </TableCell>
                                <TableCell>{companyMap.get(e.company_id) ?? e.company_id}</TableCell>
                                <TableCell>{e.department_id ? deptMap.get(e.department_id) ?? 'N/A' : 'N/A'}</TableCell>
                                <TableCell>{isHired ? e.days_employed ?? 0 : 'N/A'}</TableCell>
                                {canDelete ? (
                                    <TableCell align="right">
                                        <Button
                                            color="error"
                                            size="small"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setDeleteTarget({ id: e.id, name: displayName });
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                ) : null}
                            </TableRow>
                            );
                        })}
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
            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title={deleteTarget ? `Delete employee "${deleteTarget.name}"?` : 'Delete employee?'}
                description="This will permanently delete the employee profile and user account. The username can be reused after deletion."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={() => { void handleDelete(); }}
                onClose={() => setDeleteTarget(null)}
            />
        </Box>
    );
}
