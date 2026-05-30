import type { UserRole } from '@/types/auth.types';

export const ROLE_LABELS: Record<UserRole, string> = {
    ADMIN: 'System Admin',
    HR_MANAGER: 'HR Manager',
    EMPLOYEE: 'Employee',
};

export const roleCanAccess = (userRole: UserRole | null, allowedRoles: UserRole[]) => {
    if (!userRole) {
        return false;
    }

    return allowedRoles.includes(userRole);
};

export const canAccess = roleCanAccess;
