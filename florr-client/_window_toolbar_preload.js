const { ipcRenderer ,contextBridge} = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
    updMapCode: () => ipcRenderer.send('_updMapCode'),
    onUpdMapCodeList: (callback) => ipcRenderer.on('setMapCodeList', (_event, value) => callback(value)),
    onLog: (callback) => ipcRenderer.on('log', (_event, value) => callback(value)),
    onSetCurMapCode: (callback) => ipcRenderer.on('setCurMapCode', (_event, value) => callback(value))
})