
(function(){
    window.setRotate=function(targetspeed=1){

        const qdown = new KeyboardEvent('keydown', {
            key: 'q',
            code: 'KeyQ',
            keyCode: 81,
            which: 81,
            bubbles: true,
            cancelable: true
        });
        const edown = new KeyboardEvent('keydown', {
            key: 'e',
            code: 'KeyE',
            keyCode: 69,
            which: 69,
            bubbles: true,
            cancelable: true
        });
        const qup = new KeyboardEvent('keyup', {
            key: 'q',
            code: 'KeyQ',
            keyCode: 81,
            which: 81,
            bubbles: true,
            cancelable: true
        });
        const eup = new KeyboardEvent('keyup', {
            key: 'e',
            code: 'KeyE',
            keyCode: 69,
            which: 69,
            bubbles: true,
            cancelable: true
        });
        if(targetspeed<0.3 || targetspeed>1)    return false;
        if(window.curEQPercent==0)  return false; 
        Module.HEAPF32[1070154]=Module.HEAPF32[4805070]=(targetspeed-0.3)/0.7
        // targetspeed=targetspeed*100;
        // avg=0,cnt=0;
        // pre=window.curEQPercent
        // if(window.curEQPercent>targetspeed){
        //     document.dispatchEvent(qdown);
        //     const chk=setInterval(()=>{
        //         const diff=pre-window.curEQPercent
        //         pre=window.curEQPercent
        //         cnt++;
        //         avg+=diff;  
        //         // console.log(avg,cnt);
        //         if(window.curEQPercent-avg/cnt<=targetspeed){
        //             document.dispatchEvent(qup);
        //             clearInterval(chk);
        //         }
        //     },1);
        // }else{
        //     document.dispatchEvent(edown);
        //     const chk=setInterval(()=>{
        //         const diff=window.curEQPercent-pre
        //         pre=window.curEQPercent
        //         cnt++;
        //         avg+=diff;  
        //         // console.log(avg,cnt);
        //         if(window.curEQPercent+avg/cnt>=targetspeed){
        //             document.dispatchEvent(eup);
        //             clearInterval(chk);
        //         }
        //     },1);
        // }
        // return true;
    }
})();