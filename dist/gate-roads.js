'use strict';
function roadGate(b){return b&&['brama','brama_swoi'].includes(b.type)}
const gateRoadBuild=build;build=function(x,y){const old=building(x,y);
 if(mode==='sciezka'&&roadGate(old)){
  if(!state.settled){say('Najpierw załóż osadę.');return}
  if(Math.hypot(x+.5-state.p.x/T,y+.5-state.p.y/T)>7){say('Podejdź do bramy na 7 pól.');return}
  const road=lifeState().paving?'stone':'dirt',cost=road==='stone'?3:1;
  if(old.road==='stone'||old.road===road){say('Ta brama ma już taką lub lepszą drogę.');return}
  if(state.stone<cost){say('Droga w bramie wymaga '+cost+' kamienia.');return}
  state.stone-=cost;old.road=road;save();ui();say(road==='stone'?'Ułożono kamienną drogę w bramie.':'Ułożono drogę w bramie.');return;
 }
 gateRoadBuild(x,y);const b=building(x,y);
 if(old?.type==='sciezka'&&b!==old&&roadGate(b)){b.road=old.paved?'stone':'dirt';save()}
};
const gateRoadHint=constructionHint;constructionHint=function(x,y,type=mode){const b=building(x,y);if(type!=='sciezka'||!roadGate(b))return gateRoadHint(x,y,type);if(!state.settled)return 'Najpierw załóż osadę.';if(Math.hypot(x+.5-state.p.x/T,y+.5-state.p.y/T)>7)return 'Podejdź do bramy na 7 pól.';const stone=!!lifeState().paving,cost=stone?3:1;if(b.road==='stone'||b.road===(stone?'stone':'dirt'))return 'Brama ma już tę nawierzchnię.';return state.stone<cost?'Brakuje kamienia.':'Możesz budować drogę w bramie · '+cost+' kamienia.'};
const gateRoadSpeed=pathSpeed;pathSpeed=function(x,y){const b=building(Math.floor(x/T),Math.floor(y/T));return roadGate(b)&&b.road?(b.road==='stone'?1.8:1.4):gateRoadSpeed(x,y)};
const gateRoadCost=routeCost;routeCost=function(x,y){const b=building(x,y);return roadGate(b)&&b.road?1:gateRoadCost(x,y)};
function drawGateRoad(b,x,y){const vertical=gateVertical(b),w=vertical?48:24,h=vertical?24:48;artRect(x-w/2,y-h/2,w,h,b.road==='stone'?'#aeb2a2':'#b6a47b');if(b.road==='stone'){for(let dx=-w/2;dx<w/2;dx+=8)artLine([[x+dx,y-h/2],[x+dx,y+h/2]],'#778477',1);for(let dy=-h/2;dy<h/2;dy+=8)artLine([[x-w/2,y+dy],[x+w/2,y+dy]],'#778477',1)}}
const gateRoadArt=structure;structure=function(b,x,y){if(roadGate(b)&&b.road)drawGateRoad(b,x,y);return gateRoadArt(b,x,y)};
