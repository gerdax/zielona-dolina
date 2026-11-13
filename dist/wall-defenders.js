'use strict';
// Wall occupancy is an explicit order; walls remain impassable to ground troops.
let wallDraft=false;
function ownWall(x,y){const b=building(x,y);return b?.material==='stone'&&['palisada','brama','brama_swoi','wieza'].includes(b.type)?b:null}
function wallHeight(b){return b?.type==='wieza'?70:['brama','brama_swoi'].includes(b?.type)?64:42}
function wallElevation(u){const s=u.wallStation;if(!s||s.phase==='approach')return 0;let h=wallHeight(ownWall(s.x,s.y));if(s.phase==='wallMove'&&s.current){const n=s.route[0]||s.current,t=Math.min(1,Math.hypot(u.x-(s.current.x+.5)*T,u.y-(s.current.y+.5)*T)/T);h=wallHeight(ownWall(s.current.x,s.current.y))*(1-t)+wallHeight(ownWall(n.x,n.y))*t}return h*(s.phase==='climbing'?s.progress:s.phase==='descending'?1-s.progress:1)}
function unitDisplayY(u){return u.y-wallElevation(u)}
function wallEntries(u,x,y){return [[0,1],[-1,0],[1,0],[0,-1]].map(([dx,dy])=>({x:x+dx,y:y+dy})).filter(p=>!ownWall(p.x,p.y)&&unitWalkable(u,p.x,p.y)&&!foreignBuilding(p.x,p.y)).sort((a,b)=>Math.hypot((a.x+.5)*T-u.x,(a.y+.5)*T-u.y)-Math.hypot((b.x+.5)*T-u.x,(b.y+.5)*T-u.y))}
function connectedWallTiles(x,y){
 if(!ownWall(x,y)||!seen.has(tileKey(x,y)))return [];
 const out=[{x,y}],visited=new Set([tileKey(x,y)]);
 for(let i=0;i<out.length&&out.length<256;i++)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const p={x:out[i].x+dx,y:out[i].y+dy},key=tileKey(p.x,p.y);if(!visited.has(key)&&seen.has(key)&&ownWall(p.x,p.y)){visited.add(key);out.push(p);if(out.length>=256)break}}
 return out;
}
function wallRoute(from,to){
 const queue=[{x:from.x,y:from.y}],parents=new Map([[tileKey(from.x,from.y),null]]);
 for(let i=0;i<queue.length&&i<256;i++){const p=queue[i];if(p.x===to.x&&p.y===to.y){const route=[];let n=p;while(n){route.push(n);n=parents.get(tileKey(n.x,n.y))}return route.reverse().slice(1)}for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const n={x:p.x+dx,y:p.y+dy},key=tileKey(n.x,n.y);if(!parents.has(key)&&ownWall(n.x,n.y)&&seen.has(key)){parents.set(key,p);queue.push(n)}}}return null;
}
function beginWallCommand(){
 let units=selectedActors();if(!units.length){ensureUnitIds();selectedUnits=new Set(state.war.guards.filter(u=>isRangedUnit(u)&&u.hp>0).slice(0,10).map(u=>u.uid));units=selectedActors()}
 if(!units.some(u=>isRangedUnit(u)&&u.hp>0)){say('Na mur mogą wejść tylko łucznicy i kusznicy. Zaznacz ich najpierw.');return false}
 cancelPatrolDraft();cancelNavalOrder();cancelSelectionDrag();setMode(null);commandDraft=null;defenseDraft=false;wallDraft=true;showCommandBar();say('Na mur: kliknij własny kamienny mur, bramę lub wieżę. Jedno stanowisko na pole. Esc anuluje.');return true;
}
function assignWallDefenders(x,y){
 const tiles=connectedWallTiles(x,y);if(!tiles.length){say('Wskaż odkryty własny kamienny mur, bramę lub wieżę.');return false}
 const units=selectedActors().filter(u=>isRangedUnit(u)&&u.hp>0).slice(0,10),reserved=new Set(selectableUnits().filter(u=>u.hp>0&&u.wallStation).map(u=>tileKey(u.wallStation.x,u.wallStation.y))),assignments=[];
 for(const u of units){
  // Reassign an occupied wall via a connected walkway, never by teleporting.
  if(u.wallStation&&u.wallStation.phase!=='onWall'){continue}
  const oldKey=u.wallStation&&tileKey(u.wallStation.x,u.wallStation.y);if(oldKey)reserved.delete(oldKey);let assigned=false;
  for(const tile of tiles){const key=tileKey(tile.x,tile.y);if(reserved.has(key))continue;
   const entries=wallEntries(u,tile.x,tile.y),route=u.wallStation?wallRoute(u.wallStation,tile):null;
   if(u.wallStation&&!route||!u.wallStation&&!entries.length)continue;
   assignments.push({u,tile,entries,route});reserved.add(key);assigned=true;break;
  }
  if(!assigned&&oldKey)reserved.add(oldKey);
 }
 if(!assignments.length){say('Brak wolnych stanowisk lub dostępnego wejścia na ten odcinek muru.');return false}
 takeFieldCommand(assignments.map(a=>a.u));
 for(const {u,tile,entries,route} of assignments){const old=u.wallStation;delete u.order;delete u.defensePost;delete u.hospitalRetreat;resetDefenseRoute(u);u.wallStation={x:tile.x,y:tile.y,phase:old?'wallMove':'approach',entries,entry:old?.entry||entries[0],entryIndex:0,progress:0,route:route||[]};if(old){u.wallStation.current={x:Math.floor(u.x/T),y:Math.floor(u.y/T)}}}
 wallDraft=false;commandDraft=null;save();showCommandBar();say('Na mur wysłano: '+assignments.length+' łuczników i kuszników.');return true;
}
function leaveWall(u,keepOrder=false){
 const s=u.wallStation;if(!s)return false;if(!keepOrder)delete u.order;
 if(s.returningFromBlockedExit){s.leaveRequested=true;return true}
 if(s.phase==='approach'){delete u.wallStation;resetDefenseRoute(u);return true}
 if(s.phase==='descending')return true;
 if(s.phase==='climbing'){s.phase='descending';s.progress=1-s.progress;resetDefenseRoute(u);return true}
 const tile=s.phase==='wallMove'?(s.current||{x:Math.floor(u.x/T),y:Math.floor(u.y/T)}):s;
 const entry=wallEntries(u,tile.x,tile.y)[0];if(!entry){u.blocked=true;s.noExit=true;s.leaveRequested=true;return false}
 s.x=tile.x;s.y=tile.y;s.entry=entry;s.phase='descending';s.progress=0;s.noExit=false;s.leaveRequested=false;s.from={x:u.x,y:u.y};resetDefenseRoute(u);return true;
}
function descendSelected(){let count=0;for(const u of selectedActors())if(u.wallStation&&leaveWall(u))count++;wallDraft=false;save();showCommandBar();say(count?'Zejście z muru: '+count+' żołnierzy.':'Brak zaznaczonych żołnierzy na murze lub wolnego zejścia.');return count}
function dropFromBrokenWall(u){
 const s=u.wallStation;let landing=unitWalkable(u,Math.floor(u.x/T),Math.floor(u.y/T))?{x:Math.floor(u.x/T),y:Math.floor(u.y/T)}:null;
 for(let r=0;r<=4&&!landing;r++)for(let dx=-r;dx<=r&&!landing;dx++)for(let dy=-r;dy<=r&&!landing;dy++){const x=s.x+dx,y=s.y+dy;if(!ownWall(x,y)&&unitWalkable(u,x,y))landing={x,y}}
 if(!landing){u.blocked=true;return true}
 u.x=(landing.x+.5)*T;u.y=(landing.y+.5)*T;u.home=landing;delete u.wallStation;delete u.order;delete u.defensePost;resetDefenseRoute(u);save();return true;
}
function wallShoot(u,dt){
 u.fighting=false;u.healing=false;u.attackCooldown=Math.max(0,(u.attackCooldown||0)-dt);
 const range=soldierRange(u)*T,targets=state.war.raids.filter(r=>r.power>0&&(!u.order?.raidTownId||r.townId===u.order.raidTownId)).map(r=>({r,p:routePosition(r)})).filter(({p})=>Math.hypot(p.x-u.x,p.y-u.y)<=range&&arrowClearLine(u,p)).sort((a,b)=>typeof compareDefenseTargets==='function'?compareDefenseTargets(u,a,b):Math.hypot(a.p.x-u.x,a.p.y-u.y)-Math.hypot(b.p.x-u.x,b.p.y-u.y));
 const t=u.order?.townId&&state.towns.find(t=>t.id===u.order.townId&&t.relation==='war'),townPoint=t&&{x:(t.x+.5)*T,y:(t.y+.5)*T},target=targets[0],p=target?.p||(townPoint&&Math.hypot(townPoint.x-u.x,townPoint.y-u.y)<=range&&arrowClearLine(u,townPoint)?townPoint:null);
 if(!p){healDefender(u,dt);return}
 u.fighting=true;u.restTime=0;u.aimX=p.x;u.aimY=p.y;
 if(u.attackCooldown<=0){u.attackCooldown=soldierRangedCooldown(u);u.attackUntil=state.time+.4;u.shot={x:u.x,y:unitDisplayY(u)-16,tx:p.x,ty:p.y-16,time:state.time};const damage=soldierDamage(u);if(target){target.r.power=Math.max(0,target.r.power-damage);target.r.lastHit=state.time}else{t.power=Math.max(0,t.power-damage);if(!t.power)conquerWithOrders(t)}recordHeroHit(u)}
}
function processWallDefender(u,dt){
 const s=u.wallStation;if(!s||u.hp<=0)return false;
 if(!isRangedUnit(u)||!ownWall(s.x,s.y)||s.phase==='wallMove'&&!ownWall(Math.floor(u.x/T),Math.floor(u.y/T)))return dropFromBrokenWall(u);
 if(!s.returningFromBlockedExit&&villageDefense().autoRetreat&&u.hp<=3&&state.buildings.some(b=>b.type==='szpital'))leaveWall(u);
 if(s.leaveRequested&&!s.returningFromBlockedExit)leaveWall(u,true);
 if(!u.wallStation)return false;
 u.fighting=false;
 if(s.phase==='approach'){
  if(!s.entry||!unitWalkable(u,s.entry.x,s.entry.y)||ownWall(s.entry.x,s.entry.y)){s.entries=wallEntries(u,s.x,s.y);s.entry=s.entries[0];s.entryIndex=0;resetDefenseRoute(u);if(!s.entry){u.blocked=true;return true}}
  if(stepOrder(u,s.entry,dt)){s.phase='climbing';s.progress=0;resetDefenseRoute(u)}else if(u.blocked&&u.orderRetry>0&&s.entryIndex+1<s.entries.length){s.entry=s.entries[++s.entryIndex];resetDefenseRoute(u)}healDefender(u,dt);return true;
 }
 if(s.phase==='climbing'||s.phase==='descending'){
  const down=s.phase==='descending';
  if(down&&!unitWalkable(u,s.entry.x,s.entry.y)){
   // Reverse along the same ladder, then pick a new exit from the wall top.
   s.returnTop=s.from||{x:(s.x+.5)*T,y:(s.y+.5)*T};s.phase='climbing';s.progress=1-s.progress;s.returningFromBlockedExit=true;s.leaveRequested=true;u.blocked=true;save();return true;
  }
  s.progress=Math.min(1,s.progress+dt/.7);const t=s.progress,entry={x:(s.entry.x+.5)*T,y:(s.entry.y+.5)*T},top=down?(s.from||{x:(s.x+.5)*T,y:(s.y+.5)*T}):(s.returnTop||{x:(s.x+.5)*T,y:(s.y+.5)*T}),a=down?top:entry,b=down?entry:top;
  u.x=a.x+(b.x-a.x)*t;u.y=a.y+(b.y-a.y)*t;healDefender(u,dt);
  if(t>=1){if(down){u.home={...s.entry};delete u.wallStation;resetDefenseRoute(u)}else{s.phase='onWall';u.home={...s.entry};if(s.returningFromBlockedExit){delete s.returningFromBlockedExit;delete s.returnTop;s.leaveRequested=true;u.blocked=false}}save()}return true;
 }
 if(s.phase==='wallMove'){
  const next=s.route[0];if(!next){s.phase='onWall';u.x=(s.x+.5)*T;u.y=(s.y+.5)*T;save();return true}
  if(!ownWall(next.x,next.y)){u.blocked=true;return true}
  const dx=(next.x+.5)*T-u.x,dy=(next.y+.5)*T-u.y,d=Math.hypot(dx,dy),step=65*dt;
  if(d<=step){u.x=(next.x+.5)*T;u.y=(next.y+.5)*T;s.current={...next};s.route.shift()}else{u.x+=dx/d*step;u.y+=dy/d*step}healDefender(u,dt);return true;
 }
 wallShoot(u,dt);return true;
}
const wallOrder=handleUnitOrder;handleUnitOrder=function(u,dt){if(processWallDefender(u,dt))return true;return wallOrder(u,dt)};
const wallIssue=issueMapCommand;issueMapCommand=function(x,y){const kind=commandDraft,units=selectedActors().slice(),prior=units.map(u=>u.order),ok=wallIssue(x,y);let changed=false;if(ok)for(let i=0;i<units.length;i++){const u=units[i];if(u.wallStation&&u.order&&u.order!==prior[i]&&(kind==='move'||u.wallStation.phase!=='onWall')){leaveWall(u,true);changed=true}}if(changed)save();return ok};
const wallStop=clearCommands;clearCommands=function(){const units=selectedActors().slice();wallStop();for(const u of units)if(u.wallStation&&u.wallStation.phase!=='onWall')leaveWall(u);wallDraft=false;save()};
const wallPointer=c.onpointerdown;c.onpointerdown=e=>{if(wallDraft&&(!e.button||e.button===0)){const p=worldPoint(e);assignWallDefenders(Math.floor(p.x/T),Math.floor(p.y/T));return}if(!mode&&!commandDraft&&!patrolDraft&&!navalDraft&&!defenseDraft){const p=worldPoint(e);if(selectableUnits().some(u=>wallElevation(u)>0&&Math.hypot(u.x-p.x,unitDisplayY(u)-14-p.y)<22)){villageDown(e);return}}wallPointer(e)};
const wallMode=setMode;setMode=function(type){wallDraft=false;return wallMode(type)};
const wallArm=armCommand;armCommand=function(kind){wallDraft=false;return wallArm(kind)};
const wallCancel=cancelCommand;cancelCommand=function(){wallDraft=false;return wallCancel()};
const wallDefensePoint=beginDefensePoint;beginDefensePoint=function(){wallDraft=false;return wallDefensePoint()};$('defensePoint').onclick=()=>beginDefensePoint();
const wallBar=showCommandBar;showCommandBar=function(){wallBar();if(wallDraft){$('commandBar').style.display='flex';$('commandStatus').textContent='Na mur: wskaż własny kamienny mur · Esc anuluje'}};
window.addEventListener('keydown',e=>{if(e.key==='Escape'){wallDraft=false;showCommandBar()}});
for(const [id,label,action] of [['wallMount','🏹 Na mur',beginWallCommand],['wallDismount','⇩ Zejdź z muru',descendSelected]]){const b=document.createElement('button');b.id=id;b.textContent=label;b.onclick=action;$('clockControls').append(b)}
const wallActor=drawBattleActor;drawBattleActor=function(u,color){const h=wallElevation(u);wallActor(h?{...u,y:u.y-h,walkSource:u}:u,color);if(h){ctx.save();ctx.fillStyle=u.blocked?'#f3b59c':'#d6ebc4';ctx.font='bold 10px system-ui';ctx.fillText(u.wallStation?.noExit?'BRAK ZEJŚCIA':'NA MURZE',u.x-25,u.y-h+24);ctx.restore()}};
const wallWorld=drawStrategyWorld;drawStrategyWorld=function(){wallWorld();ctx.save();for(const u of selectedActors()){const s=u.wallStation;if(!s||!['climbing','descending'].includes(s.phase))continue;const x=(s.x+.5)*T,y=(s.y+.5)*T,h=wallHeight(ownWall(s.x,s.y));ctx.strokeStyle='#caa779';ctx.lineWidth=2;for(const dx of [-7,7]){ctx.beginPath();ctx.moveTo(x+dx,y);ctx.lineTo(x+dx,y-h);ctx.stroke()}for(let z=0;z<h;z+=7){ctx.beginPath();ctx.moveTo(x-7,y-z);ctx.lineTo(x+7,y-z);ctx.stroke()}}ctx.restore()};
