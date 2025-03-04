const { ipcRenderer ,contextBridge} = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
    updMapCode: () => ipcRenderer.send('_updMapCode'),
    onUpdMapCodeList: (callback) => ipcRenderer.on('setMapCodeList', (_event, value) => callback(value)),
    onLog: (callback) => ipcRenderer.on('log', (_event, value) => callback(value)),
    onSetCurMapCode: (callback) => ipcRenderer.on('setCurMapCode', (_event, value) => callback(value))
})
// process.once('loaded', () => {
//     // window.ipcRenderer = ipcRenderer; // 暴露 ipcRenderer 给渲染进程
//     console.log(window.tmpvar);
//     console.log('extraPreload.js 已加载,ipcRenderer 已暴露'); // 添加调试日志
// });