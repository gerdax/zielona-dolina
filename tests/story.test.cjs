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

vm.runInContext(fs.readFileSync('dist/story.js','utf8'),sandbox);

vm.runInContext(`
const before=JSON.stringify(state);if(storyState())throw Error('Auto story');if(JSON.stringify(state)!==before)throw Error('Migration');startStory();const gold=state.gold;if(!storyAdvance()||storyState().chapter!==1||state.gold!==gold+20)throw Error('chapter1');
state.settled=null;if(storyAdvance())throw Error('skip unmet objective');state.settled={x:120,y:120};if(!storyAdvance())throw Error('settle');
state.buildings=[{type:'start',x:118,y:120},{type:'dom',x:119,y:120},{type:'dom',x:119,y:121}];buildingIndexSource=null;if(!storyAdvance())throw Error('homes');state.buildings.push({type:'drwal',x:120,y:122},{type:'pole',x:121,y:122});residents=[{job:state.buildings[3]},{job:state.buildings[4]}];if(!storyAdvance())throw Error('jobs');state.buildings.push({type:'sklad',x:122,y:122});state.food=100;state.wood=60;if(!storyAdvance()||state.food!==100||state.wood!==60)throw Error('supplies consumed');state.buildings.push({type:'wieza',x:120,y:124},{type:'werbunek',x:119,y:124});state.war.soldiers=4;if(!storyAdvance()||storyState().chapter!==6)throw Error('defense');state.war.raids=[];if(storyAdvance())throw Error('fake win');if(!launchStoryRaid()||launchStoryRaid()||state.war.raids.length!==1)throw Error('duplicate raid');
const first=state.war.raids[0];const defense=defensePower;defensePower=()=>0;resolveRaid(first);if(storyState().battle!=='lost')throw Error('failure');state.war.raids=[];state.war.soldiers=4;if(!launchStoryRaid())throw Error('retry');defensePower=()=>100;state.war.raids[0].power=0;updateWar(.05);if(storyState().battle!=='won')throw Error('win');state.war.raids=[];const beforeFinal=state.gold;if(!storyAdvance()||!state.story.completed||state.gold!==beforeFinal+150||storyAdvance())throw Error('ending duplicate');if(state.gold<gold+420)throw Error('rewards');defensePower=defense;
const exported=JSON.parse(JSON.stringify(state));if(!exported.story.completed||exported.story.history.length!==7)throw Error('persistence');
`,sandbox);console.log('PASS opt-in story, seven objectives, existing village, resource preservation, rewards once, real raid, failure/retry, victory and persisted ending');
