'use strict';
function playerLeavingOrcCamp(t){
 if(!t||!state.p)return false;
 const px=state.p.x/T,py=state.p.y/T;
 // Keep the two gate tiles clear for someone leaving from the courtyard,
 // including old saves made while the gate was closed on the player.
 return px>=t.x-.5&&px<t.x+2.5&&py>=t.y+3&&py<t.y+6;
}
function orcGateClosed(t){return !!t&&isDesertCampaign()&&t.relation==='war'&&!t.fortBroken&&!!t.siegeActive&&!playerLeavingOrcCamp(t)}
function desertSiegeTarget(t){return orcGateClosed(t)?{x:t.x,y:t.y+5}:t}
function desertChief(){return state.towns[state.towns.length-1]}
function initDesertLife(){
 if(!isDesertCampaign())return;
 for(const t of state.towns){if(!t.orcLife){t.orcLife={shamanHp:20,maxPower:Math.max(1,t.power),repair:0,work:0};}}
 const chief=desertChief();if(chief&&!chief.orcLife.chief){chief.orcLife.chief=true;if(chief.relation!=='conquered'){chief.power+=80;chief.orcLife.maxPower+=80;}}
}
function updateDesertLife(dt){
 if(!isDesertCampaign())return;initDesertLife();const units=selectableUnits().filter(u=>u.hp>0);
 for(const t of state.towns){const life=t.orcLife;
 if(t.relation==='war'){
 const attackers=units.filter(u=>u.order?.townId===t.id&&Math.hypot(u.x/T-t.x,u.y/T-t.y)<12);
 const expedition=state.war.expedition,ep=expedition?.townId===t.id&&expedition.phase==='outbound'?routePosition(expedition):null;t.siegeActive=attackers.length>0||!!(ep&&Math.hypot(ep.x/T-t.x,ep.y/T-t.y)<12);
 if(life.shamanHp>0){const close=attackers.filter(u=>Math.hypot(u.x/T-(t.x+1.5),u.y/T-(t.y-.5))<4);life.shamanHp=Math.max(0,life.shamanHp-close.length*dt*2);if(!close.length&&attackers.length)t.power=Math.min(life.maxPower,t.power+dt*.4);}
 }else t.siegeActive=false;
 if(t.relation==='conquered'){
 if(t.fortBroken){life.repair+=dt;if(life.repair>=30){t.fortBroken=false;t.fortHp=90;life.repair=30;warLog('Mieszkańcy odbudowali '+t.name+'. Brama pozostaje otwarta.');save();}}
 life.work+=dt;if(life.work>=20){life.work-=20;state.wood+=2;state.stone+=2;state.food+=3;}
 }
 }
}
const desertLifeStep=simulationStep;simulationStep=function(dt){updateDesertLife(dt);desertLifeStep(dt)};
// A ram attacks the gate from outside; normal orders continue into the courtyard after breach.
const desertLifeEngine=updateEngine;updateEngine=function(u,dt){const t=u.order?.townId&&state.towns.find(t=>t.id===u.order.townId);if(t&&t.fortBroken&&u.order.y>=t.y+4){const goal=nearestApproach(u,t.x,t.y,u.kind==='catapult'?5:1);if(goal){u.order.x=goal.x;u.order.y=goal.y;u.path=[];if(typeof cancelUnitRoute==='function')cancelUnitRoute(u)}}if(t&&orcGateClosed(t)){const p=desertSiegeTarget(t),goal=nearestApproach(u,p.x,p.y,u.kind==='catapult'?5:1);if(goal&&(u.order.x!==goal.x||u.order.y!==goal.y)){u.order.x=goal.x;u.order.y=goal.y;u.path=[];if(typeof cancelUnitRoute==='function')cancelUnitRoute(u)}}return desertLifeEngine(u,dt)};
const desertLifeOrder=handleUnitOrder;handleUnitOrder=function(u,dt){const t=u.order?.townId&&state.towns.find(t=>t.id===u.order.townId);if(t&&t.fortBroken&&u.order.y>=t.y+4){const goal=nearestApproach(u,t.x,t.y,1);if(goal){u.order.x=goal.x;u.order.y=goal.y;u.path=[];if(typeof cancelUnitRoute==='function')cancelUnitRoute(u)}}if(t&&orcGateClosed(t)){const p=desertSiegeTarget(t);if(Math.hypot(u.x/T-p.x-.5,u.y/T-p.y-.5)<3){u.blocked=true;return true}}return desertLifeOrder(u,dt)};
function sendCamelCaravan(id){const t=state.towns.find(t=>t.id===id);if(!isDesertCampaign()||t?.relation!=='conquered')return false;const before=new Set(state.kingdom.caravans);if(!sendCaravan(id,0,'wood'))return false;const c=state.kingdom.caravans.find(c=>!before.has(c));if(c)c.camel=true;save();return true}
function drawTradeCamel(c,p){const x=p.x,y=p.y,s=Math.sin(state.time*5)*3;artRect(x-20,y-8,38,17,'#b18a52');for(const [i,dx]of [-16,-7,8,15].entries())artLine([[x+dx,y+5],[x+dx+s*(i%2?1:-1),y+22]],'#946d3c',4);artLine([[x+15,y],[x+22,y-24],[x+32,y-26]],'#c5a06a',9);artRect(x+29,y-30,14,9,'#c5a06a');artRect(x-12,y-23,24,20,'#896642');artLine([[x-12,y-23],[x+12,y-3]],'#d3bd84',2);ctx.font='10px system-ui';ctx.fillStyle='#f3d994';ctx.fillText('KARAWANA · '+Math.ceil(c.hp),x-35,y-35)}
const desertLifeDraw=drawWarWorld;drawWarWorld=function(){desertLifeDraw();if(!isDesertCampaign())return;for(const t of state.towns){if(Math.abs(t.x*T-state.p.x)>innerWidth/zoom||Math.abs(t.y*T-state.p.y)>innerHeight/zoom||!seen.has(tileKey(t.x,t.y)))continue;const l=t.orcLife;if(!l)continue;const x=(t.x+1.5)*T,y=(t.y-.5)*T;if(t.relation!=='conquered'&&l.shamanHp>0){drawTrooper(x,y,'#826398');drawOrcFace(x,y);artLine([[x+12,y+5],[x+12,y-40]],'#b8a06d',3);orcSkull(x+12,y-42);ctx.fillStyle='#afe2a0';ctx.font='10px system-ui';ctx.fillText('SZAMAN '+Math.ceil(l.shamanHp),x-25,y-51)}if(l.chief&&t.relation!=='conquered'){const bx=(t.x-.5)*T,by=(t.y+.5)*T;ctx.save();ctx.translate(bx,by);ctx.scale(1.5,1.5);drawTrooper(0,0,'#663b32');drawOrcFace(0,0);polygon([[-8,-30],[-10,-43],[-3,-37],[0,-46],[4,-37],[10,-43],[8,-30]],'#e3bd65');ctx.restore();ctx.fillStyle='#f0cb79';ctx.font='bold 12px system-ui';ctx.fillText('WIELKI WÓDZ · '+Math.ceil(t.power),bx-50,by-73)}if(t.fortBroken&&t.relation==='conquered'){ctx.fillStyle='#e7d6a8';ctx.font='12px system-ui';ctx.fillText('ODBUDOWA '+Math.floor(l.repair)+'/30 s',(t.x-2)*T,(t.y+4)*T)}}};
const desertLifePanel=document.createElement('aside');desertLifePanel.id='desertLifePanel';desertLifePanel.className='war-panel hidden';desertLifePanel.innerHTML='<div class="war-title"><h2>Życie pustyni</h2><button id="desertLifeClose">✕</button></div><div id="desertLifeContent"></div>';document.body.append(desertLifePanel);
function renderDesertLife(){initDesertLife();const box=$('desertLifeContent');if(!isDesertCampaign()){box.innerHTML='<p>Te możliwości odblokujesz w etapie II — Pustynia orków.</p>';return}const chief=desertChief();box.innerHTML='<p>Szamani leczą obrońców podczas oblężenia. Podejdź żołnierzami na 4 pola, aby pokonać szamana. Orkowie zamykają bramę przy zbliżającym się ataku: wybierz taran lub katapultę, naciśnij Atakuj i wskaż obóz.</p><h3>Wielki wódz</h3><p>'+chief.name+' · '+(chief.relation==='conquered'?'pokonany':'siła '+Math.ceil(chief.power))+'</p><button id="locateDesertChief">Wskaż obóz wodza</button><h3>Twoje obozy</h3><p>Odbudowa trwa 30 s. Mieszkańcy dostarczają co 20 s: 2 drewna, 2 kamienia i 3 żywności. Karawana wielbłądów wymaga targu i 20 drewna; wraca z monetami.</p>'+state.towns.filter(t=>t.relation==='conquered').map(t=>'<section class="town-card"><b>'+t.name+'</b><p>'+(t.fortBroken?'Odbudowa: '+Math.floor(t.orcLife.repair)+'/30 s':'Obóz odbudowany')+'</p><button data-camel-town="'+t.id+'">Wyślij karawanę wielbłądów</button></section>').join('');$('locateDesertChief').onclick=()=>{state.war.waypoint=chief.id;chief.discovered=true;say('Obóz wodza: '+chief.x+', '+chief.y);save()};for(const b of box.querySelectorAll('button[data-camel-town]'))b.onclick=()=>{sendCamelCaravan(b.dataset.camelTown);renderDesertLife()};}
const desertLifeOpen=document.createElement('button');desertLifeOpen.textContent='🐪 Życie pustyni';desertLifeOpen.onclick=()=>{desertLifePanel.classList.remove('hidden');renderDesertLife()};$('clockControls').append(desertLifeOpen);$('desertLifeClose').onclick=()=>desertLifePanel.classList.add('hidden');
initDesertLife();

const desertLifeChecklist=victoryChecklist;victoryChecklist=function(){return desertLifeChecklist()+(isDesertCampaign()?'<p>'+(desertChief()?.relation==='conquered'?'✓':'○')+' Pokonaj Wielkiego Wodza w ostatnim obozie</p>':'')};

let desertPanelClock=0;const desertPanelStep=simulationStep;simulationStep=function(dt){desertPanelStep(dt);desertPanelClock+=dt;if(desertPanelClock>=1){desertPanelClock=0;if(!desertLifePanel.classList.contains('hidden'))renderDesertLife()}};
