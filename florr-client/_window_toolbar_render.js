
const logBox = document.getElementById('logBox');
const curmaptext = document.getElementById('server-id');
const toggleButton = document.getElementById('toggleServerList');
const serverList = document.getElementById('serverList');
const lockEQCheckbox = document.getElementById('lockEQ');
const setEQButton = document.getElementById('setEQ');
const loadoutsSettingsButton = document.getElementById('loadoutsSettings');

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

//输入层
async function getInput(promptText, defaultValue = '', returnDefaultIfEmpty = false) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('modalOverlay');
        const title = document.getElementById('modalTitle');
        const input = document.getElementById('modalInput');
        const confirm = document.getElementById('modalConfirm');

        // 设置内容并显示
        title.textContent = promptText;
        input.value = defaultValue;
        overlay.style.display = 'flex';
        setTimeout(() => overlay.classList.add('active'), 10);

        // 确认按钮事件
        const confirmHandler = () => {
            const value = input.value.trim();
            const result = value === '' && returnDefaultIfEmpty ? defaultValue : value;
            resolve(result); // 立即返回
            overlay.classList.remove('active');
            setTimeout(() => overlay.style.display = 'none', 300); // 动画结束后隐藏
            confirm.removeEventListener('click', confirmHandler);
        };
        confirm.addEventListener('click', confirmHandler);

        // 回车键支持
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') confirmHandler();
        });
    });
}

//设定转速
setEQButton.addEventListener('click', async () => {
    ret = parseFloat(await getInput('请输入转速 - 0.3到1.0之间的任意小数', 1.0, true))
    if (!Number.isFinite(ret)) ret = 1.0
    if (ret > 1.0) ret = 1.0
    if (ret < 0.3) ret = 0.3
    window.myAPI.setFlorrEQ(ret)
    appendLog(`设置转速为 ${ret * 100.0}%`)
});

//套装设置
loadoutsSettingsButton.addEventListener('click', async () => {
    window.myAPI.openLoadoutsWindow()
});

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
    window.myAPI.changeSettings(['serverListVisible', isServerListVisible]);
});

//EQ锁定复选框
lockEQCheckbox.addEventListener('change', () => {
    const isLocked = lockEQCheckbox.checked;
    applyGlow(lockEQCheckbox, 'rgba(0, 255, 0, 0.7)', 500)
    appendLog(`锁定EQ: ${isLocked ? '启用' : '禁用'}`);
    window.myAPI.updEQlock(isLocked);
    window.myAPI.changeSettings(['lockEQ', lockEQCheckbox.checked]);
});

//请求刷新服务器列表
document.getElementById('_updMapCode').addEventListener('click', () => {
    serverList.innerHTML = '<div><span style="display: inline-block; width: 80px;">Garden</span>:</div><div><span style="display: inline-block; width: 80px;">Desert</span>:</div><div><span style="display: inline-block; width: 80px;">Ocean</span>:</div><div><span style="display: inline-block; width: 80px;">Jungle</span>:</div><div><span style="display: inline-block; width: 80px;">AntHell</span>:</div><div><span style="display: inline-block; width: 80px;">Hel</span>:</div><div><span style="display: inline-block; width: 80px;">Sewers</span>:</div><div><span style="display: inline-block; width: 80px;">Factory</span>:</div>';
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
    const idx2map = ["Unknown", "Garden", "Desert", "Ocean", "Jungle", "AntHell", "Hel", "Sewers", "Factory"];
    serverList.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        const div = document.createElement('div');
        div.innerHTML = `<span style="display: inline-block; width: 80px;">${idx2map[i + 1]}</span>: ${mapServers[i].join(' ')}`;
        serverList.appendChild(div);
    }

    const target = isServerListVisible ? serverList : toggleButton;
    applyGlow(target, 'rgba(0, 255, 0, 0.7)', 800);
})

window.myAPI.onInit((ls) => {
    _EQlock = ls[0]
    _serverListVisible = ls[1]

    lockEQCheckbox.checked = _EQlock

    isServerListVisible = _serverListVisible
    serverList.style.display = _serverListVisible ? 'block' : 'none';
    toggleButton.textContent = _serverListVisible ? '隐藏完整服务器列表' : '显示完整服务器列表';
})