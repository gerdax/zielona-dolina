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

vm.runInContext(fs.readFileSync('dist/story.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/adventure.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/roaming.js','utf8'),sandbox);

vm.runInContext(fs.readFileSync('dist/life.js','utf8'),sandbox);
vm.runInContext(`
state.towns=[];rebuildForeignIndex();state.war.raids=[];state.buildings=[{x:118,y:120,type:'start'},{x:120,y:122,type:'dom'},{x:121,y:122,type:'drwal'},{x:122,y:122,type:'mlyn'},{x:123,y:122,type:'stajnia'}];buildingIndexSource=null;state.settled={x:120,y:120};state.p={x:120.5*T,y:120.5*T};state.wood=500;state.stone=500;state.food=200;state.gold=500;cut=new Set;for(let x=100;x<140;x++)for(let y=100;y<140;y++)cut.add(tileKey(x,y));
const pop=population();if(!upgradeVillageBuilding(120,122)||population()!==pop+2||!upgradeVillageBuilding(120,122)||upgradeVillageBuilding(120,122))throw Error('house upgrade/cap');const w=state.wood;upgradeVillageBuilding(121,122);upgradeVillageBuilding(121,122);if(buildingWorkFactor(building(121,122))!==2)throw Error('work multiplier');state.wood=100;workLedger.clear();workLedger.set('121,122',12);production();if(state.wood!==110)throw Error('worked output');
chooseStoneRoad();const stone=state.stone;build(120,121);if(!building(120,121)?.paved||state.stone!==stone-3||pathSpeed(120.5*T,121.5*T)!==1.8)throw Error('paved road cost/speed');const paid=state.stone;build(120,121);if(state.stone!==paid)throw Error('duplicate road charge');setMode('sciezka');build(121,121);if(building(121,121).paved||pathSpeed(121.5*T,121.5*T)!==1.4)throw Error('regular path');chooseStoneRoad();build(121,121);if(!building(121,121).paved)throw Error('pave existing');
setVillageAlarm(true);updateLife(9);if(!villageProgress().alarm)throw Error('early alarm');updateLife(1.1);if(villageProgress().alarm)throw Error('alarm not ended');setVillageAlarm(true);state.war.raids=[{power:10}];updateLife(20);if(!villageProgress().alarm)throw Error('alarm ends in danger');state.war.raids=[];lifeState().autoAlarm=false;updateLife(20);if(!villageProgress().alarm)throw Error('manual alarm');setVillageAlarm(false);lifeState().autoAlarm=true;
const food=state.food;if(!adoptDog()||state.food!==food-20||adoptDog())throw Error('dog cost');const d=lifeState().dog;state.p.x+=3*T;for(let i=0;i<300;i++){processUnitPlans();updateLife(.05)}if(Math.hypot(d.x-state.p.x,d.y-state.p.y)>30)throw Error('dog follow');const speed=playerTravelMultiplier();if(!tameHorse()||tameHorse()||!togglePlayerHorse()||playerTravelMultiplier()!==speed*1.35)throw Error('horse');togglePlayerHorse();
lifeState().weatherClock=0;lifeState().weatherIndex=0;state.frontier.elapsed=0;updateLife(60);if(lifeState().weather!=='rain')throw Error('rain');state.frontier.elapsed=540;lifeState().weatherIndex=0;lifeState().weatherClock=0;updateLife(60);if(lifeState().weather!=='snow')throw Error('snow');
state.clock.paused=false;const a={};state.time=10;if(walkingSwing(a,10,10)!==0)throw Error('initial feet');state.time+=.1;if(walkingSwing(a,14,10)===0)throw Error('walking feet');state.time+=.1;if(walkingSwing(a,14,10)!==0)throw Error('idle feet');state.clock.paused=true;state.time+=.1;if(walkingSwing(a,18,10)!==0)throw Error('paused feet');if(formationWalker(a,0)!==formationWalker(a,0))throw Error('unstable formation');if(!JSON.parse(JSON.stringify(state)).life.dog)throw Error('persistence');
`,sandbox);console.log('PASS upgrade costs/caps/population/actual production, roads cost/speed/upgrade, safe alarm timeout, pets and riding, seasonal weather, movement-only legs and save');
