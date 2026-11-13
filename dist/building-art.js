'use strict';
// Small canvas shapes keep the village crisp at every zoom, without image downloads.
function artRect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h)}
function artLine(points,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();ctx.lineWidth=1}
function artRoof(x,y,w,h,color){polygon([[x-w,y],[x,y-h],[x+w,y],[x+w-6,y+5],[x-w+3,y+5]],'#493d35');polygon([[x-w,y],[x,y-h],[x+w,y]],color);polygon([[x,y-h],[x+w,y],[x+6,y]],'#00000025');for(let i=1;i<4;i++){const t=i/4;artLine([[x-w*(1-t),y-h*t],[x+w*(1-t),y-h*t]],'#efdfb326')}artLine([[x-w,y],[x,y-h],[x+w,y]],'#f2d5a066',1.4)}
function artWindow(x,y){artRect(x-5,y-6,10,11,'#503f32');artRect(x-3,y-4,6,7,'#efc675');artLine([[x,y-4],[x,y+3]],'#80623b');artRect(x-7,y+5,14,2,'#644b32')}
function artBarrel(x,y){artRect(x-5,y-9,10,15,'#aa7b43');artRect(x-6,y-6,12,2,'#5d655b');artRect(x-6,y+2,12,2,'#5d655b');artLine([[x,y-8],[x,y+5]],'#d1a065')}
function artLogs(x,y){for(let i=0;i<3;i++){artRect(x-12,y+i*4,20,4,'#765035');ctx.fillStyle='#d3ac70';ctx.beginPath();ctx.arc(x+8,y+i*4+2,3,0,7);ctx.fill()}}
const originalBuildingArt=structure;
structure=function(b,x,y){
 const town=b.townId?state.towns.find(t=>t.id===b.townId):null;if(town?.fortBroken&&['foreign_keep','foreign_tower'].includes(b.type)){originalBuildingArt(b,x,y);return}
 const type=b.type.startsWith('foreign_')?({foreign_house:'dom',foreign_keep:'werbunek',foreign_tower:'wieza'}[b.type]||b.type):b.type;
 if(['palisada','brama','brama_swoi','wawoz','most','most_staly','sciezka','ruiny'].includes(type)||!['start','dom','drwal','lesniczowka','szpital','mlyn','sklad','handel','targ','stajnia','hodowla','gospodarstwo','pole','wieza','werbunek','port','kuznia','warsztat','kamieniolom','zelazo','zloto'].includes(type)){originalBuildingArt(b,x,y);return}
 if(type==='start'&&b.castleLevel){originalBuildingArt(b,x,y);artLine([[x-22,y+9],[x+22,y+9]],'#5c645c',3);for(let i=-22;i<24;i+=9)artRect(x+i,y-26,6,2,'#dbdbc14d');return}
 ctx.save();ctx.fillStyle='#20302445';ctx.beginPath();ctx.ellipse(x+3,y+12,25,8,0,0,7);ctx.fill();
 if(['zelazo','zloto','kamieniolom'].includes(type)){polygon([[x-24,y+10],[x-22,y-12],[x-7,y-33],[x+9,y-28],[x+24,y-8],[x+23,y+11]],'#7f8980');polygon([[x-22,y-12],[x-7,y-33],[x-3,y-10],[x-12,y+6]],'#a9afa0');polygon([[x+5,y-28],[x+24,y-8],[x+17,y+7]],'#5c6962');artRect(x-11,y-9,22,20,'#25342e');artRect(x-16,y-15,5,27,'#775639');artRect(x+11,y-15,5,27,'#775639');artRect(x-17,y-18,34,5,'#b18d5b');for(let i=0;i<4;i++)artRect(x-21+i*12,y+10-(i%2)*4,7,5,type==='zloto'?'#d8b454':type==='zelazo'?'#a9bdc0':'#b8baaa');artLine([[x-6,y+10],[x-12,y+20]],'#63523b',2);artLine([[x+6,y+10],[x+12,y+20]],'#63523b',2)}
 else if(type==='pole'){artRect(x-22,y-19,44,36,'#685039');for(let row=-15;row<=14;row+=7){artLine([[x-19,y+row],[x+19,y+row]],'#a17a46',2);for(let col=-16;col<19;col+=8){artLine([[x+col,y+row+2],[x+col,y+row-5]],'#d5bd63',1.5);artLine([[x+col-3,y+row-3],[x+col,y+row-1],[x+col+3,y+row-5]],'#9caf59')}}}
 else if(type==='wieza'){artRect(x-14,y+6,9,8,'#909384');artRect(x+7,y+6,9,8,'#909384');for(const dx of [-12,12])artLine([[x+dx,y+9],[x+dx*.7,y-43]],'#6c5034',5);artLine([[x-11,y+5],[x+9,y-32],[x-9,y-32],[x+11,y+5]],'#a2804d',3);artRect(x-20,y-47,40,18,'#947345');for(let i=-18;i<20;i+=7)artRect(x+i,y-49,3,19,'#d2ad70');artRoof(x,y-49,25,19,'#456766');artLine([[x-4,y-28],[x-4,y+10]],'#b8a274',2);for(let i=0;i<6;i++)artLine([[x-4,y-26+i*6],[x+4,y-26+i*6]],'#b8a274',2)}
 else if(type==='targ'){for(const dx of [-20,20])artRect(x+dx,y-31,3,44,'#745536');polygon([[x-25,y-21],[x-18,y-37],[x+18,y-37],[x+25,y-21]],'#d4b879');for(let i=-20;i<22;i+=10)artRect(x+i,y-21,7,7,'#a34e3f');artRect(x-23,y-3,46,16,'#9d7646');for(let i=0;i<4;i++)artRect(x-18+i*10,y-10,7,7,['#bd754a','#d4b855','#71915c','#d5cc98'][i]);artBarrel(x+22,y+6)}
 else{
 const wood=['drwal','lesniczowka','stajnia','hodowla','sklad','port','warsztat'].includes(type),wide=['stajnia','hodowla','sklad','warsztat'].includes(type),w=wide?23:18;
 const palette={dom:['#a55e45','#866048','#687b66'],start:['#a05d43'],szpital:['#647f77'],lesniczowka:['#4c7154'],drwal:['#536d52'],mlyn:['#785346'],werbunek:['#576d7a'],kuznia:['#555963'],port:['#567f80'],gospodarstwo:['#b69a55'],sklad:['#81754e'],handel:['#986848']};
 const roof=town?.color||(palette[type]||['#816247'])[Math.floor(hash(b.x,b.y)*(palette[type]?.length||1))];
 artRect(x-w-2,y+7,w*2+4,7,'#8d9485');for(let i=-w;i<w;i+=8)artRect(x+i,y+8,6,3,'#b5b6a0');artRect(x-w,y-23,w*2,30,wood?'#a98151':'#d0bc8a');artRect(x+w-8,y-23,8,30,wood?'#775a3a':'#ac986c');
 if(wood)for(let i=-20;i<7;i+=6)artLine([[x-w,y+i],[x+w,y+i]],'#634b3255');else{for(const dx of [-w+2,w-10])artRect(x+dx,y-23,3,30,'#6c5239');artRect(x-w,y-9,w*2-8,3,'#826140');artLine([[x-w+3,y-22],[x+w-9,y-10]],'#80603d',2)}
 if(['dom','start','szpital','kuznia'].includes(type)){artRect(x+8,y-46,7,23,'#797d70');artRect(x+7,y-47,9,4,'#afb09a')}
 artRoof(x,y-24,w+6,22,roof);artRect(x-4,y-8,9,20,'#493c30');artLine([[x-2,y-6],[x-2,y+10]],'#99764d');artRect(x+2,y+2,2,2,'#dbc08a');artWindow(x-w+8,y-14);
 if(type==='dom'||type==='start'){artRect(x-w+1,y+2,10,4,'#70533b');artRect(x-w+2,y-1,2,4,'#6f965d');artRect(x-w+7,y-2,2,4,'#d2a16c')}
 if(['drwal','lesniczowka','sklad'].includes(type))artLogs(x-18,y+9);
 if(['handel','sklad','port'].includes(type)){artBarrel(x+18,y+7);artRect(x-21,y+2,11,10,'#ba9256');artLine([[x-21,y+2],[x-10,y+12],[x-10,y+2],[x-21,y+12]],'#785632')}
 if(type==='szpital'){artRect(x+8,y-21,10,13,'#eee4c7');artRect(x+12,y-19,3,9,'#b64e40');artRect(x+9,y-16,9,3,'#b64e40')}
 if(type==='lesniczowka'){polygon([[x+12,y-21],[x+5,y-8],[x+19,y-8]],'#386447');artRect(x+11,y-8,3,7,'#634e34')}
 if(['stajnia','hodowla'].includes(type)){artRect(x+3,y-13,14,23,'#3c3a2c');artLine([[x+7,y+6],[x+9,y-8],[x+16,y-11],[x+19,y-6]],type==='stajnia'?'#b38a59':'#d9d3b5',5);for(let i=0;i<4;i++)artRect(x-23+i*14,y+5,2,12,'#a58b5a');artRect(x-23,y+10,44,2,'#c5ac76')}
 if(type==='mlyn'){const a=state.time*.8;ctx.save();ctx.translate(x+3,y-26);ctx.rotate(a);for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);artRect(0,-2,29,3,'#725639');artRect(9,-7,20,7,'#e5d7aa');for(let j=12;j<30;j+=5)artRect(j,-7,1,7,'#ac9868')}ctx.restore();ctx.fillStyle='#8b6e43';ctx.beginPath();ctx.arc(x+3,y-26,4,0,7);ctx.fill()}
 if(type==='kuznia'){artRect(x+6,y-8,12,17,'#3e3d35');polygon([[x+8,y+7],[x+9,y-2],[x+12,y+2],[x+15,y-5],[x+17,y+7]],'#ec9f52');artRect(x-23,y+7,14,4,'#77817b');artRect(x-19,y+11,7,4,'#545e58')}
 if(['werbunek','port','gospodarstwo','warsztat','handel'].includes(type)){const icon={werbunek:'⚔',port:'⚓',gospodarstwo:'🌾',warsztat:'⚙',handel:'⚖'}[type];artRect(x+8,y-22,12,15,'#d9c28a');ctx.fillStyle='#4e5847';ctx.font='12px serif';ctx.fillText(icon,x+8,y-10)}
 }
 if((b.level||1)>1){artRect(x-10,y-58,22,12,'#233c32');ctx.fillStyle='#ebcb79';ctx.font='10px system-ui';ctx.fillText('★'+b.level,x-8,y-49)}
 ctx.restore();
};
