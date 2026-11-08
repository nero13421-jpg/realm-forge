/* ---------- fort works: palisades, gates, watchtowers, longhouses ----------
   A palisade is bought whole: 300 timbers, enough wall for one tightest loop round a hamlet's 2.5 ha core (about 560 m).
   You draw it like a road, in one or more pieces, in one go; length you don't draw is lost. A panel (one timber, about
   1.9 m) is the hitbox enemies break. Gates open for your men and stay shut to enemies. Timber comes in bundles of 50. */
var TIMB={stimber:1,ltimber:1},TIMB_N=50;
var PALS={s:{n:'Small palisade',ft:6,m:1.83,hp:600,cost:300,tim:'stimber'},l:{n:'Large palisade',ft:10,m:3.05,hp:1150,cost:700,tim:'ltimber'}};
PALS.s.yd=PALS.s.m/.9144;PALS.l.yd=PALS.l.m/.9144;
var PAL_M=560,PAL_TIM=300,PANEL_M=PAL_M/PAL_TIM,PAL_LAB_M=100,COVER=.25,GATE_SEE=40;
var GATE={n:'Gate',cost:150,tim:4,mats:{gravel:1},lab:1},TOWER={n:'Watchtower',cost:150,tim:20,mats:{gravel:1},lab:1,cap:4,m:4.57},MBR={n:'Medium footbridge',cost:250,mats:{lumber:3,gravel:2},lab:2};
/* smart enemies go for a gate they can see, or scout along the wall for one; dumb ones hit the nearest panel */
var INTEL={goblin:'smart',brigand:'smart'};
var WALLX={goblin:.1,brigand:.15,pigger:.3};/* share of a blow that bites into a palisade: claws and spears do little to logs */
var CORE={hamlet:{ha:2.5,lh:8},village:{ha:7.5,lh:24}},LH_M=[22,7];
var CD={
  human:{n:'Human',k:'human'},
  knife:{n:'Flint knife · oak handle',k:'weapon'},club:{n:'Oak club',k:'weapon'},spear:{n:'Flint spear · oak shaft',k:'weapon'},
  axe:{n:'Flint axe · oak haft',k:'weapon'},battle_axe:{n:'Flint battle axe · oak haft',k:'weapon'},shortbow:{n:'Oak short bow',k:'weapon'},longbow:{n:'Oak long bow',k:'weapon'},short_arrows:{n:'Flint short arrows · oak shafts',k:'ammo'},long_arrows:{n:'Flint long arrows · oak shafts',k:'ammo'},
  hide_armor:{n:'Hide armor',k:'armor'},hide_shield:{n:'Hide shield',k:'shield'},hide_helmet:{n:'Hide helmet',k:'helmet'},
  lumber:{n:'Small lumber',k:'mat'},gravel:{n:'Small gravel',k:'mat'},stimber:{n:'Small timber',k:'mat'},ltimber:{n:'Large timber',k:'mat'},
  red_crystal:{n:'Red crystal',k:'crystal'},orange_crystal:{n:'Orange crystal',k:'crystal'},gnosis:{n:'Gnosis',k:'gnosis'},
  rod_wood:{n:'Pine rod',k:'weapon'},rod_cu:{n:'Copper rod · pine core',k:'weapon'},
  ring_swift:{n:'Copper ring of swiftness',k:'ring'},ring_endur:{n:'Copper ring of endurance',k:'ring'},ring_str:{n:'Copper ring of strength',k:'ring'},
  p_jab:{n:'Parchment: Arcane Jab',k:'parch'},p_shield:{n:'Parchment: Mystic Shield',k:'parch'},p_slash:{n:'Parchment: Arcane Slash',k:'parch'},p_bolt:{n:'Parchment: Arcane Bolt',k:'parch'},p_push:{n:'Parchment: Gnostic Push',k:'parch'},p_arrow:{n:'Parchment: Arcane Arrow',k:'parch'},p_pull:{n:'Parchment: Gnostic Pull',k:'parch'},
  setcard:{n:'Settlement card',k:'setcard'},
  altar:{n:'Flint altar',k:'altar'},tat_spiral:{n:'Spiral tattoo',k:'tattoo'},tat_antler:{n:'Antler tattoo',k:'tattoo'},tat_serpent:{n:'Serpent tattoo',k:'tattoo'},tat_eye:{n:'Eye tattoo',k:'tattoo'},tat_hand:{n:'Hand tattoo',k:'tattoo'},rabbit:{n:'Rabbit',k:'animal'},stag:{n:'Stag',k:'animal'},boar:{n:'Boar',k:'animal'},wolf:{n:'Wolf',k:'animal'},hawk:{n:'Hawk',k:'animal'}
};
Object.keys(TERR).forEach(function(k){CD['t_'+k]={n:TERR[k].n,k:'terrain'}});
/* elevation: slopes rise across the tile toward the way they are turned; mounds rise in the middle and keep level edges */
var ELEV={gs:{n:'Gentle slope',sh:'slope',rise:25,cost:15},ms:{n:'Moderate slope',sh:'slope',rise:50,cost:30},sm:{n:'Small mound',sh:'mound',rise:15,cost:10},lm:{n:'Large mound',sh:'mound',rise:30,cost:20}},EKIND=['field','woodland','forest','pwood','pforest'];
Object.keys(ELEV).forEach(function(e){EKIND.forEach(function(k){CD['e_'+e+'_'+k]={n:ELEV[e].n+' · '+TERR[k].n,k:'terrain'}})});
function cardTerr(key){return key.charAt(0)==='e'?key.split('_')[2]:key.slice(2)}
function cardCost(key){var t=cardTerr(key);return TERR[t].cost+(key.charAt(0)==='e'?ELEV[key.split('_')[1]].cost:0)}
/* what each item is made of; resonances in later eras key off these */
var MADE={rod_wood:['Pine wood'],rod_cu:['Copper','Pine wood'],ring_swift:['Copper'],ring_endur:['Copper'],ring_str:['Copper'],orange_crystal:['Orange crystal'],knife:['Flint stone'],club:['Oak wood'],axe:['Flint stone','Oak wood'],battle_axe:['Flint stone','Oak wood'],spear:['Flint stone','Oak wood'],shortbow:['Oak wood'],longbow:['Oak wood'],short_arrows:['Flint stone','Oak wood'],long_arrows:['Flint stone','Oak wood'],altar:['Flint stone'],lumber:['Oak wood']};
function madeOf(k){var t=wkey(k);if((WEAP[t]||HEADED[t])&&!MADE[t]){var m=wmat(k);return (m.hd?HEADS[m.hd].m+' · ':'')+WOODS[m.wd].m}if(/^leather_/.test(k))return 'Cow leather';if(/^oak_/.test(k))return 'Oak wood';return MADE[k]?MADE[k].join(' · '):''}
var MAGIC_SCHOOL='Generic magic';
var SPELL_CD={p_jab:1,p_slash:2,p_push:2,p_arrow:2,p_shield:3,p_bolt:3,p_pull:3};
var SPELL={p_push:{n:'Gnostic Push',t:'1 mana · −15 hp · shoves the target 10 yd back · 30 yd range'},p_arrow:{n:'Arcane Arrow',t:'1 mana · −25 hp · 150 yd range'},p_pull:{n:'Gnostic Pull',t:'2 mana · drags one enemy out of his formation to the caster · 40 yd range'},p_jab:{n:'Arcane Jab',t:'1 mana · −20 hp'},p_shield:{n:'Mystic Shield',t:'1 mana · blocks 25 damage once'},p_slash:{n:'Arcane Slash',t:'1 mana · −10 hp · far range'},p_bolt:{n:'Arcane Bolt',t:'2 mana · −75 hp'}};
var KIND={ring:'Ring',greaves:'Greaves',tattoo:'Tattoo',animal:'Animal',altar:'Altar',human:'Human',weapon:'Weapon',ammo:'Ammo',armor:'Armor',helmet:'Helmet',shield:'Shield',mat:'Material',crystal:'Crystal',gnosis:'Gnosis',parch:'Parchment',terrain:'Terrain',setcard:'Settlement'};
var WEAP={
  knife:{dmg:15,apm:60,reach:1,rng:false,wt:.5},
  rod_wood:{dmg:8,apm:45,reach:1,rng:false,wt:1.5,rod:.1},rod_cu:{dmg:10,apm:45,reach:1,rng:false,wt:2.5,rod:.2},
  club:{dmg:25,apm:40,reach:1,rng:false,wt:3},
  axe:{dmg:30,apm:30,reach:1,rng:false,wt:4},
  battle_axe:{dmg:55,apm:18,reach:1.5,rng:false,wt:8,two:true},
  spear:{dmg:35,apm:40,reach:2,rng:false,wt:5},
  shortbow:{dmg:20,apm:16,reach:50,rng:true,wt:2,ammo:'short_arrows'},
  longbow:{dmg:30,apm:9,reach:100,rng:true,wt:4,ammo:'long_arrows'}
};
/* every weapon is a head and a handle: flint or copper on oak or pine. The bare Neolithic keys (spear, knife, ...) are
   flint on oak; the rest are written type@head.wood, e.g. spear@cu.pine. Clubs and bows are wood only. */
var HEADS={fl:{n:'Flint',m:'Flint stone',mul:1,wear:.15,floor:.4},cu:{n:'Copper',m:'Copper',mul:1.15,wear:.05,floor:.6}},WOODS={oak:{n:'Oak',m:'Oak wood'},pine:{n:'Pine',m:'Pine wood'}};
var HEADED={knife:1,spear:1,axe:1,battle_axe:1,short_arrows:1,long_arrows:1},WTYPES=['knife','club','spear','axe','battle_axe','shortbow','longbow','short_arrows','long_arrows'];
var WHANDLE={knife:'handle',spear:'shaft',axe:'haft',battle_axe:'haft',short_arrows:'shafts',long_arrows:'shafts'};
function wkey(k){return k?String(k).split('@')[0]:k}
function wmat(k){var p=String(k).split('@'),q=(p[1]||(HEADED[p[0]]?'fl.oak':'-.oak')).split('.');return{hd:HEADED[p[0]]?(q[0]==='-'?'fl':q[0]):null,wd:q[1]||'oak'}}
function wvar(t,hd,wd){var k=t+'@'+(HEADED[t]?hd:'-')+'.'+wd;return (HEADED[t]?hd==='fl':true)&&wd==='oak'?t:k}
function wname(t,hd,wd){if(t==='knife')return (hd==='cu'?'Copper dagger':'Flint knife')+' · '+WOODS[wd].n.toLowerCase()+' handle';if(t==='club')return WOODS[wd].n+' club';if(t==='shortbow'||t==='longbow')return WOODS[wd].n+' '+(t==='shortbow'?'short bow':'long bow');
  var base={spear:'spear',axe:'axe',battle_axe:'battle axe',short_arrows:'short arrows',long_arrows:'long arrows'}[t];return HEADS[hd].n+' '+base+' · '+WOODS[wd].n.toLowerCase()+' '+WHANDLE[t]}
WTYPES.forEach(function(t){(HEADED[t]?['fl','cu']:['-']).forEach(function(hd){['oak','pine'].forEach(function(wd){var k=wvar(t,hd,wd),base=CD[t];CD[k]={n:wname(t,hd,wd),k:base.k}})})});
/* armor: every piece and what it stops */
var ARM={hide_armor:{def:5,dodge:0,wt:12},leather_armor:{def:8,dodge:0,wt:10},leather_greaves:{def:3,dodge:0,wt:4},hide_helmet:{def:3,dodge:0,wt:2},leather_helmet:{def:4,dodge:0,wt:2},oak_helmet:{def:6,dodge:0,wt:4},hide_shield:{def:10,dodge:5,wt:6},leather_shield:{def:12,dodge:5,wt:5},oak_shield:{def:16,dodge:2,wt:9}};
CD.leather_armor={n:'Cow leather chest armor',k:'armor'};CD.leather_greaves={n:'Cow leather greaves',k:'greaves'};CD.leather_helmet={n:'Cow leather helmet',k:'helmet'};CD.oak_helmet={n:'Oak wooden helmet',k:'helmet'};CD.leather_shield={n:'Cow leather shield',k:'shield'};CD.oak_shield={n:'Oak wooden shield',k:'shield'};
function headOf(card){return card?wmat(card.key).hd:null}
function sharpOf(card){var hd=headOf(card);if(!hd)return 1;var H=HEADS[hd];return Math.max(H.floor,1-(card.wear||0))}
function matMul(card,target){var hd=headOf(card);if(!hd)return 1;var m=HEADS[hd].mul*sharpOf(card),human=target&&target.kind==='brigand';if(hd==='cu'&&human)m*=1.25;if(hd==='fl'&&target&&!human)m*=1.25;return m}
var TERR_PAIRS=Object.keys(TERR_W).map(function(k){return[k,TERR_W[k]]});
var PACK=[['animal',6],['altar',2],['tattoo',3],['human',10],['terrain',12],['setcard',6],['weapon',26],['armor',4],['helmet',4],['shield',4],['greaves',3],['mat',14],['crystal',2],['ring',2],['gnosis',2],['parch',5]];
var WEAPON_KEYS=['knife','club','spear','axe','battle_axe','shortbow','longbow','short_arrows','long_arrows'];
var BOWS=['longbow','shortbow'],AMMO_WT={short_arrows:1,long_arrows:1.5};
var MELEE=['rod_cu','rod_wood','battle_axe','spear','axe','club','knife'],WLIST=['knife','club','axe','battle_axe','spear','shortbow','longbow','rod_wood','rod_cu'];
/* crystals: consumed for mana, for good. Rings: copper jewelry, one of each kind per man, +10% to one stat */
var CRYSTAL={red_crystal:1,orange_crystal:3},RING={ring_swift:{n:'Swiftness',t:'+10% sprint speed and sprint endurance'},ring_endur:{n:'Endurance',t:'+10% middle-distance (jog) endurance'},ring_str:{n:'Strength',t:'+10% strength and carrying'}},RING_B=.1;
var PACE={creep:.49,walk:1.47,jog:2.45,sprint:5.86};
var DRAIN={creep:100/57600,walk:100/28800,jog:100/3600,sprint:100/90};
var HEX_YD=372;

var S,UI={tab:'packs',place:null,msg:'',bad:false,fresh:[],sel:1,hum:null,res:null,confirm:false,mview:'mine',tile:null,mres:null,mshare:.25,draw:null,zoom:null,medit:false,R:null,Rfrom:null,Rpace:'walk',Rwait:'10',pick:false,mu:null,rc:false,saved:'',f:{},selH:null,selU:null,rf:'all',rw:'any'};
function $(s){return document.querySelector(s)}
function rnd(n){return Math.floor(Math.random()*n)}
function pick(a){return a[rnd(a.length)]}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S,function(k,v){return k==='battles'?undefined:v}))}catch(e){}}
function load(){try{var r=localStorage.getItem(KEY);return r?JSON.parse(r):null}catch(e){return null}}
function wpick(pairs){var t=0,i;for(i=0;i<pairs.length;i++)t+=pairs[i][1];var r=Math.random()*t;for(i=0;i<pairs.length;i++){if(r<pairs[i][1])return pairs[i][0];r-=pairs[i][1]}return pairs[0][0]}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

