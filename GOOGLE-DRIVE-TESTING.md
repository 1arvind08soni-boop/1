# Google Drive Backup Testing Guide

This guide will help you test the new Google Drive backup and restore functionality.

## Prerequisites

Before testing, ensure you have:
1. Completed the Google Cloud Console setup (see GOOGLE-DRIVE-SETUP.md)
2. Downloaded your OAuth2 credentials JSON file
3. Built and launched the application

## Test Cases

### Test 1: Google Drive Setup and Authentication

**Steps:**
1. Launch the application
2. Navigate to **Settings** tab
3. Locate the **Google Drive Backup** section
4. Click **"Configure Google Drive"**
5. Upload your OAuth2 credentials JSON file
6. Click **"Authenticate with Google Drive"**
7. Complete the OAuth flow in your browser
8. Copy and paste the authorization code
9. Click **"Submit Code"**

**Expected Result:**
- ✅ Authentication status shows "Authenticated" with green checkmark
- ✅ Success message appears
- ✅ Modal reopens showing authenticated state

**If Failed:**
- Check credentials file format
- Verify Google Drive API is enabled
- Ensure you're using Desktop app credentials

---

### Test 2: Manual Backup to Google Drive

**Steps:**
1. Ensure you have some test data in the application (products, clients, invoices, etc.)
2. Go to **Settings** tab
3. Click **"Backup to Google Drive"**
4. Wait for the operation to complete

**Expected Result:**
- ✅ "Uploading backup to Google Drive..." info message appears
- ✅ Success message shows "Backup uploaded successfully to Google Drive!"
- ✅ Backup filename is displayed in the success message

**If Failed:**
- Check internet connection
- Verify authentication is still valid
- Check Google Drive storage space

---

### Test 3: View Backups in Google Drive

**Steps:**
1. Go to **Settings** tab
2. Click **"Restore from Google Drive"**
3. Observe the list of backups

**Expected Result:**
- ✅ Modal shows table with backup files
- ✅ Each backup shows: filename, creation date, size
- ✅ Each backup has "Restore" and "Delete" buttons
- ✅ Backups are sorted by date (newest first)

**If Failed:**
- Check if you have created any backups
- Verify folder ID if specified
- Check authentication

---

### Test 4: Restore from Google Drive

**Steps:**
1. Create a test backup (Test 2)
2. Make some changes to your data (add/edit/delete items)
3. Click **"Restore from Google Drive"**
4. Select your test backup
5. Click **"Restore"**
6. Confirm the action in the dialog

**Expected Result:**
- ✅ Confirmation dialog appears with warning
- ✅ "Downloading backup from Google Drive..." message appears
- ✅ Success message: "Data restored successfully from Google Drive!"
- ✅ Application reloads
- ✅ Data is reverted to the backup state

**If Failed:**
- Check internet connection
- Verify backup file is valid JSON
- Check console for errors

---

### Test 5: Configure Backup Folder

**Steps:**
1. Create a folder in Google Drive named "Billing Backups"
2. Open the folder and copy its ID from the URL
3. In app, go to **Settings** → **"Configure Google Drive"**
4. Paste the folder ID in **"Google Drive Folder ID"** field
5. Click **"Save Settings"**
6. Perform a manual backup (Test 2)
7. Check your Google Drive folder

**Expected Result:**
- ✅ Settings saved successfully
- ✅ New backup appears in the specified folder
- ✅ Backup is visible when listing backups in the app

---

### Test 6: Schedule Automatic Daily Backup

**Steps:**
1. Go to **Settings** → **"Configure Google Drive"**
2. Check **"Enable Automatic Backup"**
3. Select **"Daily"** from the schedule dropdown
4. Set time to 2 minutes from current time (for testing)
5. Click **"Save Settings"**
6. Keep the application running
7. Wait for the scheduled time

**Expected Result:**
- ✅ Settings saved successfully
- ✅ At scheduled time, backup is automatically created
- ✅ Success notification appears
- ✅ New backup appears in Google Drive

**Note:** For production testing, set a real schedule time.

---

### Test 7: Schedule Automatic Weekly Backup

**Steps:**
1. Go to **Settings** → **"Configure Google Drive"**
2. Check **"Enable Automatic Backup"**
3. Select **"Weekly"** from the schedule dropdown
4. Set a time (e.g., 11:00 PM)
5. Click **"Save Settings"**

**Expected Result:**
- ✅ Settings saved successfully
- ✅ Backup will run every Sunday at specified time

**Note:** Weekly backups run on Sundays. For testing, consider using daily schedule.

---

### Test 8: Delete Old Backup

**Steps:**
1. Create multiple test backups
2. Click **"Restore from Google Drive"**
3. Select an old backup
4. Click **"Delete"**
5. Confirm the deletion

**Expected Result:**
- ✅ Confirmation dialog appears
- ✅ Backup is deleted successfully
- ✅ Backup list refreshes automatically
- ✅ Deleted backup no longer appears in list
- ✅ File is removed from Google Drive

---

### Test 9: Disable Automatic Backup

**Steps:**
1. Go to **Settings** → **"Configure Google Drive"**
2. Uncheck **"Enable Automatic Backup"**
3. Click **"Save Settings"**
4. Wait past the scheduled backup time

**Expected Result:**
- ✅ Settings saved successfully
- ✅ No automatic backup occurs
- ✅ Manual backups still work

---

### Test 10: Large Data Backup

**Steps:**
1. Create substantial test data (100+ invoices, products, clients)
2. Perform a manual backup
3. Note the time taken
4. Verify backup in Google Drive

**Expected Result:**
- ✅ Backup completes successfully (may take longer)
- ✅ File size reflects data volume
- ✅ Backup can be restored successfully

---

## Error Scenarios to Test

### Error 1: No Authentication
**Steps:** Click "Backup to Google Drive" without authenticating
**Expected:** Error message: "Please configure and authenticate Google Drive first"

### Error 2: Invalid Folder ID
**Steps:** Enter invalid folder ID and try to backup
**Expected:** Error message with details

### Error 3: No Internet Connection
**Steps:** Disable internet and try to backup
**Expected:** Appropriate error message about connection

### Error 4: Invalid Credentials File
**Steps:** Upload a non-JSON or invalid JSON file
**Expected:** Error message: "Invalid credentials file format"

---

## Verification Checklist

After running all tests, verify:

- [ ] All test cases pass
- [ ] No console errors during operations
- [ ] Backups appear in correct Google Drive location
- [ ] Restored data matches backup data exactly
- [ ] Automatic backup scheduler works reliably
- [ ] Error handling is appropriate and user-friendly
- [ ] UI is responsive during operations
- [ ] File sizes are reasonable (compressed JSON)
- [ ] Multiple companies have separate backups
- [ ] Financial year data is preserved in backups

---

## Performance Testing

1. **Backup Speed**: Should complete in < 5 seconds for typical data
2. **Restore Speed**: Should complete in < 10 seconds for typical data
3. **List Speed**: Should load backup list in < 3 seconds
4. **UI Responsiveness**: UI should remain responsive during operations

---

## Notes for Testers

- Keep the application console open during testing (press F12)
- Note any error messages or warnings
- Test with different company data sizes
- Verify backups work after application restart
- Check that credentials persist across restarts

---

## Reporting Issues

If you find issues, please report:
1. Test case number and step
2. Error message (if any)
3. Console errors (if any)
4. Expected vs actual behavior
5. Screenshots (if applicable)

---

## Success Criteria

The feature is working correctly if:
- ✅ All test cases pass
- ✅ No critical errors occur
- ✅ Data integrity is maintained
- ✅ User experience is smooth
- ✅ Documentation is clear and accurate
