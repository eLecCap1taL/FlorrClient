// 格式化快捷键显示
function formatKeybind(event) {
    const keys = [];
    if (event.ctrlKey) keys.push('Ctrl');
    if (event.altKey) keys.push('Alt');
    if (event.shiftKey) keys.push('Shift');
    
    
    // 主键（键盘或鼠标）

    hasMain = false;

    const validMainKeys = /^[A-Za-z0-9]$/;
    if (event.type === 'keydown' && event.key && validMainKeys.test(event.key) && 
        !['Control', 'Alt', 'Shift'].includes(event.key)) {
        keys.push(event.key.toUpperCase());
        hasMain=true;
    } else if (event.type === 'mousedown') {
        const mouseKeys = {
            3: 'Mouse4', // 前侧键
            4: 'Mouse5'  // 后侧键
        };
        if (mouseKeys[event.button]) {
            keys.push(mouseKeys[event.button]);
            hasMain=true;
        }
    }

    return [keys.join(' + '),hasMain];
}

function newBinds(id,bind,tostore=true){
    if(bind!='') document.querySelectorAll('.keybind-input').forEach(input => {
        if(input.value==bind && id!=input.id.substring(8,input.id.length)){
            input.value=''
            newBinds(input.id.substring(8,input.id.length),'');
        }
    })
    console.log(`${id} 绑定为: ${bind}`);
    if(tostore) window.myAPI.changeSettings([`_loadouts_binds_${id}`,bind]);
    // window.myAPI.changeSettings()
}

let tmpStoreBinds=new Map()

// 为所有 keybind-input 添加事件
document.querySelectorAll('.keybind-input').forEach(input => {
    let hasMainKey = false;
    let isFocused = false;

    tmpStoreBinds[input.id]=''

    input.addEventListener('click', () => {
        input.focus();
        isFocused = true;
        console.log(`绑定 ${input.id} 的快捷键...`);
        tmpStoreBinds[input.id]=''
    });

    input.addEventListener('keydown', (event) => {
        if (!isFocused) return; // 只处理聚焦的输入框
        event.preventDefault();
        if (!hasMainKey) {
            const keybind = formatKeybind(event);
            if (keybind) {
                if(input.value==keybind[0]) return ;
                tmpStoreBinds[input.id]=keybind[0];
                hasMainKey = keybind[1];
            }
        }
    });

    input.addEventListener('mousedown', (event) => {
        if (!isFocused) return; // 只处理聚焦的输入框
        event.preventDefault();
        if (!hasMainKey && [3, 4].includes(event.button)) {
            const keybind = formatKeybind(event);
            if (keybind) {
                if(input.value==keybind[0]) return ;
                tmpStoreBinds[input.id]=keybind[0];
                hasMainKey = keybind[1];
            }
        }
    });

    input.addEventListener('blur', () => {
        console.log(`${input.id} 绑定完成`);
        hasMainKey = false;
        isFocused = false;
        input.value = tmpStoreBinds[input.id];
        newBinds(input.id.substring(8,input.id.length),tmpStoreBinds[input.id]);
    });
});

document.getElementById('play-sound').addEventListener('change', (e) => {
    window.myAPI.changeSettings(['_loadouts_features_sound',e.target.checked]);
    window.myAPI._loadouts_feature_sound(e.target.checked)
    console.log(`切换音效: ${e.target.checked ? '开启' : '关闭'}`);
});
document.getElementById('wheel-switch').addEventListener('change', (e) => {
    window.myAPI.changeSettings(['_loadouts_features_wheel',e.target.checked]);
    window.myAPI._loadouts_feature_wheel(e.target.checked)
    console.log(`滚轮切换: ${e.target.checked ? '开启' : '关闭'}`);
});

window.myAPI.onInit((data)=>{
    console.log(data);
    for(i=0;i<20;i++){
        document.getElementById(`loadout-${i}`).value=data[i];
        newBinds(`${i}`,data[i],false);
    }
    document.getElementById('loadout-prev').value=data[20]
    newBinds(`prev`,data[20],false);

    document.getElementById('loadout-next').value=data[21]
    newBinds(`next`,data[21],false);

    document.getElementById('loadout-last').value=data[22]
    newBinds(`last`,data[22],false);

    document.getElementById('play-sound').checked=data[23]
    document.getElementById('wheel-switch').checked=data[24]
})