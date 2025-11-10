# Google Drive Backup Setup Guide

This guide will help you set up automatic and manual backups to Google Drive for your Billing & Account Management System.

## Overview

The Google Drive backup feature allows you to:
- **Upload backups** directly to your Google Drive
- **Restore backups** from Google Drive
- **Schedule automatic backups** (daily or weekly)
- **Organize backups** in a specific Google Drive folder
- **Manage backups** (view, download, delete old backups)

## Prerequisites

1. A Google account with Google Drive access
2. Internet connection
3. Billing & Account Management application installed

## Setup Instructions

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "Billing Backup")
4. Click "Create"

### Step 2: Enable Google Drive API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Drive API"
3. Click on "Google Drive API"
4. Click "Enable"

### Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: Choose "External" (for personal use)
   - App name: "Billing Backup App"
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue"
   - Skip the Scopes section (click "Save and Continue")
   - Add your email as a test user
   - Click "Save and Continue"
4. Back on the Credentials page:
   - Application type: Select "Desktop app"
   - Name: "Billing Desktop Client"
   - Click "Create"
5. Click "Download JSON" to download your credentials file
6. Save this file securely (you'll need it in the next step)

### Step 4: Configure Application

1. Open the Billing & Account Management application
2. Go to **Settings** tab
3. In the **Google Drive Backup** section, click "Configure Google Drive"
4. Click "Upload Credentials" and select the JSON file you downloaded
5. Click "Authenticate with Google Drive"
6. A browser window will open with Google's authorization page
7. Sign in with your Google account
8. Click "Allow" to grant permissions
9. Copy the authorization code shown
10. Paste the code in the application and click "Submit Code"

### Step 5: Configure Backup Settings (Optional)

1. **Google Drive Folder ID** (Optional):
   - Create a folder in Google Drive for your backups
   - Open the folder in your browser
   - Copy the folder ID from the URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Paste it in the "Google Drive Folder ID" field

2. **Automatic Backup Schedule**:
   - Check "Enable Automatic Backup"
   - Choose schedule: Daily or Weekly
   - Set the time for automatic backup
   - Click "Save Settings"

## Using Google Drive Backup

### Manual Backup

1. Go to **Settings** tab
2. Click **"Backup to Google Drive"**
3. Wait for the success message
4. Your backup is now stored in Google Drive!

### Restore from Google Drive

1. Go to **Settings** tab
2. Click **"Restore from Google Drive"**
3. Select the backup file you want to restore
4. Click **"Restore"**
5. Confirm the action
6. Your data will be restored and the application will reload

### Manage Backups

1. Click **"Restore from Google Drive"** to see all backups
2. View backup details (name, date, size)
3. Delete old backups using the **Delete** button

## Automatic Backup Schedule

### Daily Backup
- Set schedule to "Daily"
- Choose a time (e.g., 11:00 PM)
- Backup will run every day at that time

### Weekly Backup
- Set schedule to "Weekly"
- Choose a time
- Backup will run every Sunday at that time

**Note**: The application must be running for automatic backups to occur.

## Troubleshooting

### "Not authenticated with Google Drive"
- Re-run the authentication process in Settings
- Make sure you completed all authorization steps

### "Invalid credentials file"
- Download a new credentials JSON from Google Cloud Console
- Ensure you selected "Desktop app" as the application type

### "Failed to upload backup"
- Check your internet connection
- Verify the folder ID is correct (if specified)
- Make sure you have sufficient Google Drive storage space

### "Failed to list backups"
- Check your internet connection
- Re-authenticate if needed
- Verify folder permissions in Google Drive

## Security Notes

- **Credentials Storage**: OAuth credentials are stored locally on your computer
- **Access Tokens**: Tokens are encrypted and stored securely
- **Data Privacy**: Only your application can access the backup files
- **Revoke Access**: You can revoke access anytime from Google Account settings

## Best Practices

1. **Regular Backups**: Enable automatic daily backups
2. **Test Restores**: Periodically test restoring from backup
3. **Multiple Copies**: Keep both local and Google Drive backups
4. **Delete Old Backups**: Remove backups you no longer need
5. **Secure Credentials**: Keep your credentials JSON file safe

## Backup File Format

Backups are stored as JSON files with the naming format:
```
backup_[CompanyName]_[Date].json
```

Example: `backup_MyCompany_2024-11-10.json`

## Support

If you encounter issues:
1. Check this guide for troubleshooting steps
2. Verify your Google Cloud Console settings
3. Ensure you have the latest version of the application
4. Contact support with error details

---

**Note**: This feature requires an active internet connection to upload and download backups from Google Drive.
