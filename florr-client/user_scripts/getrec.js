// // ==UserScript==
// // @name         Canvas 矩形拦截
// // @match        https://florr.io/*
// // ==/UserScript==

// (function() {
//     const origFillRect = CanvasRenderingContext2D.prototype.fillRect;
//     const origStrokeRect = CanvasRenderingContext2D.prototype.strokeRect;

//     CanvasRenderingContext2D.prototype.fillRect = function(x, y, width, height) {
//         const transform = this.getTransform();
//         const absX = transform.e + x;
//         const absY = transform.f + y;
//         if(!(width==1 && height==1)){
//             console.log(`坐标 x=${absX.toFixed(0)}, y=${absY.toFixed(0)} 处绘制了一个填充矩形 (宽=${width}, 高=${height})`);
//         }
//         return origFillRect.apply(this, arguments);
//     };

//     CanvasRenderingContext2D.prototype.strokeRect = function(x, y, width, height) {
//         const transform = this.getTransform();
//         const absX = transform.e + x;
//         const absY = transform.f + y;
//         if(!(width==1 && height==1)){
//             console.log(`坐标 x=${absX.toFixed(0)}, y=${absY.toFixed(0)} 处绘制了一个填充矩形 (宽=${width}, 高=${height})`);
//         }
//         return origStrokeRect.apply(this, arguments);
//     };
// })();