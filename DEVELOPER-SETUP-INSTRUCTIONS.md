# Google Drive - Developer Setup Instructions

## Overview

The Google Drive backup feature has been simplified for end users. They just need to click "Sign in with Google" - no complex setup required!

However, **before distributing the app**, you (the developer) need to configure OAuth2 credentials once.

## Why This Setup is Needed

Google Drive API requires OAuth2 authentication for security. The app comes with placeholder credentials that need to be replaced with your actual credentials from Google Cloud Console.

## One-Time Setup (10 Minutes)

### Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Name: "Billing Backup App" (or any name you prefer)
4. Click "Create"
5. Wait for project creation to complete

### Step 2: Enable Google Drive API

1. Make sure your new project is selected
2. Go to "APIs & Services" → "Library"
3. Search for "Google Drive API"
4. Click on it
5. Click "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. User Type: Select "External"
3. Click "Create"
4. Fill in required fields:
   - App name: "Billing Backup App"
   - User support email: Your email
   - Developer contact: Your email
5. Click "Save and Continue"
6. Scopes: Skip this (click "Save and Continue")
7. Test users: Optional (add if needed)
8. Click "Save and Continue"
9. Review and click "Back to Dashboard"

### Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Desktop app** (Important!)
4. Name: "Desktop Client"
5. Click "Create"
6. **Save your credentials:**
   - Copy the **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
   - Copy the **Client Secret** (looks like: `GOCSPX-xxxxx`)

### Step 5: Update the Source Code

1. Open `main.js` in your code editor
2. Find the `DEFAULT_CREDENTIALS` section (around line 344)
3. Replace the placeholder values:

```javascript
const DEFAULT_CREDENTIALS = {
    installed: {
        client_id: "YOUR_CLIENT_ID_HERE.apps.googleusercontent.com",  // ← Replace this
        project_id: "billing-backup",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_secret: "YOUR_CLIENT_SECRET_HERE",  // ← Replace this
        redirect_uris: ["http://localhost"]
    }
};
```

**Replace:**
- `YOUR_CLIENT_ID_HERE.apps.googleusercontent.com` → Your actual Client ID
- `YOUR_CLIENT_SECRET_HERE` → Your actual Client Secret

### Step 6: Build and Test

1. Save the file
2. Build the application:
   ```bash
   npm run build
   ```
3. Test the Google Drive feature:
   - Run the app
   - Go to Settings → Configure Google Drive
   - Click "Sign in with Google"
   - Complete the authorization
   - Test backup and restore

### Step 7: Distribute

Once tested successfully, you can distribute the built application to users. They will only need to:
1. Click "Sign in with Google"
2. Authorize
3. Start backing up!

## Security Notes

### Is it safe to embed OAuth credentials?

**Yes!** This is the standard approach for desktop applications:
- OAuth Client Secret is **not** a password or private key
- It's meant for client applications (desktop/mobile apps)
- Google's OAuth flow still requires user consent
- Each user authenticates with their own Google account
- Data stays in the user's own Google Drive

### What about the Client Secret?

The Client Secret in desktop apps is:
- Not truly secret (can be extracted from compiled apps)
- Used only to identify your application
- Does **not** grant access to any data
- User must still authorize the app
- This is Google's recommended approach for desktop apps

Reference: [Google OAuth2 for Installed Applications](https://developers.google.com/identity/protocols/oauth2/native-app)

## Troubleshooting

### "Invalid Client" Error
- Verify you selected "Desktop app" type
- Check that Client ID and Secret are copied correctly
- Ensure no extra spaces in the credentials

### "Access Blocked" Error
- Make sure Google Drive API is enabled
- Check OAuth consent screen is configured
- Add test users if needed

### Users Can't Sign In
- Verify the app is built with updated credentials
- Check that credentials in `main.js` are correct
- Test locally first before distributing

## After Setup

Once configured, users experience a simple flow:
1. **User:** Click "Sign in with Google"
2. **Google:** Opens authorization page
3. **User:** Approves access
4. **User:** Copies code and pastes in app
5. **Done!** Backups work automatically

No JSON files, no Google Cloud Console, no confusion!

## Need Help?

- Check [Google Cloud Console](https://console.cloud.google.com/)
- Review [OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- See `GOOGLE-DRIVE-SETUP.md` for more details

## Summary

**One-time setup (you, the developer):**
- Create Google Cloud project
- Enable Google Drive API
- Get OAuth credentials
- Update `main.js`
- Build and distribute

**Every user after that:**
- Click "Sign in with Google"
- Done!

That's it! 🎉
