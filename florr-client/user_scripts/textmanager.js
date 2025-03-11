// ==UserScript==
// @name         Canvas 文字拦截
// @match        https://florr.io/*
// ==/UserScript==

(function() {
    const textMap = new Map(); // 记录文本和时间戳
    const origFill = CanvasRenderingContext2D.prototype.fillText;
    const origStroke = CanvasRenderingContext2D.prototype.strokeText;

    function judgeText(text,sta){
        if(text=="按下[ENTER]或点击这里聊天"){
            console.log("$FCset chat "+sta);
            return ;
        }
        if(text=="拖动花瓣以装备"){
            console.log("$FCset bag "+sta);
            return ;
        }
        if(text=="天赋点"){
            console.log("$FCset talent "+sta);
            return ;
        }
        if(text=="消耗5个相同的花瓣来进行一次合成"){
            console.log("$FCset craft "+sta);
            return ;
        }
        // match = text.match(/(\d+\.\d+)\s*fps/)
        // if(match){
        //     console.log("$FCfps "+match[1]);
        // }
        console.log(text+" "+sta);
    }

    function updateText(method, text) {
        if (!text || !text.trim()) return; // 过滤空文字
        const now = Date.now();
        if (!textMap.has(text)) {
            // console.log(`${method} 新文本:`, text);
            judgeText(text,true);
            textMap.set(text, now);
        } else {
            textMap.set(text, now);
        }
        // 检查过期文本
        for (const [t, time] of textMap) {
            if (now - time > 100) {
                // console.log(`${method} 移除文本:`, t);
                judgeText(t,false);
                textMap.delete(t);
            }
        }
    }

    CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth,check = true) {
        if(check) updateText('fillText', text);
        return origFill.apply(this, arguments);
    };

    CanvasRenderingContext2D.prototype.strokeText = function(text, x, y, maxWidth,check = false) {
        if(check) updateText('strokeText', text);
        return origStroke.apply(this, arguments);
    };
})();