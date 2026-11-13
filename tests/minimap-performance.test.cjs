const fs=require('fs'),vm=require('vm'),assert=require('assert');
const noop=()=>{},els=new Map();let saved={p:{x:120.5*48,y:120.5*48},wood:500,stone:300,food:500,gold:0,cut:[],buildings:[{x:118,y:120,type:'start'},{x:119,y:120,type:'dom'}],seen:[],settled:{x:120,y:120},chopped:7,time:0,open:true};
const oldBuildings=JSON.stringify(saved.buildings),oldResources=[saved.wood,saved.stone,saved.food];
const ctx=new Proxy({measureText:s=>({width:s.length*6})},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
function el(id){if(!els.has(id))els.set(id,{textContent:'',innerHTML:'',style:{},classList:{contains:()=>true,add:noop,remove:noop,toggle:noop},append:noop,dataset:{},getContext:()=>ctx});return els.get(id)}
const sandbox={document:{getElementById:el,querySelectorAll:()=>[],createElement:()=>el(Math.random())},localStorage:{getItem:()=>JSON.stringify(saved),setItem:(k,v)=>saved=JSON.parse(v)},window:{addEventListener:noop},performance:{now:()=>0},setTimeout:noop,clearTimeout:noop,setInterval:noop,requestAnimationFrame:noop,innerWidth:1280,innerHeight:800,devicePixelRatio:1,console};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/war.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/patrol.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/commerce.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/strategy.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/kingdom.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/selection.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/atlas.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/frontier.js','utf8'),sandbox);
vm.runInContext(`{
seen=new Set;for(let x=0;x<640;x++)for(let y=0;y<640;y++)seen.add(tileKey(x,y));let terrainCalls=0;const originalTerrain=terrain;terrain=(...args)=>{terrainCalls++;return originalTerrain(...args)};
minimap();if(miniSeenCount!==2000||terrainCalls>1001)throw Error('Restore scans whole map');
for(let i=0;i<205;i++)minimap();if(miniSeenCount!==seen.size)throw Error('Restore incomplete');terrainCalls=0;for(let i=0;i<60;i++)minimap();if(terrainCalls)throw Error('Cached map recalculates terrain');
seen.delete('638,638');seen=new Set(seen);minimap();if(miniSeenCount!==2000)throw Error('New world not invalidated');for(let i=0;i<205;i++)minimap();seen.add('638,638');terrainCalls=0;minimap();if(miniSeenCount!==seen.size||terrainCalls!==1)throw Error('New reveal missing');
state.buildings=[{x:Math.round(river(120))-3,y:120,type:'wawoz'}];refreshWater();const revision=waterRevision;state.buildings.push({x:Math.round(river(120))-2,y:120,type:'wawoz'});refreshWater();if(waterRevision===revision)throw Error('Water cache revision unchanged');minimap();if(miniWaterRevision!==waterRevision||miniSeenCount!==2000)throw Error('Flooded terrain cache stale');
terrain=originalTerrain;console.log('PASS bounded 640x640 map restoration, zero unchanged-terrain work, incremental exploration, world replacement and flood invalidation');
}`,sandbox);
