'use strict';
// Civilians use short, cached routes inside their camp. No global NPC pathfinding.
const orcCivilianCache=new Map();
let orcCivilianLayout=null;
function orcCivilianRoute(town,start,goal){
 const allowed=(x,y)=>Math.abs(x-town.x)<5&&Math.abs(y-town.y)<5&&!building(x,y)&&!natural(x,y)&&!foreignBuilding(x,y)&&!orcWallBlocked(x,y)&&['grass','sand'].includes(terrain(x,y));
 const queue=[start],parents=new Map([[tileKey(start.x,start.y),null]]);let found=null;
 for(let i=0;i<queue.length;i++){const p=queue[i];if(Math.abs(p.x-goal.x)+Math.abs(p.y-goal.y)===1){found=p;break}for(const [dx,dy] of [[0,1],[1,0],[0,-1],[-1,0]]){const x=p.x+dx,y=p.y+dy,k=tileKey(x,y);if(!parents.has(k)&&allowed(x,y)){parents.set(k,p);queue.push({x,y})}}}
 if(!found)return null;const path=[];for(let p=found;p;p=parents.get(tileKey(p.x,p.y)))path.push({x:(p.x+.5)*T,y:(p.y+.5)*T});return path.reverse();
}
function campCivilians(town){
 if(orcCivilianLayout!==orcArchitectureTowns){orcCivilianLayout=orcArchitectureTowns;orcCivilianCache.clear()}
 if(orcCivilianCache.has(town.id))return orcCivilianCache.get(town.id);
 const jobs=[['foreign_orc_field','rolnik','#8d994a'],['foreign_orc_lumber','drwal','#ac7247'],['foreign_orc_quarry','kamieniarz','#9b9e92'],['foreign_orc_storage','tragarz','#9b8059'],['foreign_orc_farm','gospodarz','#b29a58']];
 const people=[];
 jobs.forEach(([type,job,color],i)=>{const target=Array.from(foreignIndex.values()).find(b=>b.townId===town.id&&b.type===type);if(!target)return;const path=orcCivilianRoute(town,{x:town.x,y:town.y},target);if(!path)return;people.push({id:i,townId:town.id,job,color,path,offset:i*3.7+(Number(town.id)||0),x:path[0].x,y:path[0].y})});
 orcCivilianCache.set(town.id,people);return people;
}
function visibleOrcResidents(x0,y0,x1,y1){
 if(!isDesertCampaign())return [];const result=[];
 for(const town of state.towns){if(town.x+5<x0||town.x-5>x1||town.y+5<y0||town.y-5>y1)continue;
 for(const r of campCivilians(town)){const travel=Math.max(.01,(r.path.length-1)/1.1),cycle=travel*2+8;const clock=(state.time+r.offset)%cycle;let distance;
 r.working=clock>=travel&&clock<travel+6;
 if(clock<travel)distance=clock*1.1;else if(clock<travel+6)distance=r.path.length-1;else if(clock<travel*2+6)distance=(travel*2+6-clock)*1.1;else distance=0;
 distance=Math.max(0,Math.min(r.path.length-1,distance));const index=Math.floor(distance),a=r.path[index],b=r.path[Math.min(index+1,r.path.length-1)],f=distance-index;r.x=a.x+(b.x-a.x)*f;r.y=a.y+(b.y-a.y)*f;
 if(seen.has(tileKey(Math.floor(r.x/T),Math.floor(r.y/T))))result.push(r);
 }}return result;
}
function drawOrcResident(r){
 const x=r.x,y=r.y;ctx.fillStyle='#1d302b55';ctx.beginPath();ctx.ellipse(x,y+5,9,4,0,0,7);ctx.fill();drawWalkingLegs(x,y-3,r,'#443d2c',4,9);artRect(x-7,y-17,14,16,r.color);drawOrcFace(x,y);artRect(x-6,y-32,12,4,'#55422c');
 if(r.working){const swing=Math.sin(state.time*7+r.id)*5,tx=x+14+swing,ty=y-18;artLine([[x+7,y-10],[tx,ty-5]],'#be9b64',3);if(r.job==='drwal'||r.job==='kamieniarz')artLine([[tx-5,ty-8],[tx+5,ty-2]],'#d3d1b9',4);if(r.job==='tragarz'){artRect(x+8,y-18,10,10,'#a17b49');artLine([[x+8,y-18],[x+18,y-8]],'#61452e',1)}}
 if(Math.hypot(x-state.p.x,y-state.p.y)<120){const label='Ork · '+r.job;ctx.font='9px system-ui';ctx.textAlign='center';const w=ctx.measureText(label).width;artRect(x-w/2-3,y-48,w+6,13,'#183027dd');ctx.fillStyle='#f1e6bd';ctx.fillText(label,x,y-38);ctx.textAlign='start'}
}
