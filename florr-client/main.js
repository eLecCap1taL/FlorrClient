const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require("path");
const mapCode = require('./mapCode')
const { createToolbarWindow, toolbarLog, toolbarUpdMapCode, _toolbar_setMainQuited } = require('./_window_toolbar');
const { createMusicWindow, _music_setMainQuited, changeBGM, setPause, playSound } = require('./_window_music');
// const sound = require("sound-play")
const { uIOhook, UiohookKey } = require('uiohook-napi');

let mainWindow;
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

//按键事件管理
let EQlock = false
let Kpressed = false
let Lpressed = false
function keyEventRegister() {
    mainWindow.on('blur', () => {
        globalShortcut.unregister('E');
        globalShortcut.unregister('Q');
    });

    mainWindow.on('focus', () => {
        globalShortcut.register('E', () => { });
        globalShortcut.register('Q', () => { });
    });
    globalShortcut.register('E', () => { });
    globalShortcut.register('Q', () => { });
    uIOhook.on('keydown', (e) => {
        if (e.keycode === UiohookKey.E) {
            if (!EQlock) mainWindow.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'E' });
        }
        if (e.keycode === UiohookKey.Q) {
            if (!EQlock) mainWindow.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'Q' });
        }
        if (e.keycode === UiohookKey.K) Kpressed = 1;
        if (e.keycode === UiohookKey.L) Lpressed = 1;
        if (e.keycode >= UiohookKey['1'] && e.keycode <= UiohookKey['0'] && (Kpressed || Lpressed) && mainWindow.isFocused()) playSound(`./music/equip${Math.floor(Math.random() * 6)}.mp3`);
    });
    uIOhook.on('keyup', (e) => {
        if (e.keycode === UiohookKey.E) {
            if (!EQlock) mainWindow.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'E' });
        }
        if (e.keycode === UiohookKey.Q) {
            if (!EQlock) mainWindow.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'Q' });
        }
        if (e.keycode === UiohookKey.K) Kpressed = 0;
        if (e.keycode === UiohookKey.L) Lpressed = 0;
    });

    ipcMain.on('_updEQlock', (_event, status) => {
        // console.log(status);
        mainWindow.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'E' });
        mainWindow.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'Q' });
        EQlock = status
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

//Main
app.whenReady().then(async () => {
    const Store = (await import('electron-store')).default;
    store = new Store({
        defaults: {
            lockEQ: false,
            musicKit: 'terraria',
            musicVolume: 0.2,
            serverListVisible: false
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
    mainWindow.loadURL("https://florr.io");

    //加载工具栏窗口
    toolbarWindow = createToolbarWindow();
    toolbarWindow.hide()

    //加载音乐栏窗口
    musicWindow = createMusicWindow();
    musicWindow.hide()

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
        console.log("begin")
        await setFlorrEQ(0.65);
        console.log("end");
    })

    //uIOhook监听
    uIOhook.start();
    //按键事件管理
    keyEventRegister();

    // initCompleted = true;

    // 拦截所有 HTTP/HTTPS 请求
    // const httpFilter = { urls: ['http://*/*', 'https://*/*'] };
    // mainWindow.webContents.session.webRequest.onBeforeRequest(httpFilter, (details, callback) => {
    //     console.log('HTTP/HTTPS 请求发起:', details.method, details.url);
    //     callback({ cancel: false });
    // });

    // mainWindow.webContents.session.webRequest.onCompleted(httpFilter, (details) => {
    //     console.log('HTTP/HTTPS 请求完成:', details.method, details.url, '状态码:', details.statusCode);
    // });

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
        // if (method === "Network.responseReceived") {
        //     const response = params.response;
        //     console.log('HTTP/HTTPS 响应:', response.url, '状态码:', response.status);
        //     // 获取响应体
        //     mainWindow.webContents.debugger.sendCommand("Network.getResponseBody", { requestId: params.requestId }, (err, result) => {
        //         if (!err) {
        //             console.log('响应内容:', result.body);
        //             try {
        //                 const jsonData = JSON.parse(result.body);
        //                 console.log('解析后的 JSON:', jsonData);
        //             } catch (e) {
        //                 console.log('非 JSON 响应或解析失败');
        //             }
        //         }
        //     });
        // }
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
    mainWindow.on('closed', () => {
        if (toolbarWindow && !toolbarWindow.isDestroyed()) {
            _toolbar_setMainQuited();
            toolbarWindow.destroy();
        }
        if (musicWindow && !musicWindow.isDestroyed()) {
            _music_setMainQuited();
            musicWindow.destroy();
        }
        mainWindow = null;
        app.quit();
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