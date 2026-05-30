"""Department serializers."""

from rest_framework import serializers

from apps.companies.models import Company
from .models import Department


class DepartmentSerializer(serializers.ModelSerializer):
    company_id = serializers.PrimaryKeyRelatedField(
        source='company', queryset=Company.objects.all())
    active_employees_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Department
        fields = ('id', 'name', 'company_id', 'created_at',
                  'updated_at', 'active_employees_count')
