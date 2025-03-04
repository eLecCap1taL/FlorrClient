const { ipcRenderer ,contextBridge} = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
    updMapCode: () => ipcRenderer.send('updMapCode')
})
// process.once('loaded', () => {
//     // window.ipcRenderer = ipcRenderer; // 暴露 ipcRenderer 给渲染进程
//     console.log(window.tmpvar);
//     console.log('extraPreload.js 已加载,ipcRenderer 已暴露'); // 添加调试日志
// });