# License System Quick Start Guide

## Overview

This application now includes a comprehensive licensing system that manages product activation, trial periods, and multi-user licenses.

## For End Users

### First Launch - Demo Mode

When you launch the application for the first time:

1. You'll see a welcome message indicating you have a **3-day trial period**
2. A banner at the top shows the remaining days
3. You have full access to all features during the trial
4. After 3 days, you'll need to activate a license to continue

### Activating Your License

1. **During Trial**: Click "Activate License" button on the demo banner
2. **After Trial Expires**: The activation screen will appear automatically
3. Enter your product key (format: `xxxxx-xxxxx-xxxxx-...`)
4. Optionally check "Bind to current company" to restrict the license to your company data
5. Click "Activate License"
6. The application will reload with your activated license

### License Types

- **Yearly License**: Valid for one year from activation, includes renewal warnings 30 days before expiration
- **Lifetime License**: Never expires, permanent access to the application
- **Single-User**: Bound to a specific user account
- **Multi-User**: Supports multiple users (configurable limit)

### Managing Your License

Access license management from the Settings or Help menu:

1. **View Status**: See license type, expiration date, and user information
2. **View Logs**: Check activation history and any errors
3. **Export License**: Save a backup for recovery or transfer
4. **Deactivate**: Remove current license (requires re-activation)

## For Administrators

### Generating License Keys

If you're an administrator generating keys:

```bash
node licensing/generateKey.js
```

This will generate sample keys for testing. For production, implement a secure server-side key generation service.

### Multi-User Management

For licenses with multiple users:

1. **Unlocked Mode** (default): Any user can access the application
2. **Locked Mode**: Only assigned users can access

To manage users (via IPC handlers):
```javascript
// Add user to license
await window.electronAPI.license.addUser('user@example.com');

// Remove user from license
await window.electronAPI.license.removeUser('user@example.com');

// Toggle lock status
await window.electronAPI.license.toggleLock();
```

### License Types Configuration

When generating keys, specify:

```javascript
{
  type: 'yearly' | 'lifetime',
  userId: 'optional-user-id',      // Bind to specific user
  companyId: 'optional-company-id', // Bind to specific company
  userLimit: 0,                     // 0 = unlimited, >0 = specific limit
  expirationDate: Date              // For yearly licenses
}
```

## For Developers

### Testing the License System

Run the comprehensive test suite:
```bash
node test-licensing.js
```

See all features in action:
```bash
node demo-licensing.js
```

Generate test keys:
```bash
node licensing/generateKey.js
```

### Integration Points

The licensing system is automatically integrated into the app:

1. **Startup Check**: `app.js` initializes licensing on `DOMContentLoaded`
2. **License API**: Available via `window.electronAPI.license.*`
3. **UI Components**: Automatically displayed based on license status
4. **IPC Handlers**: Defined in `main.js` for all license operations

### Key Features

✅ **Product Key Activation**
- Support for yearly and lifetime licenses
- Secure validation with HMAC-SHA256 signatures
- Device binding prevents unauthorized sharing

✅ **Demo Mode**
- 3-day trial period without activation
- Tamper-protected demo start date
- Automatic expiration enforcement

✅ **Multi-User Licenses**
- Configurable user limits
- Add/remove users dynamically
- Lock/unlock modes for access control

✅ **Security**
- AES-256-CBC encryption for stored data
- Device fingerprinting for binding
- Integrity verification prevents tampering
- Offline validation with cached licenses

✅ **User Experience**
- Clear activation flows
- Demo countdown warnings
- Renewal notifications (30 days)
- License management dashboard
- Activity logging

### File Structure

```
licensing/
├── licenseManager.js      # Core license operations
├── licenseStorage.js      # Encrypted storage & logging
├── licenseValidator.js    # Validation & activation
├── licenseUI.js           # Frontend UI components
├── license.css            # UI styling
└── generateKey.js         # Key generation utility
```

### Data Storage Locations

- **Windows**: `%APPDATA%\billing-management-system\`
- **macOS**: `~/Library/Application Support/billing-management-system/`
- **Linux**: `~/.config/billing-management-system/`

Files:
- `license.dat` - Encrypted license data
- `demo.dat` - Encrypted demo data
- `license.log` - Activity logs

## Troubleshooting

### License Won't Activate

**Error: Invalid product key**
- Check that the key is entered correctly (copy-paste recommended)
- Verify the key format matches the expected pattern
- Ensure no extra spaces or characters

**Error: License is bound to a different user/company**
- The key is restricted to a specific user or company
- Contact support for a new key or to transfer the license

**Error: License has expired**
- Yearly license has reached its expiration date
- Contact support to renew your license

### Demo Not Working

**Demo doesn't start**
- Check if `demo.dat` file exists in the app data directory
- Clear the file and restart to reinitialize demo mode

**Demo expired immediately**
- System date/time may be incorrect
- Demo data may have been tampered with
- Clear demo data and restart for a fresh trial

### App Won't Start After Activation

**License validation fails**
- Check `license.log` file for error details
- Verify license file hasn't been corrupted
- Try deactivating and re-activating the license

**Device mismatch error**
- License was activated on a different device
- Significant hardware changes may trigger this
- Contact support for license transfer

## Support

For licensing issues:

1. Check the activity logs: `license.log` in app data directory
2. Review this guide and the detailed documentation
3. Contact support with:
   - License key (first/last 5 characters only)
   - Error message from logs
   - System information (OS, version)

## Security Notes

⚠️ **Important**:
- Keep your license key secure
- Don't share keys across different devices
- Export and backup your license regularly
- Never commit license files to version control

## Next Steps

1. ✅ Launch the application
2. ✅ Try the 3-day demo or activate your license
3. ✅ Explore all features
4. ✅ Check license status in settings
5. ✅ Export license backup for safekeeping

---

**For detailed technical documentation**, see [LICENSING-SYSTEM-GUIDE.md](LICENSING-SYSTEM-GUIDE.md)
