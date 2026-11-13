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
state.towns=[];rebuildForeignIndex();state.war.raids=[];state.buildings=[{x:118,y:120,type:'start'},{x:120,y:121,type:'werbunek'},{x:121,y:121,type:'werbunek'}];buildingIndexSource=null;state.settled={x:120,y:120};state.wood=300;state.stone=100;state.food=100;state.war.queue=[];state.war.soldiers=0;state.war.guards=[];if(!recruitSoldier('crossbow')||!recruitSoldier('shield')||state.wood!==245||state.stone!==87||state.food!==70)throw Error('new recruitment costs');for(let i=0;i<270;i++)updateWar(.1);if(!state.war.guards.some(u=>u.kind==='crossbow')||!state.war.guards.some(u=>u.kind==='shield'))throw Error('trained kind lost');
const c=state.war.guards.find(u=>u.kind==='crossbow'),s=state.war.guards.find(u=>u.kind==='shield');state.war.upgrades={sword:0,bow:0,armor:0};if(soldierDamage(c)!==4||Math.abs(armorDamage(10,s)-5.5)>.001)throw Error('unit stats');const oldTerrain=terrain;terrain=()=> 'grass';cut=new Set;for(let x=90;x<150;x++)for(let y=90;y<150;y++){cut.add(tileKey(x,y));seen.add(tileKey(x,y))}c.x=120.5*T;c.y=120.5*T;const r={townId:'range',power:50,camp:true,progress:0,route:[{x:126,y:120.5},{x:126,y:120.5}]};state.war.raids=[r];c.attackCooldown=0;if(!defendActor(c,.1)||r.power!==46||c.attackCooldown!==2.2||!c.shot)throw Error('crossbow range/damage/reload');
selectedUnits=new Set([c.uid,s.uid]);if(!setTroopFormation('wall'))throw Error('formation apply');s.x=c.x+T;s.y=c.y;if(Math.abs(armorDamage(10,s)-4.125)>.001)throw Error('shieldwall protection');setTroopFormation('wedge');if(Math.abs(soldierDamage(s)-1.92)>.001)throw Error('wedge damage');const wedge=formationMoveSpots([c,s,{},{},{}],120,120);if(new Set(wedge.map(p=>tileKey(p.x,p.y))).size!==5)throw Error('formation overlaps');setTroopFormation('loose');const loose=formationMoveSpots([c,s],120,120);if(Math.hypot(loose[0].x-loose[1].x,loose[0].y-loose[1].y)<2)throw Error('loose spacing');if(!JSON.parse(JSON.stringify(state)).war.guards.every(u=>u.formation==='loose'))throw Error('formation persistence');
state.islandLife={colonies:[],quests:{},lights:true,fort:null};state.riverAdventure={active:false,islands:[],enemies:[]};state.war.raids=[];state.p={x:120.5*T,y:120.5*T};for(let n=0;n<5;n++)if(!startPirateFort())throw Error('cannot create five forts');if(startPirateFort()||islandLife().forts.length!==5||new Set(state.war.raids.map(r=>r.townId)).size!==5)throw Error('fort cap/duplicate garrisons');const savedLife=JSON.parse(JSON.stringify(state.islandLife));state.islandLife=savedLife;const a=islandLife();if(a.fort!==a.forts.find(f=>f.id===a.fort.id))throw Error('selected fort not restored');const first=a.forts[0],last=a.forts[4];first.phase='owned';ensurePirateGarrison(first);if(last.phase!=='battle')throw Error('fort states coupled');terrain=oldTerrain;
}
`,sandbox);console.log('PASS recruitment costs/training, crossbow ranged combat, shields, formation stats/spacing/save, five independent forts/cap and save migration');
