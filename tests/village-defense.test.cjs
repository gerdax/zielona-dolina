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
vm.runInContext(`{
state.towns=[];rebuildForeignIndex();state.buildings=[];buildingIndexSource=null;state.war.raids=[];state.war.engines=[];state.war.patrols=[];state.war.expedition=null;terrain=()=> 'grass';cut=new Set;seen=new Set;for(let x=90;x<160;x++)for(let y=90;y<160;y++){cut.add(tileKey(x,y));seen.add(tileKey(x,y))}state.p={x:120.5*T,y:120.5*T};state.settled={x:120,y:120};state.wood=1000;state.stone=1000;
const make=(i=0,hp=8)=>({uid:'defense-'+i,kind:'melee',hp,x:(117.5+i%4)*T,y:(119.5+Math.floor(i/4))*T,path:[],home:{x:117+i%4,y:119+Math.floor(i/4)}});
state.war.guards=Array.from({length:10},(_,i)=>make(i));state.war.soldiers=10;const units=state.war.guards;selectedUnits=new Set(units.map(u=>u.uid));delete state.war.defense;if(!villageDefense().autoRetreat||units.length!==10)throw Error('Old save migration');
if(!beginDefensePoint()||!chooseDefensePoint(124,123)||defenseDraft||units.some(u=>!u.defensePost||!u.order)||new Set(units.map(u=>tileKey(u.defensePost.x,u.defensePost.y))).size!==10)throw Error('Defense point orders');
for(let frame=0;frame<700;frame++){processUnitPlans();for(const u of units)handleUnitOrder(u,.05)}for(const u of units)if(u.order||Math.hypot(u.x-(u.defensePost.x+.5)*T,u.y-(u.defensePost.y+.5)*T)>3)throw Error('Defense post arrival');
const u=units[0],post={...u.defensePost};if(withinDefensePost(u,{x:(post.x+8)*T,y:post.y*T}))throw Error('Defender chases far from post');if(!withinDefensePost(u,{x:(post.x+1)*T,y:(post.y+.5)*T}))throw Error('Defender ignores nearby enemy');
if(!beginDefensePoint())throw Error('Cannot rearm point');$('commandCancel').onclick();if(defenseDraft)throw Error('Cancel button leaves defense draft');beginDefensePoint();setMode(null);if(defenseDraft)throw Error('Toporek leaves defense draft');state.war.raids=[{townId:'far-post',power:30,progress:0,route:[{x:post.x+5.5,y:post.y+.5},{x:post.x+5.5,y:post.y+.5}]}];if(defendActor(u,.1))throw Error('Post pursues enemy outside defense radius');state.war.raids=[{townId:'near-post',power:30,progress:0,route:[{x:post.x+1.5,y:post.y+.5},{x:post.x+1.5,y:post.y+.5}]}];if(!defendActor(u,.1)||state.war.raids[0].power>=30)throw Error('Post fails to fight nearby enemy');state.war.raids=[];u.x=(post.x+6.5)*T;for(let i=0;i<400;i++){processUnitPlans();updateGarrisonCombat(.05)}if(Math.hypot(u.x-(post.x+.5)*T,u.y-(post.y+.5)*T)>3)throw Error('Defender fails to return to post');
const serialized=JSON.parse(JSON.stringify(state));if(serialized.war.guards[0].defensePost.x!==post.x)throw Error('Defense post not saved');
selectedUnits=new Set([u.uid]);armCommand('move');issueMapCommand(126,124);if(u.defensePost||JSON.parse(localStorage.getItem(KEY)).war.guards[0].defensePost)throw Error('Manual movement does not release and save post');u.defensePost={...post};clearCommands();if(u.defensePost)throw Error('Stop does not release post');
// A low-health soldier leaves combat and retains its defense station for return.
state.buildings=[{x:125,y:124,type:'szpital'}];buildingIndexSource=null;u.x=120.5*T;u.y=120.5*T;u.hp=3;u.fighting=true;u.defensePost={x:120,y:120};u.home={x:120,y:120};u.order={kind:'attack',x:130,y:130};const armyBefore=armyTotal();if(!processHospitalRetreat(u,.05)||!u.hospitalRetreat||u.order||u.fighting||!u.defensePost||armyTotal()!==armyBefore)throw Error('Critical retreat starts incorrectly');
let reached=false;for(let i=0;i<180;i++){processUnitPlans();processHospitalRetreat(u,.05);const r=u.hospitalRetreat;if(r&&Math.hypot(u.x-(r.goal.x+.5)*T,u.y-(r.goal.y+.5)*T)<3)reached=true}if(!reached)throw Error('Retreat does not reach hospital');
for(let i=0;i<600&&u.hospitalRetreat;i++){processUnitPlans();processHospitalRetreat(u,.05)}if(u.hp!==8||u.hospitalRetreat)throw Error('Retreat does not heal and release');
state.buildings=[];buildingIndexSource=null;u.hp=2;if(processHospitalRetreat(u,.1)||u.hospitalRetreat)throw Error('Retreat without hospital');u.hp=0;if(processHospitalRetreat(u,10)||u.hp!==0)throw Error('Dead unit resurrected');const ally=make(55,2);state.buildings=[{x:125,y:124,type:'szpital'}];buildingIndexSource=null;if(processHospitalRetreat(ally,.1))throw Error('Ally controlled');u.hp=3;villageDefense().autoRetreat=false;if(processHospitalRetreat(u,.1))throw Error('Disabled retreat runs');villageDefense().autoRetreat=true;processHospitalRetreat(u,.05);state.buildings=[];buildingIndexSource=null;if(processHospitalRetreat(u,.1)||u.hospitalRetreat)throw Error('Destroyed hospital leaves stuck retreat');u.hp=8;
const raid=(x,y,power=20,camp)=>({townId:'test',power,camp,progress:0,route:[{x,y},{x,y}]});for(const [x,y,arrow] of [[130.5,120.5,'→'],[110.5,120.5,'←'],[120.5,110.5,'↑'],[120.5,130.5,'↓'],[130.5,130.5,'↘']]){state.war.raids=[raid(x,y),raid(120.5,120.5,20,'camp')];const threat=incomingVillageRaid();if(threat.arrow!==arrow||threat.distance<9)throw Error('Wrong raid direction');updateVillageDefenseUI();if(!villageRaidAlert.textContent.includes(arrow))throw Error('Missing raid banner')}
state.war.raids=[raid(120.5,120.5,0),raid(120.5,120.5,20,'camp')];if(incomingVillageRaid())throw Error('Dead raid or camp alarm');
// Atomic repair, stone material, ruins, battle exclusion and live quote validation.
state.war.raids=[];state.buildings=[{x:120,y:122,type:'palisada',hp:20},{x:121,y:122,type:'ruiny',originalType:'brama',material:'stone',hp:0},{x:124,y:122,type:'wieza',hp:50},{x:145,y:122,type:'palisada',hp:10},{x:120,y:119,type:'dom',hp:10}];buildingIndexSource=null;let q=fortificationRepairQuote();if(q.items.length!==3||q.distant!==1)throw Error('Repair scope');const original=q.signature;state.buildings[0].hp=19;const resources=[state.wood,state.stone].join();if(repairVillageFortifications(original)||[state.wood,state.stone].join()!==resources)throw Error('Stale quote charged');q=fortificationRepairQuote();state.wood=0;if(repairVillageFortifications(q.signature)||state.buildings[0].hp!==19)throw Error('Partial unaffordable repair');state.wood=1000;const wood=state.wood,stone=state.stone;if(!repairVillageFortifications(q.signature)||state.wood!==wood-q.wood||state.stone!==stone-q.stone)throw Error('Repair exact costs');const gate=state.buildings[1];if(gate.type!=='brama'||gate.hp!==240||gate.material!=='stone'||gate.open!==false||gate.originalType||state.buildings[4].hp!==10||state.buildings[3].hp!==10)throw Error('Repair restores wrong properties');
state.buildings[0].hp=20;state.war.raids=[raid(120.5,122.5)];q=fortificationRepairQuote();if(q.items.length||!q.danger)throw Error('Repair allowed during nearby battle');
console.log('PASS old-save defaults, 10 defense posts/arrival/persistence/leash/manual override, low-HP hospital retreat/healing/release/disable/death/ally/destruction, 5 raid directions/camp exclusion, atomic nearby repairs/exact costs/stale quote/stone ruins/battle exclusion');
}`,sandbox);
