const fs = require('fs'), vm = require('vm'), assert = require('assert');
const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, {children: [], textContent: '', classList: {add(){},remove(){}}, setAttribute(){}, append(child){this.children.push(child);}, replaceChildren(){this.children=[];this.textContent='';}});
  return elements.get(id);
}
const context = {
  state: {time:0, p:{x:0,y:0}, clock:{}, war:{raids:[],waypoint:'old'}, towns:[{id:'a',name:'Obóz A',relation:'scouting'},{id:'b',name:'Obóz B',relation:'scouting'}]},
  seen: new Set(), T:48, tileKey:(x,y)=>x+','+y,
  routePosition:scout=>({x:scout.x*48,y:scout.y*48}),
  document:{createElement:()=>element(Symbol()),body:element('body')}, $:element,
  save(){context.saved=JSON.parse(JSON.stringify(context.state));}, say(){},
  simulationStep(dt){context.state.time+=dt;},
};
vm.createContext(context);
const source = fs.readFileSync('dist/scout-journal.js','utf8');
vm.runInContext(source,context);
const run = code => vm.runInContext(code,context), journal = () => context.state.scoutJournal;
const scout = {scout:true,townId:'a',power:1,x:10,y:20};
context.state.war.raids.push(scout);
run('scanScoutJournal()'); assert.equal(journal().entries.length,0,'Unseen scout leaked');
context.seen.add('10,20'); run('scanScoutJournal()');
assert.equal(journal().entries.length,1); assert.equal(journal().entries[0].kind,'sighting');
assert.equal(context.saved.scoutJournal.entries.length,1);
run('scanScoutJournal();scanScoutJournal()'); assert.equal(journal().entries.length,1,'Repeated static sightings');
scout.x=19;context.seen.add('19,20');context.state.time=9;run('scanScoutJournal()');assert.equal(journal().entries.length,1);
context.state.time=10;run('scanScoutJournal()');assert.equal(journal().entries.length,2,'Meaningful movement absent');
scout.x=50;run('scanScoutJournal()');
assert.equal(journal().entries.at(-1).kind,'lost'); assert.equal(journal().entries.at(-1).x,19,'Unseen location leaked');
run('scanScoutJournal()');assert.equal(journal().entries.length,3,'Repeated loss');
context.seen.add('50,20');run('scanScoutJournal()');scout.power=0;run('scanScoutJournal()');
assert.equal(journal().entries.at(-1).kind,'lost','Disappearance must not assert death');
assert.equal(run('locateScoutJournalEntry(0)'),true);assert.equal(context.state.clock.mapTarget.x,10);assert.deepEqual(context.state.p,{x:0,y:0});
assert.equal(run('locateScoutJournalEntry(2)'),false);
context.state.towns[0].relation='war';context.state.towns[0].scoutFound=true;context.state.towns[0].discovered=true;run('scanScoutJournal()');
assert.equal(journal().entries.at(-1).kind,'discovery');assert.equal(journal().entries.at(-1).x,undefined);
const count=journal().entries.length;run('scanScoutJournal()');assert.equal(journal().entries.length,count);
assert.equal(context.state.towns[1].relation,'scouting','Journal must not declare war');
for(let i=0;i<40;i++)run("addScoutJournalEntry('sighting',{townId:'a',town:'A',x:1,y:2})");assert.equal(journal().entries.length,30);
run('renderScoutJournal()'); assert.equal(element('scoutJournalEntries').children.length,30);
// Reload preserves contacts and does not mint a duplicate first sighting.
context.state.war.raids=[{...scout,power:1}];run('scanScoutJournal()');
const restored=JSON.parse(JSON.stringify(context.state));const context2={...context,state:restored};vm.createContext(context2);vm.runInContext(source,context2);
const before=JSON.stringify(restored.scoutJournal.entries);vm.runInContext('scanScoutJournal()',context2);assert.equal(JSON.stringify(restored.scoutJournal.entries),before);
// Wrapper scans at most once per second; the underlying simulation continues normally.
run('let scans=0;scanScoutJournal=()=>scans++');for(let i=0;i<19;i++)run('simulationStep(.05)');assert.equal(run('scans'),0);run('simulationStep(.05)');assert.equal(run('scans'),1);
console.log('PASS observed-only sightings, bounded saved journal, meaningful movement, lost contact, public discovery, no war/teleport, reload dedup and scan cadence');
