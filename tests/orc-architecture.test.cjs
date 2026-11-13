const fs=require('fs'),vm=require('vm'),assert=require('assert');
const state={p:{x:25*48,y:30*48},campaign:{stage:'desert'},towns:[{id:'a',x:30,y:30,relation:'scouting'},{id:'b',x:60,y:60}],buildings:[]};
const forbidden=new Set(),draws=[];let valleyCalls=0,baseDraws=0,rescues=0;
const context={state,N:100,T:48,rescuePlayer(){rescues++;},foreignIndex:new Map(),tileKey:(x,y)=>x+','+y,
 isDesertCampaign:()=>state.campaign?.stage==='desert',terrain:(x,y)=>forbidden.has(x+','+y)?'water':'grass',building:(x,y)=>state.buildings.find(b=>b.x===x&&b.y===y),
 rebuildForeignIndex(){valleyCalls++;context.foreignIndex.clear();context.foreignIndex.set('vanilla',{type:'foreign_house'});},natural:()=> 'tree',structure(){baseDraws++;},
 polygon(points,color){assert(points.flat().every(Number.isFinite));draws.push(color);},artRect(...args){assert(args.slice(0,4).every(Number.isFinite));draws.push(args[4]);},artLine(points,color){assert(points.flat().every(Number.isFinite));draws.push(color);}
};
vm.createContext(context);vm.runInContext(fs.readFileSync('dist/orc-architecture.js','utf8'),context);
const run=code=>vm.runInContext(code,context),camp=()=>[...context.foreignIndex.values()].filter(b=>b.townId==='a');
assert.equal(rescues,1,'Player on a new wall needs rescue');
const counts={};for(const b of camp())counts[b.type]=(counts[b.type]||0)+1;
assert.equal(counts.foreign_orc_wall,38);assert.equal(counts.foreign_orc_gate,2);assert.equal(counts.foreign_house,3);assert.equal(counts.foreign_tower,2);assert.equal(counts.foreign_orc_field,2);
for(const type of ['foreign_keep','foreign_orc_lumber','foreign_orc_quarry','foreign_orc_storage','foreign_orc_farm'])assert.equal(counts[type],1);
assert.equal(run('orcWallBlocked(25,30)'),true);assert.equal(run('orcWallBlocked(30,35)'),false);assert.equal(run('orcWallBlocked(31,35)'),false);
for(let y=30;y<=37;y++)for(const x of [30,31]){const b=context.foreignIndex.get(x+','+y);assert(!b||b.type==='foreign_orc_gate');assert.equal(run(`natural(${x},${y})`),null);}
const first=JSON.stringify([...context.foreignIndex]);run('rebuildForeignIndex()');assert.equal(JSON.stringify([...context.foreignIndex]),first);
state.towns[0].fortBroken=true;assert.equal(run('orcWallBlocked(25,30)'),false);state.towns[0].fortBroken=false;state.towns[0].relation='conquered';assert.equal(run('orcWallBlocked(30,35)'),false);
for(const b of camp())context.structure(b,b.x*48,b.y*48);assert(draws.length>100);context.structure({type:'dom'},0,0);assert.equal(baseDraws,1);
state.buildings.push({x:25,y:30,type:'dom'});forbidden.add('35,30');run('rebuildForeignIndex()');assert(!context.foreignIndex.has('25,30'));assert(!context.foreignIndex.has('35,30'));assert.equal(run('natural(25,30)'),'tree','Own-building cell must use original natural logic');assert.equal(run('natural(35,30)'),'tree');
state.towns.push({id:'overlap',x:31,y:31});run('rebuildForeignIndex()');assert.equal(context.foreignIndex.get('30,28').townId,'a');
state.towns.push({id:'edge',x:1,y:1});run('rebuildForeignIndex()');assert([...context.foreignIndex.values()].every(b=>b.x>=0&&b.y>=0&&b.x<100&&b.y<100));
state.campaign=undefined;run('rebuildForeignIndex()');assert.equal(valleyCalls,1);assert.equal(context.foreignIndex.size,1);assert.equal(run('natural(30,30)'),'tree');assert.equal(run('orcWallBlocked(25,30)'),false);context.structure({type:'foreign_keep'},0,0);assert.equal(baseDraws,2);
console.log('PASS deterministic orc layout, open two-tile gate/corridor, destruction collision, ownership/terrain/overlap/bounds protection, draw smoke and valley isolation');
