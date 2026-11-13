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
vm.runInContext(fs.readFileSync('dist/orc-scouts.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/orc-architecture.js','utf8'),sandbox);
vm.runInContext(`{
const originalBlocked=blocked,originalNatural=natural,oldCut=[...cut].join();blocked=(x,y)=>Math.floor(y/T)!==120||Math.floor(x/T)<120||Math.floor(x/T)>125;natural=(x,y)=>y===120&&x===121?'tree':y===120&&x===122?'rock':null;
const u={x:120.5*T,y:120.5*T,hp:8,kind:'melee',path:[],order:{kind:'move',x:125,y:120}},goal={x:125,y:120};
if(!unitWalkable(u,121,120)||!unitWalkable(u,122,120)||unitWalkable(u,121,121))throw Error('military walkability');
if(findRoute({x:u.x,y:u.y},goal,true)!==null||findRoute({x:u.x,y:u.y,hp:40,kind:'ram'},goal,true)!==null)throw Error('civilian/engine changed');
const route=findRoute(u,goal,true);if(!route||route.length!==5)throw Error('soldier fails tree/rock corridor');
let path=planUnitRoute(u,goal,true);for(let i=0;i<100&&path===undefined;i++){processUnitPlans();path=planUnitRoute(u,goal,true)}if(!path||path.length!==5)throw Error('async route differs');u.path=path;for(let i=0;i<100;i++)stepOrder(u,goal,.1,96);if(Math.abs(u.x-125.5*T)>3)throw Error('soldier stopped at natural obstacle');
if([...cut].join()!==oldCut)throw Error('forest destroyed');blocked=originalBlocked;natural=originalNatural;
const wall={x:110,y:110,type:'palisada'};state.buildings.push(wall);buildingIndexSource=null;if(unitWalkable(u,110,110))throw Error('wall ignored');wall.type='brama';wall.open=false;if(unitWalkable(u,110,110))throw Error('closed gate ignored');wall.open=true;if(!unitWalkable(u,110,110))throw Error('open gate blocks');
}`,sandbox);console.log('PASS soldier/async/order movement through tree and rock, preserved civilians/engines/forest and wall/gate collision');
