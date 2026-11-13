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
state.towns=[];rebuildForeignIndex();terrain=()=> 'grass';cut=new Set;seen=new Set;for(let x=100;x<145;x++)for(let y=100;y<145;y++){cut.add(tileKey(x,y));seen.add(tileKey(x,y))}state.war.raids=[];state.war.engines=[];state.war.patrols=[];state.war.expedition=null;state.p={x:120.5*T,y:120.5*T};state.settled={x:120,y:120};state.war.defense={autoRetreat:false};
state.buildings=Array.from({length:12},(_,i)=>({x:115+i,y:123,type:'palisada',material:'stone',hp:180}));buildingIndexSource=null;
const make=(i,kind)=>({uid:'wall-'+i,kind,hp:8,x:(118.5+i%4)*T,y:(119.5+Math.floor(i/4))*T,path:[],home:{x:118+i%4,y:119+Math.floor(i/4)}});
state.war.guards=Array.from({length:10},(_,i)=>make(i,i%2?'crossbow':'archer'));state.war.soldiers=10;const units=state.war.guards;selectedUnits=new Set(units.map(u=>u.uid));const total=armyTotal(),resources=[state.wood,state.stone,state.food].join();if(!beginWallCommand()||!assignWallDefenders(120,123)||wallDraft||units.some(u=>!u.wallStation)||new Set(units.map(u=>tileKey(u.wallStation.x,u.wallStation.y))).size!==10||armyTotal()!==total||[state.wood,state.stone,state.food].join()!==resources)throw Error('Assignment, slots or accounting');
let climbing=false;for(let frame=0;frame<600;frame++){processUnitPlans();for(const u of units)handleUnitOrder(u,.05);if(units.some(u=>u.wallStation?.phase==='climbing'&&wallElevation(u)>0&&wallElevation(u)<42))climbing=true}if(!climbing||units.some(u=>u.wallStation?.phase!=='onWall'||wallElevation(u)!==42))throw Error('Approach/climb completion');
for(const u of units)if(unitWalkable(u,u.wallStation.x,u.wallStation.y))throw Error('Wall became walkable from ground');
const u=units[0],s=u.wallStation,enemy={townId:'wall-target',power:100,progress:0,route:[{x:s.x+.5,y:s.y+4.5},{x:s.x+.5,y:s.y+4.5}]};state.war.raids=[enemy];u.attackCooldown=0;const pos=[u.x,u.y].join();handleUnitOrder(u,.1);if(enemy.power!==100-soldierDamage(u)||!u.fighting||u.shot.y!==u.y-42-16||[u.x,u.y].join()!==pos)throw Error('Elevated shooting');enemy.route=[{x:s.x+.5,y:s.y+12.5},{x:s.x+.5,y:s.y+12.5}];handleUnitOrder(u,.1);if(u.fighting||[u.x,u.y].join()!==pos)throw Error('Shooter leaves wall to chase');state.war.raids=[];
// Hit testing must follow the drawn soldier, not its ground-level coordinates.
selectedUnits.clear();residents=[{id:99,x:u.x,y:unitDisplayY(u)-2}];const click={clientX:innerWidth/2+(u.x-state.p.x),clientY:innerHeight*.46+(unitDisplayY(u)-14-state.p.y),button:0,pointerId:1};c.onpointerdown(click);c.onpointerup(click);if(!selectedUnits.has(u.uid)||selectedActors().length!==1)throw Error('Cannot click elevated unit above resident');residents=[];if(selectSoldierBox({x:u.x-10,y:unitDisplayY(u)-30},{x:u.x+10,y:unitDisplayY(u)})!==1)throw Error('Cannot box-select elevated unit');
const savedStation=JSON.parse(JSON.stringify(u.wallStation));if(savedStation.phase!=='onWall'||savedStation.x!==s.x)throw Error('Wall position not serializable');
// A normal move first descends, then follows the ground order.
armCommand('move');if(!issueMapCommand(120,118)||u.wallStation?.phase!=='descending'||JSON.parse(localStorage.getItem(KEY)).war.guards.find(a=>a.uid===u.uid).wallStation.phase!=='descending')throw Error('Move does not start descent');for(let i=0;i<600;i++){processUnitPlans();handleUnitOrder(u,.05)}if(u.wallStation||u.order||Math.hypot(u.x-120.5*T,u.y-118.5*T)>3)throw Error('Ground move after descent');
// Connected wall movement stays on the walkway without teleporting.
const v=units[1],origin={x:v.x,y:v.y};selectedUnits=new Set([v.uid]);if(!assignWallDefenders(115,123)||v.wallStation.phase!=='wallMove'||v.x!==origin.x||v.y!==origin.y)throw Error('Walkway reassignment jumps');for(let i=0;i<700;i++)handleUnitOrder(v,.05);if(v.wallStation?.phase!=='onWall'||Math.abs(v.x-115.5*T)>3)throw Error('Walkway movement incomplete');
// Destroying the occupied segment removes elevation without duplicating a soldier.
const wall=building(v.wallStation.x,v.wallStation.y);wall.type='ruiny';wall.originalType='palisada';wall.hp=0;const before=armyTotal();handleUnitOrder(v,.05);if(v.wallStation||wallElevation(v)||armyTotal()!==before||!unitWalkable(v,Math.floor(v.x/T),Math.floor(v.y/T)))throw Error('Destroyed wall leaves floating unit');
// A wounded posted shooter must descend before hospital retreat.
const w=units[2];state.buildings.push({x:120,y:119,type:'szpital'});buildingIndexSource=null;villageDefense().autoRetreat=true;w.hp=2;handleUnitOrder(w,.05);if(w.wallStation?.phase!=='descending'||w.hospitalRetreat)throw Error('Hospital retreat skips descent');for(let i=0;i<60;i++){processUnitPlans();handleUnitOrder(w,.05)}if(w.wallStation||!w.hospitalRetreat)throw Error('Hospital retreat not resumed on ground');villageDefense().autoRetreat=false;
const melee=make(40,'melee');state.war.guards.push(melee);state.war.soldiers++;selectedUnits=new Set([melee.uid]);if(beginWallCommand())throw Error('Melee can mount wall');selectedUnits=new Set([u.uid]);state.buildings.push({x:130,y:123,type:'palisada',hp:60});buildingIndexSource=null;if(assignWallDefenders(130,123))throw Error('Wood palisade supports walkway');seen.delete(tileKey(120,123));if(assignWallDefenders(120,123))throw Error('Fog permits wall assignment');
// Cancelling a climb reverses from the current position instead of jumping.
state.war.raids=[];const k=make(71,'archer');state.war.guards=[k];state.war.soldiers=1;state.war.patrols=[];state.war.expedition=null;state.buildings=[{x:120,y:121,type:'palisada',material:'stone',hp:180}];buildingIndexSource=null;selectedUnits=new Set([k.uid]);seen.add(tileKey(120,121));assignWallDefenders(120,121);for(let i=0;i<300&&k.wallStation?.phase!=='climbing';i++){processUnitPlans();handleUnitOrder(k,.05)}handleUnitOrder(k,.15);const at=[k.x,k.y,wallElevation(k)];clearCommands();if(k.x!==at[0]||k.y!==at[1]||Math.abs(wallElevation(k)-at[2])>.001)throw Error('Cancelling climb jumps');for(let i=0;i<60;i++){processUnitPlans();handleUnitOrder(k,.05)}if(k.wallStation||!unitWalkable(k,Math.floor(k.x/T),Math.floor(k.y/T)))throw Error('Cancelled climb does not return to ground');
// Patrols enter with preserved identity and total headcount.
const p=make(72,'crossbow');state.war.patrols=[{id:'wall-patrol',units:[p]}];selectedUnits=new Set([p.uid]);const count=armyTotal();assignWallDefenders(120,121);if(state.war.patrols.length||armyTotal()!==count||!state.war.guards.includes(p))throw Error('Patrol mounting duplicates troops');for(let i=0;i<400;i++){processUnitPlans();handleUnitOrder(p,.05)}const q=make(73,'archer');state.war.guards.push(q);state.war.soldiers++;selectedUnits=new Set([q.uid]);if(assignWallDefenders(120,121))throw Error('Occupied single wall accepts second soldier');
// Drawing uses elevation without moving the simulation actor.
const snapshot=JSON.stringify(p),ys=[];const oldRects=ctx.fillRect;ctx.fillRect=(x,y,...args)=>{ys.push(y);oldRects(x,y,...args)};drawBattleActor(p,'#638bba');ctx.fillRect=oldRects;if(JSON.stringify(p)!==snapshot||!ys.some(y=>Math.abs(y-(unitDisplayY(p)-18))<.001))throw Error('Rendering changes actor or draws on ground');
console.log('PASS 10 unique ranged wall positions, approach/climb, no ground wall walking, stationary elevated shooting/no chase, click and box selection, persistence, automatic descent before ground orders and hospital retreat, connected walkway movement, destruction safety, accounting, melee/wood/fog rejection');
}`,sandbox);
