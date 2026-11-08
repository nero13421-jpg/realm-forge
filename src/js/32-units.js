/* ---------- units, filters ---------- */
var SORTS=[['type','By type'],['az','A to Z'],['za','Z to A'],['wh','Heaviest first'],['wl','Lightest first'],['new','Newest first']];
var KORD=['human','terrain','setcard','weapon','ammo','armor','helmet','shield','tattoo','crystal','gnosis','parch','animal','altar','mat'];
function sortOf(view){return (S.so&&S.so[view])||'type'}
function sbar(view){var cur=sortOf(view);return '<div class="field sortf"><label class="label" for="so-'+view+'">Sort</label><select id="so-'+view+'" data-so="'+view+'">'+SORTS.map(function(o){return '<option value="'+o[0]+'"'+(cur===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select></div>'}
function srt(view,list){
  var m=sortOf(view),nm0=function(c){return cardName(c).toLowerCase()},w=function(c){return wtOf(c.key)},ko=function(c){var i=KORD.indexOf(kindOf(c));return i<0?99:i};
  return list.slice().sort(function(a,b){
    if(m==='new')return b.id-a.id;
    if(m==='wh'||m==='wl'){var d=m==='wh'?w(b)-w(a):w(a)-w(b);if(d)return d}
    if(m==='type'){var t=ko(a)-ko(b);if(t)return t}
    var n=nm0(a)<nm0(b)?-1:nm0(a)>nm0(b)?1:0;if(m==='za')n=-n;return n||a.id-b.id;
  });
}
var FKINDS=[['all','All'],['weapon','Weapons'],['armor','Armor'],['helmet','Helmets'],['shield','Shields'],['ammo','Ammo'],['mat','Materials'],['crystal','Crystals'],['gnosis','Gnosis'],['parch','Parchments'],['animal','Animals'],['altar','Altars'],['tattoo','Tattoos']];
var FHAND=[['human','Humans'],['terrain','Terrain'],['setcard','Settlements']];
function fbar(view,extra,only){
  var cur=UI.f[view]||'all',list=only?[['all','All']].concat(extra):FKINDS.concat(extra||[]);
  return '<div class="row chips" role="group" aria-label="Filter by type">'+list.map(function(k){return '<button class="btn sm'+(cur===k[0]?' on':'')+'" data-act="flt" data-v="'+view+'" data-k="'+k[0]+'">'+k[1]+'</button>'}).join('')+'</div>';
}
function fpass(view,c){var f=UI.f[view]||'all';return f==='all'||kindOf(c)===f}
function unitById(id){for(var i=0;i<S.units.length;i++)if(S.units[i].id===id)return S.units[i];return null}
function unitOf(hid){for(var i=0;i<S.units.length;i++)if(S.units[i].hids.indexOf(hid)>=0)return S.units[i];return null}
function cleanUnits(){
  S.units=S.units.filter(function(u){return setById(u.sid)});
  S.units.forEach(function(u){u.hids=u.hids.filter(function(id){var h=byId(id);return h&&h.key==='human'&&h.at===u.sid});teamsOf(u)});
}
function teamsOf(U){
  if(!U.teams||!U.teams.length)U.teams=[{id:1,name:'Main',hids:[]}];
  var seen={};U.teams.forEach(function(t){t.hids=t.hids.filter(function(id){if(seen[id]||U.hids.indexOf(id)<0)return false;seen[id]=1;return true})});
  U.hids.forEach(function(id){if(!seen[id])U.teams[0].hids.push(id)});
  return U.teams;
}
var FMX=15,FMY=11,FMC=7,FMR=5,FMS=3,MAXOB=6;
var STANCE={hold:['Hold','Stays on his spot in the formation. Shoots if he has a bow, fights whatever reaches him.'],guard:['Defense posture','Raises his shield and holds his spot: +'+GUARD_DEF+' defense, +'+GUARD_SH+' more with a shield. He strikes 20% slower and does not shoot.'],shoot:['Advance and shoot','Closes to bow range of the nearest enemy and shoots. A man with no bow charges instead.'],charge:['Charge','Bow down, melee weapon out, runs at the nearest enemy.']};
function fmMen(U){var o=[];teamsOf(U).forEach(function(t,ti){t.hids.forEach(function(h){o.push({h:h,ti:ti})})});return o}
function fmFree(s,x,y){var used={};Object.keys(s).forEach(function(h){used[s[h][0]+','+s[h][1]]=1});for(var r=0;r<20;r++)for(var dy=-r;dy<=r;dy++)for(var dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;var X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<FMX&&Y<FMY&&!used[X+','+Y])return[X,Y]}return[x,y]}
function fmShape(U,kind){
  var men=fmMen(U),s={},n=men.length,rowOf={};
  men.forEach(function(m,i){var x,y;
    if(kind==='file'){x=FMC+Math.floor(i/FMY);y=i%FMY}
    else if(kind==='wedge'){var k=Math.ceil(i/2);x=FMC+(i%2?-k:k);y=1+k}
    else if(kind==='ranks'){var r=rowOf[m.ti]||(rowOf[m.ti]={i:0,n:men.filter(function(q){return q.ti===m.ti}).length});x=Math.round(FMC-(Math.min(FMX,r.n)-1)/2)+(r.i%FMX);y=FMR-1+m.ti*2+Math.floor(r.i/FMX);r.i++}
    else{var row=Math.floor(i/FMX);x=Math.round(FMC-(Math.min(FMX,n-row*FMX)-1)/2)+(i%FMX);y=FMR+row}
    s[m.h]=fmFree(s,Math.max(0,Math.min(FMX-1,x)),Math.max(0,Math.min(FMY-1,y)));
  });
  return s;
}
function fmFill(U,o){Object.keys(o.s).forEach(function(h){if(U.hids.indexOf(+h)<0)delete o.s[h]});if(o.st)Object.keys(o.st).forEach(function(h){if(U.hids.indexOf(+h)<0)delete o.st[h]});U.hids.forEach(function(h){if(!o.s[h])o.s[h]=fmFree(o.s,FMC,FMY-1)})}
function obById(F,id){for(var i=0;i<F.ob.length;i++)if(F.ob[i].id===id)return F.ob[i];return null}
function fmOf(U){
  if(!U.fm){U.fm={mv:{s:fmShape(U,'file')},ob:[{id:1,name:'Battle line',s:fmShape(U,'ranks'),st:{}}],def:1,nid:2}}
  var F=U.fm;if(!F.ob.length)F.ob.push({id:F.nid++,name:'Battle line',s:fmShape(U,'ranks'),st:{}});
  fmFill(U,F.mv);F.ob.forEach(function(o){fmFill(U,o)});if(!obById(F,F.def))F.def=F.ob[0].id;return F;
}
function fmName(F,k){return k==='mv'?'Order of movement':((obById(F,k)||{}).name||'?')}
function teamById(U,tid){var ts=teamsOf(U);for(var i=0;i<ts.length;i++)if(ts[i].id===tid)return ts[i];return null}
function teamOfH(U,hid){var ts=teamsOf(U);for(var i=0;i<ts.length;i++)if(ts[i].hids.indexOf(hid)>=0)return ts[i];return null}
function teamMix(hids){var n={};hids.map(byId).filter(Boolean).forEach(function(h){var eq=eqKeys(h).map(wkey),k=BOWS.filter(function(b){return eq.indexOf(b)>=0})[0]||(MELEE.filter(function(w){return eq.indexOf(w)>=0})[0]||'unarmed');n[k]=(n[k]||0)+1});return Object.keys(n).map(function(k){var w=k==='unarmed'?'unarmed':CD[k].n.toLowerCase().replace(/^(flint|stone|self) /,'');return n[k]+' '+w+(n[k]>1&&k!=='unarmed'?'s':'')}).join(', ')||'empty'}
function isArmed(h){return S.cards.some(function(w){return w.eq===h.id&&kindOf(w)==='weapon'})}
/* women never join units or carry soldier's gear; they serve at shrines, so they can only live where an altar stands */
var SOLDIER_GEAR={weapon:1,ammo:1,armor:1,shield:1,helmet:1,greaves:1};
function shrineAt(sid){var st=setById(sid);return !!(st&&st.altar)}
function womanMsg(){return 'Women do not join units or carry arms. A woman serves at a shrine: she can only be assigned to a settlement with an altar.'}
function transfer(h,sid){h.at=sid}
function touchesSet(c,r){return nbrs(c,r).some(function(p){return setAt(p[0],p[1])})}
function capMsg(st,cap){return 'A '+SETT[st.type].n.toLowerCase()+' holds '+cap+' soldiers at most: men in units or carrying a weapon.'}
function moveHuman(hid,uid,tid){
  var h=byId(hid),U=unitById(uid);if(!h||!U)return;
  if(h.sex==='f'){say(womanMsg(),true);UI.selH=null;return render()}
  if(U.hids.indexOf(hid)>=0&&tid){var nt=teamById(U,tid),ot=teamOfH(U,hid);if(U.live&&U.live.battle){say(U.name+' is in a fight.',true);return render()}if(nt&&ot&&nt!==ot){ot.hids.splice(ot.hids.indexOf(hid),1);nt.hids.push(hid);say(hname(h)+' moves to team '+nt.name+'.');save()}UI.selH=null;return render()}
  var oU=unitOf(hid);if(S.match&&((U.live&&!atHome(U))||(oU&&oU.live&&!atHome(oU)))){say('Men can only change units while both units are home.',true);return render()}
  if(U.hids.indexOf(hid)>=0){UI.selH=null;return render()}
  var st1=setById(U.sid),cap1=SETT[st1.type].def;if(cap1&&!(h.at===U.sid&&isSoldier(h))&&soldiersAt(U.sid)>=cap1){say(capMsg(st1,cap1),true);return render()}
  if(h.at!==U.sid)transfer(h,U.sid);
  towerOff(hid);
  var o=unitOf(hid);if(o)o.hids.splice(o.hids.indexOf(hid),1);
  U.hids.push(hid);var jt=(tid&&teamById(U,tid))||teamsOf(U)[0];teamsOf(U).forEach(function(t){var i=t.hids.indexOf(hid);if(i>=0)t.hids.splice(i,1)});jt.hids.push(hid);UI.selH=null;
  say(hname(h)+' joins '+U.name+' at '+lab(setById(U.sid).c,setById(U.sid).r)+'.');save();render();
}
function removeFromUnit(hid){
  var o=unitOf(hid);if(!o)return;
  if(S.match&&o.live&&!atHome(o)){say(o.name+' is out. Wait until it is home.',true);return render()}
  o.hids.splice(o.hids.indexOf(hid),1);say(hname(byId(hid))+' leaves '+o.name+'. He stays in the settlement.');save();render();
}
function stationUnit(uid,sid){
  var U=unitById(uid),st=setById(sid);if(!U||!st||U.sid===sid){UI.selU=null;return render()}
  if(S.match){say('Units cannot be restationed during a match.',true);return render()}
  var hs=U.hids.map(byId).filter(Boolean),cap=SETT[st.type].def,arm=hs.filter(isArmed).length;
  if(cap&&soldiersAt(sid)+hs.length>cap){say(capMsg(st,cap)+' This unit has '+hs.length+' men.',true);return render()}
  hs.forEach(function(h){transfer(h,sid)});U.sid=sid;UI.selU=null;
  say(U.name+' is now stationed at '+SETT[st.type].n.toLowerCase()+' '+lab(st.c,st.r)+'.');save();render();
}
function chipH(h,opts){
  opts=opts||{};
  var ws=gearOf(h).map(function(c){return CD[c.key].n}).join(', ')||'unarmed';
  var u=unitOf(h.id),st=h.at!==null?setById(h.at):null;
  var where=opts.noWhere?'':(u?u.name:(st?'free · '+lab(st.c,st.r):'in hand'));
  return '<div class="chip'+(UI.selH===h.id?' sel':'')+'" role="button" tabindex="0" draggable="true" data-drag="h:'+h.id+'" data-act="selh" data-id="'+h.id+'">'+humanSvg(h,28)+'<span class="cn">'+esc(hname(h))+'<br><span class="dim mono">'+esc(ws)+(where?' · '+esc(where):'')+'</span></span>'+(opts.out?'<button class="btn sm" data-act="unout" data-id="'+h.id+'" aria-label="Remove from unit">✕</button>':'')+'</div>';
}
function vUnits(){
  var hs=S.cards.filter(function(c){return c.key==='human'&&c.sex!=='f'}),rf=UI.rf||'all',rw=UI.rw||'any';
  var shown=hs.filter(function(h){
    if(rf==='free'&&unitOf(h.id))return false;
    if(rf==='hand'&&h.at!==null)return false;
    if(rf.charAt(0)==='s'&&String(h.at)!==rf.slice(1))return false;
    if(rw==='unarmed'&&isArmed(h))return false;
    if(rw!=='any'&&rw!=='unarmed'&&!S.cards.some(function(w){return w.eq===h.id&&w.key===rw}))return false;
    return true;
  });
  var rfo=[['all','All men'],['free','Not in a unit'],['hand','In hand']].concat(S.setl.map(function(s){return['s'+s.id,setName(s)]}));
  var rwo=[['any','Any weapon'],['unarmed','Unarmed'],['knife','Knife'],['club','Club'],['spear','Spear'],['axe','Stone axe'],['battle_axe','Battle axe'],['shortbow','Short bow'],['longbow','Long bow']];
  var opt=function(list,cur){return list.map(function(o){return '<option value="'+o[0]+'"'+(cur===o[0]?' selected':'')+'>'+esc(o[1])+'</option>'}).join('')};
  var selName=UI.selH?hname(byId(UI.selH)||{num:0}):'';
  var sopts=setOpts(UI.sel);
  var top='<section class="panel"><h2>Units</h2><p class="note">Drag a man onto a team to place him in it, or tap him and then tap Put in. A unit is a squad made of one or more teams, and each team takes its own orders in battle. Drag a unit by its grip onto a settlement to station it there, or use its Station select. A man joining a unit moves to that unit\'s settlement. His gear stays on him.</p>'+msgHtml()+
    (S.setl.length?'<div class="row"><div class="field"><label class="label" for="nus">New unit at</label><select id="nus" data-sel="1">'+sopts+'</select></div><button class="btn go" data-act="newunit">New unit</button></div>':'<p class="note">Place a settlement first. Units are stationed at settlements.</p>')+'</section>';
  var roster='<section class="panel zone" data-drop="pool"><h3>Men · '+shown.length+' of '+hs.length+'</h3><div class="row"><div class="field"><label class="label" for="rf">Show</label><select id="rf" data-rf="1">'+opt(rfo,rf)+'</select></div><div class="field"><label class="label" for="rw">Weapon</label><select id="rw" data-rw="1">'+opt(rwo,rw)+'</select></div></div>'+
    (UI.selH?'<p class="msg">'+esc(selName)+' is selected. Tap Put here on a unit.</p>':'')+
    '<div class="chips2">'+(shown.map(function(h){return chipH(h)}).join('')||'<p class="note">No men match.</p>')+'</div><p class="note">Dropping a man here takes him out of his unit.</p>'+(UI.selH&&byId(UI.selH)?'<div class="row">'+humanSvg(byId(UI.selH),64)+'<h3>'+esc(hname(byId(UI.selH)))+'</h3></div>'+statsHtml(byId(UI.selH)):'')+'</section>';
  var szones=S.setl.length?'<section class="panel"><h3>Settlements</h3><div class="szones">'+S.setl.map(function(s){
    var us=S.units.filter(function(u){return u.sid===s.id});
    var cap=SETT[s.type].def;
    return '<div class="zone sz" data-drop="s:'+s.id+'"><b>'+setName(s)+'</b><span class="dim mono">soldiers '+soldiersAt(s.id)+(cap?' / '+cap:'')+'</span><span>'+(us.map(function(u){return esc(u.name)+' ('+u.hids.length+')'}).join(', ')||'<span class="dim">no units</span>')+'</span>'+(UI.selU?'<button class="btn sm" data-act="stationat" data-s="'+s.id+'">Station selected unit here</button>':'')+'</div>';
  }).join('')+'</div></section>':'';
  var ucards=S.units.map(function(u){
    var mem=u.hids.map(byId).filter(Boolean),ust=setById(u.sid);
    if(u.min)return '<section class="panel zone unit umin" data-drop="u:'+u.id+'"><div class="row"><button class="btn sm" data-act="umin" data-u="'+u.id+'" aria-label="Expand '+esc(u.name)+'" aria-expanded="false">▸</button><b>'+esc(u.name)+'</b><span class="dim mono">'+mem.length+(mem.length===1?' man':' men')+' · '+teamsOf(u).length+' team'+(teamsOf(u).length>1?'s':'')+' · '+esc(teamMix(u.hids))+(ust?' · '+setName(ust):'')+'</span>'+(UI.selH?'<button class="btn sm go" data-act="putin" data-u="'+u.id+'">Put '+esc(selName)+' here</button>':'')+'</div></section>';
    var sopt=setOpts(u.sid);
    var ropts=routeOpts(u.route,'No patrol, stay home');
    return '<section class="panel zone unit" data-drop="u:'+u.id+'"><div class="row"><button class="btn sm" data-act="umin" data-u="'+u.id+'" aria-label="Collapse '+esc(u.name)+'" aria-expanded="true">▾</button><span class="grip" draggable="true" data-drag="u:'+u.id+'" title="Drag onto a settlement">⠿ drag</span><div class="field" style="flex:1"><label class="label" for="un'+u.id+'">Unit name</label><input type="text" id="un'+u.id+'" data-un="'+u.id+'" value="'+esc(u.name)+'" maxlength="24"></div><div class="field"><label class="label" for="us'+u.id+'">Station</label><select id="us'+u.id+'" data-ust="'+u.id+'">'+sopt+'</select></div></div>'+
      '<p class="label">Squad · '+mem.length+' men · '+esc(teamMix(u.hids))+'</p>'+teamsOf(u).map(function(t){var tm=t.hids.map(byId).filter(Boolean);return '<div class="zone team" data-drop="t:'+u.id+':'+t.id+'"><div class="row"><div class="field" style="flex:1"><label class="label" for="tn'+u.id+'_'+t.id+'">Team</label><input type="text" id="tn'+u.id+'_'+t.id+'" data-tn="'+u.id+':'+t.id+'" value="'+esc(t.name)+'" maxlength="18"></div><span class="dim mono">'+tm.length+' · '+esc(teamMix(t.hids))+'</span>'+(u.teams.length>1?'<button class="btn sm" data-act="deltm" data-u="'+u.id+'" data-t="'+t.id+'" aria-label="Remove team">✕ team</button>':'')+'</div>'+
        '<div class="chips2">'+(tm.map(function(h){return chipH(h,{out:true,noWhere:true})}).join('')||'<p class="note">Empty team. Drop men here.</p>')+'</div>'+(UI.selH?'<button class="btn sm go" data-act="putin" data-u="'+u.id+'" data-t="'+t.id+'">Put '+esc(selName)+' in '+esc(t.name)+'</button>':'')+'</div>'}).join('')+
      '<div class="row"><button class="btn sm" data-act="addtm" data-u="'+u.id+'">Add team</button>'+'<button class="btn sm'+(UI.selU===u.id?' on':'')+'" data-act="selu" data-u="'+u.id+'">'+(UI.selU===u.id?'Selected for stationing':'Select to station')+'</button></div>'+
      '<div class="field"><label class="label" for="urt'+u.id+'">Default patrol</label><select id="urt'+u.id+'" data-urt="'+u.id+'">'+ropts+'</select></div>'+
      '<div class="row"><button class="btn sm" data-act="fmgo" data-u="'+u.id+'">Formations</button><button class="btn sm" data-act="topatrols">Edit patrols</button><button class="btn sm" data-act="disband" data-u="'+u.id+'">Disband</button></div></section>';
  }).join('');
  return top+'<div class="split">'+roster+'<div class="ucol">'+(S.units.length>1?'<div class="row"><button class="btn sm" data-act="uminall" data-v="1">Collapse all</button><button class="btn sm" data-act="uminall" data-v="0">Expand all</button></div>':'')+(ucards||'<section class="panel"><p class="note">No units yet. Make one, then drag men into it.</p></section>')+'</div></div>'+szones;
}
function handleDrop(src,dst){
  var s=src.split(':'),d=dst.split(':');
  if(s[0]==='h'&&d[0]==='t')return moveHuman(+s[1],+d[1],+d[2]);
  if(s[0]==='h'&&d[0]==='u')return moveHuman(+s[1],+d[1]);
  if(s[0]==='h'&&d[0]==='pool')return removeFromUnit(+s[1]);
  if(s[0]==='u'&&d[0]==='s')return stationUnit(+s[1],+d[1]);
}

