from datetime import date, timedelta

from django.test import TestCase

from apps.core.utils import calculate_days_employed


class UtilsTests(TestCase):
    def test_calculate_days_employed(self):
        hire_date = date.today() - timedelta(days=10)
        self.assertEqual(calculate_days_employed(hire_date), 10)
