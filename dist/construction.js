'use strict';
const constructionDefs=[
 ['wieza_kamienna','♜','Kamienna wieża strażnicza',30,60,'300 PŻ · ostrzał na 8 pól · mocniejsze strzały. Odsłania okolicę.'],
 ['mur_kamienny','▦','Kamienny mur',0,15,'180 PŻ — trzy razy mocniejszy od palisady.'],
 ['brama_kamienna','▥','Kamienna brama',10,25,'240 PŻ. Otwieraj kliknięciem lub klawiszem F.'],
 ['studnia','◉','Studnia',20,15,'Nawadnia pola do 5 pól: +50% plonów.'],
 ['koszary','⚔','Koszary',60,30,'6 miejsc wojska, szkolenie szybsze o 25% i odpoczynek żołnierzy.'],
 ['zagroda_wielbladow','🐪','Zagroda wielbłądów',45,15,'Na pustyni hoduje wielbłąda co 60 s za 10 żywności. Zapas: 3 na zagrodę.'],
 ['zbrojownia','🛡','Zbrojownia',50,40,'Pancerze zmniejszają obrażenia własnego wojska o 20%. Bonus się nie sumuje.'],
 ['ognisko','♨','Ognisko',8,2,'Ozdoba z płomieniem.'],['lawka','▰','Ławka',6,0,'Drewniana ławka do ozdobienia osady.'],
 ['drogowskaz','➜','Drogowskaz',5,0,'Ozdobny drogowskaz przy ścieżkach.'],['choragiew','⚑','Chorągiew',8,0,'Ozdoba w kolorze twojego sztandaru.']
];
for(const d of constructionDefs){defs.push(d);const b=document.createElement('button');b.dataset.type=d[0];b.title=d[5];b.innerHTML='<b>'+d[1]+'</b>'+d[2]+'<small>'+d[3]+' 🪵 '+d[4]+' ◆</small>';b.onclick=()=>{setMode(d[0]);say(d[5])};$('buildings').append(b)}
function constructionState(){state.construction??={camels:0,camelClock:0};return state.construction}
const constructionBuild=build;build=function(x,y){const chosen=mode;if(chosen==='zagroda_wielbladow'&&!isDesertCampaign()){say('Zagrodę wielbłądów buduj na pustyni w etapie II.');return}const old=building(x,y);constructionBuild(x,y);const b=building(x,y);if(b&&b!==old&&['mur_kamienny','brama_kamienna','wieza_kamienna'].includes(b.type)){b.material='stone';b.type=({mur_kamienny:'palisada',brama_kamienna:'brama',wieza_kamienna:'wieza'})[b.type];b.open=true;b.hp=buildingMaxHp(b);save()}};
const constructionHp=buildingMaxHp;buildingMaxHp=function(b){return b.material==='stone'?((b.type==='wieza'||b.originalType==='wieza')?300:(b.type==='brama'||b.originalType==='brama')?240:180):constructionHp(b)};
const constructionDemolish=demolish;demolish=function(x,y){const b=building(x,y),original=b?.type;if(b?.material==='stone'&&b.type!=='ruiny')b.type=b.type==='wieza'?'wieza_kamienna':b.type==='brama'?'brama_kamienna':'mur_kamienny';constructionDemolish(x,y);if(b&&state.buildings.includes(b))b.type=original};
const constructionCapacity=armyCapacity;armyCapacity=function(){return constructionCapacity()+ownCount('koszary')*6};
const constructionRecruit=recruitSoldier;recruitSoldier=function(kind){const n=state.war.queue.length,result=constructionRecruit(kind);if(result&&ownCount('koszary')&&state.war.queue.length>n){state.war.queue.at(-1).remaining*=.75;save()}return result};
const constructionArmor=armorDamage;armorDamage=function(amount,u){return constructionArmor(amount,u)*(ownCount('zbrojownia')?.8:1)};
const constructionHeal=healDefender;healDefender=function(u,dt){constructionHeal(u,dt);if(u.hp>0&&u.hp<8&&!u.fighting&&u.restTime>6&&state.buildings.some(b=>b.type==='koszary'&&Math.hypot(b.x+.5-u.x/T,b.y+.5-u.y/T)<=4)){u.hp=Math.min(8,u.hp+dt*.5);u.healing=true}};
const constructionWork=buildingWorkFactor;buildingWorkFactor=function(b){return constructionWork(b)*(b.type==='pole'&&state.buildings.some(w=>w.type==='studnia'&&Math.hypot(w.x-b.x,w.y-b.y)<=5)?1.5:1)};
function claimYardCamel(){const s=constructionState();if(!isDesertCampaign()||lifeState().camel||s.camels<1)return false;if(!state.buildings.some(b=>b.type==='zagroda_wielbladow'&&Math.hypot(b.x+.5-state.p.x/T,b.y+.5-state.p.y/T)<=5)){say('Podejdź do zagrody na 5 pól.');return false}s.camels--;lifeState().camel=true;save();say('Wielbłąd gotowy do jazdy! Wsiądź przez Dodatki → Wygląd.');renderConstruction();return true}
const constructionStep=simulationStep;simulationStep=function(dt){constructionStep(dt);const s=constructionState(),yards=ownCount('zagroda_wielbladow');if(isDesertCampaign()&&yards){s.camels=Math.min(s.camels,yards*3);if(s.camels<yards*3){s.camelClock+=dt;if(s.camelClock>=60&&state.food>=10){s.camelClock-=60;s.camels++;state.food-=10;save()}}}else s.camelClock=0};
const constructionAdvance=advanceCampaign;advanceCampaign=function(c,dt,speed,...args){return constructionAdvance(c,dt,speed*(c.camel&&ownCount('zagroda_wielbladow')?1.25:1),...args)};
const constructionArt=structure;structure=function(b,x,y){
 if(b.material==='stone'&&b.type!=='ruiny'){
 if(b.type==='wieza'){artRect(x-24,y-55,48,70,'#a5ad99');artRect(x+13,y-55,11,70,'#697b6b');for(let yy=-49;yy<14;yy+=10){artLine([[x-21, y+yy],[x+11,y+yy]],'#6e7d6c',1);for(let xx=-13+(yy%20?0:8);xx<11;xx+=16)artLine([[x+xx,y+yy],[x+xx,y+yy+10]],'#6e7d6c',1)}artRect(x-6,y-9,12,24,'#35473f');artRect(x-3,y-39,6,13,'#364d43');artRect(x-26,y-60,52,9,'#bac2a9');for(let xx=-25;xx<26;xx+=12){artRect(x+xx,y-71,8,13,'#b4bda4');artRect(x+xx,y-73,8,3,'#d9ddc3')}artRect(x-15,y-60,30,5,'#657b68');ctx.fillStyle='#e7d2a4';ctx.beginPath();ctx.arc(x,y-65,5,0,7);ctx.fill();artRect(x-5,y-61,10,7,'#688997');artLine([[x+8,y-67],[x+12,y-61],[x+8,y-55]],'#c6aa70',2);return}
 const gate=b.type==='brama',vertical=gateVertical(b),l=wallLinks(b);
 if(!gate){
  // Every connected side reaches the tile edge, including both arms of a corner.
  const pieces=[[-8,-8,16,16],...(l.left?[[-24,-8,16,16]]:[]),...(l.right?[[8,-8,16,16]]:[]),...(l.up?[[-8,-24,16,16]]:[]),...(l.down?[[-8,8,16,16]]:[])];
  const solid=(px,py)=>pieces.some(([a,b,w,h])=>px>=a&&px<a+w&&py>=b&&py<b+h);
  ctx.save();ctx.translate(x,y);
  for(const [a,b,w,h]of pieces)artRect(a+4,b+5,w,h,'#263a3040');
  // Exposed southern edges become tall masonry faces; internal edges stay joined.
  for(let edge=-24;edge<=24;edge+=8){let begin=null;for(let xx=-24;xx<=24;xx+=8){const exposed=xx<24&&solid(xx+4,edge-4)&&!solid(xx+4,edge+4);if(exposed&&begin===null)begin=xx;if(!exposed&&begin!==null){artRect(begin,edge-40,xx-begin,40,'#858e7e');for(let row=0;row<5;row++){const yy=edge-40+row*8;artLine([[begin,yy],[xx,yy]],'#465a50',1);for(let joint=begin+(row%2?8:16);joint<xx;joint+=16)artLine([[joint,yy],[joint,yy+8]],'#465a50',1)}artRect(begin,edge-2,xx-begin,2,'#53675a');begin=null;}}}
  for(let edge=-24;edge<=24;edge+=8)for(let yy=-24;yy<24;yy+=8)if(solid(edge-4,yy+4)&&!solid(edge+4,yy+4)){polygon([[edge,yy-40],[edge+7,yy-33],[edge+7,yy+15],[edge,yy+8]],'#627568');artLine([[edge+1,yy-29],[edge+7,yy-23]],'#465b50',1)}
  ctx.save();ctx.translate(0,-40);ctx.beginPath();for(const p of pieces)ctx.rect(...p);ctx.clip();artRect(-24,-24,48,48,'#bec3ad');
  for(let row=-24;row<24;row+=16){artLine([[-24,row],[24,row]],'#939f8c',1);for(let col=-24+(row%32?8:0);col<24;col+=16)artLine([[col,row],[col,row+16]],'#939f8c',1)}
  ctx.restore();
  // Crenellations sit on the outer rim, above the walkway.
  for(let edge=-24;edge<=24;edge+=8)for(let xx=-24;xx<24;xx+=16)if(solid(xx+4,edge+4)&&!solid(xx+4,edge-4)){artRect(xx,edge-49,8,9,'#b7bea7');artRect(xx+1,edge-51,8,3,'#d3d7bd');artRect(xx+6,edge-48,3,8,'#8c9b87');}
  ctx.restore();return;
 }
 const point=(a,d,h=0)=>vertical?[x+d,y+a-h]:[x+a,y+d-h];
 const stoneBox=(a,d,w,depth,base,height)=>{const A=point(a,d,base),B=point(a+w,d,base),C=point(a+w,d+depth,base),D=point(a,d+depth,base),At=point(a,d,base+height),Bt=point(a+w,d,base+height),Ct=point(a+w,d+depth,base+height),Dt=point(a,d+depth,base+height);polygon([B,C,Ct,Bt],'#6b7d6c');polygon([C,D,Dt,Ct],'#99a58f');polygon([At,Bt,Ct,Dt],'#c7cdb3')};
 polygon([point(-16,-24),point(16,-24),point(16,24),point(-16,24)],'#bcae8144');
 const post=a=>{stoneBox(a,-8,10,16,0,64);for(let h=8;h<64;h+=10)artLine([point(a,8,h),point(a+10,8,h)],'#657a68',1);stoneBox(a-1,-9,12,18,64,4)};
 post(-25);
 // The grille occupies the full entrance, or rises beneath the stone lintel.
 const opening=structureOpenAmount(b,'gate',b.open),low=32*opening,high=52;
 for(let a=-14;a<=14;a+=7)artLine([point(a,0,low),point(a,0,high)],'#384a42',2);
 for(let h=0;h<=52;h+=10){const raised=h+low;if(raised>high)continue;artLine([point(-15,0,raised),point(15,0,raised)],'#53665a',3)};
 if(opening>.95)artLine([point(-9,10),point(0,1),point(9,10)],'#e5dab5',2);
 post(15);stoneBox(-25,-8,50,16,52,12);
 for(let a=-24;a<25;a+=12)stoneBox(a,-8,8,16,64,8);
 ctx.font='8px system-ui';ctx.textAlign='center';ctx.fillStyle=b.open?'#dbedb4':'#efd0a2';ctx.fillText(Math.abs(opening-(b.open?1:0))>.02?(b.open?'OTWIERANIE':'ZAMYKANIE'):b.open?'OTWARTA':'ZAMKNIĘTA',x,y-(vertical?94:80));ctx.textAlign='start';return;
 }
 if(!constructionDefs.some(d=>d[0]===b.type))return constructionArt(b,x,y);
 if(b.type==='studnia'){ctx.fillStyle='#426f7d';ctx.beginPath();ctx.ellipse(x,y+1,17,9,0,0,7);ctx.fill();artLine([[x-20,y+2],[x-12,y+12],[x+12,y+12],[x+20,y+2]],'#a8ac99',8);for(const dx of [-17,17])artRect(x+dx,-28+y,4,33,'#806340');artRect(x-21,y-29,46,4,'#a38b58');artLine([[x,y-27],[x,y-1]],'#d1c295',2);return}
 if(b.type==='ognisko'){for(const d of [-1,1])artLine([[x-14,y+d*5],[x+14,y-d*5]],'#785238',5);polygon([[x-8,y],[x-3,y-19-Math.sin(state.time*7)*3],[x+1,y-9],[x+6,y-23],[x+10,y]],'#e69a42');polygon([[x-4,y],[x,y-14],[x+5,y]],'#f5d575');return}
 if(b.type==='lawka'){artRect(x-21,y-6,42,7,'#b49156');artRect(x-20,y-18,40,7,'#947046');for(const dx of [-15,12])artRect(x+dx,y,4,11,'#624c32');return}
 if(['drogowskaz','choragiew'].includes(b.type)){artRect(x-2,y-40,4,53,'#83613c');if(b.type==='choragiew')polygon([[x+2,y-40],[x+28,y-34],[x+2,y-19]],BANNER_COLORS[appearance().bannerColor][1]);else{polygon([[x-19,y-38],[x+17,y-38],[x+25,y-31],[x+17,y-24],[x-19,y-24]],'#b99b60');artRect(x-16,y-17,34,10,'#94774b')}return}
 if(b.type==='zagroda_wielbladow'){for(const yy of [-18,15]){artRect(x-24,y+yy,48,3,'#aa8b51');for(let xx=-23;xx<25;xx+=12)artRect(x+xx,y+yy-6,3,14,'#765935')}artRect(x-13,y-5,24,11,'#bd945d');for(const dx of [-10,7])artRect(x+dx,y+5,3,10,'#8e6d40');artLine([[x+10,y],[x+14,y-19],[x+22,y-19]],'#c5a06a',6);return}
 artRect(x-22,y-23,44,39,'#aaa48d');artRect(x+13,y-23,9,39,'#737a6a');artRect(x-6,y-7,12,23,'#37483e');polygon([[x-29,y-23],[x,y-48],[x+29,y-23]],b.type==='koszary'?'#6b7884':'#6c685a');if(b.type==='koszary'){artLine([[x-13,y-13],[x+13,y-34]],'#d8d4b4',3);artLine([[x+13,y-13],[x-13,y-34]],'#d8d4b4',3)}else polygon([[x-10,y-31],[x+10,y-31],[x+10,y-20],[x,y-11],[x-10,y-20]],'#9bb2b3');
};
const constructionPanel=document.createElement('aside');constructionPanel.id='constructionPanel';constructionPanel.className='war-panel hidden';constructionPanel.innerHTML='<div class="war-title"><h2>Menu budowy</h2><button id="constructionClose">✕</button></div><div id="constructionContent"></div>';document.body.append(constructionPanel);
function constructionMenuDefs(){return [['sciezka_kamienna','▧','Kamienna ścieżka',0,3,'Kamienna nawierzchnia · ruch szybszy o 80%. Możesz ulepszyć istniejącą ścieżkę.'],['most_kamienny','🌉','Most kamienny',10,30,'Stały most o wytrzymałości 240 PŻ.'],...defs.filter(d=>['latarnia','pochodnia'].includes(d[0])),...defs.filter(d=>!['latarnia','pochodnia'].includes(d[0]))] }
function chooseConstruction(type){if(type==='most_kamienny')chooseStoneBridge();else if(type==='sciezka_kamienna'){chooseStoneRoad();$('mode').textContent='Kamienna ścieżka · 3 kamienia / pole'}else setMode(type);document.querySelectorAll('#buildings [data-type]').forEach(button=>button.classList.toggle('active',button.dataset.type===type));constructionPanel.classList.add('hidden');$('islandLifePanel').classList.add('hidden');say(constructionMenuDefs().find(d=>d[0]===type)?.[5]||'Wybierz miejsce budowy.')}
function renderConstruction(){const s=constructionState();$('constructionContent').innerHTML=constructionMenuDefs().map(d=>'<section class="town-card"><b>'+d[1]+' '+d[2]+'</b><p>'+d[5]+'</p><button data-construction="'+d[0]+'">Buduj · '+d[3]+' drewna, '+d[4]+' kamienia</button></section>').join('')+'<h3>Zagrody</h3><p>Wielbłądy gotowe: '+s.camels+'. Do następnego: '+Math.max(0,Math.ceil(60-s.camelClock))+' s. Zagroda przyspiesza karawany wielbłądów o 25%.</p><button id="claimYardCamel">Odbierz wielbłąda do jazdy</button>';for(const b of $('constructionContent').querySelectorAll('[data-construction]'))b.onclick=()=>{chooseConstruction(b.dataset.construction)};$('claimYardCamel').onclick=claimYardCamel;$('claimYardCamel').disabled=!isDesertCampaign()||s.camels<1||!!lifeState().camel}
const constructionOpen=document.createElement('button');constructionOpen.textContent='▦ Menu budowy';constructionOpen.onclick=()=>{renderConstruction();constructionPanel.classList.remove('hidden')};$('clockControls').append(constructionOpen);$('constructionClose').onclick=()=>constructionPanel.classList.add('hidden');
// Keep the complete catalogue on the main build bar, including special bridge mode.
$('buildings').innerHTML='';
for(const d of constructionMenuDefs()){const button=document.createElement('button');button.dataset.type=d[0];button.title=d[5];button.innerHTML='<b>'+d[1]+'</b>'+d[2]+'<small>'+d[3]+' 🪵 '+d[4]+' ◆</small>';button.onclick=()=>chooseConstruction(d[0]);$('buildings').append(button)}
$('buildings').setAttribute('aria-label','Wszystkie budowle — przewijaj w dół');
