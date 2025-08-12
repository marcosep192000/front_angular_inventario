const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  printTicket: (saleData) => ipcRenderer.send('print-ticket', saleData)
});