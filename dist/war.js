'use strict';
// Additional state is optional in old saves. Never replace the player's village.
function initWar(){
 if(!state.war)state.war={soldiers:0,queue:[],expedition:null,raids:[],log:[],waypoint:null};
 const w=state.war;w.soldiers=Math.max(0,Number(w.soldiers)||0);w.queue??=[];w.raids??=[];w.log??=[];if(!Number.isFinite(w.aiGrace))w.aiGrace=180;if(!Number.isFinite(w.aiCooldown))w.aiCooldown=0;
 if(!state.towns){
  const seeds=[['lesny','Leśny Gród',96,100,12,'#d19b59'],['rzeczny','Rzeczny Brzeg',162,106,20,'#6cacc2'],['debowe','Dębowe Wzgórze',84,163,28,'#ae7495'],['kamienny','Kamienny Fort',201,171,40,'#b8bbbf']];
  state.towns=seeds.map(([id,name,x,y,power,color])=>{
   for(let r=0;r<40;r++){let found=false;for(let dx=-r;dx<=r&&!found;dx++)for(const dy of r?[r,-r]:[0]){const nx=x+dx,ny=y+dy;if(terrain(nx,ny)==='grass'&&state.buildings.every(b=>Math.hypot(b.x-nx,b.y-ny)>7)&&(!state.settled||Math.hypot(state.settled.x-nx,state.settled.y-ny)>16)){x=nx;y=ny;found=true;break}}if(found)break}
   return {id,name,x,y,power,color,relation:'neutral',discovered:false,raidTimer:100};
  });
 }
 const before=state.towns.length;completeTownMap();if(state.towns.length!==before)save();
}
function completeTownMap(){
 const adjectives=['Zielony','Stary','Nowy','Biały','Cichy','Złoty','Srebrny','Wilczy','Orli','Brzozowy'],places=['Gród','Brzeg','Fort','Jar','Bór','Zakątek','Przesmyk','Bastion','Trakt','Dwór'],colors=['#d19b59','#6cacc2','#ae7495','#b8bbbf','#aebf77'];
 const safe=(x,y)=>x>=6&&y>=6&&x<N-6&&y<N-6&&terrain(x,y)==='grass'&&[[0,0],[-2,1],[2,1],[-1,-2],[2,-2]].every(([dx,dy])=>terrain(x+dx,y+dy)==='grass')&&state.towns.every(t=>Math.hypot(t.x-x,t.y-y)>=28)&&state.buildings.every(b=>Math.hypot(b.x-x,b.y-y)>14)&&(!state.settled||Math.hypot(state.settled.x-x,state.settled.y-y)>30)&&Math.hypot(state.p.x/T-x,state.p.y/T-y)>14;
 for(let i=0;state.towns.length<100;i++){
  const id='pogranicze-'+(i+1);if(state.towns.some(t=>t.id===id))continue;let spot=null;
  for(let j=0;j<3000;j++){const x=12+Math.floor(hash(i+91,j+17)*(N-24)),y=12+Math.floor(hash(i+247,j+63)*(N-24));if(safe(x,y)){spot={x,y};break}}
  if(!spot)break;
  state.towns.push({id,name:adjectives[i%10]+' '+places[Math.floor(i/10)%10],...spot,power:12+Math.floor(hash(i,99)*39),color:colors[i%colors.length],relation:'neutral',discovered:false,raidTimer:100});
 }
}
initWar();
let warPanelSignature='',warUITime=0,warDiscoverTime=0,foreignIndex=new Map();
const militaryTypes=['wieza','werbunek','port'];
function villageOrigin(){return state.settled||{x:120,y:120}}
function ownCount(type){return state.buildings.filter(b=>b.type===type).length}
function armyCapacity(){return ownCount('werbunek')*6+(typeof castleLevel==='function'?castleLevel()*6:0)}
function soldiersAway(){return state.war.expedition?.troops||0}
function armyTotal(){return (typeof kingdomArmyAway==='function'?kingdomArmyAway():0)+state.war.soldiers+soldiersAway()+state.war.queue.length+(typeof patrolCount==='function'?patrolCount():0)}
function defensePower(){if(typeof strategyDefensePower==='function')return strategyDefensePower();return (state.war.soldiers+(typeof patrolDefenders==='function'?patrolDefenders():0))*4+ownCount('wieza')*10+Math.min(20,ownCount('palisada')*.4)}
function warLog(message){state.war.log.unshift(message);state.war.log=state.war.log.slice(0,6);say(message);warPanelSignature=''}
function rebuildForeignIndex(){
 foreignIndex.clear();for(const t of state.towns){
  for(const [dx,dy,type] of [[0,0,'foreign_keep'],[-2,1,'foreign_house'],[2,1,'foreign_house'],[-1,-2,'foreign_house'],[2,-2,'foreign_tower']]){
   const x=t.x+dx,y=t.y+dy;if(['grass','sand'].includes(terrain(x,y))&&!building(x,y))foreignIndex.set(tileKey(x,y),{x,y,type,townId:t.id});
  }
 }
}
rebuildForeignIndex();
function foreignBuilding(x,y){return foreignIndex.get(tileKey(x,y))||null}
function isRangedUnit(u){return ['archer','crossbow'].includes(u?.kind)}
function soldierRange(u){return u.kind==='crossbow'?6:5}
function soldierRangedCooldown(u){return u.kind==='crossbow'?2.2:1.2}
function recruitSoldier(kind='melee'){
 if(!['melee','archer','crossbow','shield'].includes(kind))return false;const wood=kind==='crossbow'?30:kind==='shield'?25:kind==='archer'?20:10,stone=kind==='crossbow'?5:kind==='shield'?8:kind==='archer'?3:2,seconds=kind==='crossbow'?14:kind==='shield'?12:kind==='archer'?10:8;
 if(!state.settled||!(ownCount('werbunek')+ownCount('koszary'))){say('Zbuduj biuro werbunkowe w swojej wiosce.');return false}
 if(armyTotal()>=armyCapacity()){say('Brak miejsc w wojsku. Kolejne biuro daje 6 miejsc.');return false}
 if(state.food<15||state.wood<wood||state.stone<stone){say('Werbunek: 15 żywności, '+wood+' drewna i '+stone+' kamienia.');return false}
 state.food-=15;state.wood-=wood;state.stone-=stone;state.war.queue.push({remaining:seconds,kind});warLog((kind==='crossbow'?'Kusznik':kind==='shield'?'Tarczownik':kind==='archer'?'Łucznik':'Ochotnik')+' zgłosił się do szkolenia ('+seconds+' s).');ui();save();return true;
}
function declareWar(id){const t=state.towns.find(t=>t.id===id);if(!t||!t.discovered||!['neutral','scouting'].includes(t.relation)||!state.settled)return false;t.relation='war';if(state.campaign?.stage==='desert')t.scoutFound=true;t.raidTimer=100;warLog('Wypowiedziano wojnę osadzie '+t.name+'. Najazd możliwy za 100 s.');ui();save();return true}
function makePeace(id){if(state.campaign?.stage==='desert'){say('Orkowie nie zawierają pokoju. Przejmij ich obóz.');return false}const t=state.towns.find(t=>t.id===id);if(!t||t.relation!=='war')return false;if(state.war.expedition?.townId===id){say('Poczekaj na powrót wyprawy.');return false}if(state.food<30){say('Poselstwo pokojowe kosztuje 30 żywności.');return false}state.food-=30;t.relation='neutral';t.truce=300;state.war.aiCooldown=Math.max(state.war.aiCooldown,60);state.war.raids=state.war.raids.filter(r=>r.townId!==id);warLog('Zawarto pokój z osadą '+t.name+'. Rozejm potrwa 5 minut.');ui();save();return true}
function campaignRoute(from,to,allowWater=false,faction='friendly'){
 const sx=Math.floor(from.x),sy=Math.floor(from.y),gx=Math.floor(to.x),gy=Math.floor(to.y),start=tileKey(sx,sy);
 const obstacles=new Set(state.buildings.filter(b=>b.type==='wieza'||b.type==='palisada'&&faction!=='siege'||b.type==='brama_swoi'&&faction==='enemy'||b.type==='brama'&&!b.open&&faction!=='siege'||(b.type==='wawoz'&&!(allowWater&&terrain(b.x,b.y)==='water'))).map(b=>tileKey(b.x,b.y)));
 const bridges=new Set(state.buildings.filter(b=>supportsWaterCrossing(b)).map(b=>tileKey(b.x,b.y)));
 const walk=(x,y)=>{const k=tileKey(x,y),t=terrain(x,y);return !obstacles.has(k)&&!(typeof orcWallBlocked==='function'&&orcWallBlocked(x,y))&&t!=='edge'&&(t==='water'?allowWater||bridges.has(k):t==='ravine'?bridges.has(k):true)};
 // Reject a locally enclosed start as well as an enclosed destination.
 if(sx===gx&&sy===gy)return [{x:sx+.5,y:sy+.5}];
 if(!allowWater&&(sx<river(sy))!==(gx<river(gy))&&!state.buildings.some(b=>supportsWaterCrossing(b)&&terrain(b.x,b.y)==='water'))return null;if(!walk(gx,gy)||!walk(sx,sy))return null;
 const local=[[sx,sy]],checked=new Set([start]);
 for(let i=0;i<local.length&&i<128;i++){const [x,y]=local[i];if(x===gx&&y===gy)break;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=tileKey(nx,ny);if(!checked.has(k)&&walk(nx,ny)){checked.add(k);local.push([nx,ny])}}if(i===local.length-1)return null}
 // A* keeps distant campaigns near their destination instead of flooding the world.
 const goal=gy*N+gx,source=sy*N+sx,heap=[],cost=new Map([[goal,0]]),parent=new Map([[goal,null]]);
 const push=n=>{heap.push(n);let i=heap.length-1;while(i){const p=(i-1)>>1;if(heap[p].f<n.f||heap[p].f===n.f&&heap[p].g>=n.g)break;heap[i]=heap[p];i=p}heap[i]=n};
 const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&(heap[c+1].f<heap[c].f||heap[c+1].f===heap[c].f&&heap[c+1].g>heap[c].g))c++;if(heap[c].f>last.f||heap[c].f===last.f&&heap[c].g<=last.g)break;heap[i]=heap[c];i=c}heap[i]=last}return top};
 push({key:goal,g:0,f:Math.abs(gx-sx)+Math.abs(gy-sy)});
 while(heap.length){const current=pop();if(cost.get(current.key)!==current.g)continue;const x=current.key%N,y=Math.floor(current.key/N);
  if(current.key===source){const route=[];let k=source;while(k!==null){route.push({x:k%N+.5,y:Math.floor(k/N)+.5});k=parent.get(k)}return route}
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(!walk(nx,ny))continue;const k=ny*N+nx,g=current.g+1;if(g>=(cost.get(k)??Infinity))continue;cost.set(k,g);parent.set(k,current.key);push({key:k,g,f:g+Math.abs(nx-sx)+Math.abs(ny-sy)})}
 }return null;
}
// A sealed village must not suppress a raid. March up to the first defensive barrier.
function raidApproach(from,to){
 const planned=campaignRoute(from,to,true,'siege')||[{x:Math.floor(from.x)+.5,y:Math.floor(from.y)+.5}];
 const stop=planned.findIndex((p,i)=>{if(!i)return false;const b=building(Math.floor(p.x),Math.floor(p.y));return b?.type==='wieza'||b?.type==='palisada'||b?.type==='brama_swoi'||b?.type==='brama'&&!b.open});
 const route=stop<0?planned:planned.slice(0,stop),end=route[route.length-1];
 return {route,progress:0,siege:Math.floor(end.x)!==Math.floor(to.x)||Math.floor(end.y)!==Math.floor(to.y),siegeRetry:0};
}
function launchExpedition(id,troops){
 const t=state.towns.find(t=>t.id===id),w=state.war;
 if(!state.settled||!t||!t.discovered||t.relation!=='war'){say('Najpierw odkryj osadę i wypowiedz jej wojnę.');return false}
 if(w.expedition){say('Jedna wyprawa jest już w drodze.');return false}
 troops=Math.floor(Number(troops));if(!Number.isFinite(troops)||troops<1||troops>w.soldiers){say('Wybierz tylu żołnierzy, ilu masz w garnizonie.');return false}
 if(state.food<troops*5){say('Wyprawa wymaga 5 żywności na żołnierza.');return false}
 let naval=false,route=campaignRoute(villageOrigin(),t,false);
 if(!route&&ownCount('port')){route=campaignRoute(villageOrigin(),t,true);naval=!!route}
 if(!route){say('Brak drogi. Otwórz bramy, zbuduj most przez rzekę lub port do transportu przez wodę.');return false}
 state.food-=troops*5;let army=null;if(typeof syncGarrisonActors==='function'){syncGarrisonActors();army=w.guards.splice(-troops,troops)}w.soldiers-=troops;w.expedition={townId:id,troops,route,progress:0,phase:'outbound',naval,loot:null,army};warLog('Wyprawa do '+t.name+': '+troops+' żołnierzy'+(naval?' z transportem rzecznym.':'.'));ui();save();return true;
}
function advanceCampaign(e,dt,speed){
 const next=e.route[Math.min(e.route.length-1,Math.floor(e.progress)+1)];
 const x=Math.floor(next.x),y=Math.floor(next.y),b=building(x,y),t=terrain(x,y);
 const blockedNow=(typeof orcWallBlocked==='function'&&orcWallBlocked(x,y))||b?.type==='wieza'||b?.type==='palisada'||b?.type==='brama_swoi'&&e.hostile||b?.type==='brama'&&!b.open||t==='edge'||(t==='water'&&!e.naval&&!supportsWaterCrossing(b))||(t==='ravine'&&!supportsWaterCrossing(b))||b?.type==='wawoz'&&!(e.naval&&t==='water');
 if(blockedNow){e.retry=(e.retry||0)-dt;if(e.retry<=0){e.retry=2;const p=routePosition(e),dest=e.route[e.route.length-1],route=campaignRoute({x:p.x/T,y:p.y/T},dest,e.naval,e.hostile?'enemy':'friendly');if(route){e.route=route;e.progress=0;e.waiting=false}else if(!e.waiting){e.waiting=true;warLog('Oddział czeka na przejście. Otwórz bramę lub opuść most.')}}return false}
 e.waiting=false;e.progress=Math.min(e.route.length-1,e.progress+dt*speed);return true;
}
function resolveExpedition(){
 const w=state.war,e=w.expedition,t=state.towns.find(t=>t.id===e.townId);if(!t){returningArmy(e);w.soldiers+=e.troops;w.expedition=null;return}
 const attack=typeof armyStrength==='function'?armyStrength(e.troops,e.army):e.troops*4,won=attack>=t.power,baseLosses=won?Math.min(e.troops-1,Math.max(1,Math.ceil(t.power/10))):Math.min(e.troops,Math.ceil(t.power/5)),losses=Math.min(e.troops,Math.ceil(baseLosses/(1+(typeof upgradeLevel==='function'?upgradeLevel('armor')*.2:0))));e.troops-=losses;if(e.army)e.army=e.army.slice(losses);
 if(won){t.relation='conquered';if(typeof grantCampGems==='function')grantCampGems('town:'+t.id);e.loot={gold:30+Math.floor(t.power/2),wood:50,stone:25};warLog('Zdobyto '+t.name+'! Straty: '+losses+'. Łupy wracają z wojskiem.');w.raids=w.raids.filter(r=>r.townId!==t.id)}
 else {t.power=Math.max(4,t.power-Math.max(1,e.troops));warLog('Wyprawa odparta przez '+t.name+'. Straty: '+losses+'.')}
 e.phase='return';e.route=e.route.slice().reverse();e.progress=0;if(!e.troops){w.expedition=null;warLog('Wyprawa nie wróciła. Możesz werbować kolejne wojsko.')}save();
}
function returningArmy(e){if(e.army&&typeof syncGarrisonActors==='function'){syncGarrisonActors();const o=state.buildings.find(b=>b.type==='werbunek')||villageOrigin();for(const u of e.army){const home=nearbySpot(o.x,o.y+1)||villageOrigin();state.war.guards.push({...u,x:(home.x+.5)*T,y:(home.y+.5)*T,home,path:[]})}}}
function finishExpedition(){const e=state.war.expedition;returningArmy(e);state.war.soldiers+=e.troops;if(e.loot){state.gold+=e.loot.gold;state.wood+=e.loot.wood;state.stone+=e.loot.stone}warLog('Wyprawa wróciła: '+e.troops+' żołnierzy'+(e.loot?' i łupy.':'.'));state.war.expedition=null;ui();save()}
function routePosition(e){const n=Math.min(e.route.length-1,Math.floor(e.progress)),a=e.route[n],b=e.route[Math.min(n+1,e.route.length-1)],f=Math.min(1,e.progress-n);return {x:(a.x+(b.x-a.x)*f)*T,y:(a.y+(b.y-a.y)*f)*T}}
function resolveRaid(raid){
 const defense=defensePower(),won=defense>=raid.power;
 if(won){const losses=Math.min(state.war.soldiers+(typeof patrolDefenders==='function'?patrolDefenders():0),Math.floor(raid.power/12));if(typeof loseDefenders==='function')loseDefenders(losses);else state.war.soldiers-=losses;state.gold+=8;warLog('Najazd odparty! Straty: '+losses+' żołnierzy. Zdobyto 8 monet.')}
 else {const stolenFood=Math.min(state.food,25),stolenStone=Math.min(state.stone,10);state.food-=stolenFood;state.stone-=stolenStone;if(typeof loseDefenders==='function')loseDefenders(1);else state.war.soldiers=Math.max(0,state.war.soldiers-1);warLog('Najeźdźcy zabrali '+Math.floor(stolenFood)+' żywności i '+Math.floor(stolenStone)+' kamienia. Rozbuduj obronę.')}
}
function discoverTown(t){if(!t.discovered){t.discovered=true;warLog('Odkryto osadę '+t.name+'. Otwórz panel Osady i wojsko.');save()}}
function updateEnemyPlans(dt){
 const w=state.war;if(!state.settled)return;
 for(const t of state.towns)t.truce=Math.max(0,(t.truce||0)-dt);
 if(w.aiGrace>0){w.aiGrace=Math.max(0,w.aiGrace-dt);if(w.aiGrace>0)return}
 w.aiCooldown=Math.max(0,w.aiCooldown-dt);
 if(state.campaign?.stage==='desert')return;
 // One autonomous enemy at a time, with breathing room after conquest or peace.
 if(state.towns.some(t=>t.relation==='war')){w.aiCooldown=Math.max(w.aiCooldown,60);return}
 if(w.aiCooldown>0)return;
 const origin=villageOrigin(),enemy=state.towns.filter(t=>t.relation==='neutral'&&!(t.truce>0)).sort((a,b)=>Math.hypot(a.x-origin.x,a.y-origin.y)-Math.hypot(b.x-origin.x,b.y-origin.y))[0];
 if(!enemy)return;
 enemy.relation='war';enemy.discovered=true;enemy.raidTimer=45;w.aiCooldown=180;
 warLog(enemy.name+' wypowiada Ci wojnę! Za 45 s wyśle najazd. Przygotuj wieże i garnizon.');save();
}
function clearWaypoint(){state.war.waypoint=null;if(state.clock)delete state.clock.mapTarget;$('clearWaypoint').style.display='none';warPanelSignature='';say('Usunięto cel i strzałkę z mapy.');save();renderWarPanel()}
$('clearWaypoint').onclick=clearWaypoint;
$('raidAlert').onclick=()=>{if(typeof openKingdom==='function')$('kingdomPanel').classList.add('hidden');if(typeof openStrategy==='function')$('strategyPanel').classList.add('hidden');$('warPanel').classList.remove('hidden');warPanelSignature='';renderWarPanel()};
const towerVisionOffsets=[];for(let dx=-15;dx<=15;dx++)for(let dy=-15;dy<=15;dy++)if(dx*dx+dy*dy<225)towerVisionOffsets.push([dx,dy]);towerVisionOffsets.sort((a,b)=>a[0]*a[0]+a[1]*a[1]-b[0]*b[0]-b[1]*b[1]);
let towerVisionSeen=null,towerVisionCount=0,towerVisionScheduled=new WeakSet(),towerVisionQueue=[];
function queueTowerVision(){if(towerVisionSeen!==seen||seen.size<towerVisionCount){towerVisionSeen=seen;towerVisionScheduled=new WeakSet();towerVisionQueue=[]}for(const b of state.buildings)if(b.type==='wieza'&&!towerVisionScheduled.has(b)){towerVisionScheduled.add(b);towerVisionQueue.push({b,index:0})}}
function processTowerVision(){if(towerVisionSeen!==seen||seen.size<towerVisionCount)queueTowerVision();let budget=256;while(budget>0&&towerVisionQueue.length){const job=towerVisionQueue[0];if(job.b.type!=='wieza'||!state.buildings.includes(job.b)){towerVisionQueue.shift();continue}const [dx,dy]=towerVisionOffsets[job.index++],x=job.b.x+dx,y=job.b.y+dy;if(x>=0&&y>=0&&x<N&&y<N)seen.add(tileKey(x,y));budget--;if(job.index===towerVisionOffsets.length)towerVisionQueue.shift()}towerVisionCount=seen.size}
function updateWar(dt){
 const w=state.war;for(const r of w.raids)r.engaged=false;if(typeof updateKingdom==='function')updateKingdom(dt);if(typeof updateStrategy==='function')updateStrategy(dt);if(typeof updateGarrisonCombat==='function')updateGarrisonCombat(dt);if(typeof updatePatrols==='function')updatePatrols(dt);updateEnemyPlans(dt);warDiscoverTime+=dt;warUITime+=dt;if(typeof updateTrade==='function')updateTrade(dt);
 if(w.queue.length){if(!(ownCount('werbunek')+ownCount('koszary'))){w.queue=[];warLog('Szkolenie przerwane — zbuduj biuro werbunkowe.')}else if(w.queue[0].kind!=='cavalry'||ownCount('stajnia')){w.queue[0].remaining-=dt;if(w.queue[0].remaining<=0){const trained=w.queue.shift();if(typeof syncGarrisonActors==='function')syncGarrisonActors();w.soldiers++;if(typeof syncGarrisonActors==='function'){syncGarrisonActors();w.guards[w.guards.length-1].kind=trained.kind||'melee'}warLog((trained.kind==='crossbow'?'Kusznik':trained.kind==='shield'?'Tarczownik':trained.kind==='cavalry'?'Jeździec':trained.kind==='archer'?'Łucznik':'Żołnierz')+' ukończył szkolenie i broni wioski.');save()}}}
 if(w.expedition){const e=w.expedition;advanceCampaign(e,dt,2.6);const p=routePosition(e);for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++){let x=Math.floor(p.x/T)+dx,y=Math.floor(p.y/T)+dy;if(x>=0&&y>=0&&x<N&&y<N)seen.add(tileKey(x,y))}if(e.progress>=e.route.length-1){if(e.phase==='outbound')resolveExpedition();else finishExpedition()}}
 const raidTowns=state.campaign?.stage==='desert'?(w.aiGrace>0||w.aiCooldown>0||w.raids.some(r=>r.power>0&&!r.camp)?[]:state.towns.filter(t=>t.relation==='war').sort((a,b)=>Math.hypot(a.x-villageOrigin().x,a.y-villageOrigin().y)-Math.hypot(b.x-villageOrigin().x,b.y-villageOrigin().y)).slice(0,1)):state.towns;
 for(const t of raidTowns)if(t.relation==='war'&&state.settled){t.raidTimer-=dt;if(t.raidTimer<=0){t.raidTimer=150;if(state.campaign?.stage==='desert')w.aiCooldown=60;if(w.raids.some(r=>r.townId===t.id))continue;const direct=campaignRoute(t,villageOrigin(),true,'enemy'),approach=direct?{route:direct,progress:0,siege:false}:raidApproach(t,villageOrigin());w.raids.push({townId:t.id,...approach,hostile:true,power:Math.max(6,Math.round(t.power*.65))});warLog('Nadciąga najazd z '+t.name+'!'+(approach.siege?' Wróg podejdzie do umocnień — wejście jest zablokowane.':' Wieże i garnizon bronią wioski.'));save()}}

 for(let i=w.raids.length-1;i>=0;i--){const r=w.raids[i];r.naval=true;r.hostile=true;if(!r.camp&&r.siege&&r.progress>=r.route.length-1){r.siegeRetry=(r.siegeRetry||0)-dt;if(r.siegeRetry<=0){const p=routePosition(r);Object.assign(r,raidApproach({x:p.x/T,y:p.y/T},villageOrigin()));r.siegeRetry=5}}if(!r.camp&&!r.engaged)advanceCampaign(r,dt,1.6);const p=routePosition(r);for(const tower of state.buildings.filter(b=>b.type==='wieza'))if(Math.hypot((tower.x+.5)*T-p.x,(tower.y+.5)*T-p.y)<(tower.material==='stone'?8:6)*T)r.power=Math.max(0,r.power-dt*(tower.material==='stone'?3:2));
  if(r.power<=0){warLog('Obrońcy zniszczyli oddział najeźdźców.');w.raids.splice(i,1);save()}else if(!r.camp&&!r.siege&&r.progress>=r.route.length-1){resolveRaid(r);w.raids.splice(i,1);save()}
 }
 if(warDiscoverTime>1){warDiscoverTime=0;for(const t of state.towns)if(Math.hypot(t.x-state.p.x/T,t.y-state.p.y/T)<13||seen.has(tileKey(t.x,t.y)))discoverTown(t);
  queueTowerVision();
 }
 processTowerVision();if(warUITime>1){warUITime=0;renderWarPanel()}
}
function portIncome(){state.gold+=ownCount('port')*3+state.towns.filter(t=>t.relation==='conquered').length*2}
function renderWarPanel(){
 $('clearWaypoint').style.display=state.war.waypoint||state.clock?.mapTarget?'block':'none';const enemy=state.towns.find(t=>t.relation==='war');$('raidAlert').style.display=enemy?'block':'none';if(enemy)$('raidAlert').textContent=state.war.raids.length?'⚠ Najazd w drodze! Przygotuj obronę.':'⚠ '+enemy.name+' · najazd za '+Math.max(0,Math.ceil(enemy.raidTimer))+' s';const panel=$('warPanel');if(panel.classList.contains('hidden'))return;
 const w=state.war,e=w.expedition,signature=JSON.stringify([w.patrols?.map(p=>[p.id,p.units.length,p.units.some(u=>u.blocked)]),Math.ceil(w.aiGrace),Math.ceil(w.aiCooldown),w.waypoint,w.soldiers,w.guards?.filter(u=>u.kind==='archer').length,typeof marketSignature==='function'?marketSignature():null,w.queue.map(q=>Math.ceil(q.remaining)),e&&[e.phase,Math.floor(e.progress),e.troops,e.waiting],w.raids.map(r=>Math.ceil(r.power)),state.towns.map(t=>[t.relation,t.discovered,Math.ceil(t.raidTimer),Math.ceil(t.truce||0)]),Math.floor(state.food),Math.floor(state.wood),Math.floor(state.stone),ownCount('wieza'),ownCount('port'),armyCapacity(),typeof upgradeLevel==='function'?[upgradeLevel('sword'),upgradeLevel('bow'),upgradeLevel('armor')]:null,w.log]);
 if(signature===warPanelSignature)return;warPanelSignature=signature;
 const townCards=state.towns.map(t=>{const relation={scouting:'Wysyła zwiad',neutral:'Pokój',war:'Wojna',conquered:'Twoja osada',allied:'Sojusz'}[t.relation];return `<section class="town-card"><div class="town-heading"><b style="color:${t.color}">⚑ ${t.name}</b><span class="relation ${t.relation}">${t.discovered?relation:'Pogłoski'}</span></div><p>${t.x}, ${t.y} · ${t.discovered?'Siła obrony: '+t.power:'Podejdź do osady, aby ją odkryć.'}</p><div class="war-actions"><button data-war="locate" data-id="${t.id}">⌖ Wskaż na mapie</button>${t.discovered&&['neutral','scouting'].includes(t.relation)?`<button data-war="declare" data-id="${t.id}" ${!state.settled?'disabled':''}>Wypowiedz wojnę</button>`:''}${t.relation==='war'?`<button data-war="attack" data-id="${t.id}" ${!w.soldiers||e?'disabled':''}>Wyślij garnizon (${w.soldiers})</button>${state.campaign?.stage==='desert'?'<small>Orkowie odkryli wioskę — wojna</small>':`<button data-war="peace" data-id="${t.id}">Pokój · 30 🌾</button>`}<small>Siła ataku ${typeof armyStrength==='function'?armyStrength(w.soldiers,w.guards):w.soldiers*4} · najazd za ${Math.max(0,Math.ceil(t.raidTimer))} s</small>`:''}${t.relation==='neutral'&&t.truce>0?'<small>Rozejm: jeszcze '+Math.ceil(t.truce)+' s</small>':''}${t.relation==='conquered'?'<small>Danina: +2 monety / 12 s</small>':''}</div>${typeof marketTownControls==='function'?marketTownControls(t):''}</section>`}).join('');
 $('warContent').innerHTML=`${typeof openStrategy==='function'?'<button class="recruit strategy-link" data-war="strategy">⚔ Dowodzenie · machiny · kuźnia · sojusze</button>':''}${typeof openKingdom==='function'?'<button class="recruit kingdom-link" data-war="kingdom">♛ Królestwo · zamek · flota · karawany</button>':''}<div class="war-summary"><div><strong>${w.soldiers}</strong><small>WOLNYCH ŻOŁNIERZY</small></div><div><strong>${Math.floor(defensePower())}</strong><small>SIŁA OBRONY</small></div></div><p class="war-hint">Na mapie: ${state.towns.length} osad · odkryto ${state.towns.filter(t=>t.discovered).length}. Twoja wioska: ${ownCount('wieza')} wież · ${ownCount('werbunek')} biur · ${ownCount('port')} portów. Bazowa siła żołnierza: 4; kuźnia ją zwiększa. Biuro daje 6 miejsc w wojsku.</p><button class="recruit" data-war="recruit" ${!(ownCount('werbunek')+ownCount('koszary'))||armyTotal()>=armyCapacity()?'disabled':''}>⚔ Werbuj · 10 🪵 2 ◆ 15 🌾</button><button class="recruit archer-recruit" data-war="recruitArcher" ${!(ownCount('werbunek')+ownCount('koszary'))||armyTotal()>=armyCapacity()?'disabled':''}>🏹 Werbuj łucznika · 20 🪵 3 ◆ 15 🌾</button><p class="war-hint">Łucznicy w garnizonie: ${(w.guards||[]).filter(u=>u.kind==='archer').length}. Zasięg łuku: 5 pól.</p><p class="war-hint">${w.queue.length?'Szkolenie: '+Math.ceil(w.queue[0].remaining)+' s · w kolejce '+w.queue.length:'Szkolenie: piechur 8 s, łucznik 10 s. Żołnierze są niezależni od robotników.'}</p>${typeof patrolControls==='function'?patrolControls():''}${e?`<div class="war-notice">⚔ ${e.waiting?'Oddział czeka na przejście':e.phase==='outbound'?'Wyprawa w drodze':'Powrót wojska'} · ${e.troops} żołnierzy · ${Math.ceil((e.route.length-1-e.progress)/2.6)} s${e.naval?' · transport rzeczny':''}</div>`:''}${w.raids.some(r=>!r.scout)?'<div class="war-notice danger">⚠ Najeźdźcy w drodze: '+w.raids.filter(r=>!r.scout).length+'</div>':''}${w.raids.some(r=>r.scout)?'<div class="war-notice">Zwiadowcy szukają Twojej wioski.</div>':''}${state.settled&&w.aiGrace>0&&!state.towns.some(t=>t.relation==='war')?`<div class="war-notice">🛡 Czas na obronę: ${Math.ceil(w.aiGrace)} s. Potem sąsiedzi mogą sami wypowiedzieć wojnę.</div>`:''}<small>OSADY: ${state.towns.filter(t=>t.discovered).length}/${state.towns.length} ODKRYTYCH · MOGĄ WYSYŁAĆ NAJAZDY</small>${townCards}<small>KRONIKA WIOSKI</small><div class="war-log">${w.log.length?w.log.map(m=>'<p>'+m+'</p>').join(''):'Zbuduj obronę, zwerbuj wojsko i odkryj sąsiadów.'}</div>`;
}
$('warOpen').onclick=()=>{if(typeof openKingdom==='function')$('kingdomPanel').classList.add('hidden');if(typeof openStrategy==='function')$('strategyPanel').classList.add('hidden');$('warPanel').classList.toggle('hidden');warPanelSignature='';renderWarPanel()};$('warClose').onclick=()=>$('warPanel').classList.add('hidden');
$('warPanel').onclick=e=>{const b=e.target.closest('button[data-war]');if(!b)return;const id=b.dataset.id;switch(b.dataset.war){case 'kingdom':openKingdom();break;case 'strategy':openStrategy();break;case 'recruitArcher':recruitSoldier('archer');break;case 'trade':tradeWithTown(id,b.dataset.resource,b.dataset.side);break;case 'patrol1':beginPatrol(1);break;case 'patrol2':beginPatrol(2);break;case 'recall':recallPatrol(id);break;case 'clear':clearWaypoint();break;case 'recruit':recruitSoldier();break;case 'declare':declareWar(id);break;case 'peace':makePeace(id);break;case 'attack':launchExpedition(id,state.war.soldiers);break;case 'locate':if(state.war.waypoint===id){clearWaypoint();break}state.war.waypoint=id;const t=state.towns.find(t=>t.id===id);say('Cel: '+t.name+' ('+t.x+', '+t.y+'). Złoty znacznik na minimapie wskazuje kierunek.');save();break}warPanelSignature='';renderWarPanel()};
function drawMilitaryBuilding(b,x,y){
 if(b.type.startsWith('foreign_')){const t=state.towns.find(t=>t.id===b.townId);if(!t)return true;
  if(t.fortBroken&&['foreign_keep','foreign_tower'].includes(b.type)&&typeof drawStrategyStructure==='function'){drawStrategyStructure({type:'ruiny'},x,y);return true}if(b.type==='foreign_tower'){drawMilitaryBuilding({type:'wieza'},x,y);return true}
  ctx.fillStyle='#20372955';ctx.beginPath();ctx.ellipse(x,y+12,25,10,0,0,7);ctx.fill();ctx.fillStyle=t.relation==='conquered'?'#d8c397':'#b1ab96';ctx.fillRect(x-20,y-25,40,39);ctx.fillStyle='#5d4a3c';ctx.fillRect(x-5,y-3,10,17);polygon([[x-25,y-25],[x,y-46],[x+25,y-25]],t.color);
  if(b.type==='foreign_keep'){ctx.fillStyle='#d7ccab';ctx.fillRect(x-2,y-66,3,32);polygon([[x+1,y-65],[x+25,y-61],[x+1,y-49]],t.relation==='conquered'?'#e4c46b':t.color)}return true;
 }
 if(b.type==='targ'){ctx.fillStyle='#84613c';ctx.fillRect(x-21,y-8,42,20);ctx.fillStyle='#b58b50';ctx.fillRect(x-21,y-28,4,30);ctx.fillRect(x+17,y-28,4,30);polygon([[x-26,y-26],[x,y-43],[x+26,y-26]],'#b78d55');for(let i=-20;i<20;i+=10){ctx.fillStyle=i%20?'#e8d6a4':'#a2533f';ctx.fillRect(x+i,y-26,10,10)}ctx.fillStyle='#e0c65f';ctx.fillRect(x-12,y-10,9,7);ctx.fillStyle='#9aad70';ctx.fillRect(x+3,y-10,9,7);return true}
 if(b.type==='wieza'){
  ctx.strokeStyle='#795a3a';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x-13,y+13);ctx.lineTo(x-10,y-40);ctx.moveTo(x+13,y+13);ctx.lineTo(x+10,y-40);ctx.moveTo(x-12,y+7);ctx.lineTo(x+11,y-29);ctx.moveTo(x+12,y+7);ctx.lineTo(x-11,y-29);ctx.stroke();ctx.lineWidth=1;
  ctx.fillStyle='#aa8551';ctx.fillRect(x-21,y-44,42,14);ctx.fillStyle='#d5b574';for(let i=-20;i<=16;i+=9)ctx.fillRect(x+i,y-50,5,16);polygon([[x-25,y-52],[x,y-71],[x+25,y-52]],'#5d5e44');ctx.fillStyle='#ecd2a1';ctx.beginPath();ctx.arc(x,y-47,4,0,7);ctx.fill();return true;
 }
 if(b.type==='werbunek'){
  ctx.fillStyle='#b8a17a';ctx.fillRect(x-23,y-24,46,38);polygon([[x-28,y-24],[x,y-49],[x+28,y-24]],'#6b5552');ctx.fillStyle='#4d4439';ctx.fillRect(x-7,y-7,14,21);ctx.fillStyle='#d2b86e';ctx.fillRect(x+17,y-59,2,33);polygon([[x+19,y-59],[x+38,y-54],[x+19,y-43]],'#c0a14f');ctx.font='20px serif';ctx.fillStyle='#f5e3ad';ctx.fillText('⚔',x-10,y-19);return true;
 }
 if(b.type==='port'){
  ctx.fillStyle='#a17d4f';ctx.fillRect(x-24,y-10,48,28);ctx.strokeStyle='#61492e';for(let i=-22;i<25;i+=8){ctx.beginPath();ctx.moveTo(x+i,y-10);ctx.lineTo(x+i,y+18);ctx.stroke()}
  ctx.fillStyle='#d0ba8c';ctx.fillRect(x-18,y-27,28,26);polygon([[x-23,y-27],[x-4,y-43],[x+16,y-27]],'#697b73');ctx.font='17px serif';ctx.fillText('⚓',x-11,y-6);return true;
 }
 return false;
}
function drawTrooper(x,y,color='#638bba',actor=null){
 ctx.fillStyle='#1b302c55';ctx.beginPath();ctx.ellipse(x,y+5,9,4,0,0,7);ctx.fill();ctx.fillStyle='#343d3c';if(typeof drawWalkingLegs==='function')drawWalkingLegs(x,y-2,actor,'#343d3c');else{ctx.fillRect(x-5,y-2,4,9);ctx.fillRect(x+2,y-2,4,9)}ctx.fillStyle=color;ctx.fillRect(x-7,y-18,14,17);ctx.fillStyle='#e7c999';ctx.beginPath();ctx.arc(x,y-23,6,0,7);ctx.fill();ctx.fillStyle='#afb8b1';ctx.fillRect(x-7,y-30,14,7);ctx.fillStyle='#d9c98f';ctx.fillRect(x+10,y-34,2,31);ctx.fillStyle='#c2ceca';polygon([[x+7,y-34],[x+11,y-43],[x+15,y-34]],'#d2ddd4');ctx.fillStyle='#6c543e';ctx.fillRect(x-13,y-14,9,12);
}
function drawBoat(x,y,color='#d9c99b'){
 polygon([[x-18,y-4],[x+20,y-4],[x+13,y+8],[x-12,y+8]],'#73523a');ctx.fillStyle='#d9c59c';ctx.fillRect(x-1,y-32,2,29);polygon([[x+1,y-31],[x+1,y-9],[x+16,y-9]],color);
}
// Each marker represents the full displayed force, including old saves without army actors.
function drawCampaignForce(e,count,visible,hostile=false){
 const p=routePosition(e),columns=Math.min(5,Math.ceil(Math.sqrt(count))),rows=Math.ceil(count/columns);
 for(let i=0;i<count;i++){
  const row=Math.floor(i/columns),inRow=Math.min(columns,count-row*columns),x=p.x+(i%columns-(inRow-1)/2)*28,y=p.y+(row-(rows-1)/2)*36;
  if(!visible(x,y))continue;
  const naval=terrain(Math.floor(p.x/T),Math.floor(p.y/T))==='water'&&(hostile||e.naval);
  if(naval)drawBoat(x,y,hostile?'#c58270':'#d9c99b');
  if(hostile&&i<(e.archers||0)&&typeof drawBanditArcher==='function')drawBanditArcher({x,y:y-(naval?10:0),walkSource:typeof formationWalker==='function'?formationWalker(e,i):e});
  else if(!hostile&&e.army?.[i]?.hero&&typeof drawBattleActor==='function')drawBattleActor({...e.army[i],x,y:y-(naval?10:0),walkSource:e.army[i]},'#638bba');
  else if(!hostile&&e.army?.[i]?.kind==='cavalry'&&typeof drawCavalryUnit==='function')drawCavalryUnit({x,y:y-(naval?10:0),walkSource:typeof formationWalker==='function'?formationWalker(e,i):e});
  else if(!hostile&&['crossbow','shield'].includes(e.army?.[i]?.kind)){drawBattleActor({...e.army[i],x,y:y-(naval?10:0),walkSource:typeof formationWalker==='function'?formationWalker(e,i):e},'#769caf')}
  else if(!hostile&&e.army?.[i]?.kind==='archer'&&typeof drawArcherUnit==='function')drawArcherUnit({x,y:y-(naval?10:0),walkSource:typeof formationWalker==='function'?formationWalker(e,i):e});
  else drawTrooper(x,y-(naval?10:0),hostile?'#b65e4c':e.from?'#ad8866':'#638bba',typeof formationWalker==='function'?formationWalker(e,i):null);
 }
 return {x:p.x,y:p.y-(rows-1)*18-49};
}
function drawWarWorld(){
 const visible=(x,y)=>seen.has(tileKey(Math.floor(x/T),Math.floor(y/T)));
 for(const t of state.towns)if(t.discovered&&visible((t.x+.5)*T,(t.y+.5)*T)){
  const x=(t.x+.5)*T,y=(t.y+.5)*T;ctx.font='bold 13px system-ui';ctx.textAlign='center';let text=t.name+' · '+({scouting:'szuka Twojej wioski',neutral:'pokój',war:'wojna',conquered:'twoja osada',allied:'sojusz'}[t.relation]);ctx.fillStyle='#173028e8';ctx.fillRect(x-ctx.measureText(text).width/2-9,y-92,ctx.measureText(text).width+18,23);ctx.fillStyle=t.color;ctx.fillText(text,x,y-76);ctx.textAlign='start';
  for(let i=0;i<3;i++){const gx=(t.x-1+i+.5)*T,gy=(t.y+2.5)*T;if(visible(gx,gy))drawTrooper(gx,gy,t.relation==='allied'?'#8dba84':t.relation==='conquered'?'#638bba':'#b87661')}
 }
 const office=state.buildings.find(b=>b.type==='werbunek'),w=state.war;
 if(typeof drawGarrisonCombat==='function')drawGarrisonCombat(visible);else if(office)for(let i=0;i<Math.min(w.soldiers,8);i++){const p=nearbySpot(office.x-2+i%5,office.y+1+Math.floor(i/5));if(p&&visible((p.x+.5)*T,(p.y+.5)*T))drawTrooper((p.x+.5)*T,(p.y+.5)*T)}
 for(const port of state.buildings.filter(b=>b.type==='port')){const v=[[1,0],[-1,0],[0,1],[0,-1]].find(([dx,dy])=>terrain(port.x+dx,port.y+dy)==='water');if(v){const x=(port.x+v[0]+.5)*T,y=(port.y+v[1]+.5)*T;if(visible(x,y))drawBoat(x,y+Math.sin(state.time*2)*2)}}
 if(w.expedition){const e=w.expedition,p=routePosition(e),label=drawCampaignForce(e,e.troops,visible);if(visible(p.x,p.y)){ctx.fillStyle='#f1dc9a';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText('⚔ '+e.troops,label.x,label.y);ctx.textAlign='start'}}
 for(const r of w.raids){const p=routePosition(r),label=drawCampaignForce(r,Math.ceil(r.power),visible,true);if(visible(p.x,p.y)){ctx.fillStyle='#f9bd9c';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText((r.scout?'ZWIADOWCA ':r.camp?'OBÓZ ':r.engaged?'⚔ WALKA ':r.siege&&r.progress>=r.route.length-1?'OBLĘŻENIE ':'NAJAZD ')+Math.ceil(r.power),label.x,label.y);ctx.textAlign='start';if(r.lastHit!==undefined&&state.time-r.lastHit<.3){ctx.strokeStyle='#ffe09a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y-16,19,0,7);ctx.stroke();ctx.lineWidth=1}
  for(const tower of state.buildings.filter(b=>b.type==='wieza')){const x=(tower.x+.5)*T,y=(tower.y+.5)*T;if(Math.hypot(x-p.x,y-p.y)<(tower.material==='stone'?8:6)*T){const f=(state.time*2)%1;ctx.strokeStyle='#f5dc91';ctx.beginPath();ctx.moveTo(x+(p.x-x)*f,y-40+(p.y-y+40)*f);ctx.lineTo(x+(p.x-x)*f+5,y-40+(p.y-y+40)*f+3);ctx.stroke()}}
 }}
 if(typeof drawPatrols==='function')drawPatrols();if(typeof drawStrategyWorld==='function')drawStrategyWorld();if(typeof drawKingdomWorld==='function')drawKingdomWorld();if(typeof drawAtlasTarget==='function')drawAtlasTarget();if(typeof drawFrontierWorld==='function')drawFrontierWorld();
 const waypoint=state.towns.find(t=>t.id===w.waypoint);if(waypoint){const dx=(waypoint.x+.5)*T-state.p.x,dy=(waypoint.y+.5)*T-state.p.y,a=Math.atan2(dy,dx),x=state.p.x+Math.cos(a)*95,y=state.p.y+Math.sin(a)*95;ctx.save();ctx.translate(x,y);ctx.rotate(a);polygon([[13,0],[-7,-7],[-3,0],[-7,7]],'#f0cc77');ctx.restore();ctx.fillStyle='#f6e4b8';ctx.font='11px system-ui';ctx.fillText(waypoint.name+' · '+Math.round(Math.hypot(dx,dy)/T)+' pól',x+14,y-7)}
}
function drawWarMinimap(){
 for(const t of state.towns){const x=t.x/N*170,y=t.y/N*145;mc.fillStyle=!t.discovered?'#9fa88d88':t.relation==='war'?'#e87b64':t.relation==='conquered'?'#8fbdd6':t.color;mc.fillRect(x-2,y-2,5,5);if(state.war.waypoint===t.id){mc.strokeStyle='#ffe19a';mc.strokeRect(x-5,y-5,11,11)}}
 if(state.war.expedition){const p=routePosition(state.war.expedition);mc.fillStyle='#9bc9ec';mc.fillRect(p.x/T/N*170-2,p.y/T/N*145-2,4,4)}
 for(const r of state.war.raids){const p=routePosition(r);mc.fillStyle='#fa856d';mc.fillRect(p.x/T/N*170-2,p.y/T/N*145-2,4,4)}
 for(const patrol of state.war.patrols||[])for(const u of patrol.units){mc.fillStyle='#a6dfc9';mc.fillRect(u.x/T/N*170-1,u.y/T/N*145-1,3,3)}
}
// Clicking a foreign village opens its diplomacy; construction still uses the usual controls.
const worldClickBeforeWar=c.onpointerdown;
c.onpointerdown=e=>{const p=worldPoint(e),b=foreignBuilding(Math.floor(p.x/T),Math.floor(p.y/T));if(!mode&&b){const t=state.towns.find(t=>t.id===b.townId);if(seen.has(tileKey(b.x,b.y))){discoverTown(t);$('warPanel').classList.remove('hidden');warPanelSignature='';renderWarPanel();return}}worldClickBeforeWar(e)};
ui();
