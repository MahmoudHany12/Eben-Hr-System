from datetime import date


def calculate_days_employed(hire_date: date) -> int:
    """Return number of days employed from hire_date until today."""
    if hire_date is None:
        return 0
    delta = date.today() - hire_date
    return max(0, delta.days)
