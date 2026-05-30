"""Selectors for employees queries."""

from django.db.models import Prefetch
from .models import Employee


def list_employees():
    """Return employees with related user, company and department prefetched."""
    return Employee.objects.select_related('user', 'company', 'department').all()
