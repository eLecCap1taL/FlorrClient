// ==UserScript==
// @name         Canvas 文字拦截
// @match        https://florr.io/*
// ==/UserScript==


(function() {
    function PlaySound(soundpath){
        const audio = new Audio(soundpath);
        audio.play();
    };

    const textMap = new Map(); // 记录文本和时间戳
    const origFill = CanvasRenderingContext2D.prototype.fillText;
    const origStroke = CanvasRenderingContext2D.prototype.strokeText;

    window.curEQPercent=100

    function judgeText(text,sta,color){
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
        function isNumeric(str) {
            return /^\d+$/.test(str);
        }
        if(color=="#ff5555" && isNumeric(text)){
            // console.log("hit")
            window.myAPI.playSound("./music/hit/taiqiu.mp3")
            // PlaySound("")
            return ;
        }
        if(color=="#36ffe7" && isNumeric(text)){
            // console.log("hit")
            window.myAPI.playSound("./music/hit/snowball.mp3")
            // PlaySound("")
            return ;
        }
        if(color=="#ce76db" && isNumeric(text)){
            // console.log("hit")
            window.myAPI.playSound("./music/hit/water.mp3")
            // PlaySound("")
            return ;
        }
        // if(sta)console.log(text+" "+sta+" "+color);
    }

    function updateText(method, text,color) {
        if (!text || !text.trim()) return; // 过滤空文字
        const now = Date.now();
        if (!textMap.has(text)) {
            // console.log(`${method} 新文本:`, text);
            judgeText(text,true,color);
            textMap.set(text, now);
        } else {
            textMap.set(text, now);
        }
        for (const [t, time] of textMap) {
            if (now - time > 100) {
                judgeText(t,false,color);
                textMap.delete(t);
            }
        }
    }

    CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth,check = true) {
        if(check) updateText('fillText', text,this.fillStyle);
        if(text=='转速' && y==4.5)   text=`${Math.round(10*(window.curEQPercent))/10}%`
        // const transform = this.getTransform();
        // const absX = Math.round(transform.e + x);
        // const absY = Math.round(transform.f + y);
        // if(!(absX>=0 && absX<=window.devicePixelRatio*window.innerWidth && absY>=0 && absY<=window.devicePixelRatio*window.innerHeight)){
        //     return ()=>{};
        // }
        return origFill.call(this, text, x, y, maxWidth);
    };

    CanvasRenderingContext2D.prototype.strokeText = function(text, x, y, maxWidth,check = false) {
        if(check) updateText('strokeText', text);
        if(text=='转速' && y==4.5)   text=`${Math.round(10*(window.curEQPercent))/10}%`
        // const transform = this.getTransform();
        // const absX = Math.round(transform.e + x);
        // const absY = Math.round(transform.f + y);
        // if(!(absX>=0 && absX<=window.devicePixelRatio*window.innerWidth && absY>=0 && absY<=window.devicePixelRatio*window.innerHeight)){
        //     return ()=>{};
        // }
        return origStroke.call(this, text, x, y, maxWidth);
    };
})();