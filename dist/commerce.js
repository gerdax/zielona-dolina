'use strict';
const MARKET_GOODS={iron:{name:'Żelazo',icon:'⚒',buy:12,sell:8},goldOre:{name:'Ruda złota',icon:'✦',buy:35,sell:25},wood:{name:'Drewno',icon:'🪵',buy:5,sell:3},stone:{name:'Kamień',icon:'◆',buy:8,sell:5},food:{name:'Żywność',icon:'🌾',buy:4,sell:2}};
function initCommerce(){state.war.tradeClock??=0;for(const t of state.towns){t.marketStock??={wood:50,stone:40,food:60};t.marketStock.iron??=30;t.marketStock.goldOre??=20}}
initCommerce();
function marketSignature(){return [ownCount('targ'),state.gold,state.towns.map(t=>[t.id,t.marketStock])]}
function tradeWithTown(id,resource,side){
 const t=state.towns.find(t=>t.id===id),g=MARKET_GOODS[resource];if(!Object.hasOwn(MARKET_GOODS,resource)||!['buy','sell'].includes(side))return false;
 if(!state.settled||!ownCount('targ')){say('Zbuduj targ w swojej wiosce.');return false}
 if(!t?.discovered||t.relation==='war'){say('Handel jest możliwy tylko z odkrytymi osadami, z którymi nie prowadzisz wojny.');return false}
 t.marketStock??={wood:50,stone:40,food:60};const n=10;
 if(side==='buy'){
  if(state.gold<g.buy){say('Brakuje monet na zakup.');return false}if(t.marketStock[resource]<n){say('Sąsiad nie ma teraz tego towaru. Zapasy odnawiają się co minutę gry.');return false}if(state[resource]+n>capacity()){say('Za mało miejsca w składach.');return false}
  state.gold-=g.buy;state[resource]+=n;t.marketStock[resource]-=n;warLog('Kupiono 10: '+g.name+' od '+t.name+' za '+g.buy+' monet.');
 }else{
  if(state[resource]<n){say('Potrzebujesz 10 sztuk tego surowca.');return false}if(t.marketStock[resource]+n>100){say('Sąsiad ma pełny magazyn tego towaru.');return false}
  state[resource]-=n;state.gold+=g.sell;t.marketStock[resource]+=n;warLog('Sprzedano 10: '+g.name+' do '+t.name+' za '+g.sell+' monet.');
 }
 ui();save();return true;
}
function updateTrade(dt){state.war.tradeClock+=dt;if(state.war.tradeClock>=60){state.war.tradeClock%=60;for(const t of state.towns){t.marketStock??={wood:50,stone:40,food:60};if(t.relation!=='war')for(const key of Object.keys(MARKET_GOODS))t.marketStock[key]=Math.min(100,(t.marketStock[key]||0)+10)}}}
function marketTownControls(t){
 if(!t.discovered||t.relation==='war')return '';
 if(!ownCount('targ'))return '<p class="war-hint">⚖ Zbuduj targ, aby handlować z tą osadą.</p>';
 t.marketStock??={wood:50,stone:40,food:60};return `<div class="market-offers"><small>⚖ TARG · PAKIETY PO 10 SZTUK</small>${Object.entries(MARKET_GOODS).map(([key,g])=>`<div class="market-offer"><span>${g.icon} ${g.name}<small>U sąsiada: ${t.marketStock[key]}</small></span><button data-war="trade" data-id="${t.id}" data-resource="${key}" data-side="buy" ${state.gold<g.buy||t.marketStock[key]<10||state[key]+10>capacity()?'disabled':''}>Kup · ${g.buy} ●</button><button data-war="trade" data-id="${t.id}" data-resource="${key}" data-side="sell" ${state[key]<10||t.marketStock[key]>90?'disabled':''}>Sprzedaj · ${g.sell} ●</button></div>`).join('')}<p class="war-hint">Zapasy kupców: +10 sztuk co minutę aktywnej gry. Handel zatrzymuje się podczas wojny.</p></div>`;
}
ui();
