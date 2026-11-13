'use strict';
// A paused world remains saved; menu and exit are reversible screens of that world.
const pauseMenu = document.createElement('section');
pauseMenu.id = 'pauseMenu';
pauseMenu.hidden = true;
pauseMenu.setAttribute('role', 'dialog');
pauseMenu.setAttribute('aria-modal', 'true');
pauseMenu.setAttribute('aria-labelledby', 'pauseMenuTitle');
pauseMenu.setAttribute('aria-describedby', 'pauseMenuDescription');
pauseMenu.innerHTML = '<article><small>ZIELONA DOLINA</small><h1 id="pauseMenuTitle">Pauza</h1><p id="pauseMenuDescription">Świat czeka na Twój powrót.</p><p id="pauseGems" class="gem-wallet"></p><div id="starterShop" hidden></div><div class="pause-menu-actions"><button id="pauseMainMenu">Menu główne</button><button id="pauseNewGame" hidden>Nowa gra</button><button id="pauseAddons">Dodatki</button><button id="pauseContinue">Kontynuuj</button><button id="pauseExit">Wyjdź z gry</button></div><p id="pauseSaveStatus" role="status"></p><small>Spacja / Esc — kontynuuj</small></article>';
document.body.append(pauseMenu);
let pauseMenuFocus = null;
const pauseMenuInert = new Map();
function pauseVictoryVisible() {
  return !!(state.victory?.won && !state.victory.dismissed);
}
function hidePauseMenu() {
  if (pauseMenu.hidden) return;
  pauseMenu.hidden = true;
  for (const [element, inert] of pauseMenuInert) element.inert = inert;
  pauseMenuInert.clear();
  if (!pauseVictoryVisible()) pauseMenuFocus?.focus?.();
  pauseMenuFocus = null;
}
function renderPauseMenu() {
  $('pauseGems').textContent = '💎 Klejnoty: '+(state.gems||0);
  if (!state.clock.paused || pauseVictoryVisible()) { hidePauseMenu(); return; }
  if (!pauseMenu.hidden) return;
  pauseMenuFocus = document.activeElement;
  keys = {};
  if (typeof cancelSelectionDrag === 'function') cancelSelectionDrag();
  for (const element of document.body.children) {
    if (element === pauseMenu || element.tagName === 'SCRIPT') continue;
    pauseMenuInert.set(element, element.inert);
    element.inert = true;
  }
  pauseMenu.hidden = false;
  $('pauseContinue').focus();
}
function setPauseMenuScreen(screen) {
  $('pauseMenuTitle').textContent = screen === 'addons' ? 'Dodatki' : screen === 'main' ? 'Menu główne' : screen === 'exit' ? 'Do zobaczenia!' : 'Pauza';
  $('pauseMenuDescription').textContent = screen === 'addons' ? 'Za pierwsze zdobycie obozu wroga dostajesz 10 klejnotów. Wybierz pakiet startowy.' : screen === 'main' ? 'Twoja osada jest zapisana. Kontynuuj, aby wrócić do gry.' : screen === 'exit' ? 'Gra została zapisana i zatrzymana. Możesz zamknąć kartę lub kontynuować.' : 'Świat czeka na Twój powrót.';
  $('pauseMainMenu').hidden = screen === 'main';
  $('pauseNewGame').hidden = screen !== 'main';
  $('starterShop').hidden = screen !== 'addons';
  if(screen === 'addons' && typeof renderStarterShop === 'function')renderStarterShop();
  $('pauseAddons').hidden = screen === 'addons' || screen === 'exit';
  $('pauseGems').textContent = '💎 Klejnoty: '+(state.gems||0);
  $('pauseExit').hidden = screen === 'exit';
  $('pauseSaveStatus').textContent = '';
  if (!pauseMenu.hidden) $('pauseContinue').focus();
}
function saveAndShowPauseScreen(screen) {
  if (save() === false) {
    $('pauseSaveStatus').textContent = 'Nie udało się zapisać gry. Zwolnij miejsce w przeglądarce i spróbuj ponownie.';
    return false;
  }
  setPauseMenuScreen(screen);
  return true;
}
const pauseMenuRenderClock = renderClock;
renderClock = function () { pauseMenuRenderClock(); renderPauseMenu(); };
const pauseMenuTogglePause = togglePause;
togglePause = function () {
  if (pauseVictoryVisible()) return state.clock.paused;
  if (!state.clock.paused) setPauseMenuScreen('pause');
  return pauseMenuTogglePause();
};
$('pauseGame').onclick = togglePause;
$('atlasPause').onclick = togglePause;
$('pauseContinue').onclick = () => { if (state.clock.paused) togglePause(); };
$('pauseMainMenu').onclick = () => saveAndShowPauseScreen('main');
$('pauseAddons').onclick = () => setPauseMenuScreen('addons');
$('pauseNewGame').onclick = () => $('reset').onclick();
$('pauseExit').onclick = () => saveAndShowPauseScreen('exit');
// Capture precedes every gameplay shortcut, including handlers registered earlier.
window.addEventListener('keydown', event => {
  if (pauseMenu.hidden) return;
  event.stopImmediatePropagation();
  if (['INPUT','SELECT','TEXTAREA'].includes(event.target?.tagName) && event.key !== 'Escape' && event.key !== 'Tab') return;
  if (event.key === 'Escape' || event.key === ' ') {
    event.preventDefault();
    if (!event.repeat) $('pauseContinue').onclick();
  } else if (event.key === 'Tab') {
    event.preventDefault();
    const buttons = [...document.getElementById('pauseMenu').querySelectorAll('button:not([disabled]),input,select')].filter(button => !button.hidden && !button.closest('[hidden]'));
    const current = buttons.indexOf(document.activeElement);
    buttons[current < 0 ? (event.shiftKey ? buttons.length-1 : 0) : (current + (event.shiftKey ? buttons.length - 1 : 1)) % buttons.length].focus();
  } else if (event.key !== 'Enter') event.preventDefault();
}, true);
window.addEventListener('keyup', event => {
  if (!pauseMenu.hidden) { event.stopImmediatePropagation(); keys = {}; }
}, true);
renderPauseMenu();
