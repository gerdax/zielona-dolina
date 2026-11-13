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
vm.runInContext(fs.readFileSync('dist/starter-packs.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/customization.js','utf8'),sandbox);
vm.runInContext(`{
if(!saveAppearance('outfit','knight')||saveAppearance('outfit','evil'))throw Error('outfit validation');saveAppearance('dogColor','black');saveAppearance('dogName','  Azor  ');saveAppearance('bannerColor','blue');saveAppearance('bannerEmblem','moon');if(appearance().dogName!=='Azor'||dogCoat()!=='#45433e')throw Error('dog style');if(!drawPlayerAppearance(0,0))throw Error('outfit drawing');state.life.dog={x:state.p.x,y:state.p.y,path:[],wait:0};seen.add(tileKey(Math.floor(state.p.x/T),Math.floor(state.p.y/T)));drawLifeAnimals();
state.campaign=undefined;state.food=100;if(tameCamel())throw Error('camel in valley');state.campaign={stage:'desert'};if(!tameCamel()||state.food!==60||tameCamel())throw Error('camel tame');const before=playerTravelMultiplier();if(!toggleCamel()||Math.abs(playerTravelMultiplier()-before*1.5)>.001)throw Error('camel speed');drawCamelPlayer(0,0);state.playerBoat={aboard:true,level:1};if(toggleCamel())throw Error('camel on boat');if(playerTravelMultiplier()>1.2)throw Error('camel boosts boat');state.playerBoat=null;toggleCamel();if(state.life.camelMounted)throw Error('dismount');state.life.horse=true;toggleCamel();togglePlayerHorse();if(state.life.camelMounted||!state.life.mounted)throw Error('two mounts');
const originalLegs=drawWalkingLegs;let walkCalls=0;drawWalkingLegs=function(){walkCalls++};for(const outfit of ['default','knight','scout','desert']){appearance().outfit=outfit;drawCamelPlayer(0,0)}if(walkCalls!==0)throw Error('camel rider uses walking legs');drawPlayerAppearance(0,0,true);if(walkCalls!==1)throw Error('walking animation lost');drawWalkingLegs=originalLegs;
if(!JSON.parse(JSON.stringify(state)).appearance.bannerEmblem)throw Error('appearance not saved');
}`,sandbox);console.log('PASS outfits, dog color/name, banners, desert camel, speed, dismount and boat/horse exclusion');
