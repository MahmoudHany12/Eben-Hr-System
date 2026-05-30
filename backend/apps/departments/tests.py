from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.companies.models import Company
from apps.departments.models import Department
from apps.employees.models import Employee


User = get_user_model()


class DepartmentApiTests(APITestCase):
    def setUp(self):
        self.company_a = Company.objects.create(name='Company A', address='A')
        self.company_b = Company.objects.create(name='Company B', address='B')
        self.dept_a = Department.objects.create(
            name='Dept A', company=self.company_a)
        self.dept_b = Department.objects.create(
            name='Dept B', company=self.company_b)
        self.admin = User.objects.create_user(
            username='admin', password='Pass1234!', role='ADMIN')
        self.hr = User.objects.create_user(
            username='hr', password='Pass1234!', role='HR_MANAGER', assigned_company=self.company_a)
        self.employee_user = User.objects.create_user(
            username='emp', password='Pass1234!', role='EMPLOYEE')
        Employee.objects.create(
            user=self.employee_user,
            company=self.company_a,
            department=self.dept_a,
            email='emp@example.com',
            mobile='+201234567890',
            workflow_state=Employee.WorkflowStates.HIRED,
        )

    def _auth(self, username, password='Pass1234!'):
        resp = self.client.post(
            '/api/auth/login/', {'username': username, 'password': password}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")

    def test_admin_can_list_departments_with_filter_and_counts(self):
        self._auth('admin')
        resp = self.client.get(
            '/api/departments/?company=%s' % self.company_a.id)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['count'], 1)
        self.assertEqual(resp.data['results'][0]['active_employees_count'], 1)

    def test_hr_can_only_view_assigned_company_departments(self):
        self._auth('hr')
        resp = self.client.get('/api/departments/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['count'], 1)
        self.assertEqual(resp.data['results'][0]
                         ['company_id'], self.company_a.id)

    def test_hr_cannot_create_department_for_other_company(self):
        self._auth('hr')
        resp = self.client.post(
            '/api/departments/', {'name': 'Bad Dept', 'company_id': self.company_b.id}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_employee_cannot_list_departments(self):
        self._auth('emp')
        resp = self.client.get('/api/departments/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['count'], 0)

    def test_department_delete_sets_employee_department_null(self):
        employee = Employee.objects.get(user=self.employee_user)
        self.assertEqual(employee.department_id, self.dept_a.id)

        self._auth('admin')
        resp = self.client.delete(f'/api/departments/{self.dept_a.id}/')
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)

        employee.refresh_from_db()
        self.assertIsNone(employee.department)
