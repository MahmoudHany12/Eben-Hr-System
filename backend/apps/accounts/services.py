"""Services for account mutations."""

from django.contrib.auth import get_user_model
from django.db import transaction


User = get_user_model()


@transaction.atomic
def create_user(*, username: str, password: str, email: str = '', first_name: str = '', last_name: str = '', role: str = 'EMPLOYEE', assigned_company=None):
    """Create a user with role and optional assigned company."""
    user = User.objects.create_user(
        username=username,
        password=password,
        email=email,
        first_name=first_name,
        last_name=last_name,
    )
    user.role = role
    user.assigned_company = assigned_company
    user.save(update_fields=['role', 'assigned_company'])
    return user
