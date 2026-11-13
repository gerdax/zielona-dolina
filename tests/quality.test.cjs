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
state.buildings=[{x:118,y:120,type:'start'}];buildingIndexSource=null;cut=new Set;for(let x=100;x<140;x++)for(let y=100;y<140;y++)cut.add(tileKey(x,y));
if(!constructionHint(130,130,'dom').includes('Za daleko'))throw Error('range hint');
state.wood=0;if(!constructionHint(121,121,'dom').includes('Brakuje'))throw Error('cost hint');state.wood=500;
const u={x:120.5*T,y:120.5*T,path:[],hp:8};if(planUnitRoute(u,{x:124,y:124},true)!==undefined)throw Error('must yield');
let path;for(let i=0;i<100;i++){processUnitPlans();path=planUnitRoute(u,{x:124,y:124},true);if(path!==undefined)break}if(!path?.length)throw Error('route completion');
u.order={kind:'move',x:125,y:120};for(let i=0;i<200;i++){processUnitPlans();handleUnitOrder(u,.05)}if(Math.abs(u.x/T-125.5)>.1)throw Error('walk order');
const p={x:120.5*T,y:120.5*T};planUnitRoute(p,{x:124,y:124},true);cancelUnitRoute(p);if(unitPlanQueue.some(x=>x.u===p&&!x.cancelled))throw Error('cancellation');
state.war.raids=[{townId:state.towns[0].id,power:10,route:[{x:130,y:120},{x:131,y:120}],progress:0}];if(!nearestRaidWarning().includes('wschodu'))throw Error('direction');
`,sandbox);console.log('PASS yielding military routes, completion, movement, cancellation, construction hints and raid direction');
