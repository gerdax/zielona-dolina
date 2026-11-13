'use strict';
// Command feedback shares the movement planner; it never performs route searches.
let commandMarker=null,formationPreviewCache=null;
function commandPreview(x,y){
 const units=selectedActors().slice(),key=[x,y,Math.floor(state.time*5),...units.map(u=>u.uid+':'+(u.formation||'loose')+':'+u.kind)].join('|');
 if(formationPreviewCache?.key===key)return formationPreviewCache.value;
 const visible=seen.has(tileKey(x,y)),spots=visible?formationMoveSpots(units,x,y):[];
 const value={x,y,count:units.length,spots,visible};formationPreviewCache={key,value};return value;
}
const feedbackIssue=issueMapCommand;
issueMapCommand=function(x,y){
 const kind=commandDraft,units=selectedActors().slice(),ok=feedbackIssue(x,y);
 if(ok&&['move','attack'].includes(kind)){
  const assigned=units.filter(u=>u.order);for(const u of assigned)u.blocked=false;
  commandMarker={x,y,kind,units:assigned.map(u=>u.uid),time:state.time};formationPreviewCache=null;
 }
 return ok;
};
const feedbackStep=stepOrder;
stepOrder=function(u,goal,dt,speed){const arrived=feedbackStep(u,goal,dt,speed);if(arrived)u.blocked=false;return arrived};
const feedbackStop=clearCommands;
clearCommands=function(){const units=selectedActors().slice();feedbackStop();for(const u of units){u.blocked=false;cancelUnitRoute(u)}commandMarker=null;showCommandBar()};
// Rebind: the original button stored the previous function by value.
$('commandStop').onclick=()=>clearCommands();
function rallyTroops(){
 const candidates=selectableUnits().filter(u=>u.hp>0&&!ENGINE_TYPES[u.kind]).sort((a,b)=>Math.hypot(a.x-state.p.x,a.y-state.p.y)-Math.hypot(b.x-state.p.x,b.y-state.p.y)).slice(0,MAX_SELECTED_UNITS);
 if(!candidates.length){say('Brak dostępnych żołnierzy do zbiórki.');return false}
 const previous={selected:selectedUnits,draft:commandDraft};selectedUnits=new Set(candidates.map(u=>u.uid));
 if(!armCommand('move')||!issueMapCommand(Math.floor(state.p.x/T),Math.floor(state.p.y/T))){selectedUnits=previous.selected;commandDraft=previous.draft;showCommandBar();return false}
 say('Zbiórka: '+candidates.filter(u=>u.order).length+' żołnierzy idzie do ludka.');return true;
}
const rallyButton=document.createElement('button');rallyButton.id='rallyTroops';rallyButton.textContent='⚑ Zbiórka wojska';rallyButton.title='Sprowadź do 10 najbliższych dostępnych żołnierzy do ludka';rallyButton.onclick=rallyTroops;$('clockControls').append(rallyButton);
const feedbackText=document.createElement('span');feedbackText.id='commandFeedbackText';feedbackText.setAttribute('role','status');$('commandBar').append(feedbackText);
const feedbackBar=showCommandBar;
showCommandBar=function(){
 feedbackBar();const units=selectedActors(),blockedCount=units.filter(u=>u.blocked&&u.order).length;
 feedbackText.textContent=blockedCount?'⚠ Brak przejścia: '+blockedCount+'/'+units.length+' — sprawdź bramę lub most.':'';
};
function drawCommandTile(x,y,color,filled=false){
 ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2/zoom;
 if(filled){ctx.globalAlpha=.16;ctx.fillRect(x*T+3,y*T+3,T-6,T-6);ctx.globalAlpha=1}
 ctx.strokeRect(x*T+3,y*T+3,T-6,T-6);
}
function drawCommandFeedback(){
 ctx.save();
 if(!mode&&commandDraft==='move'&&worldCursor){
  const p=worldPoint(worldCursor),preview=commandPreview(Math.floor(p.x/T),Math.floor(p.y/T)),complete=preview.visible&&preview.spots.length===preview.count&&preview.count>0;
  for(const spot of preview.spots)drawCommandTile(spot.x,spot.y,'#c5e69d',true);
  drawCommandTile(preview.x,preview.y,complete?'#f9db75':'#f28d77');
  ctx.font='12px system-ui';ctx.fillStyle=complete?'#f9e3a0':'#ffb09a';ctx.fillText('Miejsca: '+preview.spots.length+'/'+preview.count,preview.x*T,preview.y*T-10);
 }
 if(commandMarker){
  const active=selectedActors().some(u=>commandMarker.units.includes(u.uid)&&u.order);
  if(active||state.time-commandMarker.time<8){
   const m=commandMarker,x=(m.x+.5)*T,y=(m.y+.5)*T,color=m.kind==='attack'?'#f4997e':'#f9db75';
   drawCommandTile(m.x,m.y,color);ctx.strokeStyle=color;ctx.lineWidth=2/zoom;ctx.beginPath();ctx.moveTo(x-10,y);ctx.lineTo(x+10,y);ctx.moveTo(x,y-10);ctx.lineTo(x,y+10);ctx.stroke();ctx.font='bold 12px system-ui';ctx.fillStyle=color;ctx.fillText(m.kind==='attack'?'CEL ATAKU':'CEL MARSZU',x-36,y-31);
  }else commandMarker=null;
 }
 for(const u of selectedActors())if(u.order){
  drawCommandTile(u.order.x,u.order.y,u.blocked?'#f4997e':'#e6ce83');
  if(u.blocked){ctx.fillStyle='#ffb29b';ctx.font='bold 11px system-ui';ctx.fillText('⚠ Brak przejścia',u.x-38,u.y+32)}
 }
 ctx.restore();
}
const feedbackWorld=drawStrategyWorld;
drawStrategyWorld=function(){feedbackWorld();drawCommandFeedback()};
showCommandBar();
