const fs=require('fs'),vm=require('vm'),assert=require('assert');
const noop=()=>{},els=new Map();let saved={p:{x:120.5*48,y:120.5*48},wood:500,stone:300,food:500,gold:0,cut:[],buildings:[{x:118,y:120,type:'start'},{x:119,y:120,type:'dom'}],seen:[],settled:{x:120,y:120},chopped:7,time:0,open:true};
const oldBuildings=JSON.stringify(saved.buildings),oldResources=[saved.wood,saved.stone,saved.food];
const ctx=new Proxy({measureText:s=>({width:s.length*6})},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
function el(id){if(!els.has(id))els.set(id,{textContent:'',innerHTML:'',style:{},classList:{contains:()=>true,add:noop,remove:noop,toggle:noop},append:noop,dataset:{},getContext:()=>ctx});return els.get(id)}
const sandbox={document:{getElementById:el,querySelectorAll:()=>[],createElement:()=>el(Math.random())},localStorage:{getItem:()=>JSON.stringify(saved),setItem:(k,v)=>saved=JSON.parse(v)},window:{addEventListener:noop},performance:{now:()=>0},setTimeout:noop,clearTimeout:noop,setInterval:noop,requestAnimationFrame:noop,innerWidth:1280,innerHeight:800,devicePixelRatio:1,console};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/war.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/patrol.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/commerce.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/strategy.js','utf8'),sandbox);

vm.runInContext(`{
state.settled={x:120,y:120};state.buildings=[];for(let x=116;x<=124;x++)for(const y of [116,124])state.buildings.push({x,y,type:'palisada'});for(let y=117;y<124;y++)for(const x of [116,124])state.buildings.push({x,y,type:'palisada'});
state.towns=[{id:'ally',name:'Sojusznik',x:110,y:120,relation:'allied',aidCooldown:0}];state.war.support=[];state.war.raids=[{townId:'enemy',route:[{x:115.5,y:120.5}],progress:0,power:20}];const original=campaignRoute;let calls=0;campaignRoute=(...a)=>{calls++;return original(...a)};for(let i=0;i<3;i++)updateSupport(1/60);campaignRoute=original;if(calls>1)throw Error('Unreachable allied route searched every frame: '+calls);let visited=0;const oldTerrain=terrain;terrain=(...a)=>{visited++;return oldTerrain(...a)};if(campaignRoute({x:110,y:120},{x:120,y:120},true)!==null)throw Error('Closed wall ignored');terrain=oldTerrain;if(visited>1000)throw Error('Sealed village still scans whole map: '+visited);const gate=building(116,120);gate.type='brama';gate.open=true;updateSupport(15);if(state.war.support.length!==1)throw Error('Ally fails to resume after reopening');console.log('PASS one retry per interval, sealed village search stays local, reopening resumes support');
}`,sandbox);
