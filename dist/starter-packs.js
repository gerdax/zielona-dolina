'use strict';
const STARTER_PACKS={soldiers:{price:50,name:'3 żołnierzy na początek'},village:{price:400,name:'3 domy, chata drwala, kamieniołom, gospodarstwo i 2 pola'}};
function starterPacks(){state.starterPacks??={};return state.starterPacks}
function buyStarterPack(id){const pack=STARTER_PACKS[id];if(!pack||starterPacks()[id]||gemWallet()<pack.price)return false;const balance=state.gems;state.gems-=pack.price;state.starterPacks[id]=true;if(!save()){state.gems=balance;delete state.starterPacks[id];$('pauseSaveStatus').textContent='Nie udało się zapisać zakupu. Klejnoty nie zostały wydane.';return false}renderStarterShop();const next=Object.keys(STARTER_PACKS).find(k=>!starterPacks()[k]&&state.gems>=STARTER_PACKS[k].price);$(next?'buyStarter-'+next:'pauseMainMenu').focus();$('pauseGems').textContent='💎 Klejnoty: '+state.gems;$('pauseSaveStatus').textContent='Pakiet kupiony. Zadziała przy następnej nowej grze.';return true}
function applyStarterPacks(){if(state.starterPacksApplied)return;const packs=starterPacks(),home=state.buildings.find(b=>b.type==='start')||{x:118,y:120};
 if(packs.village){const spots=[];for(let dy=-4;dy<=4;dy+=2)for(let dx=-4;dx<=4;dx+=2){const x=home.x+dx,y=home.y+dy;if(terrain(x,y)==='grass'&&!building(x,y)&&!foreignBuilding(x,y)&&Math.hypot(x+.5-state.p.x/T,y+.5-state.p.y/T)>1)spots.push({x,y})}if(spots.length<8)return false;for(let dx=-6;dx<=6;dx++)for(let dy=-6;dy<=6;dy++)cut.add(tileKey(home.x+dx,home.y+dy));for(const [i,type] of ['dom','dom','dom','drwal','kamieniolom','gospodarstwo','pole','pole'].entries())state.buildings.push({...spots[i],type});buildingIndexSource=null;peopleSignature='';syncResidents()}
 if(packs.soldiers){state.war.soldiers+=3;state.starterSoldierCapacity=3;syncGarrisonActors();ensureUnitIds()}
 state.starterPacksApplied=true;save();return true;
}
function startFreshGameWithPacks(){if(!confirm('Rozpocząć nową grę? Obecna wioska zostanie zastąpiona. Klejnoty i kupione dodatki zostaną zachowane.'))return false;
 const next={appearance:JSON.parse(JSON.stringify(state.appearance||{})),p:{x:120*T,y:120*T},wood:65,stone:25,food:35,gold:0,cut:[],buildings:[{x:118,y:120,type:'start'}],seen:[],settled:null,chopped:0,time:0,open:true,gems:gemWallet(),gemRewards:{},starterPacks:{...starterPacks()},clock:{paused:false,speed:1}};
 try{localStorage.setItem(KEY,JSON.stringify(next))}catch{say('Nie udało się zapisać nowej gry.');return false}pendingCampaignSave=JSON.stringify(next);state.clock.paused=true;keys={};location.reload();return true;
}
function renderStarterShop(){const shop=$('starterShop');shop.innerHTML='<p>Kup raz — bonus otrzymasz na początku każdej nowej gry, również etapu pustynnego. Obecna wioska pozostaje bez zmian.</p>'+Object.entries(STARTER_PACKS).map(([id,p])=>'<section class="starter-pack"><b>'+p.name+'</b><button id="buyStarter-'+id+'" '+(starterPacks()[id]||state.gems<p.price?'disabled':'')+'>'+(starterPacks()[id]?'✓ Kupione':p.price+' 💎 — Kup')+'</button></section>').join('');for(const id of Object.keys(STARTER_PACKS))$('buyStarter-'+id).onclick=()=>buyStarterPack(id)}
const starterCapacity=armyCapacity;armyCapacity=function(){return starterCapacity()+(state.starterSoldierCapacity||0)};
$('reset').onclick=startFreshGameWithPacks;
applyStarterPacks();
