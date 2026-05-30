from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.companies.models import Company
from apps.departments.models import Department
from apps.employees.models import Employee


User = get_user_model()


class CompanyPermissionTests(APITestCase):
    def setUp(self):
        self.company = Company.objects.create(name='Comp', address='Address')
        self.department = Department.objects.create(
            name='Dept', company=self.company)
        self.user = User.objects.create_user(
            username='admin_company', password='Pass1234!', role='ADMIN')
        self.employee_user = User.objects.create_user(
            username='emp_company', password='Pass1234!', role='EMPLOYEE', email='emp_company@example.com')
        Employee.objects.create(
            user=self.employee_user,
            company=self.company,
            department=self.department,
            email='emp_company@example.com',
            mobile='+201234567890',
        )
        self.hr = User.objects.create_user(
            username='hr_company', password='Pass1234!', role='HR_MANAGER', assigned_company=self.company
        )

    def test_hr_cannot_delete_company(self):
        token_resp = self.client.post(
            '/api/auth/login/', {'username': 'hr_company', 'password': 'Pass1234!'}, format='json')
        self.assertEqual(token_resp.status_code, status.HTTP_200_OK)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {token_resp.data['access']}")

        resp = self.client.delete(f'/api/companies/{self.company.id}/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_company_list_includes_counts_for_admin(self):
        token_resp = self.client.post(
            '/api/auth/login/', {'username': 'admin_company', 'password': 'Pass1234!'}, format='json')
        self.assertEqual(token_resp.status_code, status.HTTP_200_OK)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {token_resp.data['access']}")

        resp = self.client.get('/api/companies/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['count'], 1)
        self.assertEqual(resp.data['results'][0]['departments_count'], 1)
        self.assertEqual(resp.data['results'][0]['employees_count'], 1)

    def test_hr_only_sees_assigned_company(self):
        token_resp = self.client.post(
            '/api/auth/login/', {'username': 'hr_company', 'password': 'Pass1234!'}, format='json')
        self.assertEqual(token_resp.status_code, status.HTTP_200_OK)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {token_resp.data['access']}")

        resp = self.client.get('/api/companies/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['count'], 1)

    def test_company_delete_cascades_employees(self):
        employee_id = Employee.objects.get(user=self.employee_user).id
        self.assertTrue(Employee.objects.filter(id=employee_id).exists())

        self.user.role = 'ADMIN'
        self.user.save(update_fields=['role'])
        token_resp = self.client.post(
            '/api/auth/login/', {'username': 'admin_company', 'password': 'Pass1234!'}, format='json')
        self.assertEqual(token_resp.status_code, status.HTTP_200_OK)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {token_resp.data['access']}")

        resp = self.client.delete(f'/api/companies/{self.company.id}/')
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Employee.objects.filter(id=employee_id).exists())
