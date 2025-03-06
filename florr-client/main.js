const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require("path");
const mapCode = require('./mapCode')
const { createToolbarWindow, toolbarLog, toolbarUpdMapCode, _toolbar_setMainQuited ,_toolbar_window_init} = require('./_window_toolbar');
const { createMusicWindow, _music_setMainQuited, changeBGM, setPause, playSound,_music_window_init } = require('./_window_music');
// const sound = require("sound-play")
const { uIOhook, UiohookKey } = require('uiohook-napi');

const {_loadouts_init,_loadouts_loadstore} = require('./modules/loadouts/loadouts');
const { _loadouts_window_loadstore } = require('./modules/loadouts/_window_loadouts');

let mainWindow;
// let overlayWindow
// let initCompleted = false
let mapcode = new mapCode()
let bosshide = false
let toolbarhide = true
let musichide = true
// let tmp = false
let store

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// const store = new Store({
//     defaults: {
//         lockEQ: false,
//         musicKit: 'terraria',
//         musicVolume: 0.2,
//         serverListVisible: false // 服务器列表可见性
//     }
// });

//处理日志
function processLog(logMsg) {
    console.log("florr.io Console:", logMsg);

    match = logMsg.match(/^Connecting to ([a-z0-9]+)\../)

    if (match) {
        // toolbarLog("连接到新服务器")
        mapcode.updCurMapCode(match[1]);
        toolbarUpdMapCode(match[1])
        changeBGM(mapcode.getMapByCode(match[1]));
        // toolbarCMD("setCurMapCode("+match[1]+")");
        return;
    }
}

//同步附加层
// function syncOverlay() {
//     const bounds = mainWindow.getBounds();
//     const isFullScreen = mainWindow.isFullScreen();
//     const titleBarHeight = process.platform === 'win32' && !isFullScreen ? 32 : 0; // Windows 标题栏高度

//     overlayWindow.setPosition(bounds.x, bounds.y + titleBarHeight);
//     overlayWindow.setSize(bounds.width, bounds.height - titleBarHeight);
// }

//按键事件管理
let EQlock = false
function keyEventRegister() {
    mainWindow.on('blur', () => {
        globalShortcut.unregister('E');
        globalShortcut.unregister('Q');
        // overlayWindow.hide();
    });

    mainWindow.on('focus', () => {
        if(EQlock)  globalShortcut.register('E', () => { });
        if(EQlock)  globalShortcut.register('Q', () => { });
        // overlayWindow.show(); // 确保显示
        // overlayWindow.setAlwaysOnTop(true); // 强制置顶
        // syncOverlay();
    });
    if(EQlock)  globalShortcut.register('E', () => { });
    if(EQlock)  globalShortcut.register('Q', () => { });
    uIOhook.on('keydown', (e) => {
        if (e.keycode === UiohookKey.E) {
            if (!EQlock) mainWindow.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'E' });
        }
        if (e.keycode === UiohookKey.Q) {
            if (!EQlock) mainWindow.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'Q' });
        }
    });
    uIOhook.on('keyup', (e) => {
        if (e.keycode === UiohookKey.E) {
            if (!EQlock) mainWindow.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'E' });
        }
        if (e.keycode === UiohookKey.Q) {
            if (!EQlock) mainWindow.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'Q' });
        }
    });

    //EQlock更新
    ipcMain.on('_updEQlock', (_event, status) => {
        // console.log(status);
        mainWindow.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'E' });
        mainWindow.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'Q' });
        EQlock = status
        if(status==0){
            globalShortcut.unregister('E');
            globalShortcut.unregister('Q');
        }
        if(status==1 && mainWindow.isFocused()){
            globalShortcut.register('E', () => { });
            globalShortcut.register('Q', () => { });
        }
    })
}

//设定转速
async function setFlorrEQ(val) {
    mainWindow.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'E' });
    await sleep(1000)
    mainWindow.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'E' });
    if (val == 1.0) return;
    mainWindow.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'Q' });
    await sleep(Math.floor(1000.0 * ((1.0 - val) / 0.7)));
    mainWindow.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'Q' });
}


//附加层初始化
// function loadOverlayWindow(){
//     // 附加层窗口
//     overlayWindow = new BrowserWindow({
//         width: mainWindow.getBounds().width,
//         height: mainWindow.getBounds().height - 32,
//         x: mainWindow.getBounds().x,
//         y: mainWindow.getBounds().y + 32,
//         frame: false,           // 无边框
//         transparent: true,      // 透明背景
//         // alwaysOnTop: true,      // 置顶
//         // skipTaskbar: true,      // 不显示在任务栏
//         // focusable: false,       // 不可聚焦
//         webPreferences: {
//             nodeIntegration: true, // 允许简单 DOM 操作
//             contextIsolation: false
//         }
//     });
//     overlayWindow.loadFile(path.join(__dirname, 'overlay.html'));
//     overlayWindow.setIgnoreMouseEvents(true, { forward: true });
//     overlayWindow.setAlwaysOnTop(true, 'screen-saver'); // 更高层级 

//     // 同步主窗口位置和大小
//     mainWindow.on('move', syncOverlay);
//     mainWindow.on('resize', syncOverlay);
//     mainWindow.on('enter-full-screen', () => syncOverlay());
//     mainWindow.on('leave-full-screen', () => syncOverlay());
    
//     mainWindow.on('minimize', () => {
//         // overlayWindow.hide();
//     });
    
//     mainWindow.on('restore', () => {
//         overlayWindow.show();
//         syncOverlay();
//     });
//     syncOverlay();
// }

function _main_init(_EQlock){
    EQlock=_EQlock
}

//Main
app.whenReady().then(async () => {
    process.on('unhandledRejection', (reason, p) => {
        console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
        // application specific logging, throwing an error, or other logic here
      });
      
    //设置存储
    const Store = (await import('electron-store')).default;
    store = new Store({
        defaults: {
            lockEQ: false,
            musicKit: 'terraria',
            musicVolume: 0.2,
            serverListVisible: false,
            _loadouts_cur: 0,
            _loadouts_lst: 1,
            _loadouts_binds_0: '',
            _loadouts_binds_1: '',
            _loadouts_binds_2: '',
            _loadouts_binds_3: '',
            _loadouts_binds_4: '',
            _loadouts_binds_5: '',
            _loadouts_binds_6: '',
            _loadouts_binds_7: '',
            _loadouts_binds_8: '',
            _loadouts_binds_9: '',
            _loadouts_binds_10: '',
            _loadouts_binds_11: '',
            _loadouts_binds_12: '',
            _loadouts_binds_13: '',
            _loadouts_binds_13: '',
            _loadouts_binds_14: '',
            _loadouts_binds_15: '',
            _loadouts_binds_16: '',
            _loadouts_binds_17: '',
            _loadouts_binds_18: '',
            _loadouts_binds_19: '',
            _loadouts_binds_prev: '',
            _loadouts_binds_next: '',
            _loadouts_binds_last: '',
            _loadouts_features_sound: true,
            _loadouts_features_wheel: false
        }
    });

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        title: "Florr Client",
        icon: path.join(__dirname, './icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false
        }
    });

    mainWindow.setMenu(null);
    // mainWindow.loadURL("https://florr.io");

    // 附加层窗口
    // loadOverlayWindow();


    //加载工具栏窗口
    toolbarWindow = createToolbarWindow();
    toolbarWindow.hide()

    //加载音乐栏窗口
    musicWindow = createMusicWindow();
    musicWindow.hide()

    // 套装功能初始化
    _loadouts_init(mainWindow,store)

    //初始化存储
    _main_init(store.get('lockEQ'));
    _music_window_init(store.get('musicKit'),store.get('musicVolume'))
    _toolbar_window_init(store.get('lockEQ'),store.get('serverListVisible'))
    _loadouts_loadstore(store.get('_loadouts_cur'),store.get('_loadouts_lst'),store.get('_loadouts_features_sound'),store.get('_loadouts_features_wheel'));
    _loadouts_window_loadstore(store);
    ipcMain.on('_changeSettings',async (_event,ls)=>{
        store.set(ls[0],ls[1]);
        console.log(`set ${ls[0]} to ${ls[1]}`);
    })

    //开发者工具快捷键
    globalShortcut.register('CommandOrControl+Shift+I', () => {
        mainWindow.webContents.toggleDevTools();
    });
    //工具栏
    globalShortcut.register('CommandOrControl+K', () => {
        if (bosshide) return;
        playSound('./music/click.mp3');
        if (toolbarWindow && !toolbarWindow.isDestroyed())
            if (toolbarWindow.isVisible()) {
                toolbarWindow.hide();
                console.log('hide-tools');
                toolbarhide = true
            } else {
                toolbarWindow.show();
                console.log('show-tools');
                toolbarhide = false
            }
        else {
            toolbarWindow = createToolbarWindow();
            console.log('build-tools');
            toolbarhide = false
        }
    });
    //音乐栏
    globalShortcut.register('CommandOrControl+M', () => {
        if (bosshide) return;
        playSound('./music/click.mp3');
        if (musicWindow && !musicWindow.isDestroyed())
            if (musicWindow.isVisible()) {
                musicWindow.hide();
                console.log('hide-music');
            } else {
                musicWindow.show();
                console.log('show-music');
            }
        else {
            musicWindow = createMusicWindow();
            console.log('build-music');
        }
    });

    //一键隐藏游戏
    globalShortcut.register('Alt+X', () => {
        playSound('./music/click.mp3');
        if (mainWindow.isVisible()) {
            bosshide = true
            toolbarhide = !toolbarWindow.isVisible();
            musichide = !musicWindow.isVisible();
            mainWindow.hide();
            toolbarWindow.hide();
            musicWindow.hide();
            setPause(1);
            toolbarLog("Florr Client 已隐藏")
        } else {
            bosshide = false
            mainWindow.show();
            if (!toolbarhide) toolbarWindow.show();
            if (!musichide) musicWindow.show();
            setPause(0);
            toolbarLog("Florr Client 已显示")
        }

    });


    globalShortcut.register('Alt+E', async () => {
        // console.log(overlayWindow.isVisible());
    })

    //uIOhook监听
    uIOhook.start();
    //按键事件管理
    keyEventRegister();

    // mainWindow.webContents.on('did-finish-load', () => {
    //     mainWindow.webContents.executeJavaScript(`
    //         const originalArc = CanvasRenderingContext2D.prototype.arc;
    //         CanvasRenderingContext2D.prototype.arc = function(x, y, radius, startAngle, endAngle, counterclockwise) {
    //             const angleRange = Math.abs(endAngle - startAngle);
    //             const fullCircle = 2 * Math.PI;
    //             const percentage = (angleRange / fullCircle) * 100;
    //             if(percentage<99)console.log( x, y, radius, startAngle, endAngle, percentage );
    //             return originalArc.apply(this, arguments);
    //         };
    //     `).catch(err => console.error('注入失败:', err));
    // });

    // initCompleted = true;

    // 拦截所有 HTTP/HTTPS 请求
    const httpFilter = { urls: ['http://*/*', 'https://*/*'] };
    mainWindow.webContents.session.webRequest.onBeforeRequest(httpFilter, (details, callback) => {
        console.log('HTTP/HTTPS 请求发起:', details.method, details.url);
        callback({ cancel: false });
    });

    mainWindow.webContents.session.webRequest.onCompleted(httpFilter, (details) => {
        console.log('HTTP/HTTPS 请求完成:', details.method, details.url, '状态码:', details.statusCode);
    });

    // 拦截 WebSocket 请求
    // const wsFilter = { urls: ['wss://*/*'] };
    // mainWindow.webContents.session.webRequest.onBeforeRequest(wsFilter, (details, callback) => {
    //     console.log('WebSocket 请求发起:', details.url);
    //     callback({ cancel: false });
    // });

    // mainWindow.webContents.on('did-finish-load', async () => {
    //     if(tmp) return ;
    //     tmp=1
    //     await sleep(1000)
    //     console.log(5)
    //     await sleep(1000)
    //     console.log(4)
    //     await sleep(1000)
    //     console.log(3)
    //     await sleep(1000)
    //     console.log(2)
    //     await sleep(1000)
    //     console.log(1)
    //     await sleep(10000)
    //     try {
    //         await mainWindow.webContents.executeJavaScript(`
    //             const tracked = {};
    //             for (const key in window) {
    //                 if (typeof window[key] === 'object' && 
    //                     window[key] && 
    //                     key !== 'location' && 
    //                     key !== 'document') { // 排除特殊对象
    //                     window[key] = new Proxy(window[key], {
    //                         set(target, prop, value) {
    //                             console.log('Change in ' + key + '.' + prop + ': ', value);
    //                             return Reflect.set(target, prop, value);
    //                         }
    //                     });
    //                 }
    //             }
    //         `);
    //     } catch (error) {
    //         console.error('fail:', error.message);
    //         // mainWindow.webContents.openDevTools();
    //     }
    // });

    // 使用 debugger 捕获详细网络数据
    mainWindow.webContents.debugger.attach("1.3");
    mainWindow.webContents.debugger.sendCommand("Runtime.enable");
    mainWindow.webContents.debugger.sendCommand("Network.enable");

    mainWindow.webContents.debugger.on("message", (event, method, params) => {
        // 捕获控制台日志
        if (method === "Runtime.consoleAPICalled") {
            const logMessage = params.args.map(arg => arg.value).join(" ");
            if (logMessage[0] === "%") return;

            processLog(logMessage);
        }
        // 捕获 HTTP/HTTPS 响应内容
        if (method === "Network.responseReceived") {
            const response = params.response;
            console.log('HTTP/HTTPS 响应:', response.url, '状态码:', response.status);
            // 获取响应体
            mainWindow.webContents.debugger.sendCommand("Network.getResponseBody", { requestId: params.requestId }, (err, result) => {
                if (!err) {
                    console.log('响应内容:', result.body);
                    try {
                        const jsonData = JSON.parse(result.body);
                        console.log('解析后的 JSON:', jsonData);
                    } catch (e) {
                        console.log('非 JSON 响应或解析失败');
                    }
                }
            });
        }
        // 捕获 WebSocket 数据
        // if (method === "Network.webSocketCreated") {
        //     console.log("WebSocket 创建:", params.url);
        // }
        // if (method === "Network.webSocketFrameReceived") {
        //     console.log("WebSocket 数据接收:", params.response.payloadData);
        // }
        // if (method === "Network.webSocketFrameSent") {
        //     console.log("WebSocket 数据发送:", params.response.payloadData);
        // }
    });

    // 主窗口强制退出程序
    mainWindow.on('close', (event) => {
        event.preventDefault(); // 阻止默认关闭行为
        _toolbar_setMainQuited();
        toolbarWindow.close();
        _music_setMainQuited();
        musicWindow.close();
        // mainWindow.destroy();
        // await sleep(1000)
        mainWindow.destroy();
        app.quit();
        // if (toolbarWindow && !toolbarWindow.isDestroyed()) {
        //     toolbarWindow.destroy();
        // }
        // if (musicWindow && !musicWindow.isDestroyed()) {
        //     musicWindow.destroy();
        // }
        // overlayWindow.close();
        // mainWindow = null;
        // app.quit();
    });

    //地图代码初始化
    await mapcode.initMapCodes();
    toolbarWindow.webContents.send('setMapCodeList', [...mapcode.code2idx]);

    // 处理地图代码更新请求
    ipcMain.on('_updMapCode', async () => {
        await mapcode.initMapCodes();
        toolbarWindow.webContents.send('setMapCodeList', [...mapcode.code2idx]);
    });

    //处理转速设定请求
    ipcMain.on('_setFlorrEQ', async (_event, val) => {
        // console.log(val);
        setFlorrEQ(val);
    })
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});