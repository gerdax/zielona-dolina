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
let now=0;performance.now=()=>now;terrain=()=> 'grass';state.p={x:120.5*T,y:120.5*T};state.towns=[];rebuildForeignIndex();state.war.guards=[];state.war.patrols=[];state.war.engines=[];state.war.support=[];state.war.expedition=null;state.kingdom.fleet=[];state.kingdom.caravans=[];state.kingdom.king=null;residents=[];
for(const kind of ['gate','bridge']){
 const b={};if(structureOpenAmount(b,kind,false,0)!==0)throw Error('Initial closed pose');if(structureOpenAmount(b,kind,true,100)!==0)throw Error('Opening jumps');const middle=structureOpenAmount(b,kind,true,425);if(Math.abs(middle-.5)>.001)throw Error('No midpoint');if(structureOpenAmount(b,kind,true,750)!==1)throw Error('Does not finish');structureOpenAmount(b,kind,false,800);const partial=structureOpenAmount(b,kind,false,1000);if(!(partial>0&&partial<1))throw Error('Closing not animated');if(Math.abs(structureOpenAmount(b,kind,true,1000)-partial)>.001)throw Error('Reversing jumps');if(structureOpenAmount(b,kind,true,1800)!==1)throw Error('Reversed animation never settles');
}
const gate={x:120,y:121,type:'brama',open:false};state.buildings=[gate];buildingIndexSource=null;now=2000;drawFortification(gate,100,100);if(!blocked(120.5*T,121.5*T))throw Error('Closed collision changed');gate.open=true;now=2010;drawFortification(gate,100,100);if(blocked(120.5*T,121.5*T))throw Error('Open collision delayed by cosmetic animation');now=2335;const amount=structureOpenAmount(gate,'gate',true);if(amount<.4||amount>.6)throw Error('Wooden gate lacks intermediate pose');drawFortification(gate,100,100);if(JSON.stringify(gate).includes('duration')||Object.keys(gate).length!==4)throw Error('Animation leaks into save');
const stone={x:121,y:121,type:'brama',material:'stone',open:false};state.buildings=[stone];buildingIndexSource=null;const lines=[];const originalLine=artLine;artLine=(points,...args)=>{lines.push(points);originalLine(points,...args)};now=3000;structure(stone,100,100);const closed=JSON.stringify(lines);lines.length=0;stone.open=true;now=3010;structure(stone,100,100);lines.length=0;now=3335;structure(stone,100,100);const midStone=JSON.stringify(lines);lines.length=0;now=3700;structure(stone,100,100);if(midStone===closed||midStone===JSON.stringify(lines))throw Error('Stone grille does not move');artLine=originalLine;
const friendly={x:130,y:130,type:'brama_swoi'};state.buildings=[friendly];buildingIndexSource=null;now=4000;drawFortification(friendly,0,0);if(gateVisualOpen(friendly))throw Error('Unoccupied automatic gate open');state.war.guards=[{x:130.5*T,y:130.5*T,hp:8}];now=4010;drawFortification(friendly,0,0);now=4335;if(structureOpenAmount(friendly,'gate',gateVisualOpen(friendly))<.4)throw Error('Automatic gate does not animate');
const bridge={x:120,y:121,type:'most',axis:'horizontal'};state.open=true;now=5000;drawBridge(bridge,100,100);state.open=false;now=5010;drawBridge(bridge,100,100);now=5335;const lifted=structureOpenAmount(bridge,'bridge',state.open);if(lifted<.4||lifted>.6)throw Error('Bridge lacks intermediate pose');drawBridge(bridge,100,100);bridge.axis='vertical';drawBridge(bridge,100,100);const fixed={x:120,y:121,type:'most_staly',axis:'vertical'};drawBridge(fixed,100,100);if(structureAnimations.has(fixed)||!supportsWaterCrossing(fixed)||supportsWaterCrossing(bridge))throw Error('Fixed bridge or passage rules changed');
console.log('PASS smooth open/close/midpoints/reversal, wood/stone/automatic gate drawing, bridge in both orientations, fixed bridge unchanged, immediate logical collision and no save data');
}`,sandbox);
