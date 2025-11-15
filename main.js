const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Import License System
const LicenseValidator = require('./licensing/licenseValidator');
const LicenseStorage = require('./licensing/licenseStorage');
const UserAuth = require('./licensing/userAuth');

let mainWindow;
let licenseValidator;
let licenseStorage;
let userAuth;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 600,
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: true,
            preload: path.join(__dirname, 'preload.js')
        },
        backgroundColor: '#f5f7fa',
        show: false,
        autoHideMenuBar: true
    });

    // Load the index.html of the app
    mainWindow.loadFile('index.html');

    // Show window when ready to prevent flickering
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Create custom menu
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.reload();
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'togglefullscreen' },
                { type: 'separator' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { role: 'resetZoom' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => {
                        const { dialog } = require('electron');
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About',
                            message: 'Billing & Account Management System',
                            detail: 'Version 1.0.0\nA comprehensive billing and account management solution.',
                            buttons: ['OK']
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    // Open DevTools in development mode (commented out for production)
    // mainWindow.webContents.openDevTools();

    // Emitted when the window is closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows
app.whenReady().then(() => {
    // Initialize license system and user authentication
    const userDataPath = app.getPath('userData');
    licenseValidator = new LicenseValidator(userDataPath);
    licenseStorage = new LicenseStorage(userDataPath);
    userAuth = new UserAuth(userDataPath);
    
    createWindow();

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        // Someone tried to run a second instance, focus our window instead
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

// IPC Handlers for file operations
ipcMain.handle('save-pdf', async (event, { content, filename, folder }) => {
    try {
        // Get app path or user's documents directory
        const userDataPath = app.getPath('userData');
        const folderPath = path.join(userDataPath, folder);
        
        // Create folder if it doesn't exist
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        
        const filePath = path.join(folderPath, filename);
        
        // In a real implementation, you would use a library like puppeteer or electron-pdf
        // For now, we'll save the HTML content
        fs.writeFileSync(filePath, content, 'utf-8');
        
        return { success: true, path: filePath };
    } catch (error) {
        console.error('Error saving PDF:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('import-template', async (event) => {
    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
                { name: 'HTML Templates', extensions: ['html', 'htm'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        
        if (result.canceled) {
            return { success: false, canceled: true };
        }
        
        const filePath = result.filePaths[0];
        const content = fs.readFileSync(filePath, 'utf-8');
        const filename = path.basename(filePath);
        
        return { success: true, content, filename };
    } catch (error) {
        console.error('Error importing template:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('select-save-location', async (event, { defaultPath }) => {
    try {
        const result = await dialog.showSaveDialog(mainWindow, {
            defaultPath: defaultPath,
            filters: [
                { name: 'HTML Files', extensions: ['html'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        
        if (result.canceled) {
            return { success: false, canceled: true };
        }
        
        return { success: true, filePath: result.filePath };
    } catch (error) {
        console.error('Error selecting save location:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('save-file', async (event, { filePath, content }) => {
    try {
        fs.writeFileSync(filePath, content, 'utf-8');
        return { success: true, filePath };
    } catch (error) {
        console.error('Error saving file:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-user-data-path', async (event) => {
    return app.getPath('userData');
});

ipcMain.handle('select-folder', async (event) => {
    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        });
        
        if (result.canceled) {
            return { success: false, canceled: true };
        }
        
        return { success: true, folderPath: result.filePaths[0] };
    } catch (error) {
        console.error('Error selecting folder:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('save-to-custom-path', async (event, { content, filename, customPath }) => {
    try {
        // Ensure the custom path exists
        if (!fs.existsSync(customPath)) {
            return { success: false, error: 'The selected folder does not exist' };
        }
        
        const filePath = path.join(customPath, filename);
        fs.writeFileSync(filePath, content, 'utf-8');
        
        return { success: true, filePath };
    } catch (error) {
        console.error('Error saving to custom path:', error);
        return { success: false, error: error.message };
    }
});

// Print invoice with native dialog
ipcMain.handle('print-invoice', async (event, { html, pageSize, marginType }) => {
    try {
        // Create a new hidden window for printing
        const printWindow = new BrowserWindow({
            width: 800,
            height: 600,
            show: false,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true
            }
        });

        // Load the HTML content
        await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

        // Wait for content to load
        await new Promise(resolve => setTimeout(resolve, 500));

        // Set up print options with margin type
        const printOptions = {
            silent: false,
            printBackground: true,
            pageSize: pageSize === 'a5' ? 'A5' : 'A4',
            landscape: false
        };

        // Map margin type to Electron margin settings
        switch (marginType) {
            case 'none':
                printOptions.margins = {
                    marginType: 'none'
                };
                break;
            case 'minimum':
                printOptions.margins = {
                    marginType: 'minimum'
                };
                break;
            case 'custom':
                printOptions.margins = {
                    marginType: 'custom',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0
                };
                break;
            default: // 'default'
                printOptions.margins = {
                    marginType: 'default'
                };
        }

        // Show print dialog using Promise-based approach
        return new Promise((resolve, reject) => {
            printWindow.webContents.print(printOptions, (success, errorType) => {
                if (!success) {
                    console.error('Print failed:', errorType);
                    printWindow.close();
                    resolve({ success: false, error: errorType });
                } else {
                    printWindow.close();
                    resolve({ success: true });
                }
            });
        });
    } catch (error) {
        console.error('Error printing invoice:', error);
        return { success: false, error: error.message };
    }
});

// Auto-backup on close handler
ipcMain.handle('auto-backup-on-close', async (event, { data, companyName }) => {
    try {
        // Get downloads directory
        const downloadsPath = app.getPath('downloads');
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `backup_${companyName}_${timestamp}.json`;
        const filePath = path.join(downloadsPath, filename);
        
        // Write backup file
        const json = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, json, 'utf-8');
        
        return { success: true, filePath };
    } catch (error) {
        console.error('Error creating auto-backup:', error);
        return { success: false, error: error.message };
    }
});

// License System IPC Handlers
ipcMain.handle('license:validate-on-startup', async (event, options) => {
    try {
        return licenseValidator.validateOnStartup(options);
    } catch (error) {
        console.error('Error validating license:', error);
        return {
            hasLicense: false,
            isValid: false,
            status: 'error',
            message: error.message,
            canUseApp: false
        };
    }
});

ipcMain.handle('license:activate', async (event, productKey, bindingData) => {
    try {
        return licenseValidator.activateLicense(productKey, bindingData);
    } catch (error) {
        console.error('Error activating license:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('license:deactivate', async (event) => {
    try {
        return licenseValidator.deactivateLicense();
    } catch (error) {
        console.error('Error deactivating license:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('license:get-status', async (event) => {
    try {
        return licenseValidator.getLicenseStatus();
    } catch (error) {
        console.error('Error getting license status:', error);
        return {
            hasLicense: false,
            isValid: false,
            status: 'error'
        };
    }
});

ipcMain.handle('license:get-logs', async (event, lines) => {
    try {
        return licenseStorage.getLogs(lines || 100);
    } catch (error) {
        console.error('Error getting logs:', error);
        return [];
    }
});

ipcMain.handle('license:add-user', async (event, userId) => {
    try {
        const licenseData = licenseStorage.loadLicense();
        if (!licenseData) {
            throw new Error('No license found');
        }
        
        const licenseManager = licenseValidator.licenseManager;
        const updated = licenseManager.addUserToLicense(licenseData, userId);
        
        if (licenseStorage.saveLicense(updated)) {
            return { success: true };
        } else {
            throw new Error('Failed to save updated license');
        }
    } catch (error) {
        console.error('Error adding user:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('license:remove-user', async (event, userId) => {
    try {
        const licenseData = licenseStorage.loadLicense();
        if (!licenseData) {
            throw new Error('No license found');
        }
        
        const licenseManager = licenseValidator.licenseManager;
        const updated = licenseManager.removeUserFromLicense(licenseData, userId);
        
        if (licenseStorage.saveLicense(updated)) {
            return { success: true };
        } else {
            throw new Error('Failed to save updated license');
        }
    } catch (error) {
        console.error('Error removing user:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('license:toggle-lock', async (event) => {
    try {
        const licenseData = licenseStorage.loadLicense();
        if (!licenseData) {
            throw new Error('No license found');
        }
        
        licenseData.locked = !licenseData.locked;
        
        if (licenseStorage.saveLicense(licenseData)) {
            return { success: true, locked: licenseData.locked };
        } else {
            throw new Error('Failed to save updated license');
        }
    } catch (error) {
        console.error('Error toggling lock:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('license:export', async (event) => {
    try {
        return licenseStorage.exportLicense();
    } catch (error) {
        console.error('Error exporting license:', error);
        return null;
    }
});

ipcMain.handle('license:import', async (event, importData) => {
    try {
        const success = licenseStorage.importLicense(importData);
        return { success };
    } catch (error) {
        console.error('Error importing license:', error);
        return { success: false, message: error.message };
    }
});

// User Authentication IPC Handlers
ipcMain.handle('auth:create-user', async (event, username, password, fullName) => {
    try {
        return userAuth.createUser(username, password, fullName);
    } catch (error) {
        console.error('Error creating user:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('auth:login', async (event, username, password) => {
    try {
        return userAuth.login(username, password);
    } catch (error) {
        console.error('Error logging in:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('auth:logout', async (event) => {
    try {
        userAuth.logout();
        return { success: true };
    } catch (error) {
        console.error('Error logging out:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('auth:get-current-user', async (event) => {
    try {
        const user = userAuth.getCurrentUser();
        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
});

ipcMain.handle('auth:change-password', async (event, username, oldPassword, newPassword) => {
    try {
        return userAuth.changePassword(username, oldPassword, newPassword);
    } catch (error) {
        console.error('Error changing password:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('auth:get-all-users', async (event) => {
    try {
        return userAuth.getAllUsers();
    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
});

ipcMain.handle('auth:delete-user', async (event, username) => {
    try {
        return userAuth.deleteUser(username);
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, message: error.message };
    }
});

// Before quit - give renderer a chance to backup
let isQuitting = false;
app.on('before-quit', (event) => {
    if (!isQuitting && mainWindow && !mainWindow.isDestroyed()) {
        event.preventDefault();
        isQuitting = true;
        
        // Send message to renderer to perform backup if needed
        mainWindow.webContents.send('app-closing');
        
        // Wait a bit for backup to complete, then quit
        setTimeout(() => {
            app.quit();
        }, 2000);
    }
});
