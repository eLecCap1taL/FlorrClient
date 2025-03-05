// musicWindow.js
const { BrowserWindow,ipcMain } = require('electron');
const path = require('path');
const { toolbarLog } = require('./_window_toolbar');

let ifMainQuited = false
function _music_setMainQuited(){
    ifMainQuited=true
}

let kit='terraria'
let curmap='Unknown'

function _music_getLstMap(){
    return curmap
}

function changeBGM(mapname){
    if(typeof mapname == "undefined")   mapname = "Unknown"
    curmap=mapname
    if(kit=='none') return ;
    musicpath = ''
    if(mapname!='Unknown'){
        musicpath=`file:///music/${kit}/${mapname}.mp3`
    }
    console.log(`music switch to ${musicpath}`)
    toolbarLog(`切换音乐为 ${kit} ${mapname}`)
    musicWindow.webContents.send('setMusic',[musicpath,`${kit} ${mapname}`]);
}

function setPause(val){
    // console.log(val)
    musicWindow.webContents.send('setPause',val);
}

function _music_window_init(_kit,_volume){
    kit=_kit
    // console.log(_kit);
    musicWindow.webContents.send('_init',[_kit,_volume]);
}

function createMusicWindow() {
    const musicWindow = new BrowserWindow({
        width: 400,
        height: 300,
        title: "Florr Client Music",
        icon: path.join(__dirname, './icon.ico'),
        resizable: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '_window_music_preload.js')
        }
    });

    musicWindow.loadFile(path.join(__dirname, '_window_music.html'));
    musicWindow.setMenu(null);

    ipcMain.on('_changeMusicKit',(event,kitname)=>{
        kit=kitname
        changeBGM(curmap);
        console.log(kitname);
    });

    musicWindow.on('close', (event) => {
        if(!ifMainQuited){
            event.preventDefault(); // 阻止默认关闭行为
            musicWindow.hide();
        }
    });

    return musicWindow;
}

function playSound(spath){
    musicWindow.webContents.send('playSound',spath);
}

module.exports = { createMusicWindow ,_music_setMainQuited,changeBGM,setPause,_music_getLstMap,playSound,_music_window_init};