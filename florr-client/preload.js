const { ipcRenderer ,contextBridge} = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
    playSound: (pt) => ipcRenderer.send('_askPlaySound',pt)
})
