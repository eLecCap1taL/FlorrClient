const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require("path");
const mapCode = require('./mapCode')
const { createToolbarWindow, toolbarLog, toolbarUpdMapCode, _toolbar_setMainQuited ,_toolbar_window_init} = require('./_window_toolbar');
const { createMusicWindow, _music_setMainQuited, changeBGM, setPause, playSound,_music_window_init } = require('./_window_music');
// const sound = require("sound-play")
const { uIOhook, UiohookKey } = require('uiohook-napi');
const fs = require('fs').promises;

const {_loadouts_init,_loadouts_loadstore} = require('./modules/loadouts/loadouts');
const { _loadouts_window_loadstore } = require('./modules/loadouts/_window_loadouts');
const { log } = require('console');

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
    match = logMsg.match(/^Connecting to ([a-z0-9]+)\../)

    //处理服号
    if (match) {
        // toolbarLog("连接到新服务器")
        mapcode.updCurMapCode(match[1]);
        toolbarUpdMapCode(match[1])
        changeBGM(mapcode.getMapByCode(match[1]));
        // toolbarCMD("setCurMapCode("+match[1]+")");
        return;
    }
    //处理florrEvents
    if (logMsg.startsWith('$FCset')){
        const parts = logMsg.split(' ');
        if (parts.length !== 3) {
            console.error('无效指令格式');
            return;
        }

        [, key, value] = parts;
        if(value=='true')   value=true
        if(value=='false')  value=false
        florrEvents[key]=value
        checkEQpass()
        return ;
    }
    console.log("florr.io Console:", logMsg);
}

//同步附加层
// function syncOverlay() {
//     const bounds = mainWindow.getBounds();
//     const isFullScreen = mainWindow.isFullScreen();
//     const titleBarHeight = process.platform === 'win32' && !isFullScreen ? 32 : 0; // Windows 标题栏高度

//     overlayWindow.setPosition(bounds.x, bounds.y + titleBarHeight);
//     overlayWindow.setSize(bounds.width, bounds.height - titleBarHeight);
// }

//判断是否需要放行EQ
let EQlock = false
function checkEQpass(){
    globalShortcut.register('E',()=>{});
    globalShortcut.register('Q',()=>{});
    if(!mainWindow.isFocused()){
        globalShortcut.unregister('E');
        globalShortcut.unregister('Q');
    }
    if(!EQlock){
        globalShortcut.unregister('E');
        globalShortcut.unregister('Q');
        return true
    }
    if(florrEvents['chat']) return false
    if(florrEvents['talent'] || florrEvents['craft'] || florrEvents['bag']) return false
    globalShortcut.unregister('E');
    globalShortcut.unregister('Q');
    return true
}


//按键事件管理
function keyEventRegister() {

    mainWindow.on('blur', () => {
        checkEQpass()
    });

    mainWindow.on('focus', () => {
        checkEQpass()
    });
    checkEQpass()

    //EQlock更新
    ipcMain.on('_updEQlock', (_event, status) => {
        // console.log(status);
        EQlock = status
        checkEQpass()
    })
}

//设定转速
function setFlorrEQ(val) {
    mainWindow.webContents.executeJavaScript(`window.setRotate(${val})`)
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

//加载用户脚本
async function loadScripts() {
    const scriptsDir = path.join(__dirname, 'user_scripts');
    try {
        const files = await fs.readdir(scriptsDir);
        const jsFiles = files.filter(file => file.endsWith('.js'));
        const scripts = await Promise.all(
            jsFiles.map(async file => {
                const content = await fs.readFile(path.join(scriptsDir, file), 'utf8');
                return { name: file, content };
            })
        );
        return scripts;
    } catch (error) {
        console.error('加载脚本失败:', error);
        return [];
    }
}

//监听各类事件
let florrEvents=new Map()
florrEvents['chat']=false
florrEvents['bag']=false
florrEvents['craft']=false
florrEvents['talent']=false

function _main_init(store){
    EQlock=store.get('lockEQ')
    mainWindow.webContents.executeJavaScript(`window.setDisplayPetalCD(${store.get('displayPetalCD')})`)
    mainWindow.webContents.executeJavaScript(`window.setDisplayBuffCD(${store.get('displayBuffCD')})`)
    checkEQpass()
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
            _loadouts_features_wheel: false,
            displayPetalCD: true,
            displayBuffCD: true,
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


    //加载user_scripts
    mainWindow.webContents.on('did-finish-load', async () => {
        const scripts = await loadScripts();
        for (const script of scripts) {
            try {
                await mainWindow.webContents.executeJavaScript(script.content);
                console.log(`注入脚本: ${script.name}`);
            } catch (error) {
                console.error(`注入 ${script.name} 失败:`, error);
            }
        }

        //初始化存储
        _main_init(store);
        _music_window_init(store.get('musicKit'),store.get('musicVolume'))
        _toolbar_window_init(store)
        _loadouts_loadstore(store.get('_loadouts_cur'),store.get('_loadouts_lst'),store.get('_loadouts_features_sound'),store.get('_loadouts_features_wheel'));
        _loadouts_window_loadstore(store);
        ipcMain.on('_changeSettings',async (_event,ls)=>{
            store.set(ls[0],ls[1]);
            console.log(`set ${ls[0]} to ${ls[1]}`);
        })
    });

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
    globalShortcut.register('F5', () => {
        mainWindow.webContents.reloadIgnoringCache();
        console.log('F5 强制刷新');
    });

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
        setFlorrEQ(val);
    })

    //处理FPS设定请求
    ipcMain.on('_setFlorrFPS', async (_event, val) => {
        mainWindow.webContents.executeJavaScript(`window.setFpsLimit(${val})`)
    })

    //处理花瓣CD显示请求
    ipcMain.on('_updDisplayPetalCD', async (_event, val) => {
        // console.log(`petal ${val}`);
        mainWindow.webContents.executeJavaScript(`window.setDisplayPetalCD(${val})`)
    })
    //处理BuffCD显示请求
    ipcMain.on('_updDisplayBuffCD', async (_event, val) => {
        // console.log(`buff ${val}`);
        mainWindow.webContents.executeJavaScript(`window.setDisplayBuffCD(${val})`)
    })
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});