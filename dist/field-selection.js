'use strict';
function expeditionActors(){
 const e=state.war.expedition;if(!e||!e.troops)return [];
 const p=routePosition(e);if(e.naval&&terrain(Math.floor(p.x/T),Math.floor(p.y/T))==='water')return [];
 e.army??=[];while(e.army.length<e.troops)e.army.push({hp:8,kind:'melee',path:[]});
 const columns=Math.min(5,Math.ceil(Math.sqrt(e.troops))),rows=Math.ceil(e.troops/columns);
 return e.army.slice(0,e.troops).map((u,i)=>{const row=Math.floor(i/columns),inRow=Math.min(columns,e.troops-row*columns);u.x=p.x+(i%columns-(inRow-1)/2)*28;u.y=p.y+(row-(rows-1)/2)*36;u.uid??='unit-'+state.war.nextUnitId++;u.hp??=8;return u});
}
const fieldSelectable=selectableUnits;selectableUnits=function(){const patrols=(state.war.patrols||[]).flatMap(p=>p.units);for(const u of patrols)u.uid??='unit-'+state.war.nextUnitId++;return [...fieldSelectable(),...patrols,...expeditionActors()]};
function takeFieldCommand(units){
 const w=state.war,wanted=new Set(units),moved=[];
 const e=w.expedition;if(e){const away=(e.army||[]).filter(u=>wanted.has(u));e.army=(e.army||[]).filter(u=>!wanted.has(u));e.troops-=away.length;moved.push(...away);if(e.troops<=0){if(e.loot){state.gold+=e.loot.gold||0;state.wood+=e.loot.wood||0;state.stone+=e.loot.stone||0}w.expedition=null;}}
 for(const p of w.patrols||[]){moved.push(...p.units.filter(u=>wanted.has(u)));p.units=p.units.filter(u=>!wanted.has(u))}w.patrols=(w.patrols||[]).filter(p=>p.units.length);
 for(const u of moved){u.home={x:Math.floor(u.x/T),y:Math.floor(u.y/T)};delete u.goal;u.wait=0;cancelUnitRoute(u);w.guards.push(u);w.soldiers++}
 if(moved.length)save();return moved.length;
}
const fieldIssue=issueMapCommand;issueMapCommand=function(x,y){const units=selectedActors();const result=fieldIssue(x,y);if(result)takeFieldCommand(units.filter(u=>u.order));return result};
const fieldStop=clearCommands;clearCommands=function(){takeFieldCommand(selectedActors());return fieldStop()};
