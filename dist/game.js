'use strict';
const $=id=>document.getElementById(id),c=$('world'),ctx=c.getContext('2d'),mc=$('mini').getContext('2d'),N=640,T=48,KEY='zielona-dolina-v1';
const defs=[['zelazo','⚒','Kopalnia żelaza',65,20,'1 górnik · +4 żelaza / 12 s pracy'],['zloto','✦','Kopalnia złota',80,30,'1 górnik · +2 rudy złota / 12 s pracy'],['kuznia','⚒','Kuźnia',80,35,'Ulepszaj miecze, łuki i zbroje w panelu Dowodzenie'],['warsztat','⚙','Warsztat oblężniczy',100,40,'Buduje tarany i katapulty — panel Dowodzenie'],['targ','⚖','Targ',50,15,'Handel z odkrytymi osadami w pokoju — otwórz Osady i wojsko'],['brama_swoi','🛡','Brama dla swoich',20,5,'Przepuszcza swoich i blokuje wrogów. Możesz zastąpić zwykłą bramę lub palisadę'],['wieza','♜','Wieża strażnicza',60,35,'Odsłania mapę i ostrzeliwuje najeźdźców w promieniu 6 pól'],['werbunek','⚔','Biuro werbunkowe',80,25,'Otwórz Osady i wojsko, aby werbować żołnierzy'],['port','⚓','Port',90,30,'Buduj przy brzegu. Handel rzeczny i transport wojska przez wodę'],['most_staly','🌉','Most stały',30,15,'Zawsze otwarty. R — obrót. Stawiaj kolejne odcinki przez rzekę'],['sciezka','👣','Ścieżka',0,1,'Łączy budynki i przyspiesza ruch o 40%. Możesz budować pod ludkiem'],['dom','⌂','Dom',35,5,'Nowi mieszkańcy'],['kamieniolom','⛏','Kamieniołom',50,0,'1 kamieniarz · +4 kamienia na 12 sekund pracy. Buduj na pustym polu lub skale'],['drwal','🪓','Chata drwala',45,5,'+5 drewna / cykl'],['sklad','📦','Skład',25,5,'+200 pojemności'],['mlyn','⚙','Młyn',60,20,'Przy rzece, +6 żywności'],['handel','⚖','Skład handlowy',70,15,'5 drewna → 3 monety'],['stajnia','🐎','Stajnia',50,10,'Szybsze podróże'],['hodowla','🐑','Hodowla',40,5,'+4 żywności / cykl'],['gospodarstwo','🌾','Gospodarstwo',35,5,'+3 żywności / cykl'],['pole','🌱','Pole',10,0,'+2 żywności / cykl'],['palisada','🪵','Palisada',5,0,'Umocnienie na lądzie lub wodzie — na wodzie stoi na palach'],['brama','🚪','Brama',15,0,'Kliknij bramę lub naciśnij F, aby otworzyć / zamknąć. Możesz zastąpić odcinek palisady'],['wawoz','⛏','Wąwóz',0,4,'Wykop obronny — połącz z rzeką, aby napełnić wodą'],['most','🌉','Most zwodzony',25,5,'Przejście przez wodę. R — obrót; w trybie mostu kliknij istniejący most, aby go obrócić']];
let state={p:{x:120*T,y:120*T},wood:65,stone:25,food:35,gold:0,cut:[],buildings:[{x:118,y:120,type:'start'}],seen:[],settled:null,chopped:0,time:0,open:true};try{let s=JSON.parse(localStorage.getItem(KEY));if(s&&s.p&&Array.isArray(s.buildings))state=s}catch{}
let cut=new Set(state.cut),seen=new Set(state.seen),keys={},mode=null,target=null,zoom=1,mouse={x:0,y:0},worldCursor=null,tick=0,last=performance.now(),axetime=0,toastTimer;
// Full-map codes keep a compact flag instead of serializing 409,600 tile keys.
const exploredTileHas=seen.has;seen.has=function(key){if(state.fullMap){const [x,y]=String(key).split(',').map(Number);if(Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<N&&y<N)return true}return exploredTileHas.call(this,key)};
function* mapVisionTiles(){if(state.fullMap){for(let y=0;y<N;y+=2)for(let x=0;x<N;x+=2)yield x+','+y}else yield* seen}
function mapVisionSize(){return state.fullMap?N*N/4:seen.size}
function hash(x,y){let n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)}
let floodedTrenches=new Set(),waterRevision=0;
function refreshWater(){
 const channels=new Map(state.buildings.filter(b=>b.type==='wawoz'||b.channel).map(b=>[b.x+','+b.y,b]));
 const wet=new Set(),queue=[];
 for(const [k,b] of channels)if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>Math.abs(b.x+dx-river(b.y+dy))<2.1)){wet.add(k);queue.push(b)}
 for(let i=0;i<queue.length;i++){const b=queue[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const k=(b.x+dx)+','+(b.y+dy);if(channels.has(k)&&!wet.has(k)){wet.add(k);queue.push(channels.get(k))}}}
 if(wet.size!==floodedTrenches.size||[...wet].some(k=>!floodedTrenches.has(k)))waterRevision++;
 floodedTrenches=wet;
}
function river(y){return state.campaign?.stage==='desert'?141+Math.sin(y*.031+1)*16:141+Math.sin(y*.044)*13+Math.sin(y*.13)*3}function terrain(x,y){for(const island of state.riverAdventure?.islands||[]){const dx=x-island.x,dy=y-island.y,d=dx*dx+dy*dy;if(d<=4)return 'grass';if(d<=7)return 'sand';if(dx*dx/64+dy*dy/100<=1)return 'water'}if(x<0||y<0||x>=N||y>=N)return 'edge';if(floodedTrenches.has(x+','+y))return 'water';let r=Math.abs(x-river(y));if(r<2.1)return 'water';if(r<3.2)return 'sand';if(x>174&&x<178+Math.sin(y*.1)*2&&y>60&&y<182)return 'ravine';return 'grass'}
function natural(x,y){if(terrain(x,y)!=='grass'||cut.has(x+','+y)||Math.hypot(x-120,y-120)<3||building(x,y)||(typeof foreignBuilding==='function'&&foreignBuilding(x,y)))return null;let h=hash(x,y);return h>.69?'tree':h<.035?'rock':null}
let buildingIndexSource=null,buildingIndexLength=-1,buildingIndex=new Map();
function building(x,y){if(buildingIndexSource!==state.buildings||buildingIndexLength!==state.buildings.length){buildingIndexSource=state.buildings;buildingIndexLength=state.buildings.length;buildingIndex=new Map(state.buildings.map(b=>[b.x+','+b.y,b]))}return buildingIndex.get(x+','+y)}function nearWater(x,y){for(let a=-5;a<=5;a++)for(let b=-5;b<=5;b++)if(terrain(x+a,y+b)==='water')return true;return false}
function say(t){$('toast').textContent=t;$('toast').style.opacity=1;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').style.opacity=0,4200)}
let simulationActive=false,simulationSavePending=false,lastSimulationSave=-Infinity;
let pendingCampaignSave=null;
function save(){if(pendingCampaignSave!==null)return true;if(simulationActive){simulationSavePending=true;return true}simulationSavePending=false;lastSimulationSave=performance.now();buildingIndexSource=null;refreshWater();state.cut=[...cut];state.seen=[...seen];try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch{say('Brak miejsca na zapis w przeglądarce.');return false}}
function capacity(){return 250+(typeof castleLevel==='function'?castleLevel()*200:0)+state.buildings.filter(b=>b.type==='sklad').length*200}function population(){return 1+(state.settled?2:0)+state.buildings.filter(b=>b.type==='dom').reduce((n,b)=>n+3+2*(Math.max(1,Math.min(3,b.level||1))-1),0)}
const uiHTMLCache=new Map();function setUIHTML(id,html){if(uiHTMLCache.get(id)===html)return;uiHTMLCache.set(id,html);$(id).innerHTML=html}
function ui(){let res=[['🪵',Math.floor(state.wood),'DREWNO'],['◆',Math.floor(state.stone),'KAMIEŃ'],['🌾',Math.floor(state.food),'ŻYWNOŚĆ'],['●',state.gold,'MONETY'],['♟',population(),'MIESZKAŃCY'],...(typeof initFrontier==='function'&&state.frontier?[['⚒',Math.floor(state.iron),'ŻELAZO'],['✦',Math.floor(state.goldOre),'RUDA ZŁOTA']]:[])];const resourcesHTML=res.map(r=>`<div>${r[0]} ${r[1]}<small>${r[2]}</small></div>`).join('');setUIHTML('resources',resourcesHTML);let tasksHTML=`${state.chopped>=5?'✓':'○'} Zetnij 5 drzew (${Math.min(5,state.chopped)}/5)<br>${state.settled?'✓':'○'} Załóż osadę nad rzeką<br>${state.buildings.length>=6?'✓':'○'} Zbuduj 5 obiektów (${Math.min(5,state.buildings.length-1)}/5)`;if(state.settled){const assigned=residents.filter(r=>r.job).length,working=residents.filter(r=>r.phase==='praca').length,jobs=state.buildings.filter(b=>WORK_TYPES.includes(b.type)).length;tasksHTML+=`<br>♟ Pracownicy: ${assigned}/${jobs} miejsc · teraz pracuje ${working}<br><small>2 osadników na start · 3–7 za dom (zależnie od poziomu)</small>`}if(state.village?.alarm)tasksHTML+='<br>⚠ Alarm obronny: mieszkańcy zostają przy domach. Zakończ alarm w panelu Życie osady.';setUIHTML('tasks',tasksHTML);$('coords').textContent=`${Math.floor(state.p.x/T)}, ${Math.floor(state.p.y/T)} · odkryto ${(state.fullMap?100:seen.size/N/N*100).toFixed(1)}%`;if(typeof renderWarPanel==='function')renderWarPanel();$('objective').textContent=state.settled?'Osada żyje! Domy przyciągają mieszkańców. Drwale, kamieniarze, młynarze i rolnicy produkują surowce podczas pracy.':'Zbierz drewno i znajdź rzekę. Tam powstanie twoja osada.'}
function setMode(m){mode=m;target=null;$('mode').textContent=m?(m==='rozbiorka'?'Rozbiórka':defs.find(d=>d[0]===m)[2])+' — kliknij pole':'Wybierz budowlę';document.querySelectorAll('[data-type]').forEach(b=>b.classList.toggle('active',b.dataset.type===m));$('axe').classList.toggle('active',!m)}
for(const d of defs){let b=document.createElement('button');b.dataset.type=d[0];b.title=d[5];b.innerHTML=`<b>${d[1]}</b>${d[2]}<small>${d[3]} 🪵 ${d[4]?d[4]+' ◆':''}</small>`;b.onclick=()=>{setMode(d[0]);say(d[5]+'. Postaw w odległości do 7 pól od ludka.')} ;$('buildings').append(b)}
function supportsWaterCrossing(b){return b?.type==='pomost'||b?.type==='most_staly'||b?.type==='most'&&state.open||b?.type==='brama'&&b.open||b?.type==='brama_swoi'}
function blocked(x,y){let ix=Math.floor(x/T),iy=Math.floor(y/T);if(typeof orcWallBlocked==='function'&&orcWallBlocked(ix,iy))return true;let t=terrain(ix,iy),b=building(ix,iy);return t==='edge'||((t==='water'||t==='ravine'||b?.type==='wawoz')&&!supportsWaterCrossing(b))||b?.type==='palisada'||b?.type==='wieza'||(b?.type==='brama'&&!b.open)}
let bridgeDirection=null;
function bridgeAxis(b){
 if(b.axis==='horizontal'||b.axis==='vertical')return b.axis;
 const wet=(x,y)=>['water','ravine'].includes(terrain(x,y))||building(x,y)?.type==='wawoz';
 const span=(dx,dy)=>{let total=0;for(const sign of [-1,1]){let n=1;while(n<32&&wet(b.x+dx*n*sign,b.y+dy*n*sign))n++;total+=n}return total};
 return span(0,1)<span(1,0)?'vertical':'horizontal';
}
function rotateBridge(){
 if(mode==='most'||mode==='most_staly'){bridgeDirection=(bridgeDirection||bridgeAxis({x:Math.floor(mouse.x/T),y:Math.floor(mouse.y/T)}))==='horizontal'?'vertical':'horizontal';say('Nowy most: '+(bridgeDirection==='vertical'?'góra–dół':'lewo–prawo')+'. Kliknij teren.');return}
 const b=state.buildings.filter(b=>['most','most_staly'].includes(b.type)).sort((a,b)=>Math.hypot(a.x+.5-state.p.x/T,a.y+.5-state.p.y/T)-Math.hypot(b.x+.5-state.p.x/T,b.y+.5-state.p.y/T))[0];
 if(!b||Math.hypot(b.x+.5-state.p.x/T,b.y+.5-state.p.y/T)>7){say('Podejdź do mostu (do 7 pól), aby go obrócić.');return}
 b.axis=bridgeAxis(b)==='horizontal'?'vertical':'horizontal';save();say('Most obrócony.');
}
// Cosmetic transitions stay outside the save and never alter passage rules.
const structureAnimations=new WeakMap();
function structureOpenAmount(b,kind,open,now=performance.now()){
 const target=open?1:0;let states=structureAnimations.get(b);
 if(!states){states={};structureAnimations.set(b,states)}
 let motion=states[kind];
 if(!motion){states[kind]={from:target,to:target,start:now,duration:0};return target}
 const sample=m=>{const t=m.duration?Math.max(0,Math.min(1,(now-m.start)/m.duration)):1;return m.from+(m.to-m.from)*(t*t*(3-2*t))};
 const value=sample(motion);
 if(motion.to!==target){motion=states[kind]={from:value,to:target,start:now,duration:650*Math.abs(target-value)}}
 return sample(motion);
}
function drawBridge(b,x,y){
 const movable=b.type!=='most_staly',extended=movable?structureOpenAmount(b,'bridge',state.open):1,end=-24+10+38*extended,vertical=bridgeAxis(b)==='vertical';
 // The near bank stays fixed; retract the deck along its own axis without lift.
 const point=(along,cross)=>vertical?[x-cross,y-5+along]:[x+along,y-5+cross];
 ctx.save();
 polygon([point(-24,-17),point(end,-17),point(end,17),point(-24,17)],'#b99c65');
 ctx.strokeStyle='#685035';ctx.lineWidth=1;
 for(let along=-24;along<=end;along+=6){ctx.beginPath();ctx.moveTo(...point(along,-17));ctx.lineTo(...point(along,17));ctx.stroke()}
 for(const side of [-19,17]){ctx.strokeStyle='#654b31';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(...point(-24,side));ctx.lineTo(...point(end,side));ctx.stroke()}
 ctx.strokeStyle='#80603b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(...point(end,-18));ctx.lineTo(...point(end,18));ctx.stroke();
 ctx.fillStyle='#dbbf82';for(const along of [-23,21])for(const cross of [-19,15]){const p=point(along,cross);ctx.fillRect(p[0]-1,p[1]-1,3,5)}
 ctx.restore();
 if(movable&&Math.abs(extended-(state.open?1:0))>.02){ctx.save();ctx.fillStyle='#f0d99a';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText(state.open?'WYSUWANIE':'CHOWANIE',x,y-38);ctx.restore()}
}
function wallLinks(b){
 const linked=(dx,dy)=>{const n=building(b.x+dx,b.y+dy);return ['palisada','brama','brama_swoi'].includes(n?.type)||n?.type==='wieza'&&n.material==='stone'};
 return {up:linked(0,-1),down:linked(0,1),left:linked(-1,0),right:linked(1,0)};
}
function gateVertical(b){const l=wallLinks(b);return Number(l.up)+Number(l.down)>Number(l.left)+Number(l.right)}
function toggleGate(b){
 if(b?.type==='brama_swoi'){say('Ta brama otwiera się automatycznie tylko dla swoich. Wrogowie nie przejdą.');return}if(!b){say('Podejdź do bramy i kliknij ją lub naciśnij F.');return}
 if(Math.hypot(b.x+.5-state.p.x/T,b.y+.5-state.p.y/T)>3){say('Podejdź bliżej bramy (do 3 pól).');return}
 if(b.open&&Math.floor(state.p.x/T)===b.x&&Math.floor(state.p.y/T)===b.y){say('Zejdź z przejścia, zanim zamkniesz bramę.');return}
 b.open=!b.open;target=null;say(b.open?'Brama otwarta — możesz wyjść z osady.':'Brama zamknięta.');save();
}
function nearestGate(){return state.buildings.filter(b=>['brama','brama_swoi'].includes(b.type)).sort((a,b)=>Math.hypot(a.x+.5-state.p.x/T,a.y+.5-state.p.y/T)-Math.hypot(b.x+.5-state.p.x/T,b.y+.5-state.p.y/T))[0]}
// Recover old saves where a wall, trench, or raised bridge traps the player.
function rescuePlayer(){
 if(state.playerBoat?.aboard){const x=Math.floor(state.p.x/T),y=Math.floor(state.p.y/T),b=building(x,y);if(terrain(x,y)==='water'&&b?.type!=='palisada'&&!(b?.type==='brama'&&!b.open))return false;state.playerBoat.aboard=false}
 if(!blocked(state.p.x,state.p.y))return false;
 const px=Math.floor(state.p.x/T),py=Math.floor(state.p.y/T);
 for(let r=1;r<N;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
  if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
  const x=(px+dx+.5)*T,y=(py+dy+.5)*T;
  if(!blocked(x,y)&&!natural(px+dx,py+dy)&&!building(px+dx,py+dy)){
   state.p={x,y};target=null;save();say('Ludek został uwolniony z przeszkody. Twoja osada jest zachowana.');return true;
  }
 }
 return false;
}
function demolish(x,y){
 if(Math.hypot(x+.5-state.p.x/T,y+.5-state.p.y/T)>7){say('Podejdź bliżej obiektu do rozbiórki.');return}
 const b=building(x,y);if(!b||b.type==='start'||b.originalType==='start'){say('Wybierz zbudowany obiekt. Domek startowy zostaje.');return}
 const d=defs.find(d=>d[0]===b.type)||['ruiny','','Ruiny',0,0];state.buildings.splice(state.buildings.indexOf(b),1);
 state.wood=Math.min(capacity(),state.wood+Math.floor(d[3]/2));state.stone+=Math.floor(d[4]/2);
 say('Rozebrano: '+d[2]+'. Odzyskano połowę surowców.');ui();save();
}
function chop(){if(axetime>.05)return;let px=Math.floor(state.p.x/T),py=Math.floor(state.p.y/T),best=null,dist=Infinity;for(let x=px-2;x<=px+2;x++)for(let y=py-2;y<=py+2;y++){let n=natural(x,y),d=Math.hypot((x+.5)*T-state.p.x,(y+.5)*T-state.p.y);if(n&&d<dist){best={x,y,n};dist=d}}if(!best||dist>T*2){say('Podejdź bliżej drzewa lub skały.');return}if(best.n==='tree'){if(state.wood>=capacity()){say('Skład jest pełny. Zbuduj kolejny skład.');return}state.wood=Math.min(capacity(),state.wood+12);state.chopped++;say('+12 drewna')}else{state.stone+=8;say('+8 kamienia')}cut.add(best.x+','+best.y);axetime=.6;ui()}
function build(x,y){if(mode==='rozbiorka'){demolish(x,y);return}if(['most','most_staly'].includes(mode)&&['most','most_staly'].includes(building(x,y)?.type)){const b=building(x,y);if(Math.hypot(x+.5-state.p.x/T,y+.5-state.p.y/T)>7){say('Podejdź bliżej mostu.');return}b.axis=bridgeAxis(b)==='horizontal'?'vertical':'horizontal';save();say('Most obrócony.');return}let d=defs.find(d=>d[0]===mode);if(!d)return;if(!state.settled){say('Najpierw załóż osadę nad rzeką przyciskiem ⚑.');return}if(Math.hypot(x+.5-state.p.x/T,y+.5-state.p.y/T)>7){say('Podejdź bliżej miejsca budowy (maks. 7 pól).');return}if(mode!=='sciezka'&&x===Math.floor(state.p.x/T)&&y===Math.floor(state.p.y/T)){say('Nie możesz budować pod ludkiem. Wybierz sąsiednie pole.');return}let t=terrain(x,y),existing=building(x,y),upgrade=(existing?.type==='sciezka'&&mode!=='sciezka')||(mode==='brama'&&existing?.type==='palisada')||(mode==='brama_swoi'&&['palisada','brama'].includes(existing?.type))||(['most','most_staly','palisada','brama','brama_swoi','pomost'].includes(mode)&&existing?.type==='wawoz'&&(terrain(x,y)==='water'||['most','most_staly'].includes(mode)));if(t==='edge'||(typeof foreignBuilding==='function'&&foreignBuilding(x,y))||(existing&&!upgrade)||(natural(x,y)&&!(['kamieniolom','zelazo','zloto'].includes(mode)&&natural(x,y)==='rock'))){say('To pole jest zajęte. Wyczyść teren toporkiem.');return}if(['most','most_staly'].includes(mode)?!['water','ravine'].includes(t)&&existing?.type!=='wawoz':(t==='water'&&!['palisada','brama','brama_swoi','pomost'].includes(mode))||t==='ravine'){say(['most','most_staly'].includes(mode)?'Most postaw na rzece lub wąwozie.':'Tutaj potrzebujesz mostu.');return}if(mode==='port'&&![[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>terrain(x+dx,y+dy)==='water')){say('Port musi stać na lądzie tuż przy wodzie.');return}if(mode==='mlyn'&&!nearWater(x,y)){say('Młyn potrzebuje rzeki w pobliżu.');return}if(state.wood<d[3]||state.stone<d[4]){say('Brakuje surowców. Zbierz drewno lub kamień.');return}state.wood-=d[3];state.stone-=d[4];if(['kamieniolom','zelazo','zloto'].includes(mode))cut.add(x+','+y);if(upgrade)state.buildings.splice(state.buildings.indexOf(existing),1);state.buildings.push({x,y,type:mode,...(mode==='brama'?{open:true}:{}),...(['most','most_staly'].includes(mode)&&bridgeDirection?{axis:bridgeDirection}:{}),...((existing?.channel||existing?.type==='wawoz')&&['most','most_staly','palisada','brama','brama_swoi','pomost'].includes(mode)?{channel:true}:{})});say('Gotowe: '+d[2]);ui();save()}
$('settle').onclick=()=>{if(state.settled){say('Twoja osada już istnieje. Rozbudowuj ją w dowolnym kierunku!');return}let x=Math.floor(state.p.x/T),y=Math.floor(state.p.y/T);if(!nearWater(x,y)){say('Znajdź miejsce do 5 pól od rzeki. Kieruj się na wschód →');return}if(state.wood<50){say('Założenie osady kosztuje 50 drewna.');return}state.wood-=50;state.settled={x,y};say('Założono osadę Zielona Dolina! Możesz budować.');ui();save()};
$('bridgeRotate').onclick=rotateBridge;
$('gateToggle').onclick=()=>toggleGate(nearestGate());
$('demolish').onclick=()=>{setMode('rozbiorka');say('Kliknij obiekt do rozbiórki. Odzyskasz połowę surowców.')};
$('axe').onclick=()=>{setMode(null);chop()};$('cancel').onclick=()=>setMode(null);$('bridgeToggle').onclick=()=>{if(state.open&&building(Math.floor(state.p.x/T),Math.floor(state.p.y/T))?.type==='most'){say('Najpierw zejdź z mostu, aby go podnieść.');return}state.open=!state.open;say(state.open?'Mosty opuszczone — można przechodzić.':'Mosty podniesione — przejście zamknięte.');save()};$('home').onclick=()=>{state.p={x:120*T,y:120*T};target=null;rescuePlayer();say('Wrócono do domku.');save()};$('save').onclick=()=>{if(save())say('Zapisano przygodę w tej przeglądarce.')};$('help').onclick=()=>$('overlay').classList.remove('hidden');$('play').onclick=()=>$('overlay').classList.add('hidden');$('reset').onclick=()=>{if(confirm('Usunąć postęp i zacząć od nowa?')){localStorage.removeItem(KEY);location.reload()}};
window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName)||e.target?.isContentEditable)return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys[e.key.toLowerCase()]=true;if(e.repeat)return;if(e.key.toLowerCase()==='e')chop();if(e.key.toLowerCase()==='r')rotateBridge();if(e.key.toLowerCase()==='f')toggleGate(nearestGate());if(e.key==='Escape')setMode(null);if(e.key.toLowerCase()==='b')setMode('dom')});window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);window.addEventListener('blur',()=>keys={});
function worldPoint(e){return {x:state.p.x+(e.clientX-innerWidth/2)/zoom,y:state.p.y+(e.clientY-innerHeight*.46)/zoom}}
c.onpointermove=e=>{worldCursor={clientX:e.clientX,clientY:e.clientY};mouse=worldPoint(e)};c.onpointerleave=()=>{worldCursor=null};c.onpointerdown=e=>{worldCursor={clientX:e.clientX,clientY:e.clientY};mouse=worldPoint(e);let x=Math.floor(mouse.x/T),y=Math.floor(mouse.y/T);if(mode)build(x,y);else if(['brama','brama_swoi'].includes(building(x,y)?.type))toggleGate(building(x,y));else if(natural(x,y)&&Math.hypot(mouse.x-state.p.x,mouse.y-state.p.y)<T*2.3)chop();else target=mouse};c.onwheel=e=>{e.preventDefault();zoom=Math.max(.5,Math.min(1.8,zoom-e.deltaY*.001))};
function reveal(){let px=Math.floor(state.p.x/T),py=Math.floor(state.p.y/T);for(let x=px-10;x<=px+10;x++)for(let y=py-10;y<=py+10;y++)if(x>=0&&y>=0&&x<N&&y<N&&Math.hypot(x-px,y-py)<11)seen.add(x+','+y)}
const WORK_TYPES=['drwal','kamieniolom','mlyn','pole','zelazo','zloto'];
let residents=[],peopleSignature='',peopleTimer=0,residentRecheck=0,workLedger=new Map();
const personNames=['Antek','Zosia','Janek','Hanka','Witek','Marysia','Franek','Basia','Piotr','Ola','Tomek','Iga'];
function tileKey(x,y){return x+','+y}
function npcWalkable(x,y){return !blocked((x+.5)*T,(y+.5)*T)&&!natural(x,y)}
function forestSoldier(u){return !!u&&u!==state.life?.dog&&!['ram','catapult'].includes(u.kind)&&(typeof u.hp==='number'||['melee','archer','crossbow','shield','cavalry'].includes(u.kind))}
function unitWalkable(u,x,y){return forestSoldier(u)?!blocked((x+.5)*T,(y+.5)*T):npcWalkable(x,y)}
function routeCost(x,y){const type=building(x,y)?.type;return type==='sciezka'?1:(type==='most'||type==='most_staly'||type==='brama'||type==='brama_swoi'?1.25:3)}
function* residentRouteSearch(from,to,longRange=false,walkable=npcWalkable){
 const sx=Math.floor(from.x/T),sy=Math.floor(from.y/T),gx=to.x,gy=to.y,start=tileKey(sx,sy);
 if(sx===gx&&sy===gy)return [];
 if(!walkable(gx,gy))return null;
 // A* with a lower cost for paths: prefer a modest road detour over a grass shortcut.
 const heap=[],parents=new Map([[start,null]]),costs=new Map([[start,0]]);
 const push=n=>{heap.push(n);let i=heap.length-1;while(i>0){let p=(i-1)>>1;if(heap[p].f<=n.f)break;heap[i]=heap[p];i=p}heap[i]=n};
 const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c}heap[i]=last}return top};
 push({x:sx,y:sy,g:0,f:Math.abs(gx-sx)+Math.abs(gy-sy)});let visited=0;
 while(heap.length&&visited<(longRange?200000:5000)){const cur=pop(),{x,y,g}=cur,k=tileKey(x,y);if(g!==costs.get(k))continue;visited++;if(visited%64===0)yield;
  if(x===gx&&y===gy){const path=[];let point=[x,y];while(point&&tileKey(...point)!==start){path.push({x:(point[0]+.5)*T,y:(point[1]+.5)*T});point=parents.get(tileKey(...point))}return path.reverse()}
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,nk=tileKey(nx,ny);
   if(Math.abs(nx-sx)>(longRange?Math.max(45,Math.abs(gx-sx)+48):45)||Math.abs(ny-sy)>(longRange?Math.max(45,Math.abs(gy-sy)+48):45)||!walkable(nx,ny))continue;
   const next=g+routeCost(nx,ny);if(next>=(costs.get(nk)??Infinity))continue;
   costs.set(nk,next);parents.set(nk,[x,y]);push({x:nx,y:ny,g:next,f:next+Math.abs(gx-nx)+Math.abs(gy-ny)});
  }
 }return null;
}
function findRoute(from,to,longRange=false){const task=residentRouteSearch(from,to,longRange,(x,y)=>unitWalkable(from,x,y));let result;do{result=task.next()}while(!result.done);return result.value}
let residentAssignmentTask=null,residentRouteQueue=[];
function requestResidentRoute(r,goal,destination){if(r.routePending)return;r.routePending=true;residentRouteQueue.push({r,goal:{...goal},destination,task:residentRouteSearch(r,goal,Math.max(Math.abs(r.x/T-goal.x),Math.abs(r.y/T-goal.y))>40)})}
function* assignResidentJobs(ordered){
 // A blocked workshop must not hold up the entire village's job queue.
 function* assignOne(r){r.routePending=true;const candidates=ordered.filter(b=>typeof allowedWork!=='function'||allowedWork(b,r.id)).map((b,i)=>({b,i,d:Math.hypot(b.x+.5-r.x/T,b.y+.5-r.y/T)})).sort((a,b)=>a.d-b.d||a.i-b.i);
  for(const {b} of candidates){if(residents.some(u=>u.job===b)||(typeof reservedWork==='function'&&reservedWork(b,r.id)))continue;const spot=workSpot(b);if(!spot)continue;const far=Math.max(Math.abs(r.x/T-spot.x),Math.abs(r.y/T-spot.y))>40,path=yield* residentRouteSearch(r,spot,far);if(path!==null&&!residents.some(u=>u.job===b)){r.job=b;r.work=spot;r.destination='praca';r.path=path;r.phase=path.length?'do pracy':'praca';r.wait=0;r.progress=0;r.routePending=false;return}yield}r.routePending=false;r.phase='szuka pracy';r.wait=1;
 }
 const free=residents.filter(r=>!r.job&&!r.routePending);for(const r of free)r.routePending=true;const tasks=free.map(r=>assignOne(r));while(tasks.length){const task=tasks.shift();if(!task.next().done)tasks.push(task);yield}
}
function processResidentPlanning(){
 // Each generator slice expands at most 64 nodes. Keep construction and blocked
 // workplaces from launching hundreds of full searches in one animation frame.
 for(let slice=0;slice<8;slice++){
  if(residentRouteQueue.length&&(slice%2===0||!residentAssignmentTask)){
   const job=residentRouteQueue.shift(),result=job.task.next();if(!result.done){residentRouteQueue.push(job);continue}
   const r=job.r;r.routePending=false;if(!residents.includes(r))continue;
   if(result.value!==null){r.path=result.value;r.destination=job.destination;r.phase=r.path.length?(job.destination==='praca'?'do pracy':job.destination==='odpoczynek'?'do domu':'spacer'):job.destination;r.wait=job.destination==='odpoczynek'?2:0}
   else{r.phase=r.job?'brak drogi':'spacer';r.wait=3}
  }else if(residentAssignmentTask){if(residentAssignmentTask.next().done)residentAssignmentTask=null}else break;
 }
}
function nearbySpot(x,y){for(let r=0;r<5;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(npcWalkable(x+dx,y+dy))return {x:x+dx,y:y+dy};return null}
function workSpot(b){
 // Keep workers visible outside their workplace, rather than behind its roof.
 const spots=[[0,1],[1,0],[-1,0],[0,-1],[0,0]].map(([dx,dy])=>({x:b.x+dx,y:b.y+dy})).filter(p=>npcWalkable(p.x,p.y)&&(!building(p.x,p.y)||['sciezka','most','most_staly','brama','brama_swoi'].includes(building(p.x,p.y).type)));spots.sort((a,b)=>routeCost(a.x,a.y)-routeCost(b.x,b.y));return spots[0]||null;
}
function syncResidents(){
 const sig=JSON.stringify([state.settled,state.buildings.map(b=>[b.x,b.y,b.type,b.open,b.level]),state.open]);if(sig===peopleSignature)return;peopleSignature=sig;
 const homes=[];if(state.settled)for(let i=0;i<2;i++)homes.push(state.settled);
 for(const b of state.buildings)if(b.type==='dom')for(let i=0;i<3+2*(Math.max(1,Math.min(3,b.level||1))-1);i++)homes.push(b);
 residentRouteQueue=[];
 residents=homes.map((home,i)=>{const spot=workSpot(home)||nearbySpot(home.x,home.y)||{x:120,y:120},old=residents[i],keep=old?.job&&state.buildings.includes(old.job)&&WORK_TYPES.includes(old.job.type)&&old.work&&npcWalkable(old.work.x,old.work.y);return {...old,id:i,name:personNames[i%personNames.length]+(i>=personNames.length?' '+(1+Math.floor(i/personNames.length)):''),x:old?.x??(spot.x+.5)*T,y:old?.y??(spot.y+.5)*T,home:spot,job:keep?old.job:null,path:keep?old.path:[],phase:keep?old.phase:'spacer',wait:keep?old.wait:1+i%4,progress:keep?old.progress:0,routePending:false}});
 const jobs=state.buildings.filter(b=>WORK_TYPES.includes(b.type));
 // Round-robin by profession so fields do not take every available worker.
 const buckets=new Map(WORK_TYPES.map(type=>[type,[]]));for(const job of jobs)buckets.get(job.type).push(job);const ordered=[],rounds=Math.max(0,...[...buckets.values()].map(list=>list.length));for(let i=0;i<rounds;i++)for(const type of WORK_TYPES){const b=buckets.get(type)[i];if(b)ordered.push(b)}
 residentAssignmentTask=assignResidentJobs(ordered);
 const live=new Set(jobs.map(b=>tileKey(b.x,b.y)));for(const k of workLedger.keys())if(!live.has(k))workLedger.delete(k);
}
function updateResidents(dt){
 peopleTimer+=dt;if(peopleTimer>1){peopleTimer=0;syncResidents()}
 residentRecheck+=dt;if(residentRecheck>=5&&!residentAssignmentTask){residentRecheck=0;const jobs=state.buildings.filter(b=>WORK_TYPES.includes(b.type)&&!residents.some(r=>r.job===b));if(jobs.length&&residents.some(r=>!r.job&&!r.routePending))residentAssignmentTask=assignResidentJobs(jobs)}
 processResidentPlanning();
 for(const r of residents){
  if(r.routePending)continue;
  if(r.path.length){const p=r.path[0];if(blocked(p.x,p.y)){r.path=[];r.phase='czeka';r.wait=1;continue}const dx=p.x-r.x,dy=p.y-r.y,d=Math.hypot(dx,dy),step=65*dt*pathSpeed(r.x,r.y);if(d<=step){r.x=p.x;r.y=p.y;r.path.shift();if(!r.path.length){r.phase=r.destination||'praca';r.wait=r.phase==='odpoczynek'?2:0}}else{r.x+=dx/d*step;r.y+=dy/d*step}continue}
  if(r.job&&r.phase==='praca'){const k=tileKey(r.job.x,r.job.y);workLedger.set(k,(workLedger.get(k)||0)+dt);r.progress+=dt;if(r.progress>10){r.progress=0;requestResidentRoute(r,r.home,'odpoczynek')}continue}
  r.wait-=dt;if(r.wait>0)continue;
  if(r.job){requestResidentRoute(r,r.work,'praca')}
  else {const spot=nearbySpot(r.home.x+Math.floor(hash(r.id,state.time)*7)-3,r.home.y+Math.floor(hash(state.time,r.id)*7)-3);if(spot)requestResidentRoute(r,spot,'spacer');r.wait=3+r.id%4}
 }
}
function drawResident(r){
 const walking=r.path.length>0,working=r.phase==='praca',a=state.time*8+r.id,swing=walking?Math.sin(a)*3:0,x=r.x,y=r.y;
 ctx.fillStyle='#1d302b55';ctx.beginPath();ctx.ellipse(x,y+5,9,4,0,0,7);ctx.fill();ctx.fillStyle='#493e31';if(typeof drawWalkingLegs==='function')drawWalkingLegs(x,y-3,r,'#493e31');else{ctx.fillRect(x-6,y-3,4,9+swing);ctx.fillRect(x+2,y-3,4,9-swing)}
 ctx.fillStyle=r.job?.type==='kamieniolom'?'#a4aab2':r.job?.type==='drwal'?'#bc7651':r.job?.type==='mlyn'?'#ddd5b5':r.job?.type==='pole'?'#91a24f':'#7a9ca0';ctx.fillRect(x-7,y-17,14,16);
 ctx.fillStyle='#efd1a1';ctx.beginPath();ctx.arc(x,y-23,6,0,7);ctx.fill();ctx.fillStyle='#775533';ctx.fillRect(x-8,y-30,16,5);
 if(working){ctx.strokeStyle='#d6c9a5';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+8,y-10);ctx.lineTo(x+15+Math.sin(a)*5,y-23+Math.cos(a)*4);ctx.stroke();if(r.job.type==='kamieniolom'){const tx=x+15+Math.sin(a)*5,ty=y-23+Math.cos(a)*4;ctx.beginPath();ctx.moveTo(tx-6,ty-3);ctx.lineTo(tx+6,ty+3);ctx.stroke()}ctx.lineWidth=1}
 if(working||Math.hypot(x-state.p.x,y-state.p.y)<140){ctx.font='9px system-ui';ctx.textAlign='center';let label=r.name+(working?' · '+({drwal:'🪓 drwal',kamieniolom:'⛏ kamieniarz',mlyn:'⚙ młynarz',pole:'🌾 rolnik',zelazo:'⚒ górnik żelaza',zloto:'✦ górnik złota'}[r.job.type]):'');ctx.fillStyle='#183027d9';const w=ctx.measureText(label).width;ctx.fillRect(x-w/2-4,y-47,w+8,13);ctx.fillStyle='#f4edda';ctx.fillText(label,x,y-37);ctx.textAlign='start'}
}
function production(){
 const seasonal=typeof frontierProduction==='function'?frontierProduction():1;
 let wood=0,food=0,stone=0;for(const b of state.buildings){const seconds=(workLedger.get(tileKey(b.x,b.y))||0)*(typeof buildingWorkFactor==='function'?buildingWorkFactor(b):1);
  if(b.type==='drwal')wood+=seconds/12*5;if(b.type==='kamieniolom')stone+=seconds/12*4;if(b.type==='mlyn')food+=seconds/12*6;if(b.type==='pole')food+=seconds/12*2;
  if(b.type==='gospodarstwo')food+=3;if(b.type==='hodowla')food+=4;
 }
 workLedger.clear();state.stone+=stone;state.wood=Math.min(capacity(),state.wood+wood);state.food=Math.min(capacity(),state.food+food*seasonal);
 let trades=Math.min(state.buildings.filter(b=>b.type==='handel').length,Math.floor(state.wood/5));state.wood-=trades*5;state.gold+=trades*3;if(typeof portIncome==='function')portIncome();ui();save();
}
function polygon(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill()}
function tree(x,y,h){ctx.fillStyle='#243f2c55';ctx.beginPath();ctx.ellipse(x+9,y+12,18,8,0,0,7);ctx.fill();ctx.fillStyle='#70563a';ctx.fillRect(x-3,y-13,6,29);polygon([[x-20,y-5],[x,y-44-h],[x+20,y-5]],'#214c39');polygon([[x-17,y-15],[x,y-49-h],[x+17,y-15]],'#2e6547');polygon([[x-12,y-29],[x,y-55-h],[x+12,y-29]],'#43805a')}
function pathSpeed(x,y){return building(Math.floor(x/T),Math.floor(y/T))?.type==='sciezka'?1.4:1}
function drawPath(b,x,y){
 const connects=(dx,dy)=>{const other=building(b.x+dx,b.y+dy);return other&&!['palisada','wawoz'].includes(other.type)};
 const arms=[];if(connects(0,-1))arms.push([0,-24]);if(connects(0,1))arms.push([0,24]);if(connects(-1,0))arms.push([-24,0]);if(connects(1,0))arms.push([24,0]);
 ctx.fillStyle='#b6a47b';ctx.beginPath();ctx.arc(x,y,13,0,Math.PI*2);ctx.fill();
 for(const [dx,dy] of arms){if(dx)ctx.fillRect(x+Math.min(0,dx),y-12,Math.abs(dx),24);else ctx.fillRect(x-12,y+Math.min(0,dy),24,Math.abs(dy))}
 ctx.fillStyle='#d2c097';for(let i=0;i<5;i++){let px=x+(hash(b.x+i,b.y)*18-9),py=y+(hash(b.x,b.y+i)*18-9);ctx.fillRect(px,py,3,2)}
}
function gateVisualOpen(b){
 if(b.type!=='brama_swoi')return b.open;
 const near=u=>Math.hypot(u.x/T-b.x-.5,u.y/T-b.y-.5)<1.8;
 return near(state.p)||(state.kingdom?.fleet||[]).some(near)||(state.kingdom?.king&&near(state.kingdom.king))||(state.kingdom?.caravans||[]).some(c=>near(routePosition(c)))||(state.war?.engines||[]).some(near)||(state.war?.support||[]).some(a=>a.phase==='march'?near(routePosition(a)):a.units.some(near))||residents.some(near)||(state.war?.guards||[]).some(near)||(state.war?.patrols||[]).some(p=>p.units.some(near))||(state.war?.expedition&&near(routePosition(state.war.expedition)));
}
function drawFortification(b,x,y){const visualOpen=gateVisualOpen(b),opening=['brama','brama_swoi'].includes(b.type)?structureOpenAmount(b,'gate',visualOpen):0;
 if(terrain(b.x,b.y)==='water'){ctx.fillStyle='#d0b477';ctx.fillRect(x-22,y-6,5,25);ctx.fillRect(x+17,y-6,5,25);if(['brama','brama_swoi'].includes(b.type)&&opening>.02){ctx.fillStyle='#a88b5a';ctx.fillRect(x-24,y-22,48,44);ctx.strokeStyle='#6b5337';for(let i=-20;i<23;i+=7){ctx.beginPath();ctx.moveTo(x-24,y+i);ctx.lineTo(x+24,y+i);ctx.stroke()}}}

 const l=wallLinks(b),gate=['brama','brama_swoi'].includes(b.type),vertical=gateVertical(b);
 const post=(px,py,strong=false)=>{let w=strong?8:6;ctx.fillStyle='#543d29';ctx.fillRect(px-w/2+2,py-19,w,25);ctx.fillStyle=strong?'#c3a16b':'#b28b53';ctx.fillRect(px-w/2,py-21,w,25);polygon([[px-w/2,py-21],[px,py-27],[px+w/2,py-21]],'#dfbc7c')};
 const beam=(ax,ay,bx,by)=>{ctx.strokeStyle='#654b31';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(ax,ay-7);ctx.lineTo(bx,by-7);ctx.stroke();ctx.lineWidth=1};
 if(gate){
  const v=vertical,ax=x+(v?0:-24),ay=y+(v?-24:0),bx=x+(v?0:24),by=y+(v?24:0);
  // Both leaves swing about their own hinges instead of jumping poses.
  const angle=opening*Math.PI/2,along={x:(v?0:1)*Math.cos(angle)*24,y:(v?1:0)*Math.cos(angle)*24},out={x:(v?1:0)*Math.sin(angle)*24,y:(v?0:-1)*Math.sin(angle)*24};
  const leaf=(hx,hy,sign)=>{const tx=hx+sign*(along.x+out.x),ty=hy+sign*(along.y+out.y);beam(hx,hy,tx,ty);for(const t of [1/3,2/3,1])post(hx+(tx-hx)*t,hy+(ty-hy)*t);ctx.strokeStyle='#d9bf7e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(hx,hy-20);ctx.lineTo(tx,ty+1);ctx.stroke();ctx.lineWidth=1};
  leaf(ax,ay,1);leaf(bx,by,-1);
  post(ax,ay,true);post(bx,by,true);
  ctx.fillStyle=visualOpen?'#c4e4ac':'#f0c17f';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText(Math.abs(opening-(visualOpen?1:0))>.02?(visualOpen?'OTWIERANIE':'ZAMYKANIE'):b.type==='brama_swoi'?'TYLKO SWOI':visualOpen?'OTWARTA':'ZAMKNIĘTA',x,y-37);ctx.textAlign='start';return;
 }
 // One shared junction and exact half-tile arms remove gaps at every corner.
 const points=new Map();const add=(px,py)=>points.set(px+','+py,[px,py]);add(x,y);
 const arms=[];if(l.up)arms.push([0,-24]);if(l.down)arms.push([0,24]);if(l.left)arms.push([-24,0]);if(l.right)arms.push([24,0]);if(!arms.length)arms.push([-24,0],[24,0]);
 for(const [dx,dy] of arms){beam(x,y,x+dx,y+dy);for(let i=8;i<=24;i+=8)add(x+dx*i/24,y+dy*i/24)}
 [...points.values()].sort((a,b)=>a[1]-b[1]).forEach(p=>post(...p));
}
function structure(b,x,y){if(typeof drawMine==='function'&&drawMine(b,x,y))return;if(typeof drawCastle==='function'&&drawCastle(b,x,y))return;if(typeof drawStrategyStructure==='function'&&drawStrategyStructure(b,x,y))return;if(typeof drawMilitaryBuilding==='function'&&drawMilitaryBuilding(b,x,y))return;if(b.type==='kamieniolom'){
 ctx.fillStyle='#9e9b86';ctx.beginPath();ctx.ellipse(x,y-2,24,19,0,0,7);ctx.fill();
 polygon([[x-20,y-3],[x-10,y-19],[x+16,y-14],[x+22,y+6],[x+8,y+16],[x-14,y+12]],'#626d67');
 polygon([[x-12,y],[x-4,y-11],[x+13,y-6],[x+12,y+8],[x-5,y+11]],'#3e4d49');
 for(let i=0;i<4;i++){const px=x-18+i*12,py=y+10+(i%2)*4;polygon([[px-5,py+4],[px-4,py-4],[px+2,py-8],[px+7,py],[px+5,py+5]],i%2?'#d0d0bb':'#a4ad9f')}
 ctx.fillStyle='#886543';ctx.fillRect(x+13,y-35,5,39);ctx.fillRect(x-7,y-37,25,5);ctx.strokeStyle='#cfba8d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-5,y-34);ctx.lineTo(x-5,y-17);ctx.stroke();ctx.lineWidth=1;
 ctx.fillStyle='#d8cbaa';ctx.font='14px serif';ctx.fillText('⛏',x-10,y-38);return}
 if(['palisada','brama','brama_swoi'].includes(b.type)){drawFortification(b,x,y);return}if(b.type==='wawoz'){if(floodedTrenches.has(b.x+','+b.y))return;ctx.fillStyle='#514338';ctx.fillRect(x-23,y-23,46,46);ctx.fillStyle='#292d28';ctx.fillRect(x-14,y-19,28,38);return}if(b.type==='most'||b.type==='most_staly'){drawBridge(b,x,y);return}if(b.type==='pole'){ctx.fillStyle='#80663a';ctx.fillRect(x-22,y-20,44,40);ctx.strokeStyle='#d3bd57';for(let i=-15;i<20;i+=8){ctx.beginPath();ctx.moveTo(x+i,y-16);ctx.lineTo(x+i,y+16);ctx.stroke()}return}ctx.fillStyle='#1c342c55';ctx.beginPath();ctx.ellipse(x+4,y+12,27,10,0,0,7);ctx.fill();ctx.fillStyle=b.type==='start'?'#d7c99d':'#bfa777';ctx.fillRect(x-19,y-22,38,35);ctx.fillStyle='#8c774d';ctx.fillRect(x+9,y-22,10,35);polygon([[x-25,y-22],[x,y-46],[x+25,y-22]],b.type==='start'?'#9d6140':'#765044');polygon([[x,y-43],[x+25,y-22],[x+16,y-22]],'#543c34');ctx.fillStyle='#493e30';ctx.fillRect(x-5,y-4,10,17);ctx.fillStyle='#f2cc7c';ctx.fillRect(x-14,y-15,7,7);if(b.type==='mlyn'){ctx.strokeStyle='#e3d4ab';ctx.lineWidth=4;let a=performance.now()/1200;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x,y-24);ctx.lineTo(x+Math.cos(a+i*Math.PI/2)*32,y-24+Math.sin(a+i*Math.PI/2)*32);ctx.stroke()}ctx.lineWidth=1}if(b.type!=='start'){ctx.font='16px serif';ctx.fillText(defs.find(d=>d[0]===b.type)?.[1]||'',x-9,y-28)}}
function draw(){const width=Math.round(innerWidth*devicePixelRatio),height=Math.round(innerHeight*devicePixelRatio);if(c.width!==width||c.height!==height){c.width=width;c.height=height}ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);ctx.fillStyle='#243e30';ctx.fillRect(0,0,innerWidth,innerHeight);ctx.save();ctx.translate(innerWidth/2,innerHeight*.46);ctx.scale(zoom,zoom);ctx.translate(-state.p.x,-state.p.y);let w=innerWidth/zoom/2+T,h=innerHeight/zoom/2+T;let x0=Math.floor((state.p.x-w)/T),x1=Math.ceil((state.p.x+w)/T),y0=Math.floor((state.p.y-h)/T),y1=Math.ceil((state.p.y+h)/T);let objects=[];for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){let sx=x*T,sy=y*T,t=terrain(x,y),known=seen.has(x+','+y),r=hash(x,y);ctx.fillStyle=!known?'#263c32':t==='water'?'#518d91':t==='sand'?(state.campaign?.stage==='desert'?'#e1c48a':'#aaa779'):t==='ravine'?'#4c463c':(typeof seasonalTerrain==='function'?seasonalTerrain(t,r):null)||(r>.5?'#718957':'#758e5a');ctx.fillRect(sx,sy,T+1,T+1);if(!known)continue;if(t==='water'){ctx.strokeStyle='#92c2b655';ctx.beginPath();ctx.moveTo(sx+7,sy+20+Math.sin(performance.now()/900+y)*3);ctx.lineTo(sx+24,sy+20);ctx.stroke()}else if(t==='grass'&&r>.35){ctx.fillStyle='#b6be7850';ctx.fillRect(sx+12,sy+19,2,4);ctx.fillRect(sx+34,sy+38,2,3)}let n=natural(x,y),b=building(x,y)||(typeof foreignBuilding==='function'?foreignBuilding(x,y):null);if(b?.type==='sciezka'){drawPath(b,sx+24,sy+24);b=null}if(b&&['most','most_staly','pomost'].includes(b.type)){if(b.type==='pomost')structure(b,sx+24,sy+29);else drawBridge(b,sx+24,sy+29);b=null}if(n||b)objects.push({x:sx+24,y:sy+29,n,b,r})}if(typeof drawTerritories==='function')drawTerritories();for(const r of residents)if(seen.has(tileKey(Math.floor(r.x/T),Math.floor(r.y/T))))objects.push({x:r.x,y:r.y,resident:r});if(typeof visibleOrcResidents==='function')for(const r of visibleOrcResidents(x0,y0,x1,y1))objects.push({x:r.x,y:r.y,orcResident:r});objects.push({x:state.p.x,y:state.p.y,player:true});objects.sort((a,b)=>a.y-b.y);for(let o of objects){if(o.orcResident){drawOrcResident(o.orcResident)}else if(o.resident){drawResident(o.resident)}else if(o.player){if(state.playerBoat?.aboard&&typeof drawPersonalBoat==='function'){drawPersonalBoat(o.x,o.y,true);continue}if(state.life?.camelMounted&&typeof drawCamelPlayer==='function'){drawCamelPlayer(o.x,o.y);continue}if(typeof drawPlayerAppearance==='function'&&!state.life?.mounted&&drawPlayerAppearance(o.x,o.y))continue;if(state.life?.mounted&&typeof drawCavalryUnit==='function'){drawCavalryUnit({x:o.x,y:o.y,walkSource:state.p,player:true});continue}ctx.fillStyle='#1d302b55';ctx.beginPath();ctx.ellipse(o.x,o.y+9,11,5,0,0,7);ctx.fill();ctx.fillStyle='#493e31';if(typeof drawWalkingLegs==='function')drawWalkingLegs(o.x,o.y,state.p,'#493e31',5,10);else{ctx.fillRect(o.x-7,o.y,5,10);ctx.fillRect(o.x+2,o.y,5,10)}ctx.fillStyle='#c7a05f';ctx.fillRect(o.x-9,o.y-15,18,17);ctx.fillStyle='#f2d3a1';ctx.beginPath();ctx.arc(o.x,o.y-21,7,0,7);ctx.fill();ctx.fillStyle='#55472f';ctx.fillRect(o.x-8,o.y-29,16,5);ctx.strokeStyle='#b7b3a0';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(o.x+10,o.y-7);ctx.lineTo(o.x+19+(axetime?Math.sin(axetime*16)*8:0),o.y-22);ctx.stroke();ctx.lineWidth=1}else if(o.b)structure(o.b,o.x,o.y);else if(o.n==='tree')tree(o.x,o.y,o.r*9);else{polygon([[o.x-16,o.y+7],[o.x-19,o.y-4],[o.x-4,o.y-18],[o.x+13,o.y-9],[o.x+18,o.y+6]],'#8f9585');polygon([[o.x-19,o.y-4],[o.x-4,o.y-18],[o.x+7,o.y-7]],'#bec2ae')}}if(state.settled){let x=state.settled.x*T+24,y=state.settled.y*T;ctx.fillStyle='#efe2b3';ctx.fillRect(x,y-75,3,53);polygon([[x+3,y-75],[x+35,y-70],[x+3,y-54]],state.appearance?.bannerColor&&typeof BANNER_COLORS!=='undefined'?BANNER_COLORS[state.appearance.bannerColor]?.[1]||'#d6b55e':'#d6b55e');if(typeof BANNER_EMBLEMS!=='undefined'){ctx.fillStyle='#fff2ce';ctx.font='12px serif';ctx.fillText(BANNER_EMBLEMS[state.appearance?.bannerEmblem]||'★',x+9,y-61)}}if(mode){let x=Math.floor(mouse.x/T)*T,y=Math.floor(mouse.y/T)*T;ctx.fillStyle='#f0dc9540';ctx.fillRect(x,y,T,T);ctx.strokeStyle='#f4df9a';ctx.strokeRect(x,y,T,T);if(mode==='most'||mode==='most_staly'){ctx.globalAlpha=.7;drawBridge({x:x/T,y:y/T,axis:bridgeDirection,type:mode},x+24,y+29);ctx.globalAlpha=1}}if(typeof drawWarWorld==='function')drawWarWorld();ctx.restore();minimap()}
const miniTerrain=document.createElement('canvas');miniTerrain.width=170;miniTerrain.height=145;
const miniTerrainContext=miniTerrain.getContext('2d');
let miniSeen=null,miniIterator=null,miniWaterRevision=-1,miniSeenCount=0,miniFullMap=false;
function updateMiniTerrain(){
 if(miniFullMap!==!!state.fullMap||miniSeen!==seen||miniWaterRevision!==waterRevision||mapVisionSize()<miniSeenCount){
  miniFullMap=!!state.fullMap;miniSeen=seen;miniIterator=mapVisionTiles();miniSeenCount=0;miniWaterRevision=waterRevision;
  miniTerrainContext.fillStyle='#142b25';miniTerrainContext.fillRect(0,0,170,145);
 }
 // Do not exhaust the Set iterator: later additions remain visible through it.
 // Restore large saves in bounded batches, then paint only newly explored tiles.
 for(let i=0;i<2000&&miniSeenCount<mapVisionSize();i++){
  const item=miniIterator.next();if(item.done)break;miniSeenCount++;
  const key=item.value,comma=key.indexOf(','),x=Number(key.slice(0,comma)),y=Number(key.slice(comma+1));if(x%2||y%2)continue;
  miniTerrainContext.fillStyle=terrain(x,y)==='water'?'#79b6ba':state.campaign?.stage==='desert'?'#cfab69':'#7c9560';miniTerrainContext.fillRect(x/N*170,y/N*145,2,2);
 }
}
function minimap(){
 updateMiniTerrain();
 mc.drawImage(miniTerrain,0,0);mc.fillStyle='#f7db8c';mc.beginPath();mc.arc(state.p.x/T/N*170,state.p.y/T/N*145,3,0,7);mc.fill();mc.strokeStyle='#dfdfb066';mc.strokeRect(0,0,170,145);if(typeof drawWarMinimap==='function')drawWarMinimap();if(typeof drawTerritoryMini==='function')drawTerritoryMini()
}
function simulationStep(dt){axetime=Math.max(0,axetime-dt);let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);if(dx||dy)target=null;else if(target){let d=Math.hypot(target.x-state.p.x,target.y-state.p.y);if(d>5){dx=(target.x-state.p.x)/d;dy=(target.y-state.p.y)/d}else target=null}let len=Math.hypot(dx,dy)||1,speed=(keys.shift?235:155)*(typeof playerTravelMultiplier==='function'?playerTravelMultiplier():(state.buildings.some(b=>b.type==='stajnia')?1.5:1))*pathSpeed(state.p.x,state.p.y)*dt;let nx=state.p.x+dx/len*speed,ny=state.p.y+dy/len*speed;if(!(typeof playerMovementBlocked==='function'?playerMovementBlocked(nx,state.p.y):blocked(nx,state.p.y)))state.p.x=nx;else target=null;if(!(typeof playerMovementBlocked==='function'?playerMovementBlocked(state.p.x,ny):blocked(state.p.x,ny)))state.p.y=ny;else target=null;updateResidents(dt);if(typeof updateFrontier==='function')updateFrontier(dt);if(typeof updateWar==='function')updateWar(dt);tick+=dt;state.time+=dt;while(tick>=12){tick-=12;production()}}
function advanceSimulation(realDt){if(!$('overlay').classList.contains('hidden')||(state.clock?.paused))return 0;const dt=Math.max(0,Math.min(Number(realDt)||0,.05)),speed=[1,2,3].includes(state.clock?.speed)?state.clock.speed:1;const held=keys;if(typeof atlasIsOpen==='function'&&atlasIsOpen())keys={};simulationActive=true;try{for(let i=0;i<speed&&dt>0;i++)simulationStep(dt)}finally{simulationActive=false;keys=held;}return dt*speed}
function loop(now){const dt=(now-last)/1000;last=now;advanceSimulation(dt);if(simulationSavePending&&now-lastSimulationSave>=1000)save();reveal();draw();if(typeof renderAtlas==='function')renderAtlas();requestAnimationFrame(loop)}
setInterval(()=>ui(),700);setInterval(save,15000);window.addEventListener('beforeunload',save);refreshWater();rescuePlayer();syncResidents();reveal();ui();if(!localStorage.getItem(KEY))$('overlay').classList.remove('hidden');
let gameLoopStarted=false;
function startGameLoop(){if(gameLoopStarted)return;gameLoopStarted=true;last=performance.now();requestAnimationFrame(loop)}
// Parser-blocking scripts below game.js may still be downloading. Saved caravans,
// expeditions and gates need their functions before the first world frame.
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',startGameLoop,{once:true});else startGameLoop();
