# Role-Based Access Control (RBAC) Implementation

## Overview

This document describes the implementation of role-based authentication in the Financial Document Analyzer backend, which provides two user roles: **Admin** and **Viewer** with different levels of access to system resources.

## System Architecture

### User Roles

1. **Admin Role (`UserRole.ADMIN`)**

   - Full access to all system features
   - Can access admin-only endpoints
   - Can perform administrative operations
   - Has all viewer permissions plus administrative privileges

2. **Viewer Role (`UserRole.VIEWER`)**
   - Read-only access to system features
   - Can view documents and analysis results
   - Cannot access admin-only functionality
   - Default role for new user registrations

## Implementation Details

### 1. Database Schema Changes

#### User Model (`app/models/user.py`)

```python
class User(BaseDocument):
    # ... existing fields ...
    role: UserRole = Field(default=UserRole.VIEWER, description="User role for access control")

    @property
    def is_admin(self) -> bool:
        """Check if user has admin role."""
        return self.role == UserRole.ADMIN

    @property
    def is_viewer(self) -> bool:
        """Check if user has viewer role."""
        return self.role == UserRole.VIEWER
```

#### Schema Updates (`app/models/schemas.py`)

```python
class UserRole(str, Enum):
    """User role enumeration for role-based access control."""
    ADMIN = "admin"
    VIEWER = "viewer"

class UserRegisterRequest(BaseModel):
    # ... existing fields ...
    role: Optional[UserRole] = Field(UserRole.VIEWER, description="User role (Admin or Viewer, defaults to Viewer)")

class UserResponse(BaseModel):
    # ... existing fields ...
    role: UserRole
```

### 2. JWT Token Enhancement

JWT tokens now include role information for stateless authentication:

```python
# Token payload includes role
access_token = create_access_token(
    data={"sub": str(user.id), "username": user.username, "role": user.role.value}
)
```

### 3. Authentication Middleware

Enhanced middleware with role-based dependency functions (`app/middleware/auth.py`):

#### Core Dependencies

- `get_current_user()` - Basic authentication
- `get_current_active_user()` - Active user check
- `get_current_admin_user()` - Admin role required
- `get_current_viewer_user()` - Viewer role or higher

#### Decorator Functions

- `require_admin()` - Admin access decorator
- `require_viewer()` - Viewer access decorator
- `require_role(role)` - Generic role requirement

### 4. Protected Route Examples

#### Admin-Only Endpoint

```python
@router.get("/admin-only")
async def admin_only_route(
    current_user: User = Depends(get_current_admin_user)
):
    # Only accessible by admin users
    pass
```

#### Viewer-Access Endpoint

```python
@router.get("/viewer-access")
async def viewer_access_route(
    current_user: User = Depends(get_current_viewer_user)
):
    # Accessible by viewers and admins
    pass
```

#### Using Decorators

```python
@router.get("/admin-with-decorator")
async def admin_route(
    current_user: User = Depends(require_admin())
):
    # Admin access using decorator pattern
    pass
```

## API Endpoints

### Authentication Endpoints

| Endpoint         | Method | Description                 | Access Level  |
| ---------------- | ------ | --------------------------- | ------------- |
| `/auth/register` | POST   | Register new user with role | Public        |
| `/auth/login`    | POST   | Login and get tokens        | Public        |
| `/auth/me`       | GET    | Get current user info       | Authenticated |

### Protected Endpoints

| Endpoint                          | Method | Required Role | Description           |
| --------------------------------- | ------ | ------------- | --------------------- |
| `/protected/hello`                | GET    | Any           | Basic auth test       |
| `/protected/user-info`            | GET    | Any           | User information      |
| `/protected/viewer-access`        | GET    | Viewer+       | Viewer content        |
| `/protected/admin-only`           | GET    | Admin         | Admin-only content    |
| `/protected/admin-with-decorator` | GET    | Admin         | Admin using decorator |

## User Registration

### Default Viewer Registration

```json
POST /auth/register
{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe"
    // role defaults to "viewer"
}
```

### Admin Registration

```json
POST /auth/register
{
    "username": "admin_user",
    "email": "admin@example.com",
    "password": "AdminPass123!",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin"
}
```

## Authentication Flow

1. **User Registration**: Users register with optional role specification (defaults to viewer)
2. **Token Generation**: JWT tokens include user ID, username, and role
3. **Request Authentication**: Middleware validates JWT and extracts user info
4. **Role Authorization**: Route dependencies check user role against requirements
5. **Access Control**: Users can only access endpoints appropriate for their role

## Security Features

### Role Validation

- Role information stored in database and JWT tokens
- Server-side validation on every request
- Automatic role checking in route dependencies

### Access Control Matrix

| Feature               | Viewer | Admin |
| --------------------- | ------ | ----- |
| View documents        | ✅     | ✅    |
| Upload documents      | ✅     | ✅    |
| View analysis results | ✅     | ✅    |
| Admin endpoints       | ❌     | ✅    |
| User management       | ❌     | ✅    |
| System configuration  | ❌     | ✅    |

### Error Handling

- **401 Unauthorized**: Invalid or missing authentication
- **403 Forbidden**: Valid authentication but insufficient role privileges
- **400 Bad Request**: Invalid request data

## Testing

### Automated Testing

Run the RBAC test script to verify implementation:

```bash
cd backend
python test_rbac.py
```

The test script verifies:

- User registration with different roles
- Access control for role-specific endpoints
- Proper error responses for unauthorized access
- JWT token role information

### Manual Testing

1. **Register Admin User**:

   ```bash
   curl -X POST http://localhost:8000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","email":"admin@test.com","password":"Test123!@#","role":"admin"}'
   ```

2. **Register Viewer User**:

   ```bash
   curl -X POST http://localhost:8000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"viewer","email":"viewer@test.com","password":"Test123!@#","role":"viewer"}'
   ```

3. **Test Admin Access**:

   ```bash
   # Get admin token from registration response
   curl -X GET http://localhost:8000/protected/admin-only \
     -H "Authorization: Bearer <admin_token>"
   ```

4. **Test Viewer Access** (should fail):
   ```bash
   # Get viewer token from registration response
   curl -X GET http://localhost:8000/protected/admin-only \
     -H "Authorization: Bearer <viewer_token>"
   ```

## Configuration

### Environment Variables

No additional environment variables required. The RBAC system uses existing JWT configuration:

- `SECRET_KEY`: JWT signing key
- `ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time

### Database Indexes

Automatically created indexes for role-based queries:

- `role` field index
- Compound index: `(role, is_active)`

## Future Enhancements

### Potential Extensions

1. **Granular Permissions**: Fine-grained permission system beyond roles
2. **Role Hierarchy**: More complex role relationships
3. **Dynamic Role Assignment**: Admin interface for role management
4. **Audit Logging**: Track role-based access patterns
5. **Resource-Based Access**: Per-document or per-project permissions

### API Extensions

1. **Role Management Endpoints**: Admin endpoints to manage user roles
2. **Permission Checking**: API to check user permissions
3. **Bulk Operations**: Admin operations on multiple users

## Troubleshooting

### Common Issues

1. **403 Forbidden on Admin Endpoints**

   - Verify user has admin role: check `/auth/me` response
   - Ensure JWT token includes role information
   - Check token is not expired

2. **Role Not Applied During Registration**

   - Verify request includes `role` field
   - Check role enum values ("admin" or "viewer")
   - Confirm database update completed

3. **Database Connection Issues**
   - Ensure MongoDB is running
   - Check database indexes are created
   - Verify user collection has role field

### Debug Steps

1. **Check User Role in Database**:

   ```python
   user = await User.find_by_username("username")
   print(f"User role: {user.role}")
   ```

2. **Verify JWT Token Content**:

   ```python
   from app.utils.jwt import decode_token
   payload = decode_token(token)
   print(f"Token role: {payload.get('role')}")
   ```

3. **Test Authentication Flow**:
   - Use `/protected/test-auth` endpoint
   - Check logs for authentication errors
   - Verify middleware is processing roles correctly

## Conclusion

The RBAC implementation provides a robust, scalable foundation for access control in the Financial Document Analyzer. The system is designed with security best practices and can be easily extended to support more complex authorization scenarios as the application grows.
