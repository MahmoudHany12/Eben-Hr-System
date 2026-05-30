from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.companies.models import Company
from apps.departments.models import Department
from apps.core.utils import calculate_days_employed
from apps.employees.models import Employee


User = get_user_model()


class EmployeeFlowTests(APITestCase):
    def setUp(self):
        self.company_a = Company.objects.create(name='Company A', address='A')
        self.company_b = Company.objects.create(name='Company B', address='B')
        self.dept_a = Department.objects.create(
            name='Dept A', company=self.company_a)
        self.dept_b = Department.objects.create(
            name='Dept B', company=self.company_b)

        self.admin = User.objects.create_user(
            username='admin', password='Pass1234!', role='ADMIN', email='admin@example.com'
        )
        self.hr = User.objects.create_user(
            username='hr', password='Pass1234!', role='HR_MANAGER', email='hr@example.com', assigned_company=self.company_a
        )
        self.employee_user = User.objects.create_user(
            username='emp', password='Pass1234!', role='EMPLOYEE', email='emp@example.com'
        )

    def _auth(self, user, password='Pass1234!'):
        token_resp = self.client.post(
            '/api/auth/login/', {'username': user.username, 'password': password}, format='json')
        self.assertEqual(token_resp.status_code, status.HTTP_200_OK)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {token_resp.data['access']}")

    def test_employee_creation_creates_user_and_profile(self):
        self._auth(self.admin)
        payload = {
            'username': 'new_emp',
            'password': 'Pass1234!',
            'first_name': 'New',
            'last_name': 'Employee',
            'company_id': self.company_a.id,
            'department_id': self.dept_a.id,
            'email': 'new_emp@example.com',
            'mobile': '+201234567890',
            'title': 'Engineer',
        }
        resp = self.client.post('/api/employees/', payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Employee.objects.filter(
            email='new_emp@example.com').exists())
        created_user = User.objects.get(username='new_emp')
        self.assertEqual(created_user.role, 'EMPLOYEE')
        created_employee = Employee.objects.get(email='new_emp@example.com')
        self.assertEqual(calculate_days_employed(
            created_employee.hire_date), 0)
        self.assertEqual(created_employee.workflow_state,
                         Employee.WorkflowStates.APPLICATION_RECEIVED)
        self.assertFalse(created_employee.is_active)

    def test_employee_list_includes_days_employed(self):
        employee_record = Employee.objects.create(
            user=self.employee_user,
            company=self.company_a,
            department=self.dept_a,
            email='emp@example.com',
            mobile='+201111111111',
        )
        self._auth(self.admin)
        resp = self.client.get('/api/employees/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('days_employed', resp.data['results'][0])
        self.assertIn('workflow_state', resp.data['results'][0])
        self.assertIn('allowed_transitions', resp.data['results'][0])

    def test_me_endpoint_returns_logged_in_employee(self):
        Employee.objects.create(
            user=self.employee_user,
            company=self.company_a,
            department=self.dept_a,
            email='emp@example.com',
            mobile='+201111111111',
        )
        self._auth(self.employee_user)
        resp = self.client.get('/api/employees/me/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['email'], 'emp@example.com')
        self.assertEqual(resp.data['company_name'], 'Company A')
        self.assertEqual(resp.data['department_name'], 'Dept A')

    def test_employee_cannot_change_own_role_or_company(self):
        employee_record = Employee.objects.create(
            user=self.employee_user,
            company=self.company_a,
            department=self.dept_a,
            email='emp@example.com',
            mobile='+201111111111',
        )
        self._auth(self.employee_user)
        resp = self.client.patch(
            f'/api/employees/{employee_record.id}/',
            {'company_id': self.company_b.id, 'role': 'ADMIN'},
            format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_hr_can_create_employee_only_with_employee_role(self):
        self._auth(self.hr)
        payload = {
            'username': 'hr_bad_role',
            'password': 'Pass1234!',
            'company_id': self.company_a.id,
            'department_id': self.dept_a.id,
            'email': 'hr_bad_role@example.com',
            'role': 'ADMIN',
        }
        resp = self.client.post('/api/employees/', payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            'HR managers can only assign the EMPLOYEE role.', str(resp.data))

    def test_department_company_validation(self):
        self._auth(self.admin)
        payload = {
            'username': 'bad_emp',
            'password': 'Pass1234!',
            'company_id': self.company_a.id,
            'department_id': self.dept_b.id,
            'email': 'bad_emp@example.com',
        }
        resp = self.client.post('/api/employees/', payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_email_is_rejected(self):
        Employee.objects.create(
            user=self.employee_user,
            company=self.company_a,
            department=self.dept_a,
            email='dup@example.com',
            mobile='+201111111111',
        )
        self._auth(self.admin)
        payload = {
            'username': 'dup_emp',
            'password': 'Pass1234!',
            'company_id': self.company_a.id,
            'department_id': self.dept_a.id,
            'email': 'dup@example.com',
        }
        resp = self.client.post('/api/employees/', payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_mobile_is_rejected(self):
        self._auth(self.admin)
        payload = {
            'username': 'bad_mobile',
            'password': 'Pass1234!',
            'company_id': self.company_a.id,
            'department_id': self.dept_a.id,
            'email': 'bad_mobile@example.com',
            'mobile': 'abc',
        }
        resp = self.client.post('/api/employees/', payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_hr_can_edit_employee_in_assigned_company(self):
        employee_record = Employee.objects.create(
            user=self.employee_user,
            company=self.company_a,
            department=self.dept_a,
            email='emp@example.com',
            mobile='+201111111111',
        )
        self._auth(self.hr)
        resp = self.client.patch(
            f'/api/employees/{employee_record.id}/',
            {'title': 'Updated Title'},
            format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_hr_cannot_edit_employee_outside_assigned_company(self):
        other_user = User.objects.create_user(
            username='other_hr', password='Pass1234!', role='EMPLOYEE', email='other@example.com')
        other_record = Employee.objects.create(
            user=other_user,
            company=self.company_b,
            department=self.dept_b,
            email='other@example.com',
            mobile='+201222222222',
        )
        self._auth(self.hr)
        resp = self.client.patch(
            f'/api/employees/{other_record.id}/',
            {'title': 'Blocked'},
            format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_employee_can_update_allowed_personal_fields(self):
        employee_record = Employee.objects.create(
            user=self.employee_user,
            company=self.company_a,
            department=self.dept_a,
            email='emp@example.com',
            mobile='+201111111111',
        )
        self._auth(self.employee_user)
        resp = self.client.patch(
            f'/api/employees/{employee_record.id}/',
            {'mobile': '+201999999999', 'address': 'New address'},
            format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        employee_record.refresh_from_db()
        self.assertEqual(employee_record.mobile, '+201999999999')

    def test_employee_cannot_edit_confidential_fields_on_self(self):
        employee_record = Employee.objects.create(
            user=self.employee_user,
            company=self.company_a,
            department=self.dept_a,
            email='emp@example.com',
            mobile='+201111111111',
            title='Analyst',
        )
        self._auth(self.employee_user)
        resp = self.client.patch(
            f'/api/employees/{employee_record.id}/',
            {'title': 'Updated', 'hire_date': '2026-01-01', 'is_active': False},
            format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_hr_cannot_reassign_employee_to_other_company_or_department(self):
        employee_record = Employee.objects.create(
            user=self.employee_user,
            company=self.company_a,
            department=self.dept_a,
            email='emp@example.com',
            mobile='+201111111111',
        )
        self._auth(self.hr)
        resp = self.client.patch(
            f'/api/employees/{employee_record.id}/',
            {'company_id': self.company_b.id, 'department_id': self.dept_b.id},
            format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_hr_can_only_create_employee_in_assigned_company(self):
        self._auth(self.hr)
        payload = {
            'username': 'x_emp',
            'password': 'Pass1234!',
            'company_id': self.company_b.id,
            'department_id': self.dept_b.id,
            'email': 'x_emp@example.com',
        }
        resp = self.client.post('/api/employees/', payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            'HR managers can only create employees for their assigned company.', str(resp.data))

    def test_hr_can_create_employee_in_assigned_company(self):
        self._auth(self.hr)
        payload = {
            'username': 'hr_created',
            'password': 'Pass1234!',
            'company_id': self.company_a.id,
            'department_id': self.dept_a.id,
            'email': 'hr_created@example.com',
            'mobile': '+201333333333',
            'title': 'Coordinator',
        }
        resp = self.client.post('/api/employees/', payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Employee.objects.filter(
            email='hr_created@example.com').exists())

    def test_employee_can_only_see_own_profile(self):
        employee_record = Employee.objects.create(
            user=self.employee_user,
            company=self.company_a,
            department=self.dept_a,
            email='emp@example.com',
            mobile='+201111111111',
        )
        other_user = User.objects.create_user(
            username='other', password='Pass1234!', role='EMPLOYEE', email='other@example.com')
        other_record = Employee.objects.create(
            user=other_user,
            company=self.company_a,
            department=self.dept_a,
            email='other_emp@example.com',
        )

        self._auth(self.employee_user)
        own_resp = self.client.get(f'/api/employees/{employee_record.id}/')
        other_resp = self.client.get(f'/api/employees/{other_record.id}/')

        self.assertEqual(own_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(other_resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_application_received_can_transition_to_interview_scheduled(self):
        employee_record = Employee.objects.create(
            user=self.employee_user,
            company=self.company_a,
            department=self.dept_a,
            email='workflow_interview@example.com',
            workflow_state=Employee.WorkflowStates.APPLICATION_RECEIVED,
        )
        self._auth(self.admin)

        resp = self.client.patch(
            f'/api/employees/{employee_record.id}/',
            {'workflow_state': Employee.WorkflowStates.INTERVIEW_SCHEDULED},
            format='json',
        )

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['workflow_state'],
                         Employee.WorkflowStates.INTERVIEW_SCHEDULED)
        self.assertEqual(resp.data['allowed_transitions'], [
                         Employee.WorkflowStates.HIRED, Employee.WorkflowStates.NOT_ACCEPTED])

    def test_application_received_can_transition_to_not_accepted(self):
        employee_record = Employee.objects.create(
            user=self.employee_user,
            company=self.company_a,
            department=self.dept_a,
            email='workflow_rejected@example.com',
            workflow_state=Employee.WorkflowStates.APPLICATION_RECEIVED,
        )
        self._auth(self.admin)

        resp = self.client.patch(
            f'/api/employees/{employee_record.id}/',
            {'workflow_state': Employee.WorkflowStates.NOT_ACCEPTED},
            format='json',
        )

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['workflow_state'],
                         Employee.WorkflowStates.NOT_ACCEPTED)
        employee_record.refresh_from_db()
        self.assertFalse(employee_record.is_active)

    def test_interview_scheduled_can_transition_to_hired(self):
        employee_record = Employee.objects.create(
            user=self.employee_user,
            company=self.company_a,
            department=self.dept_a,
            email='workflow_hired@example.com',
            workflow_state=Employee.WorkflowStates.INTERVIEW_SCHEDULED,
        )
        self._auth(self.admin)

        resp = self.client.patch(
            f'/api/employees/{employee_record.id}/',
            {'workflow_state': Employee.WorkflowStates.HIRED},
            format='json',
        )

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['workflow_state'],
                         Employee.WorkflowStates.HIRED)
        employee_record.refresh_from_db()
        self.assertTrue(employee_record.is_active)

    def test_interview_scheduled_can_transition_to_not_accepted(self):
        employee_record = Employee.objects.create(
            user=self.employee_user,
            company=self.company_a,
            department=self.dept_a,
            email='workflow_interview_rejected@example.com',
            workflow_state=Employee.WorkflowStates.INTERVIEW_SCHEDULED,
        )
        self._auth(self.admin)

        resp = self.client.patch(
            f'/api/employees/{employee_record.id}/',
            {'workflow_state': Employee.WorkflowStates.NOT_ACCEPTED},
            format='json',
        )

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['workflow_state'],
                         Employee.WorkflowStates.NOT_ACCEPTED)

    def test_invalid_workflow_transitions_are_rejected(self):
        scenarios = [
            (Employee.WorkflowStates.HIRED, Employee.WorkflowStates.APPLICATION_RECEIVED),
            (Employee.WorkflowStates.HIRED, Employee.WorkflowStates.INTERVIEW_SCHEDULED),
            (Employee.WorkflowStates.HIRED, Employee.WorkflowStates.NOT_ACCEPTED),
            (Employee.WorkflowStates.NOT_ACCEPTED, Employee.WorkflowStates.APPLICATION_RECEIVED),
            (Employee.WorkflowStates.NOT_ACCEPTED, Employee.WorkflowStates.INTERVIEW_SCHEDULED),
            (Employee.WorkflowStates.NOT_ACCEPTED, Employee.WorkflowStates.HIRED),
            (Employee.WorkflowStates.APPLICATION_RECEIVED, Employee.WorkflowStates.HIRED),
            (Employee.WorkflowStates.INTERVIEW_SCHEDULED,
             Employee.WorkflowStates.APPLICATION_RECEIVED),
        ]

        for index, (current_state, target_state) in enumerate(scenarios):
            user = User.objects.create_user(
                username=f'workflow_user_{index}',
                password='Pass1234!',
                role='EMPLOYEE',
                email=f'workflow_user_{index}@example.com',
            )
            employee_record = Employee.objects.create(
                user=user,
                company=self.company_a,
                department=self.dept_a,
                email=f'workflow_employee_{index}@example.com',
                workflow_state=current_state,
            )
            self._auth(self.admin)

            resp = self.client.patch(
                f'/api/employees/{employee_record.id}/',
                {'workflow_state': target_state},
                format='json',
            )

            self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
            employee_record.refresh_from_db()
            self.assertEqual(employee_record.workflow_state, current_state)
