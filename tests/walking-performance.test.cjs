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

vm.runInContext(`
state.towns=[];rebuildForeignIndex();state.buildings=Array.from({length:100},(_,i)=>({x:100+i%10*3,y:100+Math.floor(i/10)*3,type:'wieza'}));state.war.soldiers=0;state.war.guards=[];state.war.raids=[];state.war.aiGrace=1e6;state.war.aiCooldown=1e6;seen=new Set;const add=seen.add.bind(seen);let adds=0;seen.add=k=>{adds++;return add(k)};updateWar(1.01);if(adds>256)throw Error('tower burst');for(let i=0;i<300;i++)processTowerVision();const size=seen.size;adds=0;for(let i=0;i<10;i++)updateWar(1.01);if(adds!==0||seen.size!==size)throw Error('unchanged tower repeated');seen=new Set;queueTowerVision();processTowerVision();if(!seen.size)throw Error('seen replacement');
const resource=$('resources');let writes=0,value='';Object.defineProperty(resource,'innerHTML',{get:()=>value,set:v=>{writes++;value=v},configurable:true});uiHTMLCache.clear();ui();const first=writes;ui();if(writes!==first)throw Error('HUD redraw without change');state.wood+=1;ui();if(writes!==first+1)throw Error('HUD not refreshed');
state.buildings=[];for(let x=116;x<=124;x++)for(const y of [116,124])state.buildings.push({x,y,type:'palisada'});for(let y=117;y<124;y++)for(const x of [116,124])state.buildings.push({x,y,type:'palisada'});buildingIndexSource=null;cut=new Set;const u={x:120.5*T,y:120.5*T};const oldRoute=findRoute;findRoute=()=>{throw Error('synchronous route called')};cachedDefenderStep(u,{x:130,y:120},.05,'home');for(let i=0;i<30;i++){processUnitPlans();cachedDefenderStep(u,{x:130,y:120},.05,'home')}findRoute=oldRoute;
console.log('PASS 256-tile tower budget, no repeated reveal, HUD updates only on change, blocked garrison plans asynchronously');
`,sandbox);