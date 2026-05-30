"""Services for company mutations."""

from django.db import transaction
from .models import Company


@transaction.atomic
def create_company(*, name, address='') -> Company:
    company = Company(name=name, address=address)
    company.full_clean()
    company.save()
    return company


@transaction.atomic
def update_company(*, company: Company, **fields) -> Company:
    for k, v in fields.items():
        setattr(company, k, v)
    company.full_clean()
    company.save()
    return company


@transaction.atomic
def delete_company(*, company: Company):
    company.delete()
