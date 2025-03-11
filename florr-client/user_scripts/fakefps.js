// ==UserScript==
// @name         FPS 限制器
// @match        https://florr.io/*
// ==/UserScript==

(function() {
    const targetFPS = 50; // 自定义 FPS 上限
    const frameTime = 1000 / targetFPS;
    let lastFrame = performance.now();

    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = function(callback) {
        const now = performance.now();
        const elapsed = now - lastFrame;
        if (elapsed >= frameTime) {
            lastFrame = now;
            originalRAF(callback);
        } else {
            setTimeout(() => originalRAF(callback), frameTime - elapsed);
        }
    };
})();