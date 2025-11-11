# Auto-Backup Feature Guide

## Overview
The Billing & Account Management System now includes an intelligent auto-backup feature that automatically creates backups of your company data based on your preferences. This ensures your data is protected without requiring manual intervention.

## Key Features

### 1. Company-Specific Backups
- ✅ Each backup contains only the selected company's data
- ✅ Other companies' data is never included in the backup
- ✅ All financial years for the selected company are included

### 2. Flexible Backup Schedules
Choose from three backup frequencies:
- **Daily**: Automatic backup once every 24 hours when data changes
- **Weekly**: Automatic backup once every 7 days when data changes
- **Manual**: No automatic backups, only manual backups via the button

### 3. Backup on Application Close
- Optionally create a backup automatically when you close the application
- Ensures your latest data is always backed up before exit
- Works independently of the scheduled backup frequency

### 4. Automatic Backup Location
- All automatic backups are saved to your Downloads folder
- Manual backups (via button) continue to work as before (browser download)
- Backup files are named: `backup_[CompanyName]_[Date].json`

## How to Use

### Accessing Auto-Backup Settings
1. Open the application
2. Select a company
3. Go to **Settings** (gear icon in sidebar)
4. Click **Auto-Backup Settings** button in the Data Management section

### Configuring Auto-Backup

#### Enable/Disable Auto-Backup
- Check the **"Enable Auto-Backup"** checkbox to activate automatic backups
- Uncheck to disable (only manual backups will be available)

#### Set Backup Frequency
Choose one of the following options:
- **Daily**: Backup will be created once per day after the first data change (after 24 hours from last backup)
- **Weekly**: Backup will be created once per week after the first data change (after 7 days from last backup)
- **Manual Only**: No automatic backups will be created

#### Backup on Close
- Check **"Backup on Application Close"** to automatically create a backup when you exit the application
- This works even if the scheduled backup isn't due yet
- Useful for ensuring you always have the latest data backed up

### Understanding Backup Timing

#### Scheduled Backups (Daily/Weekly)
- The system checks if a backup is needed every time you save data (add/edit/delete records)
- If the configured time period has elapsed since the last backup, a new backup is created automatically
- Example: If set to "Daily" and your last backup was 25 hours ago, the next save operation will trigger a backup

#### Backup on Close
- When you close the application (File > Exit or Alt+F4)
- If "Backup on Application Close" is enabled, a backup is created before the app closes
- Takes about 1-2 seconds (app waits briefly to complete the backup)

### Viewing Backup Information
The settings dialog shows:
- **Last Backup**: Timestamp of when the last backup was created
- Shows "Never" if no backup has been created yet

## Backup File Details

### What's Included in Each Backup
Each backup file contains:
- Company information (name, address, GSTIN, etc.)
- All products with categories and pricing
- All clients with opening balances
- All vendors with opening balances
- All sales invoices
- All purchases
- All payments (receipts and payments)
- All financial years with data
- Current financial year selection
- Export timestamp

### File Format
- JSON format (human-readable text)
- Can be restored using the "Restore Data" button
- Compatible with previous backup versions

### File Location
- **Automatic backups**: Saved to `C:\Users\[YourName]\Downloads\`
- **Manual backups**: Downloaded via browser (default download location)

### File Naming
Format: `backup_[CompanyName]_[YYYY-MM-DD].json`
- Example: `backup_MyCompany_2025-11-11.json`

## Best Practices

### Recommended Settings
1. **For Daily Use**: 
   - Enable Auto-Backup: ✓
   - Frequency: Daily
   - Backup on Close: ✓

2. **For Weekly Use**:
   - Enable Auto-Backup: ✓
   - Frequency: Weekly
   - Backup on Close: ✓

3. **For Manual Control**:
   - Enable Auto-Backup: ✗ (or set to Manual)
   - Use the "Backup Data" button when needed

### Storage Management
- Automatic backups accumulate in your Downloads folder
- Periodically review and delete old backups to save disk space
- Keep at least 2-3 recent backups for safety
- Consider moving important backups to a cloud storage or external drive

### Security Tips
- Backup files contain all your company data
- Store backup files in a secure location
- Consider encrypting sensitive backups
- Don't share backup files via unsecured channels

## Restoring from Backup

### To Restore a Backup
1. Go to **Settings** > Data Management
2. Click **"Restore Data"** button
3. Select the backup file (.json)
4. Confirm the restoration (⚠️ This will replace ALL current data for the company)
5. The application will reload with the restored data

### Important Notes
- Restoring replaces ALL data for the current company
- The backup must be for the same company or you'll need to switch companies
- Financial year data is restored exactly as it was when the backup was created
- You cannot merge backup data with existing data (it's a full replacement)

## Troubleshooting

### Backup Not Being Created Automatically
1. Check if Auto-Backup is enabled in settings
2. Verify the frequency is not set to "Manual"
3. Check if enough time has passed since last backup (24 hours for daily, 7 days for weekly)
4. Ensure you're making changes to data (backups trigger on save operations)

### Backup on Close Not Working
1. Verify "Backup on Application Close" is checked
2. Ensure Auto-Backup is enabled
3. Make sure the application closes normally (not force closed)
4. Check the Downloads folder for the backup file

### Cannot Find Backup Files
- Automatic backups are in: `C:\Users\[YourName]\Downloads\`
- Search for files starting with: `backup_`
- Check your browser's default download location
- Ensure you have write permissions to the Downloads folder

### Old Backup Format
- The system handles both old and new backup formats
- If restoring an old backup, financial year data will be auto-created
- No action needed - restoration is automatic

## Technical Details

### Backup Triggers
1. **Scheduled Backups**: Triggered by `saveCompanyData()` function calls
2. **Close Backups**: Triggered by `before-quit` event in Electron
3. **Manual Backups**: Triggered by clicking "Backup Data" button

### Storage
- Settings stored in browser localStorage
- Last backup timestamp tracked per-settings (not per-company)
- Backup files written to filesystem via Electron IPC

### Performance
- Backup operation is lightweight (typically < 1 second)
- No impact on application performance
- Backups run asynchronously on close

## Changelog

### Version 1.0.0 - Auto-Backup Feature
- ✅ Added auto-backup with configurable schedule
- ✅ Added backup on application close
- ✅ Company-specific backups (only current company data)
- ✅ Automatic backup location (Downloads folder)
- ✅ Last backup timestamp tracking
- ✅ Integration with existing backup/restore functionality

## Support

If you encounter any issues with the auto-backup feature:
1. Check this guide for troubleshooting steps
2. Verify your settings configuration
3. Check the Downloads folder for backup files
4. Try a manual backup to verify the feature works
5. Review application logs for error messages

---

**Note**: This feature is designed to protect your data automatically. However, it's still recommended to periodically create manual backups and store them in a secure, offsite location for additional safety.
