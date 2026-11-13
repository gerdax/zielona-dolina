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
vm.runInContext(fs.readFileSync('dist/services.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/building-art.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/player-boat.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/river-adventure.js','utf8'),sandbox);
vm.runInContext(`
state.towns=[];rebuildForeignIndex();state.war.raids=[];state.riverAdventure={active:false,islands:[],enemies:[]};const y=120,riverEdge=Math.ceil(river(y)-2.1),x=riverEdge-3;state.buildings=[{x:118,y:118,type:'start'}];for(let cx=x;cx<=riverEdge;cx++)state.buildings.push({x:cx,y,type:'wawoz'});buildingIndexSource=null;state.p={x:(x-.5)*T,y:(y+.5)*T};state.wood=100;state.settled={x:x-2,y};refreshWater();if(terrain(x,y)!=='water')throw Error('fixture not flooded');setMode('pomost');const before=state.wood;if(!constructionHint(x,y).startsWith('Możesz'))throw Error('flooded trench hint rejects pier');build(x,y);if(building(x,y)?.type!=='pomost')throw Error('cannot build pier over flooded trench');if(state.wood!==before-10||!building(x,y).channel)throw Error('pier channel/cost');refreshWater();if(terrain(x,y)!=='water'||terrain(x+1,y)!=='water'||blocked((x+.5)*T,(y+.5)*T))throw Error('pier drained canal or blocks walking');const paid=state.wood;build(x,y);if(state.wood!==paid)throw Error('duplicate pier charge');

const dryX=x-2;state.buildings.push({x:dryX,y,type:'wawoz'});buildingIndexSource=null;const dryPaid=state.wood;build(dryX,y);if(building(dryX,y)?.type!=='wawoz'||state.wood!==dryPaid)throw Error('dry trench incorrectly replaced');
worldCursor={clientX:innerWidth/2+48,clientY:innerHeight*.46};const point=worldPoint(worldCursor);state.p.x+=T;draw();if(mouse.x!==point.x+T||mouse.y!==point.y)throw Error('cursor not following camera');c.onpointerleave();if(worldCursor!==null)throw Error('stale pointer hint after leaving canvas');
`,sandbox);console.log('PASS pier replaces flooded trench, pays once, keeps water channel and remains walkable');
