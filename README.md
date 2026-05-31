# eBen - Employee Management System (Full Stack)

This repository contains the full-stack **Employee Management System (eBen)**. Designed to streamline human resources operations, onboarding processes, and employee record management, this system relies on a secure, role-based platform that empowers administrators and HR teams while giving employees secure access to their own data.

* **Backend:** Django + Django REST Framework + PostgreSQL + JWT Authentication
* **Frontend:** React + TypeScript + Vite + Material UI

This document serves as the single source of truth for the project's architecture, business logic, setup instructions, and API documentation.

---

## 🚀 1. Core Features

* **Authentication:** Secure JWT-based login and session management.
* **Role-Based Access Control (RBAC):** Strict boundaries defining what users can view, edit, or delete across the entire system.
* **Companies Management:** Cross-tenant administration of organizational entities.
* **Departments Management:** Company-scoped department tracking.
* **Employees Management:** Comprehensive lifecycle tracking from applicant to hired employee.
* **Profile Management:** Self-service viewing and basic profile editing for employees.
* **Dashboard Analytics:** Landing page with aggregate metrics and visualizations based strictly on user jurisdiction.
* **Employee Reporting:** Tabular reporting with filtering capabilities specifically for hired personnel.
* **Pagination:** Standardized page-based data retrieval across all lists.
* **Validation:** Strict client-side (Zod) and server-side (DRF) data integrity checks.

---

## 🔐 2. User Roles & Capabilities

The system strictly enforces boundaries using three distinct roles:

### ADMIN (System Administrator)

* **Capabilities:** Full cross-tenant access to the entire system.
* **Permissions:** Can manage (CRUD) all Companies, Departments, and Employees. Can manage and assign user roles.
* **Restrictions:** Cannot modify their own role (prevents system lockouts).

### HR_MANAGER

* **Capabilities:** Restricted exclusively to their assigned company permissions.
* **Permissions:** Can fully manage Departments and Employees within their specific company.
* **Restrictions:** Cannot create, edit, or delete Companies. Cannot view data outside their company. Cannot edit user roles or grant Admin privileges.

### EMPLOYEE

* **Capabilities:** Limited access strictly to their own data.
* **Permissions:** Can view their "My Profile" landing page and basic department information. Can edit basic personal details (e.g., mobile, address).
* **Restrictions:** Cannot view lists of companies or other employees. Cannot edit restricted confidential fields (e.g., Job Title, Hire Date, Role, Status).

---

## 🔄 3. Onboarding Workflow & Business Rules

### State Machine (Onboarding)

The system utilizes a workflow to track the recruitment of regular employees. *(Note: Admins and HR Managers bypass this and are considered "Hired" by default).*

* **Valid Transitions:**
* `Application Received` → `Interview Scheduled`
* `Application Received` → `Not Accepted`
* `Interview Scheduled` → `Hired`
* `Interview Scheduled` → `Not Accepted`


* **Invalid Transitions:** An applicant cannot skip the interview stage to become `Hired`. A `Not Accepted` candidate cannot be transitioned back into the active pipeline.

### Critical Business Logic

* **Time Tracking:** "Hire Date" only exists for employees in the `HIRED` state. "Days Employed" is calculated dynamically on the server strictly for `HIRED` employees.
* **Data Integrity (Deletions):** Deleting a Company cascades and deletes its employees. Deleting a Department does *not* delete employees; instead, affected employee records will display `N/A` for their department.
* **Reporting:** The Employee Report dashboard exclusively includes data for `HIRED` employees.
* **Passwords:** The system enforces strict password complexity (Minimum 8 characters, one uppercase letter, one special character).

---

## 🏗️ 4. Architecture & Database Design

### Architecture Approach

The backend follows a domain-driven design pattern organized by apps:

* `accounts`: Authentication, User models, and RBAC.
* `companies`: Company CRUD operations.
* `departments`: Department CRUD and company-scoped uniqueness constraints `(name, company)`.
* `employees`: Employee CRUD, workflows, and automated calculations.
* `core`: Shared pagination logic, custom exception handlers, and global validators.

**Backend Implementation Style:**

* `models.py`: Database schema, relations, and low-level constraints.
* `serializers.py`: Data validation and JSON serialization/deserialization.
* `views.py`: HTTP layer and routing.
* `services.py`: Write operations and complex business logic/workflows.
* `selectors.py`: Read operations and complex database queries.
* `permissions.py`: Enforces strict access rules based on user roles.

### Database Schema Considerations (PostgreSQL)

* **`User` (Custom Auth):** Fields include `role` and an optional `assigned_company`.
* **`Company`:** Has a one-to-many relationship with both `Department` and `Employee`.
* **`Department`:** Belongs to a single `Company`. Enforces a unique constraint: `(name, company)`.
* **`Employee`:** One-to-one relationship with `User` (via `employee_profile`), belongs to one `Company`, optionally tied to a `Department`, and enforces a unique `email`.

---

## ⚙️ 5. Local Setup Instructions

### Prerequisites

* Python 3.12+
* Node.js 18+
* PostgreSQL 14+

### 5.1 Clone the Repository

```powershell
git clone <your-repo-url>
cd eben

```

### 5.2 Backend Setup (Django)

1. **Create the PostgreSQL database:**
```sql
CREATE DATABASE employee_management;

```


2. **Configure Environment Variables:**
```powershell
cd backend
copy .env.example .env

```


3. **Create Virtual Environment & Install Dependencies:**
```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt

```


4. **Run Migrations & Seed Data:**
```powershell
python manage.py migrate
python manage.py seed_data

```


5. **Start the Backend Server:**
```powershell
python manage.py runserver

```



### 5.3 Frontend Setup (React)

1. **Install Dependencies & Start:**
```powershell
cd frontend
npm install
npm run dev

```



---

## 🐳 6. Docker Deployment 

You can boot the entire system (Database, Backend API, and Frontend) with a single command using Docker.

### Prerequisites

* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Running the Project

1. Ensure you are in the root directory of the project.
2. Run the following command:
```bash
docker-compose up --build

```


3. The system will automatically:
* Initialize the PostgreSQL database.
* Build the Django backend and apply migrations.
* Launch the React frontend.


4. Access the application at `http://localhost:5173`.

---

## 🧪 7. Testing & Demo Accounts

Run `python manage.py seed_data` to access these predefined accounts:

* **Admin:** `admin` / `AyHaga_123`
* **HR Manager:** `hrmanager` / `AyHaga_123`
* **Employee:** `employee` / `AyHaga_123`

```bash
# Run the test suite
python manage.py test

```

---

## 🔌 8. API Documentation

* **Swagger UI:** `http://localhost:8000/api/docs/`
* **ReDoc:** `http://localhost:8000/api/redoc/`

---

## 🎨 9. UI/UX & Technologies

* **Technologies:** Django, DRF, PostgreSQL, React, TypeScript, Material UI (MUI), React Query, Zod.
* **Design:** eBen branding, Quicksand font, fully responsive UI with color-coded workflow status chips.

---

## 💡 10. Troubleshooting

* **DB Connection:** Verify PostgreSQL is running and `.env` credentials match.
* **CORS:** Ensure `VITE_API_URL` is set to `http://localhost:8000/api`.
* **Auth:** Clear browser local storage if tokens become desynced.