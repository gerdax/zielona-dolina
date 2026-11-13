'use strict';
function villageDefense(){state.war.defense??={autoRetreat:true};return state.war.defense}
let defenseDraft=false,defenseUiClock=0,shownRepairQuote=null;
const hospitalRetryCache=new WeakMap();
function groundDefender(u){return state.war.guards.includes(u)||state.war.patrols.some(p=>p.units.includes(u))}
function withinDefensePost(u,p){return !u.defensePost||u.order||Math.hypot(p.x/T-u.defensePost.x-.5,p.y/T-u.defensePost.y-.5)<=4}
function resetDefenseRoute(u){u.path=[];u.blocked=false;u.orderRetry=0;delete u.routeGoal;cancelUnitRoute(u);defenderRouteCache.delete(u)}
function beginDefensePoint(){
 if(!selectedActors().some(u=>u.hp>0&&!ENGINE_TYPES[u.kind]))selectArmy();
 if(!selectedActors().some(u=>u.hp>0&&!ENGINE_TYPES[u.kind])){say('Najpierw zwerbuj lub zaznacz żołnierzy.');return false}
 cancelPatrolDraft();cancelNavalOrder();cancelSelectionDrag();setMode(null);commandDraft=null;defenseDraft=true;defensePanel.classList.add('hidden');showCommandBar();say('Punkt obrony: kliknij odkryte pole. Esc anuluje.');return true;
}
function chooseDefensePoint(x,y){
 if(!defenseDraft)return false;
 const prior=selectedUnits,units=selectedActors().filter(u=>u.hp>0&&!ENGINE_TYPES[u.kind]).slice(0,10);selectedUnits=new Set(units.map(u=>u.uid));
 commandDraft='move';const ok=issueMapCommand(x,y);
 if(!ok){selectedUnits=prior;commandDraft=null;showCommandBar();return false}
 for(const u of units)if(u.order){u.defensePost={x:u.order.x,y:u.order.y};u.home={...u.defensePost}}
 defenseDraft=false;save();showCommandBar();say('Punkt obrony ustawiony dla '+units.filter(u=>u.defensePost).length+' żołnierzy. Bronią okolicy do 4 pól.');return true;
}
const defensePointer=c.onpointerdown;c.onpointerdown=e=>{if(defenseDraft&&(!e.button||e.button===0)){const p=worldPoint(e);chooseDefensePoint(Math.floor(p.x/T),Math.floor(p.y/T));return}defensePointer(e)};
const defenseArm=armCommand;armCommand=function(kind){defenseDraft=false;return defenseArm(kind)};
const defenseMode=setMode;setMode=function(type){defenseDraft=false;return defenseMode(type)};
const defenseIssue=issueMapCommand;issueMapCommand=function(x,y){const units=selectedActors().slice(),prior=units.map(u=>u.order),ok=defenseIssue(x,y);let changed=false;if(ok)for(let i=0;i<units.length;i++)if(units[i].order&&units[i].order!==prior[i]){changed||=!!(units[i].defensePost||units[i].hospitalRetreat);delete units[i].defensePost;delete units[i].hospitalRetreat}if(changed)save();return ok};
const defenseStop=clearCommands;clearCommands=function(){for(const u of selectedActors()){delete u.defensePost;delete u.hospitalRetreat}defenseDraft=false;defenseStop()};
const defenseCancel=cancelCommand;cancelCommand=function(){defenseDraft=false;defenseCancel()};$('commandCancel').onclick=()=>cancelCommand();
const defenseBar=showCommandBar;showCommandBar=function(){defenseBar();if(defenseDraft){$('commandBar').style.display='flex';$('commandStatus').textContent='Punkt obrony: wskaż miejsce · Esc anuluje'}};
window.addEventListener('keydown',e=>{if(e.key==='Escape'){defenseDraft=false;showCommandBar()}});
function hospitalDestination(u){
 let best=null;for(const h of state.buildings){if(h.type!=='szpital')continue;for(const [dx,dy] of [[0,1],[-1,0],[1,0],[0,-1]]){const x=h.x+dx,y=h.y+dy;if(!unitWalkable(u,x,y)||foreignBuilding(x,y))continue;const d=Math.hypot((x+.5)*T-u.x,(y+.5)*T-u.y);if(!best||d<best.distance)best={hospital:{x:h.x,y:h.y},goal:{x,y},distance:d}}}return best;
}
function processHospitalRetreat(u,dt){
 if((u.hp??8)>3&&!u.hospitalRetreat)return false;
 if(!groundDefender(u)||u.hp<=0||ENGINE_TYPES[u.kind])return false;
 if(!villageDefense().autoRetreat){if(u.hospitalRetreat){delete u.hospitalRetreat;resetDefenseRoute(u)}return false}
 let r=u.hospitalRetreat;
 if(!r&&u.hp<=3){const retry=hospitalRetryCache.get(u);if(retry&&retry.source===state.buildings&&retry.count===state.buildings.length){retry.remaining-=dt;if(retry.remaining>0)return false}const dest=hospitalDestination(u);if(!dest){hospitalRetryCache.set(u,{source:state.buildings,count:state.buildings.length,remaining:2});return false}hospitalRetryCache.delete(u);r=u.hospitalRetreat={hospital:dest.hospital,goal:dest.goal};delete u.order;resetDefenseRoute(u);save()}
 if(!r)return false;
 if(building(r.hospital.x,r.hospital.y)?.type!=='szpital'){
  const dest=hospitalDestination(u);if(!dest){delete u.hospitalRetreat;resetDefenseRoute(u);return false}r.hospital=dest.hospital;r.goal=dest.goal;resetDefenseRoute(u);
 }
 u.fighting=false;healDefender(u,dt);
 if(u.hp>=8){delete u.hospitalRetreat;resetDefenseRoute(u);save();return false}
 stepOrder(u,r.goal,dt);return true;
}
const defenseOrder=handleUnitOrder;handleUnitOrder=function(u,dt){if(processHospitalRetreat(u,dt))return true;return defenseOrder(u,dt)};
const defenseFight=defendActor;defendActor=function(u,dt){
 if(processHospitalRetreat(u,dt))return true;
 if(u.defensePost&&!u.order&&Math.hypot(u.x/T-u.defensePost.x-.5,u.y/T-u.defensePost.y-.5)>4){u.fighting=false;healDefender(u,dt);stepOrder(u,u.defensePost,dt);return true}
 return defenseFight(u,dt);
};
function incomingVillageRaid(){
 const origin=state.settled||{x:state.p.x/T-.5,y:state.p.y/T-.5};let best=null;
 for(const r of state.war.raids){if(r.camp||r.power<=0)continue;const p=routePosition(r),dx=p.x/T-origin.x-.5,dy=p.y/T-origin.y-.5,d=Math.hypot(dx,dy);if(!best||d<best.distance){const angle=Math.atan2(dy,dx),sector=(Math.round(angle/(Math.PI/4))+8)%8;best={raid:r,p,distance:d,angle,arrow:['→','↘','↓','↙','←','↖','↑','↗'][sector],direction:['wschód','południowy wschód','południe','południowy zachód','zachód','północny zachód','północ','północny wschód'][sector]}}}return best;
}
function fortificationType(b){return b.type==='ruiny'?b.originalType:b.type}
function fortificationRepairQuote(){
 const q={items:[],wood:0,stone:0,distant:0,danger:0};
 for(const b of state.buildings){if(!['palisada','brama','brama_swoi','wieza'].includes(fortificationType(b))||b.type!=='ruiny'&&(b.hp??buildingMaxHp(b))>=buildingMaxHp(b))continue;
  if(Math.hypot(b.x+.5-state.p.x/T,b.y+.5-state.p.y/T)>8){q.distant++;continue}
  if(state.war.raids.some(r=>r.power>0&&Math.hypot(routePosition(r).x/T-b.x,routePosition(r).y/T-b.y)<5)){q.danger++;continue}
  const cost=repairCost(b);q.items.push({b,cost});q.wood+=cost.wood;q.stone+=cost.stone;
 }
 q.signature=JSON.stringify(q.items.map(({b,cost})=>[b.x,b.y,b.type,b.hp,b.originalType,b.material,cost.wood,cost.stone]));return q;
}
function repairVillageFortifications(expected){
 const q=fortificationRepairQuote();
 if(expected!==q.signature){renderVillageDefense(true);say('Zakres lub koszt naprawy się zmienił. Sprawdź nową wycenę.');return false}
 if(!q.items.length){say('Brak dostępnych uszkodzonych umocnień. Podejdź bliżej lub odeprzyj wroga.');return false}
 if(state.wood<q.wood||state.stone<q.stone){say('Brakuje surowców: potrzeba '+q.wood+' drewna i '+q.stone+' kamienia.');return false}
 state.wood-=q.wood;state.stone-=q.stone;
 for(const {b} of q.items){if(b.type==='ruiny'){b.type=b.originalType;delete b.originalType;if(['brama','brama_swoi'].includes(b.type))b.open=false}b.hp=buildingMaxHp(b)}
 buildingIndexSource=null;refreshWater();save();ui();renderVillageDefense(true);say('Naprawiono umocnienia: '+q.items.length+' · koszt '+q.wood+' drewna i '+q.stone+' kamienia.');return true;
}
const defensePanel=document.createElement('aside');defensePanel.id='villageDefensePanel';defensePanel.className='war-panel hidden';defensePanel.innerHTML='<div class="war-title"><h2>Obrona osady</h2><button id="defenseClose" aria-label="Zamknij obronę osady">✕</button></div><h3>Punkt obrony</h3><p>Zaznacz do 10 żołnierzy i wskaż odkryte pole. Zajmą stanowiska i będą bronić okolicy do 4 pól. Nowy rozkaz Idź, Atakuj lub Zatrzymaj zwalnia stanowisko.</p><button id="defensePoint">⚑ Wskaż punkt obrony</button><h3>Odwrót rannych</h3><p>Przy 3/8 zdrowia żołnierze garnizonu i patroli wycofują się do najbliższego szpitala. Wracają do obrony po odzyskaniu 8/8. Medyk przyspiesza leczenie; bez niego działa zwykła regeneracja po 6 s bez walki.</p><button id="retreatToggle"></button><p id="retreatSummary"></p><h3>Naprawa po bitwie</h3><p>Naprawia palisady, mury, bramy, wieże i ich ruiny do 8 pól od ludka. Pomija umocnienia, przy których wróg jest bliżej niż 5 pól. Koszt jest taki jak przy pojedynczej naprawie.</p><p id="defenseRepairSummary"></p><button id="defenseRepairAll"></button>';
 document.body.append(defensePanel);
const defenseOpen=document.createElement('button');defenseOpen.id='villageDefenseOpen';defenseOpen.textContent='🛡 Obrona osady';defenseOpen.onclick=()=>{defensePanel.classList.remove('hidden');renderVillageDefense(true)};$('clockControls').append(defenseOpen);
$('defenseClose').onclick=()=>defensePanel.classList.add('hidden');$('defensePoint').onclick=beginDefensePoint;
$('retreatToggle').onclick=()=>{villageDefense().autoRetreat=!villageDefense().autoRetreat;save();renderVillageDefense(true)};
$('defenseRepairAll').onclick=()=>repairVillageFortifications(shownRepairQuote?.signature);
const villageRaidAlert=document.createElement('div');villageRaidAlert.id='villageRaidDirection';villageRaidAlert.setAttribute('role','status');villageRaidAlert.style.display='none';document.body.append(villageRaidAlert);
function renderVillageDefense(force=false){
 if(!force&&defensePanel.classList.contains('hidden'))return;
 const options=villageDefense(),q=fortificationRepairQuote();shownRepairQuote=q;
 $('retreatToggle').textContent='Automatyczny odwrót: '+(options.autoRetreat?'WŁĄCZONY':'WYŁĄCZONY');$('retreatToggle').setAttribute('aria-pressed',String(options.autoRetreat));
 const hospitals=state.buildings.filter(b=>b.type==='szpital').length,withdrawing=state.war.guards.concat(state.war.patrols.flatMap(p=>p.units)).filter(u=>u.hospitalRetreat).length;
 $('retreatSummary').textContent='Szpitale: '+hospitals+' · Wycofuje się lub leczy: '+withdrawing+(hospitals?'':' · Zbuduj szpital, aby umożliwić odwrót.');
 $('defenseRepairSummary').textContent='Do naprawy: '+q.items.length+' · Za daleko: '+q.distant+' · Wróg w pobliżu: '+q.danger;
 $('defenseRepairAll').textContent='Napraw umocnienia ('+q.items.length+') · '+q.wood+' drewna · '+q.stone+' kamienia';$('defenseRepairAll').disabled=!q.items.length||state.wood<q.wood||state.stone<q.stone;
}
function updateVillageDefenseUI(){
 const threat=incomingVillageRaid();villageRaidAlert.style.display=threat?'block':'none';if(threat)villageRaidAlert.textContent='⚠ NAJAZD '+threat.arrow+' '+threat.direction+' · '+Math.ceil(threat.distance)+' pól od osady';renderVillageDefense();
}
const defenseWar=updateWar;updateWar=function(dt){defenseWar(dt);defenseUiClock+=dt;if(defenseUiClock>=.5){defenseUiClock=0;updateVillageDefenseUI()}};
const defenseActor=drawBattleActor;drawBattleActor=function(u,color){defenseActor(u,color);if(u.hospitalRetreat){ctx.fillStyle='#ffc4af';ctx.font='bold 11px system-ui';ctx.fillText(u.blocked?'ODWRÓT · brak przejścia':'✚ ODWRÓT / LECZENIE',u.x-48,u.y+43)}};
const defenseWorld=drawStrategyWorld;drawStrategyWorld=function(){
 defenseWorld();ctx.save();ctx.strokeStyle='#9ed8d0';ctx.lineWidth=2/zoom;
 for(const u of selectedActors())if(u.defensePost){const p=u.defensePost;ctx.strokeRect(p.x*T+7,p.y*T+7,T-14,T-14);ctx.fillStyle='#b6ede3';ctx.font='11px system-ui';ctx.fillText('OBRONA',p.x*T,p.y*T-8)}
 if(defenseDraft&&worldCursor){const p=worldPoint(worldCursor),x=Math.floor(p.x/T),y=Math.floor(p.y/T),units=selectedActors().filter(u=>u.hp>0&&!ENGINE_TYPES[u.kind]).slice(0,10),spots=seen.has(tileKey(x,y))?formationMoveSpots(units,x,y):[];for(const s of spots)drawCommandTile(s.x,s.y,'#9ed8d0',true)}ctx.restore();
};
villageDefense();updateVillageDefenseUI();
