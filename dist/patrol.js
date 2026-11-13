'use strict';
function initPatrols(){state.war.patrols??=[];state.war.guards??=[];state.war.nextPatrolId??=1}
initPatrols();
let patrolDraft=null;
function patrolCount(){return (state.war.patrols||[]).reduce((n,p)=>n+p.units.length,0)}
function patrolDefenders(){const o=villageOrigin();return (state.war.patrols||[]).reduce((n,p)=>n+p.units.filter(u=>Math.hypot(u.x/T-o.x,u.y/T-o.y)<9).length,0)}
function loseDefenders(count){if(typeof strategyLoseDefenders==='function'){strategyLoseDefenders(count);return}let lost=Math.min(count,state.war.soldiers);state.war.soldiers-=lost;count-=lost;const o=villageOrigin();for(const p of state.war.patrols||[])for(let i=p.units.length-1;i>=0&&count>0;i--)if(Math.hypot(p.units[i].x/T-o.x,p.units[i].y/T-o.y)<9){p.units.splice(i,1);count--}state.war.patrols=(state.war.patrols||[]).filter(p=>p.units.length)}
function beginPatrol(count){
 if(![1,2].includes(count)||state.war.soldiers<count){say('Potrzebujesz '+count+' wolnych żołnierzy w garnizonie.');return false}
 if(!state.settled){say('Najpierw załóż wioskę.');return false}
 if(typeof cancelNavalOrder==='function')cancelNavalOrder();if(typeof cancelCommand==='function')cancelCommand();setMode(null);patrolDraft={count,points:[]};$('warPanel').classList.add('hidden');showPatrolDraft();say('Kliknij pierwszy punkt patrolu na odkrytym terenie.');return true;
}
function showPatrolDraft(){const bar=$('patrolDraft');bar.style.display=patrolDraft?'flex':'none';if(patrolDraft)$('patrolDraftText').textContent='Patrol: '+patrolDraft.count+' '+(patrolDraft.count===1?'żołnierz':'żołnierzy')+' · wskaż punkt '+(patrolDraft.points.length?'B':'A')}
function cancelPatrolDraft(){patrolDraft=null;showPatrolDraft()}
function choosePatrolPoint(x,y){
 if(!patrolDraft)return false;
 const o=villageOrigin();if(!seen.has(tileKey(x,y))||Math.hypot(x-o.x,y-o.y)>300){say('Wybierz odkryte pole do 300 pól od wioski.');return false}
 if(blocked((x+.5)*T,(y+.5)*T)||foreignBuilding(x,y)){say('Patrol potrzebuje dostępnego pola. Otwórz bramę lub wybierz ląd albo most.');return false}
 if(!patrolDraft.points.length){patrolDraft.points.push({x,y});showPatrolDraft();say('Teraz wskaż drugi punkt — B.');return true}
 const a=patrolDraft.points[0];if(a.x===x&&a.y===y){say('Punkt B musi być w innym miejscu.');return false}
 const b={x,y},office=state.buildings.find(b=>b.type==='werbunek'),start=nearbySpot(office?.x??o.x,(office?.y??o.y)+1);if(!start){say('Brak wyjścia z garnizonu.');return false}
 const origin={x:(start.x+.5)*T,y:(start.y+.5)*T};
 if(findRoute(origin,a,true)===null||findRoute({x:(a.x+.5)*T,y:(a.y+.5)*T},b,true)===null){say('Brak drogi między punktami. Otwórz bramy i sprawdź mosty.');return false}
 const count=patrolDraft.count;if(state.war.soldiers<count){say('Brakuje wolnych żołnierzy.');cancelPatrolDraft();return false}
 syncGarrisonActors();const assigned=state.war.guards.splice(-count,count);
 const p={id:'patrol-'+state.war.nextPatrolId++,a,b,units:Array.from({length:count},(_,i)=>({...assigned[i],order:undefined,x:assigned[i]?.x??origin.x,y:assigned[i]?.y??origin.y,hp:assigned[i]?.hp??8,kind:assigned[i]?.kind||'melee',restTime:assigned[i]?.restTime??0,path:[],goal:'a',wait:i*.8,blocked:false}))};
 state.war.soldiers-=count;state.war.patrols.push(p);cancelPatrolDraft();warLog('Wyznaczono patrol '+count+' żołnierzy między A ('+a.x+', '+a.y+') i B ('+b.x+', '+b.y+').');ui();save();return true;
}
function recallPatrol(id){const p=state.war.patrols.find(p=>p.id===id);if(!p)return false;syncGarrisonActors();const office=state.buildings.find(b=>b.type==='werbunek')||villageOrigin();for(const u of p.units)state.war.guards.push({...u,path:[],home:nearbySpot(office.x,office.y+1)||villageOrigin()});state.war.soldiers+=p.units.length;state.war.patrols=state.war.patrols.filter(p=>p.id!==id);warLog('Odwołano patrol — '+p.units.length+' żołnierzy dostępnych w garnizonie.');ui();save();return true}
function healDefender(u,dt){
 u.hp??=8;u.healing=false;if(u.hp<=0||u.fighting)return;
 const before=Math.max(0,u.restTime||0);u.restTime=before+dt;
 const seconds=Math.max(0,u.restTime-6)-Math.max(0,before-6);
 if(seconds>0&&u.hp<8){u.hp=Math.min(8,u.hp+seconds*.5);u.healing=true}
}
function battleClearLine(a,b){const d=Math.hypot(b.x-a.x,b.y-a.y),steps=Math.max(1,Math.ceil(d/10));for(let i=0;i<=steps;i++){const x=a.x+(b.x-a.x)*i/steps,y=a.y+(b.y-a.y)*i/steps;if(blocked(x,y)||natural(Math.floor(x/T),Math.floor(y/T)))return false}return true}
function arrowClearLine(a,b){const d=Math.hypot(b.x-a.x,b.y-a.y),n=Math.max(1,Math.ceil(d/12));for(let i=1;i<n;i++){const x=a.x+(b.x-a.x)*i/n,y=a.y+(b.y-a.y)*i/n;if(terrain(Math.floor(x/T),Math.floor(y/T))==='edge'||natural(Math.floor(x/T),Math.floor(y/T)))return false}return true}
function moveDefender(u,point,dt){const dx=point.x-u.x,dy=point.y-u.y,d=Math.hypot(dx,dy),step=96*(typeof mountedSpeed==='function'?mountedSpeed(u):1)*pathSpeed(u.x,u.y)*dt;if(blocked(point.x,point.y))return false;if(d<=step){u.x=point.x;u.y=point.y;return true}u.x+=dx/d*step;u.y+=dy/d*step;return false}
const defenderRouteCache=new WeakMap();
function cachedDefenderStep(u,goal,dt,purpose='combat'){
 let cache=defenderRouteCache.get(u);if(!cache){cache={};defenderRouteCache.set(u,cache)}
 let entry=cache[purpose],key=goal.x+','+goal.y;
 if(entry)entry.retry-=dt;
 if(!entry||entry.key!==key||(!entry.pending&&!entry.path?.length&&entry.retry<=0)){entry={key,retry:.6,path:null,pending:typeof planUnitRoute==='function'};cache[purpose]=entry;if(!entry.pending)entry.path=findRoute(u,goal)}
 if(entry.pending){const path=planUnitRoute(u,goal);if(path===undefined)return true;entry.path=path;entry.pending=false;entry.retry=.6}if(!entry.path?.length)return false;
 while(entry.path.length&&Math.hypot(entry.path[0].x-u.x,entry.path[0].y-u.y)<1)entry.path.shift();
 const next=entry.path[0];if(!next)return false;
 if(!unitWalkable(u,Math.floor(next.x/T),Math.floor(next.y/T))){entry.path=null;return false}
 const arrived=moveDefender(u,next,dt);if(arrived)entry.path.shift();return true;
}
function defendActor(u,dt){
 u.hp??=8;u.fighting=false;u.healing=false;u.attackCooldown=Math.max(0,(u.attackCooldown||0)-dt);
 const candidates=state.war.raids.filter(r=>r.power>0&&(!u.order?.raidTownId||r.townId===u.order.raidTownId)).map(r=>({r,p:routePosition(r)})).filter(({p})=>(typeof withinDefensePost!=='function'||withinDefensePost(u,p))&&Math.hypot(p.x-u.x,p.y-u.y)<(isRangedUnit(u)?soldierRange(u)+1:6)*T&&(isRangedUnit(u)||unitWalkable(u,Math.floor(p.x/T),Math.floor(p.y/T)))).sort((a,b)=>typeof compareDefenseTargets==='function'?compareDefenseTargets(u,a,b):Math.hypot(a.p.x-u.x,a.p.y-u.y)-Math.hypot(b.p.x-u.x,b.p.y-u.y));
 for(const {r,p} of candidates){const d=Math.hypot(p.x-u.x,p.y-u.y);
  if(isRangedUnit(u)&&d<=soldierRange(u)*T&&arrowClearLine(u,p)){
   u.fighting=true;u.restTime=0;u.path=[];u.aimX=p.x;u.aimY=p.y;if(d<1.15*T)r.engaged=true;
   if(u.attackCooldown<=0){u.attackCooldown=soldierRangedCooldown(u);u.attackUntil=state.time+.4;u.shot={x:u.x,y:u.y-16,tx:p.x,ty:p.y-16,time:state.time};r.power=Math.max(0,r.power-(typeof soldierDamage==='function'?soldierDamage(u):2));r.lastHit=state.time;if(typeof recordHeroHit==='function')recordHeroHit(u);if(d<1.15*T)u.hp=Math.max(0,u.hp-(typeof armorDamage==='function'?armorDamage(1.25,u):1.25))}return true;
  }
  if(d<1.15*T&&battleClearLine(u,p)){
   u.fighting=true;u.restTime=0;u.path=[];u.aimX=p.x;u.aimY=p.y;r.engaged=true;
   if(u.attackCooldown<=0){u.attackCooldown=.8;u.attackUntil=state.time+.3;r.power=Math.max(0,r.power-(typeof soldierDamage==='function'?soldierDamage(u):2));r.lastHit=state.time;if(typeof recordHeroHit==='function')recordHeroHit(u);u.hp=Math.max(0,u.hp-(typeof armorDamage==='function'?armorDamage(1.25,u):1.25))}return true;
  }
  if(cachedDefenderStep(u,{x:Math.floor(p.x/T),y:Math.floor(p.y/T)},dt)){u.fighting=true;u.restTime=0;u.path=[];u.aimX=p.x;u.aimY=p.y;return true}
 }return false;
}
function syncGarrisonActors(){
 const w=state.war;w.guards??=[];while(w.guards.length>w.soldiers)w.guards.pop();const o=state.buildings.find(b=>b.type==='werbunek')||villageOrigin();while(w.guards.length<w.soldiers){const i=w.guards.length,p=nearbySpot(o.x-2+i%5,o.y+1+Math.floor(i/5))||villageOrigin();w.guards.push({x:(p.x+.5)*T,y:(p.y+.5)*T,home:p,hp:8,path:[]})}
}
function updateGarrisonCombat(dt){
 syncGarrisonActors();const w=state.war;for(let i=w.guards.length-1;i>=0;i--){const u=w.guards[i];if((typeof handleUnitOrder==='function'&&handleUnitOrder(u,dt))||defendActor(u,dt)){if(u.hp<=0){w.guards.splice(i,1);w.soldiers--;warLog('Żołnierz garnizonu poległ podczas obrony.');save()}continue}healDefender(u,dt);
  if(u.home&&Math.hypot((u.home.x+.5)*T-u.x,(u.home.y+.5)*T-u.y)>3){cachedDefenderStep(u,u.home,dt,'home')}
 }
}
function updatePatrols(dt){
 for(const p of state.war.patrols){for(let i=p.units.length-1;i>=0;i--){const u=p.units[i];
  // A waiting or resting guard must still react to an approaching enemy.
  if(defendActor(u,dt)){if(u.hp<=0){p.units.splice(i,1);warLog('Żołnierz patrolu poległ podczas walki.');save()}continue}healDefender(u,dt);
  if(u.wait>0){u.wait-=dt;continue}
  if(!u.path.length){const goal=p[u.goal];if(Math.hypot((goal.x+.5)*T-u.x,(goal.y+.5)*T-u.y)<2){u.goal=u.goal==='a'?'b':'a';u.wait=1;continue}const path=typeof planUnitRoute==='function'?planUnitRoute(u,goal,true):findRoute(u,goal,true);if(path===undefined)continue;if(path===null){u.blocked=true;u.wait=2;continue}u.blocked=false;u.path=path}
  const next=u.path[0];if(!next)continue;if(!unitWalkable(u,Math.floor(next.x/T),Math.floor(next.y/T))){u.path=[];u.wait=.4;u.blocked=true;continue}
  const dx=next.x-u.x,dy=next.y-u.y,d=Math.hypot(dx,dy),step=78*(typeof mountedSpeed==='function'?mountedSpeed(u):1)*pathSpeed(u.x,u.y)*dt;if(d<=step){u.x=next.x;u.y=next.y;u.path.shift()}else{u.x+=dx/d*step;u.y+=dy/d*step}
  for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){const x=Math.floor(u.x/T)+a,y=Math.floor(u.y/T)+b;if(x>=0&&y>=0&&x<N&&y<N)seen.add(tileKey(x,y))}
 }}state.war.patrols=state.war.patrols.filter(p=>p.units.length);
}
function drawArcherUnit(u){const x=u.x,y=u.y;ctx.fillStyle='#20332866';ctx.beginPath();ctx.ellipse(x,y+5,9,4,0,0,7);ctx.fill();ctx.fillStyle='#4b4436';if(typeof drawWalkingLegs==='function')drawWalkingLegs(x,y-2,u.walkSource||u,'#4b4436');else{ctx.fillRect(x-5,y-2,4,9);ctx.fillRect(x+2,y-2,4,9)}ctx.fillStyle='#7d9955';ctx.fillRect(x-7,y-18,14,17);ctx.fillStyle='#ebc899';ctx.beginPath();ctx.arc(x,y-23,6,0,7);ctx.fill();ctx.fillStyle='#536b3f';polygon([[x-9,y-25],[x,y-35],[x+8,y-25]],'#536b3f');ctx.strokeStyle='#cba46a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+9,y-15,10,-Math.PI/2,Math.PI/2);ctx.stroke();ctx.strokeStyle='#e4d4ac';ctx.beginPath();ctx.moveTo(x+9,y-25);ctx.lineTo(x+9,y-5);ctx.stroke();ctx.lineWidth=1;}
function drawBattleActor(u,color){if(u.kind==='cavalry'&&typeof drawCavalryUnit==='function')drawCavalryUnit(u);else if(u.kind==='crossbow'&&typeof drawCrossbowUnit==='function')drawCrossbowUnit(u);else if(isRangedUnit(u))drawArcherUnit(u);else drawTrooper(u.x,u.y,color,u);if(u.healing){ctx.fillStyle='#c1efaa';ctx.font='bold 10px system-ui';ctx.fillText('+ LECZENIE',u.x-25,u.y+19)}if(u.fighting){ctx.fillStyle='#f4d384';ctx.font='bold 10px system-ui';ctx.fillText('⚔ WALKA',u.x-21,u.y-48)}if(isRangedUnit(u)&&u.shot&&state.time-u.shot.time<.4){const s=u.shot,f=Math.max(0,Math.min(1,(state.time-s.time)/.4)),x=s.x+(s.tx-s.x)*f,y=s.y+(s.ty-s.y)*f,a=Math.atan2(s.ty-s.y,s.tx-s.x);ctx.strokeStyle='#ffe1a2';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-Math.cos(a)*9,y-Math.sin(a)*9);ctx.lineTo(x+Math.cos(a)*4,y+Math.sin(a)*4);ctx.stroke();ctx.lineWidth=1}else if(!isRangedUnit(u)&&u.attackUntil>state.time){const a=Math.atan2(u.aimY-u.y,u.aimX-u.x);ctx.strokeStyle='#ffe19c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(u.x+Math.cos(a)*9,u.y-10+Math.sin(a)*9);ctx.lineTo(u.x+Math.cos(a)*30,u.y-10+Math.sin(a)*30);ctx.stroke();ctx.lineWidth=1}if((u.hp??8)<8||u.healing){ctx.fillStyle='#4c322b';ctx.fillRect(u.x-12,u.y-40,24,4);ctx.fillStyle='#bdd98c';ctx.fillRect(u.x-12,u.y-40,24*Math.max(0,u.hp)/8,4)}}
function drawGarrisonCombat(visible){syncGarrisonActors();for(const u of state.war.guards)if(visible(u.x,u.y))drawBattleActor(u,'#638bba')}
function patrolControls(){const w=state.war;return `<section class="patrol-controls"><small>PATROLE WIOSKI · ${patrolCount()} ŻOŁNIERZY</small><div class="war-actions"><button data-war="patrol1" ${w.soldiers<1?'disabled':''}>Patrol · 1 żołnierz</button><button data-war="patrol2" ${w.soldiers<2?'disabled':''}>Patrol · 2 żołnierzy</button></div><p class="war-hint">Wybierz liczebność, a potem kliknij odkryte punkty A i B do 300 pól od wioski. Patrol preferuje ścieżki, osłabia pobliskich najeźdźców i wspiera obronę wioski. Ranni żołnierze leczą się po 6 s bez walki: +1 punkt zdrowia co 2 s, do 8 punktów. Nie wyrusza na wyprawy.</p>${w.patrols.map((p,i)=>`<div class="patrol-row"><span>Patrol ${i+1}: ${p.units.length} · ${p.units.some(u=>u.blocked)?'czeka na przejście':'A ↔ B'}</span><button data-war="recall" data-id="${p.id}">Odwołaj</button></div>`).join('')}</section>`}
function drawPatrols(){
 ctx.save();ctx.strokeStyle='#d6ce8666';ctx.lineWidth=2;ctx.setLineDash([5,7]);
 for(const p of state.war.patrols){if(seen.has(tileKey(p.a.x,p.a.y))){ctx.beginPath();ctx.moveTo((p.a.x+.5)*T,(p.a.y+.5)*T);ctx.lineTo((p.b.x+.5)*T,(p.b.y+.5)*T);ctx.stroke();for(const [label,point] of [['A',p.a],['B',p.b]]){ctx.fillStyle='#f1dfa1';ctx.font='bold 11px system-ui';ctx.fillText(label,(point.x+.5)*T+8,(point.y+.5)*T-9)}}for(const u of p.units)if(seen.has(tileKey(Math.floor(u.x/T),Math.floor(u.y/T)))){drawBattleActor(u,'#688f93');ctx.fillStyle='#f0dfa7';ctx.font='9px system-ui';if(!u.fighting)ctx.fillText('PATROL',u.x-17,u.y-47)}}
 if(patrolDraft?.points.length){const p=patrolDraft.points[0];ctx.fillStyle='#f3da81';ctx.beginPath();ctx.arc((p.x+.5)*T,(p.y+.5)*T,10,0,7);ctx.fill();ctx.fillStyle='#263e30';ctx.font='bold 12px system-ui';ctx.fillText('A',(p.x+.5)*T-4,(p.y+.5)*T+4)}ctx.restore();
}
$('patrolCancel').onclick=cancelPatrolDraft;
window.addEventListener('keydown',e=>{if(e.key==='Escape')cancelPatrolDraft()});
const worldClickBeforePatrol=c.onpointerdown;
c.onpointerdown=e=>{if(patrolDraft){if(mode){cancelPatrolDraft();worldClickBeforePatrol(e);return}const p=worldPoint(e);choosePatrolPoint(Math.floor(p.x/T),Math.floor(p.y/T));return}worldClickBeforePatrol(e)};
ui();
