// ==UserScript==
// @name         内存变化监控
// @match        https://florr.io/*
// ==/UserScript==

(function() {
    const baseIndex = 19238544 >> 2; // 基础索引
    const range = 100; // 监控前后 100 个地址
    let prevValues = new Float32Array(range * 2); // 存储前一帧值

    // 初始化
    for (let i = 0; i < range * 2; i++) {
        prevValues[i] = Module.HEAPF32[baseIndex - range + i] || 0;
    }

    // 监控函数
    function watchMemory() {
        for (let i = 0; i < range * 2; i++) {
            const index = baseIndex - range + i;
            const current = Module.HEAPF32[index] || 0;
            if (current !== prevValues[i] && current !== 0) { // 忽略不变和 0
                console.log(`Access ${index} Change: ${prevValues[i]} -> ${current}`);
                prevValues[i] = current;
            }
        }
    }

    // 每 100ms 检查一次
    setInterval(watchMemory, 100);

    console.log('开始监控内存变化...');
})();