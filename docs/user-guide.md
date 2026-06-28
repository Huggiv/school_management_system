# User Guide

## Overview

The School Management Portal supports multiple roles with tailored workflows:

- Administrator
- Principal
- Teacher
- Student
- Parent
- Guest

## Login

1. Open `/login`.
2. Enter email and password.
3. Select features from the top navigation after successful sign-in.

### Demo Seed Data and Example Logins

Run seed data from the backend folder:

1. `python -m scripts.seed_dev_data`

Example demo users (all use password `Demo@1234`):

- `admin@school.example.com` (administrator)
- `principal@school.example.com` (principal)
- `teacher@school.example.com` (teacher)
- `student@school.example.com` (student)
- `guest@school.example.com` (guest)

### Sign Up

1. Open `/signup`.
2. Create your account with first name, last name, email, and password.
3. New accounts are created with the default role `guest`.

## Role Workflows

### Administrator and Principal

- View admin dashboard summary.
- Manage users, admissions, grades, assignments, announcements, events.
- Review admission applications and export CSV.

### Teacher

- View teacher dashboard metrics.
- Create and update assignments.
- Enter and update grades.

### Student

- View student dashboard overview.
- View assignments and submit work.
- View grades and progress.

### Parent

- View parent dashboard summary.
- Track child progress indicators.
- Read announcements and upcoming events.

### Guest

- Browse home page sections.
- View public announcements, events, and gallery where enabled.

## Admission Form

1. Open `/admission`.
2. Fill required student and guardian details.
3. Upload optional document.
4. Submit application.

Admin users can filter, search, and export admission records.

## Profile

Open `/profile` to view account details. Profile editing is planned in a future iteration.

## Common Troubleshooting

- Login fails:
  - Verify email/password.
  - Confirm backend service is healthy.
- Dashboard shows no data:
  - Confirm seed data or records exist.
  - Check API connectivity in browser network tab.
- Upload fails:
  - Verify file size is below configured max upload limit.
