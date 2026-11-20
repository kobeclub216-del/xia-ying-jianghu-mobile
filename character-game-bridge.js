/* A4-59-E: A4-58 game adapter bridge, no writes to legacy storage. */
(function(root){
'use strict';
function validateProgress(p,game){
 if(!p||typeof p!=='object'||!game||typeof game.savedStage!=='function')return false;
 if(typeof p.playerName!=='string'||!['劍俠','遊俠','武者'].includes(p.playerJob)||![1,2].includes(p.mapId))return false;
 if(!['x','y','hp','max','face'].every(k=>Number.isFinite(p.player?.[k])))return false;
 if(!Array.isArray(p.inventory)||!Array.isArray(p.enemies)||!p.enemies.every(e=>['x','y','hp','max'].every(k=>Number.isFinite(e?.[k]))))return false;
 if(!['strength','vitality','agility','inner'].every(k=>Number.isFinite(p.stats?.[k])))return false;
 if(!['swordPath','bowPath','spearPath','lightPath','martialGrowth'].every(k=>p[k]&&typeof p[k]==='object'))return false;
 if(!['level','exp','statPoints','martialPoints','score'].every(k=>Number.isFinite(p[k])))return false;
 try{return game.savedStage(p)!==null}catch{return false}
}
function createBridge({game,slots,progress}){
 if(!game||typeof game.snapshot!=='function'||typeof game.restore!=='function'||typeof game.savedStage!=='function')throw Error('A4-58 遊戲介面不完整');
 function getCharacter(i){const d=slots.read(),c=d.slots[i];if(!c)throw Error('角色欄位不存在');return c;}
 function assertIdentity(c,p){if(p.playerName!==c.name||p.playerJob!==c.job)throw Error('遊戲進度與角色身分不一致');}
 function load(i){const c=getCharacter(i);const p=progress.load(c.id);if(p===null)return null;if(!validateProgress(p,game))throw Error('角色進度不符合 A4-58 格式');assertIdentity(c,p);return {character:c,progress:p};}
 function restore(i){const data=load(i);if(!data)return false;game.restore(data.progress);return true;}
 function save(i){const c=getCharacter(i),p=game.snapshot();if(!validateProgress(p,game))throw Error('目前遊戲狀態無法安全儲存');assertIdentity(c,p);const before=progress.getRaw(c.id);progress.save(c.id,p,before);return true;}
 function canStart(i){const c=getCharacter(i);return {character:c,hasProgress:progress.getRaw(c.id)!==null};}
 return {load,restore,save,canStart,validateProgress:p=>validateProgress(p,game)};
}
root.JianghuA459Bridge={createBridge,validateProgress};
})(typeof window!=='undefined'?window:globalThis);
