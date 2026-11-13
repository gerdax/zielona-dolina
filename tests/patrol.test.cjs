const fs=require('fs'),vm=require('vm'),assert=require('assert');
const noop=()=>{},els=new Map();let saved={p:{x:120.5*48,y:120.5*48},wood:500,stone:300,food:500,gold:0,cut:[],buildings:[{x:118,y:120,type:'start'},{x:119,y:120,type:'dom'}],seen:[],settled:{x:120,y:120},chopped:7,time:0,open:true};
const oldBuildings=JSON.stringify(saved.buildings),oldResources=[saved.wood,saved.stone,saved.food];
const ctx=new Proxy({measureText:s=>({width:s.length*6})},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
function el(id){if(!els.has(id))els.set(id,{textContent:'',innerHTML:'',style:{},classList:{contains:()=>true,add:noop,remove:noop,toggle:noop},append:noop,dataset:{},getContext:()=>ctx});return els.get(id)}
const sandbox={document:{getElementById:el,querySelectorAll:()=>[],createElement:()=>el(Math.random())},localStorage:{getItem:()=>JSON.stringify(saved),setItem:(k,v)=>saved=JSON.parse(v)},window:{addEventListener:noop},performance:{now:()=>0},setTimeout:noop,clearTimeout:noop,setInterval:noop,requestAnimationFrame:noop,innerWidth:1280,innerHeight:800,devicePixelRatio:1,console};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/war.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/patrol.js','utf8'),sandbox);
function run(code){vm.runInContext('{'+code+'}',sandbox)}
run(`
state.war.soldiers=2;state.buildings=[{x:121,y:120,type:'werbunek'}];state.settled={x:120,y:120};cut=new Set();seen=new Set();for(let x=110;x<135;x++)for(let y=110;y<135;y++){cut.add(tileKey(x,y));seen.add(tileKey(x,y))}let total=armyTotal();
if(beginPatrol(3)||beginPatrol(0))throw Error('Invalid size accepted');if(!beginPatrol(2)||!choosePatrolPoint(120,121)||!choosePatrolPoint(125,121))throw Error('Patrol could not start');
if(state.war.soldiers!==0||patrolCount()!==2||armyTotal()!==total)throw Error('Troops duplicated/lost');let p=state.war.patrols[0];let start=p.units[0].x;for(let i=0;i<220;i++)updatePatrols(.05);if(p.units[0].x===start)throw Error('No patrol walking');let toB=p.units.some(u=>u.goal==='b');for(let i=0;i<240;i++)updatePatrols(.05);if(!p.units.some(u=>u.goal==='a')&&!toB)throw Error('No return loop');
if(beginPatrol(1)||launchExpedition(state.towns[0].id,1))throw Error('Patrolling troops reused');state.war.queue=Array.from({length:4},()=>({remaining:8}));if(recruitSoldier())throw Error('Patrol bypasses army cap');state.war.queue=[];
let snap=JSON.parse(localStorage.getItem(KEY));save();snap=JSON.parse(localStorage.getItem(KEY));if(snap.war.patrols[0].units.length!==2)throw Error('Patrol not saved');state.war=snap.war;initPatrols();let id=state.war.patrols[0].id;if(!recallPatrol(id)||state.war.soldiers!==2||patrolCount()!==0||recallPatrol(id))throw Error('Recall duplicated/lost troops');
console.log('PASS 1/2 size validation, two-point route, walking/return, reserved troops, army capacity, save/resume, safe recall');
`);
run(`
if(!beginPatrol(1))throw Error('Single patrol unavailable');choosePatrolPoint(120,121);if(choosePatrolPoint(120,121))throw Error('Identical endpoints accepted');if(choosePatrolPoint(0,0))throw Error('Unseen/far endpoint accepted');cancelPatrolDraft();if(patrolDraft||state.war.soldiers!==2)throw Error('Cancel spent soldiers');
state.buildings=[{x:121,y:120,type:'werbunek'}];for(let x=118;x<=126;x++)for(const y of [118,124])state.buildings.push({x,y,type:'palisada'});for(let y=119;y<=123;y++)for(const x of [118,126])state.buildings.push({x,y,type:'palisada'});let gate=building(122,118);gate.type='brama';gate.open=true;
beginPatrol(1);choosePatrolPoint(122,119);if(!choosePatrolPoint(122,116))throw Error('Open gate rejected');let p=state.war.patrols[0],u=p.units[0];u.x=122.5*T;u.y=119.5*T;u.goal='b';u.wait=0;u.path=[];gate.open=false;for(let i=0;i<100;i++)updatePatrols(.05);if(u.y<119*T||!u.blocked)throw Error('Patrol crossed closed gate');gate.open=true;for(let i=0;i<200;i++)updatePatrols(.05);if(u.y>=119*T)throw Error('Patrol failed to resume');
let x=u.x,y=u.y;state.war.raids=[{route:[{x:x/T,y:y/T},{x:x/T,y:y/T}],progress:0,power:8}];u.wait=0;updatePatrols(.05);if(state.war.raids[0].power>=8)throw Error('Patrol did not intercept raider');state.war.raids=[];
state.settled={x:122,y:118};if(patrolDefenders()!==1)throw Error('Patrol not counted in local defence');let before=armyTotal();loseDefenders(2);if(armyTotal()!==before-2)throw Error('Defender casualties duplicated');drawPatrols();
console.log('PASS cancel, invalid points, closed-gate wait/resume, raider interception, local defence and casualties');
`);
