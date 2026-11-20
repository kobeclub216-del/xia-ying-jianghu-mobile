'use strict';
/* A4-59-F separate integration playtest. Never writes A4-58 save key. */
const gameHome=(()=>{
const byId=id=>document.getElementById(id),home=byId('home'),creator=byId('creator'),game=window.jianghuGame;
const saveKey='xiaying-jianghu-mobile:save',audioKey='xiaying-jianghu-mobile:audio';
let playing=false,active=null,expected=null,dialogAction=null;
const slots=JianghuCharacterSlots.createStore(localStorage);
const progress=JianghuCharacterProgress.createProgressStore(localStorage,p=>JianghuA459Bridge.validateProgress(p,game));
const bridge=JianghuA459Bridge.createBridge({game,slots,progress});
function warn(s){byId('saveWarning').textContent=s;byId('saveWarning').hidden=!s}
function persist(){if(active===null)return false;try{const c=slots.read().slots[active];if(!c)throw Error('角色已被移除，停止寫入');const p=game.snapshot();if(!bridge.validateProgress(p)||p.playerName!==c.name||p.playerJob!==c.job)throw Error('角色資料不一致，停止寫入');expected=progress.save(c.id,p,expected);warn('');return true}catch(e){warn(e.message);return false}}
function enter(){home.hidden=true;creator.hidden=true;panel.hidden=true;byId('wrap').hidden=false;playing=true;game.startRendering()}
function openDialog(title,message,confirm,callback){dialogAction=callback;byId('dialogTitle').textContent=title;byId('dialogMessage').textContent=message;byId('dialogMessage').hidden=!message;byId('audioSettings').hidden=true;byId('dialogConfirm').hidden=!confirm;byId('dialogConfirm').textContent=confirm||'';byId('homeDialog').showModal()}
byId('homeDialog').addEventListener('close',()=>{if(byId('homeDialog').returnValue==='confirm')dialogAction?.();dialogAction=null});
const panel=document.createElement('section');panel.id='a459Panel';panel.hidden=true;panel.innerHTML='<h2>選擇你的江湖身分</h2><p>三個角色各自儲存進度；正式 A4-58 存檔保持不變。</p><div id="a459Slots"></div><p id="a459Notice" role="status"></p><button id="a459Back">返回首頁</button>';
document.body.append(panel);const style=document.createElement('style');style.textContent='#a459Panel{position:fixed;z-index:900;inset:0;overflow:auto;padding:5vh 6vw;box-sizing:border-box;background:linear-gradient(160deg,#d9e8e6,#e4d2aa 65%,#91b7b4);color:#342d25;text-align:center}#a459Panel h2{font-size:clamp(22px,4vw,38px);color:#4b3927}#a459Slots{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin:3vh auto}#a459Slots article{width:min(27vw,230px);min-width:145px;min-height:150px;padding:12px;border:4px ridge #b78d49;background:#f5e9ce;box-shadow:0 8px 24px #42351d44;border-radius:12px}#a459Slots h3{font-size:20px}#a459Panel button{padding:10px;margin:5px;background:#332e2a;color:#efd59b;border:2px solid #b78d49;border-radius:8px;font:inherit}#a459Panel button:disabled{opacity:.45}#a459Notice{color:#8b1f1f;min-height:1.5em}@media(max-width:600px){#a459Slots article{min-width:120px;width:26vw;padding:6px}#a459Panel button{font-size:13px;padding:7px}}';document.head.append(style);
function note(t){byId('a459Notice').textContent=t}
function openSlots(){try{slots.read();panel.hidden=false;home.hidden=true;creator.hidden=true;render()}catch(e){warn(e.message)}}
function render(){const data=slots.read();const host=byId('a459Slots');host.replaceChildren();data.slots.forEach((c,i)=>{const box=document.createElement('article'),h=document.createElement('h3'),detail=document.createElement('p'),button=document.createElement('button');h.textContent=c?c.name:'＋ 空白欄位';detail.textContent=c?c.job+' · '+c.sex:'建立新角色';button.textContent=c?'進入江湖':'建立角色';button.onclick=()=>c?load(i):create(i);box.append(h,detail,button);if(c){const del=document.createElement('button');del.textContent='刪除角色';del.onclick=()=>remove(i,c);box.append(del)}host.append(box)});note('')}
let pending=null;
function create(i){pending=i;panel.hidden=true;creator.hidden=false;byId('nameInput').value='';byId('a459Sex').value='男';byId('cancelCreator').onclick=()=>{creator.hidden=true;panel.hidden=false;render()}}
function load(i){try{const info=bridge.load(i);if(!info){note('此角色尚無遊戲進度，請先建立新的角色');return}active=i;expected=progress.getRaw(info.character.id);game.restore(info.progress);enter()}catch(e){note(e.message)}}
function remove(i,c){const answer=prompt('輸入「'+c.name+'」確認刪除該角色及其進度');if(answer!==c.name)return;try{const raw=progress.getRaw(c.id);progress.remove(c.id,raw);slots.remove(i,c.name);render()}catch(e){note(e.message)}}
byId('a459Back').onclick=()=>{panel.hidden=true;home.hidden=false};
byId('homeNew').onclick=openSlots;byId('homeContinue').disabled=false;byId('homeContinue').onclick=openSlots;
byId('homeSettings').onclick=()=>{byId('dialogTitle').textContent='遊戲設定';byId('dialogMessage').hidden=true;byId('audioSettings').hidden=false;byId('dialogConfirm').hidden=true;byId('homeDialog').showModal()};
const volume=byId('homeVolume'),sound=byId('homeSound');let a;try{a=JSON.parse(localStorage.getItem(audioKey))}catch{}volume.value=Number.isFinite(a?.volume)?a.volume:50;sound.checked=a?.enabled!==false;byId('volumeLabel').textContent=volume.value+'%';function audioSave(){byId('volumeLabel').textContent=volume.value+'%';try{localStorage.setItem(audioKey,JSON.stringify({volume:volume.valueAsNumber,enabled:sound.checked}))}catch(e){warn('音效設定無法保存')}}volume.oninput=audioSave;sound.onchange=audioSave;
byId('previewSound').onclick=()=>{};
byId('homeExit').onclick=()=>openDialog('離開遊戲','可以關閉此分頁離開遊戲。','',null);
setInterval(()=>{if(playing&&!document.hidden)persist()},2000);addEventListener('pagehide',()=>{if(playing)persist()});document.addEventListener('visibilitychange',()=>{if(playing&&document.hidden)persist()});
return {startNew(){if(playing||creator.hidden||pending===null)return;const i=pending;const name=byId('nameInput').value.trim()||'無名俠客';const job=game.snapshot().playerJob;const sex=byId('a459Sex').value;try{if(!name||[...name].length>8)throw Error('角色姓名須為 1～8 字');const data=slots.read();if(data.slots[i]||data.slots.some(c=>c?.name===name))throw Error('角色欄位已被使用或姓名重複');const state=game.snapshot();state.playerName=name;if(!bridge.validateProgress(state))throw Error('遊戲初始進度不完整');slots.create(i,{name,job,sex});const c=slots.read().slots[i];active=i;expected=null;expected=progress.save(c.id,state,null);pending=null;enter()}catch(e){warn('建立角色失敗：'+e.message)}}};
})();
