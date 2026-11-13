const fs=require('fs'),vm=require('vm'),assert=require('assert');
const noop=()=>{},els=new Map();let saved={p:{x:120.5*48,y:120.5*48},wood:500,stone:300,food:500,gold:0,cut:[],buildings:[{x:118,y:120,type:'start'},{x:119,y:120,type:'dom'}],seen:[],settled:{x:120,y:120},chopped:7,time:0,open:true};
const oldBuildings=JSON.stringify(saved.buildings),oldResources=[saved.wood,saved.stone,saved.food];
const ctx=new Proxy({measureText:s=>({width:s.length*6}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
function el(id){if(!els.has(id))els.set(id,{addEventListener:noop,focus:noop,textContent:'',innerHTML:'',style:{},classList:{contains:()=>true,add:noop,remove:noop,toggle:noop},append:noop,setAttribute:noop,dataset:{},getContext:()=>ctx});return els.get(id)}
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
vm.runInContext(`{
if(gemWallet()!==0)throw Error('initial gems');state.towns=[{id:'a',name:'A',relation:'war',power:1,x:80,y:80},{id:'b',name:'B',relation:'war',power:1,x:90,y:90}];conquerWithOrders(state.towns[0]);if(state.gems!==10)throw Error('orders reward');conquerWithOrders(state.towns[0]);collectPastCampGems();if(state.gems!==10)throw Error('double reward');state.war.expedition={townId:'b',troops:10,army:[],route:[{x:120,y:120},{x:90,y:90}],progress:1};resolveExpedition();if(state.gems!==20)throw Error('expedition reward');
state.islandLife={forts:[{id:'f',phase:'cleared'}]};state.adventure={places:[{id:'c',type:'camp',cleared:true}]};collectPastCampGems();if(state.gems!==40)throw Error('other camps reward');collectPastCampGems();if(state.gems!==40)throw Error('migration duplicates');
state.adventure={verdict:'peace',places:[{id:'captain',type:'camp',cleared:true}]};collectPastCampGems();if(state.gems!==40)throw Error('peace reward');
state.victory={won:false};activateGameCode('1248');if(state.gems!==40)throw Error('win code mints gems');
const copy=JSON.parse(JSON.stringify(state));if(copy.gems!==40||!copy.gemRewards['valley:town:a'])throw Error('not saved');state.campaign={stage:'desert'};state.towns=[{id:'a',relation:'war',power:1}];conquerWithOrders(state.towns[0]);if(state.gems!==50)throw Error('stage identity collision');
}`,sandbox);
let next; sandbox.location={reload:()=>{}};sandbox.localStorage={getItem:()=>JSON.stringify({victory:{won:true}}),setItem:(k,v)=>{if(k==='zielona-dolina-v1')next=JSON.parse(v)}};
vm.runInContext(`state.campaign=undefined;state.victory={won:true};startDesertCampaign()`,sandbox);assert.equal(next.gems,50);assert.equal(next.gemRewards['valley:town:a'],true);console.log('PASS +10 camp rewards, deduplication, conquest paths, old saves, no win-code rewards, desert carry');
