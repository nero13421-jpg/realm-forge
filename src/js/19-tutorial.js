/* ---------- tutorial ---------- */
var TKEY=KEY+'-pretut';
function tutEqCount(key,needAmmo){return humans().filter(function(h){var e=eqKeys(h);return e.indexOf(key)>=0&&(!needAmmo||e.indexOf(WEAP[key].ammo)>=0)}).length}
function tutTiles(k){var n=0;S.grid.forEach(function(g){if(g===k)n++});return n}
function tutHamlets(){return S.setl.filter(function(x){return x.type==='hamlet'}).length}
function tutF(k){return !!(S.tut&&S.tut.f&&S.tut.f[k])}
function tutWon(n){return !!(S.tut&&S.tut.won&&S.tut.won[n])}
function tutFlag(k){if(S.tut&&S.match&&S.match.tutEnc){S.tut.f=S.tut.f||{};if(!S.tut.f[k]){S.tut.f[k]=1;UI.needRender=true}}}
/* Part 1 builds your first, permanent realm in the Neolithic. Part 2 is a fresh Chalcolithic realm, built from scratch, that you join onto it at the end. */
var TUT_STARTER=[['setcard',3],['t_pond',3],['t_cultivated',26],['t_woodland',3],['t_field',3],['t_pasture',6],['human',8],['spear',4],['shortbow',4],['short_arrows',5],['hide_armor',2],['knife',4],['gravel',12],['lumber',12]];
var TUT2_STARTER=[['setcard',4],['t_pond',3],['t_water',1],['t_cultivated',30],['t_orchard',3],['t_woodland',1],['t_field',1],['t_pasture',2],['t_forest',6],['e_gs_field',1],['e_lm_woodland',1],
  ['human',10],['spear@cu.oak',3],['spear@cu.pine',1],['knife@cu.oak',3],['longbow',1],['longbow@-.pine',1],['long_arrows@cu.oak',2],['short_arrows',2],['shortbow',2],['leather_armor',2],['leather_helmet',1],['oak_shield',1],['leather_greaves',1],
  ['rod_cu',1],['rod_wood',1],['ring_swift',1],['ring_endur',1],['ring_str',1],['orange_crystal',1],['gnosis',2],['p_arrow',1],['p_slash',1],['tat_antler',1],['tat_hand',1],['gravel',12],['lumber',12]];
var TUT_PACKS={A:['human_f','altar'].concat(Array(11).fill('rabbit')).concat(['wolf','human','human','human','human'],Array(14).fill('lumber'),Array(20).fill('gravel'),['hide_shield','hide_helmet','longbow','long_arrows','spear','spear']),
 B:['red_crystal','gnosis','p_bolt','human','human','human'].concat(Array(10).fill('lumber'),Array(11).fill('gravel'),['battle_axe','hide_armor','spear','shortbow','short_arrows'],Array(7).fill('stimber'))};
/* each encounter is one or more full camps. Part 1: goblins and brigands only. Part 2: the Chalcolithic's own trouble, and the old trouble too */
var TUT_ENC={
  1:{reward:{lumber:6,gravel:6},camps:[{type:'goblin',n:6}]},
  2:{reward:{lumber:6,gravel:6},camps:[{type:'brigand',n:3}]},
  3:{reward:{lumber:4,gravel:4},camps:[{type:'goblin',n:8}]},
  4:{reward:{lumber:6,gravel:6},camps:[{type:'goblin',n:5},{type:'brigand',n:3,d:7}]},
  5:{reward:{lumber:4,gravel:4},camps:[{type:'pigger'}]},
  6:{stay:true,reward:{lumber:4,gravel:4},camps:[{type:'tiggle',n:14}]},
  7:{stay:true,reward:{lumber:6,gravel:6},camps:[{type:'brigand',n:4,armor:1,hill:1},{type:'goblin',n:5,d:5}]},
  8:{reward:{lumber:8,gravel:8},camps:[{type:'dogman',d:4}]}
};
function tutWalled(){return S.setl[0]&&setWalled(S.setl[0])&&gates().length>0}
function tutCopper(){return humans().some(function(h){return gearOf(h).some(function(c){return wmat(c.key).hd==='cu'})})&&humans().some(function(h){return gearOf(h).some(function(c){return /^leather_/.test(c.key)})})}
function tutJewel(){return humans().some(function(h){return gearOf(h).some(function(c){return kindOf(c)==='ring'||(WEAP[wkey(c.key)]&&WEAP[wkey(c.key)].rod)})})}
function tutHill(){return (S.hgt||[]).some(function(h,i){return h&&h.s!=='flat'&&S.grid[i]})}
function tutFlow(){return (S.lines||[]).some(function(l){return l.type==='stream'||l.type==='creek'})}
var TUT_TABS={packs:'Packs',realm:'Realm',settle:'Settlements',units:'Units',patrol:'Patrols',match:'Match',res:'Resources',info:'Info'};
var TUT=[
 /* ---------- Part 1 · The Neolithic ---------- */
 {part:1,ch:'Part 1 · Founding',t:'Your first pack',tab:'packs',d:'<p>Your people have walked a long way to find this land. Everything they carried is in one bundle: the <b>Neolithic Starter Pack</b>.</p><p>Press <b>Open</b> on it.</p>',chk:function(){return !!S.tut.opened0},hl:'[data-act="open"][data-k="starter"]'},
 {part:1,ch:'Part 1 · Founding',t:'Land that feeds you',tab:'realm',open:['realm'],d:'<p>Eight men, farmland, seed and tools. Now the land. A new tab has opened: <b>Realm</b>, the map of everything you own.</p><p>Every settlement has to be fed: a hamlet needs 150 people fed, and a cultivated field feeds 20. Farmland needs water within two tiles.</p><ol><li>Tap <b>Pond</b> in the tile list and place one.</li><li>Tap <b>Cultivated field</b> and place 8 around it. Each new tile has to touch your realm.</li><li>A hamlet also needs <b>one woodland tile</b> for wood and <b>two pastures</b> for wool and hides. A pasture needs a <b>Field</b> (prairie) near it, so place the field first, then the two pastures, then the woodland.</li></ol><p>Placing costs prestige (top of the screen), and every placement is permanent. Ponds cannot touch each other.</p>',chk:function(){return tutTiles('pond')>=1&&tutTiles('cultivated')>=8&&tutTiles('woodland')>=1&&tutTiles('field')>=1&&tutTiles('pasture')>=2},goal:function(){return tutTiles('pond')+'/1 pond · '+tutTiles('cultivated')+'/8 cultivated · '+tutTiles('woodland')+'/1 woodland · '+tutTiles('field')+'/1 field · '+tutTiles('pasture')+'/2 pastures'}},
 {part:1,ch:'Part 1 · Founding',t:'Your first hamlet',tab:'realm',d:'<p>Tap <b>Hamlet</b> in the settlement list, then an empty hex touching your farmland. A hamlet costs one settlement card, 500 prestige, 10 small lumber and 10 small gravel.</p><p>The <b>Land use</b> panel under the map shows what each settlement has claimed. Zoom right in on the hamlet: its eight longhouses can be dragged about, and tapped to turn.</p>',chk:function(){return tutHamlets()>=1}},
 {part:1,ch:'Part 1 · Founding',t:'Move your people in',tab:'packs',d:'<p>Your 8 men are still in your hand. In <b>Packs</b>, pick the hamlet under <b>Assign men to</b> and press <b>Assign all men</b>.</p>',chk:function(){return humans().filter(function(h){return h.at!==null}).length>=8},hl:'[data-act="assignall"]'},
 {part:1,ch:'Part 1 · Founding',t:'Name it',tab:'settle',open:['settle'],d:'<p>A new tab: <b>Settlements</b>. Every settlement, its people and its gear live here.</p><p>Type a name in <b>Settlement name</b>.</p>',chk:function(){return S.setl.some(function(x){return x.name})}},
 {part:1,ch:'Part 1 · Founding',t:'Arm your men',tab:'settle',d:'<p>Tap a man, then tap gear from the stockpile to put it on him. Each item costs 1 prestige, and gear stays on for good.</p><ul><li>4 men get a <b>spear</b>; two of them hide armor.</li><li>The other 4 get a <b>short bow</b>, <b>short arrows</b> and a <b>knife</b>.</li></ul>',chk:function(){return tutEqCount('spear')>=4&&tutEqCount('shortbow',true)>=4},goal:function(){return tutEqCount('spear')+'/4 spearmen · '+tutEqCount('shortbow',true)+'/4 archers with arrows'}},
 {part:1,ch:'Part 1 · Founding',t:'A squad',tab:'units',open:['units'],d:'<p>A new tab: <b>Units</b>. A unit is a squad, and each team inside it can take its own orders in a fight.</p><ol><li>Press <b>New unit</b> and put all 8 men in it (tap a man, then <b>Put</b>).</li><li>Press <b>Add team</b> and move the 4 archers into it.</li><li>Set <b>Default patrol</b> to <b>Defend settlement</b>: the squad stays home and goes after anything that comes near.</li></ol>',chk:function(){return S.units.some(function(u){return u.hids.length>=8&&teamsOf(u).filter(function(t){return t.hids.length}).length>=2&&u.route==='defend'})}},
 {part:1,ch:'Part 1 · Founding',t:'Formations',tab:'patrol',open:['patrol'],d:'<p>A new tab: <b>Patrols</b>. Your squad has an <b>order of movement</b> (how it marches; a file gets road speed) and <b>orders of battle</b> (setups you switch between mid-fight).</p><p>Press <b>New order of battle</b>, then tap a man and a square to place him. <b>Ranks by team</b> is a good start.</p>',chk:function(){return S.units.some(function(u){return u.fm&&u.fm.ob.length>=2})}},
 {part:1,ch:'Part 1 · Fights',t:'Fight 1 · Goblins',enc:1,open:['match'],d:'<p>Smoke to the east. Six goblins from a swamp camp have smelled your fires. A new tab, <b>Match</b>, is where fights play out.</p><ul><li>Press <b>Start encounter</b>. The match runs live at 10×; <b>Pause</b>, 1×, 10× and 60× change it.</li><li>When your squad meets them, the tile opens as a battlefield. Press <b>Let the AI set up</b>, then <b>Fight</b>.</li><li>Killing them is half of it. Tap their camp (<b>G⌂</b>) and send your squad under <b>Destroy this goblin camp with</b>.</li></ul>',chk:function(){return tutWon(1)&&tutF('bn')},goal:function(){return (tutF('bn')?'✓':'○')+' order the camp burned · '+(tutWon(1)?'✓':'○')+' win'}},
 {part:1,ch:'Part 1 · Growing',t:'A booster',tab:'packs',pack:'A',open:['res'],d:'<p>Word of your win travels. Others come to join you. Open the <b>booster</b> in <b>Packs</b>: a woman, an altar, animals, four men, a long bow, lumber and gravel.</p><p>Gear goes to the stockpile. A new tab, <b>Resources</b>, lists everything you hold.</p>',chk:function(){return S.tut.opened>=1}},
 {part:1,ch:'Part 1 · Growing',t:'A second hamlet',tab:'realm',mats:2,d:'<p>Place 8 more cultivated fields near water (another pond if you need one), with this hamlet\'s own woodland, field and two pastures. Then found the second hamlet, at least one tile from the first: settlements cannot touch.</p>',chk:function(){return tutHamlets()>=2},goal:function(){return tutTiles('cultivated')+'/16 cultivated · '+tutHamlets()+'/2 hamlets'}},
 {part:1,ch:'Part 1 · Growing',t:'A road',tab:'realm',d:'<p>Press <b>Gravel road</b>, tap points on the map to draw it, then <b>Finish</b>. A road costs 100 prestige, 3 gravel and 1 lumber a tile (and, outside the tutorial, a man of labor a tile). A unit only gets road speed marching in a file.</p>',chk:function(){return (S.lines||[]).some(function(l){return l.type==='road'})}},
 {part:1,ch:'Part 1 · Growing',t:'A second squad',tab:'units',d:'<p>Assign the 4 new men to the second hamlet, arm them with the long bow and spears, put them in a new unit there and set it to <b>Defend settlement</b>.</p>',chk:function(){return S.units.filter(function(u){return u.hids.length>=3&&u.route==='defend'}).length>=2}},
 {part:1,ch:'Part 1 · Fights',t:'Fight 2 · Brigands',enc:2,d:'<p>Men this time: three brigands with spears, clubs and a bow. When the battlefield opens press <b>Fight</b>, then tap one of your squad\'s formation buttons to switch formation live.</p><p>Then burn their camp.</p>',chk:function(){return tutWon(2)&&tutF('sw')},goal:function(){return (tutF('sw')?'✓':'○')+' switch formation mid-fight · '+(tutWon(2)?'✓':'○')+' win'}},
 {part:1,ch:'Part 1 · Faith',t:'An altar',tab:'settle',d:'<p>Pick your <b>second hamlet</b> in Settlements and press <b>Rabbit altar</b>. An altar is raised to one animal: this one takes 500 prestige and the <b>10 rabbits</b> from your pack, and after that it takes only rabbits.</p>',chk:function(){return S.setl.some(function(x){return x.altar})}},
 {part:1,ch:'Part 1 · Faith',t:'A priestess',tab:'settle',d:'<p>Ama is still in your hand: women do not join units, they serve at shrines. In <b>Packs</b>, assign her to the second hamlet. Then in the altar panel press <b>Make Ama priestess</b>.</p>',chk:function(){return S.setl.some(function(x){return x.altar&&x.altar.pr})}},
 {part:1,ch:'Part 1 · Faith',t:'A sacrifice',tab:'settle',d:'<p>Pick the <b>Rabbit</b>, a man under <b>Offered for</b>, and a spare man under <b>Given to the gods</b>. Press <b>Sacrifice</b>: he gains +3 to 6% swiftness.</p><p class="note">You can also offer for gear that has never been worn. Blessed gear carries the boon to whoever wears it, and each offering deepens its resonance.</p>',chk:function(){return humans().some(function(h){return h.boon})||S.cards.some(function(c){return c.boon&&c.key!=='human'})}},
 {part:1,ch:'Part 1 · Third hamlet',t:'Another booster',tab:'packs',pack:'B',d:'<p>Open the next booster: a red crystal, gnosis, a spell parchment, a battle axe, three more men, and 350 small timber for a palisade.</p>',chk:function(){return S.tut.opened>=2}},
 {part:1,ch:'Part 1 · Third hamlet',t:'A third hamlet',tab:'realm',mats:3,d:'<p>8 more cultivated fields near water, its woodland, field and two pastures, then the third hamlet. Move the 3 new men in.</p>',chk:function(){return tutHamlets()>=3},goal:function(){return tutTiles('cultivated')+'/24 cultivated · '+tutHamlets()+'/3 hamlets'}},
 {part:1,ch:'Part 1 · Third hamlet',t:'Magic',tab:'settle',d:'<p>Pick a man and use the <b>red crystal</b> on him (+1 mana for good), then the <b>gnosis</b>, then the <b>Arcane Bolt</b> parchment to learn the spell.</p>',chk:function(){return humans().some(function(h){return h.spells&&h.spells.length})}},
 {part:1,ch:'Part 1 · Walls',t:'A palisade',tab:'realm',d:'<p>Goblins are coming for your first hamlet. Under <b>Fort works</b>:</p><ol><li><b>Small palisade</b>: tap points round your first hamlet to draw it, like a road. One palisade is 560 m, one tight loop. Press <b>Finish palisade</b>.</li><li><b>Gate</b>: tap the wall to set a gate in it. Smart enemies go for a gate they can see.</li></ol><p>Panels take 600 HP to break; your men behind the wall take arrows ×0.25.</p>',chk:tutWalled,goal:function(){return (S.setl[0]&&setWalled(S.setl[0])?'✓':'○')+' a palisade · '+(gates().length?'✓':'○')+' a gate'}},
 {part:1,ch:'Part 1 · Fights',t:'Fight 3 · Hold the wall',enc:3,d:'<p>Eight goblins come for the walled hamlet. Once the fight starts, press <b>Pause</b>, pick a single team, press <b>Move to</b> and tap the ground behind the gate. Archers there shoot into the goblins crowding it.</p>',chk:function(){return tutWon(3)&&tutF('pz')&&tutF('mv')},goal:function(){return (tutF('pz')?'✓':'○')+' pause mid-fight · '+(tutF('mv')?'✓':'○')+' send a team somewhere · '+(tutWon(3)?'✓':'○')+' win'}},
 {part:1,ch:'Part 1 · Fights',t:'Fight 4 · Two camps',enc:4,d:'<p>A goblin camp and a brigand camp move at once, both on your walled hamlet. When the fight starts, open <b>Units</b> on the match screen, pick your other squad and choose the fighting one under <b>Reinforce</b>.</p><p>Burn both camps.</p>',chk:function(){return tutWon(4)&&tutF('rf')},goal:function(){return (tutF('rf')?'✓':'○')+' send reinforcements · '+(tutWon(4)?'✓':'○')+' win'}},
 {part:1,ch:'Part 1 · Done',t:'Your realm',open:['info'],d:'<p>Three hamlets, an altar, a palisade, two squads and four wins. This is your realm now: everything you placed is permanent, and it is what you play from here.</p><p>A last tab, <b>Info</b>, holds every rule and number. Part 2, the Chalcolithic, is open whenever you want it: it builds a second realm from scratch, with copper, new land and new enemies, and joins it onto this one.</p>',end1:true},
 /* ---------- Part 2 · The Chalcolithic (a fresh realm; only what is new is taught) ---------- */
 {part:2,ch:'Part 2 · New land',t:'The Chalcolithic pack',tab:'packs',d:'<p>Generations on. Your people have learned to smelt copper and tan cow hide, and a band of them sets out to settle new country. Open the <b>Chalcolithic Starter Pack</b>.</p><p>You know how to found hamlets, arm men and form squads. Part 2 only shows you what is new.</p>',chk:function(){return !!S.tut.opened0},hl:'[data-act="open"][data-k="starter"]'},
 {part:2,ch:'Part 2 · New land',t:'Flanks and backs',d:'<p>Your people have learned something from every fight: a man can only face one way. From now on every man and every mob faces the way he last moved, or whoever he last struck.</p><ul><li>A blow from the <b>side</b> hits 15% more often.</li><li>A blow from <b>behind</b> hits 30% more often and does 25% more damage.</li><li>A <b>shield</b> only guards the front and the shield (left) side.</li></ul><p>So send a team round the side while the line holds the front, and do not let your squads get caught on the march: they face the way they were walking. Battles now call out <b>flank!</b> and <b>from behind!</b> when it happens.</p>'},
 {part:2,ch:'Part 2 · New land',t:'Running water',tab:'realm',d:'<p>This country has <b>streams</b>, <b>creeks</b> and <b>open water</b>. Farmland within two tiles of any of them is watered.</p><ol><li>Press <b>Stream</b> and draw one across your land into your pond (100 prestige a tile). A stream can start anywhere, but it has to run downhill or level and end in a body of water: a pond, a swamp, open water or a creek.</li><li>Place the <b>open water</b> tile beside a pond or where the stream runs into it: open water with nothing flowing in goes stale.</li></ol><p>Problems show as a red <b>!</b> on the map with the fix spelled out.</p>',chk:tutFlow,goal:function(){return (tutFlow()?'✓':'○')+' a stream or creek'}},
 {part:2,ch:'Part 2 · New land',t:'Settle in',tab:'realm',mats:1,d:'<p>As in Part 1: farmland near water, a woodland, a field and two pastures, then a hamlet. Move your 10 men in and form two squads set to <b>Defend settlement</b>.</p>',chk:function(){return tutHamlets()>=1&&S.units.filter(function(u){return u.hids.length>=3&&u.route==='defend'}).length>=2},goal:function(){return tutHamlets()+'/1 hamlet · '+S.units.filter(function(u){return u.hids.length>=3&&u.route==='defend'}).length+'/2 squads defending'}},
 {part:2,ch:'Part 2 · New land',t:'High ground',tab:'realm',d:'<p>Land now rises and falls. Pick the <b>Gentle slope</b> or <b>Large mound</b> card. Turn a slope with the rotate button before placing it: it rises 25 m toward the way it faces. Mounds raise a tile\'s middle. A slope between level tiles makes a ridge with a steep bank behind it.</p><p>Shooting downhill hits harder; steep banks slow men to a scramble. Where a stream drops steeply you get a waterfall.</p>',chk:tutHill},
 {part:2,ch:'Part 2 · Copper',t:'Copper and leather',tab:'settle',d:'<ul><li><b>Copper</b> heads do ×1.25 against men and wear slowly; flint does ×1.25 against beasts and wears fast.</li><li><b>Cow leather</b> armor, helmets and greaves outlast hide.</li><li>A <b>rod</b> adds to spell range and impact (+10% pine, +20% copper) and must be the primary carry.</li><li>A <b>copper ring</b> gives +10% to swiftness, endurance or strength.</li><li>The <b>orange crystal</b> gives +3 mana for good.</li></ul><p>Put copper and leather on your men, and a rod or ring on someone.</p>',chk:function(){return tutCopper()&&tutJewel()},goal:function(){return (tutCopper()?'✓':'○')+' copper and leather · '+(tutJewel()?'✓':'○')+' a rod or ring'}},
 {part:2,ch:'Part 2 · Copper',t:'Tattoos',tab:'settle',d:'<p>Tattooing comes with this age. A tattoo\'s bonus is worked out from a man\'s stats on the day it is inked, and fixed for good, so ink your best men. Pick a man and tap the <b>Antler</b> or <b>Hand</b> tattoo.</p>',chk:function(){return humans().some(function(h){return h.tat&&h.tat.length})}},
 {part:2,ch:'Part 2 · Village',t:'A village',tab:'realm',pr:4500,d:'<p>A <b>village</b> is its own settlement, not a grown hamlet: three settlement cards on <b>two empty hexes side by side</b>, 1000 prestige, 450 people to feed.</p><ul><li>Its special food: the <b>3 orchards</b> (farmland: water within two tiles).</li><li>It burns <b>8 firewood</b> from land within an hour\'s walk: oak forest 1.5 a tile, woodland 1, pine 0.75, swamp 0.5. Place the <b>6 oak forests</b> near it.</li><li>Enough cultivated fields to feed everyone (header: people fed / needed).</li></ul>',chk:function(){return S.setl.some(function(x){return x.type==='village'})}},
 {part:2,ch:'Part 2 · Fights',t:'Fight 5 · A pigger',enc:5,d:'<p>A pigger has crashed out of the woods: one beast, 300 HP, twice a man\'s speed, a flint spear, no camp. It is dumb: it charges the nearest thing, and at a wall it hacks the nearest panel. Flint does ×1.25 against beasts.</p>',chk:function(){return tutWon(5)}},
 {part:2,ch:'Part 2 · Fights',t:'Fight 6 · The tiggle swamp',enc:6,d:'<p>Fourteen tiggles, frog-men, hold a swamp nearby. They never leave wet ground and cross water freely. Their little bows reach only 12 yd.</p><p>Bring long bows and <b>Arcane Arrow</b>, march a squad to the dry edge of the swamp, and shoot them from there. Wading in with spears is how squads die. Then burn their camp.</p>',chk:function(){return tutWon(6)}},
 {part:2,ch:'Part 2 · Fights',t:'Fight 7 · The hill',enc:7,d:'<p>Old enemies, new ground: four armored brigands dug in on a mound, and a goblin camp close by. Uphill, the brigands shoot farther and hit harder, and your men climb slowly. Open with bows and spells from range, and close together.</p>',chk:function(){return tutWon(7)}},
 {part:2,ch:'Part 2 · Fights',t:'Fight 8 · The dog man',enc:8,d:'<p>Something lives in the deep woods. It runs on all fours, faster than any man, and rears up to fight: a <b>dog man</b>, 600 HP, claws, and clever. He goes for gates and weak points, not the nearest wall.</p><p>Kill him. What he carries is worth it.</p>',chk:function(){return tutWon(8)}},
 {part:2,ch:'Part 2 · Done',t:'Join your realms',d:'<p>The Chalcolithic realm is built. Now join it to your permanent realm: you will see both, drag this one round your realm\'s edge, turn it, and drop it where it touches. Settlements cannot touch, and tiles cannot overlap.</p>',end2:true}
];
function tutStep(){return S.tut?TUT[S.tut.step]||null:null}
function tutPartStart(p){for(var i=0;i<TUT.length;i++)if(TUT[i].part===p)return i;return 0}
function tutPanel(){
  var st=tutStep();if(!st||S.tut.title)return '';if(st.mats&&!(S.tut.topped||{})[S.tut.step])tutMats();
  var p0=tutPartStart(st.part),pn=TUT.filter(function(x){return x.part===st.part}).length,i=S.tut.step-p0;
  var done=!st.chk||st.chk(),o='<section class="panel tut tutcard"><div class="row" style="justify-content:space-between"><span class="label">'+esc(st.ch)+' · '+(i+1)+' of '+pn+'</span><span class="dim mono">'+Math.round(i/(pn-1)*100)+'%</span></div><div class="tutbar"><i style="width:'+(i/(pn-1)*100)+'%"></i></div>';
  o+='<h2>'+esc(st.t)+'</h2><div class="tutd">'+st.d+'</div>';
  if(st.goal)o+='<p class="mono tutgoal">'+esc(st.goal())+'</p>';
  o+='<div class="row">';
  if(st.enc){if(S.match&&S.match.tutEnc===st.enc)o+='<span class="note">Encounter under way.</span>';else if(!done&&!S.match)o+='<button class="btn go" data-act="tutenc">Start encounter</button>'+(S.tut.tries&&S.tut.tries[st.enc]?'<span class="note">Lost? Your realm came back as it was. Try again.</span>':'')}
  if(st.tab&&UI.tab!==st.tab&&!S.match)o+='<button class="btn sm" data-act="tab" data-tab="'+st.tab+'">Go to '+(TUT_TABS[st.tab]||st.tab)+'</button>';
  if(st.end1)o+='<button class="btn go" data-act="tutend1" data-v="play">Play my realm</button><button class="btn" data-act="tutend1" data-v="p2">Start Part 2 now</button>';
  else if(st.end2)o+='<button class="btn go" data-act="mergego">Join the realms</button>';
  else o+='<button class="btn'+(done?' go':' sm')+'" data-act="tutnext"'+(done?'':' disabled')+'>'+(done?'Continue':'Not done yet')+'</button><button class="btn sm" data-act="tutskip">Skip</button>';
  o+='<button class="btn sm" data-act="tutquit">Leave tutorial</button></div></section>';
  return o;
}
/* the black title cards between parts */
var TUT_TITLES={p1:['Welcome to RealmForge','Part 1 · The Neolithic','A people, a pack, and empty land. Build a realm, feed it, arm it, and hold it against what comes out of the swamps and woods.','Begin'],
  p2:['RealmForge','Part 2 · The Chalcolithic','Copper, cow leather, running water, high ground. A new band settles new country, and the woods hold worse than goblins.','Begin']};
function tutTitleHtml(){var T=TUT_TITLES[S.tut.title];if(!T)return '';return '<div class="tuttitle" role="dialog" aria-modal="true" aria-labelledby="ttl"><div class="tuttin"><p class="tutsm">'+esc(T[0])+'</p><h1 id="ttl">'+esc(T[1])+'</h1><p class="tutlede">'+esc(T[2])+'</p><button class="btn go" data-act="tutbegin">'+esc(T[3])+'</button></div></div>'}
function tutTabsOpen(){return S.tut&&S.tut.tabs?S.tut.tabs:null}
function tutMats(){var st=tutStep();if(!st||!st.mats||S.match||tutHamlets()>=st.mats)return;S.tut.topped=S.tut.topped||{};if(S.tut.topped[S.tut.step])return;var need=SETT.hamlet.mats,got={};
  Object.keys(need).forEach(function(k){var miss=need[k]-ownedMat(k).length;if(miss>0){got[k]=miss;for(var q=0;q<miss;q++)mk(k)}});S.tut.topped[S.tut.step]=1;if(Object.keys(got).length){say('The elders send '+matsText(got)+' so you can build.');save()}}
function tutEnter(){var st=tutStep();if(!st)return;
  (st.open||[]).forEach(function(t){if(!S.tut.tabs[t]){S.tut.tabs[t]=1;S.tut.fresh=t}});
  tutMats();if(st.pr&&S.prestige<st.pr&&!(S.tut.topped||{})['p'+S.tut.step]){S.tut.topped=S.tut.topped||{};S.tut.topped['p'+S.tut.step]=1;S.prestige=st.pr;say('The elders send prestige so you can build: you now hold '+st.pr+'.')}
  if(st.pack&&!S.tut.got[st.pack]){S.tut.got[st.pack]=1;S.tut.pk.push(TUT_PACKS[st.pack].slice());S.packs++}
  if(st.tab&&!S.match)UI.tab=st.tab}
function tutFresh(part,prest){COLS=9;ROWS=7;
  S={v:1,nid:1,hn:0,sid:1,prestige:prest,grid:[],setl:[],cards:[],packs:0,units:[],uid:1,lines:[],routes:[],rid:1,bw:9,bh:7};
  for(var i=0;i<COLS*ROWS;i++){S.grid.push(null);(S.hgt=S.hgt||[]).push(null)}
  S.startSet=1;S.tut={part:part,step:tutPartStart(part),f:{},won:{},opened:0,pk:[],got:{},tries:{},title:'p'+part,tabs:part===1?{packs:1}:{packs:1,realm:1,settle:1,units:1,patrol:1,match:1,res:1,info:1}};
  initUI();packAdd('starter',1);UI.tab='packs';UI.saved=''}
function tutStart(){
  var had=false;try{var old=localStorage.getItem(KEY);if(old&&S.setl.length+S.units.length>0&&!S.tut){localStorage.setItem(TKEY,old);had=true}}catch(e){}
  tutFresh(1,6000);S.tut.had=had;save();render();
}
/* part 2: your permanent realm is set aside, untouched, while a new one is built; the two are joined at the end */
var PKEY=KEY+'-perm';
function tutStart2(){
  try{localStorage.setItem(PKEY,JSON.stringify(S))}catch(e){say('Could not set your realm aside, so Part 2 cannot start.',true);return render()}
  tutFresh(2,6000);save();render();
}
function tutEncCamps(g,n){
  var E=TUT_ENC[n],W=g.W,st=S.setl[0],s0=(st.r+g.dr)*W+(st.c+g.dc),dist={},q=[s0],used={},out=[];dist[s0]=0;
  var nb=function(k){return nbrs(k%W,Math.floor(k/W)).map(function(p){return p[1]*W+p[0]})};
  var bfs=function(s){var D={},Q=[s];D[s]=0;while(Q.length){var k=Q.shift();nb(k).forEach(function(m){if(D[m]!=null||g.grid[m]==='pond')return;D[m]=D[k]+1;Q.push(m)})}return D};dist=bfs(s0);
  /* in part 1 a camp sits on the side of the first hamlet (its squad and its palisade): nearer to it than to any other settlement */
  var others=n<=4?S.setl.slice(1).map(function(x){return bfs((x.r+g.dr)*W+(x.c+g.dc))}):[];
  var safe=function(k){return others.every(function(D){return D[k]==null||D[k]>dist[k]})};
  E.camps.forEach(function(C,ci){
    var want=C.d||3,cand=Object.keys(dist).map(Number).filter(function(k){return !g.mine[k]&&g.grid[k]&&g.grid[k]!=='pond'&&!used[k]});if(cand.some(safe))cand=cand.filter(safe);
    cand.sort(function(a,b){return Math.abs(dist[a]-want)-Math.abs(dist[b]-want)||dist[a]-dist[b]});var best=cand.length?cand[0]:s0;used[best]=1;nb(best).forEach(function(m){used[m]=1});
    var key='tut'+n+'_'+ci,o={key:key,type:C.type,hexes:[best],lair:best,reward:100,mobs:[],roam:false,pos:null,path:[],rem:0,wait:0};
    if(C.type==='pigger'){o.hexes=[];o.razed=true;o.spawnAt=5;o.mobs=[{k:'pigger',hp:300,w:'spear'}];g.grid[best]='woodland'}
    else if(C.type==='dogman'){o.hexes=[];o.razed=true;o.spawnAt=8;o.reward=200;o.mobs=[{k:'dogman',hp:600}];g.grid[best]='forest';nb(best).forEach(function(m){if(!g.mine[m]&&g.grid[m]!=='pond')g.grid[m]='forest'})}
    else if(C.type==='tiggle'){/* a swamp of their own, a little way off, joined up so it is one territory */
      var blob=[best],bs={};bs[best]=1;while(blob.length<8){var f=[];blob.forEach(function(k2){nb(k2).forEach(function(m){if(!g.mine[m]&&!bs[m]&&dist[m]>=2)f.push(m)})});if(!f.length)break;var m2=f[Math.floor(Math.random()*f.length)];bs[m2]=1;blob.push(m2)}
      blob.forEach(function(k2){g.grid[k2]='swamp';if(g.hgt[k2])g.hgt[k2]={s:'flat',b:g.hgt[k2].b}});o.hexes=blob.slice();o.terr=blob.slice();o.roam=true;o.pos=[best%W,Math.floor(best/W)];
      for(var t=0;t<(C.n||14);t++)o.mobs.push({k:'tiggle',hp:30,w:t%3===0?'bow':'knife'})}
    else{if(E.stay)g.grid[best]=C.type==='goblin'?'swamp':'woodland';
      if(C.hill){var hb=g.hgt[best]?g.hgt[best].b:0;g.hgt[best]={s:'mound',b:hb,r:30,d:0}}
      for(var t2=0;t2<C.n;t2++)o.mobs.push(C.type==='goblin'?{k:'goblin',hp:50}:{k:'brigand',hp:100,w:['spear','club','spear','shortbow'][t2%4],armor:!!C.armor||t2%2===0,shield:t2%3===1})}
    out.push(o)});
  return out;
}
function startMatch(){
  var hs=S.cards.filter(function(h){return h.key==='human'&&h.at!==null});
  if(!S.setl.length||!hs.length){say('A match needs a settlement with at least one human in it.',true);return render()}
  var base=JSON.parse(JSON.stringify({bw:S.bw,bh:S.bh,grid:S.grid,hgt:S.hgt,setl:S.setl,cards:S.cards,prestige:S.prestige,nid:S.nid,hn:S.hn,sid:S.sid,packs:S.packs,units:S.units,uid:S.uid,lines:S.lines,routes:S.routes,rid:S.rid}));
  var g=genWorld(),mobs0=0,tenc=S.tut&&S.tut.enc?S.tut.enc:0;if(tenc)g.camps=tutEncCamps(g,tenc);
  g.camps.forEach(function(m){mobs0+=m.mobs.length});
  S.match={W:g.W,H:g.H,mine:g.mine,camps:g.camps,clock:0,log:[],n:g.n,earned:0,setLost:0,humLost:0,mobs0:mobs0,over:null,why:'',base:base};
  if(tenc){S.match.tutEnc=tenc;S.match.raidAt=TUT_ENC[tenc].stay?1e9:10;S.tut.enc=0}
  S.grid=g.grid;S.hgt=g.hgt;S.setl.forEach(function(s){s.c+=g.dc;s.r+=g.dr;if(s.c2!=null){s.c2+=g.dc;s.r2+=g.dr}});
  syncDims();
  shiftLines(Math.sqrt(3)*SH*g.dc,SH*1.5*g.dr);shiftRoutes(g.dc,g.dr);
  UI.raids=[];UI.manim=null;UI.pb=null;UI.mview='mine';/* a new match opens on the whole map, not zoomed into the last fight's ground */if(UI.pz)delete UI.pz.m;if(UI.pzDeep)delete UI.pzDeep.m;UI.tile=null;UI.tab='match';UI.mres=null;UI.place=null;UI.confirm=false;UI.res=null;
  S.match.speed=S.match.tutEnc?10:1;S.match.autoPause=true;cleanUnits();S.units.forEach(function(U){initLive(U)});UI.mu=S.units.length?S.units[0].id:null;
  S.match.setc=S.setl.map(function(x){var q=center(x.c,x.r);return[x.id,Math.round(q[0]),Math.round(q[1])]});snapM();UI.rsvg=replayBase();UI.rp=null;
  mlog('Match begins ('+Math.round(UI.mshare*100)+'% yours). '+g.camps.length+' mob camp'+(g.camps.length===1?'':'s')+' in a world of '+(g.W*g.H)+' hexes.','dim');
  say('');save();render();liveStart();
}
function checkEnd(){
  var M=S.match;if(!M||M.over)return;
  var humans=S.cards.filter(function(c){return c.key==='human'&&c.at!==null}).length;
  if(!S.setl.length){M.over='lost';M.why='Every settlement was lost.'}
  else if(!humans){M.over='lost';M.why='Every human was killed.'}
  else if(M.camps.every(function(m){return !m.mobs.length&&m.razed})){M.over='won';M.why='Every mob is killed and every camp burned.'}
}
function endMatch(out){
  liveStop();var M=S.match,left=0,cleared=0;
  M.camps.forEach(function(m){left+=m.mobs.length;if(m.razed)cleared++});var loot=M.loot||[],lc={};loot.forEach(function(k){lc[k]=(lc[k]||0)+1});
  var title=out==='won'?'Match won':out==='lost'?'Match lost':'Match abandoned';
  UI.mres={out:out,title:title,summary:(M.why?M.why+' ':'')+'Lasted '+mmss(M.clock)+'. Camps burned '+cleared+' of '+M.camps.length+'. Mobs killed '+(M.mobs0-left)+' of '+M.mobs0+'. Settlements lost '+M.setLost+'. Humans lost '+M.humLost+'. Prestige earned '+M.earned+(M.earned?', and you keep it':'')+'.'+(loot.length?' Loot to your stockpile: '+matsText(lc)+'.':'')+' Your realm is back as it was before the match'+(M.earned||loot.length?', plus what you won.':'.'),log:M.log.slice().reverse().slice(0,24)};
  snapM();var nms={};S.units.forEach(function(U){nms[U.id]=U.name});UI.mres.replay={svg:UI.rsvg||replayBase(),snaps:M.snaps||[],end:M.clock,setc:M.setc||[],names:nms};UI.rsvg=null;UI.rp=null;
  if(S.tut&&M.tutEnc){var TR=TUT_ENC[M.tutEnc].reward;if(out==='won'&&TR&&!S.tut.won[M.tutEnc]){Object.keys(TR).forEach(function(k){for(var q=0;q<TR[k];q++)loot.push(k)});UI.mres.summary+=' Their stockpile is yours: '+matsText(TR)+'.'}if(out==='won')S.tut.won[M.tutEnc]=1;else{S.tut.tries[M.tutEnc]=(S.tut.tries[M.tutEnc]||0)+1}}
  var b=M.base;COLS=9;ROWS=7;Object.keys(b).forEach(function(k){S[k]=b[k]});S.prestige+=M.earned;loot.forEach(function(k){mk(k)});var LP=out==='won'?{p:M.earned,lc:(function(){var c={};loot.forEach(function(k){c[k]=(c[k]||0)+1});return c})(),camps:cleared,mobs:M.mobs0-left,t:mmss(M.clock)}:null;delete S.match;syncDims();initUI();UI.lootPop=LP;UI.manim=null;UI.tab='match';UI.confirm=false;UI.tile=null;UI.fresh=[];UI.place=null;UI.res=null;UI.mview='mine';say('');save();render();
}
var MOBL={goblin:'G',brigand:'B',pigger:'P',tiggle:'T',dogman:'D'};
var LOOT={dogman:[['p_bark',1,1]],pigger:[['lumber',3,3],['gravel',3,3],['stimber',1,1],['ltimber',1,1]],tiggle:[['knife',1,2],['short_arrows',1,2],['shortbow',1,1],['red_crystal',1,1],['gnosis',1,1],['p_jab',1,1],['p_slash',1,1],['hide_armor',1,1],['leather_shield',1,1],['tat_serpent',1,1],['lumber',2,1],['gravel',2,1]],goblin:[['gravel',3,3],['lumber',3,3],['knife',1,2],['club',1,1],['short_arrows',1,1]],brigand:[['lumber',3,2],['gravel',3,2],['spear',1,2],['club',1,1],['short_arrows',1,2],['hide_armor',1,1],['hide_shield',1,1]]};
var RAZE_S=30,MOB_SIGHT=3;
/* killing a camp's mobs: its reward and one bundle of loot. Burning the camp: its reward again and two bundles */
function giveLoot(m,big){var M=S.match,L=LOOT[m.type],ks=[],i,j;for(i=0;i<(big?2:1);i++){var t=0;L.forEach(function(x){t+=x[2]});var r=Math.random()*t,e=L[0];for(j=0;j<L.length;j++){if(r<L[j][2]){e=L[j];break}r-=L[j][2]}for(j=0;j<e[1];j++)ks.push(e[0])}M.loot=(M.loot||[]).concat(ks);var c={};ks.forEach(function(k){c[k]=(c[k]||0)+1});return matsText(c)}
function campOnTile(c,r){var k=ix(c,r);return S.match.camps.filter(function(m){return !m.razed&&m.hexes.indexOf(k)>=0})[0]||null}
/* tapping a standing camp in a match opens this: pick the unit that goes to destroy it */
function campPopHtml(){if(!S.match||UI.campPop==null)return '';var m=campByKey(UI.campPop);if(!m||m.razed){UI.campPop=null;return ''}var p=lairPos(m);
  return '<div class="lootbg" role="dialog" aria-modal="true" aria-labelledby="campt"><div class="lootcard"><p class="label">'+mobWord(m,0,1)+' camp · '+lab(p[0],p[1])+'</p><h2 id="campt">Destroy this camp</h2>'+razeRow(p[0],p[1])+'<div class="row"><button class="btn sm" data-act="campx">Not now</button></div></div></div>'}
function razeRow(c,r){var m=campOnTile(c,r);if(!m)return '';var us=S.units.filter(function(U){return U.hids.length});
  return '<p class="label">Destroy this '+mobWord(m)+' camp with</p><div class="row">'+(us.length?us.map(function(U){var L=U.live,on=L&&L.mode==='raze'&&String(L.target)===String(m.key);return '<button class="btn sm'+(on?' on':' go')+'" data-act="razego" data-u="'+U.id+'" data-k="'+m.key+'"'+(L&&L.battle?' disabled':'')+'>'+(on?'✓ ':'')+esc(U.name)+'</button>'}).join(''):'<span class="note">No units.</span>')+'</div><p class="note">'+(m.mobs.length&&!m.roam?'Its '+m.mobs.length+' '+mobWord(m,1)+' are home, so your men fight them first, then burn it.':'The camp is empty. Your men march there and burn it in '+RAZE_S+' seconds.')+'</p>'}
function campHere(pos){var k=ix(pos[0],pos[1]),o=null;S.match.camps.forEach(function(m){if(!o&&!m.razed&&m.hexes.indexOf(k)>=0&&((m.roam&&m.type!=='tiggle')||!m.mobs.length))o=m});return o}
function razeCamp(m,U){var M=S.match;m.razed=true;S.prestige+=m.reward;M.earned+=m.reward;var lt=giveLoot(m,true);var p=lairPos(m);mlog(U.name+' burns the '+mobWord(m)+' camp at '+lab(p[0],p[1])+'. +'+m.reward+' prestige. Loot: '+lt+'.','good');UI.needRender=true}
function hexDist(a,b){var aq=a[0]-(a[1]-(a[1]&1))/2,bq=b[0]-(b[1]-(b[1]&1))/2,dq=aq-bq,dr=a[1]-b[1];return (Math.abs(dq)+Math.abs(dr)+Math.abs(dq+dr))/2}
function mobSpot(m){if(S.match.tutEnc&&S.match.tutEnc<=4&&S.setl[0])return S.setl[0];/* part 1 raids always know where the first hamlet is */var M=S.match,r=MOB_SIGHT+(M.mine[ix(m.pos[0],m.pos[1])]?1:0),best=null,bd=1e9;/* part 1 of the tutorial: raids are aimed at the first hamlet, where the squads and the palisade are */(M.tutEnc&&M.tutEnc<=4?S.setl.slice(0,1):S.setl).forEach(function(x){var d=hexDist(m.pos,[x.c,x.r]);if(d<=r&&d<bd){bd=d;best=x}});return best}
function newMobs(type){
  var o=[],n,i;
  if(type==='goblin'){n=10+rnd(6);for(i=0;i<n;i++)o.push({k:'goblin',hp:50})}
  else for(i=0;i<8;i++)o.push({k:'brigand',hp:100,w:pick(['spear','spear','club','shortbow']),armor:Math.random()<.5,shield:Math.random()<.5});
  return o;
}
function mkFoe(b,i,x){
  if(b.k==='dogman')return{side:'e',kind:'dogman',dodge:.15,hp:b.hp,x:x,spd:DOG_SP,dmg:32,apm:55,reach:2.2,rng:false,skill:35,armor:false,shield:false,cd:0,alive:true,id:i,ref:b};
  if(b.k==='pigger')return{side:'e',kind:'pigger',dodge:.05,hp:b.hp,x:x,spd:GOB_SP,dmg:25,apm:50,reach:2,rng:false,skill:25,armor:false,shield:false,cd:0,alive:true,id:i,ref:b};
  if(b.k==='tiggle')return b.w==='bow'?{side:'e',kind:'tiggle',dodge:.15,hp:b.hp,x:x,spd:3.6,dmg:8,apm:30,reach:12,rng:true,skill:15,armor:false,shield:false,cd:0,alive:true,id:i,ref:b}:{side:'e',kind:'tiggle',dodge:.15,hp:b.hp,x:x,spd:3.6,dmg:8,apm:60,reach:1,rng:false,skill:15,armor:false,shield:false,cd:0,alive:true,id:i,ref:b};
  if(b.k==='goblin')return{side:'e',kind:'goblin',dodge:.1,hp:b.hp,x:x,spd:GOB_SP,dmg:15,apm:60,reach:1,rng:false,skill:20,armor:false,shield:false,cd:0,alive:true,id:i,ref:b};
  var w=WEAP[b.w==='bow'?'shortbow':b.w];
  return{side:'e',kind:'brigand',dodge:.1,hp:b.hp,x:x,spd:PACE.jog,dmg:w.dmg,apm:w.apm,reach:w.reach,rng:w.rng,skill:20,armor:b.armor,shield:b.shield,cd:0,alive:true,id:i,ref:b};
}
function dX(a,b){return a.y!=null&&b.y!=null?Math.hypot(a.x-b.x,a.y-b.y):Math.abs(a.x-b.x)}
function nearX(from,arr,jit){var best=null,bs=1e9;arr.forEach(function(t,k){if(!t.alive||t.gone)return;var s=dX(t,from)+((k*7+jit*13)%10)*.3;if(s<bs){bs=s;best=t}});return best}
function hurt(def,d){
  if(def.sh>0){var ab=Math.min(def.sh,d);def.sh-=ab;d-=ab}
  def.hp-=d;return true;
}
function hitX(def,dmg,skill){
  def._dg=false;
  if(Math.random()*100>=skill)return false;
  var dg=(def.dodge||0)*(def.ce!=null&&def.ce<=0?.5:1);if(dg>0&&Math.random()<dg){def._dg=true;return false}
  var red=(def.dfn!=null?def.dfn:(def.armor?5:0)+(def.shield?10:0)+(def.helmet?HELM:0))+(def.guard?GUARD_DEF+(def.shield?GUARD_SH:0):0);
  return hurt(def,Math.max(1,dmg-red));
}
function castAI(u,fs,onKill,F){
  u.cds=Math.max(0,(u.cds||0)-1);
  if(!u.spells||!u.spells.length||u.mana<=0||u.cds>0)return;
  var t=nearX(u,fs,u.c.num);if(!t)return;
  var RM=1+(u.rod||0),d=dX(t,u)/RM,has=function(k){return u.spells.indexOf(k)>=0};/* a rod stretches every spell's reach and hits harder */
  if(has('p_shield')&&!(u.sh>0)&&d<=80){u.mana--;u.sh=25;u.cds=Math.max(1,Math.round(SPELL_CD.p_shield*(u.cast||1)));recEv(u,u,'sh',1);return}
  var k=null,dm=0,mc=1;
  if(has('p_bolt')&&u.mana>=2&&d<=70){k='p_bolt';dm=75;mc=2}
  else if(has('p_pull')&&u.mana>=2&&u.melee&&d>6&&d<=40){k='p_pull';mc=2}
  else if(has('p_push')&&d<=4){k='p_push';dm=15}
  else if(has('p_jab')&&d<=2){k='p_jab';dm=20}
  else if(has('p_arrow')&&d>70&&d<=150){k='p_arrow';dm=25}
  else if(has('p_slash')&&d<=70){k='p_slash';dm=10}
  else if(has('p_push')&&d<=30){k='p_push';dm=15}
  else if(has('p_arrow')&&d<=150){k='p_arrow';dm=25}
  if(!k)return;
  dm=Math.round(dm*RM);u.mana-=mc;u.cds=Math.max(1,Math.round(SPELL_CD[k]*(u.cast||1)));t.hp-=dm;recEv(u,t,k==='p_bolt'?'b':k==='p_jab'||k==='p_push'||k==='p_pull'?'j':'s',1);
  if(k==='p_push'||k==='p_pull'){var dx=t.x-u.x,dy=t.y!=null&&u.y!=null?t.y-u.y:0,dd=Math.hypot(dx,dy)||1,nx,ny;
    if(k==='p_push'){nx=t.x+dx/dd*10;ny=t.y!=null?t.y+dy/dd*10:null}else{nx=u.x+dx/dd*1.5;ny=t.y!=null?u.y+dy/dd*1.5:null}
    if(F&&ny!=null){var q=bfFree(F,nx,ny);nx=q[0];ny=q[1]}
    t.x=nx;if(ny!=null)t.y=ny;t.woke=true}
  if(t.hp<=0){t.alive=false;if(onKill)onKill(t,k)}
  return {k:k,t:t};
}
function siege(m,st){
  var M=S.match,away=awaySet(),hum=atSet(st.id).filter(function(c){return c.key==='human'&&c.sex!=='f'&&!away[c.id]}),units=hum.map(makeUnit),foes=m.mobs.map(function(b,i){return mkFoe(b,i,150)});
  var tn=mobWord(m,1),wl=lab(st.c,st.r),nm=SETT[st.type].n.toLowerCase();
  mlog(foes.length+' '+tn+' reach the '+nm+' at '+wl+'. '+units.length+' defender'+(units.length===1?'':'s')+(st.pal?', '+st.pal+' palisade'+(st.pal>1?'s':''):'')+'.','bad');
  var WX=4,wallHP=st.pal*300,breach=st.pal===0,bt=0;
  units.forEach(function(u){u.x=0});
  recStart(units,foes,{wall:st.pal>0,title:'Raid on the '+nm+' at '+wl});
  while(bt<3600){
    var live=units.filter(function(u){return u.alive}),fl=foes.filter(function(e){return e.alive});
    if(!live.length||!fl.length)break;
    var atWall=0;
    fl.forEach(function(e){
      var tg=nearX(e,live,e.id);if(!tg)return;
      var stand=e.rng?e.reach-10:Math.max(0,e.reach-.5),floor=(!breach&&!e.rng)?WX:-1e9;
      var nx=Math.max(e.x-e.spd,tg.x+stand,floor);if(e.x>nx)e.x=nx;
      if(!breach&&!e.rng&&e.x<=WX+.01)atWall++;
      e.cd=Math.max(-1,e.cd-1);
      if(Math.abs(e.x-tg.x)<=e.reach&&e.cd<=0){e.cd+=60/e.apm;var hh=hitX(tg,e.dmg,e.skill);recEv(e,tg,e.rng?'r':'m',hh);if(hh&&tg.hp<=0)tg.alive=false}
    });
    if(!breach&&atWall){wallHP-=atWall;if(wallHP<=0){breach=true;if(REC)REC.breach=REC.frames.length-1;mlog('The palisade at '+wl+' is broken.','bad')}}
    live.forEach(function(u){
      if(!u.alive)return;u.cdm=Math.max(-1,u.cdm-1);u.cdr=Math.max(-1,u.cdr-1);
      var fs=foes.filter(function(e){return e.alive});if(!fs.length)return;
      castAI(u,fs,null);
      if(!fs.some(function(e){return e.alive}))return;
      if(u.melee&&u.cdm<=0){var mt=nearX(u,fs,u.c.num);if(mt&&Math.abs(mt.x-u.x)<=WEAP[u.melee].reach){u.cdm+=60/(WEAP[u.melee].apm*u.strike);u.att[u.melee]=(u.att[u.melee]||0)+1;var hm=hitX(mt,WEAP[u.melee].dmg*u.str,u.c.skill[u.melee]);recEv(u,mt,'m',hm);if(hm&&mt.hp<=0)mt.alive=false}}
      if(u.rng&&u.arrows>0&&u.cdr<=0){var t2=nearX(u,fs,u.c.num+3);if(t2&&Math.abs(t2.x-u.x)<=WEAP[u.rng].reach*u.range){u.cdr+=60/(WEAP[u.rng].apm*u.strike);u.att[u.rng]=(u.att[u.rng]||0)+1;u.arrows--;var hr=hitX(t2,WEAP[u.rng].dmg*u.str,u.c.skill[u.rng]*u.keen);recEv(u,t2,'r',hr);if(hr&&t2.hp<=0)t2.alive=false}}
    });
    bt++;recFrame();
  }
  var rrec=recEnd();
  var dead=units.filter(function(u){return !u.alive}),left=foes.filter(function(e){return e.alive});
  settleMen(units);
  if(!left.length){
    m.mobs=[];S.prestige+=m.reward;M.earned+=m.reward;var lt1=giveLoot(m,false);
    mlog('The '+tn+' are beaten at '+wl+' after '+mmss(bt)+'. '+dead.length+' defender'+(dead.length===1?'':'s')+' lost. +'+m.reward+' prestige. Loot: '+lt1+'.'+(m.razed?'':' Their camp still stands.'),'good');
  }else{
    m.mobs=left.map(function(e){e.ref.hp=e.hp;return e.ref});
    var home=atSet(st.id).filter(function(c){return c.key==='human'&&!away[c.id]}),out=atSet(st.id).filter(function(c){return c.key==='human'&&away[c.id]});
    M.humLost+=home.length;
    home.forEach(function(h){S.cards.forEach(function(c){if(c.eq===h.id)c.eq=null})});
    S.cards=S.cards.filter(function(c){return !(c.at===st.id&&!away[c.id])});
    S.setl.splice(S.setl.indexOf(st),1);M.setLost++;
    var other=S.setl[0];
    if(other){out.forEach(function(h){h.at=other.id});S.units.forEach(function(u){if(u.sid===st.id)u.sid=other.id});if(out.length)mlog(out.length+' men out on patrol survive and now answer to the '+SETT[other.type].n.toLowerCase()+' at '+lab(other.c,other.r)+'.','dim')}
    mlog('The '+nm+' at '+wl+' falls. '+left.length+' '+tn+' remain.','bad');
  }
  UI.needRender=true;autoPause();
  if(rrec)pushRaid({title:rrec.title+(left.length?' · it falls':' · beaten off'),rec:rrec,at:mmss(M.clock)});
  checkEnd();
}
var WALL_S=180;/* seconds mobs batter each palisade before the assault */
function walled(c,r){return null}/* the old palisade card is gone: walls are drawn now */
function step(m){
  if(m.inBattle||battleAt(m.pos))return;
  var st=setAt(m.pos[0],m.pos[1]);
  if(st&&!(S.match.tutEnc&&S.match.tutEnc<=4&&st!==S.setl[0])){siege(m,st);return}
  if(m.wait>0){m.wait--;return}
  if(m.batter){if(--m.batter.t>0)return;var BT=m.batter,MM=S.match;m.batter=null;if(BT.g!=null){MM.ghp=MM.ghp||{};MM.ghp[BT.g]=0}else{var BW=wallById(BT.w);if(BW){var BH=panHP(BW,wallGeo(BW));if(BH)BH[BT.i]=0}}m.thru=BT.k;mlog('The '+mobWord(m,1)+' break through the '+(BT.g!=null?'gate':'palisade')+' near '+lab(m.pos[0],m.pos[1])+'.','bad');UI.needRender=true;return}
  /* a palisade keeps them out of the settlement's hex: they attack the wall from the next tile */
  /* at the wall they dig in and batter it for WALL_S seconds per palisade before the assault, which gives defenders time to sally */
  if(m.besiege){var bw=setById(m.besiege.sid);if(!bw){m.besiege=null}else if(--m.besiege.t<=0){m.besiege=null;siege(m,bw);return}else return}
  if(m.path.length){var wl=walled(m.path[0][0],m.path[0][1]);if(wl){m.path=[];m.besiege={sid:wl.id,t:WALL_S*wl.pal};mlog('The '+mobWord(m,1)+' reach the palisade of '+setName(wl)+' and attack the wall from '+lab(m.pos[0],m.pos[1])+'. The assault comes in '+mmss(WALL_S*wl.pal)+'.','bad');UI.needRender=true;autoPause();return}}
  if(!m.path.length){
    var tg=mobSpot(m),best=tg?findPath(m.pos,[tg.c,tg.r]):null,ck=ix(m.pos[0],m.pos[1]);
    if(best&&best.length){if(m.hunt!==tg.id){m.hunt=tg.id;mlog('The '+mobWord(m,1)+' at '+lab(m.pos[0],m.pos[1])+' have found the '+SETT[tg.type].n.toLowerCase()+' at '+lab(tg.c,tg.r)+' and go for it.','bad');UI.needRender=true}}
    else{
      /* wander: prefer ground not yet walked, keep heading roughly the same way */
      m.vis=m.vis||{};m.vis[ck]=(m.vis[ck]||0)+1;var here=center(m.pos[0],m.pos[1]),pv=m.dir||null,bs=-1e9;best=null;
      /* on a road they follow it: a random way along it when they first find it, then onward until it ends */
      var RS=roadSet(),rn=RS[ck]?nbrs(m.pos[0],m.pos[1]).filter(function(q){var k=ix(q[0],q[1]);return RS[k]&&hexSpeed(k)&&k!==m.prevK&&!walled(q[0],q[1])}):[];
      if(rn.length){if(!m.onRoad){m.onRoad=true;m.dir=null;pv=null;mlog('The '+mobWord(m,1)+' at '+lab(m.pos[0],m.pos[1])+' find a road and follow it.','bad');UI.needRender=true}
        var pick0=pv?null:rn[Math.floor(Math.random()*rn.length)];
        rn.forEach(function(q){var c2=center(q[0],q[1]),vx=c2[0]-here[0],vy=c2[1]-here[1],vl=Math.hypot(vx,vy)||1,sc=pick0?(q===pick0?1:0):(vx*pv[0]+vy*pv[1])/vl-(m.vis[ix(q[0],q[1])]||0)*.5;if(sc>bs){bs=sc;best=[q];m.nd=[vx/vl,vy/vl]}});
        m.prevK=ck;m.dir=m.nd;m.path=best;m.rem=HEX_YD;var swr=streamWait(ck,ix(best[0][0],best[0][1]));if(swr)m.wait=swr;return}
      if(m.onRoad){m.onRoad=false;m.prevK=null}
      nbrs(m.pos[0],m.pos[1]).forEach(function(q){var k=ix(q[0],q[1]);if(!hexSpeed(k)||walled(q[0],q[1]))return;var c2=center(q[0],q[1]),vx=c2[0]-here[0],vy=c2[1]-here[1],vl=Math.hypot(vx,vy)||1,sc=Math.random()*2-(m.vis[k]||0)*1.5-(m.hexes.indexOf(k)>=0?1:0)+(pv?(vx*pv[0]+vy*pv[1])/vl:0);if(sc>bs){bs=sc;best=[q];m.nd=[vx/vl,vy/vl]}});
      if(!best){m.wait=60;return}
      m.dir=m.nd;
    }
    m.path=best;m.rem=HEX_YD;
    var sw0=streamWait(ck,ix(best[0][0],best[0][1]));if(sw0){m.wait=sw0;return}
  }
  var nx=m.path[0],mw=walkPos(m),mc=center(nx[0],nx[1]),spd=gradeSpeed((m.type==='goblin'||m.type==='pigger'?GOB_SP:m.type==='dogman'?DOG_SP:PACE.jog)*hexSpeed(ix(nx[0],nx[1])),gradeAt(mw[0],mw[1],mc[0]-mw[0],mc[1]-mw[1]));
  m.rem-=spd;
  if(m.thru!==ix(nx[0],nx[1])&&hasWalls()){var WH=wallCross(mw,walkPos(m));if(WH){m.rem+=spd;return wallMeet(m,WH)}}
  if(m.rem<=0){m.thru=null;m.pos=m.path.shift();m.rem=HEX_YD;if(m.path.length)m.wait=streamWait(ix(m.pos[0],m.pos[1]),ix(m.path[0][0],m.path[0][1]))}
}
var TIG_SP=3.6,TIG_REACH=1;
function stepTiggle(m){var M=S.match,T={},bd=1e9,tgt=null,U0=null;(m.terr||[]).forEach(function(k){T[k]=1});
  S.units.forEach(function(U){var L=U.live;if(!L||L.battle||!U.hids.length)return;var uk=ix(L.pos[0],L.pos[1]);
    (m.terr||[]).forEach(function(k){var d=hexDist([k%COLS,Math.floor(k/COLS)],L.pos);if(d<=TIG_REACH&&(d<bd||(d===bd&&k===ix(m.pos[0],m.pos[1])))){bd=d;tgt=k;U0=U}})});
  var here=ix(m.pos[0],m.pos[1]);
  if(U0&&here===tgt){if(!m.alert||m.alert!==U0.id){m.alert=U0.id;mlog('The tiggles of the swamp at '+lab(m.pos[0],m.pos[1])+' swarm to the edge at '+U0.name+'.','bad');autoPause()}return liveBattle(U0,m)}
  if(m.wait>0){m.wait--;return}
  if(!m.path.length){var goal=tgt;if(goal==null){if(Math.random()>.03)return;goal=pick(m.terr||[here])}
    /* a path that never leaves their ground */
    var prev={},q=[here];prev[here]=-1;while(q.length){var k=q.shift();if(k===goal)break;nbrs(k%COLS,Math.floor(k/COLS)).forEach(function(n){var j=ix(n[0],n[1]);if(T[j]&&prev[j]===undefined){prev[j]=k;q.push(j)}})}
    if(prev[goal]===undefined)return;var path=[],c=goal;while(c!==here){path.unshift([c%COLS,Math.floor(c/COLS)]);c=prev[c]}m.path=path;m.rem=HEX_YD}
  if(!m.path.length)return;m.rem-=TIG_SP*(tgt!=null?1.6:.6);if(m.rem<=0){m.pos=m.path.shift();m.rem=HEX_YD}}
function advance(dt){
  var M=S.match,s;if(!M)return;
  for(s=0;s<dt&&!M.over&&!M.halt;s++){
    M.clock++;
    if(M.clock%60===0)S.cards.forEach(function(c){if(c.dmg>0)c.dmg=Math.max(0,c.dmg-statBase('heal')/60)});
    M.camps.forEach(function(m){
      if(M.over||!m.mobs.length)return;
      if((m.type==='pigger'||m.type==='dogman')&&!m.roam){if(M.clock>=m.spawnAt){m.roam=true;m.pos=lairPos(m);m.path=[];m.rem=HEX_YD;mlog(m.type==='dogman'?'Something big comes out of the deep woods at '+lab(m.pos[0],m.pos[1])+' on all fours: a dog man.':'A pigger crashes out of the woods at '+lab(m.pos[0],m.pos[1])+'.','bad');UI.needRender=true}return}
      if(m.type==='tiggle'){if(!m.inBattle)stepTiggle(m);return}
      if(!m.roam){
        if(M.clock>=raidAt()){m.roam=true;m.pos=lairPos(m);m.path=[];m.rem=HEX_YD;mlog('The '+mobWord(m,1)+' of '+lab(m.pos[0],m.pos[1])+' leave their camp and start exploring.','bad');UI.needRender=true}
        return;
      }
      step(m);
    });
    if(M.over)break;
    S.units.forEach(function(U){if(!M.over&&!M.halt)unitStep(U)});
    (M.battles||[]).forEach(function(bb){if(!bb.done)stepBattle(bb)});
    if(M.battles)M.battles=M.battles.filter(function(bb){return !bb.done});
    if(!M.halt)contactCheck();
    if(M.clock%10===0)snapM();
    checkEnd();
  }
  M.halt=false;
}

