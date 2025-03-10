// ==UserScript==
// @name         Canvas 扇形拦截
// @match        https://florr.io/*
// ==/UserScript==

(function() {
    const origArc = CanvasRenderingContext2D.prototype.arc;
    const arcSet = new Set(); // 使用 Set 去重坐标

    CanvasRenderingContext2D.prototype.arc = function(x, y, radius, startAngle, endAngle, counterclockwise) {
        const angleDiff = Math.abs(endAngle - startAngle) * 180 / Math.PI;
        if (angleDiff > 355) return origArc.apply(this, arguments);

        const transform = this.getTransform();
        const absX = transform.e + x;
        const absY = transform.f + y;

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
                const cooldownPercent = (360 - angleDiff) / 360 * 100;
                if(cooldownPercent>1 && cooldownPercent<99){
                    console.log(`卡槽 ${slotIndex} 冷却进度 ${cooldownPercent}%`);
                }
            }
        }

        return origArc.apply(this, arguments);
    };
})();