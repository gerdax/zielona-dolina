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
vm.runInContext(`{
const t={type:'wieza',material:'stone',x:120,y:121};state.buildings.push(t);buildingIndexSource=null;const x=120.5*T,y=121.5*T,u={hp:8,kind:'melee',x:119.5*T,y:121.5*T};if(!blocked(x,y)||npcWalkable(120,121)||unitWalkable(u,120,121))throw Error('tower walk-through');const route=findRoute(u,{x:122,y:121},true);if(!route||route.some(p=>Math.floor(p.x/T)===120&&Math.floor(p.y/T)===121))throw Error('individual route through tower');const army=campaignRoute({x:119,y:121},{x:122,y:121},false);if(!army||army.some(p=>Math.floor(p.x)===120&&Math.floor(p.y)===121))throw Error('army route through tower');const e={route:[{x:119.5,y:121.5},{x:120.5,y:121.5},{x:121.5,y:121.5}],progress:0,retry:10};advanceCampaign(e,.1,1);if(e.progress!==0)throw Error('old army route ignores tower');
state.p={x,y};if(!rescuePlayer()||blocked(state.p.x,state.p.y)||Math.hypot(state.p.x-x,state.p.y-y)>3*T)throw Error('old save player trapped');t.material=undefined;if(!blocked(x,y))throw Error('wood tower walk-through');t.type='ruiny';t.originalType='wieza';if(blocked(x,y))throw Error('ruins block');
}`,sandbox);console.log('PASS wood/stone tower collision, civilian/soldier/army routing, old route protection, player rescue and ruins');
