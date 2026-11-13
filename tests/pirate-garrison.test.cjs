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
vm.runInContext(`
state.towns=[];rebuildForeignIndex();state.war.raids=[];state.islandLife={colonies:[],quests:{},lights:true,fort:null};state.riverAdventure={active:false,islands:[],enemies:[]};state.buildings=[{x:118,y:120,type:'start'}];buildingIndexSource=null;state.playerBoat=null;state.p={x:120*T,y:120*T};if(!startPirateFort())throw Error('start');const f=islandLife().fort,i=riverAdventure().islands.find(i=>i.id===f.id);if(f.phase!=='battle'||state.war.raids.length!==1)throw Error('empty fort on discovery');if(ensurePirateGarrison()||state.war.raids.length!==1)throw Error('duplicate garrison');state.p={x:(i.x+.5)*T,y:(i.y+1.5)*T};state.war.guards=Array.from({length:2},(_,n)=>({uid:'two-'+n,x:state.p.x,y:state.p.y,hp:8,kind:'melee',path:[],home:{x:i.x,y:i.y+1}}));state.war.soldiers=2;if(!attackPirateFort()||state.war.guards.some(u=>u.order?.raidTownId!==f.raidId))throw Error('two soldiers cannot attack');const r=state.war.raids[0];r.power=0;updateIslandLife();if(f.phase!=='cleared'||ensurePirateGarrison())throw Error('respawn cleared fort');f.phase='ready';state.war.raids=[];updateIslandLife();if(f.phase!=='battle'||state.war.raids.length!==1)throw Error('old save migration');f.phase='owned';state.war.raids=[];if(ensurePirateGarrison())throw Error('respawn owned fort');
`,sandbox);console.log('PASS visible garrison on discovery, two-soldier attack orders, no duplicates, old-save migration and no respawn after victory');
