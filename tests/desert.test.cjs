const fs=require('fs'),vm=require('vm'),assert=require('assert');
const noop=()=>{},els=new Map();let saved={p:{x:120.5*48,y:120.5*48},wood:500,stone:300,food:500,gold:0,cut:[],buildings:[{x:118,y:120,type:'start'},{x:119,y:120,type:'dom'}],seen:[],settled:{x:120,y:120},chopped:7,time:0,open:true};
const oldBuildings=JSON.stringify(saved.buildings),oldResources=[saved.wood,saved.stone,saved.food];
const ctx=new Proxy({measureText:s=>({width:s.length*6}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
function el(id){if(!els.has(id))els.set(id,{textContent:'',innerHTML:'',style:{},classList:{contains:()=>true,add:noop,remove:noop,toggle:noop},append:noop,setAttribute:noop,dataset:{},getContext:()=>ctx});return els.get(id)}
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
vm.runInContext(`{
state.campaign={stage:'desert',valleyWon:true};state.victory={won:false,dismissed:false};initDesertCampaign();
if(state.towns.length!==100||state.towns.some(t=>t.faction!=='orc'||!t.name.startsWith('Obóz')))throw Error('orc camps missing');
if(state.towns.some(t=>t.relation!=='scouting'))throw Error('peaceful orcs');const gold=state.gold,food=state.food;if(makePeace(state.towns[0].id)||offerAlliance(state.towns[0].id)||state.gold!==gold||state.food!==food)throw Error('orc diplomacy allowed');state.towns[0].relation='conquered';state.towns[1].relation='allied';initDesertCampaign();if(state.towns[0].relation!=='conquered'||state.towns[1].relation!=='scouting')throw Error('save migration loses conquest or permits alliance');state.towns[0].relation='war';let faces=0;const oldFace=drawOrcFace;drawOrcFace=()=>faces++;drawTrooper(0,0,'#b87661');drawTrooper(0,0,'#b65e4c');drawTrooper(0,0,'#638bba');drawBanditArcher({x:0,y:0});drawOrcFace=oldFace;if(faces!==3)throw Error('orc render paths incorrect');
const oldRoute=campaignRoute;campaignRoute=(a,b)=>[{x:a.x,y:a.y},{x:b.x,y:b.y}];state.war.raids=[];state.war.aiGrace=10;state.war.aiCooldown=0;for(const t of state.towns){t.relation='war';t.scoutFound=true;t.raidTimer=0;}updateWar(.01);if(state.war.raids.length)throw Error('grace ignored');state.war.aiGrace=0;updateWar(.01);if(state.war.raids.length!==1)throw Error('raid flood or no raid');updateWar(.01);if(state.war.raids.length!==1)throw Error('multiple simultaneous raids');state.war.raids=[];campaignRoute=oldRoute;
if(seasonIndex()!==1||seasonalTerrain('grass',.7)!=='#c9a568')throw Error('not desert');
if(victoryReady())throw Error('premature final victory');
for(const t of state.towns)t.relation='conquered';state.towns[99].relation='war';if(checkWorldVictory())throw Error('last camp still alive');
state.towns[99].relation='conquered';state.islandLife.forts=[];state.riverAdventure.enemies=[];state.buildings[0].castleLevel=0;
if(!checkWorldVictory()||!state.victory.won)throw Error('final victory missing');

}`,sandbox);
console.log('Desert final victory passed');
let reloads=0;const storage=new Map();sandbox.location={reload:()=>reloads++};sandbox.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
vm.runInContext(`{state.campaign=undefined;state.victory={won:false};if(startDesertCampaign())throw Error('locked chapter starts');state.victory.won=true;state.wood=999;state.clock.paused=true;if(!startDesertCampaign())throw Error('chapter transition failed')}`,sandbox);
vm.runInContext('save()',sandbox);
const next=JSON.parse(storage.get('zielona-dolina-v1')),valley=JSON.parse(storage.get('zielona-dolina-v1-valley-victory'));
assert.equal(reloads,1);assert.equal(next.campaign.stage,'desert');assert.equal(next.buildings.length,1);assert.equal(next.victory.won,false);assert.equal(next.clock.paused,false);assert.equal(next.towns,undefined);assert.equal(valley.wood,999);assert.equal(valley.victory.won,true);
vm.runInContext(`{state.campaign={stage:'desert'};if(startDesertCampaign())throw Error('restarts desert')}`,sandbox);
console.log('Fresh campaign and valley backup passed');
