const { ipcRenderer ,contextBridge} = require('electron');


contextBridge.exposeInMainWorld('myAPI', {
    
    
    onInit: (callback) => ipcRenderer.on('_init', (_event, value) => callback(value)),
    changeSettings: (value) => ipcRenderer.send('_changeSettings',value),

    _loadouts_feature_sound: (value) => ipcRenderer.send('_loadouts_feature_sound',value),
    _loadouts_feature_wheel: (value) => ipcRenderer.send('_loadouts_feature_wheel',value)

})