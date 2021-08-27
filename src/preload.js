const { contextBridge, ipcRenderer } = require('electron');
console.info("PRELOAD")

const openUrl = function (url) {
    ipcRenderer.send('open-url', url);
}

contextBridge.exposeInMainWorld('openUrl', openUrl)
