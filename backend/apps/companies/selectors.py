"""Query selectors for companies."""

from django.db.models import Count
from .models import Company


def list_companies():
    """Return companies annotated with departments_count and employees_count."""
    qs = Company.objects.all().annotate(
        departments_count=Count('departments', distinct=True),
        employees_count=Count('employees', distinct=True),
    ).order_by('name')
    return qs
