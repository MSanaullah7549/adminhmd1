# adminHMD Backend API Documentation

## Overview
Node.js + Express + MySQL REST API for the adminHMD Dashboard

**API Base URL**: `http://localhost:3000/api`

---

## Authentication

### JWT Token
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}

Response (201):
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": 2,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

## Users API

### List Users
```http
GET /users?limit=10&offset=0
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "status": "active",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 1
  }
}
```

### Get User by ID
```http
GET /users/:id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "status": "active",
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

### Create User (Admin Only)
```http
POST /users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "role": "user",
  "status": "active"
}

Response (201):
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 3,
    "name": "New User",
    "email": "newuser@example.com",
    "role": "user",
    "status": "active"
  }
}
```

### Update User
```http
PUT /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "role": "moderator",
  "status": "inactive"
}

Response (200):
{
  "success": true,
  "message": "User updated successfully"
}
```

### Delete User (Admin Only)
```http
DELETE /users/:id
Authorization: Bearer <admin-token>

Response (200):
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Health Check

```http
GET /health

Response (200):
{
  "success": true,
  "status": "healthy",
  "database": "connected"
}
```

---

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Description of the error"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| admin | Create, read, update, delete all users |
| moderator | Read users, update own profile |
| user | Read own profile, update own profile |

---

## Environment Variables

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=adminhmd
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

---

## Running the Backend

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm ci --only=production
npm start
```

### Database Setup
```bash
npm run db:init
npm run db:seed
```

### Docker
```bash
docker-compose up
```

### Testing
```bash
npm test
npm run test:watch
```
