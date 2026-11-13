const fs=require('fs'),vm=require('vm'),assert=require('assert');
const noop=()=>{},els=new Map();let saved={p:{x:120.5*48,y:120.5*48},wood:500,stone:300,food:500,gold:0,cut:[],buildings:[{x:118,y:120,type:'start'},{x:119,y:120,type:'dom'}],seen:[],settled:{x:120,y:120},chopped:7,time:0,open:true};
const oldBuildings=JSON.stringify(saved.buildings),oldResources=[saved.wood,saved.stone,saved.food];
const ctx=new Proxy({measureText:s=>({width:s.length*6})},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
function el(id){if(!els.has(id))els.set(id,{textContent:'',innerHTML:'',style:{},classList:{contains:()=>true,add:noop,remove:noop,toggle:noop},append:noop,dataset:{},getContext:()=>ctx});return els.get(id)}
const sandbox={document:{getElementById:el,querySelectorAll:()=>[],createElement:()=>el(Math.random())},localStorage:{getItem:()=>JSON.stringify(saved),setItem:(k,v)=>saved=JSON.parse(v)},window:{addEventListener:noop},performance:{now:()=>0},setTimeout:noop,clearTimeout:noop,setInterval:noop,requestAnimationFrame:noop,innerWidth:1280,innerHeight:800,devicePixelRatio:1,console};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/war.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/patrol.js','utf8'),sandbox);

vm.runInContext(`{
const trooper=drawTrooper,archer=drawArcherUnit,boat=drawBoat;let troops=0,archers=0,boats=0;drawTrooper=()=>troops++;drawArcherUnit=()=>archers++;drawBoat=()=>boats++;
const e={route:[{x:120.5,y:120.5}],progress:0,naval:false,army:[{kind:'archer'}]};
for(const count of [1,6,13]){troops=archers=boats=0;drawCampaignForce(e,count,()=>true);if(troops+archers!==count||archers!==1||boats)throw Error('Own force count/type mismatch');}
troops=archers=0;drawCampaignForce(e,12,()=>true,true);if(troops!==12||archers)throw Error('Enemy count mismatch');
troops=0;drawCampaignForce(e,12,()=>false,true);if(troops)throw Error('Fog visibility ignored');
e.route=[{x:river(120),y:120.5}];e.naval=true;troops=archers=boats=0;drawCampaignForce(e,6,()=>true);if(troops+archers!==6||boats!==6)throw Error('Water force count mismatch');
drawTrooper=trooper;drawArcherUnit=archer;drawBoat=boat;console.log('PASS exact own/enemy force counts, archer appearance, fog and naval force counts');
}`,sandbox);
