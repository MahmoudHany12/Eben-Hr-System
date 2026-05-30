"""Company serializers."""

from rest_framework import serializers

from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    departments_count = serializers.IntegerField(read_only=True)
    employees_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Company
        fields = ('id', 'name', 'address', 'created_at',
                  'updated_at', 'departments_count', 'employees_count')
