"""Service layer for department data mutations."""

from django.db import transaction

from .models import Department


@transaction.atomic
def create_department(*, name, company):
    department = Department(name=name, company=company)
    department.full_clean()
    department.save()
    return department


@transaction.atomic
def update_department(*, department: Department, **fields):
    for field_name, field_value in fields.items():
        setattr(department, field_name, field_value)

    department.full_clean()
    department.save()
    return department


@transaction.atomic
def delete_department(*, department: Department):
    department.delete()
