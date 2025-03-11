const { ipcRenderer ,contextBridge} = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
    updMapCode: () => ipcRenderer.send('_updMapCode'),
    updEQlock: (status) => ipcRenderer.send('_updEQlock',status),
    updDisplayPetalCD: (status) => ipcRenderer.send('_updDisplayPetalCD',status),
    updDisplayBuffCD: (status) => ipcRenderer.send('_updDisplayBuffCD',status),
    setFlorrEQ: (val) => ipcRenderer.send('_setFlorrEQ',val),
    setFlorrFPS: (val) => ipcRenderer.send('_setFlorrFPS',val),
    openLoadoutsWindow: (val) => ipcRenderer.send('_openLoadoutsWindow',val),

    onUpdMapCodeList: (callback) => ipcRenderer.on('setMapCodeList', (_event, value) => callback(value)),
    onLog: (callback) => ipcRenderer.on('log', (_event, value) => callback(value)),
    onSetCurMapCode: (callback) => ipcRenderer.on('setCurMapCode', (_event, value) => callback(value)),
    
    onInit: (callback) => ipcRenderer.on('_init', (_event, value) => callback(value)),
    changeSettings: (value) => ipcRenderer.send('_changeSettings',value)
})

