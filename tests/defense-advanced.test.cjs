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
vm.runInContext(fs.readFileSync('dist/defense-advanced.js','utf8'),sandbox);
vm.runInContext(`{
state.towns=[];rebuildForeignIndex();terrain=()=> 'grass';cut=new Set;seen=new Set;for(let x=100;x<150;x++)for(let y=100;y<150;y++){cut.add(tileKey(x,y));seen.add(tileKey(x,y))}state.buildings=[];buildingIndexSource=null;state.war.guards=[];state.war.patrols=[];state.war.engines=[];state.war.expedition=null;state.war.raids=[];state.war.defense={autoRetreat:false};state.p={x:120.5*T,y:120.5*T};state.settled={x:120,y:120};
const check=(v,m)=>{if(!v)throw Error(m)},soldier=(id,kind='archer',x=120,y=120)=>({uid:id,kind,hp:8,x:(x+.5)*T,y:(y+.5)*T,path:[],home:{x,y}}),enemy=(id,kind,x,y)=>({townId:id,power:100,progress:0,route:[{x:x+.5,y:y+.5},{x:x+.5,y:y+.5}],engine:{kind,cooldown:1e9}});
const u=soldier('ranged');state.war.guards=[u];state.war.soldiers=1;
const near=enemy('near','ram',121,120),far=enemy('far','catapult',124,120);state.war.raids=[near,far];setDefensePriority('catapult');defendActor(u,.05);check(far.power<100&&near.power===100,'Ground priority');u.attackCooldown=0;setDefensePriority('ram');defendActor(u,.05);check(near.power<100,'Ram priority');
u.attackCooldown=0;far.route=[{x:127,y:120.5},{x:127,y:120.5}];setDefensePriority('catapult');const oldNear=near.power;defendActor(u,.05);check(near.power<oldNear,'Out of range preferred enemy must not suppress valid target');
state.war.raids=[];const guards=Array.from({length:10},(_,i)=>soldier('reserve-'+i,'melee',118+i%4,118+Math.floor(i/4)));state.war.guards=guards;state.war.soldiers=10;
check(assignDefenseReserve(guards,120,120),'Reserve group assignment');check(new Set(guards.map(u=>JSON.stringify(u.defenseReserve.home))).size===10,'10 unique reserve stations');const count=armyTotal();const waiting=guards[0];for(let i=0;i<400;i++){processUnitPlans();handleUnitOrder(waiting,.05)}check(Math.hypot(waiting.x/T-waiting.defenseReserve.home.x-.5,waiting.y/T-waiting.defenseReserve.home.y-.5)<.1,'Reserve reaches home');
state.war.raids=[enemy('breach','ram',125,125)];startDefenseBattle();handleUnitOrder(waiting,.05);check(waiting.defenseReserve.phase==='waiting','No premature reserve response');
const wall={x:124,y:122,type:'palisada',material:'stone',hp:1};state.buildings=[wall];buildingIndexSource=null;damageBuilding(wall,5);check(wall.type==='ruiny'&&villageDefense().battle.breaches.length===1,'Breach tracked');handleUnitOrder(waiting,.05);check(waiting.defenseReserve.phase==='responding'&&waiting.defensePost,'Reserve responds');check(armyTotal()===count,'Reserve preserves headcount');
const expected=repairCost(wall);strategyLoseDefenders(2);state.war.raids=[];state.time+=30;const report=finishDefenseBattle();check(report.losses===2&&report.damaged===1&&report.destroyed===1&&report.wood===expected.wood&&report.stone===expected.stone,'Report casualties and repair quote');handleUnitOrder(waiting,.05);check(waiting.defenseReserve.phase==='waiting'&&!waiting.defensePost,'Reserve returns after raid');for(let i=0;i<500;i++){processUnitPlans();handleUnitOrder(waiting,.05)}check(Math.hypot(waiting.x/T-waiting.defenseReserve.home.x-.5,waiting.y/T-waiting.defenseReserve.home.y-.5)<.1,'Reserve reaches original station after raid');selectedUnits=new Set([waiting.uid]);commandDraft='move';check(issueMapCommand(117,117)&&!waiting.defenseReserve,'Manual order releases reserve');
state.war.guards=[];state.war.soldiers=0;state.buildings=Array.from({length:20},(_,i)=>({x:110+i,y:125,type:'palisada',material:'stone',hp:180}));buildingIndexSource=null;
const patrol=Array.from({length:10},(_,i)=>{const u=soldier('patrol-'+i,i%2?'archer':'crossbow',110+i*2,125);u.wallStation={x:110+i*2,y:125,phase:'onWall',entry:{x:110+i*2,y:124},route:[]};return u});state.war.guards=patrol;state.war.soldiers=10;
check(assignWallPatrol(patrol,{x:110,y:125},{x:129,y:125}),'10-soldier patrol assignment');check(new Set(patrol.flatMap(u=>[tileKey(u.wallPatrol.a.x,u.wallPatrol.a.y),tileKey(u.wallPatrol.b.x,u.wallPatrol.b.y)])).size===20,'Unique wall stations');
const a=patrol[0],initial=a.x;for(let i=0;i<100;i++)handleUnitOrder(a,.05);check(a.x!==initial&&a.wallStation,'Patrol moves along wall');
state.war.raids=[enemy('wall-target','ram',111,128)];const before=state.war.raids[0].power;for(let i=0;i<80;i++)handleUnitOrder(a,.05);check(state.war.raids[0].power<before&&a.fighting,'Patrol stops and fires');state.war.raids=[];const old=a.x;for(let i=0;i<150;i++)handleUnitOrder(a,.05);check(a.wallPatrol&&a.wallStation,'Patrol resumes');
a.wallStation.phase='onWall';a.wallStation.x=110;a.wallStation.y=125;a.x=110.5*T;a.y=125.5*T;const ram=enemy('priority-wall-ram','ram',110,127),cat=enemy('priority-wall-cat','catapult',113,128);state.war.raids=[ram,cat];setDefensePriority('catapult');a.attackCooldown=0;wallShoot(a,.05);check(cat.power<100&&ram.power===100,'Wall priority selects catapult');state.war.raids=[];leaveWall(a);check(!a.wallPatrol&&a.wallStation.phase==='descending','Descent cancels patrol');
selectedUnits=new Set([patrol[1].uid]);clearCommands();check(!patrol[1].wallPatrol,'Stop cancels patrol');
check(!assignWallPatrol(patrol.slice(2),{x:110,y:125},{x:111,y:125}),'Reject overcrowded patrol');
const d=villageDefense();state.war.raids=[enemy('overlap-one','ram',140,140),enemy('overlap-two','catapult',141,140)];const battle=startDefenseBattle();state.war.raids.shift();check(startDefenseBattle()===battle,'Overlapping waves share one battle');state.war.raids=[];finishDefenseBattle();for(let i=0;i<7;i++){startDefenseBattle();finishDefenseBattle()}check(d.reports.length===5,'Report history capped');save();
}`,sandbox);
assert.equal(saved.war.defense.reports.length,5);console.log('Advanced defense: priorities, reserve x10, breach, casualties, repair report, wall patrol x10, combat, descent, persistence OK');
