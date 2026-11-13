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
vm.runInContext(fs.readFileSync('dist/orc-residents.js','utf8'),sandbox);
vm.runInContext(`{
state.campaign={stage:'desert'};rebuildForeignIndex();const t=state.towns[0];
for(let dy=-6;dy<=6;dy++)for(let dx=-6;dx<=6;dx++)seen.add(tileKey(t.x+dx,t.y+dy));
let people=visibleOrcResidents(t.x-6,t.y-6,t.x+6,t.y+6);if(people.length!==5)throw Error('expected five civilians, got '+people.length);
const first=people.map(p=>[p.x,p.y]);state.time+=2;people=visibleOrcResidents(t.x-6,t.y-6,t.x+6,t.y+6);if(!people.some((p,i)=>p.x!==first[i][0]||p.y!==first[i][1]))throw Error('not walking');
for(const r of people){for(const p of r.path){const x=Math.floor(p.x/T),y=Math.floor(p.y/T);if(orcWallBlocked(x,y)||foreignBuilding(x,y)||natural(x,y))throw Error('route enters obstacle')}drawOrcResident(r)}
let working=false;for(let i=0;i<40;i++){state.time=i;working ||= visibleOrcResidents(t.x-6,t.y-6,t.x+6,t.y+6).some(r=>r.working)}if(!working)throw Error('no work animation');
if(visibleOrcResidents(600,600,610,610).length)throw Error('offscreen residents');
seen.clear();if(visibleOrcResidents(t.x-6,t.y-6,t.x+6,t.y+6).length)throw Error('fog leak');
const oldCache=orcCivilianLayout;rebuildForeignIndex();campCivilians(t);if(oldCache===orcCivilianLayout)throw Error('stale cache');
state.campaign.stage='valley';if(visibleOrcResidents(0,0,N,N).length)throw Error('orc villagers in valley');
}`,sandbox);console.log('PASS orc civilian movement, work, collision, fog, culling and cache reset');
