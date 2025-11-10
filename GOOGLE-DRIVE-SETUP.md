# Google Drive Backup Setup Guide

This guide will help you set up automatic and manual backups to Google Drive for your Billing & Account Management System.

## Overview

The Google Drive backup feature allows you to:
- **Upload backups** directly to your Google Drive
- **Restore backups** from Google Drive
- **Schedule automatic backups** (daily or weekly)
- **Organize backups** in a specific Google Drive folder (optional)
- **Manage backups** (view, download, delete old backups)

## Prerequisites

1. A Google account with Google Drive access
2. Internet connection
3. Billing & Account Management application installed

## Quick Setup (5 Minutes)

### For End Users (Simplified Process):

**Note:** The app comes with pre-configured credentials. However, for the app to work, the developer needs to set up the Google Cloud credentials first. See the "Developer Setup" section below.

1. **Open the application**
2. Go to **Settings** tab
3. Click **"Configure Google Drive"**
4. Click the big **"Sign in with Google"** button
5. Sign in with your Google account in the browser
6. Click "Allow" to authorize the app
7. Copy the authorization code shown
8. Paste it in the app prompt
9. **Done!** ✅

That's it! Now you can:
- Click "Backup to Google Drive" for instant backup
- Enable automatic daily/weekly backups
- Restore data anytime

---

## Developer Setup (One-Time Configuration)

**Important:** If you're distributing this app, you need to configure the OAuth2 credentials once in the source code.

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
   - User Type: Choose "External" (for general use)
   - App name: "Billing Backup App"
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue"
   - Skip the Scopes section (click "Save and Continue")
   - Add test users if needed (or leave empty for production)
   - Click "Save and Continue"
4. Back on the Credentials page:
   - Application type: Select **"Desktop app"**
   - Name: "Billing Desktop Client"
   - Click "Create"
5. You'll see your Client ID and Client Secret

### Step 4: Configure the Application

Open `main.js` in your code editor and find the `DEFAULT_CREDENTIALS` section (around line 344):

```javascript
const DEFAULT_CREDENTIALS = {
    installed: {
        client_id: "YOUR_CLIENT_ID_HERE.apps.googleusercontent.com",
        project_id: "billing-backup",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_secret: "YOUR_CLIENT_SECRET_HERE",
        redirect_uris: ["http://localhost"]
    }
};
```

Replace:
- `YOUR_CLIENT_ID_HERE.apps.googleusercontent.com` with your actual Client ID
- `YOUR_CLIENT_SECRET_HERE` with your actual Client Secret

Save the file and rebuild the app:
```bash
npm run build
```

Now your app is ready for distribution with simplified Google Drive integration!

---

## Using Google Drive Backup

### First-Time Setup (For Users)

1. Open app → **Settings** tab
2. Click **"Configure Google Drive"**
3. Click **"Sign in with Google"** button
4. Authorize in your browser
5. Copy and paste the authorization code
6. Done!

### Configure Backup Settings (Optional)

After signing in, you can configure:

1. **Google Drive Folder ID** (Optional):
   - Create a folder in Google Drive for your backups
   - Open the folder in your browser
   - Copy the folder ID from the URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Paste it in the settings

2. **Automatic Backup Schedule**:
   - Check "Enable Automatic Backup"
   - Choose schedule: Daily or Weekly (Sunday)
   - Set the time for automatic backup
   - Click "Save Settings"

### Manual Backup

1. Go to **Settings** tab
2. Click **"Backup to Google Drive"**
3. Wait for the success message
4. Your backup is now in Google Drive!

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

---

## Troubleshooting

### "Not Connected"
- Click "Sign in with Google" and complete the authorization
- Make sure you completed all steps

### "Failed to upload backup"
- Check your internet connection
- Verify the folder ID is correct (if specified)
- Make sure you have sufficient Google Drive storage space
- Try signing in again

### "Failed to list backups"
- Check your internet connection
- Re-authenticate if needed
- Verify folder permissions in Google Drive

### For Developers: "Invalid credentials"
- Make sure you replaced the placeholder values in `main.js`
- Verify you're using a Desktop app OAuth client
- Check that the credentials are properly formatted

---

## Security Notes

- **OAuth2 Authentication**: Industry-standard secure authentication
- **Your Data**: Stays in your own Google Drive account
- **Privacy**: Only you can access your backups
- **Credentials**: Embedded in the app (for distribution) or can be customized
- **Revoke Access**: You can revoke access anytime from Google Account settings

---

## Best Practices

1. **Regular Backups**: Enable automatic daily backups
2. **Test Restores**: Periodically test restoring from backup
3. **Multiple Copies**: Keep both local and Google Drive backups
4. **Delete Old Backups**: Remove backups you no longer need to save space
5. **Secure Folder**: Use a dedicated folder for organized backups

---

## Advanced: Custom OAuth Credentials

If you want to use your own OAuth credentials (instead of the embedded ones):

1. Follow the "Developer Setup" steps above
2. Download the credentials JSON file from Google Cloud Console
3. In the app, there's an advanced option to upload custom credentials
4. This overrides the default embedded credentials

---

## Support

If you encounter issues:
1. Check this guide for troubleshooting steps
2. Verify your Google Cloud Console settings (for developers)
3. Ensure you have the latest version of the application
4. Check your internet connection

---

**Note**: This feature requires an active internet connection to upload and download backups from Google Drive.
