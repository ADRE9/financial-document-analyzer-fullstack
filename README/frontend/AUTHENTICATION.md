# Authentication System Documentation

## Overview

The Financial Document Analyzer implements a secure, JWT-based authentication system with React Router integration. The system provides three main screens: Login, Register, and Home (protected).

## Security Features

### 1. Token Management

- **Secure Storage**: Tokens are stored in localStorage with expiration tracking
- **Automatic Refresh**: Access tokens are automatically refreshed when expired
- **Token Validation**: Tokens are validated before each API request
- **Secure Logout**: All tokens are cleared on logout

### 2. Input Validation

- **Client-side Validation**: Zod schemas for form validation
- **Password Requirements**: Minimum 8 characters with complexity requirements
- **Email Validation**: Proper email format validation
- **Username Validation**: Alphanumeric characters and underscores only

### 3. Route Protection

- **Protected Routes**: Home screen requires authentication
- **Public Routes**: Login/Register redirect to home if already authenticated
- **Automatic Redirects**: Users are redirected to intended destination after login

### 4. Error Handling

- **User-friendly Messages**: Clear error messages for users
- **Network Error Handling**: Proper handling of network failures
- **Session Expiry**: Automatic logout on token refresh failure

## File Structure

```
src/
├── contexts/
│   ├── AuthContext.tsx              # Auth context provider
│   └── AuthContextDefinition.tsx    # Context type definitions
├── hooks/
│   ├── useAuth.ts                   # Authentication API hooks
│   └── useAuthContext.ts            # Auth context hook
├── pages/
│   ├── Login.tsx                    # Login screen
│   ├── Register.tsx                 # Registration screen
│   └── Home.tsx                     # Protected home screen
├── components/
│   ├── ProtectedRoute.tsx           # Route guard for protected routes
│   └── PublicRoute.tsx              # Route guard for public routes
├── utils/
│   └── tokenManager.ts              # Token management utilities
└── services/
    └── api.ts                       # API client with auth integration
```

## Usage

### 1. Authentication Context

The `AuthProvider` wraps the entire application and provides authentication state:

```tsx
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return <AuthProvider>{/* Your app components */}</AuthProvider>;
}
```

### 2. Using Authentication

```tsx
import { useAuth } from "./hooks/useAuthContext";

function MyComponent() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          Welcome, {user?.first_name}!<button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>Please log in</div>
      )}
    </div>
  );
}
```

### 3. Route Protection

```tsx
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

## API Integration

### Authentication Endpoints

The system integrates with the following backend endpoints:

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Token refresh
- `GET /auth/me` - Get current user
- `PUT /auth/me` - Update user profile
- `POST /auth/change-password` - Change password
- `GET /auth/sessions` - Get user sessions
- `DELETE /auth/sessions/{id}` - Revoke session

### Automatic Token Refresh

The API client automatically handles token refresh:

1. When a request returns 401 Unauthorized
2. If a valid refresh token exists
3. The request is retried with the new access token
4. If refresh fails, user is logged out

## Security Best Practices

### 1. Password Security

- Minimum 8 characters
- Must contain uppercase, lowercase, and number
- Passwords are hashed on the backend
- No password storage in frontend

### 2. Token Security

- Access tokens have short expiration (typically 15 minutes)
- Refresh tokens have longer expiration (typically 7 days)
- Tokens are cleared on logout
- Automatic refresh prevents session interruption

### 3. Input Validation

- All inputs are validated on both client and server
- XSS protection through proper escaping
- CSRF protection through same-origin requests

### 4. Error Handling

- No sensitive information in error messages
- Proper error logging for debugging
- User-friendly error messages

## Form Validation

### Login Form

- Email: Required, valid email format
- Password: Required, minimum 8 characters

### Registration Form

- Username: Required, 3-20 characters, alphanumeric + underscore
- Email: Required, valid email format
- Password: Required, 8+ characters with complexity
- Confirm Password: Must match password
- First Name: Required, max 50 characters
- Last Name: Required, max 50 characters

## Error Messages

The system provides clear, user-friendly error messages:

- **Validation Errors**: Field-specific validation messages
- **Network Errors**: "Network error occurred"
- **Authentication Errors**: "Session expired. Please log in again."
- **Server Errors**: Server-provided error messages

## Development Notes

### Environment Variables

- `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:8000)

### Dependencies

- React Router DOM for routing
- React Hook Form for form management
- Zod for validation
- Sonner for notifications
- Lucide React for icons

### Testing

- All components are properly typed with TypeScript
- Error boundaries can be added for additional error handling
- Mock implementations available for testing

## Future Enhancements

1. **Two-Factor Authentication**: Add 2FA support
2. **Social Login**: Google, GitHub, etc.
3. **Remember Me**: Extended session duration
4. **Password Reset**: Forgot password flow
5. **Account Verification**: Email verification
6. **Session Management**: View active sessions
7. **Audit Logging**: Track authentication events
