const { app, BrowserWindow } = require('electron');
const path = require("path");

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        title: "Florr Client", // 设置窗口标题
        icon: path.join(__dirname, './icon.ico'), // 设置窗口图标
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false
        }
    });

    mainWindow.setMenu(null);
    mainWindow.loadURL("https://florr.io");
});
