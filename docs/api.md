# API Usage Guide

## Base URL

- Local backend: `http://localhost:8000`
- Versioned API prefix: `/api/v1`

## Authentication Flow

### Login

`POST /api/v1/auth/login`

Demo logins are seeded with password `Demo@1234`:

- `admin@school.example.com` for administrator access
- `principal@school.example.com` for principal access

Request body:

```json
{
  "email": "admin@school.example.com",
  "password": "Demo@1234"
}
```

Response body:

```json
{
  "tokens": {
    "access_token": "...",
    "refresh_token": "...",
    "token_type": "bearer",
    "expires_in": 1800
  },
  "user": {
    "id": 1,
    "first_name": "System",
    "last_name": "Admin",
    "email": "admin@school.example.com",
    "role": "administrator"
  }
}
```

### Refresh Token

`POST /api/v1/auth/refresh-token`

Request body:

```json
{
  "refresh_token": "..."
}
```

### Password Reset

- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`

## Authorization Header

Use JWT access token in request headers:

`Authorization: Bearer <access_token>`

## Pagination, Sorting, and Search

Most list endpoints support these query params:

- `page` (default `1`)
- `size` (default `20`, max `100`)
- `sort` (example `id`, `-id`, `event_date`)
- `search` (string filter across configured fields)

Example:

`GET /api/v1/students?page=1&size=20&sort=-id&search=ADM-2026`

Standard list response shape:

```json
{
  "items": [],
  "page": 1,
  "size": 20,
  "total": 0
}
```

## Module Endpoint Summary

| Module | Base Path | Notes |
| --- | --- | --- |
| Auth | `/api/v1/auth` | Login, refresh, logout, forgot/reset password |
| Users | `/api/v1/users` | CRUD with role restrictions |
| Students | `/api/v1/students` | CRUD + pagination/search |
| Teachers | `/api/v1/teachers` | CRUD + pagination/search |
| Parents | `/api/v1/parents` | CRUD + pagination/search |
| Admissions | `/api/v1/admissions` | CRUD for applications |
| Grades | `/api/v1/grades` | Grade create/edit/list |
| Assignments | `/api/v1/assignments` | Assignment create/edit/list |
| Submissions | `/api/v1/submissions` | Submission create/list |
| Events | `/api/v1/events` | Event scheduling |
| Gallery | `/api/v1/gallery` | Gallery image metadata |
| Announcements | `/api/v1/announcements` | Publish/read announcements |
| Dashboard | `/api/v1/dashboard` | Role-based metrics |
| Files | `/api/v1/files` | Upload/download file handling |

## API Docs

- OpenAPI UI: `/docs`
- ReDoc: `/redoc`

## Backend Entity Relationship Diagram

```mermaid
erDiagram
  USERS {
    int id PK
    string first_name
    string last_name
    string email
    string role
    string phone
  }

  STUDENTS {
    int id PK
    int user_id FK
    string admission_number
    string class_name
    string section
    string guardian
  }

  TEACHERS {
    int id PK
    int user_id FK
    string employee_id
    string department
  }

  PARENTS {
    int id PK
    int user_id FK
    string relation
    string phone
  }

  ADMISSIONS {
    int id PK
    string application_number
    string student_name
    string gender
    string class_name
    string email
    string contact_number
    float fee_total
    float fee_paid
    float fee_pending
    string status
  }

  ASSIGNMENTS {
    int id PK
    int teacher_id FK
    string title
    datetime due_date
  }

  SUBMISSIONS {
    int id PK
    int assignment_id FK
    int student_id FK
    datetime submitted_at
    float marks
  }

  GRADES {
    int id PK
    int student_id FK
    string subject
    float marks
    string grade
  }

  ANNOUNCEMENTS {
    int id PK
    string title
    datetime published_at
  }

  EVENTS {
    int id PK
    string title
    date event_date
  }

  GALLERY {
    int id PK
    string image
    string title
    string category
  }

  USERS ||--o| STUDENTS : has_profile
  USERS ||--o| TEACHERS : has_profile
  USERS ||--o| PARENTS : has_profile

  TEACHERS ||--o{ ASSIGNMENTS : creates
  ASSIGNMENTS ||--o{ SUBMISSIONS : receives
  STUDENTS ||--o{ SUBMISSIONS : submits
  STUDENTS ||--o{ GRADES : receives
```
