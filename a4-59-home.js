'use strict';
/* A4-59-F separate integration playtest. Never writes A4-58 save key. */
const gameHome=(()=>{
const byId=id=>document.getElementById(id),home=byId('home'),creator=byId('creator'),game=window.jianghuGame;
const saveKey='xiaying-jianghu-mobile:save',audioKey='xiaying-jianghu-mobile:audio';
let playing=false,renderStarted=false,active=null,expected=null,dialogAction=null;
const slots=JianghuCharacterSlots.createStore(localStorage);
const progress=JianghuCharacterProgress.createProgressStore(localStorage,p=>JianghuA459Bridge.validateProgress(p,game));
const bridge=JianghuA459Bridge.createBridge({game,slots,progress});
function warn(s){byId('saveWarning').textContent=s;byId('saveWarning').hidden=!s}
function persist(){if(active===null)return false;try{const c=slots.read().slots[active];if(!c)throw Error('角色已被移除，停止寫入');const p=game.snapshot();if(!bridge.validateProgress(p)||p.playerName!==c.name||p.playerJob!==c.job)throw Error('角色資料不一致，停止寫入');expected=progress.save(c.id,p,expected);warn('');return true}catch(e){warn(e.message);return false}}
function enter(){startA459GameAssets();home.hidden=true;creator.hidden=true;panel.hidden=true;byId('wrap').hidden=false;returnButton.hidden=false;playing=true;if(!renderStarted){renderStarted=true;game.startRendering()}}
function openDialog(title,message,confirm,callback){dialogAction=callback;byId('dialogTitle').textContent=title;byId('dialogMessage').textContent=message;byId('dialogMessage').hidden=!message;byId('audioSettings').hidden=true;byId('dialogConfirm').hidden=!confirm;byId('dialogConfirm').textContent=confirm||'';byId('homeDialog').showModal()}
byId('homeDialog').addEventListener('close',()=>{if(byId('homeDialog').returnValue==='confirm')dialogAction?.();dialogAction=null});
const panel=document.createElement('section');panel.id='a459Panel';panel.hidden=true;panel.innerHTML='<div class="a459-landscape" aria-hidden="true"><i class="mountain far"></i><i class="mountain near"></i><i class="river"></i><i class="bamboo left"></i><i class="bamboo right"></i></div><div class="a459-content"><h2>選擇你的江湖身分</h2><p class="a459-subtitle">一人一段江湖路 · 三個角色各自保留進度</p><div id="a459Slots"></div><p id="a459Notice" role="status"></p><button id="a459Back">返回首頁</button></div>';
document.body.append(panel);
const returnButton=document.createElement('button');returnButton.id='a459Return';returnButton.textContent='返回角色選擇';returnButton.hidden=true;returnButton.setAttribute('aria-label','儲存進度並返回角色選擇');document.body.append(returnButton);
const style=document.createElement('style');style.textContent='#a459Panel{position:fixed;z-index:900;inset:0;overflow:auto;padding:5vh 6vw;box-sizing:border-box;background:linear-gradient(160deg,#d9e8e6,#e4d2aa 65%,#91b7b4);color:#342d25;text-align:center}#a459Panel h2{font-size:clamp(22px,4vw,38px);color:#4b3927}#a459Slots{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin:3vh auto}#a459Slots article{width:min(27vw,230px);min-width:145px;min-height:150px;padding:12px;border:4px ridge #b78d49;background:#f5e9ce;box-shadow:0 8px 24px #42351d44;border-radius:12px}#a459Slots h3{font-size:20px}#a459Panel button{padding:10px;margin:5px;background:#332e2a;color:#efd59b;border:2px solid #b78d49;border-radius:8px;font:inherit}#a459Panel button:disabled{opacity:.45}#a459Notice{color:#8b1f1f;min-height:1.5em}@media(max-width:600px){#a459Slots article{min-width:120px;width:26vw;padding:6px}#a459Panel button{font-size:13px;padding:7px}}';style.textContent+='#a459Slots article .a459Portrait{width:72px;height:101px;image-rendering:pixelated;object-fit:contain}#a459CreatorPreview{display:flex;align-items:center;justify-content:center;gap:18px;margin:8px auto}#a459CreatorPreview canvas{width:75px;height:103px;image-rendering:pixelated}#a459JobDescription{color:#f0d8a1;font-size:15px}#creator #card{border:4px ridge #b98e4b;background:linear-gradient(145deg,#343438,#1e292d);box-shadow:0 10px 35px #0008}#creator #card h1{color:#f2d59a}#creator .classBtn.sel{border-color:#d4a758;box-shadow:0 0 0 2px #d4a75855}';style.textContent+='#a459Return{position:fixed;z-index:850;top:max(10px,env(safe-area-inset-top));right:max(10px,env(safe-area-inset-right));background:#2b2b31;color:#f2d79b;border:2px solid #b78d49;border-radius:8px;padding:8px 12px;font:14px -apple-system,sans-serif}';style.textContent+=`
#a459Panel{background:linear-gradient(#8ec6df 0%,#d9edf0 37%,#b8cdb6 55%,#d7c9a0 100%);isolation:isolate}
#a459Panel .a459-content{position:relative;z-index:2;max-width:1120px;margin:auto}
#a459Panel h2{display:inline-block;margin:0 auto 12px;padding:10px 35px;border:4px double #d7b46b;background:#29282a;color:#f4d99c;box-shadow:0 6px 0 #624a32,0 10px 22px #253b4255;letter-spacing:.12em}
#a459Panel .a459-subtitle{margin:12px auto 18px;color:#443a2d;font-weight:700;text-shadow:0 1px #fff8}
#a459Panel .a459-landscape{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none}
#a459Panel .mountain{position:absolute;width:90%;height:65%;bottom:23%;clip-path:polygon(0 100%,15% 55%,26% 76%,44% 17%,57% 52%,68% 33%,86% 75%,100% 100%);background:linear-gradient(145deg,#dbe7dc 8%,#739d9b 48%,#507b80 100%);opacity:.6}
#a459Panel .mountain.far{left:-12%;transform:scale(.85);bottom:34%;opacity:.45}
#a459Panel .mountain.near{right:-22%;bottom:19%;opacity:.45}
#a459Panel .river{position:absolute;bottom:-18%;left:24%;width:52%;height:60%;transform:skew(-23deg);background:linear-gradient(100deg,#7ea6a5a6,#e3f1e8bb,#77a6a3a6);border-radius:50% 50% 0 0}
#a459Panel .bamboo{position:absolute;bottom:0;width:15%;height:65%;opacity:.36;background:repeating-linear-gradient(82deg,transparent 0 15px,#477b63 16px 21px,transparent 22px 36px);mask-image:linear-gradient(transparent,#000 40%)}
#a459Panel .bamboo.left{left:0}.a459-landscape .bamboo.right{right:0;transform:scaleX(-1)}
#a459Slots article{background:linear-gradient(145deg,#f9efd5ed,#e2c89ced);border:5px ridge #bb914e;box-shadow:0 10px 22px #32434a66;min-height:210px;display:flex;flex-direction:column;align-items:center;justify-content:center}
#a459Slots article h3{color:#382c24;margin:12px 0 4px}
#a459Slots article p{margin:5px 0 14px}
#a459Slots article .a459-emblem{width:65px;height:65px;display:grid;place-items:center;font-size:35px;border-radius:50%;border:3px double #b68c48;background:#312d2c;color:#e9cb8a}
#a459Slots article .a459-emblem.empty{background:#e9d7ae;color:#5e4833;font-size:40px}
#a459Slots article[data-job="劍俠"] .a459-emblem{border-color:#739ab8}
#a459Slots article[data-job="遊俠"] .a459-emblem{border-color:#a3b06c}
#a459Slots article[data-job="武者"] .a459-emblem{border-color:#b38964}
#a459Slots article button{min-width:95px}
@media(max-width:650px){#a459Panel{padding:3vh 3vw}#a459Panel h2{font-size:20px;padding:7px 12px}#a459Slots{gap:5px}#a459Slots article{min-width:0;width:29vw;min-height:175px}#a459Slots article h3{font-size:16px}#a459Slots article p{font-size:12px}#a459Slots article .a459-emblem{width:45px;height:45px;font-size:26px}#a459Slots article button{min-width:0;font-size:12px}}
`;document.head.append(style);
/* A4-59-H: actual class sprite previews, using existing original sprite sheets. */
const a459Art={
 '劍俠':{url:'assets/swordsman-a430.webp',frame:[2,2,98,161]},
 '遊俠':{url:'assets/ranger-a433.webp',frame:[0,0,91,164]},
 '武者':{url:'assets/spearman-a433.webp',frame:[0,0,123,163]}
};
const a459ImageCache=new Map();
function drawA459Portrait(canvas,job){
 const art=a459Art[job];if(!art)return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const paint=image=>{
  if(!canvas.isConnected||!image.naturalWidth)return;
  const [x,y,w,h]=art.frame;ctx.clearRect(0,0,canvas.width,canvas.height);
  const scale=Math.min((canvas.width-10)/w,(canvas.height-8)/h);
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(image,x,y,w,h,(canvas.width-w*scale)/2,(canvas.height-h*scale)/2,w*scale,h*scale);
 };
 let image=a459ImageCache.get(job);
 if(!image){image=new Image();a459ImageCache.set(job,image);image.onload=()=>{document.querySelectorAll('canvas[data-a459-job="'+job+'"]').forEach(el=>drawA459Portrait(el,job))};image.src=art.url}
 if(image.complete&&image.naturalWidth)paint(image);
}
function decorateCreator(){
 const card=byId('card');if(!card||byId('a459CreatorPreview'))return;
 const heading=card.querySelector('h1');
 if(heading)heading.textContent='建立你的江湖身分';
 const preview=document.createElement('div');preview.id='a459CreatorPreview';
 const portrait=document.createElement('canvas');portrait.width=110;portrait.height=150;portrait.dataset.a459Job='劍俠';
 const description=document.createElement('p');description.id='a459JobDescription';
 preview.append(portrait,description);card.insertBefore(preview,byId('nameInput'));
 function refresh(){
  const job=document.querySelector('.classBtn.sel')?.dataset.job||'劍俠';
  portrait.dataset.a459Job=job;
  description.textContent=({'劍俠':'劍行江湖 · 近身劍術','遊俠':'挽弓逐風 · 遠程弓術','武者':'長槍破陣 · 橫掃千軍'})[job];
  drawA459Portrait(portrait,job);
 }
 card.querySelectorAll('.classBtn').forEach(button=>button.addEventListener('click',()=>queueMicrotask(refresh)));
 refresh();
}
decorateCreator();
function note(t){byId('a459Notice').textContent=t}
function openSlots(){try{slots.read();panel.hidden=false;home.hidden=true;creator.hidden=true;render()}catch(e){warn(e.message)}}
function returnToSelection(){
 if(!playing||active===null)return;
 if(!persist()){alert('角色進度儲存失敗，已取消返回角色選擇。請先處理存檔問題。');return}
 playing=false;active=null;expected=null;pending=null;
 byId('wrap').hidden=true;returnButton.hidden=true;
 openSlots();
}
returnButton.onclick=()=>openDialog('返回角色選擇','將先儲存目前角色進度，再返回角色選擇畫面。','儲存並返回',returnToSelection);
function render(){const data=slots.read();const host=byId('a459Slots');host.replaceChildren();data.slots.forEach((c,i)=>{const box=document.createElement('article'),h=document.createElement('h3'),detail=document.createElement('p'),button=document.createElement('button'),emblem=document.createElement('div');box.dataset.job=c?.job||'';emblem.className='a459-emblem'+(c?'':' empty');emblem.textContent=c?({'劍俠':'劍','遊俠':'弓','武者':'槍'}[c.job]||'俠'):'＋';h.textContent=c?c.name:'＋ 空白欄位';detail.textContent=c?c.job+' · '+c.sex:'建立新角色';button.textContent=c?'進入江湖':'建立角色';button.onclick=()=>c?load(i):create(i);if(c){const portrait=document.createElement('canvas');portrait.width=100;portrait.height=140;portrait.className='a459Portrait';portrait.dataset.a459Job=c.job;box.append(portrait);queueMicrotask(()=>drawA459Portrait(portrait,c.job))}else box.append(emblem);box.append(h,detail,button);if(c){const del=document.createElement('button');del.textContent='刪除角色';del.onclick=()=>remove(i,c);box.append(del)}host.append(box)});note('')}
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
