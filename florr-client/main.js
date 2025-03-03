const { app, BrowserWindow } = require('electron');
const path = require("path");

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        title: "Florr Client", // 设置窗口标题
        icon: "https://florr.io/favicon.ico", // 设置窗口图标
        // frame: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false
        }
    });

    mainWindow.loadURL("https://florr.io");
});
