/* A4-59-D: per-character game progress storage. Separate from A4-58 legacy save. */
(function(root){
'use strict';
const PREFIX='xiaying-jianghu-mobile:a4-59:progress:v1:';
const LEGACY='xiaying-jianghu-mobile:save';
function validEnvelope(v,id){return !!v&&v.version===1&&v.characterId===id&&v.progress&&typeof v.progress==='object'&&!Array.isArray(v.progress);}
function createProgressStore(storage,verifyProgress){
 if(typeof verifyProgress!=='function')throw Error('必須提供 A4-58 進度驗證函式');
 function key(id){if(typeof id!=='string'||!/^slot-[a-z0-9-]+$/i.test(id))throw Error('角色 ID 不正確');return PREFIX+id;}
 function getRaw(id){return storage.getItem(key(id));}
 function load(id){const raw=getRaw(id);if(raw===null)return null;let data;try{data=JSON.parse(raw)}catch{throw Error('角色進度資料損毀，已停止載入')}if(!validEnvelope(data,id)||!verifyProgress(data.progress))throw Error('角色進度驗證失敗，已停止載入');return data.progress;}
 function save(id,progress,expectedRaw){const k=key(id);if(!verifyProgress(progress))throw Error('遊戲進度驗證失敗，拒絕寫入');const current=storage.getItem(k);if(expectedRaw!==undefined&&current!==expectedRaw)throw Error('角色進度已在另一個分頁改變');const next=JSON.stringify({version:1,characterId:id,progress});storage.setItem(k,next);if(storage.getItem(k)!==next)throw Error('寫入後驗證失敗');return next;}
 function remove(id,expectedRaw){const k=key(id);const current=storage.getItem(k);if(expectedRaw!==undefined&&current!==expectedRaw)throw Error('角色進度已在另一個分頁改變');storage.removeItem(k);if(storage.getItem(k)!==null)throw Error('刪除進度失敗');}
 return {key,getRaw,load,save,remove,legacyRaw(){return storage.getItem(LEGACY);}};
}
root.JianghuCharacterProgress={createProgressStore,PREFIX,LEGACY};
})(typeof window!=='undefined'?window:globalThis);
