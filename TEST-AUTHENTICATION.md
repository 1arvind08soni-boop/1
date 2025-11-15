# Authentication System Testing Guide

This guide helps you test the multi-user authentication system.

## Test Scenarios

### 1. Initial Setup and Login

**Test Case 1.1: First Time User**
1. Launch the application
2. You should see the Login screen
3. Click "Create one" link to add a new company
4. Fill in company details and create the company
5. Note the default credentials shown: admin / admin123
6. Login with these credentials
7. ✓ Expected: Successfully logged in and redirected to dashboard

**Test Case 1.2: Login with Invalid Credentials**
1. Launch the application
2. Enter wrong username or password
3. ✓ Expected: Error message "Invalid username or password"

**Test Case 1.3: Login with Disabled User**
1. Admin creates a user and disables it
2. Try to login with disabled user credentials
3. ✓ Expected: Error message about disabled user

### 2. User Management (Admin/Manager Only)

**Test Case 2.1: Create Staff User**
1. Login as Admin
2. Navigate to Settings → User Management
3. Click "Add User"
4. Fill in details:
   - Username: staff1
   - Full Name: Staff User One
   - Email: staff1@example.com
   - Role: Staff
   - Password: staff123
5. Click "Add User"
6. ✓ Expected: User created successfully, appears in user list

**Test Case 2.2: Create Manager User**
1. Login as Admin
2. Navigate to Settings → User Management
3. Create a manager user with similar steps
4. ✓ Expected: Manager user created successfully

**Test Case 2.3: Edit User**
1. Login as Admin
2. Navigate to Settings → User Management
3. Click Edit on a user (not default admin)
4. Change full name and role
5. Save changes
6. ✓ Expected: User updated successfully

**Test Case 2.4: Disable/Enable User**
1. Login as Admin
2. Navigate to Settings → User Management
3. Click Disable on a user
4. ✓ Expected: User status changes to "Disabled"
5. Click Enable
6. ✓ Expected: User status changes to "Active"

**Test Case 2.5: Change Password**
1. Login as Admin
2. Navigate to Settings → User Management
3. Click the key icon for any user
4. Enter new password and confirm
5. ✓ Expected: Password changed successfully
6. Logout and login with new password
7. ✓ Expected: Login successful with new password

### 3. Staff User Permissions (Limited Access)

**Test Case 3.1: Staff Can View Dashboard**
1. Login as Staff user
2. ✓ Expected: Dashboard is visible with statistics

**Test Case 3.2: Staff Can View Products (Read-Only)**
1. Login as Staff user
2. Navigate to Products
3. ✓ Expected: 
   - Products list is visible
   - "Add Product" button is HIDDEN
   - Edit/Delete buttons show "View Only" instead

**Test Case 3.3: Staff Can View Clients (Read-Only)**
1. Login as Staff user
2. Navigate to Clients
3. ✓ Expected:
   - Clients list is visible
   - "Add Client" button is HIDDEN
   - Only "Ledger" button visible, no Edit/Delete

**Test Case 3.4: Staff Can Create Invoices**
1. Login as Staff user
2. Navigate to Sales Invoice
3. Click "New Invoice" (should be visible)
4. Create an invoice
5. ✓ Expected: Invoice created successfully

**Test Case 3.5: Staff Cannot Edit/Delete Invoices**
1. Login as Staff user
2. Navigate to Sales Invoice
3. ✓ Expected:
   - View and Print buttons visible
   - Edit and Delete buttons HIDDEN

**Test Case 3.6: Staff Cannot Access Purchases**
1. Login as Staff user
2. Check sidebar
3. ✓ Expected: "Purchase" menu item is HIDDEN

**Test Case 3.7: Staff Cannot Access Payments**
1. Login as Staff user
2. Check sidebar
3. ✓ Expected: "Payments" menu item is HIDDEN

**Test Case 3.8: Staff Cannot Access Goods Return**
1. Login as Staff user
2. Check sidebar
3. ✓ Expected: "Goods Return" menu item is HIDDEN

**Test Case 3.9: Staff Cannot Access Settings**
1. Login as Staff user
2. Check sidebar
3. ✓ Expected: "Settings" menu item is HIDDEN

**Test Case 3.10: Staff Can View Reports (Read-Only)**
1. Login as Staff user
2. Navigate to Reports
3. Click any report
4. ✓ Expected: Report displays correctly

### 4. Admin/Manager Permissions (Full Access)

**Test Case 4.1: Admin Can Manage Products**
1. Login as Admin
2. Navigate to Products
3. ✓ Expected: 
   - "Add Product" button visible
   - Edit and Delete buttons visible for all products

**Test Case 4.2: Admin Can Manage Clients**
1. Login as Admin
2. Navigate to Clients
3. ✓ Expected:
   - "Add Client" button visible
   - Edit and Delete buttons visible

**Test Case 4.3: Admin Can Manage Invoices**
1. Login as Admin
2. Navigate to Sales Invoice
3. ✓ Expected:
   - All buttons visible (View, Print, Edit, Delete)
   - Can edit and delete invoices

**Test Case 4.4: Admin Can Access Purchases**
1. Login as Admin
2. Navigate to Purchase
3. ✓ Expected:
   - Screen accessible
   - "New Purchase" button visible

**Test Case 4.5: Admin Can Access Payments**
1. Login as Admin
2. Navigate to Payments
3. ✓ Expected:
   - Screen accessible
   - "Add Payment" button visible

**Test Case 4.6: Admin Can Access Settings**
1. Login as Admin
2. Navigate to Settings
3. ✓ Expected:
   - All settings sections visible
   - User Management available

### 5. Company Data Isolation

**Test Case 5.1: User Can Only Access Own Company**
1. Create Company A with Admin A
2. Create Company B with Admin B
3. Login as Admin A
4. ✓ Expected: Only see Company A's data
5. Logout and login as Admin B
6. ✓ Expected: Only see Company B's data

**Test Case 5.2: Users Belong to One Company**
1. Login as Admin
2. Create a user
3. ✓ Expected: User automatically associated with current company
4. User cannot access other companies

### 6. Security Tests

**Test Case 6.1: Password Encryption**
1. Create a user
2. Check localStorage in browser DevTools
3. ✓ Expected: Password stored as hash, not plain text

**Test Case 6.2: Permission Validation**
1. Login as Staff
2. Try to directly call admin functions in console (if possible)
3. ✓ Expected: Permission checks prevent unauthorized operations

**Test Case 6.3: Logout Clears Session**
1. Login as any user
2. Navigate to a screen
3. Click Logout
4. ✓ Expected:
   - Redirected to login screen
   - Must login again to access system

### 7. UI Display Tests

**Test Case 7.1: User Info in Sidebar**
1. Login as any user
2. Check sidebar header
3. ✓ Expected:
   - Company name displayed
   - Financial year displayed
   - User name and role displayed

**Test Case 7.2: Role Badge Display**
1. Login as different role users
2. Check user management screen
3. ✓ Expected:
   - Roles displayed with colored badges
   - Admin: blue
   - Manager: green
   - Staff: info/cyan

## Known Limitations for Testing

Since this is an Electron app, full testing requires:
- Running `npm start` or building the app
- Cannot run in command-line only environment
- Requires GUI environment for complete testing

## Quick Test Setup

1. Build and run the app:
   ```bash
   npm install
   npm start
   ```

2. Create a test company:
   - Company Name: Test Corp
   - Add basic details
   
3. Login with default admin:
   - Username: admin
   - Password: admin123

4. Create test users:
   - Staff: staff1 / staff123
   - Manager: manager1 / manager123

5. Test permission scenarios with different users

## Regression Testing

After any changes to the authentication system, verify:
- [ ] Login still works
- [ ] User creation works
- [ ] Permission checks function correctly
- [ ] Company data isolation maintained
- [ ] UI updates based on role
- [ ] Logout clears session properly

## Bug Reports

If you find issues, document:
1. User role being tested
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Screenshot if applicable
