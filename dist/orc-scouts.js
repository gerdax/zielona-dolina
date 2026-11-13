'use strict';
function orcScoutFindsVillage(scout){const p=routePosition(scout);return state.buildings.some(b=>b.type!=='ruiny'&&Math.hypot((b.x+.5)*T-p.x,(b.y+.5)*T-p.y)<=5*T)}
function updateOrcScouts(dt){
 if(!isDesertCampaign())return;const w=state.war;
 for(const scout of w.raids.filter(r=>r.scout&&r.power>0)){
  const town=state.towns.find(t=>t.id===scout.townId);if(!town||town.relation!=='scouting'){scout.power=0;continue}
  advanceCampaign(scout,dt,2.1);
  if(orcScoutFindsVillage(scout)){town.scoutFound=true;town.relation='war';town.discovered=true;town.raidTimer=45;scout.power=0;warPanelSignature='';warLog('Zwiadowca z '+town.name+' odkrył Twoją wioskę! Obóz rozpoczyna wojnę. Przygotuj obronę.');save()}
  else if(scout.progress>=scout.route.length-1){scout.power=0;town.nextScout=state.time+60}
 }
 w.raids=w.raids.filter(r=>!r.scout||r.power>0);
 const campaign=state.campaign;campaign.scoutClock=(campaign.scoutClock??10)-dt;if(campaign.scoutClock>0)return;campaign.scoutClock=20;
 if(w.raids.filter(r=>r.scout).length>=3)return;
 const origin=villageOrigin(),town=state.towns.filter(t=>t.relation==='scouting'&&(t.nextScout||0)<=state.time&&!w.raids.some(r=>r.scout&&r.townId===t.id)).sort((a,b)=>Math.hypot(a.x-origin.x,a.y-origin.y)-Math.hypot(b.x-origin.x,b.y-origin.y))[0];if(!town)return;
 town.nextScout=state.time+60;const route=campaignRoute(town,origin,true,'enemy');if(!route)return;
 w.raids.push({townId:town.id,scout:true,camp:true,hostile:true,naval:true,power:1,route,progress:0});save();if(town.discovered)say(town.name+' wysyła zwiadowcę. Nie znalazł jeszcze Twojej wioski.');
}
const orcScoutStep=simulationStep;simulationStep=function(dt){orcScoutStep(dt);updateOrcScouts(dt)};
