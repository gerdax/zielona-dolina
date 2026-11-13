'use strict';
// Persistent tactical orders; all movement uses the existing ground/wall routes.
function defenseRaids(){return state.war.raids.filter(r=>!r.camp&&r.power>0)}
function compareDefenseTargets(u,a,b){
 const distance=t=>Math.hypot(t.p.x-u.x,t.p.y-u.y),priority=villageDefense().rangedPriority||'nearest';
 if(!isRangedUnit(u)||priority==='nearest')return distance(a)-distance(b);
 const rank=t=>distance(t)<=soldierRange(u)*T&&arrowClearLine(u,t.p)?(t.r.engine?.kind===priority?0:1):2;
 return rank(a)-rank(b)||distance(a)-distance(b);
}
function setDefensePriority(kind){if(!['nearest','catapult','ram'].includes(kind))return false;villageDefense().rangedPriority=kind;save();renderAdvancedDefense();return true}
let advancedDraft=null;
function beginAdvancedOrder(kind){
 const units=selectedActors().filter(u=>u.hp>0&&!ENGINE_TYPES[u.kind]&&(kind==='reserve'?!u.wallStation:isRangedUnit(u)&&u.wallStation?.phase==='onWall')).slice(0,10);
 if(!units.length){say(kind==='reserve'?'Zaznacz żołnierzy na ziemi.':'Zaznacz łuczników lub kuszników stojących na murze.');return false}
 cancelPatrolDraft();cancelNavalOrder();cancelSelectionDrag();setMode(null);commandDraft=null;defenseDraft=false;wallDraft=false;
 advancedDraft={kind,ids:units.map(u=>u.uid),a:null};defensePanel.classList.add('hidden');advancedPanel.classList.add('hidden');showCommandBar();say(kind==='reserve'?'Rezerwa: wskaż punkt zbiórki wewnątrz osady.':'Patrol muru: wskaż początek, potem koniec połączonego odcinka.');return true;
}
function assignDefenseReserve(units,x,y){
 const origin=villageOrigin();if(!seen.has(tileKey(x,y))||Math.hypot(x-origin.x,y-origin.y)>10){say('Wskaż odkryte miejsce do 10 pól od środka osady.');return false}
 units=units.filter(u=>u.hp>0&&!u.wallStation&&!ENGINE_TYPES[u.kind]).slice(0,10);const spots=[],used=new Set();for(const u of units){let spot;for(let r=0;r<=3&&!spot;r++)for(let dx=-r;dx<=r&&!spot;dx++)for(let dy=-r;dy<=r&&!spot;dy++){const p={x:x+dx,y:y+dy},key=tileKey(p.x,p.y);if(!used.has(key)&&seen.has(key)&&!ownWall(p.x,p.y)&&unitWalkable(u,p.x,p.y)&&!foreignBuilding(p.x,p.y))spot=p}if(!spot)break;spots.push(spot);used.add(tileKey(spot.x,spot.y))}if(spots.length<units.length||!units.length){say('Brak miejsca dla rezerwy.');return false}
 takeFieldCommand(units);units.forEach((u,i)=>{delete u.order;delete u.defensePost;delete u.hospitalRetreat;delete u.wallPatrol;u.defenseReserve={home:{x:spots[i].x,y:spots[i].y},phase:'waiting'};u.home={...u.defenseReserve.home};resetDefenseRoute(u)});save();say('Rezerwa: '+units.length+' żołnierzy. Wyjdą do świeżego wyłomu podczas najazdu.');return true;
}
function assignWallPatrol(units,a,b){
 if(!ownWall(a.x,a.y)||!ownWall(b.x,b.y)||!wallRoute(a,b)||a.x===b.x&&a.y===b.y){say('Wskaż dwa różne stanowiska połączone własnym kamiennym murem.');return false}
 units=units.filter(u=>u.hp>0&&isRangedUnit(u)&&u.wallStation?.phase==='onWall').slice(0,10);
 // Each soldier patrols a separate slice, so patrol orders never stack a group on one tile.
 const corridor=[a,...wallRoute(a,b)],occupied=new Set(selectableUnits().filter(u=>!units.includes(u)&&u.wallStation).map(u=>tileKey(u.wallStation.x,u.wallStation.y)));
 if(corridor.length<units.length*2||corridor.some(p=>occupied.has(tileKey(p.x,p.y)))){say('Potrzeba co najmniej dwóch wolnych pól muru na każdego strzelca. Skróć grupę lub wybierz dłuższy odcinek.');return false}
 if(units.some(u=>!wallRoute(u.wallStation,a))){say('Strzelcy muszą stać na tym samym połączonym murze.');return false}
 units.forEach((u,i)=>{const start=Math.floor(i*corridor.length/units.length),end=Math.floor((i+1)*corridor.length/units.length)-1;u.wallPatrol={a:{...corridor[start]},b:{...corridor[end]},next:'a',wait:0};delete u.order;delete u.defenseReserve;delete u.defensePost});save();say('Patrol muru: '+units.length+' strzelców. Zatrzymują się, aby ostrzelać wroga.');return true;
}
function chooseAdvancedPoint(x,y){
 if(!advancedDraft)return false;const d=advancedDraft,units=selectableUnits().filter(u=>d.ids.includes(u.uid));
 if(d.kind==='reserve'){if(!assignDefenseReserve(units,x,y))return false}else if(!d.a){if(!seen.has(tileKey(x,y))||!ownWall(x,y)){say('Wskaż własny odkryty kamienny mur.');return false}d.a={x,y};showCommandBar();return true}else if(!assignWallPatrol(units,d.a,{x,y}))return false;
 advancedDraft=null;showCommandBar();return true;
}
function releaseAdvancedOrders(){for(const u of selectedActors()){delete u.defenseReserve;delete u.wallPatrol;delete u.defensePost;resetDefenseRoute(u)}save();renderAdvancedDefense();say('Zaznaczeni żołnierze zwolnieni z rezerwy i patrolu muru.')}
function nearestBreachSpot(u,p){
 const o=villageOrigin(),spots=[];for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++){const x=p.x+dx,y=p.y+dy;if(!ownWall(x,y)&&unitWalkable(u,x,y)&&!foreignBuilding(x,y))spots.push({x,y})}
 return spots.sort((a,b)=>Math.hypot(a.x-o.x,a.y-o.y)-Math.hypot(b.x-o.x,b.y-o.y)||Math.hypot(a.x-u.x/T,a.y-u.y/T)-Math.hypot(b.x-u.x/T,b.y-u.y/T))[0];
}
function processDefenseReserve(u,dt){
 const r=u.defenseReserve;if(!r||u.wallStation||u.hp<=0)return false;
 if(processHospitalRetreat(u,dt))return true;
 const d=villageDefense(),breaches=d.battle?.breaches||[];
 if(defenseRaids().length&&breaches.length){const p=breaches.slice().sort((a,b)=>Math.hypot(a.x-u.x/T,a.y-u.y/T)-Math.hypot(b.x-u.x/T,b.y-u.y/T))[0],key=tileKey(p.x,p.y);if(r.breach!==key){const goal=nearestBreachSpot(u,p);if(goal){r.phase='responding';r.goal=goal;r.breach=key;u.defensePost={...goal};resetDefenseRoute(u)}}}
 else if(r.phase==='responding'){r.phase='waiting';delete r.goal;delete r.breach;delete u.defensePost;resetDefenseRoute(u)}
 const goal=r.phase==='responding'?r.goal:r.home;u.fighting=false;
 if(r.phase==='responding'&&Math.hypot(u.x/T-goal.x-.5,u.y/T-goal.y-.5)<2&&defendActor(u,dt))return true;
 stepOrder(u,goal,dt);healDefender(u,dt);return true;
}
const advancedOrder=handleUnitOrder;handleUnitOrder=function(u,dt){if(processDefenseReserve(u,dt))return true;return advancedOrder(u,dt)};
const advancedWall=processWallDefender;processWallDefender=function(u,dt){
 const p=u.wallPatrol,s=u.wallStation;if(p&&s?.phase==='onWall'&&ownWall(s.x,s.y)&&!(u.hp<=3&&villageDefense().autoRetreat&&state.buildings.some(b=>b.type==='szpital'))){
  wallShoot(u,dt);if(u.fighting)return true;p.wait=Math.max(0,(p.wait||0)-dt);if(p.wait>0)return true;
  const target=p[p.next],route=wallRoute(s,target);if(!route){u.blocked=true;p.wait=2;return true}
  if(!route.length){p.next=p.next==='a'?'b':'a';p.wait=1;return true}
  s.current={x:s.x,y:s.y};s.x=target.x;s.y=target.y;s.route=route;s.phase='wallMove';u.blocked=false;return true;
 }
 if(p&&!s)delete u.wallPatrol;return advancedWall(u,dt);
};
const advancedLeave=leaveWall;leaveWall=function(u,keepOrder=false){delete u.wallPatrol;return advancedLeave(u,keepOrder)};
const advancedMount=assignWallDefenders;assignWallDefenders=function(x,y){const units=selectedActors().slice(),ok=advancedMount(x,y);if(ok){for(const u of units){delete u.wallPatrol;delete u.defenseReserve}save()}return ok};
const advancedIssue=issueMapCommand;issueMapCommand=function(x,y){const units=selectedActors().slice(),orders=units.map(u=>u.order),ok=advancedIssue(x,y);if(ok){units.forEach((u,i)=>{if(u.order&&u.order!==orders[i]){delete u.defenseReserve;delete u.wallPatrol}});save()}return ok};
const advancedStop=clearCommands;clearCommands=function(){for(const u of selectedActors()){delete u.defenseReserve;delete u.wallPatrol}advancedDraft=null;return advancedStop()};
const advancedPointer=c.onpointerdown;c.onpointerdown=e=>{if(advancedDraft&&(!e.button||e.button===0)){const p=worldPoint(e);chooseAdvancedPoint(Math.floor(p.x/T),Math.floor(p.y/T));return}advancedPointer(e)};
const advancedMode=setMode;setMode=function(type){advancedDraft=null;return advancedMode(type)};
const advancedArm=armCommand;armCommand=function(kind){advancedDraft=null;return advancedArm(kind)};
const advancedCancel=cancelCommand;cancelCommand=function(){advancedDraft=null;return advancedCancel()};$('commandCancel').onclick=()=>cancelCommand();
const advancedPoint=beginDefensePoint;beginDefensePoint=function(){advancedDraft=null;return advancedPoint()};$('defensePoint').onclick=()=>beginDefensePoint();
const advancedBeginWall=beginWallCommand;beginWallCommand=function(){advancedDraft=null;return advancedBeginWall()};$('wallMount').onclick=()=>beginWallCommand();
const advancedBar=showCommandBar;showCommandBar=function(){advancedBar();if(advancedDraft){$('commandBar').style.display='flex';$('commandStatus').textContent=advancedDraft.kind==='reserve'?'Rezerwa: wskaż punkt zbiórki · Esc anuluje':advancedDraft.a?'Patrol muru: wskaż koniec · Esc anuluje':'Patrol muru: wskaż początek · Esc anuluje'}};
window.addEventListener('keydown',e=>{if(e.key==='Escape'){advancedDraft=null;showCommandBar()}});
function startDefenseBattle(){
 const d=villageDefense();if(d.battle)return d.battle;
 d.battle={started:state.time,losses:0,deadIds:[],breaches:[],damaged:[],stolen:{food:0,stone:0,gold:0,wood:0}};return d.battle;
}
function defenseActorsSnapshot(){const actors=ownSoldierActors();for(const u of actors)u.uid??='unit-'+state.war.nextUnitId++;return actors.slice()}
function noteDefenseLosses(before){const b=villageDefense().battle;if(!b)return;const live=new Set(ownSoldierActors());for(const u of before)if(!live.has(u)&&!b.deadIds.includes(u.uid)){b.deadIds.push(u.uid);b.losses++}}
const advancedLose=strategyLoseDefenders;strategyLoseDefenders=function(count){const before=defenseActorsSnapshot();if(defenseRaids().length)startDefenseBattle();advancedLose(count);noteDefenseLosses(before)};
for(const name of ['garrison','patrol']){const previous=name==='garrison'?updateGarrisonCombat:updatePatrols,wrapped=function(dt){const before=defenseActorsSnapshot();previous(dt);noteDefenseLosses(before.filter(u=>u.hp<=0))};if(name==='garrison')updateGarrisonCombat=wrapped;else updatePatrols=wrapped}
const advancedDamage=damageBuilding;damageBuilding=function(b,damage){
 const active=defenseRaids().length>0,was=b.type,alive=was!=='ruiny',battle=active?startDefenseBattle():null;
 if(battle&&alive&&!['sciezka','wawoz'].includes(was)&&damage>0&&!battle.damaged.some(p=>p.x===b.x&&p.y===b.y))battle.damaged.push({x:b.x,y:b.y,type:was});
 advancedDamage(b,damage);
 if(battle&&alive&&b.type==='ruiny'&&['palisada','brama','brama_swoi','wieza'].includes(was)&&!battle.breaches.some(p=>p.x===b.x&&p.y===b.y))battle.breaches.push({x:b.x,y:b.y});
};
const advancedResolve=resolveRaid;resolveRaid=function(raid){if(raid.camp)return advancedResolve(raid);const b=startDefenseBattle(),before={food:state.food,stone:state.stone,gold:state.gold,wood:state.wood};advancedResolve(raid);for(const k of Object.keys(before))b.stolen[k]+=Math.max(0,before[k]-state[k])};
function finishDefenseBattle(){
 const d=villageDefense(),b=d.battle;if(!b)return null;const report={started:b.started,duration:Math.max(0,state.time-b.started),losses:b.losses,damaged:b.damaged.length,destroyed:0,wood:0,stone:0,missing:0,stolen:b.stolen};
 for(const p of b.damaged){const current=building(p.x,p.y);if(!current){report.missing++;report.destroyed++;continue}if(current.type==='ruiny')report.destroyed++;if(current.type==='ruiny'||(current.hp??buildingMaxHp(current))<buildingMaxHp(current)){const cost=repairCost(current);report.wood+=cost.wood;report.stone+=cost.stone}}
 d.reports=[report,...(d.reports||[])].slice(0,5);delete d.battle;save();renderAdvancedDefense();say('Raport po najazdzie: '+report.losses+' poległych · uszkodzone budowle: '+report.damaged+'. Otwórz Taktykę obrony.');return report;
}
const advancedWar=updateWar;updateWar=function(dt){if(defenseRaids().length)startDefenseBattle();advancedWar(dt);if(defenseRaids().length)startDefenseBattle();else if(villageDefense().battle)finishDefenseBattle()};
const advancedPanel=document.createElement('aside');advancedPanel.id='advancedDefensePanel';advancedPanel.className='war-panel hidden';advancedPanel.innerHTML='<div class="war-title"><h2>Taktyka obrony</h2><button id="advancedDefenseClose" aria-label="Zamknij taktykę obrony">✕</button></div><h3>Priorytet ostrzału</h3><p>Dotyczy wszystkich łuczników i kuszników, także na murach. Wybierają wskazaną machinę w zasięgu; bez niej strzelają do najbliższego celu. Rozkaz ataku na konkretną armię ma pierwszeństwo.</p><div class="defense-priorities"><button id="priorityNearest">Najbliższy wróg</button><button id="priorityCatapult">Katapulty</button><button id="priorityRam">Tarany</button></div><h3>Rezerwa przy wyłomie</h3><p>Zaznacz do 10 żołnierzy na ziemi i wskaż punkt zbiórki w osadzie. Czekają tam, reagują na zniszczenie umocnienia podczas najazdu i wracają po bitwie. Ranni nadal korzystają ze szpitala.</p><button id="reserveAssign">⚑ Ustaw rezerwę</button><p id="reserveStatus"></p><h3>Patrole na murach</h3><p>Zaznacz strzelców stojących na murze, potem wskaż dwa końce odcinka. Każdy dostaje osobny fragment z co najmniej dwoma polami. Podczas ostrzału zatrzymuje się. Idź, Atakuj, Zatrzymaj lub zejście kończą patrol.</p><button id="wallPatrolAssign">🏹 Wyznacz patrol muru</button><button id="advancedRelease">Zwolnij zaznaczonych z rezerwy / patrolu</button><p id="wallPatrolStatus"></p><h3>Raporty po najazdach</h3><p>Ostatnie 5 bitew, z łączonymi falami. Koszt obejmuje pozostałe naprawy uszkodzonych w bitwie budowli, niezależnie od odległości. Usunięte budowle wymagają ręcznej odbudowy.</p><div id="defenseReports"></div>';
document.body.append(advancedPanel);
const advancedOpen=document.createElement('button');advancedOpen.id='advancedDefenseOpen';advancedOpen.textContent='🛡 Taktyka obrony';advancedOpen.onclick=()=>{defensePanel.classList.add('hidden');advancedPanel.classList.remove('hidden');renderAdvancedDefense()};$('clockControls').append(advancedOpen);
$('advancedDefenseClose').onclick=()=>advancedPanel.classList.add('hidden');$('priorityNearest').onclick=()=>setDefensePriority('nearest');$('priorityCatapult').onclick=()=>setDefensePriority('catapult');$('priorityRam').onclick=()=>setDefensePriority('ram');$('reserveAssign').onclick=()=>beginAdvancedOrder('reserve');$('wallPatrolAssign').onclick=()=>beginAdvancedOrder('patrol');$('advancedRelease').onclick=releaseAdvancedOrders;
function renderAdvancedDefense(){
 const d=villageDefense(),actors=ownSoldierActors();for(const [id,kind] of [['priorityNearest','nearest'],['priorityCatapult','catapult'],['priorityRam','ram']]){$(id).setAttribute('aria-pressed',String((d.rangedPriority||'nearest')===kind));$(id).classList.toggle('active',(d.rangedPriority||'nearest')===kind)}
 $('reserveStatus').textContent='W rezerwie: '+actors.filter(u=>u.defenseReserve).length+' · Reaguje na wyłom: '+actors.filter(u=>u.defenseReserve?.phase==='responding').length;
 $('wallPatrolStatus').textContent='Patroluje mur: '+actors.filter(u=>u.wallPatrol).length;
 $('defenseReports').innerHTML=(d.battle?'<p>Najazd trwa — raport pojawi się po zakończeniu wszystkich fal.</p>':'')+(d.reports||[]).map((r,i)=>'<article class="defense-report"><strong>'+(i?'Wcześniejszy najazd':'Ostatni najazd')+' · '+Math.round(r.duration)+' s</strong><p>Polegli: '+r.losses+' · Uszkodzone budowle: '+r.damaged+' · Zniszczone: '+r.destroyed+'</p><p>Pozostała naprawa: '+r.wood+' drewna · '+r.stone+' kamienia'+(r.missing?' · Ręczna odbudowa: '+r.missing:'')+'</p><p>Zrabowano: '+r.stolen.food+' żywności · '+r.stolen.stone+' kamienia · '+r.stolen.wood+' drewna · '+r.stolen.gold+' monet</p></article>').join('')+(!d.battle&&!(d.reports||[]).length?'<p>Brak zakończonych najazdów od włączenia raportów.</p>':'');
}
const advancedDefenseUI=updateVillageDefenseUI;updateVillageDefenseUI=function(){advancedDefenseUI();if(!advancedPanel.classList.contains('hidden'))renderAdvancedDefense()};
const advancedActor=drawBattleActor;drawBattleActor=function(u,color){advancedActor(u,color);if(u.defenseReserve){ctx.fillStyle='#b6ede3';ctx.font='bold 10px system-ui';ctx.fillText(u.defenseReserve.phase==='responding'?'REZERWA → WYŁOM':'REZERWA',u.x-28,u.y+32)}};
const advancedWorld=drawStrategyWorld;drawStrategyWorld=function(){advancedWorld();ctx.save();for(const u of selectedActors())if(u.wallPatrol)for(const key of ['a','b']){const p=u.wallPatrol[key];ctx.strokeStyle='#ffe196';ctx.strokeRect(p.x*T+4,p.y*T+4,T-8,T-8);ctx.fillStyle='#ffe196';ctx.font='bold 12px system-ui';ctx.fillText(key.toUpperCase(),p.x*T+8,p.y*T-45)}ctx.restore()};
