const fs=require('fs'),vm=require('vm'),assert=require('assert');
const noop=()=>{},els=new Map();let saved={p:{x:120.5*48,y:120.5*48},wood:500,stone:300,food:500,gold:0,cut:[],buildings:[{x:118,y:120,type:'start'},{x:119,y:120,type:'dom'}],seen:[],settled:{x:120,y:120},chopped:7,time:0,open:true};
const oldBuildings=JSON.stringify(saved.buildings),oldResources=[saved.wood,saved.stone,saved.food];
const ctx=new Proxy({measureText:s=>({width:s.length*6}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
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

vm.runInContext(fs.readFileSync('dist/story.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/adventure.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/roaming.js','utf8'),sandbox);

vm.runInContext(fs.readFileSync('dist/life.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/services.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/building-art.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/player-boat.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/river-adventure.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/island-life.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/tactics.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/desert.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/victory.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/orc-scouts.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/orc-architecture.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/field-selection.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/command-feedback.js','utf8'),sandbox);
vm.runInContext(`{
state.towns=[];rebuildForeignIndex();state.buildings=[];buildingIndexSource=null;state.war.raids=[];state.war.engines=[];state.war.patrols=[];state.war.expedition=null;terrain=()=> 'grass';cut=new Set;seen=new Set;for(let x=90;x<150;x++)for(let y=90;y<150;y++){cut.add(tileKey(x,y));seen.add(tileKey(x,y))}state.p={x:120.5*T,y:120.5*T};
state.war.soldiers=12;state.war.guards=Array.from({length:12},(_,i)=>({uid:'feedback-'+i,kind:'melee',hp:8,x:(116.5+i%4)*T,y:(116.5+Math.floor(i/4))*T,path:[],formation:'loose'}));
const units=state.war.guards;selectedUnits=new Set(units.slice(0,10).map(u=>u.uid));armCommand('move');
const preview=commandPreview(124,123),before=JSON.stringify(units);if(preview.spots.length!==10||JSON.stringify(units)!==before)throw Error('Preview changes units or loses members');
if(!issueMapCommand(124,123)||commandMarker.x!==124||commandMarker.y!==123||commandMarker.units.length!==10)throw Error('Missing command marker');
for(let i=0;i<10;i++)if(units[i].order.x!==preview.spots[i].x||units[i].order.y!==preview.spots[i].y)throw Error('Preview differs from issued order');
units[0].blocked=true;showCommandBar();if(!feedbackText.textContent.includes('1/10'))throw Error('Blocked count absent');clearCommands();if(units.slice(0,10).some(u=>u.order||u.blocked)||commandMarker)throw Error('Stop leaves stale warnings');
seen.delete(tileKey(125,124));state.time+=1;if(commandPreview(125,124).spots.length)throw Error('Preview reveals fog');armCommand('move');if(issueMapCommand(125,124)||commandMarker)throw Error('Failed order leaves marker');
state.war.patrols=[{id:'p',units:[{uid:'patrol-rally',kind:'melee',hp:8,x:120*T,y:120*T,path:[]}]}];const total=armyTotal(),money=[state.gold,state.wood,state.food].join();if(!rallyTroops()||selectedActors().length!==10||armyTotal()!==total||[state.gold,state.wood,state.food].join()!==money)throw Error('Rally accounting/cost/cap');if(state.war.patrols.length)throw Error('Rally does not detach nearby patrol');
const gathered=selectedActors().slice(),orders=gathered.map(u=>({...u.order}));for(let frame=0;frame<900;frame++){processUnitPlans();for(const u of gathered)handleUnitOrder(u,.05)}for(let i=0;i<gathered.length;i++)if(gathered[i].order||Math.hypot(gathered[i].x-(orders[i].x+.5)*T,gathered[i].y-(orders[i].y+.5)*T)>3)throw Error('Rally failed to arrive');
// Enclose one selected unit; waiting must be reported and clear after reopening.
const trapped=gathered[0];trapped.x=120.5*T;trapped.y=120.5*T;state.buildings=[{x:119,y:120,type:'palisada'},{x:121,y:120,type:'palisada'},{x:120,y:119,type:'palisada'},{x:120,y:121,type:'brama',open:false}];buildingIndexSource=null;selectedUnits=new Set([trapped.uid]);armCommand('move');issueMapCommand(124,123);for(let i=0;i<100;i++){processUnitPlans();handleUnitOrder(trapped,.05)}showCommandBar();if(!trapped.blocked||!feedbackText.textContent.includes('1/1'))throw Error('Unreachable goal not reported');state.buildings[3].open=true;for(let i=0;i<700;i++){processUnitPlans();handleUnitOrder(trapped,.05)}showCommandBar();if(trapped.order||trapped.blocked||feedbackText.textContent)throw Error('Reopened route remains blocked');
selectedUnits.clear();state.war.guards=[];state.war.soldiers=0;state.war.patrols=[];if(rallyTroops())throw Error('Empty rally succeeds');
console.log('PASS preview equals 10 actual goals without side effects, success-only markers, stop cleanup, fog, rally cap/accounting/patrol detachment/arrival, sealed gate warning and recovery, empty rally');
}`,sandbox);
