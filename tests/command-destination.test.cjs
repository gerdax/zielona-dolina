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
vm.runInContext(`{
state.towns=[];rebuildForeignIndex();state.buildings=[];buildingIndexSource=null;state.war.raids=[];state.war.patrols=[];state.war.engines=[];
terrain=()=> 'grass';cut=new Set;seen=new Set;for(let x=90;x<150;x++)for(let y=90;y<150;y++){cut.add(tileKey(x,y));seen.add(tileKey(x,y))}
state.p={x:120.5*T,y:120.5*T};state.war.soldiers=10;state.war.guards=Array.from({length:10},(_,i)=>({uid:'click-'+i,kind:'melee',hp:8,x:(116.5+i%3)*T,y:(116.5+Math.floor(i/3))*T,path:[]}));
const soldier=state.war.guards[0];
for(const formation of [undefined,'loose','wall','wedge'])for(const scale of [.5,1,1.8])for(const size of [[1280,800],[610,845]]){
 soldier.formation=formation;zoom=scale;innerWidth=size[0];innerHeight=size[1];
 const click={clientX:innerWidth/2+(123.5*T-state.p.x)*zoom,clientY:innerHeight*.46+(122.5*T-state.p.y)*zoom,button:0,pointerId:1};
 selectedUnits=new Set([soldier.uid]);armCommand('move');c.onpointerdown(click);
 if(soldier.order?.x!==123||soldier.order?.y!==122)throw Error('Single soldier misses clicked tile: '+JSON.stringify({formation,scale,size,order:soldier.order}));
 for(let i=0;i<200;i++){processUnitPlans();handleUnitOrder(soldier,.05)}
 if(Math.hypot(soldier.x-123.5*T,soldier.y-122.5*T)>3)throw Error('Soldier does not reach clicked tile');
}
for(let n=1;n<=10;n++){
 const units=state.war.guards.slice(0,n);for(const u of units)u.formation='loose';const spots=formationMoveSpots(units,123,122);
 if(spots.length!==n||new Set(spots.map(p=>tileKey(p.x,p.y))).size!==n)throw Error('Lost or overlapping formation members: '+n);
 if(Math.abs(spots.reduce((s,p)=>s+p.x,0)/n-123)>.01||Math.abs(spots.reduce((s,p)=>s+p.y,0)/n-122)>.5)throw Error('Formation not centered: '+n);
 if(n===2&&Math.hypot(spots[0].x-spots[1].x,spots[0].y-spots[1].y)<2)throw Error('Loose spacing lost');
}
const wall={x:123,y:122,type:'palisada'};state.buildings=[wall];buildingIndexSource=null;const fallback=formationMoveSpots([soldier],123,122)[0];if(!fallback||fallback.x===123&&fallback.y===122||!unitWalkable(soldier,fallback.x,fallback.y))throw Error('Blocked target fallback invalid');
console.log('PASS exact clicked destination and completed movement for single units in every formation, 3 zooms, 2 viewport sizes; centered groups 1–10; blocked destination fallback');
}`,sandbox);
