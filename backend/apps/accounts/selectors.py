"""Selectors for account queries."""

from django.contrib.auth import get_user_model


User = get_user_model()


def get_user_by_id(user_id: int):
    """Return user by id or None if not found."""
    return User.objects.filter(pk=user_id).first()
