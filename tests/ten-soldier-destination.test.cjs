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
state.towns=[];rebuildForeignIndex();state.buildings=[];buildingIndexSource=null;state.war.raids=[];state.war.patrols=[];state.war.engines=[];terrain=()=> 'grass';cut=new Set;seen=new Set;for(let x=90;x<150;x++)for(let y=90;y<150;y++){cut.add(tileKey(x,y));seen.add(tileKey(x,y))}state.p={x:120.5*T,y:120.5*T};
for(const scale of [.5,1,1.8])for(const size of [[1280,800],[610,845]])for(const goal of [{x:124,y:121},{x:116,y:122}]){
 zoom=scale;innerWidth=size[0];innerHeight=size[1];state.war.soldiers=10;state.war.guards=Array.from({length:10},(_,i)=>({uid:'group-'+i,kind:'melee',hp:8,x:(119.5+i%4)*T,y:(119.5+Math.floor(i/4))*T,path:[],formation:'loose'}));selectedUnits=new Set(state.war.guards.map(u=>u.uid));armCommand('move');c.onpointerdown({clientX:innerWidth/2+((goal.x+.5)*T-state.p.x)*zoom,clientY:innerHeight*.46+((goal.y+.5)*T-state.p.y)*zoom,button:0,pointerId:1});
 const units=state.war.guards,orders=units.map(u=>({...u.order}));if(orders.some(o=>o.kind!=='move'))throw Error('Not all 10 received movement orders');if(new Set(orders.map(o=>tileKey(o.x,o.y))).size!==10)throw Error('Overlapping target tiles');
 const cx=orders.reduce((s,o)=>s+o.x,0)/10,cy=orders.reduce((s,o)=>s+o.y,0)/10;if(Math.abs(cx-goal.x)>.01||Math.abs(cy-goal.y)>.5)throw Error('Formation misses clicked center');
 for(let frame=0;frame<1000;frame++){processUnitPlans();for(const u of units)handleUnitOrder(u,.05)}
 for(let i=0;i<10;i++)if(units[i].order||Math.hypot(units[i].x-(orders[i].x+.5)*T,units[i].y-(orders[i].y+.5)*T)>3)throw Error('Unit '+i+' failed to arrive');
}
console.log('PASS all 10 receive unique centered goals and complete movement in both directions at 3 zooms and 2 viewport sizes');
}`,sandbox);
