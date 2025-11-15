# Roles and Permissions Matrix

## Overview
This document defines the user roles and their respective permissions in the Billing & Account Management System. The system implements role-based access control (RBAC) to ensure data security and appropriate access levels for different user types.

## User Roles

### 1. Admin / Manager
**Description**: Full system access with all administrative privileges

**Users per Company**: Minimum 1 (default admin), Maximum unlimited

**Key Responsibilities**:
- Complete system administration
- User management and access control
- Full data management capabilities
- System configuration and settings

### 2. Staff
**Description**: Limited access focused on day-to-day billing operations

**Users per Company**: 2-3 recommended (as per requirements)

**Key Responsibilities**:
- Create and view sales invoices
- View reports (read-only)
- Basic billing operations

## Permission Matrix

| Feature / Operation | Admin | Manager | Staff |
|---------------------|:-----:|:-------:|:-----:|
| **Dashboard** |
| View Dashboard | ✓ | ✓ | ✓ |
| View Statistics | ✓ | ✓ | ✓ |
| **Products** |
| View Products | ✓ | ✓ | ✓ |
| Add Products | ✓ | ✓ | ✗ |
| Edit Products | ✓ | ✓ | ✗ |
| Delete Products | ✓ | ✓ | ✗ |
| **Clients** |
| View Clients | ✓ | ✓ | ✓ |
| Add Clients | ✓ | ✓ | ✗ |
| Edit Clients | ✓ | ✓ | ✗ |
| Delete Clients | ✓ | ✓ | ✗ |
| **Vendors** |
| View Vendors | ✓ | ✓ | ✓ |
| Add Vendors | ✓ | ✓ | ✗ |
| Edit Vendors | ✓ | ✓ | ✗ |
| Delete Vendors | ✓ | ✓ | ✗ |
| **Sales Invoices** |
| View Invoices | ✓ | ✓ | ✓ |
| Create Invoices | ✓ | ✓ | ✓ |
| Edit Invoices | ✓ | ✓ | ✗ |
| Delete Invoices | ✓ | ✓ | ✗ |
| Print Invoices | ✓ | ✓ | ✓ |
| **Purchases** |
| View Purchases | ✓ | ✓ | ✗ |
| Add Purchases | ✓ | ✓ | ✗ |
| Edit Purchases | ✓ | ✓ | ✗ |
| Delete Purchases | ✓ | ✓ | ✗ |
| **Payments** |
| View Payments | ✓ | ✓ | ✗ |
| Add Payments | ✓ | ✓ | ✗ |
| Edit Payments | ✓ | ✓ | ✗ |
| Delete Payments | ✓ | ✓ | ✗ |
| **Goods Returns** |
| View Goods Returns | ✓ | ✓ | ✗ |
| Add Goods Returns | ✓ | ✓ | ✗ |
| Edit Goods Returns | ✓ | ✓ | ✗ |
| Delete Goods Returns | ✓ | ✓ | ✗ |
| **Reports** |
| View All Reports | ✓ | ✓ | ✓ (View Only) |
| Export Data | ✓ | ✓ | ✓ |
| **Settings** |
| User Management | ✓ | ✓ | ✗ |
| Company Settings | ✓ | ✓ | ✗ |
| Template Settings | ✓ | ✓ | ✗ |
| Financial Year Management | ✓ | ✓ | ✗ |
| Backup/Restore | ✓ | ✓ | ✗ |
| Auto-Backup Settings | ✓ | ✓ | ✗ |

## Access Control Implementation

### UI Level
- Navigation menu items are dynamically shown/hidden based on user role
- Action buttons (Add, Edit, Delete) are conditionally displayed
- Staff users see a simplified interface with only necessary options

### Backend/API Level
- All operations check user permissions before execution
- Permission denied operations show appropriate error messages
- Functions use `checkPermission()` to validate access rights

## Company Data Segmentation

### Isolation Rules
1. **User-Company Association**: Each user is associated with exactly one company
2. **Data Access**: Users can only access data from their assigned company
3. **Login Restriction**: Users cannot switch to other companies without proper authentication
4. **Storage Isolation**: Company data is stored separately using company-specific keys

### Implementation
- User authentication validates company association
- Data loading filters by current user's company ID
- All CRUD operations verify company ownership
- Logout clears both user and company context

## User Management

### Default Admin User
When a new company is created:
- Username: `admin`
- Password: `admin123`
- Role: Admin
- **Important**: Change password after first login

### Adding Users (Admin/Manager Only)
1. Navigate to Settings → User Management
2. Click "Add User"
3. Fill in user details:
   - Username (unique)
   - Full Name
   - Email (optional)
   - Role (Staff/Manager/Admin)
   - Password (minimum 6 characters)
4. User is automatically associated with current company

### Managing Users
- **Edit User**: Update user details and role
- **Disable/Enable**: Temporarily restrict access without deleting
- **Change Password**: Reset user passwords
- **Cannot Delete**: Default admin user (can be disabled)

## Password Security

### Encryption
- Passwords are hashed using a salt-based algorithm
- Plain text passwords are never stored
- Password verification compares hashed values

### Password Requirements
- Minimum length: 6 characters
- Must be confirmed during creation/change
- Unique per user

### Best Practices
1. Change default admin password immediately
2. Use strong, unique passwords
3. Regularly update passwords
4. Don't share credentials

## Authentication Flow

```
1. User opens application
   ↓
2. Login screen displayed
   ↓
3. User enters username & password
   ↓
4. System validates credentials
   ↓
5. System checks user status (not disabled)
   ↓
6. User company is loaded
   ↓
7. UI adjusted based on user role
   ↓
8. User accesses permitted features
```

## Logout Process

When user logs out:
1. Current user context is cleared
2. Current company context is cleared
3. Application returns to login screen
4. User must re-authenticate to access system

## Security Considerations

### Access Control
- ✓ Role-based permissions enforced
- ✓ UI and backend validation
- ✓ Company data isolation
- ✓ Password encryption

### Data Protection
- ✓ User can only access their company's data
- ✓ Unauthorized operations blocked with error messages
- ✓ Session management prevents unauthorized access

### Audit Trail
Future enhancement: Consider adding:
- User action logging
- Login/logout tracking
- Data modification history
- Failed login attempts monitoring

## Troubleshooting

### Cannot Login
- Verify username and password
- Check if user account is disabled
- Ensure company still exists
- Contact administrator to reset password

### Permission Denied
- Verify your role has required permissions
- Check permission matrix above
- Contact administrator for role change if needed

### Cannot See Menu Items
- Normal for Staff users (limited access)
- Menu displays only permitted features
- Contact administrator if access needed

## Version History

- **v1.0.0** - Initial role-based access control implementation
  - Three user roles (Admin, Manager, Staff)
  - Complete permission matrix
  - Company data segmentation
  - Secure authentication system
