const { ipcRenderer ,contextBridge} = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
    changeMusicKit: (value) => ipcRenderer.send('_changeMusicKit',value),
    updMapCode: () => ipcRenderer.send('_updMapCode'),
    onSetMusic: (callback) => ipcRenderer.on('setMusic', (_event, value) => callback(value)),
    onSetPause: (callback) => ipcRenderer.on('setPause', (_event, value) => callback(value)),
    onPlaySound: (callback) => ipcRenderer.on('playSound', (_event, value) => callback(value))
})