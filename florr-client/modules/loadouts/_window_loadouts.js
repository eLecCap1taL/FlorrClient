const { BrowserWindow,globalShortcut } = require('electron');
const path = require('path');
const {playSound} = require('../../_window_music')

let ifMainQuited=false
function _loadouts_setMainQuited(){
    ifMainQuited=true
}

function _loadouts_window_loadstore(store){
    data=[]
    for(i=0;i<20;i++){
        data.push(store.get(`_loadouts_binds_${i}`));
    }
    data.push(store.get('_loadouts_binds_prev'));
    data.push(store.get('_loadouts_binds_next'));
    data.push(store.get('_loadouts_binds_last'));
    data.push(store.get('_loadouts_features_sound'));
    data.push(store.get('_loadouts_features_wheel'));
    // console.log(data);
    loadoutsWindow.webContents.send('_init',data);
}

function createLoadoutsWindow() {
    const loadoutsWindow = new BrowserWindow({
        width: 600,
        height: 800,
        title: 'Loadouts Keybinds',
        resizable: false,
        frame: true,
        icon: path.join(__dirname, '../../icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '_window_loadouts_preload.js')
        }
    });

    loadoutsWindow.loadFile(path.join(__dirname, '_window_loadouts.html'));
    loadoutsWindow.setMenu(null);

    //开发者工具快捷键
    globalShortcut.register('CommandOrControl+Shift+J', () => {
        loadoutsWindow.webContents.toggleDevTools();
    });

    loadoutsWindow.on('close', (event) => {
        //用于当主窗口退出时正常退出，主窗口会先调用setMainQuited()
        if(!ifMainQuited){
            event.preventDefault(); // 阻止默认关闭行为
            playSound('./music/click.mp3');
            loadoutsWindow.hide();
        }
    });

    return loadoutsWindow;
}

module.exports = { createLoadoutsWindow,_loadouts_setMainQuited,_loadouts_window_loadstore};