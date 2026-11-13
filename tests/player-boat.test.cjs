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
vm.runInContext(`
state.towns=[];rebuildForeignIndex();state.war.raids=[];state.buildings=[];buildingIndexSource=null;const oldTerrain=terrain;terrain=(x,y)=>x>=121&&x<=125&&y>=118&&y<=125?'water':'grass';cut=new Set;for(let x=115;x<130;x++)for(let y=115;y<130;y++)cut.add(tileKey(x,y));state.p={x:120.5*T,y:120.5*T};state.wood=100;
if(!buildPersonalBoat()||state.wood!==80||buildPersonalBoat())throw Error('boat cost/duplicate');const b=state.playerBoat;if(!boardPersonalBoat()||!b.aboard||blocked(state.p.x,state.p.y)!==true||playerMovementBlocked(state.p.x,state.p.y))throw Error('boarding/player-only water collision');if(playerMovementBlocked(120.5*T,120.5*T)!==true)throw Error('sail on land');state.buildings.push({x:122,y:120,type:'palisada'});buildingIndexSource=null;if(!playerMovementBlocked(122.5*T,120.5*T))throw Error('wall crossing');state.buildings=[];buildingIndexSource=null;
const start=state.p.y;keys={s:true};for(let i=0;i<10;i++)simulationStep(.05);keys={};if(state.p.y<=start||b.y!==state.p.y)throw Error('sailing movement');const p={...state.p};if(rescuePlayer()||state.p.x!==p.x||state.p.y!==p.y)throw Error('save rescue on water');let reloadWater;for(let x=120;x<150&&!reloadWater;x++)for(let y=115;y<130&&!reloadWater;y++)if(oldTerrain(x,y)==='water')reloadWater={x:(x+.5)*T,y:(y+.5)*T};globalThis.boatReloadJSON=JSON.stringify({...state,p:reloadWater,playerBoat:{...b,...reloadWater,aboard:true}});if(!JSON.parse(JSON.stringify(state)).playerBoat.aboard)throw Error('saved boarding');state.p={x:123.5*T,y:121.5*T};b.x=state.p.x;b.y=state.p.y;if(leavePersonalBoat())throw Error('disembark far from land');state.p={x:121.5*T,y:120.5*T};b.x=state.p.x;b.y=state.p.y;if(!leavePersonalBoat()||b.aboard||terrain(Math.floor(state.p.x/T),Math.floor(state.p.y/T))==='water')throw Error('shore landing');const parked={x:b.x,y:b.y};if(!boardPersonalBoat())throw Error('reboarding');$('home').onclick();if(b.aboard||b.x!==parked.x||b.y!==parked.y)throw Error('home teleports boat');
`,sandbox);console.log('PASS boat cost, boarding, player-only water movement, collision, save recovery, landing, reboarding and home');

const reloadSandbox={...sandbox,localStorage:{getItem:()=>sandbox.boatReloadJSON,setItem:()=>{}}};vm.createContext(reloadSandbox);
for(const file of [...fs.readFileSync(__filename,'utf8').matchAll(/vm.runInContext\(fs.readFileSync\('([^']+)'/g)].map(m=>m[1]))vm.runInContext(fs.readFileSync(file,'utf8'),reloadSandbox);
vm.runInContext(`if(!state.playerBoat.aboard||state.p.x!==JSON.parse(boatReloadJSON).p.x)throw Error('reload lost boat');armCommand('repair');if($('commandBar').style.display!=='none')throw Error('repair overlay visible');setMode(null);if(commandDraft!==null||$('commandBar').style.display!=='none')throw Error('cancel repair');`,reloadSandbox);
console.log('PASS reload afloat and removed repair overlay/cancel');
