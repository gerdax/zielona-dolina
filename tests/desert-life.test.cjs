const fs=require('fs'),vm=require('vm'),assert=require('assert');
const noop=()=>{},els=new Map();let saved={p:{x:120.5*48,y:120.5*48},wood:500,stone:300,food:500,gold:0,cut:[],buildings:[{x:118,y:120,type:'start'},{x:119,y:120,type:'dom'}],seen:[],settled:{x:120,y:120},chopped:7,time:0,open:true};
const oldBuildings=JSON.stringify(saved.buildings),oldResources=[saved.wood,saved.stone,saved.food];
const ctx=new Proxy({measureText:s=>({width:s.length*6}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
function el(id){if(!els.has(id))els.set(id,{textContent:'',innerHTML:'',style:{},classList:{contains:()=>true,add:noop,remove:noop,toggle:noop},append:noop,setAttribute:noop,dataset:{},querySelectorAll:()=>[],getContext:()=>ctx});return els.get(id)}
const sandbox={document:{body:el("body"),getElementById:el,querySelectorAll:()=>[],createElement:()=>el(Math.random())},localStorage:{getItem:()=>JSON.stringify(saved),setItem:(k,v)=>saved=JSON.parse(v)},window:{addEventListener:noop},performance:{now:()=>0},setTimeout:noop,clearTimeout:noop,setInterval:noop,requestAnimationFrame:noop,innerWidth:1280,innerHeight:800,devicePixelRatio:1,console};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/war.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/patrol.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/commerce.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/strategy.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/kingdom.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/selection.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/atlas.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/frontier.js','utf8'),sandbox);

vm.runInContext(fs.readFileSync('dist/village.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/quality.js','utf8'),sandbox);

vm.runInContext(fs.readFileSync('dist/story.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/adventure.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/roaming.js','utf8'),sandbox);

vm.runInContext(fs.readFileSync('dist/life.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/services.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/building-art.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/player-boat.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/river-adventure.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/island-life.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/tactics.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/desert.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/victory.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/orc-scouts.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/orc-architecture.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/orc-residents.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/desert-life.js','utf8'),sandbox);
vm.runInContext(`{
state.campaign={stage:'desert'};rebuildForeignIndex();initDesertLife();const t=state.towns[0],chief=desertChief(),power=chief.power;initDesertLife();if(chief.power!==power||!chief.orcLife.chief)throw Error('chief migration');
t.relation='war';t.siegeActive=true;const oldP={...state.p};for(const dx of [.5,1.5]){state.p={x:(t.x+dx)*T,y:(t.y+5.5)*T};if(orcGateClosed(t)||blocked(state.p.x,state.p.y))throw Error('player trapped on gate');}state.p={x:(t.x+.5)*T,y:(t.y+4)*T};if(orcGateClosed(t))throw Error('inside exit blocked');state.p={x:(t.x+.5)*T,y:(t.y+6.5)*T};if(!orcGateClosed(t))throw Error('outside player opens siege gate');state.p=oldP;if(!orcWallBlocked(t.x,t.y+5))throw Error('gate not closed');const ram={uid:'test-ram',kind:'ram',hp:40,x:(t.x+.5)*T,y:(t.y+6.5)*T,order:{kind:'attack',townId:t.id,x:t.x,y:t.y},path:[],cooldown:0};state.war.engines=[ram];t.fortHp=8;updateEngine(ram,.1);if(!t.fortBroken)throw Error('ram failed gate breach');if(orcWallBlocked(t.x,t.y+5))throw Error('gate remains blocked');
t.fortBroken=false;t.fortHp=90;t.power=10;t.orcLife.maxPower=40;ram.x=(t.x+.5)*T;ram.y=(t.y+6.5)*T;updateDesertLife(2);if(t.power<=10)throw Error('shaman not healing');ram.x=(t.x+1.5)*T;ram.y=(t.y-.5)*T;updateDesertLife(10);if(t.orcLife.shamanHp!==0)throw Error('shaman not defeated');
t.relation='conquered';t.fortBroken=true;const wood=state.wood;updateDesertLife(30);if(t.fortBroken||state.wood<=wood)throw Error('rebuild/production');if(orcGateClosed(t))throw Error('owned gate closed');
const oldSend=sendCaravan;sendCaravan=function(id){state.kingdom.caravans.push({townId:id});return true};if(!sendCamelCaravan(t.id)||!state.kingdom.caravans.at(-1).camel)throw Error('camel caravan');sendCaravan=oldSend;
state.campaign.stage='valley';if(orcGateClosed(t)||sendCamelCaravan(t.id))throw Error('valley changed');
}`,sandbox);console.log('PASS gate siege and ram breach, shaman healing/defeat, chief migration, rebuilding/production, camel caravans, valley isolation');
