import type { ChipProps } from '@mui/material';
import type { EmployeeWorkflowState } from '@/types/employee';

export const WORKFLOW_LABELS: Record<EmployeeWorkflowState, string> = {
    APPLICATION_RECEIVED: 'Application Received',
    INTERVIEW_SCHEDULED: 'Interview Scheduled',
    HIRED: 'Hired',
    NOT_ACCEPTED: 'Not Accepted',
};

export const WORKFLOW_ACTION_LABELS: Record<EmployeeWorkflowState, string> = {
    APPLICATION_RECEIVED: 'Mark Application Received',
    INTERVIEW_SCHEDULED: 'Schedule Interview',
    HIRED: 'Hire',
    NOT_ACCEPTED: 'Mark Not Accepted',
};

export const WORKFLOW_CHIP_STYLES: Record<EmployeeWorkflowState, ChipProps['sx']> = {
    APPLICATION_RECEIVED: {
        bgcolor: 'rgba(50,65,88,0.08)',
        color: '#324158',
    },
    INTERVIEW_SCHEDULED: {
        bgcolor: 'rgba(0,191,99,0.12)',
        color: '#005424',
    },
    HIRED: {
        bgcolor: '#005424',
        color: '#ffffff',
    },
    NOT_ACCEPTED: {
        bgcolor: 'rgba(220,38,38,0.10)',
        color: '#991b1b',
    },
};

export function getWorkflowLabel(state?: EmployeeWorkflowState | null) {
    return state ? WORKFLOW_LABELS[state] : 'Application Received';
}
