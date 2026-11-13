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
vm.runInContext(fs.readFileSync('dist/construction.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/village-defense.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/wall-defenders.js','utf8'),sandbox);
vm.runInContext(`{
state.towns=[];rebuildForeignIndex();terrain=()=> 'grass';cut=new Set;seen=new Set;for(let x=100;x<145;x++)for(let y=100;y<145;y++){cut.add(tileKey(x,y));seen.add(tileKey(x,y))}state.war.raids=[];state.war.engines=[];state.war.patrols=[];state.war.expedition=null;state.p={x:120.5*T,y:119.5*T};state.settled={x:120,y:119};state.war.defense={autoRetreat:false};state.war.upgrades={sword:0,bow:0,armor:0};state.frontier.steel=0;
const setup=(kind,type='palisada')=>{const wall={x:120,y:121,type,material:'stone',hp:300,open:false};state.buildings=[wall];buildingIndexSource=null;state.war.guards=[{uid:'check-'+kind,kind,hp:8,x:119.5*T,y:119.5*T,path:[],home:{x:119,y:119}}];state.war.soldiers=1;state.war.raids=[];selectedUnits=new Set([state.war.guards[0].uid]);if(!assignWallDefenders(120,121))throw Error('Mount failed');for(let i=0;i<400;i++){processUnitPlans();handleUnitOrder(state.war.guards[0],.05)}const u=state.war.guards[0];if(u.wallStation?.phase!=='onWall')throw Error('Mount incomplete');return {u,wall}};
for(const kind of ['archer','crossbow'])for(const type of ['palisada','brama','wieza']){
 const {u,wall}=setup(kind,type),damage=kind==='crossbow'?4:2,cooldown=kind==='crossbow'?2.2:1.2,range=kind==='crossbow'?6:5;
 const e={townId:'target',power:100,camp:true,progress:0,route:[{x:120.5,y:121.5+range-.5},{x:120.5,y:121.5+range-.5}]};state.war.raids=[e];u.attackCooldown=0;const original=[u.x,u.y,u.hp].join();handleUnitOrder(u,.05);if(e.power!==100-damage||u.attackCooldown!==cooldown||u.shot.y!==u.y-wallHeight(wall)-16)throw Error(kind+' first shot/damage/height/cooldown');handleUnitOrder(u,.1);if(e.power!==100-damage)throw Error(kind+' fires without reload');for(let i=0;i<Math.ceil(cooldown/.05);i++)handleUnitOrder(u,.05);if(e.power!==100-2*damage||[u.x,u.y,u.hp].join()!==original)throw Error(kind+' reload or stays on wall');
 e.route=[{x:120.5,y:121.5+range+1},{x:120.5,y:121.5+range+1}];const power=e.power;for(let i=0;i<80;i++)handleUnitOrder(u,.05);if(e.power!==power||u.fighting||[u.x,u.y,u.hp].join()!==original)throw Error(kind+' shoots or chases outside range');state.war.raids=[];
 if(descendSelected()!==1||u.wallStation?.phase!=='descending'||[u.x,u.y,u.hp].join()!==original)throw Error(kind+' button descent starts incorrectly');handleUnitOrder(u,.2);if(!(wallElevation(u)>0&&wallElevation(u)<wallHeight(wall)))throw Error(kind+' descent teleports');for(let i=0;i<50;i++){processUnitPlans();handleUnitOrder(u,.05)}if(u.wallStation||wallElevation(u)!==0||!unitWalkable(u,Math.floor(u.x/T),Math.floor(u.y/T))||armyTotal()!==1)throw Error(kind+' does not descend safely');
}
// A ground order while posted first descends for both weapon types.
for(const kind of ['archer','crossbow']){const {u}=setup(kind);armCommand('move');issueMapCommand(123,118);for(let i=0;i<500;i++){processUnitPlans();handleUnitOrder(u,.05)}if(u.wallStation||u.order||Math.hypot(u.x-123.5*T,u.y-118.5*T)>3)throw Error(kind+' ground order after descent')}
// A landing blocked after descent starts must not strand the soldier halfway.
const {u}=setup('crossbow');descendSelected();handleUnitOrder(u,.2);const landing={...u.wallStation.entry};state.buildings.push({x:landing.x,y:landing.y,type:'palisada',hp:60});buildingIndexSource=null;for(let i=0;i<100;i++){processUnitPlans();handleUnitOrder(u,.05)}if(u.wallStation||!unitWalkable(u,Math.floor(u.x/T),Math.floor(u.y/T)))throw Error('Blocked landing strands soldier halfway despite other free exits');
// The same recovery preserves an already queued ground destination.
const queued=setup('archer').u;armCommand('move');issueMapCommand(123,118);handleUnitOrder(queued,.2);const exit={...queued.wallStation.entry},position=[queued.x,queued.y,wallElevation(queued)];state.buildings.push({x:exit.x,y:exit.y,type:'palisada',hp:60});buildingIndexSource=null;handleUnitOrder(queued,.05);if(queued.x!==position[0]||queued.y!==position[1]||Math.abs(wallElevation(queued)-position[2])>.001)throw Error('Blocked landing recovery jumps');for(let i=0;i<500;i++){processUnitPlans();handleUnitOrder(queued,.05)}if(queued.wallStation||queued.order||Math.hypot(queued.x-123.5*T,queued.y-118.5*T)>3)throw Error('Recovery loses queued ground order');
console.log('PASS archers/crossbowmen fire correct damage, reload and range from walls/gates/towers without moving; smooth button descent; ground orders; recovery when a landing becomes blocked');
}`,sandbox);
