from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        return bool(user and user.is_authenticated and getattr(user, 'role', None) == 'ADMIN')


class IsHRManager(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        return bool(user and user.is_authenticated and getattr(user, 'role', None) == 'HR_MANAGER')

    def has_object_permission(self, request, view, obj):
        # HR Managers can operate on objects belonging to their assigned company
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if getattr(user, 'role', None) != 'HR_MANAGER':
            return False
        assigned = getattr(user, 'assigned_company', None)
        if assigned is None:
            return False
        # object is expected to have a `company` attribute
        company = getattr(obj, 'company', None)
        return company and company.pk == assigned.pk


class IsEmployee(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        return bool(user and user.is_authenticated and getattr(user, 'role', None) == 'EMPLOYEE')

    def has_object_permission(self, request, view, obj):
        # Employees can only access their own employee profile
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if getattr(user, 'role', None) != 'EMPLOYEE':
            return False
        # obj may be Employee instance or User
        emp_user = getattr(obj, 'user', None) or obj
        return getattr(emp_user, 'pk', None) == user.pk
