from django.contrib import admin
from .models import Employee


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'company', 'department',
                    'email', 'workflow_state', 'created_at')
    search_fields = ('email', 'user__username', 'user__email')
