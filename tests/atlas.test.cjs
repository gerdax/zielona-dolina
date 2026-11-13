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
function run(code){vm.runInContext('{'+code+'}',sandbox)}
run(`
if(state.clock.speed!==1||state.clock.paused)throw Error('Clock migration');
const originalStep=simulationStep,steps=[];simulationStep=dt=>steps.push(dt);
for(const speed of [1,2,3]){setGameSpeed(speed);steps.length=0;const advanced=advanceSimulation(.05);if(steps.length!==speed||steps.some(dt=>dt!==.05)||Math.abs(advanced-speed*.05)>1e-9)throw Error('Unsafe time scaling');}
togglePause();steps.length=0;if(advanceSimulation(.05)!==0||steps.length)throw Error('Pause still simulates');
setGameSpeed(2);if(!state.clock.paused||setGameSpeed(9))throw Error('Invalid speed or resumed by speed change');
save();const stored=JSON.parse(localStorage.getItem(KEY));if(!stored.clock.paused||stored.clock.speed!==2)throw Error('Clock persistence');
simulationStep=originalStep;const before=state.time;advanceSimulation(.05);if(state.time!==before)throw Error('Paused time advances');
togglePause();advanceSimulation(.05);if(Math.abs(state.time-before-.1)>1e-9)throw Error('Actual simulation speed');
const rect={left:10,top:20,width:800,height:500},g=atlasGeometry(800,500);let point=atlasPoint(rect.left+g.x+g.size/2,rect.top+g.y+g.size/2,rect);if(point.x!==320||point.y!==320||atlasPoint(10,20,rect)!==null)throw Error('Map coordinate mapping');
atlasSelected={kind:'point',label:'Punkt',x:300,y:301};atlasWaypoint();if(state.clock.mapTarget.x!==300||state.clock.mapTarget.y!==301)throw Error('Coordinate waypoint');clearWaypoint();if(state.clock.mapTarget)throw Error('Waypoint removal');
state.war.raids=[{townId:'hidden',route:[{x:500,y:500}],progress:0,power:5}];seen=new Set;if(atlasEntities().some(e=>e.type==='raid'))throw Error('Hidden enemy leaked');seen.add(tileKey(500,500));if(!atlasEntities().some(e=>e.type==='raid'))throw Error('Visible enemy omitted');
console.log('PASS clock migration, pause, persisted speed, safe substeps, actual simulation, map coordinates, waypoint removal, enemy visibility');
`);
