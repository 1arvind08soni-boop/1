# Auto-Backup Quick Start Guide

## Overview
This guide will help you quickly set up and start using the auto-backup feature in just a few minutes.

## Quick Setup (2 Minutes)

### Step 1: Open Settings
1. Launch the Billing & Account Management application
2. Select or create a company (if you haven't already)
3. Click the **⚙️ Settings** icon in the left sidebar

### Step 2: Access Auto-Backup Settings
1. In the Settings page, find the **Data Management** section
2. Click the **🕐 Auto-Backup Settings** button
3. The Auto-Backup Settings dialog will open

### Step 3: Configure Your Preferences

#### For Most Users (Recommended)
Simply check these three boxes:
- ✅ **Enable Auto-Backup**
- ✅ Set **Backup Frequency** to **Daily**
- ✅ **Backup on Application Close**

Then click **Save Settings**.

#### Advanced Configuration
Customize based on your needs:

**Enable Auto-Backup**: Check to activate automatic backups
- Unchecked = Manual backups only
- Checked = Automatic backups active

**Backup Frequency**: Choose when automatic backups occur
- **Daily**: Backup once every 24 hours (recommended for active use)
- **Weekly**: Backup once every 7 days (good for occasional use)
- **Manual Only**: No automatic backups (you control when to backup)

**Backup on Application Close**: Check to backup on exit
- Ensures latest data is always saved before you close the app
- Recommended for all users

### Step 4: Verify It's Working
After saving settings:
1. Make a change to your data (add a product, client, or invoice)
2. Close and reopen the application
3. Check your **Downloads** folder
4. Look for a file named: `backup_[YourCompanyName]_[Date].json`

## Understanding Backups

### When Do Backups Happen?

#### Daily Backups
- Triggered **24 hours after the last backup**
- Only happens when you **save data** (add/edit/delete records)
- Example: Last backup was Monday 9 AM, next backup will occur Tuesday 9 AM or later when you save something

#### Weekly Backups
- Triggered **7 days after the last backup**
- Only happens when you **save data**
- Example: Last backup was Monday, next backup will occur next Monday or later when you save something

#### Backup on Close
- Happens **every time you close the app** (if enabled)
- Independent of daily/weekly schedule
- Always creates a backup before exit

### Where Are Backups Saved?

**Automatic Backups**:
- Location: `C:\Users\[YourUserName]\Downloads\`
- Filename: `backup_[CompanyName]_[YYYY-MM-DD].json`
- Example: `backup_MyCompany_2025-11-11.json`

**Manual Backups** (via Backup Data button):
- Location: Your browser's default download folder
- Same filename format

## Common Use Cases

### I Use This Daily
✅ Enable Auto-Backup  
✅ Frequency: **Daily**  
✅ Backup on Close  

**Result**: Backup created once per day when you work + backup when you close the app

### I Use This Weekly
✅ Enable Auto-Backup  
✅ Frequency: **Weekly**  
✅ Backup on Close  

**Result**: Backup created once per week when you work + backup when you close the app

### I Want Full Control
❌ Enable Auto-Backup (unchecked) OR set Frequency to **Manual Only**  

**Result**: Use the "Backup Data" button in Settings whenever you want to create a backup

### I Want Backup Only on Close
✅ Enable Auto-Backup  
✅ Frequency: **Manual Only**  
✅ Backup on Close  

**Result**: Backup only created when you close the application

## Tips & Tricks

### Tip 1: Check Your Last Backup
Open Auto-Backup Settings to see when the last backup was created

### Tip 2: Manage Old Backups
- Backups accumulate in your Downloads folder
- Periodically delete old backups to save disk space
- Keep at least 2-3 recent backups for safety

### Tip 3: Store Important Backups Safely
- Copy important backups to:
  - External hard drive
  - USB drive
  - Cloud storage (Google Drive, OneDrive, Dropbox)
- Rename them so you know which is which

### Tip 4: Each Company Has Its Own Backups
- When you backup, only the **current company's** data is saved
- To backup multiple companies, select each one and create a backup
- Each backup file is independent

## Troubleshooting

### "I don't see any backups in my Downloads folder"
1. Check if Auto-Backup is enabled
2. Make sure enough time has passed (24 hours for daily, 7 days for weekly)
3. Confirm you've saved some data after enabling
4. Try closing and reopening the app (if "Backup on Close" is enabled)

### "I want to create a backup right now"
Use the **Backup Data** button in Settings > Data Management for immediate manual backup

### "I want to restore from a backup"
1. Go to Settings > Data Management
2. Click **Restore Data**
3. Select your backup file
4. Confirm (⚠️ this replaces current data)

## Next Steps

Now that you have auto-backup set up:
1. Continue using the application normally
2. Your data will be backed up automatically based on your settings
3. Periodically check your Downloads folder to confirm backups are being created
4. Read the full [Auto-Backup Guide](AUTO-BACKUP-GUIDE.md) for advanced features

## Need Help?

- 📖 See [Auto-Backup Guide](AUTO-BACKUP-GUIDE.md) for detailed information
- 📖 See [README.md](README.md) for general application information
- Check the "Last Backup" field in Auto-Backup Settings to verify it's working

---

**Remember**: Auto-backup protects your data automatically, but it's still good practice to occasionally copy important backups to a safe external location!
