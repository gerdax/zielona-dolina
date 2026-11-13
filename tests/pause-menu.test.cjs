const fs = require('fs'), vm = require('vm'), assert = require('assert');
function setup({paused = false, victory = {won: false}} = {}) {
  const elements = new Map(), handlers = [], saves = [];
  const document = {activeElement: null, body: {children: [], append(element) { this.children.push(element); }} };
  function element(id) {
    if (!elements.has(id)) elements.set(id, {id, tagName: 'BUTTON', hidden: false, inert: false, style: {}, dataset: {}, classList: {toggle() {}}, setAttribute() {}, closest() {return this.hidden?this:null;}, querySelectorAll() {return ['pauseMainMenu','pauseNewGame','pauseAddons','pauseContinue','pauseExit'].map(id=>element(id));}, focus() { document.activeElement = this; }});
    return elements.get(id);
  }
  document.getElementById = element;
  document.createElement = () => element('pauseMenu');
  document.querySelectorAll = () => [];
  document.body.children.push(element('world'), element('alreadyInert'));
  element('alreadyInert').inert = true;
  document.activeElement = element('pauseGame');
  const context = {document, window: {addEventListener(type, handler, capture) { handlers.push({type, handler, capture}); }}, console};
  vm.createContext(context);
  vm.runInContext(`let state = {clock:{paused:${paused},speed:2},victory:${JSON.stringify(victory)},wood:91,buildings:[{type:'dom'}]}; let keys={w:true}; const $=id=>document.getElementById(id); let failSave=false; function save(){if(failSave)return false; recordSave(JSON.stringify(state));return true;}`, Object.assign(context, {recordSave: value => saves.push(JSON.parse(value))}));
  // Use the actual clock mutation and display functions the module wraps.
  const atlas = fs.readFileSync('dist/atlas.js', 'utf8');
  vm.runInContext(atlas.slice(atlas.indexOf('function setGameSpeed'), atlas.indexOf('let atlasOpen')), context);
  vm.runInContext(fs.readFileSync('dist/pause-menu.js', 'utf8'), context);
  function run(code) { return vm.runInContext(code, context); }
  function key(key, options = {}) {
    const event = {key, preventDefault() {this.prevented = true;}, stopImmediatePropagation() {this.stopped = true;}, ...options};
    for (const listener of handlers.filter(h => h.type === 'keydown' && h.capture)) listener.handler(event);
    return event;
  }
  return {element, run, key, saves, document};
}
let game = setup();
assert.equal(game.element('pauseMenu').hidden, true);
game.element('pauseGame').onclick();
assert.equal(game.element('pauseMenu').hidden, false);
assert.equal(game.run('state.clock.paused'), true);
assert.equal(game.saves.at(-1).clock.paused, true);
assert.equal(game.run('Object.keys(keys).length'), 0);
assert.equal(game.element('world').inert, true);
assert.equal(game.document.activeElement.id, 'pauseContinue');
assert.equal(game.key('b').stopped, true, 'Build shortcut must never reach gameplay');
assert.equal(game.key('e').prevented, true);
game.key('Tab'); assert.equal(game.document.activeElement.id, 'pauseExit');
game.key('Tab'); assert.equal(game.document.activeElement.id, 'pauseMainMenu');
game.key('Tab', {shiftKey:true}); assert.equal(game.document.activeElement.id, 'pauseExit');
game.element('pauseAddons').onclick();assert.equal(game.element('pauseMenuTitle').textContent,'Dodatki');assert.equal(game.element('pauseAddons').hidden,true);game.element('pauseMainMenu').onclick();
assert.equal(game.element('pauseMenuTitle').textContent, 'Menu główne');
assert.equal(game.run('state.clock.paused'), true);
assert.equal(game.saves.at(-1).wood, 91);
assert.deepEqual(game.saves.at(-1).buildings, [{type:'dom'}]);
game.element('pauseExit').onclick();
assert.equal(game.element('pauseMenuTitle').textContent, 'Do zobaczenia!');
assert.equal(game.saves.at(-1).clock.paused, true);
game.key('Escape');
assert.equal(game.run('state.clock.paused'), false);
assert.equal(game.element('pauseMenu').hidden, true);
assert.equal(game.element('world').inert, false);
assert.equal(game.element('alreadyInert').inert, true);
assert.equal(game.document.activeElement.id, 'pauseGame');
assert.equal(game.saves.at(-1).clock.speed, 2);
game.element('atlasPause').onclick();
assert.equal(game.element('pauseMenuTitle').textContent, 'Pauza');
game.key(' ', {repeat:true}); assert.equal(game.run('state.clock.paused'), true);
game.key(' '); assert.equal(game.run('state.clock.paused'), false);
game.element('pauseGame').onclick(); game.run('failSave=true');
assert.equal(game.element('pauseExit').onclick(), false);
assert.equal(game.element('pauseMenuTitle').textContent, 'Pauza');
assert.match(game.element('pauseSaveStatus').textContent, /Nie udało/);
game = setup({paused:true});
assert.equal(game.element('pauseMenu').hidden, false, 'Reload of saved pause must show menu');
game.run('state.victory={won:true,dismissed:false};renderClock()');
assert.equal(game.element('pauseMenu').hidden, true, 'Victory must take precedence');
assert.equal(game.element('world').inert, false);
game.element('pauseGame').onclick(); assert.equal(game.run('state.clock.paused'), true);
game.run('state.victory.dismissed=true;renderClock()');
assert.equal(game.element('pauseMenu').hidden, false, 'Previous pause returns after victory dismissal');
game = setup({paused:true,victory:{won:true,dismissed:false}});
assert.equal(game.element('pauseMenu').hidden, true, 'Saved victory must not be covered');
assert.match(fs.readFileSync('dist/index.html','utf8'), /customization\.js"><\/script><script src="pause-menu\.js/);
console.log('PASS pause buttons, save-preserving menu/exit/resume, keyboard capture and focus, save failure, saved pause, victory precedence');
