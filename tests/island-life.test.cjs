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
vm.runInContext(`
state.towns=[];rebuildForeignIndex();state.war.raids=[];state.buildings=[{x:118,y:120,type:'start'}];buildingIndexSource=null;state.settled={x:120,y:120};state.wood=500;state.stone=500;state.gold=500;state.playerBoat=null;residents=[];peopleSignature='';syncResidents();startRiverAdventure();const i=riverAdventure().islands[0];state.p={x:(i.x+.5)*T,y:(i.y+.5)*T};if(foundIslandColony('Przystań'))throw Error('colony before exploration');claimRiverIsland(i.id);const pop=population(),wood=state.wood;if(!foundIslandColony('Przystań')||population()!==pop+3||state.wood!==wood-70||foundIslandColony('Duplicate'))throw Error('colony cost/population/duplicate');const colonyHouse=state.buildings.find(b=>b.colonyId===i.id&&b.type==='dom');if(!colonyHouse||residents.filter(r=>Math.hypot(r.x/T-i.x-.5,r.y/T-i.y-.5)<4).length<3)throw Error('colony residents not spawned on island');
const oldTerrain=terrain;terrain=(x,y)=>x>=121&&x<=125?'water':'grass';cut=new Set;for(let x=110;x<140;x++)for(let y=110;y<140;y++)cut.add(tileKey(x,y));state.p={x:120.5*T,y:120.5*T};chooseStoneBridge();const w=state.wood,s=state.stone;build(121,120);const bridge=building(121,120);if(!bridge?.stoneBridge||state.wood!==w-10||state.stone!==s-30||buildingMaxHp(bridge)!==240||blocked(121.5*T,120.5*T))throw Error('stone bridge cost/hp/passability');damageBuilding(bridge,10);if(bridge.hp!==230)throw Error('stone durability');const wb=state.wood,sb=state.stone;demolish(121,120);if(state.wood!==wb+5||state.stone!==sb+15)throw Error('stone refund');
setMode('latarnia');build(120,121);setMode('pochodnia');build(119,121);state.time=0;if(nightStrength()!==0)throw Error('day darkness');state.time=180;if(nightStrength()<.47)throw Error('night');draw();state.time=0;
peopleSignature='';syncResidents();if(!acceptIslandJob('wood'))throw Error('accept quest');const q=islandLife().quests.wood,r=residents.find(r=>r.id===q.owner);state.p={x:r.x,y:r.y};const gold=state.gold,resources=state.wood;if(!finishIslandJob('wood')||state.gold!==gold+35||state.wood!==resources-20||finishIslandJob('wood'))throw Error('quest payment/once');acceptIslandJob('lights');const owner=residents.find(r=>r.id===islandLife().quests.lights.owner);state.p={x:owner.x,y:owner.y};if(!finishIslandJob('lights'))throw Error('light construction quest');terrain=oldTerrain;
state.p={x:120.5*T,y:120.5*T};if(!startPirateFort())throw Error('fort initialization');const f=islandLife().fort,fort=riverAdventure().islands.find(i=>i.id===f.id);if(claimRiverIsland(fort.id)||capturePirateFort())throw Error('fort reward before victory');state.p={x:(fort.x+.5)*T,y:(fort.y+1.5)*T};state.war.guards=Array.from({length:4},(_,n)=>({uid:'fort-'+n,x:(fort.x+.5)*T,y:(fort.y+1.5)*T,hp:8,path:[],home:{x:fort.x,y:fort.y+1},kind:'melee'}));state.war.soldiers=4;const raidCount=state.war.raids.length;if(!attackPirateFort()||!attackPirateFort()||state.war.raids.length!==raidCount)throw Error('fort attack');const raid=state.war.raids.find(r=>r.townId===f.raidId);if(!raid||raid.power!==30||!raid.camp)throw Error('fort battle not real');raid.power=0;updateIslandLife();const beforeGold=state.gold;if(!capturePirateFort()||state.gold!==beforeGold+250||capturePirateFort()||!fort.claimed)throw Error('capture reward/once');if(!JSON.parse(JSON.stringify(state)).islandLife.colonies.length)throw Error('expansion persistence');
`,sandbox);console.log('PASS island colony costs/residents, stone bridge cost/hp/refund, lamps/night render, resident tasks/payment once, pirate battle/capture and persistence');
