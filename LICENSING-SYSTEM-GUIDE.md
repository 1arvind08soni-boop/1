# Licensing System Documentation

## Overview

This application now includes a comprehensive subscription and licensing system with the following features:

- **Product Key Activation**: Support for yearly and lifetime licenses
- **Demo Mode**: 3-day trial period without a product key
- **Multi-user License Management**: Configurable user limits per license
- **Device Binding**: Licenses are bound to specific devices to prevent sharing
- **Secure Storage**: All license data is encrypted locally
- **Offline Support**: Licenses work offline with cached validation
- **Tamper Detection**: Built-in integrity checking to prevent license tampering
- **User Management**: Admins can add/remove users and lock/unlock licenses
- **Activity Logging**: All license operations are logged for diagnostics

## Architecture

### Core Modules

1. **licenseManager.js** - Core license operations
   - Product key generation and validation
   - Device fingerprinting
   - Data encryption/decryption
   - Multi-user management
   - Integrity verification

2. **licenseStorage.js** - Persistent storage
   - Encrypted storage of license data
   - Demo data management
   - Activity logging
   - License import/export

3. **licenseValidator.js** - Validation logic
   - Startup validation
   - License activation
   - Demo mode management
   - Status checking

4. **licenseUI.js** - Frontend UI
   - Activation screens
   - Demo warnings
   - License management dialogs
   - Status indicators

5. **license.css** - UI styling

## License Types

### 1. Demo Mode
- **Duration**: 3 days from first launch
- **Features**: Full access to all features
- **Limitations**: Time-limited only
- **Conversion**: Can be upgraded to paid license anytime

### 2. Yearly License
- **Duration**: 1 year from activation
- **Features**: Full access during valid period
- **User Limit**: Configurable (1 to unlimited)
- **Renewal**: Required after expiration
- **Warnings**: Shows renewal notice 30 days before expiration

### 3. Lifetime License
- **Duration**: Permanent (no expiration)
- **Features**: Full access forever
- **User Limit**: Configurable (1 to unlimited)
- **Renewal**: Never required

## Key Features

### Product Key Format
Keys are formatted as: `XXXXX-XXXXX-XXXXX-XXXXX`

Example: `EY3BO-2V1TG-9STU0-2RPBL-H7HS1`

### Device Binding
Licenses are automatically bound to the device they're activated on using:
- CPU information
- Hostname
- Platform and architecture
- Total memory
- Hardware identifiers

This prevents license sharing across different devices.

### User/Company Binding
During activation, licenses can be optionally bound to:
- User ID
- Company ID

Once bound, the license can only be used with that specific user or company.

### Multi-user Support
Licenses support multiple users with configurable limits:
- **User Limit**: 0 = unlimited, 1+ = specific number
- **Lock Mode**: 
  - Unlocked: Anyone can use the license
  - Locked: Only assigned users can access
- **Admin Controls**: Add/remove users from license

### Security Features

1. **Encryption**
   - AES-256-CBC encryption for stored data
   - Unique encryption key per installation
   - IV (Initialization Vector) for additional security

2. **Signature Verification**
   - HMAC-SHA256 signatures on all license keys
   - Tamper detection on stored license data
   - Integrity hashing for corruption detection

3. **Device Fingerprinting**
   - Hardware-based unique identifiers
   - Prevents license sharing
   - Allows license transfer with proper authorization

4. **Offline Validation**
   - Cached license validation
   - Works without internet connection
   - Last validation timestamp tracking

## User Flows

### First Launch (No License)
1. App starts
2. License validator checks for existing license
3. No license found → Demo mode initialized
4. User sees welcome message with 3-day trial info
5. Demo countdown banner appears
6. Full app access granted for 3 days

### License Activation
1. User clicks "Activate License" or demo expires
2. Activation dialog appears
3. User enters product key
4. Optional: Bind to current company
5. System validates key
6. License saved encrypted
7. App reloads with full access

### Daily Usage (Licensed)
1. App starts
2. License validator loads and decrypts license
3. Checks expiration (if yearly)
4. Verifies device fingerprint
5. Updates last validation timestamp
6. Shows renewal warning if expiring soon (30 days)
7. Grants app access

### Demo Expiration
1. Demo period ends (3 days elapsed)
2. On next startup, activation required
3. Activation screen blocks app usage
4. User must enter valid product key to continue

### License Renewal (Yearly)
1. License approaching expiration (30 days)
2. Warning banner appears
3. User contacts support for renewal key
4. Deactivates old license
5. Activates new license with extended expiration

## API Reference

### Main Process (Electron)

```javascript
// Validate license on startup
ipcMain.handle('license:validate-on-startup', async (event, options) => {
  return licenseValidator.validateOnStartup(options);
});

// Activate license
ipcMain.handle('license:activate', async (event, productKey, bindingData) => {
  return licenseValidator.activateLicense(productKey, bindingData);
});

// Get license status
ipcMain.handle('license:get-status', async (event) => {
  return licenseValidator.getLicenseStatus();
});

// Add/remove users
ipcMain.handle('license:add-user', async (event, userId) => { ... });
ipcMain.handle('license:remove-user', async (event, userId) => { ... });

// Lock/unlock license
ipcMain.handle('license:toggle-lock', async (event) => { ... });
```

### Renderer Process (Browser)

```javascript
// Initialize license UI on app load
LicenseUIManager.initialize();

// Show license management dialog
LicenseUIManager.showLicenseManagement();

// Show activation dialog
LicenseUIManager.showActivationDialog();

// Check validation result
if (validation.canUseApp) {
  // Allow app usage
} else {
  // Block app and show activation screen
}
```

## Testing

### Generate Test Keys

Run the key generator:
```bash
node licensing/generateKey.js
```

This generates several test keys:
1. Yearly license (5 users, 1 year)
2. Lifetime license (unlimited users)
3. Single-user yearly license
4. Test lifetime license (no binding)

### Test Scenarios

1. **First Launch**
   - Delete any existing license data
   - Launch app
   - Verify demo mode activates
   - Check 3-day countdown

2. **License Activation**
   - Generate a test key
   - Click "Activate License"
   - Enter the key
   - Verify activation success

3. **Demo Expiration**
   - Manually set demo start date to 4 days ago in storage
   - Restart app
   - Verify activation screen blocks app

4. **Device Binding**
   - Activate license on one device
   - Copy license file to another device
   - Verify device mismatch error

5. **License Expiration**
   - Generate yearly key with past expiration
   - Activate the key
   - Verify expiration error

## File Locations

### License Data
- **Windows**: `%APPDATA%\billing-management-system\license.dat`
- **macOS**: `~/Library/Application Support/billing-management-system/license.dat`
- **Linux**: `~/.config/billing-management-system/license.dat`

### Demo Data
- Same directory as license data: `demo.dat`

### Activity Logs
- Same directory as license data: `license.log`

## Security Considerations

1. **Encryption Key**: The default encryption key is derived from a seed string. In production, use environment variables or secure key management.

2. **Key Generation**: The `generateKey.js` utility is for testing only. In production, use a secure server-side key generation service.

3. **Online Validation**: The system currently supports offline validation only. For production, implement periodic online validation to verify license status with a server.

4. **Key Storage**: Never commit generated keys to version control. Keep production keys secure and separate from the codebase.

5. **Tamper Detection**: While the system includes integrity checking, determined attackers may still attempt to bypass protections. Consider additional measures for high-value applications.

## Troubleshooting

### License Not Loading
- Check if license.dat file exists in userData directory
- Verify file permissions
- Check license.log for error messages

### Invalid License Error
- Verify the product key was entered correctly
- Check if license has expired (yearly licenses)
- Ensure device fingerprint hasn't changed significantly

### Demo Not Starting
- Check if demo.dat exists and is not corrupted
- Clear demo.dat to reinitialize demo mode
- Check for tampering detection in logs

### User Cannot Access Licensed App
- Verify license is not locked
- If locked, check if user is in assigned users list
- Contact license admin to add user

## Administration

### View License Status
1. Open app
2. Click Settings or Help menu
3. Select "License Management"
4. View status, expiration, and user information

### Manage Users
1. Open "License Management"
2. View current assigned users
3. Add new users by ID
4. Remove users as needed
5. Toggle lock mode to restrict access

### View Activity Logs
1. Open "License Management"
2. Click "View Logs"
3. Review activation attempts, errors, and validations

### Export License
1. Open "License Management"
2. Click "Export License"
3. Save backup for license recovery or transfer

### Import License
1. Open "License Management"
2. Click "Import License"
3. Select previously exported license file
4. Verify activation

## Future Enhancements

Potential improvements for the licensing system:

1. **Online Validation**: Periodic server checks for license status
2. **License Server**: Centralized license management backend
3. **Payment Integration**: Stripe/PayPal for automatic license purchases
4. **Grace Period**: Allow limited access after expiration
5. **License Transfer**: Formal transfer process between devices
6. **Tiered Plans**: Feature restrictions based on license tier
7. **Usage Analytics**: Track feature usage per license
8. **Auto-renewal**: Automatic subscription renewals
9. **License Pools**: Floating licenses for enterprise customers
10. **Audit Trail**: Comprehensive audit logs for compliance

## Support

For licensing issues:
1. Check the license.log file for error details
2. Verify product key format and validity
3. Ensure system date/time is correct
4. Contact support with license logs and error messages

---

**Version**: 1.0.0  
**Last Updated**: November 2024
