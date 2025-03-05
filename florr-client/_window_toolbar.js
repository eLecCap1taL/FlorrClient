const { BrowserWindow} = require('electron');
const path = require('path');

let ifMainQuited = false
function _toolbar_setMainQuited(){
    ifMainQuited=true
}

function toolbarLog(logstring){
    toolbarWindow.webContents.send('log',logstring)
}
function toolbarUpdMapCode(mapcode){
    toolbarWindow.webContents.send('setCurMapCode',mapcode)
}

function createToolbarWindow() {
    const toolbarWindow = new BrowserWindow({
        width: 500,
        height: 700,
        title: "Florr Client Tools",
        icon: path.join(__dirname, './icon.ico'),
        resizable: false, // 禁止调整大小
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '_window_toolbar_preload.js') // 使用 preload 脚本
        }
    });

    // 加载本地 HTML 文件
    toolbarWindow.loadFile(path.join(__dirname, './_window_toolbar.html'));

    // 移除菜单栏
    toolbarWindow.setMenu(null);
    // toolbarWindow.webContents.toggleDevTools();
    // console.log("test");

    //拦截关闭，变为隐藏
    toolbarWindow.on('close', (event) => {
        //用于当主窗口退出时正常退出，主窗口会先调用setMainQuited()
        if(!ifMainQuited){
            event.preventDefault(); // 阻止默认关闭行为
            toolbarWindow.hide();
        }
    });

    return toolbarWindow;
}

module.exports = { createToolbarWindow ,_toolbar_setMainQuited,toolbarLog,toolbarUpdMapCode};