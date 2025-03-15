// ==UserScript==
// @name         内存值搜索
// @match        https://florr.io/*
// ==/UserScript==

(function() {
    let candidates = []; // 候选地址

    // 初次扫描（找 2.0-5.0 的值）
    window.scanMemory = function() {
        candidates = [];
        for (let i = 0; i < Module.HEAPF32.length; i++) {
            const value = Module.HEAPF32[i];
            // if (value >= 0 && value <= 1) { // 假设转速范围
                candidates.push({ index: i, value });
            // }
        }
        console.log(`找到 ${candidates.length} 个候选地址`);
    };

    // 筛选变化
    window.filterMemoryNone = function() {
        const newCandidates = [];
        for (let candidate of candidates) {
            const current = Module.HEAPF32[candidate.index];
            if (current == candidate.value) {
                newCandidates.push({ index: candidate.index, value: current });
                // console.log(`地址 ${candidate.index} 变化: ${candidate.value} -> ${current}`);
            }
        }
        candidates = newCandidates;
        console.log(`剩余 ${candidates.length} 个候选`);
    };
    window.filterMemoryIncre = function() {
        const newCandidates = [];
        for (let candidate of candidates) {
            const current = Module.HEAPF32[candidate.index];
            if (current > candidate.value) {
                newCandidates.push({ index: candidate.index, value: current });
                // console.log(`地址 ${candidate.index} 变化: ${candidate.value} -> ${current}`);
            }
        }
        candidates = newCandidates;
        console.log(`剩余 ${candidates.length} 个候选`);
    };
    window.filterMemoryDecre = function() {
        const newCandidates = [];
        for (let candidate of candidates) {
            const current = Module.HEAPF32[candidate.index];
            if (current < candidate.value) {
                newCandidates.push({ index: candidate.index, value: current });
                // console.log(`地址 ${candidate.index} 变化: ${candidate.value} -> ${current}`);
            }
        }
        candidates = newCandidates;
        console.log(`剩余 ${candidates.length} 个候选`);
    };

    window.setRestV = function(val){
        for(i=0;i<candidates.length;i++) Module.HEAPF32[candidates[i].index] = val
    }
    window.printRestV = function(val){
        for(i=0;i<candidates.length;i++) console.log(candidates[i].index,Module.HEAPF32[candidates[i].index])
    }

    // 使用说明
    console.log('运行 scanMemory() 开始扫描，按 E/Q 后运行 filterMemory() 筛选');
})();