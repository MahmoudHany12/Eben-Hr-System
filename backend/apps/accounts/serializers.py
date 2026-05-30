"""Account serializers."""

from rest_framework import serializers

from .models import User
from apps.companies.models import Company


class UserSerializer(serializers.ModelSerializer):
    assigned_company_id = serializers.PrimaryKeyRelatedField(
        source='assigned_company', queryset=Company.objects.none(), required=False, allow_null=True
    )

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name',
                  'last_name', 'role', 'assigned_company_id')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # set queryset at runtime to the actual Company queryset
        self.fields['assigned_company_id'].queryset = Company.objects.all()
