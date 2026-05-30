"""Company permissions."""

from rest_framework.permissions import BasePermission


class CompanyAccess(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
