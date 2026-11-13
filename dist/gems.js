"use strict";
function gemWallet(){state.gems=Math.max(0,Math.floor(Number(state.gems)||0));state.gemRewards??={};return state.gems}
function grantCampGems(id){gemWallet();const key=(state.campaign?.stage==='desert'?'desert:':'valley:')+id;if(state.gemRewards[key])return false;state.gemRewards[key]=true;state.gems+=10;return true}
function collectPastCampGems(){gemWallet();let changed=false;for(const t of state.towns||[])if(t.relation==='conquered')changed=grantCampGems('town:'+t.id)||changed;for(const f of state.islandLife?.forts||[])if(['cleared','owned'].includes(f.phase))changed=grantCampGems('fort:'+f.id)||changed;for(const p of state.adventure?.places||[])if(p.type==='camp'&&p.cleared&&(p.defeated||p.id!=='captain'||state.adventure.verdict!=='peace'))changed=grantCampGems('camp:'+p.id)||changed;if(changed)save()}
collectPastCampGems();
