const {globalShortcut,ipcMain} = require('electron')
const {uIOhook, UiohookKey } = require('uiohook-napi');
const {playSound} = require('../../_window_music')
const {toolbarLog} = require('../../_window_toolbar')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let mainWindow
let mainStore
let Kpressed = false
let Lpressed = false


let curloadout
let lstloadout

let playSwitchSound = false
let wheelSwitch = false

async function _switch_to_loadout(idx,_real = true){
    if(playSwitchSound) playSound(`./music/equip${Math.floor(Math.random() * 6)}.mp3`);
    // console.log(`-> ${idx}`,idx+1,(idx+1)%10,curloadout);
    fst = (idx<10?'L':'K')
    snd = (idx<10?`${(idx+1)%10}`:`${(idx-10+1)%10}`)
    if(_real){
        mainWindow.webContents.sendInputEvent({ type: 'keyDown', keyCode: fst });
        await sleep(20)
        mainWindow.webContents.sendInputEvent({ type: 'keyDown', keyCode: snd });
        await sleep(20)
        mainWindow.webContents.sendInputEvent({ type: 'keyUp', keyCode: fst });
        mainWindow.webContents.sendInputEvent({ type: 'keyUp', keyCode: snd });
    }

    if(idx==curloadout) return ;

    mainStore.set('_loadouts_cur',idx)
    mainStore.set('_loadouts_lst',curloadout)
    toolbarLog(`切换至套装 ${fst}+${snd}`)
    lstloadout=curloadout
    curloadout=idx
}

async function _switch_to_prev_loadout(_real = true){
    _switch_to_loadout((curloadout-1+20)%20,_real)
}
async function _switch_to_next_loadout(_real = true){
    _switch_to_loadout((curloadout+1)%20,_real)
}
async function _switch_to_last_loadout(_real = true){
    _switch_to_loadout(lstloadout,_real)
}


function _loadouts_init(_window,_store){
    mainWindow=_window
    mainStore=_store

    uIOhook.on('keydown', (e) => {
        if (e.keycode === UiohookKey.K) Kpressed = 1;
        if (e.keycode === UiohookKey.L) Lpressed = 1;
        if (e.keycode >= UiohookKey['1'] && e.keycode <= UiohookKey['0'] && (Kpressed || Lpressed) && mainWindow.isFocused()){
            idx=e.keycode-UiohookKey['1']
            if(Kpressed){
                idx+=10;
            }
            _switch_to_loadout(idx,false);
        }
    });
    uIOhook.on('keyup', (e) => {
        if (e.keycode === UiohookKey.K) Kpressed = 0;
        if (e.keycode === UiohookKey.L) Lpressed = 0;
    });
}

function _loadouts_loadstore(_curloadout,_lstloadout,_playSwitchSound,_wheelSwitch){
    curloadout=_curloadout
    lstloadout=_lstloadout
    playSwitchSound=_playSwitchSound
    wheelSwitch=_wheelSwitch
}

uIOhook.on('wheel', (event) => {
    if(wheelSwitch){
        if(mainWindow.isFocused())  _switch_to_loadout((curloadout+event.rotation+20)%20)
    }
});

// 监听
ipcMain.on('_loadouts_feature_sound',(event,val)=>{
    playSwitchSound=val
})
ipcMain.on('_loadouts_feature_wheel',(event,val)=>{
    wheelSwitch=val
})

module.exports = {_loadouts_init,_loadouts_loadstore}