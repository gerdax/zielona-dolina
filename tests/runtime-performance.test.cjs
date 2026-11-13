const fs=require('fs'),vm=require('vm'),assert=require('assert');
const noop=()=>{},els=new Map();let saved={p:{x:120.5*48,y:120.5*48},wood:500,stone:300,food:500,gold:0,cut:[],buildings:[{x:118,y:120,type:'start'},{x:119,y:120,type:'dom'}],seen:[],settled:{x:120,y:120},chopped:7,time:0,open:true};
const oldBuildings=JSON.stringify(saved.buildings),oldResources=[saved.wood,saved.stone,saved.food];
const ctx=new Proxy({measureText:s=>({width:s.length*6})},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
function el(id){if(!els.has(id))els.set(id,{textContent:'',innerHTML:'',style:{},classList:{contains:()=>true,add:noop,remove:noop,toggle:noop},append:noop,dataset:{},getContext:()=>ctx});return els.get(id)}
const sandbox={document:{getElementById:el,querySelectorAll:()=>[],createElement:()=>el(Math.random())},localStorage:{getItem:()=>JSON.stringify(saved),setItem:(k,v)=>saved=JSON.parse(v)},window:{addEventListener:noop},performance:{now:()=>0},setTimeout:noop,clearTimeout:noop,setInterval:noop,requestAnimationFrame:noop,innerWidth:1280,innerHeight:800,devicePixelRatio:1,console};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/war.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/patrol.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/commerce.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/strategy.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/kingdom.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/selection.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/atlas.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/frontier.js','utf8'),sandbox);
vm.runInContext(`{
state.buildings=[];state.towns=[];rebuildForeignIndex();let visits=0;const originalTerrain=terrain;terrain=(...a)=>{visits++;return originalTerrain(...a)};const route=campaignRoute({x:20,y:20},{x:600,y:600},true);if(route.length!==1161||visits>20000)throw Error('Distant route floods world: '+visits);for(let i=1;i<route.length;i++)if(Math.abs(route[i].x-route[i-1].x)+Math.abs(route[i].y-route[i-1].y)!==1)throw Error('Invalid route step');
visits=0;for(let x=116;x<=124;x++)for(const y of [116,124])state.buildings.push({x,y,type:'palisada'});for(let y=117;y<124;y++)for(const x of [116,124])state.buildings.push({x,y,type:'palisada'});if(campaignRoute({x:120,y:120},{x:600,y:600},true)!==null||visits>1500)throw Error('Enclosed source scans world: '+visits);terrain=originalTerrain;
state.buildings=[];cut=new Set;for(let x=110;x<135;x++)for(let y=110;y<135;y++)cut.add(tileKey(x,y));const originalRoute=findRoute;let calls=0;findRoute=(...a)=>{calls++;return originalRoute(...a)};const units=Array.from({length:20},(_,i)=>({x:120.5*T,y:(120.5+i%2)*T}));for(let frame=0;frame<60;frame++)for(const u of units)cachedDefenderStep(u,{x:125,y:120},1/60);if(calls>40||units.some(u=>u.x<=120.5*T))throw Error('Combat repeats route per frame: '+calls);const previous=calls;cachedDefenderStep(units[0],{x:124,y:120},1/60);if(calls!==previous+1)throw Error('Moved target route stale');findRoute=originalRoute;
let writes=0;const originalWrite=localStorage.setItem;localStorage.setItem=(...a)=>{writes++;originalWrite(...a)};const step=simulationStep;simulationStep=()=>{for(let i=0;i<20;i++)save()};state.clock.paused=false;advanceSimulation(.01);if(writes||!simulationSavePending)throw Error('Simulation writes storage repeatedly');save();if(writes!==1||simulationSavePending)throw Error('Explicit save does not flush');simulationStep=step;localStorage.setItem=originalWrite;
console.log('PASS distant shortest campaign uses bounded work, enclosed source rejected locally, 20 chasing soldiers reuse routes and react to moved target, simulation saves coalesce while explicit saves persist');
}`,sandbox);
