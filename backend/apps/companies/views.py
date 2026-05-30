"""Company API views."""

from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Company
from .serializers import CompanySerializer
from .selectors import list_companies
from .services import create_company, update_company, delete_company
from apps.accounts.permissions import IsAdmin


class CompanyViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = CompanySerializer
    queryset = Company.objects.all()
    permission_classes = (IsAuthenticated,)

    def get_permissions(self):
        # Admins can do everything. HR managers cannot delete companies.
        if self.action == 'destroy':
            return [IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = list_companies()
        user = self.request.user
        role = getattr(user, 'role', None)
        if role == 'ADMIN':
            return qs
        if role == 'HR_MANAGER':
            assigned = getattr(user, 'assigned_company', None)
            return qs.filter(pk=assigned.pk) if assigned else qs.none()
        return qs.none()

    def perform_create(self, serializer):
        if getattr(self.request.user, 'role', None) != 'ADMIN':
            raise PermissionDenied('Only admins can create companies')
        instance = create_company(
            name=serializer.validated_data['name'], address=serializer.validated_data.get('address', ''))
        serializer.instance = instance

    def perform_update(self, serializer):
        if getattr(self.request.user, 'role', None) not in ('ADMIN',):
            raise PermissionDenied('Only admins can update companies')
        instance = update_company(
            company=self.get_object(), **serializer.validated_data)
        serializer.instance = instance

    def perform_destroy(self, instance):
        delete_company(company=instance)
