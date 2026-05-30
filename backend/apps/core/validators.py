"""Reusable validation helpers."""

import re
from django.core.exceptions import ValidationError


def validate_mobile(value: str):
    if value and not re.fullmatch(r'^\+?[0-9]{7,15}$', value):
        raise ValidationError('Invalid mobile number format')
