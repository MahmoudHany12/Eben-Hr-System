import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { CompanyFormPage } from './pages/CompanyFormPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { DepartmentFormPage } from './pages/DepartmentFormPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { EmployeeFormPage } from './pages/EmployeeFormPage';
import { EmployeeProfilePage } from './pages/EmployeeProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { useAuth } from './context/AuthContext';

function RoleHomeRedirect() {
    const { user } = useAuth();

    if (user?.role === 'EMPLOYEE') {
        return <Navigate to="/profile" replace />;
    }

    return <Navigate to="/dashboard" replace />;
}

function DashboardRoute() {
    const { user } = useAuth();

    if (user?.role === 'EMPLOYEE') {
        return <Navigate to="/profile" replace />;
    }

    return <DashboardPage />;
}

export const router = createBrowserRouter([
    {
        element: <AuthLayout />,
        children: [{ path: '/login', element: <LoginPage /> }],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: '/', element: <RoleHomeRedirect /> },
                    { path: '/dashboard', element: <DashboardRoute /> },
                    { path: '/companies', element: <CompaniesPage /> },
                    { path: '/companies/new', element: <CompanyFormPage /> },
                    { path: '/companies/:id', element: <CompanyFormPage /> },
                    { path: '/departments', element: <DepartmentsPage /> },
                    { path: '/departments/new', element: <DepartmentFormPage /> },
                    { path: '/departments/:id', element: <DepartmentFormPage /> },
                    { path: '/employees', element: <EmployeesPage /> },
                    { path: '/employees/new', element: <EmployeeFormPage /> },
                    { path: '/employees/:id', element: <EmployeeProfilePage /> },
                    { path: '/employees/:id/edit', element: <EmployeeFormPage /> },
                    { path: '/profile', element: <EmployeeProfilePage /> },
                    { path: '/unauthorized', element: <UnauthorizedPage /> },
                    { path: '*', element: <NotFoundPage /> },
                ],
            },
        ],
    },
]);
