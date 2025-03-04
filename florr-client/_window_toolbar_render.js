
const logBox = document.getElementById('logBox');
const curmaptext = document.getElementById('server-id');
const toggleButton = document.getElementById('toggleServerList');
const serverList = document.getElementById('serverList');

//日志追加
function appendLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    logBox.value += `[${timestamp}] ${message}\n`;
    logBox.scrollTop = logBox.scrollHeight; // 自动滚动到底部
}

//泛光
function applyGlow(target, color = 'rgba(0, 255, 0, 0.7)', duration = 1000) {
    target.style.setProperty('--glow-color', color); // 设置动态颜色
    target.style.animation = `glow ${duration / 1000}s ease-out`; // 设置持续时间
    setTimeout(() => {
        target.style.animation = ''; // 移除动画
    }, duration);
}

//清空日志
document.getElementById('clearLogButton').addEventListener('click', () => {
    logBox.value = '';
    appendLog('日志已清空');
});

//控制服务器列表显示与否
let isServerListVisible = false;
toggleButton.addEventListener('click', () => {
    isServerListVisible = !isServerListVisible;
    serverList.style.display = isServerListVisible ? 'block' : 'none';
    toggleButton.textContent = isServerListVisible ? '隐藏完整服务器列表' : '显示完整服务器列表';
    // appendLog(isServerListVisible ? '显示服务器列表' : '隐藏服务器列表');
});

//请求刷新服务器列表
document.getElementById('_updMapCode').addEventListener('click', () => {
    serverList.innerHTML = '<div><span style="display: inline-block; width: 80px;">Garden</span>:</div><div><span style="display: inline-block; width: 80px;">Desert</span>:</div><div><span style="display: inline-block; width: 80px;">Ocean</span>:</div><div><span style="display: inline-block; width: 80px;">Jungle</span>:</div><div><span style="display: inline-block; width: 80px;">Hel</span>:</div><div><span style="display: inline-block; width: 80px;">Sewers</span>:</div><div><span style="display: inline-block; width: 80px;">AntHell</span>:</div>';
    const target = isServerListVisible ? serverList : toggleButton;
    applyGlow(target, 'rgba(255, 255, 0, 0.7)', 800);
    window.myAPI.updMapCode(); // 发送刷新请求
});
//接受日志
window.myAPI.onLog((value) => {
    appendLog(value)
})
//接受新MapCode
window.myAPI.onSetCurMapCode((value) => {
    appendLog(`玩家进入新服务器 ${value}`);
    curmaptext.textContent = value
})
//接受新MapCodeList
window.myAPI.onUpdMapCodeList((serverData) => {
    console.log(serverData);
    const mapServers = Array(8).fill().map(() => []);
    serverData.forEach(([serverId, idx]) => {
        if (idx >= 1 && idx <= 8) mapServers[idx - 1].push(serverId);
    });
    const idx2map = ["Unknown", "Garden", "Desert", "Ocean", "Jungle", "AntHell","Hel", "Sewers" , "Factory"];
    serverList.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const div = document.createElement('div');
        div.innerHTML = `<span style="display: inline-block; width: 80px;">${idx2map[i + 1]}</span>: ${mapServers[i].join(' ')}`;
        serverList.appendChild(div);
    }

    const target = isServerListVisible ? serverList : toggleButton;
    applyGlow(target, 'rgba(0, 255, 0, 0.7)', 800);
})