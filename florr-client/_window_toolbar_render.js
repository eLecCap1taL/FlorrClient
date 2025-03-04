
const logBox = document.getElementById('logBox');
const curmaptext = document.getElementById('server-id');
function appendLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    logBox.value += `[${timestamp}] ${message}\n`;
    logBox.scrollTop = logBox.scrollHeight; // 自动滚动到底部
}

document.getElementById('updMapCode').addEventListener('click', () => {
    window.myAPI.updMapCode(); // 发送刷新请求
});

function setCurMapCode(curmapcode){
    curmaptext.textContent=curmapcode
}