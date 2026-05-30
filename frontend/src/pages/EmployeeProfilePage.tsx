import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { useEmployee, useMyEmployee } from '@/hooks/useEmployees';
import { usePatchEmployee } from '@/hooks/useEmployeeMutations';
import { Loader } from '@/components/Loader';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/utils/apiErrors';
import { getWorkflowLabel, WORKFLOW_ACTION_LABELS, WORKFLOW_CHIP_STYLES } from '@/utils/employeeWorkflow';
import type { EmployeeWorkflowState } from '@/types/employee';

export function EmployeeProfilePage() {
    const [transitionTarget, setTransitionTarget] = useState<EmployeeWorkflowState | null>(null);
    const params = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const id = params.id ? Number(params.id) : undefined;

    const { data: employee, isLoading } = useEmployee(id);
    const myEmployee = useMyEmployee();
    const patchEmployee = usePatchEmployee();

    const resolvedEmployee = employee ?? myEmployee.data ?? undefined;

    if (isLoading || myEmployee.isLoading) return <Loader />;
    if (!resolvedEmployee) return <Typography>Profile not found.</Typography>;

    const isOwnProfile = user?.id === resolvedEmployee.user_id;
    const canEdit = Boolean(user && (user.role === 'ADMIN' || user.role === 'HR_MANAGER' || isOwnProfile));
    const canChangeWorkflow = Boolean(user && (user.role === 'ADMIN' || (user.role === 'HR_MANAGER' && !isOwnProfile)));
    const allowedTransitions = canChangeWorkflow ? resolvedEmployee.allowed_transitions ?? [] : [];
    const transitionLabel = transitionTarget ? getWorkflowLabel(transitionTarget) : '';

    const handleTransition = async () => {
        if (!transitionTarget || !resolvedEmployee.id) return;
        try {
            await patchEmployee.mutateAsync({
                id: resolvedEmployee.id,
                payload: { workflow_state: transitionTarget },
            });
            showToast(`Workflow updated to ${getWorkflowLabel(transitionTarget)}`, 'success');
            setTransitionTarget(null);
        } catch (err) {
            showToast(getApiErrorMessage(err, 'Unable to update workflow'), 'error');
        }
    };

    return (
        <Box>
            <Stack spacing={2} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Typography variant="h4">Profile</Typography>
                        <Typography color="text.secondary">Employee details and account summary.</Typography>
                    </div>
                </Box>
            </Stack>

            <Paper sx={{ p: 3 }}>
                <Stack spacing={2}>
                    <Typography variant="h6">{user?.username ?? resolvedEmployee.email}</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip
                            label={getWorkflowLabel(resolvedEmployee.workflow_state)}
                            sx={WORKFLOW_CHIP_STYLES[resolvedEmployee.workflow_state]}
                        />
                        {resolvedEmployee.title ? <Chip label={resolvedEmployee.title} /> : null}
                    </Stack>
                    <Box>
                        <Typography fontWeight={700}>Current Workflow State</Typography>
                        <Typography>{getWorkflowLabel(resolvedEmployee.workflow_state)}</Typography>
                    </Box>
                    {canChangeWorkflow ? (
                        <Box>
                            <Typography fontWeight={700} sx={{ mb: 1 }}>Available Next Actions</Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {allowedTransitions.length ? allowedTransitions.map((state) => (
                                    <Button
                                        key={state}
                                        variant="outlined"
                                        onClick={() => setTransitionTarget(state)}
                                    >
                                        {WORKFLOW_ACTION_LABELS[state]}
                                    </Button>
                                )) : <Typography color="text.secondary">No next actions available.</Typography>}
                            </Stack>
                        </Box>
                    ) : null}
                    <Typography>Mobile: {resolvedEmployee.mobile ?? 'N/A'}</Typography>
                    <Typography>Company: {resolvedEmployee.company_name ?? resolvedEmployee.company_id}</Typography>
                    <Typography>Department: {resolvedEmployee.department_name ?? 'N/A'}</Typography>
                    <Typography>Hire date: {resolvedEmployee.hire_date ?? 'N/A'}</Typography>
                    <Typography>Days employed: {resolvedEmployee.days_employed ?? 0}</Typography>
                    <Typography>Email: {resolvedEmployee.email}</Typography>
                    <Typography>Address: {resolvedEmployee.address ?? 'N/A'}</Typography>
                    {canEdit && resolvedEmployee.id ? <Button variant="contained" onClick={() => navigate(`/employees/${resolvedEmployee.id}/edit`)}>Edit</Button> : null}
                </Stack>
            </Paper>
            <ConfirmDialog
                open={Boolean(transitionTarget)}
                title="Update workflow state?"
                description={`Move this employee to ${transitionLabel}?`}
                confirmLabel={transitionLabel}
                cancelLabel="Cancel"
                onConfirm={() => { void handleTransition(); }}
                onClose={() => setTransitionTarget(null)}
            />
        </Box>
    );
}
