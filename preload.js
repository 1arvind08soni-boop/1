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
    
    autoBackupOnClose: (data, companyName) => 
        ipcRenderer.invoke('auto-backup-on-close', { data, companyName }),
    
    onAppClosing: (callback) => 
        ipcRenderer.on('app-closing', callback),
    
    // License System API
    license: {
        validateOnStartup: (options) => 
            ipcRenderer.invoke('license:validate-on-startup', options),
        
        activate: (productKey, bindingData) => 
            ipcRenderer.invoke('license:activate', productKey, bindingData),
        
        deactivate: () => 
            ipcRenderer.invoke('license:deactivate'),
        
        getStatus: () => 
            ipcRenderer.invoke('license:get-status'),
        
        getLogs: (lines) => 
            ipcRenderer.invoke('license:get-logs', lines),
        
        addUser: (userId) => 
            ipcRenderer.invoke('license:add-user', userId),
        
        removeUser: (userId) => 
            ipcRenderer.invoke('license:remove-user', userId),
        
        toggleLock: () => 
            ipcRenderer.invoke('license:toggle-lock'),
        
        exportLicense: () => 
            ipcRenderer.invoke('license:export'),
        
        importLicense: (importData) => 
            ipcRenderer.invoke('license:import', importData)
    },
    
    // User Authentication API
    auth: {
        createUser: (username, password, fullName) =>
            ipcRenderer.invoke('auth:create-user', username, password, fullName),
        
        login: (username, password) =>
            ipcRenderer.invoke('auth:login', username, password),
        
        logout: () =>
            ipcRenderer.invoke('auth:logout'),
        
        getCurrentUser: () =>
            ipcRenderer.invoke('auth:get-current-user'),
        
        changePassword: (username, oldPassword, newPassword) =>
            ipcRenderer.invoke('auth:change-password', username, oldPassword, newPassword),
        
        getAllUsers: () =>
            ipcRenderer.invoke('auth:get-all-users'),
        
        deleteUser: (username) =>
            ipcRenderer.invoke('auth:delete-user', username)
    }
});
