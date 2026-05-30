import { useState } from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useDepartments } from '@/hooks/useDepartments';
import { useCompanies } from '@/hooks/useCompanies';
import { useDeleteDepartment } from '@/hooks/useDepartmentMutations';
import { Loader } from '@/components/Loader';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';

export function DepartmentsPage() {
    const [page, setPage] = useState(0);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
    const pageSize = 25;
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { user } = useAuth();
    const deleteDepartment = useDeleteDepartment();

    const { data, isLoading, isError } = useDepartments({ page: page + 1, page_size: pageSize });
    const companiesResp = useCompanies({ page: 1, page_size: 100 });

    if (isLoading) return <Loader />;
    if (isError) {
        showToast('Unable to load departments', 'error');
    }

    const companyMap = new Map<number, string>();
    companiesResp.data?.results.forEach((c) => companyMap.set(c.id, c.name));

    const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteDepartment.mutateAsync(deleteTarget.id);
            showToast('Department deleted', 'success');
            setDeleteTarget(null);
        } catch {
            showToast('Unable to delete department', 'error');
        }
    };

    const canDelete = user?.role === 'ADMIN' || user?.role === 'HR_MANAGER';

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">Departments</Typography>
                <Button variant="contained" onClick={() => navigate('/departments/new')}>Add Department</Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Company</TableCell>
                            <TableCell>Active Employees</TableCell>
                            {canDelete ? <TableCell>Actions</TableCell> : null}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.results.map((d) => (
                            <TableRow key={d.id} hover component={Link} to={`/departments/${d.id}`} style={{ textDecoration: 'none' }}>
                                <TableCell>{d.name}</TableCell>
                                <TableCell>{companyMap.get(d.company_id) ?? d.company_id}</TableCell>
                                <TableCell>{d.active_employees_count ?? 0}</TableCell>
                                {canDelete ? (
                                    <TableCell>
                                        <Button
                                            color="error"
                                            size="small"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                setDeleteTarget({ id: d.id, name: d.name });
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                ) : null}
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

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title={deleteTarget ? `Delete department “${deleteTarget.name}”?` : 'Delete department?'}
                description={deleteTarget ? `Deleting this department is permanent.

Employees assigned to ${deleteTarget.name} will not be deleted, but their department will be cleared.` : ''}
                confirmLabel="Delete department"
                cancelLabel="Cancel"
                onConfirm={() => { void handleDelete(); }}
                onClose={() => setDeleteTarget(null)}
            />
        </Box>
    );
}
