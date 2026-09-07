# Frontend-Backend Integration Guide

## Overview
The adminHMD application now has a fully integrated frontend and backend. The backend (Node.js/Express) serves both the API endpoints and the static frontend files.

## Setup Instructions

### 1. Installation
```bash
cd adminhmd-1.0.0
npm install
```

### 2. Database Setup (Optional, for full functionality)
Before running the application, ensure MySQL is running and create the database:

```bash
# Initialize database
npm run db:init

# Seed sample data
npm run db:seed
```

### 3. Start the Application
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

The application will start on `http://localhost:3000`

## Architecture

### Backend (Express Server)
- **Port**: 3000
- **Location**: `src/app.js`
- **Static Files**: Serves HTML and assets from `html/` and `assets/` directories
- **API Base**: `/api`

### Frontend (Static HTML)
- **Location**: `html/` directory
- **Scripts**: 
  - `assets/js/api-client.js` - API client class
  - `assets/js/main.js` - UI and theme logic
  - `assets/js/users-data.js` - User management (for users.html)

## API Endpoints

### Health Check
```
GET /api/health
```
Response:
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected"
}
```

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Users Management
```
GET /api/users?limit=10&offset=0      - Get all users (requires auth)
GET /api/users/:id                     - Get user by ID (requires auth)
POST /api/users                        - Create user (requires auth)
PUT /api/users/:id                     - Update user (requires auth)
DELETE /api/users/:id                  - Delete user (requires auth)
```

## API Client Usage

The API client is automatically initialized and available as `window.apiClient` in all HTML pages.

### Example Usage
```javascript
// Get all users
const users = await apiClient.users.getAll(10, 0);

// Get user by ID
const user = await apiClient.users.getById(1);

// Create user
const newUser = await apiClient.users.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
});

// Update user
const updated = await apiClient.users.update(1, {
  name: 'Jane Doe'
});

// Delete user
await apiClient.users.delete(1);

// Health check
const health = await apiClient.health.check();

// Authentication
const token = await apiClient.auth.login({
  email: 'user@example.com',
  password: 'password123'
});

// Set token for future requests
apiClient.setToken(token);
```

## Testing the Connection

### 1. Connection Test Page
Visit `http://localhost:3000/connection-test.html` to run automated tests of the frontend-backend connection.

### 2. Manual Testing
```bash
# Test backend is running
curl http://localhost:3000/

# Test API health
curl http://localhost:3000/api/health

# Test with auth token (after login)
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Browser Console
Open browser DevTools (F12) and test API calls:
```javascript
// Check if API client is available
console.log(window.apiClient);

// Test a health check
apiClient.health.check().then(r => console.log(r));

// Login
apiClient.auth.login({
  email: 'user@example.com',
  password: 'password123'
}).then(r => console.log(r));
```

## File Structure

```
adminhmd-1.0.0/
├── src/
│   ├── app.js                 # Main Express app (serves static files + API)
│   ├── config/
│   │   └── db.js             # Database connection
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   ├── asyncHandler.js   # Error handling wrapper
│   │   └── errorHandler.js   # Error middleware
│   ├── routes/
│   │   ├── auth.js           # Authentication endpoints
│   │   ├── users.js          # User management endpoints
│   │   └── health.js         # Health check endpoint
│   └── utils/
│       ├── errors.js         # Custom error classes
│       └── validators.js     # Data validation utilities
│
├── html/                      # Static frontend files (served by Express)
│   ├── index.html
│   ├── users.html
│   ├── login.html
│   └── ... (other pages)
│
├── assets/
│   ├── js/
│   │   ├── api-client.js     # API client class
│   │   ├── main.js           # UI and theme logic
│   │   └── users-data.js     # User management script
│   ├── css/
│   │   └── style.css
│   └── images/
│
├── database/
│   └── schema.sql            # Database schema
│
├── scripts/
│   ├── initDb.js             # Database initialization
│   └── seed.js               # Sample data seeding
│
└── package.json
```

## CORS Configuration

CORS is configured in `src/app.js` to allow requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

To add more origins (e.g., for production), update the CORS configuration:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://example.com'],
  credentials: true,
}));
```

## Troubleshooting

### "Cannot GET /" 
- Make sure `src/app.js` is being imported/required correctly
- Verify static files are in the correct directories

### API endpoints return 404
- Check that routes are mounted before the catchall 404 handler
- Verify route files are in `src/routes/`

### Database connection errors
- Ensure MySQL is running
- Check database credentials in `.env` file
- Run `npm run db:init` to create tables

### CORS errors in browser
- Check browser console for specific CORS error
- Verify origin URL matches CORS configuration
- Make sure credentials are properly sent if needed

### API client not found
- Ensure `api-client.js` is loaded before other scripts
- Check browser console: `console.log(window.apiClient)`

## Production Deployment

For production, consider:

1. **Environment Variables**: Create `.env` file with production values
2. **Database**: Use production MySQL database
3. **Security**: 
   - Use HTTPS
   - Implement rate limiting
   - Validate all inputs
   - Use secure session storage
4. **Build**: Minify and bundle frontend assets
5. **Logging**: Add comprehensive logging
6. **Monitoring**: Set up error monitoring and alerting

## Development Notes

### Adding New Features
1. Create new API routes in `src/routes/`
2. Add methods to API client class in `assets/js/api-client.js`
3. Create corresponding frontend scripts if needed
4. Test with connection test page first
5. Add UI components to relevant HTML files

### Modifying API Responses
Remember to update the API client to handle the new response structure.

### Working with Authentication
- Login tokens are stored in `localStorage` under key `authToken`
- Tokens are automatically sent with each API request
- Clear token with `apiClient.setToken(null)` for logout

## Support & Debugging

Enable debug logging by adding to browser console:
```javascript
// Log all API requests
const originalRequest = apiClient.request.bind(apiClient);
apiClient.request = async function(endpoint, options) {
  console.log('API Request:', endpoint, options);
  const result = await originalRequest(endpoint, options);
  console.log('API Response:', result);
  return result;
};
```
