const fs=require('fs'),vm=require('vm'),assert=require('assert');
const noop=()=>{},els=new Map();let saved={p:{x:120.5*48,y:120.5*48},wood:500,stone:300,food:500,gold:0,cut:[],buildings:[{x:118,y:120,type:'start'},{x:119,y:120,type:'dom'}],seen:[],settled:{x:120,y:120},chopped:7,time:0,open:true};
const oldBuildings=JSON.stringify(saved.buildings),oldResources=[saved.wood,saved.stone,saved.food];
const ctx=new Proxy({measureText:s=>({width:s.length*6}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
function el(id){if(!els.has(id))els.set(id,{addEventListener:noop,focus:noop,textContent:'',innerHTML:'',style:{},classList:{contains:()=>true,add:noop,remove:noop,toggle:noop},append:noop,setAttribute:noop,dataset:{},querySelectorAll:()=>[],getContext:()=>ctx});return els.get(id)}
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
vm.runInContext(fs.readFileSync('dist/construction.js','utf8'),sandbox);
vm.runInContext(`{
state.wood=1000;state.stone=1000;state.food=1000;let spot;for(let y=116;y<125&&!spot;y++)for(let x=116;x<125;x++)if(!building(x,y)&&!natural(x,y)&&terrain(x,y)==='grass'&&x!==120){spot={x,y};break}if(!spot)throw Error('no test spot');
mode='brama_kamienna';build(spot.x,spot.y);let b=building(spot.x,spot.y);if(b?.type!=='brama'||b.material!=='stone'||buildingMaxHp(b)!==240||!b.open)throw Error('stone gate build');b.open=false;if(!blocked((b.x+.5)*T,(b.y+.5)*T))throw Error('closed gate passes');b.open=true;if(blocked((b.x+.5)*T,(b.y+.5)*T))throw Error('open gate blocks');damageBuilding(b,80);if(b.hp!==160)throw Error('stone hp');const stone=state.stone;demolish(b.x,b.y);if(state.buildings.includes(b)||state.stone!==stone+12)throw Error('stone refund');
chooseConstruction('sciezka_kamienna');const stoneBefore=state.stone;build(spot.x,spot.y);const road=building(spot.x,spot.y);if(road?.type!=='sciezka'||!road.paved||state.stone!==stoneBefore-3||pathSpeed((spot.x+.5)*T,(spot.y+.5)*T)!==1.8)throw Error('stone path catalogue/build');demolish(spot.x,spot.y);mode='wieza_kamienna';build(spot.x,spot.y);const tower=building(spot.x,spot.y);if(tower?.type!=='wieza'||tower.material!=='stone'||buildingMaxHp(tower)!==300)throw Error('stone tower build');structure(tower,0,0);state.war.raids=[{camp:true,power:10,townId:state.towns[0].id,route:[{x:tower.x+7.5,y:tower.y+.5}],progress:0}];state.war.soldiers=0;state.war.guards=[];updateWar(.1);if(Math.abs(state.war.raids[0].power-9.7)>.001)throw Error('stone tower range/damage');state.war.raids=[];seen.clear();queueTowerVision();for(let i=0;i<10;i++)processTowerVision();if(!seen.has(tileKey(tower.x+10,tower.y)))throw Error('stone tower vision');const cap=armyCapacity();state.buildings.push({type:'koszary',x:120,y:121});if(armyCapacity()!==cap+6)throw Error('barracks capacity');if(!recruitSoldier('melee')||state.war.queue.at(-1).remaining!==6)throw Error('barracks training');const u={x:120.5*T,y:121.5*T,hp:4,restTime:8};healDefender(u,1);if(u.hp!==5)throw Error('barracks heal');
const armor=armorDamage(10);state.buildings.push({type:'zbrojownia',x:119,y:121});if(Math.abs(armorDamage(10)-armor*.8)>.01)throw Error('armory');state.buildings.push({type:'studnia',x:120,y:122});if(buildingWorkFactor({type:'pole',x:121,y:122})!==1.5||buildingWorkFactor({type:'pole',x:140,y:140})!==1)throw Error('well bonus');
state.campaign={stage:'desert'};state.buildings.push({type:'zagroda_wielbladow',x:120,y:122});const sim=constructionStep;simulationStep(60);if(constructionState().camels!==1)throw Error('camel breeding');lifeState().camel=false;if(!claimYardCamel()||!lifeState().camel||constructionState().camels!==0)throw Error('camel claim');
const drawn=[];ctx.rect=(...a)=>drawn.push(a);const origin=state.buildings.length;for(const [dx,dy]of [[1,0],[0,1],[-1,0],[0,-1]])state.buildings.push({type:'palisada',material:'stone',x:130+dx,y:130+dy});buildingIndexSource=null;structure({type:'palisada',material:'stone',x:130,y:130},0,0);if(drawn.length!==5||!drawn.some(a=>a[0]===-24)||!drawn.some(a=>a[1]===-24)||!drawn.some(a=>a[0]+a[2]===24)||!drawn.some(a=>a[1]+a[3]===24))throw Error('wall connections leave gaps');state.buildings.splice(origin);buildingIndexSource=null;
for(const d of constructionDefs)structure({type:d[0],x:120,y:120},0,0);structure({type:'brama',material:'stone',open:true,x:120,y:120},0,0);
}`,sandbox);console.log('PASS stone construction/collision/damage/refund, barracks, well, armor, camel breeding/claim and art');
