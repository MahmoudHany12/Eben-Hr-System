"""Seed local development data for reviewers and testers."""

from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from apps.companies.models import Company
from apps.departments.models import Department
from apps.employees.models import Employee
from apps.employees.services import onboard_employee


User = get_user_model()

DEMO_PASSWORD = 'AyHaga_123'

DEMO_COMPANIES = [
    {'name': 'Nile Delta Foods', 'address': '18 El Nasr Road, Nasr City, Cairo'},
    {'name': 'Cairo Digital Solutions', 'address': 'Smart Village, Building B221, Giza'},
    {'name': 'Alexandria Logistics Group', 'address': 'Corniche Road, Sidi Gaber, Alexandria'},
    {'name': 'Red Sea Hospitality', 'address': 'Sheraton Road, Hurghada, Red Sea'},
]

DEMO_DEPARTMENTS = ['HR', 'IT', 'Finance', 'Marketing', 'Operations']

DEMO_EMPLOYEES = [
    {
        'username': 'admin',
        'email': 'admin@example.com',
        'first_name': 'أحمد',
        'last_name': 'منصور',
        'role': User.Roles.ADMIN,
        'company': 'Nile Delta Foods',
        'department': 'Operations',
        'mobile': '+201001112233',
        'address': '15 شارع الثورة، مصر الجديدة، القاهرة',
        'title': 'General Manager',
        'workflow_state': Employee.WorkflowStates.HIRED,
        'hire_date': timezone.localdate() - timedelta(days=980),
    },
    {
        'username': 'hrmanager',
        'email': 'hr@example.com',
        'first_name': 'منى',
        'last_name': 'حسن',
        'role': User.Roles.HR_MANAGER,
        'company': 'Nile Delta Foods',
        'department': 'HR',
        'mobile': '+201002223344',
        'address': '42 شارع جامعة الدول العربية، المهندسين، الجيزة',
        'title': 'HR Manager',
        'workflow_state': Employee.WorkflowStates.HIRED,
        'hire_date': timezone.localdate() - timedelta(days=640),
    },
    {
        'username': 'employee',
        'email': 'employee@example.com',
        'first_name': 'سارة',
        'last_name': 'إبراهيم',
        'role': User.Roles.EMPLOYEE,
        'company': 'Nile Delta Foods',
        'department': 'Finance',
        'mobile': '+201003334455',
        'address': '7 شارع النيل، الدقي، الجيزة',
        'title': 'Accountant',
        'workflow_state': Employee.WorkflowStates.HIRED,
        'hire_date': timezone.localdate() - timedelta(days=310),
    },
    {
        'username': 'mahmoud.salem',
        'email': 'mahmoud.salem@example.com',
        'first_name': 'محمود',
        'last_name': 'سالم',
        'role': User.Roles.EMPLOYEE,
        'company': 'Cairo Digital Solutions',
        'department': 'IT',
        'mobile': '+201010101010',
        'address': '9 شارع التسعين، التجمع الخامس، القاهرة الجديدة',
        'title': 'Frontend Developer',
        'workflow_state': Employee.WorkflowStates.HIRED,
        'hire_date': timezone.localdate() - timedelta(days=220),
    },
    {
        'username': 'nour.ali',
        'email': 'nour.ali@example.com',
        'first_name': 'نور',
        'last_name': 'علي',
        'role': User.Roles.EMPLOYEE,
        'company': 'Cairo Digital Solutions',
        'department': 'Marketing',
        'mobile': '+201011112222',
        'address': '23 شارع مكرم عبيد، مدينة نصر، القاهرة',
        'title': 'Marketing Specialist',
        'workflow_state': Employee.WorkflowStates.INTERVIEW_SCHEDULED,
    },
    {
        'username': 'omar.fathy',
        'email': 'omar.fathy@example.com',
        'first_name': 'عمر',
        'last_name': 'فتحي',
        'role': User.Roles.EMPLOYEE,
        'company': 'Alexandria Logistics Group',
        'department': 'Operations',
        'mobile': '+201012223333',
        'address': '11 شارع فؤاد، محطة الرمل، الإسكندرية',
        'title': 'Operations Coordinator',
        'workflow_state': Employee.WorkflowStates.HIRED,
        'hire_date': timezone.localdate() - timedelta(days=145),
    },
    {
        'username': 'youssef.kamal',
        'email': 'youssef.kamal@example.com',
        'first_name': 'يوسف',
        'last_name': 'كمال',
        'role': User.Roles.EMPLOYEE,
        'company': 'Red Sea Hospitality',
        'department': 'Finance',
        'mobile': '+201013334444',
        'address': '5 شارع الشيراتون، الغردقة، البحر الأحمر',
        'title': 'Financial Analyst',
        'workflow_state': Employee.WorkflowStates.APPLICATION_RECEIVED,
    },
    {
        'username': 'reem.mohamed',
        'email': 'reem.mohamed@example.com',
        'first_name': 'ريم',
        'last_name': 'محمد',
        'role': User.Roles.EMPLOYEE,
        'company': 'Nile Delta Foods',
        'department': 'HR',
        'mobile': '+201014445555',
        'address': '31 شارع عباس العقاد، مدينة نصر، القاهرة',
        'title': 'Recruitment Specialist',
        'workflow_state': Employee.WorkflowStates.HIRED,
        'hire_date': timezone.localdate() - timedelta(days=430),
    },
    {
        'username': 'hassan.mostafa',
        'email': 'hassan.mostafa@example.com',
        'first_name': 'حسن',
        'last_name': 'مصطفى',
        'role': User.Roles.EMPLOYEE,
        'company': 'Alexandria Logistics Group',
        'department': 'Operations',
        'mobile': '+201015556666',
        'address': '19 شارع الجيش، سموحة، الإسكندرية',
        'title': 'Warehouse Supervisor',
        'workflow_state': Employee.WorkflowStates.HIRED,
        'hire_date': timezone.localdate() - timedelta(days=760),
    },
    {
        'username': 'layla.adel',
        'email': 'layla.adel@example.com',
        'first_name': 'ليلى',
        'last_name': 'عادل',
        'role': User.Roles.EMPLOYEE,
        'company': 'Cairo Digital Solutions',
        'department': 'IT',
        'mobile': '+201016667777',
        'address': '14 شارع لبنان، المهندسين، الجيزة',
        'title': 'QA Engineer',
        'workflow_state': Employee.WorkflowStates.NOT_ACCEPTED,
    },
    {
        'username': 'karim.hany',
        'email': 'karim.hany@example.com',
        'first_name': 'كريم',
        'last_name': 'هاني',
        'role': User.Roles.EMPLOYEE,
        'company': 'Red Sea Hospitality',
        'department': 'Marketing',
        'mobile': '+201017778888',
        'address': '27 شارع البحر، الغردقة، البحر الأحمر',
        'title': 'Content Coordinator',
        'workflow_state': Employee.WorkflowStates.INTERVIEW_SCHEDULED,
    },
    {
        'username': 'farida.samير',
        'email': 'farida.samir@example.com',
        'first_name': 'فريدة',
        'last_name': 'سمير',
        'role': User.Roles.EMPLOYEE,
        'company': 'Nile Delta Foods',
        'department': 'Operations',
        'mobile': '+201018889999',
        'address': '8 شارع مصطفى النحاس، مدينة نصر، القاهرة',
        'title': 'Supply Chain Planner',
        'workflow_state': Employee.WorkflowStates.HIRED,
        'hire_date': timezone.localdate() - timedelta(days=95),
    },
    {
        'username': 'tarek.ashraf',
        'email': 'tarek.ashraf@example.com',
        'first_name': 'طارق',
        'last_name': 'أشرف',
        'role': User.Roles.EMPLOYEE,
        'company': 'Cairo Digital Solutions',
        'department': 'IT',
        'mobile': '+201019990000',
        'address': '3 شارع سوريا، المهندسين، الجيزة',
        'title': 'Backend Developer',
        'workflow_state': Employee.WorkflowStates.HIRED,
        'hire_date': timezone.localdate() - timedelta(days=365),
    },
    {
        'username': 'dina.gamal',
        'email': 'dina.gamal@example.com',
        'first_name': 'دينا',
        'last_name': 'جمال',
        'role': User.Roles.EMPLOYEE,
        'company': 'Alexandria Logistics Group',
        'department': 'HR',
        'mobile': '+201020001111',
        'address': '6 شارع لاجتيه، الأزاريطة، الإسكندرية',
        'title': 'People Operations Officer',
        'workflow_state': Employee.WorkflowStates.APPLICATION_RECEIVED,
    },
    {
        'username': 'mariam.nabil',
        'email': 'mariam.nabil@example.com',
        'first_name': 'مريم',
        'last_name': 'نبيل',
        'role': User.Roles.EMPLOYEE,
        'company': 'Red Sea Hospitality',
        'department': 'Operations',
        'mobile': '+201021112222',
        'address': '12 شارع الكورنيش، الغردقة، البحر الأحمر',
        'title': 'Guest Relations Supervisor',
        'workflow_state': Employee.WorkflowStates.HIRED,
        'hire_date': timezone.localdate() - timedelta(days=510),
    },
    {
        'username': 'ahmed.raouf',
        'email': 'ahmed.raouf@example.com',
        'first_name': 'أحمد',
        'last_name': 'رؤوف',
        'role': User.Roles.EMPLOYEE,
        'company': 'Nile Delta Foods',
        'department': 'Finance',
        'mobile': '+201022223333',
        'address': '25 شارع رمسيس، وسط البلد، القاهرة',
        'title': 'Payroll Specialist',
        'workflow_state': Employee.WorkflowStates.HIRED,
        'hire_date': timezone.localdate() - timedelta(days=180),
    },
]


class Command(BaseCommand):
    help = 'Seed local development demo companies, departments, users, and employees.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Allow seeding when DEBUG is false. Use only in disposable environments.',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if not settings.DEBUG and not options['force']:
            raise CommandError('seed_data is intended for local development only. Re-run with --force only in disposable environments.')

        demo_usernames = [employee['username'] for employee in DEMO_EMPLOYEES]
        demo_emails = [employee['email'] for employee in DEMO_EMPLOYEES]
        demo_company_names = [company['name'] for company in DEMO_COMPANIES]

        User.objects.filter(username__in=demo_usernames).delete()
        User.objects.filter(email__in=demo_emails).delete()
        Company.objects.filter(name__in=demo_company_names).delete()

        companies = {
            item['name']: Company.objects.create(name=item['name'], address=item['address'])
            for item in DEMO_COMPANIES
        }

        departments = {}
        for company in companies.values():
            for department_name in DEMO_DEPARTMENTS:
                department = Department.objects.create(name=department_name, company=company)
                departments[(company.name, department_name)] = department

        for item in DEMO_EMPLOYEES:
            company = companies[item['company']]
            department = departments[(item['company'], item['department'])]
            onboard_employee(
                username=item['username'],
                password=DEMO_PASSWORD,
                first_name=item['first_name'],
                last_name=item['last_name'],
                email=item['email'],
                company=company,
                department=department,
                mobile=item['mobile'],
                address=item['address'],
                title=item['title'],
                hire_date=item.get('hire_date'),
                workflow_state=item['workflow_state'],
                role=item['role'],
            )

        self.stdout.write(self.style.SUCCESS(
            f'Seeded {len(companies)} companies, {len(departments)} departments, and {len(DEMO_EMPLOYEES)} users/employees.'
        ))
        self.stdout.write('Demo login password for all seeded accounts: AyHaga_123')
