const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const cron = require('node-cron');

let mainWindow;
let oauth2Client = null;
let backupScheduler = null;

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

// Google Drive OAuth Configuration
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = path.join(app.getPath('userData'), 'gdrive-token.json');
const CREDENTIALS_PATH = path.join(app.getPath('userData'), 'gdrive-credentials.json');
const SETTINGS_PATH = path.join(app.getPath('userData'), 'gdrive-settings.json');

// Initialize OAuth2 Client
function initOAuth2Client(credentials) {
    const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web || credentials;
    oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
    );
}

// Load Google Drive Settings
function loadGDriveSettings() {
    try {
        if (fs.existsSync(SETTINGS_PATH)) {
            const data = fs.readFileSync(SETTINGS_PATH, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading Google Drive settings:', error);
    }
    return {
        folderId: '',
        schedule: 'manual', // 'manual', 'daily', 'weekly'
        scheduleTime: '00:00', // HH:MM format
        enabled: false
    };
}

// Save Google Drive Settings
function saveGDriveSettings(settings) {
    try {
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving Google Drive settings:', error);
        return false;
    }
}

// Get OAuth URL
ipcMain.handle('gdrive-get-auth-url', async (event, credentials) => {
    try {
        initOAuth2Client(credentials);
        
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        
        return { success: true, authUrl };
    } catch (error) {
        console.error('Error generating auth URL:', error);
        return { success: false, error: error.message };
    }
});

// Set OAuth Token
ipcMain.handle('gdrive-set-token', async (event, { credentials, code }) => {
    try {
        initOAuth2Client(credentials);
        
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        
        // Save tokens to file
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        
        return { success: true };
    } catch (error) {
        console.error('Error setting token:', error);
        return { success: false, error: error.message };
    }
});

// Check if authenticated
ipcMain.handle('gdrive-check-auth', async (event) => {
    try {
        const tokenExists = fs.existsSync(TOKEN_PATH);
        const credentialsExist = fs.existsSync(CREDENTIALS_PATH);
        
        if (tokenExists && credentialsExist) {
            const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
            const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
            
            initOAuth2Client(credentials);
            oauth2Client.setCredentials(token);
            
            return { success: true, authenticated: true };
        }
        
        return { success: true, authenticated: false };
    } catch (error) {
        console.error('Error checking auth:', error);
        return { success: true, authenticated: false };
    }
});

// Save credentials
ipcMain.handle('gdrive-save-credentials', async (event, credentials) => {
    try {
        fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(credentials, null, 2));
        return { success: true };
    } catch (error) {
        console.error('Error saving credentials:', error);
        return { success: false, error: error.message };
    }
});

// Upload backup to Google Drive
ipcMain.handle('gdrive-upload-backup', async (event, { filename, content }) => {
    try {
        if (!oauth2Client || !oauth2Client.credentials) {
            return { success: false, error: 'Not authenticated with Google Drive' };
        }
        
        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        const settings = loadGDriveSettings();
        
        const fileMetadata = {
            name: filename,
            mimeType: 'application/json'
        };
        
        // Add parent folder if specified
        if (settings.folderId) {
            fileMetadata.parents = [settings.folderId];
        }
        
        const media = {
            mimeType: 'application/json',
            body: content
        };
        
        const file = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, createdTime'
        });
        
        return { 
            success: true, 
            fileId: file.data.id,
            fileName: file.data.name,
            createdTime: file.data.createdTime
        };
    } catch (error) {
        console.error('Error uploading to Google Drive:', error);
        return { success: false, error: error.message };
    }
});

// List backups from Google Drive
ipcMain.handle('gdrive-list-backups', async (event) => {
    try {
        if (!oauth2Client || !oauth2Client.credentials) {
            return { success: false, error: 'Not authenticated with Google Drive' };
        }
        
        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        const settings = loadGDriveSettings();
        
        let query = "mimeType='application/json' and name contains 'backup_' and trashed=false";
        
        // Filter by folder if specified
        if (settings.folderId) {
            query += ` and '${settings.folderId}' in parents`;
        }
        
        const response = await drive.files.list({
            q: query,
            fields: 'files(id, name, createdTime, modifiedTime, size)',
            orderBy: 'createdTime desc',
            pageSize: 50
        });
        
        return { success: true, files: response.data.files };
    } catch (error) {
        console.error('Error listing backups:', error);
        return { success: false, error: error.message };
    }
});

// Download backup from Google Drive
ipcMain.handle('gdrive-download-backup', async (event, fileId) => {
    try {
        if (!oauth2Client || !oauth2Client.credentials) {
            return { success: false, error: 'Not authenticated with Google Drive' };
        }
        
        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        
        const response = await drive.files.get({
            fileId: fileId,
            alt: 'media'
        }, { responseType: 'text' });
        
        return { success: true, content: response.data };
    } catch (error) {
        console.error('Error downloading backup:', error);
        return { success: false, error: error.message };
    }
});

// Delete backup from Google Drive
ipcMain.handle('gdrive-delete-backup', async (event, fileId) => {
    try {
        if (!oauth2Client || !oauth2Client.credentials) {
            return { success: false, error: 'Not authenticated with Google Drive' };
        }
        
        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        
        await drive.files.delete({
            fileId: fileId
        });
        
        return { success: true };
    } catch (error) {
        console.error('Error deleting backup:', error);
        return { success: false, error: error.message };
    }
});

// Get Google Drive settings
ipcMain.handle('gdrive-get-settings', async (event) => {
    try {
        const settings = loadGDriveSettings();
        return { success: true, settings };
    } catch (error) {
        console.error('Error getting settings:', error);
        return { success: false, error: error.message };
    }
});

// Save Google Drive settings
ipcMain.handle('gdrive-save-settings', async (event, settings) => {
    try {
        const success = saveGDriveSettings(settings);
        
        if (success) {
            // Update backup scheduler
            setupBackupScheduler(settings);
            return { success: true };
        }
        
        return { success: false, error: 'Failed to save settings' };
    } catch (error) {
        console.error('Error saving settings:', error);
        return { success: false, error: error.message };
    }
});

// Function to perform automatic backup
async function performAutomaticBackup() {
    try {
        // Request backup from renderer process
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('perform-auto-backup');
        }
    } catch (error) {
        console.error('Error performing automatic backup:', error);
    }
}

// Setup backup scheduler
function setupBackupScheduler(settings) {
    // Clear existing scheduler
    if (backupScheduler) {
        backupScheduler.stop();
        backupScheduler = null;
    }
    
    if (!settings.enabled || settings.schedule === 'manual') {
        return;
    }
    
    let cronExpression = '';
    
    if (settings.schedule === 'daily') {
        // Daily at specified time
        const [hour, minute] = settings.scheduleTime.split(':');
        cronExpression = `${minute} ${hour} * * *`;
    } else if (settings.schedule === 'weekly') {
        // Weekly on Sunday at specified time
        const [hour, minute] = settings.scheduleTime.split(':');
        cronExpression = `${minute} ${hour} * * 0`;
    }
    
    if (cronExpression) {
        backupScheduler = cron.schedule(cronExpression, () => {
            performAutomaticBackup();
        });
    }
}

// Initialize scheduler on app ready
app.on('ready', () => {
    const settings = loadGDriveSettings();
    if (settings.enabled) {
        setupBackupScheduler(settings);
    }
});
