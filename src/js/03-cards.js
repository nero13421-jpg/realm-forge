/* ---------- cards ---------- */
function mk(key,at){
  var c={id:S.nid++,key:key,at:at===undefined?null:at,eq:null};
  if(AMMO_WT[key])c.n=20;
  if(TIMB[key])c.n=TIMB_N;
  if(key==='human'){S.hn++;c.num=S.hn;c.name='';c.skill={knife:10,club:10,axe:10,battle_axe:10,spear:10,shortbow:10,longbow:10}}
  S.cards.push(c);return c;
}
function byId(id){for(var i=0;i<S.cards.length;i++)if(S.cards[i].id===id)return S.cards[i];return null}
function kindOf(c){return CD[c.key].k}
var SVGNS='http://www.w3.org/2000/svg',GOB_SP=11.7;
function humans(){return S.cards.filter(function(c){return c.key==='human'})}
function gearOf(h){return S.cards.filter(function(x){return x.eq===h.id})}
function hname(c){return c.name||('Unnamed '+(c.sex==='f'?'woman':'man')+' #'+c.num)}
var FEMALE_P=.05;
var GUARD_DEF=3,GUARD_SH=5,HELM=3,ALTAR_COST=500,SAC_COST=10;
var TATTOO={tat_spiral:{n:'Spiral',t:'every endurance +10%',p:{mEnd:.1,mdEnd:.1,spEnd:.1,cEnd:.1}},tat_antler:{n:'Antler',t:'strength +10%',p:{str:.1}},tat_serpent:{n:'Serpent',t:'defense speed +5 points',a:{dodge:.05}},tat_eye:{n:'Eye',t:'sight range +25%, draw range +10%',p:{sight:.25,range:.1}},tat_hand:{n:'Hand',t:'strike speed +10%',p:{strike:.1}}};
/* a tattoo's bonus is worked out from his stats the moment it goes on, then fixed: later changes to him or to the tattoo never move it */
function tatHas(c,k){return !!(c&&c.tat&&c.tat.some(function(t){return t.k===k}))}
function tatFreeze(c,k){var T=TATTOO[k],X=stats(c),v={};Object.keys(T.p||{}).forEach(function(s){v[s]=Math.round(X[s]*T.p[s]*10000)/10000});Object.keys(T.a||{}).forEach(function(s){v[s]=T.a[s]});return {k:k,v:v,at:new Date().toISOString().slice(0,10)}}
function tatDelta(k,v){if(k==='mEnd'||k==='mdEnd')return '+'+infoDur(v);if(k==='spEnd'||k==='cEnd')return '+'+Math.round(v)+' s';if(k==='dodge')return '+'+Math.round(v*1000)/10+'%';if(k==='sight')return '+'+Math.round(v)+' yd';return '+'+(Math.round(v*1000)/1000)+'×'}
var TATLAB={mEnd:'marching endurance',mdEnd:'middle-distance endurance',spEnd:'sprint endurance',cEnd:'combat endurance',str:'strength',dodge:'defense speed',sight:'sight',range:'draw range',strike:'strike speed'};
function tatText(t){return TATTOO[t.k].n+': '+Object.keys(t.v).map(function(s){return TATLAB[s]+' '+tatDelta(s,t.v[s])}).join(', ')+' (fixed '+t.at+')'}
var STATS=[
 ['mEnd','Endurance','Marching endurance',28800,'s','How long he can walk before he has to rest','stag'],
 ['mdEnd','Endurance','Middle-distance endurance',3600,'s','How long he can jog: patrol jogs, closing distance in a fight','stag'],
 ['spEnd','Endurance','Sprint endurance',90,'s','Full-speed running: charges, flanking runs, falling back','rabbit'],
 ['cEnd','Endurance','Combat endurance',180,'s','Seconds of close fighting before strike speed drops to ×0.7 and defense speed halves',''],
 ['rec','Endurance','Recovery',1,'×','How fast combat endurance comes back out of contact, how much a short rest restores (half × recovery) and how much a long rest restores (full × recovery)',''],
 ['walk','Movement','Walk speed',PACE.walk,'yd/s','Road march',''],
 ['jog','Movement','Jog speed',PACE.jog,'yd/s','Middle distance',''],
 ['sprint','Movement','Sprint speed',PACE.sprint,'yd/s','Charges and escapes','rabbit'],
 ['creep','Movement','Creep speed',PACE.creep,'yd/s','Moving with no endurance left',''],
 ['carry','Movement','Carry capacity',25,'lb','Above this he slows in proportion',''],
 ['jd','Movement','Jump distance',4,'yd','At a sprint he leaps a stream no wider than this instead of wading it. Streams on the battlefield are about 4 yd across',''],
 ['jh','Movement','Jump height',0.5,'yd','At a sprint he hops brush at least this tall without slowing (brush needs 0.5 yd)',''],
 ['strike','Offense','Strike speed',1,'×','Multiplies every weapon\'s attacks per minute',''],
 ['str','Offense','Strength',1,'×','Multiplies melee and bow damage','wolf'],
 ['skill','Offense','Weapon skill',10,'per weapon','Hit chance in %, grows with use',''],
 ['range','Offense','Draw range',1,'×','Multiplies bow range',''],
 ['hp','Defense','Durability',100,'HP','Total health','boar'],
 ['def','Defense','Overall defense',0,'','Flat cut to every hit: 10 defense turns a 20 hit into 10. Armor +5, helmet +'+HELM+', shield +10',''],
 ['dodge','Defense','Defense speed',10,'%','Chance to dodge or parry a hit outright. A shield adds 5%',''],
 ['grit','Defense','Grit',25,'HP','Below this he moves and fights at ×0.8',''],
 ['heal','Defense','Healing',10,'HP/h','Wounds carry from fight to fight during a match and heal at this rate',''],
 ['sight','Senses','Sight range',400,'yd','Spotting range on patrol (a tile is '+HEX_YD+' yd). In a fight, archers only shoot what they can see: woods cut sight to a quarter, brush to 60%','hawk'],
 ['react','Senses','Reaction time',1,'s','Delay before he acts on a new order, or on first contact',''],
 ['press','Senses','Accuracy under pressure',0,'%','Bow hit-chance penalty with an enemy within 5 yd. Groundwork for discipline',''],
 ['mana','Magic','Mana',1,'','Casting pool',''],
 ['gnosis','Magic','Gnosis',0,'','Spent to learn spells',''],
 ['manaRec','Magic','Mana recovery','full','','Refills to full at the start of every fight',''],
 ['cast','Magic','Casting speed',1,'×','Multiplies spell recharge times','']
];
function statBase(k){for(var i=0;i<STATS.length;i++)if(STATS[i][0]===k)return STATS[i][3];return 0}
function stats(c,wt,eq){
  eq=eq||gearOf(c);if(wt==null){wt=0;eq.forEach(function(x){wt+=wtOf(x.key)})}
  var b=function(k){return 1+bo(c,k)},has=function(k){return eq.some(function(x){return x.key===k})},X={},rg=function(k){return has(k)?1+RING_B:1};
  X.mEnd=statBase('mEnd')*b('stag');X.mdEnd=statBase('mdEnd')*b('stag')*rg('ring_endur');X.spEnd=statBase('spEnd')*b('rabbit')*rg('ring_swift');X.cEnd=statBase('cEnd');X.rec=statBase('rec');
  X.walk=PACE.walk;X.jog=PACE.jog;X.sprint=PACE.sprint*b('rabbit')*rg('ring_swift');X.creep=PACE.creep;X.carry=statBase('carry')*rg('ring_str');X.jd=statBase('jd');X.jh=statBase('jh');
  X.strike=statBase('strike');X.str=statBase('str')*b('wolf')*rg('ring_str');X.range=statBase('range');X.hp=Math.round(statBase('hp')*b('boar'));
  var ad=0,ag=0;eq.forEach(function(x){var A=ARM[x.key];if(A){ad+=A.def;ag+=A.dodge}});X.def=statBase('def')+ad;X.dodge=(statBase('dodge')+ag)/100;
  X.grit=statBase('grit');X.heal=statBase('heal');X.sight=statBase('sight')*b('hawk');X.react=statBase('react');X.press=statBase('press')/100;
  X.mana=c.mana||1;X.gnosis=c.gnosis||0;X.cast=statBase('cast');X.keen=b('hawk');
  (c.tat||[]).forEach(function(t){if(t&&t.v)Object.keys(t.v).forEach(function(s){X[s]+=t.v[s]})});
  X.stealth=0;/* standard for now: sacrifices, tattoos and the like will raise it later */
  X.wf=wt>X.carry?X.carry/wt:1;
  X.sp={walk:X.walk,jog:X.jog,sprint:X.sprint,creep:X.creep};X.dr={walk:100/X.mEnd,jog:100/X.mdEnd,sprint:100/X.spEnd,creep:DRAIN.creep};
  return X;
}
function statVal(c,k,X){
  var f=function(v,d){return (Math.round(v*Math.pow(10,d||0))/Math.pow(10,d||0))+''};
  switch(k){
    case 'mEnd':return infoDur(X.mEnd);case 'mdEnd':return infoDur(X.mdEnd);case 'spEnd':return f(X.spEnd)+' s';case 'cEnd':return f(X.cEnd)+' s';case 'rec':return '×'+X.rec;
    case 'walk':case 'jog':case 'sprint':case 'creep':return f(X[k]*X.wf,2)+' yd/s'+(X.wf<1?' (load)':'');case 'carry':return X.carry+' lb';case 'jd':case 'jh':return X[k]+' yd';
    case 'strike':case 'range':case 'cast':return '×'+f(X[k],2);case 'str':return '×'+f(X.str,3);case 'skill':return 'see Skill';
    case 'hp':return X.hp+' HP'+(c.dmg>0?' ('+Math.round(X.hp-c.dmg)+' now)':'');case 'def':return X.def+'';case 'dodge':return f(X.dodge*100,1)+'%';case 'grit':return X.grit+' HP';case 'heal':return X.heal+' HP/h';
    case 'sight':return f(X.sight)+' yd';case 'react':return X.react+' s';case 'press':return '−'+f(X.press*100)+'%';
    case 'mana':return X.mana+'';case 'gnosis':return X.gnosis+'';case 'manaRec':return 'full each fight';
  }
  return '';
}
var SAC_GOODS={rabbit:[{lumber:2},{gravel:3},{knife:1}],stag:[{lumber:4},{spear:2},{hide_armor:1}],boar:[{gravel:5},{club:2},{hide_shield:1}],wolf:[{spear:2},{knife:2},{hide_helmet:1}],hawk:[{short_arrows:2},{shortbow:1},{lumber:3}]};
/* what the altar asks with each animal is drawn once and kept until it is paid */
function sacDem(s,k){s.altar.dem=s.altar.dem||{};if(!s.altar.dem[k]){var L=SAC_GOODS[k];s.altar.dem[k]=JSON.parse(JSON.stringify(S.tut?L[0]:pick(L)))}return s.altar.dem[k]}
function killHuman(h){removeFromUnit(h.id);S.cards.forEach(function(c){if(c.eq===h.id)c.eq=null});S.setl.forEach(function(x){if(x.altar&&x.altar.pr===h.id)x.altar.pr=null});S.cards.splice(S.cards.indexOf(h),1);cleanUnits()}
/* the animal shown at the altar: the one you picked, else the kind this man already carries, else the first you hold */
function sacPick(T,cnt){if(UI.sacA&&cnt[UI.sacA])return UI.sacA;if(T&&T.boon&&cnt[T.boon.k])return T.boon.k;return Object.keys(cnt)[0]||null}
var BOON={rabbit:{n:'Rabbit',a:'Swiftness',lo:3,hi:6,t:'sprint speed and sprint endurance: charges, flanking runs and falling back. Not road marching.'},stag:{n:'Stag',a:'Stamina',lo:3,hi:6,t:'marching and middle-distance endurance'},boar:{n:'Boar',a:'Hardiness',lo:3,hi:6,t:'durability, more health'},wolf:{n:'Wolf',a:'Ferocity',lo:3,hi:6,t:'strength, more melee and bow damage'},hawk:{n:'Hawk',a:'Keen eye',lo:3,hi:6,t:'bow hit chance and sight range'}};
function bo(c,k){return c&&c.boon&&c.boon.k===k?c.boon.p/100:0}
function boonText(c){return c.boon?BOON[c.boon.k].a+' +'+c.boon.p+'% ('+c.boon.n+' '+BOON[c.boon.k].n.toLowerCase()+(c.boon.n>1?'s':'')+')':'none'}
function cardName(c){return c.key==='human'?hname(c):CD[c.key].n}
var PACKS={starter:{n:'Chalcolithic Starter Pack',t:'The kit you begin with: 3 settlement cards, 38 terrain cards, 5 elevation cards (slopes and mounds), 2 forest, 1 small open water, 3 orchards, 8 men, 1 woman to serve at a shrine (outside the tutorial, where Ama joins later), starter arms and armor, 12 small lumber, 12 small gravel, 300 small timber and 50 large timber.'},booster:{n:'Chalcolithic Booster Pack',size:10,t:'10 random cards.'},buff:{n:'Chalcolithic Buff Pack',size:25,t:'25 random cards.'}};
var STARTER=[['setcard',3],['e_gs_field',2],['e_gs_woodland',1],['e_sm_forest',1],['e_ms_field',1],['t_forest',2],['t_water',1],['t_cultivated',26],['t_orchard',3],['t_pasture',3],['t_field',3],['t_woodland',3],['t_swamp',2],['t_pond',1],['human',8],['spear',4],['shortbow',4],['short_arrows',5],['hide_armor',2],['knife',4],['gravel',12],['lumber',12],['stimber',6],['ltimber',1]];
function packCount(k){return k==='booster'?(S.packs||0):((S.pk||{})[k]||0)}
function packAdd(k,n){if(k==='booster')S.packs=(S.packs||0)+n;else{S.pk=S.pk||{};S.pk[k]=(S.pk[k]||0)+n}}
function openPackOf(k){
  UI.fresh=[];packAdd(k,-1);
  if(k==='starter'){(S.tut?TUT_STARTER:STARTER).forEach(function(x){for(var j=0;j<x[1];j++)UI.fresh.push(mk(x[0]).id)});if(!S.tut){var wf=mk('human');wf.sex='f';UI.fresh.push(wf.id)}}
  else if(k==='booster'&&S.tut&&S.tut.pk&&S.tut.pk.length){S.tut.pk.shift().forEach(function(key){var nc=mk(key==='human_f'?'human':key);if(key==='human_f'){nc.sex='f';nc.name='Ama'}UI.fresh.push(nc.id)});S.tut.opened++}
  else for(var i=0;i<PACKS[k].size;i++){var nc=mk(rollKey());if(nc.key==='human'&&Math.random()<FEMALE_P)nc.sex='f';UI.fresh.push(nc.id)}
  UI.opened=PACKS[k].n;
}
function rollKey(){
  var g=wpick(PACK);
  if(g==='terrain'){if(Math.random()<.35){var ek=wpick([['gs',5],['ms',2],['sm',4],['lm',2]]);return 'e_'+ek+'_'+pick(EKIND)}return 't_'+wpick(TERR_PAIRS)}
  if(g==='weapon'&&Math.random()<.08)return Math.random()<.35?'rod_cu':'rod_wood';
  if(g==='weapon'||g==='ammo'){var t=pick(WEAPON_KEYS),hd=Math.random()<.35?'cu':'fl',wd=Math.random()<.4?'pine':'oak';return wvar(t,hd,wd)}
  if(g==='armor')return pick(['hide_armor','leather_armor']);
  if(g==='shield')return pick(['hide_shield','leather_shield','oak_shield']);
  if(g==='helmet')return pick(['hide_helmet','leather_helmet','oak_helmet']);
  if(g==='greaves')return 'leather_greaves';
  if(g==='mat')return wpick([['lumber',4],['gravel',4],['stimber',2],['ltimber',1]]);
  if(g==='crystal')return Math.random()<.3?'orange_crystal':'red_crystal';
  if(g==='ring')return pick(Object.keys(RING));
  if(g==='animal')return pick(Object.keys(BOON));
  if(g==='tattoo')return pick(Object.keys(TATTOO));
  if(g==='parch')return pick(Object.keys(SPELL));
  return g;
}
var ITEMK={ring:1,greaves:1,weapon:1,ammo:1,armor:1,helmet:1,shield:1,mat:1,crystal:1,gnosis:1,parch:1,animal:1,altar:1,tattoo:1};
function isItem(c){return !!ITEMK[kindOf(c)]}
function pool(){return S.cards.filter(isItem)}
function inHand(){return S.cards.filter(function(c){return c.at===null})}
function atSet(sid){return S.cards.filter(function(c){return c.at===sid})}
function countHand(key){return S.cards.filter(function(c){return c.at===null&&c.key===key}).length}

