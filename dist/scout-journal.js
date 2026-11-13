'use strict';
function scoutJournalState() {
  state.scoutJournal ??= {entries: [], contacts: {}};
  state.scoutJournal.entries = (state.scoutJournal.entries || []).slice(-30);
  state.scoutJournal.contacts ??= {};
  return state.scoutJournal;
}
const scoutJournalRelations = new Map((state.towns || []).map(town => [town.id, town.relation]));
function addScoutJournalEntry(kind, contact) {
  const journal = scoutJournalState();
  journal.entries.push({kind, townId: contact.townId, town: contact.town, x: contact.x, y: contact.y, time: state.time});
  journal.entries = journal.entries.slice(-30);
}
function scanScoutJournal() {
  const journal = scoutJournalState(), visible = new Set();
  let changed = false;
  for (const scout of state.war.raids) {
    if (!scout.scout || scout.power <= 0) continue;
    const point = routePosition(scout), x = Math.floor(point.x / T), y = Math.floor(point.y / T);
    if (!seen.has(tileKey(x, y))) continue;
    visible.add(scout.townId);
    const town = state.towns.find(town => town.id === scout.townId);
    const old = journal.contacts[scout.townId];
    const contact = {townId: scout.townId, town: town?.name || 'Nieznany obóz', x, y, reportX: old?.reportX ?? x, reportY: old?.reportY ?? y, reportedAt: old?.reportedAt ?? state.time};
    if (!old || state.time - old.reportedAt >= 10 && Math.hypot(x - old.reportX, y - old.reportY) >= 8) {
      addScoutJournalEntry('sighting', contact);
      contact.reportX = x; contact.reportY = y; contact.reportedAt = state.time;
      changed = true;
    }
    journal.contacts[scout.townId] = contact;
  }
  for (const [townId, contact] of Object.entries(journal.contacts)) {
    if (visible.has(townId)) continue;
    addScoutJournalEntry('lost', contact);
    delete journal.contacts[townId];
    changed = true;
  }
  // Discovery is a public war announcement; never record the hidden scout's position.
  for (const town of state.towns) {
    if (scoutJournalRelations.get(town.id) === 'scouting' && town.relation === 'war' && town.scoutFound && town.discovered) {
      addScoutJournalEntry('discovery', {townId: town.id, town: town.name});
      changed = true;
    }
    scoutJournalRelations.set(town.id, town.relation);
  }
  if (changed) { save(); renderScoutJournal(); }
  return changed;
}
function locateScoutJournalEntry(index) {
  const entry = scoutJournalState().entries[index];
  if (!entry || entry.kind !== 'sighting' || !Number.isFinite(entry.x) || !Number.isFinite(entry.y)) return false;
  state.clock.mapTarget = {x: entry.x, y: entry.y, label: 'Ostatnia obserwacja zwiadowcy: ' + entry.town};
  state.war.waypoint = null;
  save();
  say('Wskazano miejsce obserwacji zwiadowcy — może już tam nie być.');
  return true;
}
const scoutJournalPanel = document.createElement('aside');
scoutJournalPanel.id = 'scoutJournalPanel';
scoutJournalPanel.className = 'war-panel hidden';
scoutJournalPanel.setAttribute('aria-label', 'Dziennik zwiadowców');
scoutJournalPanel.innerHTML = '<div class="war-title"><h2>Dziennik zwiadowców</h2><button id="scoutJournalClose" aria-label="Zamknij dziennik zwiadowców">✕</button></div><p>Ostatnie 30 meldunków. Współrzędne oznaczają miejsce obserwacji, nie aktualne położenie zwiadowcy.</p><div id="scoutJournalEntries"></div>';
document.body.append(scoutJournalPanel);
const scoutJournalOpen = document.createElement('button');
scoutJournalOpen.textContent = 'Dziennik zwiadowców';
$('clockControls').append(scoutJournalOpen);
scoutJournalOpen.onclick = () => { scoutJournalPanel.classList.remove('hidden'); renderScoutJournal(); };
$('scoutJournalClose').onclick = () => { scoutJournalPanel.classList.add('hidden'); scoutJournalOpen.focus?.(); };
function renderScoutJournal() {
  const container = $('scoutJournalEntries');
  container.replaceChildren();
  const entries = scoutJournalState().entries;
  if (!entries.length) { container.textContent = 'Brak meldunków. Odkrywaj teren, aby zauważyć zwiadowców.'; return; }
  for (let index = entries.length - 1; index >= 0; index--) {
    const entry = entries[index], row = document.createElement('p');
    const minutes = Math.floor(entry.time / 60), seconds = Math.floor(entry.time % 60).toString().padStart(2, '0');
    const message = entry.kind === 'discovery' ? 'Zwiadowca odkrył Twoją wioskę. Obóz rozpoczął wojnę.' : entry.kind === 'lost' ? 'Utracono kontakt ze zwiadowcą. Ostatnia obserwacja: ' + entry.x + ', ' + entry.y + '.' : 'Zauważono zwiadowcę: ' + entry.x + ', ' + entry.y + '.';
    row.textContent = '[' + minutes + ':' + seconds + '] ' + entry.town + ' — ' + message;
    if (entry.kind === 'sighting') {
      const locate = document.createElement('button');
      locate.textContent = 'Wskaż miejsce';
      locate.onclick = () => locateScoutJournalEntry(index);
      row.append(locate);
    }
    container.append(row);
  }
}
let scoutJournalTimer = 0;
const scoutJournalStep = simulationStep;
simulationStep = function(dt) {
  scoutJournalStep(dt);
  scoutJournalTimer += dt;
  if (scoutJournalTimer >= 1) { scoutJournalTimer %= 1; scanScoutJournal(); }
};
scoutJournalState();
