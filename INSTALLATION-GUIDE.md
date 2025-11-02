# Installation and Uninstallation Guide

## For End Users: Installing the Billing & Account Management Software

### System Requirements
- **Operating System**: Windows 7, 8, 10, or 11 (64-bit)
- **Disk Space**: At least 350 MB free space
- **Memory**: 4 GB RAM recommended
- **Processor**: Intel Core i3 or equivalent
- **Internet**: Not required (fully offline application)

---

## Installation Instructions

### Step 1: Download the Installer
1. Locate the file: `Billing & Account Management Setup 1.0.0.exe`
2. Save it to your Downloads folder or Desktop

### Step 2: Run the Installer
1. **Double-click** the downloaded `.exe` file
2. If Windows shows a security warning:
   - Click **"More info"**
   - Then click **"Run anyway"**
   - (This appears because the app is not code-signed)

### Step 3: Follow the Installation Wizard

#### Welcome Screen
- Read the welcome message
- Click **"Next"** to continue

#### License Agreement
- Review the software license
- Click **"I Agree"** to accept and continue

#### Choose Installation Location
- **Default location**: `C:\Program Files\Billing & Account Management`
- To change location:
  - Click **"Browse"**
  - Select your preferred folder
  - Click **"OK"**
- Click **"Next"**

#### Choose Start Menu Folder
- Default: "Billing & Account Management"
- Click **"Install"** to begin installation

#### Installing
- Wait while files are copied
- Usually takes 10-30 seconds

#### Completing Setup
- Check **"Run Billing & Account Management"** to launch immediately
- Click **"Finish"**

### Step 4: Launch the Application

After installation, you can launch the application in three ways:

1. **From Desktop**: Double-click the "Billing & Account Management" icon
2. **From Start Menu**: 
   - Click Windows Start button
   - Type "Billing"
   - Click "Billing & Account Management"
3. **From Installation Folder**: Navigate to installation directory and run the .exe

---

## First Time Setup

When you first launch the application:

1. **Create a Company Profile**
   - Click "Add New Company"
   - Enter your company details
   - Click "Save"

2. **Start Using Features**
   - Add clients and vendors
   - Create products
   - Generate invoices
   - Track payments

3. **Regular Backups**
   - Use "Backup Data" feature regularly
   - Save backup files to external drive or cloud storage

---

## Uninstallation Instructions

You can uninstall the software using the **same setup file** or through Windows Settings.

### Method 1: Using Windows Settings (Recommended)

#### Windows 10/11:
1. Press **Windows key + I** to open Settings
2. Click **"Apps"**
3. Click **"Apps & features"**
4. Scroll down and find **"Billing & Account Management"**
5. Click on it, then click **"Uninstall"**
6. Click **"Uninstall"** again to confirm
7. Follow the uninstaller prompts:
   - Click **"Yes"** to confirm removal
   - Wait for the process to complete
   - Click **"Close"** when finished

#### Windows 7/8:
1. Open **Control Panel**
2. Click **"Programs and Features"** (or "Uninstall a program")
3. Find **"Billing & Account Management"** in the list
4. Click on it, then click **"Uninstall"**
5. Follow the uninstaller prompts
6. Click **"Yes"** to confirm
7. Click **"Close"** when finished

### Method 2: Using the Uninstaller Directly

1. Go to installation folder (default: `C:\Program Files\Billing & Account Management`)
2. Find and run **"Uninstall Billing & Account Management.exe"**
3. Click **"Yes"** to confirm uninstallation
4. Wait for the process to complete
5. Click **"Close"**

### Method 3: Using the Original Setup File

1. Run the same **"Billing & Account Management Setup 1.0.0.exe"** file again
2. The installer will detect the existing installation
3. Choose **"Remove"** option
4. Click **"Next"**
5. Confirm removal
6. Click **"Close"** when finished

---

## What Gets Removed During Uninstallation

The uninstaller removes:
- ✓ Application executable files
- ✓ Program files and libraries
- ✓ Desktop shortcut
- ✓ Start Menu shortcuts
- ✓ Registry entries
- ✓ Uninstaller itself

**Note**: Your data (company information, invoices, etc.) is stored separately in:
`C:\Users\[YourUsername]\AppData\Roaming\Billing & Account Management\`

### Preserving Your Data

**Before uninstalling**, if you want to keep your data:

1. **Create a backup**:
   - Open the application
   - Click "Backup Data"
   - Save the backup file to a safe location
   
2. **Manual backup** (alternative):
   - Navigate to: `C:\Users\[YourUsername]\AppData\Roaming\`
   - Copy the "Billing & Account Management" folder
   - Save it to external drive or cloud storage

### Completely Removing All Data

If you want to remove **everything** including your data:

1. First uninstall the application (using any method above)
2. Then manually delete the data folder:
   - Press **Windows key + R**
   - Type: `%APPDATA%`
   - Press **Enter**
   - Delete the **"Billing & Account Management"** folder

**Warning**: This permanently deletes all your company data, invoices, and backups!

---

## Reinstallation

To reinstall the application:

1. **If you backed up your data**:
   - Install the application normally
   - Launch it once
   - Use "Restore Data" feature to restore your backup
   
2. **If you preserved the data folder**:
   - Install the application normally
   - Copy your saved data folder back to: `C:\Users\[YourUsername]\AppData\Roaming\`
   - Launch the application - your data will be there

---

## Updating to a New Version

When a new version is released:

1. **Download the new installer**
2. **Option A: Upgrade Install** (Recommended)
   - Run the new installer
   - It will detect the old version
   - Choose "Upgrade" or "Update"
   - Your data is preserved automatically
   
3. **Option B: Clean Install**
   - Backup your data first
   - Uninstall the old version
   - Install the new version
   - Restore your data

---

## Troubleshooting Installation

### "Windows protected your PC" message
**Solution**: 
- Click "More info"
- Click "Run anyway"
- This is normal for unsigned applications

### "Installation failed" error
**Solutions**:
- Run installer as Administrator (right-click → "Run as administrator")
- Disable antivirus temporarily
- Check if you have enough disk space (350 MB needed)
- Try installing to a different directory

### Application won't launch after installation
**Solutions**:
- Right-click the shortcut → "Run as administrator"
- Check if antivirus blocked the application
- Reinstall to default location
- Check Windows Event Viewer for errors

### Can't find the application after installation
**Check these locations**:
- Desktop: Look for shortcut icon
- Start Menu: Search for "Billing"
- Installation folder: `C:\Program Files\Billing & Account Management`

### Uninstaller not found
**Solutions**:
- Use Windows Settings → Apps method
- Reinstall the application, then uninstall
- Manually delete program files (requires admin rights)

---

## Silent Installation (For IT Administrators)

To install silently without user interaction:

```cmd
"Billing & Account Management Setup 1.0.0.exe" /S /D=C:\Program Files\Billing & Account Management
```

Options:
- `/S` - Silent mode (no UI)
- `/D` - Installation directory (must be last parameter)

To uninstall silently:

```cmd
"C:\Program Files\Billing & Account Management\Uninstall Billing & Account Management.exe" /S
```

---

## Network Deployment

For deploying to multiple computers:

### Using Group Policy (Windows Domain)
1. Create a GPO (Group Policy Object)
2. Add the installer to Software Installation
3. Deploy to target computers
4. Computers will auto-install on next restart/login

### Using SCCM or Intune
1. Package the installer
2. Create deployment task
3. Configure silent install parameters
4. Deploy to target device collection

### Manual Network Install
1. Place installer on network share
2. Run from network location on each PC
3. Or copy to local machine first, then install

---

## Support

### Getting Help
- **Documentation**: See README.md for feature documentation
- **Quick Start**: See QUICK-START.md for basic usage
- **Build Guide**: See BUILD-GUIDE.md for developer info

### Common Questions

**Q: Do I need internet to use this software?**
A: No, it works completely offline.

**Q: Can I install on multiple computers?**
A: Yes, you can install on as many computers as needed.

**Q: Will my data sync between computers?**
A: No, data is stored locally on each computer. Use backup/restore to transfer data.

**Q: Is my data secure?**
A: Data is stored locally on your computer. Use Windows user accounts and file permissions for security.

**Q: Can I move the installation to another drive?**
A: Yes, uninstall and reinstall to the new location. Backup data first.

---

## Summary

### To Install:
1. ✓ Download the setup .exe file
2. ✓ Run it and follow the wizard
3. ✓ Launch from Desktop or Start Menu

### To Uninstall:
1. ✓ Windows Settings → Apps → Uninstall
2. ✓ OR run the Uninstaller from installation folder
3. ✓ OR run the setup file again and choose Remove

### To Preserve Data:
1. ✓ Use in-app "Backup Data" feature before uninstalling
2. ✓ Store backup files safely
3. ✓ Restore after reinstalling

---

**You now have complete control over installing and uninstalling the Billing & Account Management software!**

For more information, see the main README.md file.
