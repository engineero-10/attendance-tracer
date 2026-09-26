# Attendance Tracer

Attendance Tracer is a REST API for managing classes, student enrollments, and daily attendance. It is built with Node.js, Express, MongoDB, and Mongoose.

## Features

- User signup and login with JWT authentication
- Teacher and student roles
- Teacher class management
- Student class discovery and enrollment
- Teacher attendance marking and editing
- Student attendance history
- Daily attendance summaries
- Attendance export as JSON or CSV
- Request validation and centralized error responses

## Requirements

- Node.js 18 or newer
- MongoDB database
- npm

## Installation

```bash
npm install
```

Create a `.env` file in the project root:

```env
PORT=4000
MONGO_URL=mongodb://127.0.0.1:27017/attendance-tracer
JWT_SECRET_KEY=replace-with-a-long-random-secret
```

Start the development server:

```bash
npm start
```

The API will be available at:

```text
http://localhost:4000
```

## Authentication

Signup and login return a JWT token. Send that token with protected requests:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Users have one of these roles:

- `STUDENT`: Can view available classes, enroll in classes, and view attendance history.
- `TEACHER`: Can create and manage classes and manage attendance.

New users default to the `STUDENT` role unless a different valid role is provided in the signup request.

## API Endpoints

### Authentication

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | No | Create a user account |
| POST | `/api/auth/login` | No | Authenticate a user and receive a token |

Signup body:

```json
{
  "userName": "student1",
  "name": "Student One",
  "email": "student@example.com",
  "password": "secret123",
  "role": "STUDENT"
}
```

Login body:

```json
{
  "userName": "student1",
  "password": "secret123"
}
```

### Teacher Class Management

All endpoints in this section require a valid JWT and the `TEACHER` role, except where noted.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/classes` | Get the teacher's classes |
| POST | `/api/classes/create` | Create a class |
| GET | `/api/classes/:code` | Get a class by code; requires a valid JWT |
| PATCH | `/api/classes/edit/:code` | Update a class |
| DELETE | `/api/classes/delete/:code` | Delete a class |

Create class body:

```json
{
  "className": "Backend Development",
  "description": "Node.js and API development",
  "code": "BACKEND101",
  "schedule": [
    {
      "dayOfWeek": "Monday",
      "startTime": "09:00",
      "endTime": "11:00"
    }
  ]
}
```

Supported class statuses are `ACTIVE` and `INACTIVE`.

### Student Features

All endpoints in this section require a valid JWT and the `STUDENT` role.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/students/classes` | Get active classes available for enrollment |
| GET | `/api/students` | Get the student's enrollments |
| POST | `/api/students/:code` | Enroll in a class by code |
| GET | `/api/students/my_history` | Get the student's attendance history |

Pagination is supported on list endpoints:

```text
/api/students?page=1&limit=10
```

### Teacher Attendance

All endpoints in this section require a valid JWT and the `TEACHER` role.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/teachers` | Mark attendance for a student |
| PATCH | `/api/teachers/:classCode/attendance/:studentId` | Update today's attendance |
| GET | `/api/teachers/:classCode/daily` | Get a daily class attendance summary |
| GET | `/api/teachers/export/:classCode` | Export attendance as JSON or CSV |

Mark attendance body:

```json
{
  "studentId": "STUDENT_USER_ID",
  "status": "PRESENT",
  "participation": 5,
  "classCode": "BACKEND101",
  "notes": "Good participation"
}
```

Attendance statuses are `PRESENT` and `ABSENT`. Participation scores range from 0 to 5.

Daily summary with a specific date:

```text
/api/teachers/BACKEND101/daily?date=2026-09-26
```

Export attendance as JSON:

```text
/api/teachers/export/BACKEND101?format=json&date=2026-09-26
```

Export attendance as CSV:

```text
/api/teachers/export/BACKEND101?format=csv&date=2026-09-26
```

## Response Format

Successful responses use a structure similar to:

```json
{
  "status": "SUCCESS",
  "message": "Operation completed successfully",
  "statusCode": 200,
  "data": {}
}
```

Errors use the same top-level fields and include an error message in `message`.

## Project Structure

```text
attendance-tracer/
|-- server.js                  # Application entry point
|-- package.json
|-- src/
    |-- index.js               # Express application configuration
    |-- config/                # Database configuration
    |-- controller/            # HTTP request and response handling
    |-- middleware/            # Authentication, authorization, and validation
    |-- model/                 # Mongoose schemas and models
    |-- repository/            # Database access operations
    |-- router/                # API route definitions
    |-- service/               # Business logic and orchestration
    |-- utils/                 # Errors, tokens, statuses, and shared helpers
```

## Architecture

The application follows a layered structure:

1. Routers connect URLs to controller methods.
2. Middleware authenticates users, checks roles, and validates request data.
3. Controllers read request data and format HTTP responses.
4. Services coordinate business rules and application workflows.
5. Repositories perform database operations through Mongoose models.
6. Models define the MongoDB document structure.

## Development Notes

- The project currently provides a `start` script using Nodemon.
- No automated test script is currently configured in `package.json`.
- MongoDB must be running and reachable through `MONGO_URL` before starting the server.
- Keep `.env` out of version control because it contains the JWT secret and database connection information.
