const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    savePDF: (content, filename, folder) => 
        ipcRenderer.invoke('save-pdf', { content, filename, folder }),
    
    importTemplate: () => 
        ipcRenderer.invoke('import-template'),
    
    selectSaveLocation: (defaultPath) => 
        ipcRenderer.invoke('select-save-location', { defaultPath }),
    
    saveFile: (filePath, content) => 
        ipcRenderer.invoke('save-file', { filePath, content }),
    
    getUserDataPath: () => 
        ipcRenderer.invoke('get-user-data-path'),
    
    selectFolder: () => 
        ipcRenderer.invoke('select-folder'),
    
    saveToCustomPath: (content, filename, customPath) => 
        ipcRenderer.invoke('save-to-custom-path', { content, filename, customPath }),
    
    printInvoice: (html, pageSize, marginType) => 
        ipcRenderer.invoke('print-invoice', { html, pageSize, marginType }),
    
    // Google Drive API
    gdriveGetAuthUrl: (credentials) => 
        ipcRenderer.invoke('gdrive-get-auth-url', credentials),
    
    gdriveSetToken: (credentials, code) => 
        ipcRenderer.invoke('gdrive-set-token', { credentials, code }),
    
    gdriveCheckAuth: () => 
        ipcRenderer.invoke('gdrive-check-auth'),
    
    gdriveSaveCredentials: (credentials) => 
        ipcRenderer.invoke('gdrive-save-credentials', credentials),
    
    gdriveUploadBackup: (filename, content) => 
        ipcRenderer.invoke('gdrive-upload-backup', { filename, content }),
    
    gdriveListBackups: () => 
        ipcRenderer.invoke('gdrive-list-backups'),
    
    gdriveDownloadBackup: (fileId) => 
        ipcRenderer.invoke('gdrive-download-backup', fileId),
    
    gdriveDeleteBackup: (fileId) => 
        ipcRenderer.invoke('gdrive-delete-backup', fileId),
    
    gdriveGetSettings: () => 
        ipcRenderer.invoke('gdrive-get-settings'),
    
    gdriveSaveSettings: (settings) => 
        ipcRenderer.invoke('gdrive-save-settings', settings),
    
    // Listen for auto-backup events
    onPerformAutoBackup: (callback) => 
        ipcRenderer.on('perform-auto-backup', callback)
});
