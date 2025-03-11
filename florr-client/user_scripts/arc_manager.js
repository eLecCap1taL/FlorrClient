// ==UserScript==
// @name         Canvas 扇形拦截
// @match        https://florr.io/*
// ==/UserScript==

(function() {

    window.displayPetalCD = true
    window.displayBuffCD = true
    window.setDisplayPetalCD=function(val){
        window.displayPetalCD=val
    }
    window.setDisplayBuffCD=function(val){
        window.displayBuffCD=val
    }

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
        if(angleDiff>358 && (radius!=17.5) && (radius!=120))   return origArc.apply(this, arguments);
        const transform = this.getTransform();
        const absX = Math.round(transform.e + x);
        const absY = Math.round(transform.f + y);
        if(absX<=5 || absY<=5)    return origArc.apply(this, arguments);
        if(absX>window.getOverlayWidth() || absY>window.getOverlayHeight())   return origArc.apply(this, arguments);

        if(radius==120){
            //卡牌冷却
            const key = `${absX},${absY}`; // 用 x,y 作为唯一键
            
            // console.log(`坐标 x=${absX}, y=${absY} 处绘制了一个 ${angleDiff} (${sameYArcs.length})`);
            if (!arcSet.has(key)) {
                arcSet.add(key);
            }

            const sameYArcs = Array.from(arcSet)
                .map(k => k.split(','))
                .filter(([x, y]) => Number(y) === absY);
    

            const slotIndex = sameYArcs.filter(([x]) => Number(x) < absX).length + 1;
            const cooldownPercent = Math.round(10*((angleDiff) / 360 * 100))/10;
            if(cooldownPercent!=slotPre[slotIndex]){
                slotPre[slotIndex]=cooldownPercent
                // console.log(`卡槽 ${slotIndex} 冷却进度 ${cooldownPercent}%`);
                if(window.displayPetalCD)   window.drawTextCenter(`${cooldownPercent}%`, absX,absY-canvas.height*0.035,'white',18,'black',2,1<=cooldownPercent && cooldownPercent<=99);
            }
            return origArc.apply(this, arguments);
        }
        if(radius==17.5){
            if(y<=this.canvas.height*0.9){
                //buff
                const buffPercent = Math.round((angleDiff) / 360*100);
                if(window.displayBuffCD)    window.drawTextCenter(`${buffPercent}%`, absX,absY-canvas.height*0.02,'white',18,'black',2,1<=buffPercent && buffPercent<=99);
                // console.log(`buff ${absX} ${absY} ${angleDiff}  [${buffPercent}]`);
                
            }else{
                //转速
                const eqPercent = (angleDiff) / 360 * 70+30;
                window.curEQPercent=eqPercent
            }
            return origArc.apply(this, arguments);
        }
        // console.log(`坐标 x=${absX}, y=${absY} 处绘制了一个 ${angleDiff}  [${radius}]`);
        return origArc.apply(this, arguments);
    };
})();