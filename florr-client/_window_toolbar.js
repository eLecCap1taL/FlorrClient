const { BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const {playSound} = require('./_window_music')
const {createLoadoutsWindow,_loadouts_setMainQuited} = require('./modules/loadouts/_window_loadouts')

let ifMainQuited = false
function _toolbar_setMainQuited(){
    ifMainQuited=true
}

let loadoutshide;

function toolbarLog(logstring){
    toolbarWindow.webContents.send('log',logstring)
}
function toolbarUpdMapCode(mapcode){
    toolbarWindow.webContents.send('setCurMapCode',mapcode)
}

function _toolbar_window_init(store){

    toolbarWindow.webContents.send('_init',[store.get('lockEQ'),store.get('serverListVisible'),store.get('displayPetalCD'),store.get('displayBuffCD')]);
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

    // 加载套装窗口
    loadoutsWindow=createLoadoutsWindow();
    loadoutsWindow.hide();

    //监听开启套装窗口的事件
    ipcMain.on('_openLoadoutsWindow',()=>{
        playSound('./music/click.mp3');
        if(loadoutsWindow.isVisible()){
            loadoutsWindow.hide();
        }else{
            loadoutsWindow.show();
        }
    })

    //拦截关闭，变为隐藏
    toolbarWindow.on('close', (event) => {
        //用于当主窗口退出时正常退出，主窗口会先调用setMainQuited()
        if(!ifMainQuited){
            event.preventDefault(); // 阻止默认关闭行为
            playSound('./music/click.mp3');
            toolbarWindow.hide();
        }else{
            _loadouts_setMainQuited();
            loadoutsWindow.close();
        }
    });

    //劫持hide和show，用于正确处理子窗口
    toolbarWindow.on('hide',(event)=>{
        loadoutshide=loadoutsWindow.isVisible();
        loadoutsWindow.hide();
    })
    toolbarWindow.on('show',(event)=>{
        if(loadoutshide)   loadoutsWindow.show();
    })

    return toolbarWindow;
}

module.exports = { createToolbarWindow ,_toolbar_setMainQuited,toolbarLog,toolbarUpdMapCode,_toolbar_window_init};