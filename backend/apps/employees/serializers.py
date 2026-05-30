"""Employee serializers."""

import re

from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.companies.models import Company
from apps.core.utils import calculate_days_employed
from apps.departments.models import Department

from .models import Employee
from .services import get_allowed_transitions, onboard_employee, update_employee_profile


User = get_user_model()
SELF_EDIT_ALLOWED_FIELDS = {'address', 'mobile'}


class EmployeeSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField(read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    department_name = serializers.CharField(
        source='department.name', read_only=True, allow_null=True)
    username_display = serializers.CharField(
        source='user.username', read_only=True)
    username = serializers.CharField(
        write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(
        write_only=True, required=False, allow_blank=True, trim_whitespace=False)
    first_name = serializers.CharField(
        write_only=True, required=False, allow_blank=True)
    last_name = serializers.CharField(
        write_only=True, required=False, allow_blank=True)
    role = serializers.ChoiceField(
        choices=['ADMIN', 'HR_MANAGER', 'EMPLOYEE'],
        write_only=True,
        required=False,
    )

    user_id = serializers.IntegerField(source='user.id', read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        source='company', queryset=Company.objects.all())
    department_id = serializers.PrimaryKeyRelatedField(
        source='department', queryset=Department.objects.all(), allow_null=True, required=False
    )
    days_employed = serializers.SerializerMethodField(read_only=True)
    allowed_transitions = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Employee
        fields = (
            'id', 'user_id', 'full_name', 'company_name', 'department_name', 'username_display', 'username', 'password', 'first_name', 'last_name', 'role',
            'company_id', 'department_id', 'email', 'mobile', 'address', 'title',
            'hire_date', 'workflow_state', 'allowed_transitions', 'is_active', 'created_at', 'updated_at', 'days_employed',
        )
        read_only_fields = ('id', 'user_id', 'full_name', 'company_name', 'department_name', 'username_display',
                            'allowed_transitions', 'is_active', 'created_at', 'updated_at', 'days_employed')

    def get_full_name(self, obj: Employee):
        full_name = obj.user.get_full_name().strip() if getattr(obj, 'user', None) else ''
        return full_name or None

    def validate(self, attrs):
        if self.instance is None:
            if not attrs.get('email'):
                raise serializers.ValidationError(
                    {'email': 'This field is required.'})

        company = attrs.get('company') or getattr(
            self.instance, 'company', None)
        department = attrs.get('department') or getattr(
            self.instance, 'department', None)
        if department and company and department.company_id != company.id:
            raise serializers.ValidationError(
                {'department_id': 'Department does not belong to the selected company.'})

        if self.instance is not None:
            request = self.context.get('request')
            actor = getattr(request, 'user', None)
            if actor and actor.is_authenticated and getattr(actor, 'role', None) in ('EMPLOYEE', 'HR_MANAGER') and self.instance.user_id == actor.id:
                self._validate_self_edit(attrs)

        return attrs

    def _validate_self_edit(self, attrs):
        blocked_fields = set(attrs) - SELF_EDIT_ALLOWED_FIELDS
        if blocked_fields:
            blocked_list = ', '.join(sorted(blocked_fields))
            raise serializers.ValidationError(
                f'You can only edit your own address and mobile. Blocked fields: {blocked_list}.')

    def validate_email(self, value):
        qs = Employee.objects.filter(email=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                'Employee with this email already exists')
        return value

    def validate_mobile(self, value):
        if value and not re.fullmatch(r'^\+?[0-9]{7,15}$', value):
            raise serializers.ValidationError('Invalid mobile number format')
        return value

    def create(self, validated_data):
        return onboard_employee(**validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        actor = getattr(request, 'user', None)
        return update_employee_profile(employee=instance, actor=actor, **validated_data)

    def get_days_employed(self, obj: Employee):
        return calculate_days_employed(obj.hire_date)

    def get_allowed_transitions(self, obj: Employee):
        return get_allowed_transitions(obj.workflow_state)
