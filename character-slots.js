/* A4-59: isolated character-slot storage. Does NOT touch A4-58 legacy save. */
(function(root){
'use strict';
const KEY='xiaying-jianghu-mobile:a4-59:slots:v1';
const LEGACY_KEY='xiaying-jianghu-mobile:save';
const JOBS=['劍俠','遊俠','武者'],SEXES=['男','女'];
function fresh(){return {version:1,slots:[null,null,null],lastSelected:0};}
function validCharacter(c){return !!c&&typeof c==='object'&&typeof c.name==='string'&&c.name.trim()===c.name&&[...c.name].length>=1&&[...c.name].length<=8&&JOBS.includes(c.job)&&SEXES.includes(c.sex)&&Number.isInteger(c.level)&&c.level>=1&&typeof c.id==='string'&&c.id.length>=1;}
function validate(data){if(!data||data.version!==1||!Array.isArray(data.slots)||data.slots.length!==3||!Number.isInteger(data.lastSelected)||data.lastSelected<0||data.lastSelected>2)return false;const names=new Set(),ids=new Set();for(const c of data.slots){if(c===null)continue;if(!validCharacter(c)||names.has(c.name)||ids.has(c.id))return false;names.add(c.name);ids.add(c.id)}return true;}
function createStore(storage){let raw;function read(){raw=storage.getItem(KEY);if(raw===null)return fresh();let data;try{data=JSON.parse(raw)}catch{throw Error('角色資料格式錯誤，已停止寫入以保護資料')}if(!validate(data))throw Error('角色資料無法驗證，已停止寫入以保護資料');return data;}
function commit(data){if(!validate(data))throw Error('角色資料驗證失敗');if(storage.getItem(KEY)!==raw)throw Error('另一個分頁已修改角色資料，請重新整理');const next=JSON.stringify(data);storage.setItem(KEY,next);if(storage.getItem(KEY)!==next)throw Error('儲存後驗證失敗');raw=next;return data;}
function update(fn){const data=read();fn(data);return commit(data);}
function index(i){if(!Number.isInteger(i)||i<0||i>2)throw Error('角色欄位不存在');return i;}
function makeId(){return 'slot-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12);}
return {key:KEY,legacyKey:LEGACY_KEY,read,create(i,input){index(i);const name=String(input.name||'').trim();if(!name||[...name].length>8)throw Error('角色姓名須為 1～8 字');if(!JOBS.includes(input.job)||!SEXES.includes(input.sex))throw Error('職業或性別不正確');return update(data=>{if(data.slots[i])throw Error('此欄位已有角色');if(data.slots.some(c=>c&&c.name===name))throw Error('角色姓名不能重複');data.slots[i]={id:makeId(),name,job:input.job,sex:input.sex,level:1};data.lastSelected=i;});},select(i){index(i);return update(data=>{data.lastSelected=i;});},remove(i,name){index(i);return update(data=>{const c=data.slots[i];if(!c)throw Error('此欄位沒有角色');if(c.name!==name)throw Error('角色姓名確認失敗');data.slots[i]=null;});},legacyExists(){return storage.getItem(LEGACY_KEY)!==null;}};}
root.JianghuCharacterSlots={createStore,validate,KEY,LEGACY_KEY};
})(typeof window!=='undefined'?window:globalThis);
