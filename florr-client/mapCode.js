const axios = require('axios');
const { toolbarLog } = require('./_window_toolbar');

class mapCode{
    constructor(){
        this.code2idx = new Map();
        this.idx2map = ["Unknown","Garden", "Desert", "Ocean", "Jungle", "Hel", "Sewers", "AntHell", "Factory"];
        this.curMapCode = "0d00"
    }
    async initMapCodes() {
        toolbarLog("开始初始化地图代码")
        try {
            const requests = [];
            for (let i = 0; i <= 7; i++) {
                const url = `https://api.n.m28.io/endpoint/florrio-map-${i}-green/findEach/`;
                requests.push(fetch(url).then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP Error: ${response.status}`);
                    }
                    return response.json().then(data => ({ i, data })); // 保留 i 和数据
                }));
            }

            // 等待所有请求完成
            const results = await Promise.all(requests);

            // 处理所有结果
            for (const { i, data } of results) {
                const servers = data.servers;
                if (!servers || typeof servers !== 'object') {
                    console.error(`Map ${maps[i]} 's data invalid':`, data);
                    continue;
                }
                for (const serverKey in servers) {
                    if (servers.hasOwnProperty(serverKey)) {
                        const serverId = servers[serverKey].id;
                        this.code2idx.set(serverId, i+1);
                    }
                }
            }
            toolbarLog("初始化地图代码成功");
            console.log("Succ Init Map:",this.code2idx);
        } catch (error) {
            toolbarLog("初始化地图代码失败");
            console.error("Init MapCode Error:", error.message);
        }
    }

    getIdxByCode(serverId) {
        return this.code2idx.get(serverId);
    }
    getMapByCode(serverId) {
        return this.idx2map[this.getIdxByCode(serverId)]
    }
    getMapByIdx(serverId) {
        if(!(0<=serverId && serverId<=8))   serverId=0;
        return this.idx2map[serverId]
    }

    updCurMapCode(newMapCode){
        this.curMapCode=newMapCode
        console.log("get a new map at "+this.getMapByCode(newMapCode));
    }
}

module.exports = mapCode
