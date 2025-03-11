// ==UserScript==
// @name         Canvas 扇形拦截
// @match        https://florr.io/*
// ==/UserScript==

(function() {



    const origArc = CanvasRenderingContext2D.prototype.arc;
    const arcSet = new Set(); // 使用 Set 去重坐标
    const slotPre = new Map();
    for(i=1;i<=10;i++){
        slotPre[i]=-1;
    }

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
        arcSet.clear();
        console.log('窗口大小变化, Set 已清空');
    });

    CanvasRenderingContext2D.prototype.arc = function(x, y, radius, startAngle, endAngle, counterclockwise) {
        const angleDiff = Math.abs(endAngle - startAngle) * 180 / Math.PI;
        if (angleDiff > 358) return origArc.apply(this, arguments);

        const transform = this.getTransform();
        const absX = Math.round(transform.e + x);
        const absY = Math.round(transform.f + y);

        if (!(x === 0 && y === 0 && angleDiff === 360)) {
            const key = `${absX},${absY}`; // 用 x,y 作为唯一键
            
            // console.log(`坐标 x=${absX}, y=${absY} 处绘制了一个 ${angleDiff} (${sameYArcs.length})`);
            if (!arcSet.has(key)) {
                arcSet.add(key);
            }

            const sameYArcs = Array.from(arcSet)
                .map(k => k.split(','))
                .filter(([x, y]) => Number(y) === absY);
            // console.log(`坐标 x=${absX}, y=${absY} 处绘制了一个 ${angleDiff} (${sameYArcs.length})`);

            if (sameYArcs.length >= 5 && sameYArcs.length <= 10) {
                const slotIndex = sameYArcs.filter(([x]) => Number(x) < absX).length + 1;
                const cooldownPercent = Math.round((360 - angleDiff) / 360 * 100);
                if(cooldownPercent!=slotPre[slotIndex]){
                    slotPre[slotIndex]=cooldownPercent
                    // console.log(`卡槽 ${slotIndex} 冷却进度 ${cooldownPercent}%`);
                    window.drawTextCenter(`${cooldownPercent}%`, absX,absY-canvas.height*0.035,'white',18,'black',2);
                }
            }
        }

        return origArc.apply(this, arguments);
    };
})();