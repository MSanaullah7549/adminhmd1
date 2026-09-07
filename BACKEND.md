# adminHMD Backend Setup Guide

## Quick Start

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Database Setup
```bash
npm run db:init    # Create database and tables
npm run db:seed    # Populate with sample data
```

### 4. Run Backend
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3000/api`

---

## Docker Setup

```bash
docker-compose up
```

This will:
- Start MySQL server on port 3306
- Start Node.js backend on port 3000
- Automatically initialize the database

---

## Project Structure

```
adminhmd-1.0.0/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── config/
│   │   └── db.js             # MySQL connection pool
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   ├── asyncHandler.js   # Async error handling
│   │   └── errorHandler.js   # Global error handler
│   ├── routes/
│   │   ├── auth.js           # Login/Register endpoints
│   │   ├── users.js          # User CRUD endpoints
│   │   └── health.js         # Health check endpoint
│   └── utils/
│       ├── errors.js         # Custom error classes
│       └── validators.js     # Input validation functions
├── scripts/
│   ├── initDb.js             # Database initialization
│   └── seed.js               # Sample data seeding
├── tests/
│   ├── setup.js              # Jest configuration
│   └── api.test.js           # API tests
├── database/
│   └── schema.sql            # Database schema
├── assets/
│   └── js/
│       └── api-client.js     # Frontend API client
├── .env.example              # Environment variables template
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile                # Docker image definition
├── jest.config.js            # Jest testing configuration
├── package.json              # NPM dependencies
├── API.md                    # API documentation
└── server.js                 # Entry point
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Health
- `GET /api/health` - Check API and database status

For detailed API documentation, see [API.md](API.md)

---

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm test -- --coverage
```

---

## Sample Users (After Seeding)

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | Admin@123 | admin |
| john@example.com | User@123 | user |
| jane@example.com | User@123 | moderator |

---

## Deployment

### Using Docker
```bash
docker build -t adminhmd-backend .
docker run -p 3000:3000 -e DB_HOST=<db-host> adminhmd-backend
```

### Environment Variables for Production
```
NODE_ENV=production
JWT_SECRET=<generate-strong-secret>
DB_HOST=<production-db-host>
DB_USER=<db-user>
DB_PASSWORD=<secure-password>
CORS_ORIGIN=<frontend-url>
```

---

## Security Checklist

- [ ] Change JWT_SECRET to a strong value
- [ ] Use HTTPS in production
- [ ] Set proper CORS_ORIGIN
- [ ] Use environment variables for sensitive data
- [ ] Enable database backups
- [ ] Implement rate limiting
- [ ] Keep dependencies updated
- [ ] Use strong database passwords
- [ ] Enable database encryption
- [ ] Regular security audits

---

## Troubleshooting

### MySQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
- Ensure MySQL is running
- Check DB_HOST and DB_PORT in .env
- Verify database credentials

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
- Change PORT in .env
- Or kill the process: `lsof -i :3000 | kill -9 <PID>`

### Authentication Errors
- Ensure token is in Authorization header
- Check token expiration (JWT_EXPIRES_IN)
- Verify JWT_SECRET is consistent

---

## Development Tips

1. Use `.env` file for local configuration
2. Run `npm run dev` for auto-reload during development
3. Check logs for detailed error messages
4. Use Postman/Insomnia for API testing
5. Enable debug mode: `DEBUG=* npm run dev`

---

## Support

For issues or questions, refer to:
- [API Documentation](API.md)
- Express.js docs: https://expressjs.com
- MySQL documentation: https://dev.mysql.com/doc
- JWT docs: https://jwt.io
