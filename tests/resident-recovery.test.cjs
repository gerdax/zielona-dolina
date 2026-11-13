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
state.towns=[];rebuildForeignIndex();state.buildings=[];cut=new Set;for(let x=70;x<140;x++)for(let y=90;y<140;y++)cut.add(tileKey(x,y));for(let x=100;x<=134;x++)for(const y of [90,140])state.buildings.push({x,y,type:'palisada'});for(let y=91;y<140;y++)for(const x of [100,134])state.buildings.push({x,y,type:'palisada'});const job={x:94,y:120,type:'drwal'};state.buildings.push(job);buildingIndexSource=null;residents=[{id:0,x:120.5*T,y:120.5*T,path:[],home:{x:120,y:120}},{id:1,x:94.5*T,y:122.5*T,path:[],home:{x:94,y:122}}];residentAssignmentTask=assignResidentJobs([job]);for(let i=0;i<3;i++)processResidentPlanning();if(residents[1].job!==job||residents[0].job)throw Error('Blocked first resident held up reachable worker');
state.buildings=[{x:120,y:120,type:'dom'},{x:121,y:120,type:'dom'},{x:122,y:120,type:'dom'},{x:120,y:123,type:'drwal'}];buildingIndexSource=null;state.settled={x:119,y:120};residents=[];peopleSignature='';syncResidents();if(residents.some(r=>building(r.home.x,r.home.y)?.type==='dom'))throw Error('Home hidden inside building');for(let i=0;i<200;i++)updateResidents(.05);if(!residents.some(r=>r.job))throw Error('Visible homes do not work');
state.buildings=[];buildingIndexSource=null;for(let x=20;x<100;x++)for(let y=115;y<126;y++)cut.add(tileKey(x,y));const r={x:30.5*T,y:120.5*T,path:[],home:{x:30,y:120}};residents=[r];residentRouteQueue=[];residentAssignmentTask=null;requestResidentRoute(r,{x:90,y:120},'praca');for(let i=0;i<300&&r.routePending;i++)processResidentPlanning();if(!r.path.length||r.routePending)throw Error('Large village route still limited to 45');
console.log('PASS blocked worker does not stall others, visible house exits, employment and long village routes');
`,sandbox);