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
let now=0;performance.now=()=>now;
for(const axis of ['horizontal','vertical']){
 const b={x:120,y:121,type:'most',axis};const decks=[],previous=polygon;polygon=(points,color)=>{if(color==='#b99c65')decks.push(points.map(p=>p.slice()));return previous(points,color)};
 state.open=true;now=0;drawBridge(b,200,300);state.open=false;now=10;drawBridge(b,200,300);now=335;drawBridge(b,200,300);now=700;drawBridge(b,200,300);
 const full=decks[0],mid=decks[2],short=decks[3],along=axis==='vertical'?1:0,cross=1-along;
 for(const i of [0,3])if(JSON.stringify(full[i])!==JSON.stringify(mid[i])||JSON.stringify(full[i])!==JSON.stringify(short[i]))throw Error(axis+' anchor moves');
 for(let i=0;i<4;i++)if(full[i][cross]!==mid[i][cross]||full[i][cross]!==short[i][cross])throw Error(axis+' deck shifts off axis');
 for(const i of [1,2])if(Math.abs(full[i][along]-mid[i][along]-19)>.001||Math.abs(full[i][along]-short[i][along]-38)>.001)throw Error(axis+' does not shorten');
 if(Math.abs(full[1][along]-full[0][along]-48)>.001||Math.abs(short[1][along]-short[0][along]-10)>.001)throw Error('Wrong deck length');
 state.open=true;now=800;drawBridge(b,200,300);now=1500;drawBridge(b,200,300);if(JSON.stringify(decks.at(-1))!==JSON.stringify(full))throw Error(axis+' deck fails to extend');
 const fixed={x:120,y:121,type:'most_staly',axis};state.open=false;drawBridge(fixed,200,300);if(JSON.stringify(decks.at(-1))!==JSON.stringify(full))throw Error('Fixed bridge retracts');polygon=previous;
}
console.log('PASS both orientations retract from 48 to 10 px along their axis, keep the bank anchored and width unchanged, extend back exactly, and leave fixed bridges unchanged');
}`,sandbox);
