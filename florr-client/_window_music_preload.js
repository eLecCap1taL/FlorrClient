const { ipcRenderer ,contextBridge} = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
    changeMusicKit: (value) => ipcRenderer.send('_changeMusicKit',value),
    onSetMusic: (callback) => ipcRenderer.on('setMusic', (_event, value) => callback(value)),
    onSetPause: (callback) => ipcRenderer.on('setPause', (_event, value) => callback(value))
})