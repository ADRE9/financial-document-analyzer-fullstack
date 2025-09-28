# Frontend Role-Based Access Control (RBAC) Implementation

## Overview

This document describes the implementation of role-based authentication in the frontend of the Financial Document Analyzer, which supports the backend RBAC system with Admin and Viewer roles.

## Implementation Summary

### ✅ Completed Features

1. **Role-Based Type System**
2. **Authentication Context Enhancement**
3. **Role-Based Route Protection**
4. **Separate Role-Specific Home Pages**
5. **Enhanced Registration with Role Selection**
6. **Smart Navigation System**

## Architecture

### 1. Type System Updates (`src/types/api.ts`)

#### UserRole Enum

```typescript
export const UserRole = {
  ADMIN: "admin",
  VIEWER: "viewer",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
```

#### Enhanced Types

- `UserRegisterRequest` - Added optional `role` field
- `UserResponse` - Added required `role` field
- ID field changed from `number` to `string` to match MongoDB ObjectId

### 2. Role Utility Functions (`src/utils/roleUtils.ts`)

Provides centralized role checking and UI utilities:

```typescript
// Role checking
export const isAdmin = (user: UserResponse | null): boolean
export const isViewer = (user: UserResponse | null): boolean
export const hasRole = (user: UserResponse | null, role: UserRole): boolean
export const hasViewerAccess = (user: UserResponse | null): boolean
export const hasAdminAccess = (user: UserResponse | null): boolean

// UI utilities
export const getRoleDisplayName = (role: UserRole): string
export const getRoleBadgeColor = (role: UserRole): string
```

### 3. Enhanced Authentication Context

#### Updated AuthContextType

```typescript
export interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  error: string | null;
  // New role checking methods
  isAdmin: boolean;
  isViewer: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAdminAccess: boolean;
  hasViewerAccess: boolean;
}
```

#### Provider Enhancement

The `AuthProvider` now includes computed role checking properties that automatically update when the user changes.

### 4. Role-Based Route Protection (`src/components/RoleBasedRoute.tsx`)

#### Components

1. **RoleBasedRoute** - Generic role protection component

   ```typescript
   <RoleBasedRoute allowedRoles={[UserRole.ADMIN]} fallbackPath="/unauthorized">
     <AdminContent />
   </RoleBasedRoute>
   ```

2. **AdminRoute** - Admin-only protection

   ```typescript
   <AdminRoute>
     <AdminHome />
   </AdminRoute>
   ```

3. **ViewerRoute** - Viewer+ (Viewer or Admin) protection
   ```typescript
   <ViewerRoute>
     <ViewerHome />
   </ViewerRoute>
   ```

### 5. Role-Specific Pages

#### Admin Home (`src/pages/AdminHome.tsx`)

- **System Health Dashboard**: Real-time health monitoring with visual indicators
- **Admin Statistics**: Document counts, active users, processing queues
- **Admin Actions**: User management, system settings, analytics access
- **System Activity Log**: Recent system events and user activities
- **Advanced UI**: Uses Shield icon and red accent colors for admin branding

#### Viewer Home (`src/pages/ViewerHome.tsx`)

- **Minimal Interface**: Clean, simple design for viewers
- **Coming Soon States**: Placeholder for future document viewing features
- **Role Information**: Clear indication of viewer permissions
- **Future-Ready**: Structure ready for document viewing implementation

#### Unauthorized Page (`src/pages/Unauthorized.tsx`)

- **Access Denied Message**: Clear feedback for permission errors
- **User Context**: Shows current user and role information
- **Navigation Options**: Back button and role-appropriate home redirect
- **Error Guidance**: Instructions for contacting administrators

### 6. Smart Navigation (`src/pages/SmartHome.tsx`)

Intelligent routing component that:

- Detects user role on authentication
- Redirects Admin users → `/admin`
- Redirects Viewer users → `/viewer`
- Handles loading states gracefully
- Provides fallback for unknown roles

### 7. Enhanced Registration (`src/pages/Register.tsx`)

#### Role Selection

- **Optional Field**: Users can choose Admin or Viewer (defaults to Viewer)
- **Clear Descriptions**: "Viewer - View documents and analysis" vs "Administrator - Full system access"
- **Form Validation**: Integrated with existing Zod schema
- **User Guidance**: Help text explaining default behavior

#### Form Enhancement

```typescript
// Schema addition
role: z.nativeEnum(UserRole).optional(),
  (
    // Form field
    <select {...register("role")}>
      <option value="">Select account type (optional)</option>
      <option value={UserRole.VIEWER}>
        Viewer - View documents and analysis
      </option>
      <option value={UserRole.ADMIN}>Administrator - Full system access</option>
    </select>
  );
```

## Routing Architecture

### Route Structure

```
/                    → Redirect to /home
/login              → Public login page
/register           → Public registration with role selection
/home               → Smart router (detects role and redirects)
/admin              → Admin-only dashboard (AdminRoute protection)
/viewer             → Viewer+ accessible page (ViewerRoute protection)
/unauthorized       → Access denied page
/legacy-home        → Original home page (backward compatibility)
```

### Protection Layers

1. **Public Routes**: Login/Register redirect authenticated users
2. **Protected Routes**: Require authentication
3. **Role Routes**: Require specific roles with fallback pages
4. **Smart Routing**: Automatic role-based navigation

## User Experience Flow

### Registration Flow

1. User visits `/register`
2. Fills form with optional role selection
3. Backend creates user with specified role (defaults to Viewer)
4. User is automatically logged in and redirected to role-appropriate home

### Login Flow

1. User visits `/login`
2. Authenticates with credentials
3. Redirected to `/home` (smart router)
4. Smart router detects role and redirects to `/admin` or `/viewer`

### Navigation Flow

- **Admin users**: `/home` → `/admin` (full dashboard)
- **Viewer users**: `/home` → `/viewer` (simple interface)
- **Unauthorized access**: Redirected to `/unauthorized`

## UI/UX Features

### Role Indicators

- **User Badge**: Role displayed in header with color coding
  - Admin: Red badge (`bg-red-100 text-red-800`)
  - Viewer: Blue badge (`bg-blue-100 text-blue-800`)

### Visual Differentiation

- **Admin**: Shield icons, red accents, comprehensive dashboards
- **Viewer**: Eye icons, blue accents, simplified interfaces

### Responsive Design

- All pages are fully responsive
- Mobile-friendly navigation
- Consistent design language across roles

## Integration with Backend

### API Compatibility

- Frontend types match backend schemas exactly
- Role information included in JWT tokens
- User registration sends role to backend
- User responses include role information

### Authentication Flow

1. Frontend sends registration/login requests with role data
2. Backend validates and stores role information
3. JWT tokens include role for stateless authentication
4. Frontend extracts role from user data for routing decisions

## Security Considerations

### Client-Side Protection

- **Route Guards**: Prevent navigation to unauthorized pages
- **Component Protection**: Role-based component rendering
- **UI State**: Hide/show features based on user role

### Defense in Depth

- Frontend protection is UX enhancement only
- All security enforcement happens on backend
- JWT tokens contain role information for validation
- API endpoints enforce role-based access control

## Development Features

### Type Safety

- Full TypeScript coverage for role system
- Compile-time validation of role assignments
- IntelliSense support for role checking methods

### Developer Experience

- Clear separation of concerns
- Reusable role checking utilities
- Consistent patterns across components
- Easy to extend for additional roles

## Testing Considerations

### Manual Testing Scenarios

1. **Admin Registration**: Register with admin role → redirected to admin dashboard
2. **Viewer Registration**: Register with viewer role → redirected to viewer page
3. **Default Registration**: Register without role selection → defaults to viewer
4. **Role Switching**: Test navigation restrictions between roles
5. **Unauthorized Access**: Direct URL access to restricted pages

### Testing Commands

```bash
# Build verification
cd frontend && pnpm run build

# Development server
cd frontend && pnpm dev

# Type checking
cd frontend && pnpm tsc --noEmit
```

## Future Enhancements

### Planned Features

1. **Dynamic Permissions**: Fine-grained permissions beyond roles
2. **Role Management UI**: Admin interface for changing user roles
3. **Audit Logging**: Track role-based access patterns
4. **Multi-tenancy**: Organization-based role scoping

### Extension Points

1. **Additional Roles**: Easy to add new roles to UserRole enum
2. **Permission System**: Role checking utilities can be extended
3. **Custom Routes**: Role-based route components are reusable
4. **UI Themes**: Role-specific styling can be enhanced

## Troubleshooting

### Common Issues

1. **Role Not Displaying**

   - Check user object in AuthContext
   - Verify JWT token includes role information
   - Ensure backend is sending role in UserResponse

2. **Routing Loops**

   - Check SmartHome component logic
   - Verify route protection is correctly configured
   - Ensure fallback routes are properly set

3. **Permission Denied**
   - Verify user has correct role
   - Check route protection components
   - Ensure backend role validation is working

### Debug Tools

- React Developer Tools for context inspection
- Browser network tab for API responses
- Console logs in SmartHome component for routing decisions

## Conclusion

The frontend RBAC implementation provides a complete role-based user experience that seamlessly integrates with the backend authentication system. Users are automatically routed to appropriate interfaces based on their roles, with clear visual indicators and proper access controls throughout the application.

The system is designed to be:

- **User-friendly**: Clear role indicators and appropriate interfaces
- **Secure**: Multiple layers of protection with backend enforcement
- **Maintainable**: Clean separation of concerns and reusable components
- **Extensible**: Easy to add new roles and permissions
- **Type-safe**: Full TypeScript coverage for compile-time validation
