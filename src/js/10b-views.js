/* ---------- the home views: packs, settlements (gear, altar), resources, the realm map, and render() ---------- */
function vPacks(){
  var hand=inHand().filter(function(c){return !isItem(c)}),fresh=UI.fresh.map(byId).filter(Boolean);
  var men=hand.filter(function(c){return c.key==='human'&&c.sex!=='f'&&fpass('hand',c)});
  var opts=setOpts(UI.sel);
  var nudge=(!S.tut&&!S.setl.length&&!S.units.length&&!S.match)?'<section class="panel tut"><h3>New to RealmForge?</h3><p class="note">A 25 to 45 minute tutorial walks you through building three hamlets and six fights.</p><div class="row"><button class="btn go" data-act="tutstart">'+(UI.tc?'Confirm: start the tutorial':'Start the tutorial')+'</button></div></section>':'';
  return nudge+'<section class="panel"><h2>Packs</h2><p class="note">Booster Packs hold 10 cards and Buff Packs 25. About one human in ten, and about one human in twenty of those is a woman. Weapons, gear, materials, crystals, gnosis and parchments go straight to your stockpile in the Resources tab, shared by your whole realm. Terrain and settlement cards wait in your hand until you place them in the Realm. Men wait here until you assign them to a settlement. Real packs will cost money. In this beta they are free.</p>'+
   '<div class="packs">'+Object.keys(PACKS).map(function(k){var n=packCount(k),P=PACKS[k];return '<div class="packc pk-'+k+'"><span class="label">'+(k==='starter'?'Starter':k==='booster'?'Booster · 10 cards':'Buff · 25 cards')+'</span><b>'+esc(P.n)+'</b><span class="note">'+esc(P.t)+'</span><div class="row"><button class="btn go" data-act="open" data-k="'+k+'"'+(n<1?' disabled':'')+'>Open ('+n+')</button>'+(k==='starter'?'':'<button class="btn sm" data-act="claim" data-k="'+k+'">Claim one (beta)</button>')+'</div></div>'}).join('')+'</div></section>'+
   (fresh.length?'<section class="panel"><h3>Just pulled'+(UI.opened?' from your '+esc(UI.opened):'')+'</h3><div class="tags">'+tagsHtml(fresh,{fresh:true})+'</div></section>':'')+
   '<section class="panel"><h3>Your hand · '+hand.length+' cards</h3>'+
   '<div class="row"><label class="label" for="asel">Assign men to</label><select id="asel" data-sel="1" style="width:auto;max-width:100%">'+opts+'</select><button class="btn" data-act="assignall"'+(men.length&&S.setl.length?'':' disabled')+'>Assign all men ('+men.length+')</button></div>'+msgHtml()+fbar('hand',FHAND,true)+sbar('hand')+
   '<div class="tags">'+(tagsHtml(srt('hand',hand.filter(function(c){return fpass('hand',c)})),{act:function(c){return c.key==='human'?'assign':''}})||'<p class="note">'+(hand.length?'Nothing of that type in your hand.':'Hand is empty. Open a pack.')+'</p>')+'</div></section>';
}

function statsHtml(h){
  var eq=gearOf(h),keys=eq.map(function(c){return c.key}),wt=0;eq.forEach(function(c){wt+=wtOf(c.key)});
  var X=stats(h,wt,eq),u=unitOf(h.id),st=h.at!==null?setById(h.at):null,ws=keys.filter(function(k){return WEAP[k]}),wp=weapPick(keys);
  var who=tbl(['',''],[['Tattoos',h.tat&&h.tat.length?h.tat.map(function(t){return esc(tatText(t))}).join('<br>'):'none'],['Load',wt+' lb of '+X.carry+' lb'+(X.wf<1?' · slowed to ×'+X.wf.toFixed(2):' · full speed')],['Sacrifice',esc(boonText(h))],['Stationed at',st?setName(st):'in your hand, not assigned'],['Unit',u?esc(u.name):'none']]);
  var sheet='',grp='';
  STATS.forEach(function(r){if(r[1]!==grp){grp=r[1];sheet+='<tr><th colspan="2">'+grp+'</th></tr>'}var bb=r[6]&&bo(h,r[6])?' <span class="dim">('+BOON[r[6]].n.toLowerCase()+')</span>':'';sheet+='<tr><td>'+r[2]+'</td><td class="mono">'+statVal(h,r[0],X)+bb+'</td></tr>'});
  sheet='<div class="tblwrap"><table class="sheet">'+sheet+'</table></div>';
  var arrowsFor=function(k){return eq.filter(function(c){return c.key===WEAP[k].ammo}).reduce(function(t,c){return t+(c.n===undefined?20:c.n)},0)};
  var weap=ws.length?tbl(['Weapon','Role','Damage','Attacks/min','Reach','Hit chance','Avg damage/min'],ws.map(function(k){var w=WEAP[k],sk=Math.floor(h.skill[k]*(w.rng?X.keen:1)),dmg=Math.round(w.dmg*X.str*10)/10,apm=Math.round(w.apm*X.strike*10)/10,dpm=apm*sk/100*dmg;return[nm(icoArt(k),CD[k].n),w.rng?'ranged · '+arrowsFor(k)+' '+CD[w.ammo].n.toLowerCase():(k===wp.p||(BOWS.indexOf(wp.p)>=0&&k===wp.s)?'melee':'melee backup'),dmg,apm,Math.round(w.reach*(w.rng?X.range:1))+' yd',sk+'%',dpm.toFixed(1)]})):'<p class="note">Unarmed. He cannot attack in melee or at range.</p>';
  var sk=tbl(['Weapon','Skill'],WLIST.map(function(k){return[CD[k].n,Math.floor(h.skill[k]||10)+' ('+Math.floor(h.skill[k]||10)+'% hit chance)']}));
  var sp=(h.spells&&h.spells.length)?tbl(['Spell','School','Cost','Effect','Recharge'],h.spells.map(function(k){return[nm(icoSpell(k),SPELL[k].n),MAGIC_SCHOOL,SPELL[k].t.split(' · ')[0],SPELL[k].t.split(' · ').slice(1).join(' · '),Math.max(1,Math.round(SPELL_CD[k]*X.cast))+' s']})):'<p class="note">No spells learned.</p>';
  return who+'<h3>Character sheet</h3>'+sheet+'<h3>Weapons</h3>'+weap+'<p class="note">A bow needs its own arrows: short arrows for the short bow, long arrows for the long bow. Average damage per minute assumes no armor or dodging. Melee attacks land when an enemy is within reach; the bow fires when he stands still with bows on.</p><h3>Skill</h3>'+sk+'<h3>Magic</h3>'+sp;
}
function equipBlock(h){
  var items=pool().filter(function(c){var k=kindOf(c);return k!=='mat'&&k!=='animal'&&k!=='altar'&&(c.eq===null||c.eq===h.id)});
  var mine=items.filter(function(c){return c.eq===h.id}),free=items.filter(function(c){return c.eq===null});
  var wt=0;mine.forEach(function(c){wt+=wtOf(c.key)});
  return '<p class="label">Carrying '+wt+' lb of 25 lb free · up to 2 weapons, any number of quivers of arrows (1 lb each), 1 armor, 1 helmet, 1 shield · 1 prestige per item equipped, and equipping is permanent: nothing comes off once it is on. A crystal, gnosis, spell parchment or tattoo is consumed when used. Each tattoo once per person. A parchment teaches its spell for 1 gnosis. A crystal adds its value to that man\'s mana for good, with no limit</p>'+
    fbar('equip')+sbar('equip')+'<div class="tags">'+tagsHtml(srt('equip',mine),{act:'equip',sel:true})+tagsHtml(srt('equip',free.filter(function(c){return fpass('equip',c)})),{act:'equip'})+'</div>'+
    '<p class="note">Skill grows from fighting. Drilling will come later with schools.</p>'+statsHtml(h);
}
function altarHtml(s){
  var civ=s.type!=='camp',cards=pool().filter(function(c){return c.key==='altar'}),hs=atSet(s.id).filter(function(c){return c.key==='human'});
  if(!s.altar){
    if(!civ)return '<div class="upanel"><h3>Altar</h3><p class="note">Altars go in civilian settlements only, hamlets and villages, never a military camp.</p></div>';
    var ac={};pool().forEach(function(c){if(kindOf(c)==='animal')ac[c.key]=(ac[c.key]||0)+1});
    return '<div class="upanel"><h3>Altar</h3><p class="note">'+(cards.length?'You hold '+cards.length+' altar card'+(cards.length>1?'s':'')+'. An altar is raised to one animal: it costs '+ALTAR_COST+' prestige and '+ALTAR_N+' of that animal, given at the raising, and after that it takes only that animal.':'No altar card in your stockpile. Altars come from packs, and they are rare.')+'</p>'+(cards.length?'<div class="row">'+Object.keys(BOON).map(function(k){var n=ac[k]||0;return '<button class="btn sm go" data-act="altar" data-s="'+s.id+'" data-k="'+k+'"'+(n<ALTAR_N||S.prestige<ALTAR_COST||S.match?' disabled':'')+'>'+esc(BOON[k].n)+' altar · '+n+'/'+ALTAR_N+' '+esc(BOON[k].n.toLowerCase())+'s</button>'}).join('')+'</div>':'')+'</div>';
  }
  var pr=s.altar.pr?byId(s.altar.pr):null;if(pr&&pr.at!==s.id){s.altar.pr=null;pr=null}
  var women=hs.filter(function(h){return h.sex==='f'});
  var AK=s.altar.k,o='<div class="upanel"><h3>'+(AK?esc(BOON[AK].n)+' altar':'Altar')+' · '+setName(s)+'</h3>'+svgWrap(rects(ART.altar,0,0),48);
  if(!pr){o+='<p class="note">An altar needs a priestess. Only a woman can become one'+(women.length?'.':', and no woman lives here. Assign one from your hand in Packs: a woman can only go to a settlement with an altar. Women are rare pulls.')+'</p>'+women.map(function(w){return '<button class="btn sm" data-act="priest" data-s="'+s.id+'" data-h="'+w.id+'">Make '+esc(hname(w))+' priestess</button>'}).join('');return o+'</div>'}
  o+='<p class="note">Priestess: <b>'+esc(hname(pr))+'</b> <button class="btn sm" data-act="unpriest" data-s="'+s.id+'">Release her</button></p>';
  var an=pool().filter(function(c){return kindOf(c)==='animal'&&(!AK||c.key===AK)}),cnt={};an.forEach(function(c){cnt[c.key]=(cnt[c.key]||0)+1});
  var who=S.cards.filter(function(c){return c.key==='human'&&c.at===s.id}),gear=pool().filter(blessable),T=byId(UI.sacT);if(T&&T.key!=='human'&&!blessable(T))T=null;if(!T||(T.key==='human'&&T.at!==s.id)){T=who.filter(function(h){return h.id!==s.altar.pr&&unitOf(h.id)})[0]||who.filter(function(h){return h.id!==s.altar.pr})[0]||who[0]||null;UI.sacT=T?T.id:null}
  var A=sacPick(T,cnt);
  var vics=who.filter(function(h){return h!==T&&h.id!==s.altar.pr}),V=byId(UI.sacV);if(!V||vics.indexOf(V)<0){V=vics.filter(function(h){return !isSoldier(h)})[0]||vics[0]||null;UI.sacV=V?V.id:null}
  if(!an.length)return o+'<p class="note">'+(AK?'No '+esc(BOON[AK].n.toLowerCase())+'s in your stockpile. This altar takes only '+esc(BOON[AK].n.toLowerCase())+'s.':'No animals in your stockpile. Animals come from packs.')+'</p></div>';
  o+='<p class="label">Sacrifice · costs '+SAC_COST+' prestige, the animal, one more person and the goods the altar asks</p><div class="row">'+Object.keys(cnt).map(function(k){return '<button class="btn sm tbtn'+(A===k?' on':'')+'" data-act="sacA" data-k="'+k+'">'+esc(BOON[k].n)+' ×'+cnt[k]+'</button>'}).join('')+'</div>'+
    (A?'<p class="note">'+esc(BOON[A].n)+': '+esc(BOON[A].a)+', +'+BOON[A].lo+' to '+BOON[A].hi+'% at random each time, and more of the same animal keep adding up, '+esc(BOON[A].t.replace(/\.$/,''))+'.</p>':'')+
    '<div class="field"><label class="label" for="sacT">Offered for</label><select id="sacT" data-sact="1"><optgroup label="People">'+who.map(function(h){return '<option value="'+h.id+'"'+(T&&T.id===h.id?' selected':'')+'>'+esc(hname(h))+' · '+esc(boonText(h))+'</option>'}).join('')+'</optgroup>'+(gear.length?'<optgroup label="Gear never worn">'+gear.map(function(c){return '<option value="'+c.id+'"'+(T&&T.id===c.id?' selected':'')+'>'+esc(cardName(c))+' RF-'+String(c.id).padStart(4,'0')+(c.boon?' · '+esc(resText(c)):'')+'</option>'}).join('')+'</optgroup>':'')+'</select></div>'+(T&&T.key!=='human'?'<p class="note">Blessed gear carries the boon to whoever wears it, and each offering deepens its resonance. Once it is worn it can take no more.</p>':'');
  var dem=A?sacDem(s,A):null,dsh=dem?matsShort(dem):[];
  o+='<div class="field"><label class="label" for="sacV">Given to the gods</label><select id="sacV" data-sacv="1">'+(vics.length?vics.map(function(h){return '<option value="'+h.id+'"'+(V&&V.id===h.id?' selected':'')+'>'+esc(hname(h))+(isSoldier(h)?' · soldier':'')+'</option>'}).join(''):'<option value="">No one else lives here</option>')+'</select></div>';
  o+=(dem?'<p class="note">With the '+BOON[A].n.toLowerCase()+' the altar asks for <b>'+esc(matsText(dem))+'</b>'+(dsh.length?'. Short on '+esc(dsh.join(', ')):'')+'.</p>':'')+(V?'':'<p class="msg bad">A sacrifice takes one more person living here, besides the one it is offered for and the priestess.</p>');
  var bad=T&&A&&T.boon&&T.boon.k!==A;
  o+=(bad?'<p class="msg bad">'+esc(T.key==='human'?hname(T):cardName(T))+' already carries the '+BOON[T.boon.k].n.toLowerCase()+'. One animal kind each.</p>':'')+'<button class="btn go" data-act="sacrifice" data-s="'+s.id+'"'+(!A||!T||!V||bad||dsh.length||S.prestige<SAC_COST||S.match?' disabled':'')+'>Sacrifice a '+(A?BOON[A].n.toLowerCase():'beast')+' (−'+SAC_COST+' prestige)</button>'+(S.match?'<p class="note">Sacrifices happen at home, between matches.</p>':'');
  return o+'</div>';
}
function vSettle(){
  if(!S.setl.length)return '<section class="panel"><h2>Settlements</h2><p class="note">No settlements yet. Place a settlement card in the Realm tab.</p></section>';
  var s=setById(UI.sel)||S.setl[0];UI.sel=s.id;
  var list=S.setl.map(function(x){return '<button class="btn'+(x.id===s.id?' on':'')+'" data-act="selset" data-id="'+x.id+'">'+setName(x)+'</button>'}).join('');
  var hs=atSet(s.id).filter(function(c){return c.key==='human'});
  if(!hs.some(function(h){return h.id===UI.hum}))UI.hum=hs.length?hs[0].id:null;
  var h=UI.hum?byId(UI.hum):null;
  return '<section class="panel"><h2>Settlements</h2><div class="row">'+list+'</div></section>'+
   '<div class="split"><section class="panel"><div class="field"><label class="label" for="snm">Settlement name</label><input type="text" id="snm" data-snm="'+s.id+'" value="'+esc(s.name||'')+'" maxlength="24" placeholder="'+esc(SETT[s.type].n+' '+lab(s.c,s.r))+'"></div><h3>'+setName(s)+(s.name?' <span class="dim mono">'+SETT[s.type].n+' '+lab(s.c,s.r)+'</span>':'')+(s.altar?' · altar':'')+' · '+hs.length+' humans · soldiers '+soldiersAt(s.id)+(SETT[s.type].def?' / '+SETT[s.type].def:'')+'</h3>'+
   '<div class="tags">'+(hs.map(function(x){return tagHtml(x,{act:'selhum',sel:x.id===UI.hum})}).join('')||'<p class="note">No humans here. Assign some from your hand.</p>')+'</div>'+
   '<p class="note">Gear comes from your shared stockpile. Pick a man to equip him. See everything you hold in the Resources tab.</p>'+altarHtml(s)+'</section>'+
   '<section class="panel">'+(h?'<div class="portrait">'+humanSvg(h,128)+'</div><h3>'+esc(hname(h))+'</h3><div class="field"><label class="label" for="nm">Name '+(h.sex==='f'?'this woman':'this man')+'</label><input type="text" id="nm" data-nm="'+h.id+'" value="'+esc(h.name)+'" maxlength="24" placeholder="'+esc(hname({num:h.num,sex:h.sex}))+'"></div>'+msgHtml()+equipBlock(h):'<p class="note">Select a human to name him and equip him.</p>')+'</section></div>';
}
function vRes(){
  var items=pool();
  if(!items.length)return '<section class="panel"><h2>Resources</h2><p class="note">Your stockpile is empty. Weapons, gear, materials, crystals, gnosis and parchments land here when you open packs.</p></section>';
  var shown=srt('res',items.filter(function(c){return fpass('res',c)})),free=shown.filter(function(c){return !c.eq});
  var by={},order=[];
  shown.forEach(function(c){var r=by[c.key];if(!r){r=by[c.key]={n:CD[c.key].n,k:KIND[kindOf(c)],t:0,e:0,a:0};order.push(c.key)}r.t++;if(c.eq)r.e++;if(AMMO_WT[c.key])r.a+=(c.n===undefined?20:c.n);if(TIMB[c.key])r.a+=(c.n==null?TIMB_N:c.n)});
  var rows=order.map(function(k){var r=by[k];return '<tr><td>'+esc(r.n)+'</td><td>'+r.k+'</td><td class="mono">'+r.t+(AMMO_WT[k]?' ('+r.a+' arrows)':TIMB[k]?' ('+r.a+' timbers)':'')+'</td><td class="mono">'+r.e+'</td><td class="mono">'+(r.t-r.e)+'</td></tr>'}).join('');
  return '<section class="panel"><h2>Resources</h2><p class="note">Your stockpile. It belongs to the whole realm, not to any one settlement. Men and units are the only things stationed at settlements. Equip men from here in the Settlements tab.</p>'+fbar('res')+sbar('res')+
    '<div class="tblwrap"><table><tr><th>Item</th><th>Kind</th><th>Total</th><th>Equipped</th><th>Free</th></tr>'+(rows||'<tr><td colspan="5" class="dim">Nothing of that type.</td></tr>')+'</table></div></section>'+
    '<section class="panel"><h3>Stockpile · '+free.length+' free cards in '+stackOf(free).length+' stacks</h3><p class="note">Equipped gear is left out of these counts. It shows on the man carrying it.</p><div class="tags">'+(tagsHtml(free)||'<p class="note">Everything of that type is equipped.</p>')+'</div></section>';
}
function realmPop(){var l=UI.look;if(!l||UI.place||UI.draw||!placedAt(l[0],l[1]))return '';var F=lookField(l[0],l[1]);return tilePopHtml(l[0],l[1],'<p class="note">'+esc(elevText(hgtAt(ix(l[0],l[1]))))+'. '+esc(F.n)+' ground. Zoom in to see it the way a fight would.</p><div class="row">'+(deepSet('r')[ix(l[0],l[1])]?'':'<button class="btn sm go" data-act="pzgo" data-k="r" data-c="'+l[0]+'" data-r="'+l[1]+'">Zoom in here</button>')+'</div>')}
function vRealm(){
  var cap=capacity(),need=needed(),pct=Math.min(100,need?cap/need*100:100);
  var tb=Object.keys(TERR).map(function(k){var n=countHand('t_'+k);return '<button class="btn sm'+(UI.place&&UI.place.t==='t'&&UI.place.k===k?' on':'')+'" data-act="plc" data-t="t" data-k="'+k+'"'+(n?'':' disabled')+'>'+TERR[k].n+' ×'+n+' · '+TERR[k].cost+'</button>'}).join('');
  var nset=countHand('setcard');
  var sb=Object.keys(SETT).map(function(k){var d=SETT[k];return '<button class="btn sm'+(UI.place&&UI.place.t==='s'&&UI.place.k===k?' on':'')+'" data-act="plc" data-t="s" data-k="'+k+'"'+(nset>=d.cards?'':' disabled')+'>'+d.n+' · '+d.cards+' card'+(d.cards>1?'s':'')+' · '+d.cost+(d.mats?' + '+matsText(d.mats):'')+(k==='camp'?' · needs '+CAMP_WILD+' connected wild tiles ('+wildCount()+')':'')+'</button>'}).join('');
  return '<div class="split"><section class="panel"><h2>Realm</h2>'+mapView(mapSvg({sel:UI.place&&UI.place.first,pz:'r'}),'r',realmPop())+legend()+'<p class="note">Drag to move around, scroll or pinch to zoom. Tap a settlement to see who lives there. Every placement is permanent and its prestige is sunk. Terrain is never destroyed.</p></section>'+
   '<section class="panel"><p class="note">Tap a placed tile, with nothing picked to place, to zoom in on its ground right there on the map.</p><h3>Place</h3><p class="label">Terrain in hand</p><div class="row">'+tb+'</div><p class="label">Settlements · '+nset+' settlement card'+(nset===1?'':'s')+' in hand</p><div class="row">'+sb+'</div>'+
   '<p class="label">Elevation in hand</p><div class="row">'+Object.keys(ELEV).map(function(e){return EKIND.map(function(k){var key=e+'_'+k,n=countHand('e_'+key);return n?'<button class="btn sm'+(UI.place&&UI.place.t==='e'&&UI.place.k===key?' on':'')+'" data-act="plc" data-t="e" data-k="'+key+'">'+CD['e_'+key].n+' ×'+n+' · '+(TERR[k].cost+ELEV[e].cost)+'</button>':''}).join('')}).join('')+'</div>'+
   (UI.place&&UI.place.t==='e'&&ELEV[UI.place.k.split('_')[0]].sh==='slope'?'<div class="row"><span class="label">Uphill toward the</span>'+HDIR.map(function(dn,di){return '<button class="btn sm'+((UI.rot||0)===di?' on':'')+'" data-act="rot" data-d="'+di+'">'+['→ E','↗ NE','↖ NW','← W','↙ SW','↘ SE'][di]+'</button>'}).join('')+'</div><p class="note">Turn the card before you place it. The slope rises '+ELEV[UI.place.k.split('_')[0]].rise+' m across the tile toward that side. Tiles placed past its high edge start up there; a level tile on the far side of a crest gets a bank down to it.</p>':'')+
   fortPanel()+
   '<p class="label">Roads, streams and creeks · road '+lineCostText('road')+' · stream '+lineCostText('stream')+'</p>'+waterPanel()+'<div class="row"><button class="btn sm'+(UI.draw&&UI.draw.type==='road'?' on':'')+'" data-act="draw" data-k="road">Gravel road</button><button class="btn sm'+(UI.draw&&UI.draw.type==='stream'?' on':'')+'" data-act="draw" data-k="stream">Stream</button><button class="btn sm'+(UI.draw&&UI.draw.type==='creek'?' on':'')+'" data-act="draw" data-k="creek">Creek · '+lineCostText('creek')+'</button><button class="btn sm'+(UI.place&&UI.place.k==='bridge'?' on':'')+'" data-act="plc" data-t="b" data-k="bridge">Footbridge (stream) · '+workText({cost:BRIDGE_COST,mats:BRIDGE_MATS,lab:1})+'</button><button class="btn sm'+(UI.place&&UI.place.k==='mbridge'?' on':'')+'" data-act="plc" data-t="b" data-k="mbridge">Medium footbridge (creek) · '+workText(MBR)+'</button></div>'+roadNames()+(UI.draw&&!UI.draw.fk?drawPanel():'')+msgHtml()+
   supplyPanel()+'<p class="label">Sustainment · '+Math.floor(cap)+' people fed, '+need+' needed</p><div class="bar'+(need>cap?' over':'')+'"><i style="width:'+pct+'%"></i></div>'+
   '<p class="note">Your terrain feeds people. Settlements need them. You cannot place a settlement that your terrain cannot feed. Hamlet 150, camp 100 and village 450 are placeholders.</p>'+
   '</section></div>';
}

function render(){
  cleanUnits();
  head();
  if(S.match&&UI.tab==='realm')UI.tab='match';
  var v={info:vInfo,packs:vPacks,settle:vSettle,units:vUnits,res:vRes,realm:vRealm,match:vMatch,patrol:vPatrols}[UI.tab];
  $('#view').innerHTML=tutPanel()+(UI.pb&&UI.tab==='match'?pbPanel():'')+v()+foot()+lootPopHtml()+campPopHtml()+bpModal();
  pbStart();LIVE_CACHE={};UI._bsig=bsig();pzInit();if(UI.rp&&UI.tab==='match'){rpStart();rpDraw()}
}
/* the spoils, shown once after a win */
function lootPopHtml(){var L=UI.lootPop;if(!L)return '';var ks=Object.keys(L.lc);
  return '<div class="lootbg" role="dialog" aria-modal="true" aria-labelledby="loott"><div class="lootcard"><p class="label">Victory · '+L.t+' · '+L.mobs+' mobs slain · '+L.camps+' camp'+(L.camps===1?'':'s')+' burned</p><h2 id="loott">Spoils of the match</h2>'+
    '<div class="lootpr"><span class="label">Prestige</span><b>+'+L.p+'</b></div>'+
    (ks.length?'<div class="lootgrid">'+ks.map(function(k){return '<div class="lootit">'+icoArt(k)+'<span>'+esc(CD[k].n)+'</span><b>×'+L.lc[k]+'</b></div>'}).join('')+'</div><p class="note">Everything above is in your stockpile now, in Resources.</p>':'<p class="note">No goods this time, only prestige.</p>')+
    '<div class="row"><button class="btn go" data-act="lootok">Collect</button></div></div></div>'}
function foot(){
  return '<section class="panel"><div class="row"><button class="btn sm" data-act="save">Save</button>'+(S.tut||S.match?'':'<button class="btn sm'+(UI.tc?' on':'')+'" data-act="tutstart">'+(UI.tc?'Confirm: start the tutorial (your realm is set aside)':'Tutorial')+'</button>')+'<button class="btn sm'+(UI.rc?' on':'')+'" data-act="restart">'+(UI.rc?'Confirm: delete this realm':'Restart realm')+'</button>'+(UI.rc?'<button class="btn sm" data-act="norestart">Cancel</button>':'')+'</div><p class="note">'+(UI.saved?esc(UI.saved)+' ':'')+'The game also saves itself after every action. Restart deletes your realm, hand, humans and any running match, and starts a fresh beta.</p></section>';
}
function say(m,bad){UI.msg=m;UI.bad=!!bad}

