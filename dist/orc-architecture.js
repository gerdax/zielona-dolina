'use strict';
// Foreign architecture is derived from saved town coordinates; no village/save migration.
const orcCampGround = new Set();
let orcArchitectureTowns = new Map();
const orcOriginalRebuild = rebuildForeignIndex;
rebuildForeignIndex = function() {
  orcCampGround.clear();
  orcArchitectureTowns = new Map(state.towns.map(town => [town.id, town]));
  if (!isDesertCampaign()) return orcOriginalRebuild();
  foreignIndex.clear();
  const claimed = new Set();
  for (const town of state.towns) {
    const available = (x,y) => x >= 0 && y >= 0 && x < N && y < N && ['grass','sand'].includes(terrain(x,y)) && !building(x,y) && !claimed.has(tileKey(x,y));
    const put = (dx,dy,type,extra={}) => {
      const x=town.x+dx,y=town.y+dy,key=tileKey(x,y);
      if (!available(x,y) || foreignIndex.has(key)) return;
      foreignIndex.set(key,{x,y,type,townId:town.id,...extra});
    };
    // A two-tile lane leads from the open southern gate to the central courtyard.
    for (let offset=-5;offset<=5;offset++) {
      put(offset,-5,'foreign_orc_wall');
      put(offset,5,offset===0||offset===1?'foreign_orc_gate':'foreign_orc_wall',{gateSide:offset===0?'left':'right'});
      if (offset>-5 && offset<5) { put(-5,offset,'foreign_orc_wall'); put(5,offset,'foreign_orc_wall'); }
    }
    for (const [dx,dy,type] of [
      [0,-2,'foreign_keep'],[-4,4,'foreign_tower'],[4,4,'foreign_tower'],
      [-3,-2,'foreign_house'],[3,-2,'foreign_house'],[-3,1,'foreign_house'],
      [3,1,'foreign_orc_field'],[3,3,'foreign_orc_field'],[-3,3,'foreign_orc_lumber'],
      [-2,-4,'foreign_orc_quarry'],[3,-4,'foreign_orc_storage'],[1,-4,'foreign_orc_farm']
    ]) put(dx,dy,type);
    // Keep the southern approach free of trees as well as the inner courtyard.
    for(const dx of [0,1])for(const dy of [6,7]) {
      const x=town.x+dx,y=town.y+dy,key=tileKey(x,y);
      if(available(x,y))orcCampGround.add(key);
      claimed.add(key);
    }
    for(let dy=-5;dy<=5;dy++)for(let dx=-5;dx<=5;dx++) {
      const x=town.x+dx,y=town.y+dy,key=tileKey(x,y);
      if(available(x,y)) orcCampGround.add(key);
      // Reserve the whole footprint so overlapping legacy towns cannot overwrite it.
      claimed.add(key);
    }
  }
};
function orcWallBlocked(x,y) {
  if (!isDesertCampaign()) return false;
  const wall=foreignIndex.get(tileKey(x,y));
  return (wall?.type==='foreign_orc_wall'||wall?.type==='foreign_orc_gate'&&typeof orcGateClosed==='function'&&orcGateClosed(orcArchitectureTowns.get(wall.townId))) && !orcArchitectureTowns.get(wall.townId)?.fortBroken;
}
const orcOriginalNatural = natural;
natural = function(x,y) {
  if (isDesertCampaign() && orcCampGround.has(tileKey(x,y))) return null;
  return orcOriginalNatural(x,y);
};
function orcSkull(x,y) {
  artRect(x-4,y-5,8,7,'#e2d5b3'); artRect(x-3,y+2,6,3,'#e2d5b3');
  artRect(x-3,y-3,2,2,'#342e26'); artRect(x+1,y-3,2,2,'#342e26');
}
function orcHideRoof(x,y,width,color) {
  polygon([[x-width,y],[x,y-27],[x+width,y]],color);
  artLine([[x-width,y],[x,y-27],[x+width,y]],'#c0a574',2);
  for(const dx of [-width+3,width-3])polygon([[x+dx-3,y],[x+dx,y-12],[x+dx+3,y]],'#ddd0ad');
}
const orcOriginalStructure = structure;
structure = function(b,x,y) {
  if (!isDesertCampaign() || !['foreign_keep','foreign_house','foreign_tower'].includes(b.type) && !b.type.startsWith('foreign_orc_')) return orcOriginalStructure(b,x,y);
  const town=orcArchitectureTowns.get(b.townId),owned=town?.relation==='conquered';
  if(town?.fortBroken && ['foreign_orc_wall','foreign_keep','foreign_tower'].includes(b.type)) {
    for(const dx of [-15,-3,10])artLine([[x+dx,y+10],[x+dx+10,y+2]],'#59442f',5);
    return;
  }
  const hide=owned?'#888349':'#88533b';
  if(b.type==='foreign_orc_wall') {
    if(town && Math.abs(b.x-town.x)===5){
      artRect(x-6,y-24,12,48,'#513b2b');
      for(let dy=-24;dy<=24;dy+=12){artRect(x-8,y+dy-5,16,14,'#513b2b');polygon([[x-8,y+dy-5],[x,y+dy-15],[x+8,y+dy-5]],'#d4c5a1');}
      artRect(x-8,y-24,3,48,'#8d6745');artRect(x+5,y-24,3,48,'#8d6745');
      if(Math.abs(b.y-town.y)===5){artRect(x-24,y-9,48,4,'#8d6745');artRect(x-24,y+5,48,4,'#8d6745');}
      return;
    }
    for(let dx=-22;dx<=22;dx+=9){artRect(x+dx-3,y-20,7,34,'#513b2b');polygon([[x+dx-3,y-20],[x+dx,y-31],[x+dx+4,y-20]],'#d4c5a1');}
    artRect(x-24,y-9,48,4,'#8d6745');artRect(x-24,y+5,48,4,'#8d6745');return;
  }
  if(b.type==='foreign_orc_gate') {
    if(typeof orcGateClosed==='function'&&orcGateClosed(town)){artRect(x-24,y-35,48,49,'#513b2b');for(let dx=-20;dx<24;dx+=9)artRect(x+dx,y-34,3,48,'#a38453');artLine([[x-22,y-30],[x+22,y+10]],'#bfaa78',4);}
    const post=x+(b.gateSide==='left'?-20:20);
    artRect(post-4,y-45,8,59,'#4a3527');polygon([[post-5,y-45],[post,y-60],[post+5,y-45]],'#ddceaa');
    artRect(x-24,y-44,48,6,'#795438');orcSkull(post,y-32);return;
  }
  if(b.type==='foreign_orc_field') {
    polygon([[x-22,y-17],[x+22,y-17],[x+22,y+17],[x-22,y+17]],'#705439');
    for(let row=-12;row<=12;row+=8)for(let col=-16;col<=16;col+=8){artLine([[x+col,y+row+4],[x+col,y+row-4]],'#89934d',2);artLine([[x+col-3,y+row-2],[x+col,y+row],[x+col+3,y+row-3]],'#c3ae64',2);}return;
  }
  if(b.type==='foreign_tower') {
    artRect(x-17,y-42,6,56,'#493729');artRect(x+11,y-42,6,56,'#493729');
    artLine([[x-14,y+10],[x+14,y-29],[x-14,y-29],[x+14,y+10]],'#99754d',3);
    artRect(x-23,y-45,46,13,'#6f4e34');orcHideRoof(x,y-48,28,hide);orcSkull(x,y-37);return;
  }
  if(b.type==='foreign_orc_quarry') {
    for(const [dx,dy] of [[-12,8],[4,9],[0,-4]])polygon([[x+dx-10,y+dy+4],[x+dx-8,y+dy-9],[x+dx+3,y+dy-15],[x+dx+13,y+dy],[x+dx+8,y+dy+7]],'#9c9986');
    artLine([[x-15,y-17],[x+13,y+4]],'#674830',4);artLine([[x-19,y-12],[x-10,y-23]],'#c2c2ae',4);return;
  }
  const keep=b.type==='foreign_keep';
  artRect(x-19,y-20,38,33,'#5e432e');artRect(x+11,y-20,8,33,'#403325');
  artRect(x-5,y-6,10,19,'#282923');orcHideRoof(x,y-20,keep?29:25,hide);
  if(keep){artRect(x-1,y-77,3,32,'#503929');polygon([[x+2,y-77],[x+26,y-70],[x+2,y-57]],owned?'#c6b362':'#773d33');orcSkull(x+10,y-68);orcSkull(x,y-26);}
  if(b.type==='foreign_orc_lumber')for(let dy=0;dy<=10;dy+=5){artLine([[x-22,y+dy],[x-8,y+dy]],'#ad8553',4);artLine([[x+11,y-9],[x+23,y-23]],'#bcb8a3',4);}
  if(b.type==='foreign_orc_storage'){for(const dx of [-21,11]){artRect(x+dx,y,12,14,'#a17e4a');artLine([[x+dx,y],[x+dx+12,y+14]],'#58412c',2);}artRect(x-16,y-18,32,3,'#c3aa76');}
  if(b.type==='foreign_orc_farm'){for(const dx of [-17,17]){artRect(x+dx-3,y+2,6,13,'#c3a463');artLine([[x+dx,y+4],[x+dx-6,y-3],[x+dx+5,y-2]],'#d9c277',2);}}
};
rebuildForeignIndex();
// Old saves may place the player on a newly introduced wall.
if (state.p && typeof rescuePlayer==='function' && orcWallBlocked(Math.floor(state.p.x/T),Math.floor(state.p.y/T))) rescuePlayer();
