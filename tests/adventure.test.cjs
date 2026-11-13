const fs=require('fs'),vm=require('vm'),assert=require('assert');
const noop=()=>{},els=new Map();let saved={p:{x:120.5*48,y:120.5*48},wood:500,stone:300,food:500,gold:0,cut:[],buildings:[{x:118,y:120,type:'start'},{x:119,y:120,type:'dom'}],seen:[],settled:{x:120,y:120},chopped:7,time:0,open:true};
const oldBuildings=JSON.stringify(saved.buildings),oldResources=[saved.wood,saved.stone,saved.food];
const ctx=new Proxy({measureText:s=>({width:s.length*6})},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
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

vm.runInContext(fs.readFileSync('dist/story.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/adventure.js','utf8'),sandbox);

vm.runInContext(`
const before=JSON.stringify(state);if(adventureState()||JSON.stringify(state)!==before)throw Error('unrequested migration');
state.buildings=[{x:118,y:120,type:'start'}];buildingIndexSource=null;state.towns=[];rebuildForeignIndex();state.wood=500;state.stone=500;state.food=500;state.gold=500;state.war.raids=[];state.war.aiGrace=1e6;state.war.aiCooldown=1e6;
if(!startAdventures())throw Error('placement');const a=adventureState();if(a.places.length!==5||new Set(a.places.map(p=>p.x+','+p.y)).size!==5)throw Error('places');const sites=a.places;state.p={x:(sites[0].x+.5)*T,y:(sites[0].y+1.5)*T};mode='dom';const buildingsBefore=state.buildings.length;build(sites[0].x,sites[0].y);if(state.buildings.length!==buildingsBefore)throw Error('building on site');state.p={x:120.5*T,y:120.5*T};mode=null;const places=JSON.stringify(a.places);startAdventures();if(JSON.stringify(a.places)!==places)throw Error('reroll');for(const p of a.places)if(terrain(p.x,p.y)!=='grass'||building(p.x,p.y)||foreignBuilding(p.x,p.y))throw Error('unsafe site');
const food=state.food;if(!adventureChoice('refugees','help')||state.food!==food-25||adventureChoice('refugees','keep'))throw Error('choice');if(!adventureChoice('scout','talk'))throw Error('talk');
if(adventureLoot('cart'))throw Error('remote loot');const cart=adventurePlace('cart');state.p={x:(cart.x+.5)*T,y:(cart.y+.5)*T};const gold=state.gold;if(!adventureLoot('cart')||state.gold!==gold+35||adventureLoot('cart')||!a.clue)throw Error('loot duplicate');
if(startSecondCampaign())throw Error('campaign unlock');state.story={completed:true};if(!startSecondCampaign()||advanceSecondCampaign())throw Error('objective bypass');const ruins=adventurePlace('ruins');state.p={x:(ruins.x+.5)*T,y:(ruins.y+.5)*T};adventureLoot('ruins');if(!advanceSecondCampaign()||a.campaign!==1)throw Error('ruin clue');
const camp=adventurePlace('camp');state.p={x:(camp.x+.5)*T,y:(camp.y+.5)*T};if(!attackAdventureCamp('camp')||attackAdventureCamp('camp')||state.war.raids[0].power!==12)throw Error('camp spawn');const raid=state.war.raids[0],pos=JSON.stringify(routePosition(raid));state.war.soldiers=0;updateWar(.1);if(!state.war.raids.includes(raid)||JSON.stringify(routePosition(raid))!==pos||raid.progress!==0)throw Error('camp marched/resolved');
state.war.soldiers=4;state.war.guards=Array.from({length:4},()=>({x:(camp.x+.5)*T,y:(camp.y+.5)*T,hp:8,path:[]}));for(let i=0;i<100&&!camp.cleared;i++){state.time+=.05;updateWar(.05)}if(!camp.cleared||state.war.raids.some(r=>r.camp==='camp'))throw Error('combat victory');const reward=state.gold;updateWar(.1);if(state.gold!==reward)throw Error('camp reward twice');
if(!claimResidentQuest('rescue')||claimResidentQuest('rescue')||!advanceSecondCampaign()||a.campaign!==2)throw Error('rescue');if(restoreAdventureCastle())throw Error('remote restore');state.p={x:(ruins.x+.5)*T,y:(ruins.y+.5)*T};const wood=state.wood;if(!restoreAdventureCastle()||state.wood!==wood-80||restoreAdventureCastle()||!advanceSecondCampaign())throw Error('castle');if(!advanceSecondCampaign()||a.campaign!==4)throw Error('cart clue');if(secondCampaignVerdict('justice'))throw Error('unearned justice');
const peaceSave=JSON.stringify(state);if(!secondCampaignVerdict('peace')||!advanceSecondCampaign()||!a.completed||!a.ending.includes('pojednanie')||advanceSecondCampaign())throw Error('peace ending');
state=JSON.parse(peaceSave);adventurePlace('captain').cleared=true;if(!secondCampaignVerdict('justice')||!advanceSecondCampaign()||!adventureState().ending.includes('strażnicą'))throw Error('justice ending');if(!JSON.parse(JSON.stringify(state)).adventure.completed)throw Error('save');
`,sandbox);console.log('PASS opt-in safe sites, persistent choices/costs, loot distance/once, stationary camp combat/reward, rescue, campaign unlock/objectives/castle costs and two endings');
