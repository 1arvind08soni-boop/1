# Quick Start Guide - Building Windows Installer

This guide will help you create a Windows installer (.exe) for the Billing & Account Management System.

## Prerequisites

Before you begin, ensure you have:
- **Windows PC** (Windows 7, 8, 10, or 11)
- **Node.js** installed (version 14 or higher)
  - Download from: https://nodejs.org/
  - Choose the LTS (Long Term Support) version
  - During installation, check "Add to PATH"

## Step-by-Step Instructions

### Step 1: Install Node.js

1. Visit https://nodejs.org/
2. Download the LTS version (recommended)
3. Run the installer
4. Follow the installation wizard
5. Make sure "Add to PATH" is checked
6. Restart your computer after installation

To verify installation:
1. Open Command Prompt (Windows + R, type `cmd`, press Enter)
2. Type: `node --version` and press Enter
3. Type: `npm --version` and press Enter
4. You should see version numbers for both

### Step 2: Download the Project

**Option A: Download ZIP**
1. Click the green "Code" button on GitHub
2. Select "Download ZIP"
3. Extract the ZIP file to a folder (e.g., `C:\BillingApp`)

**Option B: Using Git**
1. Install Git from https://git-scm.com/
2. Open Command Prompt
3. Navigate to where you want the project
4. Run: `git clone https://github.com/soniarvind08-glitch/FINAL.git`

### Step 3: Install Dependencies

1. Open Command Prompt
2. Navigate to the project folder:
   ```
   cd C:\BillingApp
   ```
   (Replace with your actual path)

3. Install required packages:
   ```
   npm install
   ```
   This will take a few minutes to download all dependencies.

### Step 4: Build the Windows Installer

**Option A: Using the Build Script (Recommended)**
1. In the project folder, double-click `build-windows.bat`
2. Wait for the build to complete (3-5 minutes)
3. The installer will be created in the `dist` folder

**Option B: Using Command Line**
1. Open Command Prompt in the project folder
2. Run:
   ```
   npm run build
   ```
3. Wait for the build to complete
4. The installer will be created in the `dist` folder

### Step 5: Find Your Installer

1. Navigate to the `dist` folder in your project directory
2. Look for a file like: `Billing & Account Management Setup 1.0.0.exe`
3. This is your Windows installer!

### Step 6: Test the Installer

1. Double-click the `.exe` file
2. Follow the installation wizard
3. Choose installation location
4. Complete the installation
5. Launch the application from Start Menu or Desktop

## What You Get

The installer includes:
- ✅ Full Windows application
- ✅ Desktop shortcut
- ✅ Start Menu entry
- ✅ Uninstaller
- ✅ Works offline (no internet required)
- ✅ All data stored locally
- ✅ Compatible with Windows 7, 8, 10, 11

## Distribution

To share with others:
1. Copy the `.exe` file from the `dist` folder
2. Share via USB drive, email, cloud storage, etc.
3. Users just double-click to install
4. No additional software required on their end

## Customization (Optional)

### Add Custom Icons
1. Create a 256x256 PNG image (your logo)
2. Save as `icon.png` in the project root
3. Convert to ICO format (use https://convertio.co/png-ico/)
4. Save as `icon.ico` in the project root
5. Rebuild the installer

See `ICONS-README.md` for detailed icon instructions.

### Change Application Name
Edit `package.json`:
- Change `"productName"` to your desired name
- Rebuild the installer

## Troubleshooting

### "node is not recognized as a command"
- Node.js is not installed or not in PATH
- Reinstall Node.js and check "Add to PATH"
- Restart your computer

### Build fails with errors
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again
- Try running Command Prompt as Administrator

### Installer doesn't work
- Make sure you're on Windows 64-bit
- Try running the installer as Administrator
- Check if antivirus is blocking it

### Application won't start after install
- Try running as Administrator
- Check Windows Event Viewer for errors
- Reinstall the application

## Advanced Usage

### Run in Development Mode
To test without building an installer:
```
npm start
```

### Build Without Installer
To create an unpacked version for testing:
```
npm run build:dir
```
Find the app in `dist/win-unpacked/`

## File Sizes

- Download size: ~100-200 MB (node_modules)
- Installer size: ~70-150 MB
- Installed size: ~200-300 MB

These sizes are normal for Electron applications and include everything needed to run.

## Need Help?

- Check the main README.md for more details
- Open an issue on GitHub
- Check that all prerequisites are met
- Make sure you have enough disk space (at least 500 MB free)

## Summary

1. ✅ Install Node.js
2. ✅ Download project
3. ✅ Run `npm install`
4. ✅ Run `npm run build` (or double-click `build-windows.bat`)
5. ✅ Find installer in `dist` folder
6. ✅ Share and distribute!

Congratulations! You now have a Windows desktop application that users can install on any Windows PC.
