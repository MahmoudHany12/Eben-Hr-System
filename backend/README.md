# Employee Management System Backend

## 1. Project Overview

This project is a production-style backend for an Employee Management System built with Django REST Framework.
It provides secure JWT-based authentication, role-based access control (RBAC), and domain-driven app separation.

Core capabilities:
- Manage companies, departments, and employees
- Enforce role-specific access for System Admin, HR Manager, and Employee users
- Validate business constraints (e.g., department must belong to selected company)
- Expose REST APIs for a React frontend

## 2. Tech Stack

- Python 3.12+
- Django 5+
- Django REST Framework
- PostgreSQL (via environment variables)
- djangorestframework-simplejwt
- python-dotenv

## 3. Architecture Explanation

### Why apps were separated
The backend is organized by business domains:
- `accounts`: user model and auth endpoints
- `companies`: company domain
- `departments`: department domain
- `employees`: employee domain
- `core`: shared utilities (pagination, exceptions, validators)

This reduces coupling and keeps each domain easy to maintain.

### Why services/selectors pattern was used
- `selectors.py`: read/query logic (optimized querysets, annotations)
- `services.py`: write/business actions (transactions, orchestration)
- `views.py`: thin HTTP layer only

Benefits:
- Better testability
- Reusable business logic outside API views
- Cleaner separation of concerns

### RBAC approach
Role checks are enforced at the API layer by combining:
- role-aware querysets in views
- object-level permission checks
- business restrictions in service/view orchestration

Roles:
- `ADMIN`: full access
- `HR_MANAGER`: scoped to `assigned_company`
- `EMPLOYEE`: read-only access to own profile

## 4. Database Design (ERD Explanation)

Entities and relationships:
- `User` (custom auth model)
  - has `role`
  - optional `assigned_company` (for HR scope)
- `Company`
  - has many `Department`
  - has many `Employee`
- `Department`
  - belongs to one `Company`
  - has many `Employee`
- `Employee`
  - one-to-one with `User`
  - belongs to one `Company`
  - belongs to one `Department` (nullable)

Constraint highlights:
- Employee email is unique
- Department is unique per `(name, company)`
- Department-company consistency is validated when creating/updating employees

## 5. API Documentation

Base URL prefix: `/api/`

### Auth
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`

### Companies
- `GET /api/companies/`
- `POST /api/companies/`
- `GET /api/companies/{id}/`
- `PATCH /api/companies/{id}/`
- `DELETE /api/companies/{id}/`

### Departments
- `GET /api/departments/`
- `POST /api/departments/`
- `GET /api/departments/{id}/`
- `PATCH /api/departments/{id}/`
- `DELETE /api/departments/{id}/`
- Filtering: `GET /api/departments/?company=1`

### Employees
- `GET /api/employees/`
- `POST /api/employees/`
- `GET /api/employees/{id}/`
- `PATCH /api/employees/{id}/`
- `DELETE /api/employees/{id}/`

### Authentication usage
Include access token in requests:

```http
Authorization: Bearer <access_token>
```

### Request example (login)

```json
{
  "username": "admin",
  "password": "Pass1234!"
}
```

### Request example (create employee)

```json
{
  "username": "new_emp",
  "password": "Pass1234!",
  "first_name": "New",
  "last_name": "Employee",
  "company_id": 1,
  "department_id": 2,
  "email": "new_emp@example.com",
  "mobile": "+201234567890",
  "title": "Software Engineer",
  "hire_date": "2026-05-01",
  "is_active": true
}
```

### Response example (employee)

```json
{
  "id": 1,
  "user_id": 5,
  "company_id": 1,
  "department_id": 2,
  "email": "new_emp@example.com",
  "mobile": "+201234567890",
  "address": "",
  "title": "Software Engineer",
  "hire_date": "2026-05-01",
  "is_active": true,
  "created_at": "2026-05-29T15:00:00Z",
  "updated_at": "2026-05-29T15:00:00Z",
  "days_employed": 28
}
```

### Error response format

```json
{
  "success": false,
  "error": {
    "code": "error_code",
    "detail": {
      "field": ["message"]
    }
  }
}
```

## 6. Setup Instructions

```bash
# 1) Clone
git clone <repo-url>
cd <repo>/backend

# 2) Create venv
python -m venv .venv

# 3) Activate (Windows PowerShell)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
. .\.venv\Scripts\Activate.ps1

# 4) Install dependencies
pip install -r requirements.txt

# 5) Configure environment
copy .env.example .env

# 6) Run migrations
python manage.py makemigrations
python manage.py migrate

# 7) Create superuser
python manage.py createsuperuser

# 8) Run server
python manage.py runserver
```

## 7. Environment Variables

From `.env`:
- `DJANGO_SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`

PostgreSQL is required. Set `DB_NAME`, `DB_USER`, and `DB_PASSWORD` in `.env` before running the project.

## 8. Running Tests

```bash
python manage.py test
```

Test coverage currently includes:
- JWT auth flow (login/refresh/me)
- Permissions (HR delete-company restriction, employee profile scope)
- Employee creation flow
- Department/company validation
- `calculate_days_employed` utility

## 9. Folder Structure Explanation

```text
backend/
├── manage.py
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── dev.py
│   │   └── prod.py
│   └── urls.py
└── apps/
    ├── accounts/
    ├── companies/
    ├── departments/
    ├── employees/
    └── core/
```

Each domain app follows:
- `models.py` (schema)
- `serializers.py` (validation/transform)
- `selectors.py` (read queries)
- `services.py` (business operations)
- `permissions.py` (authorization)
- `views.py` (HTTP layer)
- `urls.py` (routing)

## 10. Future Improvements

- Add OpenAPI/Swagger docs generation
- Add full CI pipeline (lint, type checks, tests)
- Add refresh token rotation/blacklisting
- Add audit logging for critical mutations
- Add soft-delete strategy for selected entities
- Expand permission classes into reusable policy modules
