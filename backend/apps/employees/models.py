from django.db import models
from apps.core.validators import validate_mobile


class Employee(models.Model):
    class WorkflowStates(models.TextChoices):
        APPLICATION_RECEIVED = 'APPLICATION_RECEIVED', 'Application Received'
        INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED', 'Interview Scheduled'
        HIRED = 'HIRED', 'Hired'
        NOT_ACCEPTED = 'NOT_ACCEPTED', 'Not Accepted'

    user = models.OneToOneField(
        'accounts.User', on_delete=models.CASCADE, related_name='employee_profile')
    company = models.ForeignKey(
        'companies.Company', on_delete=models.CASCADE, related_name='employees')
    department = models.ForeignKey(
        'departments.Department', on_delete=models.SET_NULL, related_name='employees', null=True, blank=True)
    email = models.EmailField(max_length=254, unique=True, db_index=True)
    mobile = models.CharField(
        max_length=32, blank=True, db_index=True, validators=[validate_mobile])
    address = models.TextField(blank=True)
    title = models.CharField(max_length=128, blank=True)
    hire_date = models.DateField(null=True, blank=True)
    workflow_state = models.CharField(
        max_length=32,
        choices=WorkflowStates.choices,
        default=WorkflowStates.APPLICATION_RECEIVED,
        db_index=True,
    )
    is_active = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['company']),
            models.Index(fields=['department']),
            models.Index(fields=['email']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - {self.title or 'Employee'}"

    def save(self, *args, **kwargs):
        if getattr(self, 'user', None) and getattr(self.user, 'role', None) in ('ADMIN', 'HR_MANAGER'):
            self.workflow_state = self.WorkflowStates.HIRED
        self.is_active = self.workflow_state == self.WorkflowStates.HIRED
        if kwargs.get('update_fields') is not None:
            kwargs['update_fields'] = set(kwargs['update_fields']) | {
                'workflow_state', 'is_active'}
        super().save(*args, **kwargs)
