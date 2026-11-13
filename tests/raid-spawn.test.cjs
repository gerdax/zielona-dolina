const fs=require('fs'),vm=require('vm'),assert=require('assert');
const noop=()=>{},els=new Map();let saved={p:{x:120.5*48,y:120.5*48},wood:500,stone:300,food:500,gold:0,cut:[],buildings:[{x:118,y:120,type:'start'},{x:119,y:120,type:'dom'}],seen:[],settled:{x:120,y:120},chopped:7,time:0,open:true};
const oldBuildings=JSON.stringify(saved.buildings),oldResources=[saved.wood,saved.stone,saved.food];
const ctx=new Proxy({measureText:s=>({width:s.length*6})},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
function el(id){if(!els.has(id))els.set(id,{textContent:'',innerHTML:'',style:{},classList:{contains:()=>true,add:noop,remove:noop,toggle:noop},append:noop,dataset:{},getContext:()=>ctx});return els.get(id)}
const sandbox={document:{getElementById:el,querySelectorAll:()=>[],createElement:()=>el(Math.random())},localStorage:{getItem:()=>JSON.stringify(saved),setItem:(k,v)=>saved=JSON.parse(v)},window:{addEventListener:noop},performance:{now:()=>0},setTimeout:noop,clearTimeout:noop,setInterval:noop,requestAnimationFrame:noop,innerWidth:1280,innerHeight:800,devicePixelRatio:1,console};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/war.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/patrol.js','utf8'),sandbox);

vm.runInContext(`{
state.p={x:110.5*T,y:120.5*T};state.settled={x:120,y:120};state.buildings=[];state.towns=[{id:'siege',name:'Testowy Fort',x:110,y:120,power:20,color:'#fff',relation:'war',discovered:true,raidTimer:.01}];state.war={soldiers:0,guards:[],patrols:[],queue:[],raids:[],log:[],aiGrace:99999,aiCooldown:99999};cut=new Set;seen=new Set;for(let x=100;x<=130;x++)for(let y=100;y<=130;y++){cut.add(tileKey(x,y));seen.add(tileKey(x,y))}
for(let x=116;x<=124;x++)for(const y of [116,124])state.buildings.push({x,y,type:'palisada'});for(let y=117;y<124;y++)for(const x of [116,124])state.buildings.push({x,y,type:'palisada'});building(116,120).type='brama_swoi';initPatrols();rebuildForeignIndex();updateWar(.02);
if(state.war.raids.length!==1)throw Error('Countdown ended without spawning enemy outside sealed village');
const r=state.war.raids[0],food=state.food;for(let i=0;i<150;i++)updateWar(.05);
if(!state.war.raids.includes(r)||state.food!==food||!r.siege||routePosition(r).x>=116*T)throw Error('Enemy bypassed wall or silently resolved');
const gate=building(116,120);gate.type='brama';gate.open=true;for(let i=0;i<250&&state.war.raids.length;i++)updateWar(.05);
if(state.war.raids.length)throw Error('Raid did not resume through opened gate');
console.log('PASS expired countdown spawns visible besiegers, wall prevents entry/theft, opening gate resumes raid');
}`,sandbox);
