"""Selectors for departments queries."""

from django.db.models import Count, Q
from .models import Department


def list_departments(company_id: int | None = None):
    """Return departments, optionally filtered by company, annotated with hired employees count."""
    qs = Department.objects.all().select_related('company')
    if company_id:
        qs = qs.filter(company_id=company_id)

    qs = qs.annotate(active_employees_count=Count(
        'employees', filter=Q(employees__workflow_state='HIRED'))).order_by('name')
    return qs
