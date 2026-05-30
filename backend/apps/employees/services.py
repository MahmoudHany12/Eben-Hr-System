"""Employee services: manage creation and updates that involve User + Employee."""

from django.contrib.auth import get_user_model
from django.db import transaction

from apps.core.exceptions import BusinessRuleException

from .models import Employee

User = get_user_model()

SELF_EDIT_ALLOWED_FIELDS = {'address', 'mobile'}
HIRED_STATES = {Employee.WorkflowStates.HIRED}
VALID_WORKFLOW_TRANSITIONS = {
    Employee.WorkflowStates.APPLICATION_RECEIVED: {
        Employee.WorkflowStates.INTERVIEW_SCHEDULED,
        Employee.WorkflowStates.NOT_ACCEPTED,
    },
    Employee.WorkflowStates.INTERVIEW_SCHEDULED: {
        Employee.WorkflowStates.HIRED,
        Employee.WorkflowStates.NOT_ACCEPTED,
    },
    Employee.WorkflowStates.HIRED: set(),
    Employee.WorkflowStates.NOT_ACCEPTED: set(),
}


def get_allowed_transitions(current_state: str) -> list[str]:
    """Return valid target workflow states for the given state."""
    return sorted(VALID_WORKFLOW_TRANSITIONS.get(current_state, set()))


def validate_transition(current_state: str, target_state: str):
    """Raise a business exception when a workflow state change is invalid."""
    valid_states = {choice.value for choice in Employee.WorkflowStates}
    if target_state not in valid_states:
        raise BusinessRuleException(f'Invalid employee workflow state: {target_state}.')

    if current_state == target_state:
        return

    if target_state not in VALID_WORKFLOW_TRANSITIONS.get(current_state, set()):
        raise BusinessRuleException(
            f'Invalid employee workflow transition from {current_state} to {target_state}.')


def is_hired_state(workflow_state: str) -> bool:
    return workflow_state in HIRED_STATES


def _is_self_edit(actor, employee: Employee) -> bool:
    return bool(actor and actor.is_authenticated and getattr(employee, 'user_id', None) == getattr(actor, 'id', None))


def _restrict_self_edit(employee: Employee, fields: dict):
    blocked_fields = set(fields) - SELF_EDIT_ALLOWED_FIELDS
    if blocked_fields:
        blocked_list = ', '.join(sorted(blocked_fields))
        raise BusinessRuleException(
            f'You can only edit your own address and mobile. Blocked fields: {blocked_list}.')


@transaction.atomic
def onboard_employee(*, username: str, password: str, first_name: str | None, last_name: str | None, email: str, company, department=None, mobile: str | None = None, address: str | None = None, title: str | None = None, hire_date=None, workflow_state: str | None = None, is_active=None, role: str | None = None) -> Employee:
    """Create a User and Employee profile in a single transaction."""
    workflow_state = workflow_state or Employee.WorkflowStates.APPLICATION_RECEIVED
    validate_transition(workflow_state, workflow_state)

    user = User.objects.create_user(
        username=username,
        password=password,
        email=email,
        first_name=first_name or '',
        last_name=last_name or '',
    )
    user.role = role or User.Roles.EMPLOYEE
    user.assigned_company = company if user.role == User.Roles.HR_MANAGER else None
    user.save(update_fields=['role', 'assigned_company'])

    employee = Employee.objects.create(
        user=user,
        company=company,
        department=department,
        email=email,
        mobile=mobile or '',
        address=address or '',
        title=title or '',
        hire_date=hire_date,
        workflow_state=workflow_state,
        is_active=is_hired_state(workflow_state),
    )

    return employee


@transaction.atomic
def update_employee_profile(*, employee: Employee, actor, **fields) -> Employee:
    """Update both the User and Employee records with business-rule enforcement."""
    if _is_self_edit(actor, employee):
        _restrict_self_edit(employee, fields)

    actor_role = getattr(actor, 'role', None)
    actor_company = getattr(actor, 'assigned_company', None)

    if actor_role == User.Roles.HR_MANAGER:
        if not actor_company:
            raise BusinessRuleException(
                'HR managers must be assigned to a company.')

        target_company = fields.get('company', employee.company)
        target_department = fields.get('department', employee.department)

        if target_company and target_company.pk != actor_company.pk:
            raise BusinessRuleException(
                'HR managers can only manage employees in their assigned company.')

        if target_department and target_department.company_id != actor_company.pk:
            raise BusinessRuleException(
                'You cannot assign an employee to a department outside your assigned company.')

    if actor_role == User.Roles.EMPLOYEE and not _is_self_edit(actor, employee):
        raise BusinessRuleException(
            'Employees can only edit their own profile.')

    user = employee.user

    if 'username' in fields and fields['username']:
        user.username = fields.pop('username')
    else:
        fields.pop('username', None)
    if 'password' in fields and fields['password']:
        user.set_password(fields.pop('password'))
    else:
        fields.pop('password', None)
    if 'first_name' in fields:
        user.first_name = fields.pop('first_name') or ''
    if 'last_name' in fields:
        user.last_name = fields.pop('last_name') or ''
    if 'role' in fields and fields['role'] is not None:
        user.role = fields.pop('role')
        if user.role == User.Roles.HR_MANAGER:
            user.assigned_company = fields.get('company') or employee.company
        else:
            user.assigned_company = None
    else:
        fields.pop('role', None)

    user.save()

    if 'company' in fields and fields['company'] is not None:
        employee.company = fields.pop('company')
    if 'department' in fields:
        employee.department = fields.pop('department')
    if 'email' in fields and fields['email'] is not None:
        employee.email = fields.pop('email')
        user.email = employee.email
        user.save(update_fields=['email'])
    if 'mobile' in fields:
        employee.mobile = fields.pop('mobile') or ''
    if 'address' in fields:
        employee.address = fields.pop('address') or ''
    if 'title' in fields:
        employee.title = fields.pop('title') or ''
    if 'hire_date' in fields:
        employee.hire_date = fields.pop('hire_date')
    if 'workflow_state' in fields and fields['workflow_state'] is not None:
        target_state = fields.pop('workflow_state')
        validate_transition(employee.workflow_state, target_state)
        employee.workflow_state = target_state
        employee.is_active = is_hired_state(target_state)
    if 'is_active' in fields and fields['is_active'] is not None:
        fields.pop('is_active')
    else:
        fields.pop('is_active', None)

    employee.full_clean()
    employee.save()
    return employee
