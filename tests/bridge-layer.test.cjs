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
state.towns=[];rebuildForeignIndex();state.war.raids=[];state.war.guards=[];state.war.soldiers=0;state.war.patrols=[];state.settled=null;state.life.mounted=false;state.life.weatherVisible=false;state.kingdom.fleet=[];state.kingdom.caravans=[];state.kingdom.king=null;
const trace=[],originalBridge=drawBridge,originalLegs=drawWalkingLegs,originalResident=drawResident;drawBridge=(...args)=>{trace.push('bridge');originalBridge(...args)};drawWalkingLegs=(...args)=>{if(args[2]===state.p)trace.push('player');originalLegs(...args)};drawResident=()=>trace.push('resident');
for(const axis of ['horizontal','vertical']){const x=Math.round(river(120)),y=120;state.buildings=[{x,y,type:'most_staly',axis}];buildingIndexSource=null;state.p={x:(x+.5)*T,y:(y+.5)*T};residents=[{x:state.p.x,y:state.p.y}];seen=new Set([tileKey(x,y)]);trace.length=0;draw();if(trace.indexOf('bridge')<0||trace.indexOf('player')<trace.indexOf('bridge')||trace.indexOf('resident')<trace.indexOf('bridge'))throw Error('Bridge hides actor: '+trace);if(blocked(state.p.x,state.p.y))throw Error('Bridge collision changed');}
drawBridge=originalBridge;drawWalkingLegs=originalLegs;drawResident=originalResident;console.log('PASS horizontal/vertical bridge decks rendered before player and residents; passability unchanged');
`,sandbox);