const fs=require('fs'),vm=require('vm'),assert=require('assert');
const noop=()=>{},els=new Map();let saved={p:{x:120.5*48,y:120.5*48},wood:500,stone:300,food:500,gold:0,cut:[],buildings:[{x:118,y:120,type:'start'},{x:119,y:120,type:'dom'}],seen:[],settled:{x:120,y:120},chopped:7,time:0,open:true};
const oldBuildings=JSON.stringify(saved.buildings),oldResources=[saved.wood,saved.stone,saved.food];
const ctx=new Proxy({measureText:s=>({width:s.length*6})},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
function el(id){if(!els.has(id))els.set(id,{textContent:'',innerHTML:'',style:{},classList:{contains:()=>true,add:noop,remove:noop,toggle:noop},append:noop,dataset:{},getContext:()=>ctx});return els.get(id)}
const sandbox={document:{getElementById:el,querySelectorAll:()=>[],createElement:()=>el(Math.random())},localStorage:{getItem:()=>JSON.stringify(saved),setItem:(k,v)=>saved=JSON.parse(v)},window:{addEventListener:noop},performance:{now:()=>0},setTimeout:noop,clearTimeout:noop,setInterval:noop,requestAnimationFrame:noop,innerWidth:1280,innerHeight:800,devicePixelRatio:1,console};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/war.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/patrol.js','utf8'),sandbox);

vm.runInContext(`{
if(state.towns.length!==100||new Set(state.towns.map(t=>t.id)).size!==100)throw Error('New world needs 100 unique towns');
const original=state.towns.slice(0,4);original[0].relation='war';original[0].raidTimer=27;original[1].relation='conquered';original[1].marketStock={wood:23,stone:17,food:11};original[2].discovered=true;
state.towns=original;const before=JSON.stringify(original),buildings=JSON.stringify(state.buildings),resources=[state.wood,state.food,state.gold].join();completeTownMap();
if(state.towns.length!==100||JSON.stringify(state.towns.slice(0,4))!==before||JSON.stringify(state.buildings)!==buildings||[state.wood,state.food,state.gold].join()!==resources)throw Error('Migration changed player or old diplomacy');
for(const t of state.towns.slice(4)){if(terrain(t.x,t.y)!=='grass'||t.x<6||t.x>=N-6||state.buildings.some(b=>Math.hypot(t.x-b.x,t.y-b.y)<=14)||state.towns.some(o=>o!==t&&Math.hypot(t.x-o.x,t.y-o.y)<28))throw Error('Unsafe town placement')}
const snapshot=JSON.stringify(state.towns);completeTownMap();if(JSON.stringify(state.towns)!==snapshot)throw Error('Migration not idempotent');save();state.towns=JSON.parse(localStorage.getItem(KEY)).towns;initWar();if(JSON.stringify(state.towns)!==snapshot)throw Error('Save reload changes towns');
if(!state.towns.some(t=>t.x>500)||!state.towns.some(t=>t.y>500)||!state.towns.some(t=>t.x<100))throw Error('Towns not distributed across map');
state.towns=state.towns.slice(0,99);completeTownMap();if(state.towns.length!==100||new Set(state.towns.map(t=>t.id)).size!==100)throw Error('Partial migration duplicate ID');
console.log('PASS 100 towns, unique IDs, spread, safe placement, preserved village/diplomacy/stock, idempotence, save/reload and partial migration');
}`,sandbox);
