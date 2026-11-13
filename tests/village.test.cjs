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

vm.runInContext(fs.readFileSync('dist/village.js','utf8'),sandbox);
vm.runInContext(`
if(buildLine({x:1,y:1},{x:4,y:1}).length!==4)throw Error('line');
if(buildLine({x:1,y:1},{x:500,y:1}).length!==64)throw Error('bound');
state.buildings.push(...Array.from({length:5},(_,i)=>({x:110+i,y:110,type:'dom'})));
const gold=state.gold;if(!claimVillageGoal('homes')||claimVillageGoal('homes')||state.gold!==gold+50)throw Error('reward');
setVillageAlarm(true);if(!state.village.alarm)throw Error('alarm');updateResidents(.1);setVillageAlarm(false);if(state.village.alarm)throw Error('all clear');
state.buildings.push({x:100,y:100,type:'ruiny',originalType:'dom'});const backup=JSON.stringify({format:'zielona-dolina',version:1,state});if(validateVillageBackup(backup).wood!==state.wood)throw Error('backup');
let rejected=false;try{validateVillageBackup('{}')}catch{rejected=true}if(!rejected)throw Error('invalid backup accepted');
state.frontier.elapsed=550;state.village.winterSeconds=0;simulationStep(.05);if(state.village.winterSeconds!==.05)throw Error('winter clock');
`,sandbox);console.log('Village tools passed');
