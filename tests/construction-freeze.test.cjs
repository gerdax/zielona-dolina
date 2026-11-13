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
function run(code){vm.runInContext('{'+code+'}',sandbox)}
run(`
state.settled={x:120,y:120};state.buildings=[{x:118,y:120,type:'start'},{x:120,y:123,type:'drwal'},{x:121,y:123,type:'zelazo'}];state.towns=[];rebuildForeignIndex();residents=[];peopleSignature='';cut=new Set;for(let x=90;x<140;x++)for(let y=90;y<150;y++)cut.add(tileKey(x,y));syncResidents();if(residents.some(r=>r.job))throw Error('Assignments still synchronous');for(let i=0;i<60;i++)updateResidents(.05);if(residents.filter(r=>r.job).length!==2)throw Error('Planning does not assign workers');
const r=residents.find(r=>r.job.type==='drwal');r.phase='praca';r.path=[];r.progress=4;r.wait=0;const workplace=r.job;state.buildings.push({x:123,y:123,type:'sklad'});syncResidents();const kept=residents.find(u=>u.id===r.id);if(kept.job!==workplace||kept.phase!=='praca'||kept.progress!==4)throw Error('Non-work building resets workers');updateResidents(.05);if((workLedger.get('120,123')||0)<=0)throw Error('Existing production interrupted');
state.buildings=state.buildings.filter(b=>b!==workplace);syncResidents();if(residents.some(r=>r.job===workplace))throw Error('Demolished workplace retained');
state.buildings=[];for(let x=100;x<=134;x++)for(const y of [80,160])state.buildings.push({x,y,type:'palisada'});for(let y=81;y<160;y++)for(const x of [100,134])state.buildings.push({x,y,type:'palisada'});state.buildings.push({x:95,y:120,type:'drwal'});state.settled={x:120,y:120};residents=[];peopleSignature='';const originalWalk=npcWalkable;let walks=0;npcWalkable=(...args)=>{walks++;return originalWalk(...args)};syncResidents();if(walks>300)throw Error('Construction performs full searches');walks=0;processResidentPlanning();if(walks>2500)throw Error('Planning exceeds node budget: '+walks);if(!residentAssignmentTask)throw Error('Unreachable search did not yield');npcWalkable=originalWalk;
// A second construction cancels any in-flight search for a deleted workplace.
state.buildings=state.buildings.filter(b=>b.type!=='drwal');syncResidents();for(let i=0;i<5;i++)processResidentPlanning();if(residents.some(r=>r.routePending)||residentAssignmentTask)throw Error('Cancelled planning leaves residents locked');
console.log('PASS asynchronous job assignment, preserved jobs/progress/production after building, demolished-job cleanup, bounded unreachable search, cancellation during further construction');
`);
