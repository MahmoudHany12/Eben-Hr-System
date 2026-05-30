from rest_framework.permissions import BasePermission


class EmployeeAccess(BasePermission):
    """Permission checks for employee resources.

    - Admins have full access
    - HR managers can manage employees in their assigned company
    - Employees can view only their own profile
    """

    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        return bool(user and user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user
        role = getattr(user, 'role', None)
        if role == 'ADMIN':
            return True
        if role == 'HR_MANAGER':
            assigned = getattr(user, 'assigned_company', None)
            return assigned is not None and getattr(obj, 'company', None) and obj.company.pk == assigned.pk
        if role == 'EMPLOYEE':
            # obj may be Employee instance or User
            emp_user = getattr(obj, 'user', None) or obj
            if getattr(emp_user, 'pk', None) != user.pk:
                return False
            return request.method in ('GET', 'HEAD', 'OPTIONS', 'PUT', 'PATCH')
        return False
