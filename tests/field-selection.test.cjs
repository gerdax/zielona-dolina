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
vm.runInContext(fs.readFileSync('dist/field-selection.js','utf8'),sandbox);
vm.runInContext(`{
state.war.guards=[];state.war.soldiers=0;state.war.expedition={townId:state.towns[0].id,troops:5,army:Array.from({length:5},(_,i)=>({uid:'away-'+i,hp:8,kind:'melee',path:[]})),route:[{x:120.5,y:120.5},{x:125.5,y:120.5}],progress:0,phase:'outbound',naval:false};state.war.patrols=[{id:'p',units:[{uid:'patrol-one',hp:8,x:118.5*T,y:120.5*T,path:[]}]}];for(let y=115;y<128;y++)for(let x=115;x<128;x++)seen.add(tileKey(x,y));
const count=armyTotal(),units=expeditionActors();if(units.length!==5||selectableUnits().length!==6)throw Error('away soldiers missing');if(selectSoldierBox({x:119*T,y:119*T},{x:122*T,y:122*T})!==5)throw Error('box failed expedition');
selectedUnits=new Set(['away-0']);commandDraft='move';if(!issueMapCommand(121,122))throw Error('field order failed');if(state.war.soldiers!==1||state.war.expedition.troops!==4||armyTotal()!==count)throw Error('detach duplicates/loss');if(!state.war.guards[0].order)throw Error('new command lost');
selectedUnits=new Set(selectableUnits().map(u=>u.uid));clearCommands();if(state.war.expedition||state.war.patrols.length||state.war.soldiers!==6||armyTotal()!==count||new Set(state.war.guards.map(u=>u.uid)).size!==6)throw Error('stop field groups failed');
state.war.expedition={troops:1,army:[{uid:'boat-unit',hp:8}],naval:true,route:[{x:river(120)+2.5,y:120.5}],progress:0};if(expeditionActors().length)throw Error('selects embarked passengers');
}`,sandbox);console.log('PASS expedition/patrol box selection, individual commands, stop, troop accounting, unique IDs and embarked protection');
