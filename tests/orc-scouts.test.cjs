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
vm.runInContext(`{
state.campaign={stage:'desert',valleyWon:true,orcScouting:1,scoutClock:999};state.towns=[{id:'a',x:50,y:50,relation:'scouting',discovered:true},{id:'b',x:40,y:40,relation:'scouting'}];state.p={x:200*T,y:200*T};state.buildings=[{x:118,y:120,type:'start'}];state.war.raids=[{townId:'a',scout:true,camp:true,hostile:true,power:1,route:[{x:50.5,y:50.5},{x:51.5,y:50.5}],progress:0}];updateOrcScouts(.01);if(state.towns[0].relation!=='scouting')throw Error('war before discovery');state.p={x:51*T,y:51*T};updateOrcScouts(.01);if(state.towns[0].relation!=='scouting'||state.towns[0].scoutFound)throw Error('player alone reveals village');state.buildings.push({x:52,y:50,type:'dom'});state.p={x:200*T,y:200*T};updateOrcScouts(.01);if(state.towns[0].relation!=='war'||!state.towns[0].scoutFound||state.towns[1].relation!=='scouting'||state.war.raids.length)throw Error('discovery transition');
state.war.raids=[{townId:'b',scout:true,camp:true,power:0,route:[{x:40.5,y:40.5}],progress:0}];state.p={x:40*T,y:40*T};updateOrcScouts(.01);if(state.towns[1].relation!=='scouting')throw Error('dead scout discovers player');
state.campaign.scoutClock=0;state.p={x:200*T,y:200*T};const oldRoute=campaignRoute;campaignRoute=(a,b)=>[{x:a.x,y:a.y},{x:b.x,y:b.y}];updateOrcScouts(.01);campaignRoute=oldRoute;if(state.war.raids.length!==1||!state.war.raids[0].scout||state.towns[1].relation!=='scouting')throw Error('scout not sent');
const persisted=JSON.parse(JSON.stringify(state));if(!persisted.towns[0].scoutFound||!persisted.war.raids[0].scout)throw Error('scout state lost');
state.buildings=[{x:42,y:42,type:'start'}];state.war.raids[0].route=[{x:43.5,y:43.5},{x:44.5,y:43.5}];state.war.raids[0].progress=0;updateOrcScouts(.01);if(state.towns[1].relation!=='war')throw Error('building not detected');
state.towns[0].relation='conquered';initDesertCampaign();if(state.towns[0].relation!=='conquered'||state.towns[1].relation!=='war')throw Error('reload loses discovery or conquest');
}`,sandbox);console.log('PASS scouting before war, player ignored, village buildings detected, dead scouts, spawn, persistence and conquered camps');
