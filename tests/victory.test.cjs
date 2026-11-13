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
vm.runInContext(`{
state.islandLife={colonies:[],quests:{},lights:true,fort:null,forts:[]};state.riverAdventure={active:false,islands:[],enemies:[]};startRiverAdventure();for(let n=0;n<5;n++)if(!startPirateFort())throw Error('five forts unavailable with real settlements');
state.victory={won:false,dismissed:false};state.towns=Array.from({length:100},(_,i)=>({id:'town'+i,relation:'conquered'}));state.islandLife={colonies:[],quests:{},lights:true,fort:null,forts:Array.from({length:5},(_,i)=>({id:'fort'+i,phase:'cleared'}))};state.riverAdventure={active:true,islands:[],enemies:Array.from({length:3},(_,i)=>({id:'boat'+i,hp:0}))};state.buildings=[{x:118,y:120,type:'start',castleLevel:2}];buildingIndexSource=null;state.clock.paused=false;
state.towns[0].relation='allied';if(checkWorldVictory())throw Error('alliance counts as conquest');state.towns[0].relation='conquered';state.islandLife.forts[0].phase='battle';if(checkWorldVictory())throw Error('living pirates');state.islandLife.forts[0].phase='owned';state.riverAdventure.enemies[0].hp=1;if(checkWorldVictory())throw Error('living ship');state.riverAdventure.enemies[0].hp=0;state.buildings[0].castleLevel=1;if(checkWorldVictory())throw Error('manor counts as castle');state.buildings[0].castleLevel=2;if(!checkWorldVictory()||!state.victory.won||!state.clock.paused||worldVictory.style.display!=='flex')throw Error('victory trigger');if(checkWorldVictory())throw Error('repeated victory');if(!continueAfterVictory()||state.clock.paused||!state.victory.dismissed)throw Error('continue play');renderVictory(true);if(worldVictory.style.display!=='none')throw Error('reopens won screen');if(!JSON.parse(JSON.stringify(state)).victory.won)throw Error('win not saved');state.victory={won:false};state.riverAdventure.enemies=[];if(victoryReady())throw Error('undiscovered pirate ships counts');state.riverAdventure.enemies=Array.from({length:3},()=>({hp:0}));state.islandLife.forts=[];if(victoryReady())throw Error('undiscovered forts count');state.islandLife.forts=Array.from({length:5},()=>({phase:'cleared'}));state.towns=[];if(victoryReady())throw Error('empty towns count');
}`,sandbox);console.log('PASS all conquest/pirates/castle requirements, no early win, one-time saved victory, pause and continued play');
