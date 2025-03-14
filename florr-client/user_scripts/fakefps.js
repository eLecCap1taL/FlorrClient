// ==UserScript==
// @name         FPS 限制器
// @match        https://florr.io/*
// ==/UserScript==

(function() {

    window.setFpsLimit=function(targetFPS){
        targetFPS=targetFPS/8.2*5
        window.frameTime=1000/targetFPS
    }
    window.frameTime = 0;
    let lastFrame = performance.now();

    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = function(callback) {
        const now = performance.now();
        const elapsed = now - lastFrame;
        if (elapsed >= window.frameTime) {
            lastFrame = now;
            originalRAF(callback);
        } else {
            setTimeout(() => originalRAF(callback), window.frameTime - elapsed);
        }
    };
})();