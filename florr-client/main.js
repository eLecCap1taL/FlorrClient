const { app, BrowserWindow, globalShortcut,ipcMain } = require('electron');
const path = require("path");
const mapCode = require('./mapCode')
const { createToolbarWindow,toolbarLog,toolbarUpdMapCode, _toolbar_setMainQuited } = require('./_window_toolbar');
const { createMusicWindow ,_music_setMainQuited, changeBGM,setPause} = require('./_window_music');

let mainWindow;
// let initCompleted = false
let mapcode=new mapCode()
let bosshide=false
let toolbarhide=true
let musichide=true

//处理日志
function processLog(logMsg){
    console.log("florr.io Console:", logMsg);

    match = logMsg.match(/^Connecting to ([a-z0-9]+)\../)

    if(match){
        // toolbarLog("连接到新服务器")
        mapcode.updCurMapCode(match[1]);
        toolbarUpdMapCode(match[1])
        changeBGM(mapcode.getMapByCode(match[1]));
        // toolbarCMD("setCurMapCode("+match[1]+")");
        return ;
    }
}

//Main
app.whenReady().then(async () => {
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
    globalShortcut.register('CommandOrControl+Shift+K', () => {
        if(bosshide)    return ;
        if(toolbarWindow && !toolbarWindow.isDestroyed())
            if(toolbarWindow.isVisible()){
                toolbarWindow.hide();
                console.log('hide-tools');
                toolbarhide=true
            }else{
                toolbarWindow.show();
                console.log('show-tools');
                toolbarhide=false
            }
        else{
            toolbarWindow = createToolbarWindow();
            console.log('build-tools');
            toolbarhide=false
        }
    });
    //音乐栏
    globalShortcut.register('CommandOrControl+Shift+M', () => {
        if(bosshide)    return ;
        if(musicWindow && !musicWindow.isDestroyed())
            if(musicWindow.isVisible()){
                musicWindow.hide();
                console.log('hide-music');
                musichide=true
            }else{
                musicWindow.show();
                console.log('show-music');
                musichide=false
            }
        else{
            musicWindow = createMusicWindow();
            console.log('build-music');
            musichide=false
        }
    });

    //一键隐藏游戏
    globalShortcut.register('Alt+X', () => {
        if(mainWindow.isVisible()){
            bosshide=true
            mainWindow.hide();
            toolbarWindow.hide();
            musicWindow.hide();
            setPause(1);
            toolbarLog("Florr Client 已隐藏")
        }else{
            bosshide=false
            mainWindow.show();
            if(!toolbarhide)    toolbarWindow.show();
            if(!musichide)      musicWindow.show();
            setPause(0);
            toolbarLog("Florr Client 已显示")
        }
        
    });

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
    toolbarWindow.webContents.send('setMapCodeList',[...mapcode.code2idx]);

    // 处理地图代码更新请求
    ipcMain.on('_updMapCode', async () => {
        await mapcode.initMapCodes();
        toolbarWindow.webContents.send('setMapCodeList',[...mapcode.code2idx]);
    });
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});