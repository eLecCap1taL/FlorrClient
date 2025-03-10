// // ==UserScript==
// // @name         
// // @match        https://florr.io/*
// // ==/UserScript==

// (function() {
//     Object.defineProperty(window.screen, 'availHeight', {
//         value: 1080,
//         writable: false
//     });
//     const fakeRate = 30;
//     const origRAF = window.requestAnimationFrame;
//     let lastTime = 0;

//     window.requestAnimationFrame = function(callback) {
//         const now = performance.now();
//         if (now - lastTime >= 1000 / fakeRate) {
//             lastTime = now;
//             origRAF(callback);
//         } else {
//             setTimeout(() => origRAF(callback), 1000 / fakeRate);
//         }
//     };
// })();