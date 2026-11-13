const fs=require('fs'),vm=require('vm'),assert=require('assert');
const noop=()=>{},els=new Map();let saved={p:{x:120.5*48,y:120.5*48},wood:500,stone:300,food:500,gold:0,cut:[],buildings:[{x:118,y:120,type:'start'},{x:119,y:120,type:'dom'}],seen:[],settled:{x:120,y:120},chopped:7,time:0,open:true};
const oldBuildings=JSON.stringify(saved.buildings),oldResources=[saved.wood,saved.stone,saved.food];
const ctx=new Proxy({measureText:s=>({width:s.length*6})},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
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
vm.runInContext(`
state.towns=[];rebuildForeignIndex();state.war.raids=[];state.buildings=[{x:120,y:120,type:'start'},{x:126,y:120,type:'port'}];buildingIndexSource=null;state.p={x:120.5*T,y:120.5*T};state.playerBoat={x:129.5*T,y:120.5*T,aboard:false,angle:0};riverAdventure();state.p={x:128.5*T,y:120.5*T};state.wood=500;state.gold=500;
if(!upgradeRiverBoat()||riverBoatSeats()!==2||state.wood!==470||state.gold!==480)throw Error('upgrade2');if(!upgradeRiverBoat()||riverBoatSeats()!==4||upgradeRiverBoat())throw Error('upgrade cap');const boat=state.playerBoat;state.war.soldiers=3;state.war.guards=[0,1,2].map(i=>({uid:'river-test'+i,x:128.5*T,y:120.5*T,hp:8,home:{x:128,y:120},path:[],kind:'melee'}));const oldSync=syncGarrisonActors;syncGarrisonActors=()=>{};if(!loadRiverPassengers()||boat.passengers.length!==3||state.war.soldiers!==0||state.war.guards.length)throw Error('load');if(!ownSoldierActors().includes(boat.passengers[0])||kingdomArmyAway()<3)throw Error('army tracking');
boat.aboard=true;state.p={x:boat.x,y:boat.y};if(!toggleRiverFishing())throw Error('fishing start');state.food=10;updateRiver(9);if(state.food!==10)throw Error('early fish');updateRiver(1);if(state.food!==13)throw Error('fish reward');state.p.x+=1;updateRiver(.1);if(riverAdventure().fishing)throw Error('fishing movement');boat.aboard=false;
if(!startRiverAdventure()||riverAdventure().islands.length!==3||riverAdventure().enemies.length!==3||startRiverAdventure())throw Error('islands init');const island=riverAdventure().islands[0];if(terrain(island.x,island.y)!=='grass'||terrain(island.x+4,island.y)!=='water')throw Error('island terrain');state.p={x:(island.x+.5)*T,y:(island.y+.5)*T};const gold=state.gold;if(!claimRiverIsland(island.id)||state.gold!==gold+80||claimRiverIsland(island.id))throw Error('island reward once');
const oldTerrain=terrain;terrain=(x,y)=>x>=121&&x<=125?'water':'grass';cut=new Set;for(let x=115;x<135;x++)for(let y=115;y<135;y++)cut.add(tileKey(x,y));boat.x=121.5*T;boat.y=120.5*T;state.p={x:boat.x,y:boat.y};boat.aboard=true;if(!unloadRiverPassengers()||state.war.guards.length!==3||state.war.soldiers!==3)throw Error('unload');boat.passengers=state.war.guards.splice(0,2);state.war.soldiers-=2;state.buildings=[{x:120,y:120,type:'port'}];buildingIndexSource=null;const a=riverAdventure();a.enemies=[{id:'capture',x:122.5*T,y:120.5*T,hp:12,maxHp:24,path:[],wait:0,cooldown:100}];if(!beginRiverBoarding())throw Error('boarding start');updateRiver(5);if(state.kingdom.fleet.some(s=>s.id.startsWith('captured')))throw Error('early boarding');updateRiver(1);if(!state.kingdom.fleet.some(s=>s.id.startsWith('captured'))||a.enemies[0].hp!==0||a.boarding)throw Error('captured fleet');
a.enemies=[{id:'fighter',x:123.5*T,y:120.5*T,hp:24,maxHp:24,path:[],wait:0,cooldown:0}];boat.combat=true;boat.hp=40;boat.shotClock=0;updateRiver(1);if(a.enemies[0].hp>=24||boat.hp>=40)throw Error('river combat');a.enemies[0].hp=1;boat.shotClock=0;const beforeGold=state.gold;updateRiver(1);if(state.gold!==beforeGold+25)throw Error('kill reward');updateRiver(1);if(state.gold!==beforeGold+25)throw Error('repeat kill reward');
state.p={x:120.5*T,y:121.5*T};setMode('pomost');const wood=state.wood;build(121,121);if(building(121,121)?.type!=='pomost'||state.wood!==wood-10||blocked(121.5*T,121.5*T))throw Error('pier construction');state.p={x:122.5*T,y:121.5*T};if(!boatLanding())throw Error('pier landing');
boat.hp=10;state.p={x:120.5*T,y:120.5*T};boat.aboard=false;if(!repairRiverBoat()||boat.hp!==riverBoatMax())throw Error('repair');if(!JSON.parse(JSON.stringify(state)).riverAdventure.active)throw Error('save river');syncGarrisonActors=oldSync;terrain=oldTerrain;
`,sandbox);console.log('PASS river upgrades/costs/seats, troop conservation, fishing time/movement, islands/one-time rewards, boarding/capture, combat/reward, pier walking/landing, repair and save');
