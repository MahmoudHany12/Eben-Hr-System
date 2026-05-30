export type EmployeeWorkflowState =
    | 'APPLICATION_RECEIVED'
    | 'INTERVIEW_SCHEDULED'
    | 'HIRED'
    | 'NOT_ACCEPTED';

export interface Employee {
    id: number;
    user_id?: number;
    full_name?: string;
    username_display?: string;
    company_name?: string;
    department_name?: string | null;
    company_id: number;
    department_id?: number | null;
    email: string;
    mobile?: string;
    address?: string;
    title?: string;
    hire_date?: string | null;
    workflow_state: EmployeeWorkflowState;
    allowed_transitions?: EmployeeWorkflowState[];
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    days_employed?: number;
}
