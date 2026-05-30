from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    class Roles(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        HR_MANAGER = 'HR_MANAGER', 'HR Manager'
        EMPLOYEE = 'EMPLOYEE', 'Employee'

    role = models.CharField(
        max_length=32,
        choices=Roles.choices,
        default=Roles.EMPLOYEE,
        db_index=True,
    )
    # HR managers can be assigned to a company to limit their scope
    assigned_company = models.ForeignKey(
        'companies.Company', on_delete=models.SET_NULL, null=True, blank=True, related_name='hr_users'
    )

    def __str__(self):
        return self.username or self.email or str(self.pk)
