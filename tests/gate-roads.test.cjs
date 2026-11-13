const fs=require('fs'),vm=require('vm'),assert=require('assert');
const noop=()=>{},els=new Map();let saved={p:{x:120.5*48,y:120.5*48},wood:500,stone:300,food:500,gold:0,cut:[],buildings:[{x:118,y:120,type:'start'},{x:119,y:120,type:'dom'}],seen:[],settled:{x:120,y:120},chopped:7,time:0,open:true};
const oldBuildings=JSON.stringify(saved.buildings),oldResources=[saved.wood,saved.stone,saved.food];
const ctx=new Proxy({measureText:s=>({width:s.length*6}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
function el(id){if(!els.has(id))els.set(id,{addEventListener:noop,focus:noop,textContent:'',innerHTML:'',style:{},classList:{contains:()=>true,add:noop,remove:noop,toggle:noop},append:noop,setAttribute:noop,dataset:{},querySelectorAll:()=>[],getContext:()=>ctx});return els.get(id)}
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
vm.runInContext(fs.readFileSync('dist/customization.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/construction.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/gate-roads.js','utf8'),sandbox);
vm.runInContext(`{
state.stone=100;state.settled={x:120,y:120};const gate={x:120,y:121,type:'brama',material:'stone',hp:228,open:false};state.buildings.push(gate);buildingIndexSource=null;chooseConstruction('sciezka_kamienna');build(120,121);if(gate.road!=='stone'||gate.hp!==228||gate.open!==false||state.stone!==97||building(120,121)!==gate)throw Error('road replaced/damaged gate');if(!blocked(120.5*T,121.5*T))throw Error('closed gate lost collision');gate.open=true;if(blocked(120.5*T,121.5*T)||pathSpeed(120.5*T,121.5*T)!==1.8||routeCost(120,121)!==1)throw Error('road movement');build(120,121);if(state.stone!==97)throw Error('duplicate charge');setMode('sciezka');build(120,121);if(state.stone!==97||gate.road!=='stone')throw Error('downgrade charged');structure(gate,0,0);
const ownGate={x:121,y:121,type:'brama_swoi',open:false};state.buildings.push(ownGate);buildingIndexSource=null;build(121,121);if(ownGate.road!=='dirt'||state.stone!==96)throw Error('dirt road gate');chooseConstruction('sciezka_kamienna');build(121,121);if(ownGate.road!=='stone'||state.stone!==93)throw Error('road upgrade');
const road={x:119,y:121,type:'sciezka',paved:true};state.buildings.push(road);buildingIndexSource=null;mode='brama';build(119,121);if(building(119,121)?.road!=='stone')throw Error('gate on existing road');if(!JSON.parse(JSON.stringify(state)).buildings.find(b=>b===null||b.x===120&&b.y===121)?.road)throw Error('road save');
}`,sandbox);console.log('PASS ordinary/stone gate roads, upgrade/costs, preserved gate HP/open/collision, speed, routing, existing road and saved state');
