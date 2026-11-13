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
vm.runInContext(`
state.towns=[];rebuildForeignIndex();state.war.raids=[];state.buildings=[{x:120,y:120,type:'dom'},{x:121,y:122,type:'drwal'},{x:123,y:122,type:'szpital'},{x:124,y:122,type:'lesniczowka'}];buildingIndexSource=null;state.settled={x:120,y:120};cut=new Set;for(let x=100;x<150;x++)for(let y=100;y<150;y++)cut.add(tileKey(x,y));peopleSignature='';syncResidents();
if(!assignWork(0,workId(state.buildings[2])))throw Error('manual assignment');if(assignWork(1,workId(state.buildings[2])))throw Error('double reservation');for(let i=0;i<1000;i++)processResidentPlanning();if(residents[0].job!==state.buildings[2])throw Error('wrong job');peopleSignature='';syncResidents();if(services().assignments[0]!==workId(state.buildings[2]))throw Error('lost reservation');
const r=residents[0];r.phase='praca';r.path=[];const u={x:r.x,y:r.y,hp:2};state.war.guards=[u];updateServices(1);if(u.hp!==3.5)throw Error('medic healing');u.hp=0;updateServices(1);if(u.hp!==0)throw Error('resurrection');
const oldTerrain=terrain;terrain=()=> 'grass';if(!plantTree(128,128))throw Error('plant');updateServices(59);if(natural(128,128))throw Error('early growth');updateServices(1);if(natural(128,128)!=='tree')throw Error('grown tree');cut.add('128,128');updateServices(.1);if(services().trees.some(t=>t.x===128&&t.y===128)||!plantTree(128,128))throw Error('replant');
const oldNav=navalWalkable;navalWalkable=(x,y)=>y===130&&x>=120&&x<=125;state.buildings.push({x:120,y:129,type:'port'},{x:125,y:129,type:'port'});buildingIndexSource=null;state.wood=200;state.gold=100;const ports=state.buildings.filter(b=>b.type==='port');if(!launchCivilBoat('cargo',workId(ports[0]),workId(ports[1])))throw Error('cargo launch');if(state.wood!==150||state.gold!==80)throw Error('cargo cost');for(let i=0;i<100;i++)updateCivilBoats(.1);if(services().boats[0].cargo||state.gold!==110)throw Error('delivery');updateCivilBoats(100);if(state.gold!==110)throw Error('duplicate payout');if(!launchCivilBoat('cargo',workId(ports[0]),workId(ports[1])))throw Error('second boat');const before=state.wood;cancelCivilBoat(services().boats[1].id);if(state.wood!==before+20)throw Error('refund');if(!launchCivilBoat('fish',workId(ports[0]),''))throw Error('fish launch');state.food=10;updateCivilBoats(12);if(state.food!==14)throw Error('fishing');navalWalkable=oldNav;
if(!JSON.parse(JSON.stringify(state)).services.assignments[0])throw Error('save');
`,sandbox);console.log('PASS manual reservation/persistence, staffed healing, tree growth/replant, cargo costs/delivery/refund, fishing');
