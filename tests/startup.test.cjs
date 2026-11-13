const fs=require('fs'),vm=require('vm'),assert=require('assert');
const noop=()=>{},els=new Map();let saved={p:{x:120.5*48,y:120.5*48},wood:500,stone:300,food:500,gold:0,cut:[],buildings:[{x:118,y:120,type:'start'},{x:119,y:120,type:'dom'}],seen:[],settled:{x:120,y:120},chopped:7,time:0,open:true};
const oldBuildings=JSON.stringify(saved.buildings),oldResources=[saved.wood,saved.stone,saved.food];
const ctx=new Proxy({measureText:s=>({width:s.length*6})},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
function el(id){if(!els.has(id))els.set(id,{textContent:'',innerHTML:'',style:{},classList:{contains:()=>true,add:noop,remove:noop,toggle:noop},append:noop,dataset:{},getContext:()=>ctx});return els.get(id)}
const sandbox={document:{getElementById:el,querySelectorAll:()=>[],createElement:()=>el(Math.random())},localStorage:{getItem:()=>JSON.stringify(saved),setItem:(k,v)=>saved=JSON.parse(v)},window:{addEventListener:noop},performance:{now:()=>0},setTimeout:noop,clearTimeout:noop,setInterval:noop,requestAnimationFrame:noop,innerWidth:1280,innerHeight:800,devicePixelRatio:1,console};vm.createContext(sandbox);let scheduled=0;const readyHandlers=[];sandbox.document.readyState='loading';sandbox.requestAnimationFrame=()=>scheduled++;sandbox.window.addEventListener=(event,handler)=>{if(event==='DOMContentLoaded')readyHandlers.push(handler)};saved.kingdom={caravans:[{id:'saved-caravan',townId:'saved-town',route:[{x:130,y:120},{x:131,y:120}],progress:0,phase:'outbound',escorts:[],hp:50}],fleet:[]};saved.buildings.push({x:124,y:120,type:'brama_swoi'});
vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);
assert.equal(scheduled,0,'World starts before dependency scripts');assert.equal(readyHandlers.length,1);
assert.throws(()=>vm.runInContext('gateVisualOpen(building(124,120))',sandbox),/routePosition is not defined/,'Saved caravan must reproduce premature-render error');
for(const file of ['war','patrol','commerce','strategy','kingdom','selection','atlas','frontier'])vm.runInContext(fs.readFileSync('dist/'+file+'.js','utf8'),sandbox);
readyHandlers[0]();assert.equal(scheduled,1);readyHandlers[0]();assert.equal(scheduled,1,'Duplicate game loop');
vm.runInContext('draw();gateVisualOpen(building(124,120));loop(16)',sandbox);assert.equal(scheduled,2,'Next frame not scheduled');
console.log('PASS delayed scripts: saved caravan reproduces original error, no premature frame, dependency-safe startup, gate rendering and continuing single loop');
