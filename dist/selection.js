'use strict';
const MAX_SELECTED_UNITS=10;
function toggleUnitSelection(u,additive=false){
 selectedUnits=new Set(selectedActors().map(a=>a.uid));
 if(!additive)selectedUnits.clear();
 if(additive&&selectedUnits.has(u.uid))selectedUnits.delete(u.uid);
 else if(selectedUnits.size<MAX_SELECTED_UNITS)selectedUnits.add(u.uid);
 else say('Możesz zaznaczyć maksymalnie 10 jednostek. Shift + klik usuwa jednostkę z grupy.');
 showCommandBar();renderStrategyPanel();
}
function selectSoldierBox(a,b,additive=false){
 syncGarrisonActors();ensureUnitIds();
 selectedUnits=new Set(additive?selectedActors().map(u=>u.uid):[]);
 const left=Math.min(a.x,b.x),right=Math.max(a.x,b.x),top=Math.min(a.y,b.y),bottom=Math.max(a.y,b.y);
 const inside=selectableUnits().filter(u=>!['ram','catapult'].includes(u.kind)).filter(u=>{const y=(typeof unitDisplayY==='function'?unitDisplayY(u):u.y)-14;return u.x>=left&&u.x<=right&&y>=top&&y<=bottom&&seen.has(tileKey(Math.floor(u.x/T),Math.floor(u.y/T)))});
 for(const u of inside){if(selectedUnits.size>=MAX_SELECTED_UNITS)break;selectedUnits.add(u.uid)}
 showCommandBar();renderStrategyPanel();
 if(inside.length>MAX_SELECTED_UNITS)say('Zaznaczono 10 żołnierzy — to maksymalna wielkość grupy.');
 return selectedActors().length;
}
let selectionDrag=null;
const clickBeforeSelection=c.onpointerdown,moveBeforeSelection=c.onpointermove;
function cancelSelectionDrag(){selectionDrag=null;$('selectionBox').style.display='none'}
c.onpointerdown=e=>{
 if(mode||commandDraft||patrolDraft||(typeof navalDraft!=='undefined'&&navalDraft)||e.button&&e.button!==0){clickBeforeSelection(e);return}
 target=null;selectionDrag={start:worldPoint(e),screen:{x:e.clientX,y:e.clientY},original:e,additive:!!e.shiftKey,dragged:false};
 c.setPointerCapture?.(e.pointerId);
};
c.onpointermove=e=>{moveBeforeSelection?.(e);if(!selectionDrag)return;const d=selectionDrag;if(Math.hypot(e.clientX-d.screen.x,e.clientY-d.screen.y)<6&&!d.dragged)return;d.dragged=true;const box=$('selectionBox');Object.assign(box.style,{display:'block',left:Math.min(d.screen.x,e.clientX)+'px',top:Math.min(d.screen.y,e.clientY)+'px',width:Math.abs(e.clientX-d.screen.x)+'px',height:Math.abs(e.clientY-d.screen.y)+'px'})};
c.onpointerup=e=>{if(!selectionDrag)return;const d=selectionDrag;cancelSelectionDrag();if(c.hasPointerCapture?.(e.pointerId))c.releasePointerCapture(e.pointerId);if(d.dragged)selectSoldierBox(d.start,worldPoint(e),d.additive);else clickBeforeSelection(d.original)};
c.onpointercancel=cancelSelectionDrag;
window.addEventListener('keydown',e=>{if(e.key==='Escape')cancelSelectionDrag()});
