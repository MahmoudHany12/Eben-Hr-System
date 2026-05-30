import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { UserRole } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import { canAccess } from '@/utils/permissions';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (allowedRoles && !canAccess(user.role, allowedRoles)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}
