"""Employees API views."""

from django.shortcuts import get_object_or_404
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.core.exceptions import BusinessRuleException

from .models import Employee
from .permissions import EmployeeAccess
from .selectors import list_employees
from .serializers import EmployeeSerializer
from .services import onboard_employee


class EmployeeViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = EmployeeSerializer
    queryset = Employee.objects.select_related(
        'user', 'company', 'department').all()
    permission_classes = (IsAuthenticated, EmployeeAccess)

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        employee = get_object_or_404(Employee.objects.select_related(
            'user', 'company', 'department'), user=request.user)
        serializer = self.get_serializer(employee)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def get_queryset(self):
        qs = list_employees()
        user = self.request.user
        role = getattr(user, 'role', None)
        if role == 'ADMIN':
            return qs
        if role == 'HR_MANAGER':
            assigned = getattr(user, 'assigned_company', None)
            return qs.filter(company=assigned) if assigned else qs.none()
        if role == 'EMPLOYEE':
            return qs.filter(user=user)
        return qs.none()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # enforce HR manager company restriction
        user = request.user
        user_role = getattr(user, 'role', None)
        if user_role not in ('ADMIN', 'HR_MANAGER'):
            raise BusinessRuleException(
                'Only admins and HR managers can create employees.')

        if getattr(user, 'role', None) == 'HR_MANAGER':
            assigned = getattr(user, 'assigned_company', None)
            if not assigned or str(assigned.pk) != str(serializer.validated_data['company'].pk):
                raise BusinessRuleException(
                    'HR managers can only create employees for their assigned company.')

        # Validate role assignment permissions
        requested_role = serializer.validated_data.get('role', 'EMPLOYEE')
        if user_role == 'ADMIN':
            # Admins can assign any role
            pass
        elif user_role == 'HR_MANAGER':
            # HR managers can only assign EMPLOYEE role
            if requested_role != 'EMPLOYEE':
                raise BusinessRuleException(
                    'HR managers can only assign the EMPLOYEE role.')
        else:
            # Employees cannot assign any role
            raise BusinessRuleException('Employees cannot assign roles.')

        # create user + employee via service
        employee = onboard_employee(
            username=serializer.validated_data.get(
                'username') or serializer.validated_data['email'],
            password=serializer.validated_data.get('password') or 'changeme',
            first_name=serializer.validated_data.get('first_name'),
            last_name=serializer.validated_data.get('last_name'),
            email=serializer.validated_data['email'],
            company=serializer.validated_data['company'],
            department=serializer.validated_data.get('department'),
            mobile=serializer.validated_data.get('mobile'),
            address=serializer.validated_data.get('address'),
            title=serializer.validated_data.get('title'),
            hire_date=serializer.validated_data.get('hire_date'),
            workflow_state=serializer.validated_data.get('workflow_state'),
            role=requested_role,
        )

        out = self.get_serializer(employee)
        return Response(out.data, status=status.HTTP_201_CREATED)

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()
