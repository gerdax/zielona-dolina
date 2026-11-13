const fs=require('fs'),vm=require('vm'),assert=require('assert');
const noop=()=>{},els=new Map();let saved={p:{x:120.5*48,y:120.5*48},wood:500,stone:300,food:500,gold:0,cut:[],buildings:[{x:118,y:120,type:'start'},{x:119,y:120,type:'dom'}],seen:[],settled:{x:120,y:120},chopped:7,time:0,open:true};
const oldBuildings=JSON.stringify(saved.buildings),oldResources=[saved.wood,saved.stone,saved.food];
const ctx=new Proxy({measureText:s=>({width:s.length*6}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
function el(id){if(!els.has(id))els.set(id,{addEventListener:noop,focus:noop,textContent:'',innerHTML:'',style:{},classList:{contains:()=>true,add:noop,remove:noop,toggle:noop},append:noop,setAttribute:noop,dataset:{},getContext:()=>ctx});return els.get(id)}
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
vm.runInContext(fs.readFileSync('dist/codes.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/gems.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/starter-packs.js','utf8'),sandbox);
vm.runInContext(`{
state.gems=49;const buildings=state.buildings.length,army=state.war.soldiers;if(buyStarterPack('soldiers')||state.gems!==49)throw Error('underfunded');state.gems=450;if(!buyStarterPack('soldiers')||state.gems!==400||state.war.soldiers!==army)throw Error('soldier purchase');if(buyStarterPack('soldiers')||state.gems!==400)throw Error('duplicate purchase');if(!buyStarterPack('village')||state.gems!==0||state.buildings.length!==buildings)throw Error('village purchase immediate grant');
const oldSave=save;save=()=>false;state.starterPacks={};state.gems=50;if(buyStarterPack('soldiers')||state.gems!==50||state.starterPacks.soldiers)throw Error('failed save charges');save=oldSave;state.starterPacks={soldiers:true,village:true};state.starterPacksApplied=false;state.buildings=[{x:118,y:120,type:'start'}];buildingIndexSource=null;state.p={x:120*T,y:120*T};state.war.soldiers=0;state.war.guards=[];if(!applyStarterPacks())throw Error('apply failure');for(const [type,n] of Object.entries({dom:3,drwal:1,kamieniolom:1,gospodarstwo:1,pole:2}))if(state.buildings.filter(b=>b.type===type).length!==n)throw Error(type+' count');if(state.war.soldiers!==3||state.war.guards.length!==3||armyCapacity()<3)throw Error('starter army');if(state.buildings.some(b=>terrain(b.x,b.y)!=='grass'||foreignBuilding(b.x,b.y)))throw Error('unsafe placement');const count=state.buildings.length;applyStarterPacks();if(state.buildings.length!==count||state.war.soldiers!==3)throw Error('repeat on reload');
}`,sandbox);
let next,reloads=0;sandbox.confirm=()=>true;sandbox.location={reload:()=>reloads++};sandbox.localStorage={setItem:(k,v)=>next=JSON.parse(v),getItem:()=>null};vm.runInContext('startFreshGameWithPacks()',sandbox);assert.equal(reloads,1);assert.equal(next.buildings.length,1);assert.equal(next.starterPacks.soldiers,true);assert.equal(next.starterPacks.village,true);assert.equal(next.starterPacksApplied,undefined);assert.equal(next.gems,50);console.log('PASS pack prices, insufficient funds, duplicate/save-failure protection, next-world-only bonuses, exact buildings/army and new game preservation');
