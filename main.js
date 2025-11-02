const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

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
            preload: path.join(__dirname, 'preload.js'),
        },
        backgroundColor: '#f5f7fa',
        show: false,
        autoHideMenuBar: true,
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
                    },
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    },
                },
            ],
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
                { role: 'selectAll' },
            ],
        },
        {
            label: 'View',
            submenu: [
                { role: 'togglefullscreen' },
                { type: 'separator' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { role: 'resetZoom' },
            ],
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
                            buttons: ['OK'],
                        });
                    },
                },
            ],
        },
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
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
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

ipcMain.handle('import-template', async event => {
    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
                { name: 'HTML Templates', extensions: ['html', 'htm'] },
                { name: 'All Files', extensions: ['*'] },
            ],
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
                { name: 'All Files', extensions: ['*'] },
            ],
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

ipcMain.handle('get-user-data-path', async event => {
    return app.getPath('userData');
});

ipcMain.handle('select-folder', async event => {
    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory'],
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
                contextIsolation: true,
            },
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
            landscape: false,
        };

        // Map margin type to Electron margin settings
        switch (marginType) {
            case 'none':
                printOptions.margins = {
                    marginType: 'none',
                };
                break;
            case 'minimum':
                printOptions.margins = {
                    marginType: 'minimum',
                };
                break;
            case 'custom':
                printOptions.margins = {
                    marginType: 'custom',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                };
                break;
            default: // 'default'
                printOptions.margins = {
                    marginType: 'default',
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
