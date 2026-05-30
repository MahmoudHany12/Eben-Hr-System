"""Department API views."""

from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import Department
from .selectors import list_departments
from .serializers import DepartmentSerializer
from .services import create_department, delete_department, update_department


class DepartmentViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = DepartmentSerializer
    queryset = Department.objects.select_related('company').all()
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', None)
        company_id = self.request.query_params.get('company')

        if role == 'ADMIN':
            return list_departments(company_id=company_id)
        elif role == 'HR_MANAGER':
            assigned = getattr(user, 'assigned_company', None)
            if not assigned:
                return self.queryset.none()
            qs = list_departments(company_id=company_id)
            return qs.filter(company=assigned)
        else:
            return self.queryset.none()

    def perform_create(self, serializer):
        if getattr(self.request.user, 'role', None) == 'HR_MANAGER':
            assigned = getattr(self.request.user, 'assigned_company', None)
            if not assigned or serializer.validated_data['company'].pk != assigned.pk:
                raise PermissionDenied(
                    'HR managers can only create departments in their assigned company')
        elif getattr(self.request.user, 'role', None) != 'ADMIN':
            raise PermissionDenied('Not allowed to create departments')

        instance = create_department(
            name=serializer.validated_data['name'],
            company=serializer.validated_data['company'],
        )
        serializer.instance = instance

    def perform_update(self, serializer):
        role = getattr(self.request.user, 'role', None)
        if role not in ('ADMIN', 'HR_MANAGER'):
            raise PermissionDenied('Not allowed to update departments')
        if role == 'HR_MANAGER':
            assigned = getattr(self.request.user, 'assigned_company', None)
            if not assigned or self.get_object().company_id != assigned.pk:
                raise PermissionDenied(
                    'Cannot update departments outside your company')

        instance = update_department(
            department=self.get_object(),
            **serializer.validated_data,
        )
        serializer.instance = instance

    def perform_destroy(self, instance):
        role = getattr(self.request.user, 'role', None)
        if role not in ('ADMIN', 'HR_MANAGER'):
            raise PermissionDenied('Not allowed to delete departments')
        if role == 'HR_MANAGER':
            assigned = getattr(self.request.user, 'assigned_company', None)
            if not assigned or instance.company_id != assigned.pk:
                raise PermissionDenied(
                    'Cannot delete departments outside your company')

        delete_department(department=instance)
        # Optionally, you could return a custom response here if needed
