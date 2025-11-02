const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    savePDF: (content, filename, folder) =>
        ipcRenderer.invoke('save-pdf', { content, filename, folder }),

    importTemplate: () => ipcRenderer.invoke('import-template'),

    selectSaveLocation: defaultPath => ipcRenderer.invoke('select-save-location', { defaultPath }),

    saveFile: (filePath, content) => ipcRenderer.invoke('save-file', { filePath, content }),

    getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),

    selectFolder: () => ipcRenderer.invoke('select-folder'),

    saveToCustomPath: (content, filename, customPath) =>
        ipcRenderer.invoke('save-to-custom-path', { content, filename, customPath }),

    printInvoice: (html, pageSize, marginType) =>
        ipcRenderer.invoke('print-invoice', { html, pageSize, marginType }),
});
