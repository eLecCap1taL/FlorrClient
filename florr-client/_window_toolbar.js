const { BrowserWindow} = require('electron');
const path = require('path');

let ifMainQuited = false
function setMainQuited(){
    ifMainQuited=true
}

function toolbarLog(logstring){
    toolbarWindow.webContents.executeJavaScript('appendLog("'+logstring+'")')
}
function toolbarUpdMapCode(mapcode){
    toolbarWindow.webContents.executeJavaScript('setCurMapCode("'+mapcode+'")')
}

// function toolbarCMD(cmdstring){
//     toolbarWindow.webContents.executeJavaScript(cmdstring)
// }

function createToolbarWindow() {
    const toolbarWindow = new BrowserWindow({
        width: 500,
        height: 600,
        title: "Florr Client Tools",
        icon: path.join(__dirname, './icon.ico'),
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
    // toolbarWindow.webContents.toggleDevTools    ();

    // console.log("test");

    //拦截关闭，变为隐藏
    toolbarWindow.on('close', (event) => {
        //用于当主窗口退出时正常退出，主窗口会先调用setMainQuited()
        if(!ifMainQuited){
            event.preventDefault(); // 阻止默认关闭行为
            toolbarWindow.hide();
        }
        // if (extraWindow.webContents) {
        //     extraWindow.webContents.send('log-message', '工具栏窗口已隐藏（点击关闭按钮）');
        // }
    });

    return toolbarWindow;
}

module.exports = { createToolbarWindow ,setMainQuited,toolbarLog,toolbarUpdMapCode};