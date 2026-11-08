/* ---------- battle plays: the same football board, for a fight ----------
   A play is drawn on a blank 140 x 96 yard board with no terrain on it. Your men start in their order of movement at the
   spot on the left, facing right: right is the direction they were marching. At contact the play is laid onto the real
   ground from where the squad stands, turned to the way it was marching, so swamp, woods and streams change how it goes.
   The men are caught facing the way they marched, and wheel to face the enemy before they act. */
var BP_O=[30,48];
var BORD={form:'Form',hold:'Hold the line',guard:'Defense posture',push:'Push forward',dmarch:'Defense march',adv:'Advance',shoot:'Shoot till out of arrows',shootn:'Shoot',cast:'Cast',knife:'Draw knife',charge:'Charge',hide:'Lie in wait',back:'Fall back',wait:'Wait',until:'Wait until'};
function bpOf(U){S.bplays=S.bplays||{};var k=String(U.det||U.id),o=S.bplays[k];if(!o)o=S.bplays[k]={list:[],for:{},nid:1};return o}
function bpById(U,id){var o=bpOf(U);for(var i=0;i<o.list.length;i++)if(o.list[i].id===id)return o.list[i];return null}
function bpFor(U,type){var o=bpOf(U);return bpById(U,o.for[type])||bpById(U,o.for.any)||null}
function bpVsOf(U,P){var o=bpOf(U),v=[];['goblin','brigand','any'].forEach(function(k){if(o.for[k]===P.id)v.push(k)});return v}
function bordText(o,U,P,ro){
  if(o.k==='form')return U?'Form '+fmName(fmOf(U),o.f==='mv'?'mv':+o.f).toLowerCase():'Change formation';
  if(o.k==='adv')return 'Advance '+o.n+' yd';if(o.k==='shootn')return 'Shoot '+o.n+' arrows';if(o.k==='cast')return 'Cast '+o.n+' spell'+(o.n>1?'s':'');if(o.k==='wait')return 'Wait '+o.n+' s';
  if(o.k==='until'){if(o.sig==='done')return 'Wait until move '+(P?stepBySid(P,o.sid)+1:'?')+' is done';if(o.sig==='near')return 'Wait until the enemy is within '+o.n+' yd';if(o.sig==='spring')return 'Wait until you press Spring it';if(o.sig==='arrows')return 'Wait until '+whoName(ro,o.w).toLowerCase()+' is out of arrows'}
  return BORD[o.k]||o.k}
function bpStartPt(U,w){var FM=fmOf(U),hs=whoHids(planRoster(U),w),g={pt:BP_O,face:[1,0]},x=0,y=0,n=0;hs.forEach(function(h){var q=fmPos(g,{c:{id:h}},'mv',FM);x+=q[0];y+=q[1];n++});return n?[x/n,y/n]:BP_O.slice()}
function boardSvg(U,P){var sc=.24,FM=fmOf(U),ro=planRoster(U),g={pt:BP_O,face:[1,0]},o='<svg class="board'+(UI.leg&&UI.leg.kind==='b'?' drawing':'')+'" viewBox="-6 -8 152 110" role="img" aria-label="Play board, '+BPW+' by '+BPH+' yards">';
  o+='<rect x="0" y="0" width="'+BPW+'" height="'+BPH+'" fill="#2f4a26"/>';
  for(var x=10;x<BPW;x+=10)o+='<line x1="'+x+'" y1="0" x2="'+x+'" y2="'+BPH+'" stroke="#f4ead2" stroke-opacity="'+(x%50?.1:.25)+'" stroke-width=".25"/>'+(x%20?'':'<text class="bdlab" x="'+x+'" y="-2" text-anchor="middle">'+x+'</text>');
  o+='<rect x="0" y="0" width="'+BPW+'" height="'+BPH+'" fill="none" stroke="#f4ead2" stroke-opacity=".5" stroke-width=".4"/>';
  o+='<text class="bdlab" x="'+(BP_O[0]-6)+'" y="'+(BP_O[1]-13)+'">your men, as they march</text><line x1="'+(BP_O[0]+12)+'" y1="'+(BP_O[1]-10)+'" x2="'+(BP_O[0]+34)+'" y2="'+(BP_O[1]-10)+'" stroke="#f4ead2" stroke-opacity=".6" stroke-width=".5" marker-end="url(#bdarr)"/><text class="bdlab" x="'+(BP_O[0]+36)+'" y="'+(BP_O[1]-9)+'">direction of travel</text>';
  o+='<defs><marker id="bdarr" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#f4ead2" fill-opacity=".6"/></marker></defs>';
  [[118,34],[121,44],[117,54],[122,62]].forEach(function(q){o+='<g class="bdx"><line x1="'+(q[0]-1.3)+'" y1="'+(q[1]-1.3)+'" x2="'+(q[0]+1.3)+'" y2="'+(q[1]+1.3)+'"/><line x1="'+(q[0]+1.3)+'" y1="'+(q[1]-1.3)+'" x2="'+(q[0]-1.3)+'" y2="'+(q[1]+1.3)+'"/></g>'});
  o+='<text class="bdlab" x="100" y="74">the enemy: wherever they</text><text class="bdlab" x="100" y="77.5">really are at contact</text>';
  ro.forEach(function(t,ti){t.hids.forEach(function(h){var q=fmPos(g,{c:{id:h}},'mv',FM);o+='<circle class="bdman" cx="'+q[0].toFixed(2)+'" cy="'+q[1].toFixed(2)+'" r="1.1" stroke="'+whoCol('t'+(ti+1))+'"/>'})});
  if(P){var G=playGeo(P,function(w){return bpStartPt(U,w)});o+='<g class="play">';P.steps.forEach(function(s,i){var pts=G[i];if(!pts||pts.length<2)return;var col=whoCol(s.who);o+=plLine(pts,s.pace,col,sc);o+=tMark(pts[pts.length-2],pts[pts.length-1],col,sc,i,UI.btsel===i,'btsel')});
    var L=UI.leg;if(L&&L.kind==='b'&&L.pid===P.id){var pts=[pendStart(P,function(w){return bpStartPt(U,w)})].concat(L.pts),col=whoCol(L.who);if(pts.length>1)o+=plLine(pts,L.pace,col,sc,'pend');pts.forEach(function(p,j){o+='<circle class="lpt" cx="'+p[0].toFixed(2)+'" cy="'+p[1].toFixed(2)+'" r="'+((j?3:4.5)*sc).toFixed(2)+'"/>'})}o+='</g>'}
  return o+'</svg>'}
function bTPop(U,P,i){var s=P.steps[i];if(!s)return '';var ro=planRoster(U),G=playGeo(P,function(w){return bpStartPt(U,w)}),pts=G[i],e=pts[pts.length-1],FM=fmOf(U),xp=(e[0]+6)/152*100,yp=(e[1]+8)/110*100,isU=s.who==='u';
  var pos=(xp>55?'left:auto;right:'+Math.max(0,100-xp-1).toFixed(1)+'%;':'left:'+Math.max(0,xp-2).toFixed(1)+'%;')+(yp>50?'top:auto;bottom:'+Math.max(0,100-yp+3).toFixed(1)+'%':'top:'+(yp+3).toFixed(1)+'%');
  var b=function(k,lab,ex){return '<button class="btn sm" data-act="btord" data-k="'+k+'"'+(ex||'')+'>'+lab+'</button>'};
  var aft='<select data-btafter="'+i+'" aria-label="When this move starts"><option value=""'+(s.after==null?' selected':'')+'>Right after the move above</option><option value="0"'+(s.after===0?' selected':'')+'>At the start</option>'+P.steps.map(function(x,j){return j!==i?'<option value="'+x.sid+'"'+(s.after===x.sid?' selected':'')+'>When move '+(j+1)+' is done</option>':''}).join('')+'</select>';
  var un='<select data-buntil="'+i+'" aria-label="Wait until"><option value="">Wait until…</option>'+P.steps.map(function(x,j){return j!==i?'<option value="done:'+x.sid+'">move '+(j+1)+' ('+esc(whoName(ro,x.who))+') is done</option>':''}).join('')+[10,20,40].map(function(n){return '<option value="near:'+n+'">the enemy is within '+n+' yd</option>'}).join('')+'<option value="spring">you press Spring it</option>'+whoOpts(ro).map(function(w){return '<option value="arrows:'+w[0]+'">'+esc(w[1].trim())+' is out of arrows</option>'}).join('')+'</select>';
  return '<div class="pzpop tpop" style="'+pos+'" role="dialog" aria-label="Orders at the end of move '+(i+1)+'"><div class="pzhd"><b style="color:'+whoCol(s.who)+'">Move '+(i+1)+' · '+esc(whoName(ro,s.who))+'</b><button class="btn sm" data-act="btselx" aria-label="Close">×</button></div>'+
    '<div class="tgrp"><span class="label">Pace</span>'+Object.keys(PACE_STY).map(function(k){return '<button class="btn sm pc'+(s.pace===k?' on':'')+'" data-act="btpace" data-p="'+k+'">'+paceIcon(k,whoCol(s.who))+PACE_STY[k][0]+'</button>'}).join('')+'</div>'+
    '<div class="tgrp"><span class="label">Starts</span>'+aft+'</div>'+
    '<p class="label" style="margin:0">At the T, in order</p><div class="ochips">'+((s.ord||[]).map(function(o,j){return '<span class="ochip">'+(j+1)+'. '+esc(bordText(o,U,P,ro))+'<button class="btn sm" data-act="btordrm" data-j="'+j+'" aria-label="Remove">×</button></span>'}).join('')||'<span class="note">Nothing yet: they hold the spot.</span>')+'</div>'+
    (isU?'<div class="tgrp"><span class="label">Formation</span>'+b('form','Order of movement',' data-f="mv"')+FM.ob.map(function(o){return b('form',esc(o.name),' data-f="'+o.id+'"')}).join('')+'</div>':'')+
    '<div class="tgrp"><span class="label">Stance</span>'+b('hold','Hold the line')+b('guard','Defense posture')+b('hide','Lie in wait')+(isU?b('push','Push forward')+b('dmarch','Defense march'):'')+'</div>'+
    '<div class="tgrp"><span class="label">Move</span>'+b('adv','Advance 5 yd',' data-n="5"')+b('adv','10 yd',' data-n="10"')+b('adv','20 yd',' data-n="20"')+'</div>'+
    '<div class="tgrp"><span class="label">Shoot</span>'+b('shoot','Till out of arrows')+b('shootn','5 arrows',' data-n="5"')+b('shootn','10',' data-n="10"')+'</div>'+
    '<div class="tgrp"><span class="label">Magic</span>'+b('cast','Cast 1',' data-n="1"')+b('cast','3',' data-n="3"')+b('cast','5',' data-n="5"')+'</div>'+
    '<div class="tgrp"><span class="label">Fight</span>'+b('knife','Draw knife')+b('charge','Charge')+b('back','Fall back')+'</div>'+
    '<div class="tgrp"><span class="label">Wait</span>'+b('wait','5 s',' data-n="5"')+b('wait','10 s',' data-n="10"')+b('wait','30 s',' data-n="30"')+un+'</div>'+
    '<div class="row"><button class="btn sm go" data-act="btselx">Done</button><button class="btn sm" data-act="btdel">Delete move</button></div></div>'}
function boardEd(U){var o=bpOf(U),P=UI.bp&&UI.bp.uid===(U.det||U.id)?bpById(U,UI.bp.pid):null;if(!P&&o.list.length){P=o.list[0];UI.bp={uid:U.det||U.id,pid:P.id}}
  var ro=planRoster(U),L=UI.leg&&UI.leg.kind==='b'&&P&&UI.leg.pid===P.id?UI.leg:null,w=L?L.who:(UI.lwho||'u'),pc=L?L.pace:(UI.Rpace||'walk');
  var h='<div class="row">'+o.list.map(function(p){var vs=bpVsOf(U,p);return '<button class="btn sm'+(P===p?' on':'')+'" data-act="bpsel" data-u="'+(U.det||U.id)+'" data-id="'+p.id+'">'+esc(p.name)+(vs.length?' · vs '+vs.map(function(v){return v==='any'?'anyone':v+'s'}).join(', '):'')+'</button>'}).join('')+'<button class="btn sm go" data-act="bpnew" data-u="'+(U.det||U.id)+'"'+(o.list.length>=8?' disabled':'')+'>New play</button></div>';
  if(!P)return h+'<p class="note">No plays yet. A play is drawn like a football play: who goes where, at what pace, and what they do when they get there.</p>';
  routeSids(P);
  h+='<div class="row"><div class="field" style="flex:1;min-width:140px"><label class="label" for="bpn">Play name</label><input type="text" id="bpn" data-bpn="1" value="'+esc(P.name)+'" maxlength="28"></div><div class="field"><label class="label" for="bpvs">Run it automatically against</label><select id="bpvs" data-bpvs="1">'+[['','Only when I pick it'],['goblin','Goblins'],['brigand','Brigands'],['any','Anyone without a play of their own']].map(function(x){var on=x[0]?o.for[x[0]]===P.id:!bpVsOf(U,P).length;return '<option value="'+x[0]+'"'+(on?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select></div><button class="btn sm" data-act="bpdel">'+(UI.confirm==='bp'?'Confirm delete':'Delete play')+'</button></div>';
  h+='<div class="pzbar" role="toolbar" aria-label="Draw a move on the board"><select data-lwho="1" aria-label="Who moves">'+whoOpts(ro).map(function(x){return '<option value="'+x[0]+'"'+(x[0]===w?' selected':'')+'>'+esc(x[1])+'</option>'}).join('')+'</select>'+
    Object.keys(PACE_STY).map(function(k){return '<button class="btn sm pc'+(pc===k?' on':'')+'" data-act="lpace" data-p="'+k+'" title="'+PACE_STY[k][0]+': '+PACE_STY[k][1]+'">'+paceIcon(k,whoCol(w))+PACE_STY[k][0]+'</button>'}).join('')+
    (L?'<span class="mono">'+L.pts.length+' pt</span><button class="btn sm go" data-act="lfin"'+(L.pts.length?'':' disabled')+'>End move · T</button><button class="btn sm" data-act="lundo"'+(L.pts.length?'':' disabled')+'>Undo</button><button class="btn sm" data-act="lcan">Cancel</button>':'<button class="btn sm go" data-act="bgo">Draw a move</button>')+'</div>';
  h+='<div class="boardwrap">'+boardSvg(U,P)+(UI.btsel!=null&&!L&&P.steps[UI.btsel]?bTPop(U,P,UI.btsel):'')+'</div>';
  h+='<ul class="orders">'+(P.steps.map(function(s,i){var af=s.after===0||(s.after==null&&!i)?'at the start':s.after==null?'after the move above':'when move '+(stepBySid(P,s.after)+1)+' is done';return '<li><span><b style="color:'+whoCol(s.who)+'">'+(i+1)+'. '+esc(whoName(ro,s.who))+'</b> · '+paceIcon(s.pace,whoCol(s.who))+' '+s.pace+' · starts '+af+((s.ord||[]).length?' · then '+s.ord.map(function(x){return esc(bordText(x,U,P,ro).toLowerCase())}).join(', '):'')+'</span><span class="acts"><button class="btn sm" data-act="btsel" data-i="'+i+'">Orders</button><button class="btn sm" data-act="btup" data-i="'+i+'" aria-label="Move up">↑</button><button class="btn sm" data-act="btrm" data-i="'+i+'" aria-label="Remove">✕</button></span></li>'}).join('')||'<li class="dim">No moves yet. Pick who and the pace, press Draw a move and tap the board.</li>')+'</ul>';
  return h+'<p class="note">Right on the board is the way they were marching. At contact the play is turned to fit and laid on the real ground, so woods, swamp and streams change how it plays out. Creeping men and men lying in wait stay hidden until an enemy gets close; how close depends on the cover they are in.</p>'}
/* in a fight */
function bpXf(Q,p){var dx=p[0]-BP_O[0],dy=p[1]-BP_O[1],t=Q.td;return bfFree(Q.F,Q.A[0]+t[0]*dx-t[1]*dy,Q.A[1]+t[1]*dx+t[0]*dy)}
function bpSet(b,g,U,P){if(!b.plays)b.plays={};if(!P){delete b.plays[g.uid];return}b.plays[g.uid]={pid:P.id,P:JSON.parse(JSON.stringify(P)),A:g.pt0||g.pt.slice(),td:g.td||g.face||[1,0],F:b.F,ro:planRoster(U),done:{},ps:{},runs:{},split:false}}
function bpMem(b,Q,g,w){var hs=w==='u'?null:whoHids(Q.ro,w);return b.units.filter(function(u){return u.uid===g.uid&&u.alive&&!u.gone&&(!hs||hs.indexOf(u.c.id)>=0)})}
function bpTeams(b,Q,g,w){if(w.charAt(0)==='m'){var hs=whoHids(Q.ro,w);return b.teams.filter(function(t){return t.uid===g.uid&&t.man===hs[0]})}if(w.charAt(0)==='t'){var tr=Q.ro[+w.slice(1)-1];return tr?b.teams.filter(function(t){return t.uid===g.uid&&t.tid===tr.id&&!t.man}):[]}return b.teams.filter(function(t){return t.uid===g.uid})}
function bpSplit(b,Q,g){Q.split=true;var men={};Q.P.steps.forEach(function(s){if(s.who.charAt(0)==='m'){var h=whoHids(Q.ro,s.who)[0];if(h)men[h]=1}});
  Object.keys(men).forEach(function(h){h=+h;var u=b.units.filter(function(x){return x.uid===g.uid&&x.c.id===h})[0];if(!u)return;var t0=b.teams.filter(function(t){return t.k===u.tk})[0]||{};var key=g.uid+':h'+h;
    b.teams.push({k:key,uid:g.uid,tid:t0.tid,man:h,name:hname(u.c),order:'form',shoot:true,fall:0,n0:1,col:t0.col||0,joined:b.bt,pt:[u.x,u.y],face:g.face});u.tk=key;u.si=0})}
function bpFree(b,Q,g){/* teams the whole-unit actor drives: everyone not on a move or orders of his own */var busy={};Object.keys(Q.runs).forEach(function(w){var r=Q.runs[w];if(w!=='u'&&!r.fin)bpTeams(b,Q,g,w).forEach(function(t){busy[t.k]=1})});return b.teams.filter(function(t){return t.uid===g.uid&&!busy[t.k]})}
function bpCentre(mem){var x=0,y=0;mem.forEach(function(u){x+=u.x;y+=u.y});return mem.length?[x/mem.length,y/mem.length]:[0,0]}
function bpArrows(mem){var a=0,bows=0;mem.forEach(function(u){if(u.rng){bows++;a+=Math.max(0,u.arrows)}});return{a:a,bows:bows}}
function bpCasts(mem){var c=0,m=0;mem.forEach(function(u){c+=u.casts||0;if(u.spells&&u.spells.length)m+=Math.max(0,u.mana)});return{c:c,m:m}}
function bpApply(b,Q,g,w,o,mem,r){var ts=w==='u'?bpFree(b,Q,g):bpTeams(b,Q,g,w),isU=w==='u';
  var setT=function(ord){ts.forEach(function(t){if(ord==='hold'||ord==='guard'){var tm=b.units.filter(function(u){return u.tk===t.k&&u.alive&&!u.gone});if(tm.length){t.pt=bfFree(b.F,bpCentre(tm)[0],bpCentre(tm)[1]);t.face=bfFacing(b,t.pt)}}t.order=ord;t.pace=null})};
  if(o.k==='form'&&isU){g.fo=o.f==='mv'?'mv':+o.f;g.face=bfFacing(b,g.pt);g.mode='hold';ts.forEach(function(t){t.order='form'});return null}
  if(o.k==='hold'){if(isU){g.mode='hold';ts.forEach(function(t){t.order='form'})}else setT('hold');mem.forEach(function(u){u.hide=false});return null}
  if(o.k==='guard'){if(isU){g.mode='guard';ts.forEach(function(t){t.order='form'})}else setT('guard');return null}
  if(o.k==='push'||o.k==='dmarch'){g.mode=o.k;ts.forEach(function(t){t.order='form'});return null}
  if(o.k==='hide'){mem.forEach(function(u){u.hide=true});if(isU){g.mode='hold';ts.forEach(function(t){t.order='form'})}else setT('hold');return null}
  if(o.k==='adv'){var c0=isU?g.pt:bpCentre(mem),tg=bfFree(b.F,c0[0]+Q.td[0]*o.n,c0[1]+Q.td[1]*o.n);r.pts=[tg];r.pi=0;r.pace=r.pace||'walk';return 'move'}
  if(o.k==='shoot'||o.k==='shootn'||o.k==='cast'){if(isU){g.mode='hold';ts.forEach(function(t){t.order='form';t.shoot=true})}else{setT('hold');ts.forEach(function(t){t.shoot=true})}
    if(o.k==='shoot')return{sig:'arrows',w:w};if(o.k==='shootn')return{sig:'shot',n:o.n,a0:bpArrows(mem).a};return{sig:'cast',n:o.n,c0:bpCasts(mem).c}}
  if(o.k==='knife'){mem.forEach(function(u){var kc=(u.c?gearOf(u.c):[]).filter(function(x){return wkey(x.key)==='knife'})[0];if(kc){u.melee='knife';u.mcard=kc}});ts.forEach(function(t){t.shoot=false});return null}
  if(o.k==='charge'){mem.forEach(function(u){u.hide=false});ts.forEach(function(t){t.order='advance';t.shoot=false;t.pace=null});if(isU)g.mode='hold';return null}
  if(o.k==='back'){ts.forEach(function(t){t.order='back'});return null}
  if(o.k==='wait')return{sig:'t',n:o.n};
  if(o.k==='until')return{sig:o.sig,sid:o.sid,n:o.n,w:o.w};
  return null}
function bpCond(b,Q,g,w,c,mem){
  if(c.sig==='t'){c.n--;return c.n<=0}
  if(c.sig==='done')return !!Q.done[c.sid];
  if(c.sig==='spring')return !!b.spring;
  if(c.sig==='near'){var fs=b.foes.filter(function(f){return f.alive});return mem.some(function(u){return fs.some(function(f){return bfD(u,f)<=c.n})})}
  if(c.sig==='arrows'){var am=c.w&&c.w!==w?bpMem(b,Q,g,c.w):mem,A=bpArrows(am);return !A.bows||A.a<=0||!am.length}
  if(c.sig==='shot'){var A2=bpArrows(mem);return !A2.bows||c.a0-A2.a>=c.n||A2.a<=0}
  if(c.sig==='cast'){var C=bpCasts(mem);return C.c-c.c0>=c.n||C.m<=0}
  return true}
function bpTick(b){if(!b.plays)return;Object.keys(b.plays).forEach(function(uid){var Q=b.plays[uid],g=groupOf(b,+uid);if(!g||g.gone||g.wheel>0)return;if(!Q.split)bpSplit(b,Q,g);var P=Q.P;
  P.steps.forEach(function(s,i){if(Q.ps[s.sid]||!afterOk(P,i,Q.done))return;Q.ps[s.sid]=1;Q.runs[s.who]={i:i,pts:s.pts.map(function(p){return bpXf(Q,p)}),pi:0,pace:s.pace,oq:null,cond:null,fin:false}});
  Object.keys(Q.runs).forEach(function(w){bpRun(b,Q,g,w)})})}
function bpRun(b,Q,g,w){var r=Q.runs[w];if(!r||r.fin)return;var mem=bpMem(b,Q,g,w),sid=Q.P.steps[r.i].sid;if(!mem.length){r.fin=true;Q.done[sid]=1;return}
  if(r.pi<r.pts.length){var tg=r.pts[r.pi],creep=r.pace==='creep';mem.forEach(function(u){u.creep=creep});
    if(w==='u'){var sp=Math.min.apply(null,mem.map(function(u){return (r.pace==='sprint'&&u.endur<=0?u.sp.walk:u.sp[r.pace])*(u.wf||1)})),d=Math.hypot(tg[0]-g.pt[0],tg[1]-g.pt[1]);g.mode='leg';g.pace=r.pace;bpFree(b,Q,g).forEach(function(t){t.order='form'});
      if(d>.3){g.face=[(tg[0]-g.pt[0])/d,(tg[1]-g.pt[1])/d]}if(d<=sp){g.pt=tg.slice();r.pi++}else g.pt=[g.pt[0]+(tg[0]-g.pt[0])/d*sp,g.pt[1]+(tg[1]-g.pt[1])/d*sp]}
    else{var ts=bpTeams(b,Q,g,w);ts.forEach(function(t){var tm=b.units.filter(function(u){return u.tk===t.k&&u.alive&&!u.gone}),c0=bpCentre(tm),dd=Math.hypot(tg[0]-c0[0],tg[1]-c0[1]);t.order='move';t.pt=tg.slice();t.pace=r.pace;if(dd>2)t.face=[(tg[0]-c0[0])/dd,(tg[1]-c0[1])/dd]});
      var T={};b.teams.forEach(function(t){T[t.k]=t});if(mem.every(function(u){var sl=bfSlot(b,T[u.tk],u.si);return Math.hypot(u.x-sl[0],u.y-sl[1])<2.5}))r.pi++}
    if(r.pi>=r.pts.length){mem.forEach(function(u){u.creep=false});if(w==='u')g.mode='hold';else bpTeams(b,Q,g,w).forEach(function(t){t.order='hold';t.pace=null;t.face=bfFacing(b,t.pt)});if(r.oq==null)r.oq=(Q.P.steps[r.i].ord||[]).slice()}
    return}
  if(r.cond){if(!bpCond(b,Q,g,w,r.cond,mem))return;r.cond=null}
  while(r.oq&&r.oq.length){var o=r.oq.shift(),c=bpApply(b,Q,g,w,o,mem,r);if(c==='move')return;if(c){r.cond=c;return}}
  r.fin=true;Q.done[sid]=1}
function bpWaiting(b,sig){var on=false;Object.keys(b.plays||{}).forEach(function(k){var Q=b.plays[k];Object.keys(Q.runs).forEach(function(w){var r=Q.runs[w];if(r.cond&&r.cond.sig===sig)on=true;(r.oq||[]).forEach(function(o){if(o.k==='until'&&o.sig===sig)on=true})});Q.P.steps.forEach(function(s){(s.ord||[]).forEach(function(o){if(o.k==='until'&&o.sig===sig&&!Q.done[s.sid])on=true})})});return on}
function bpMarks(b){var o='';Object.keys(b.plays||{}).forEach(function(uid){var Q=b.plays[uid],sc=.35;Q.P.steps.forEach(function(s,i){if(Q.done[s.sid])return;var r=Q.runs[s.who],started=Q.ps[s.sid];var pts=s.pts.map(function(p){return bpXf(Q,p)});
    var st;if(started&&r&&r.i===i){var mem=bpMem(b,Q,groupOf(b,+uid)||{},s.who);st=s.who==='u'?(groupOf(b,+uid)||{pt:pts[0]}).pt:bpCentre(mem);pts=pts.slice(r.pi)}else{var G=playGeo(Q.P,function(w){return BP_O});st=bpXf(Q,G[i][0])}
    var ln=[st].concat(pts).map(function(p){var q=pj(p[0],p[1]);return q});if(ln.length<2)return;o+=plLine(ln,s.pace,whoCol(s.who),sc,'bfpl');var n=ln.length;o+=tMark(ln[n-2],ln[n-1],whoCol(s.who),sc,i,false,'bfnone')})});return o}
function bfTravel(L,U,m){/* which way the squad was going, and where the enemy is from it */var td=null;if(L.face){var d=Math.hypot(L.face[0],L.face[1]);if(d>1e-6)td=[L.face[0]/d,L.face[1]/d]}
  if(!td&&L.path&&L.path.length){var a=center(L.pos[0],L.pos[1]),c=center(L.path[0][0],L.path[0][1]),d2=Math.hypot(c[0]-a[0],c[1]-a[1]);if(d2>1e-6)td=[(c[0]-a[0])/d2,(c[1]-a[1])/d2]}
  if(!td){var st=setById(U.sid);if(st){var h=center(st.c,st.r),p=walkPos(L),d3=Math.hypot(p[0]-h[0],p[1]-h[1]);if(d3>1e-6)td=[(p[0]-h[0])/d3,(p[1]-h[1])/d3]}}
  td=td||[1,0];var eb=td;if(m){var mp=m.pos?walkPos(m):null,up=walkPos(L);if(mp){var d4=Math.hypot(mp[0]-up[0],mp[1]-up[1]);if(d4>1e-6)eb=[(mp[0]-up[0])/d4,(mp[1]-up[1])/d4]}}return{td:td,eb:eb}}
/* stealth: how close an enemy must come to spot a man who is creeping or lying in wait, by the cover he is in (yards) */
var HIDE_YD={p:14,w:8,b:12,t:6,c:18,m:20,s:22,f:25,o:35,r:40};
var HIDE_MAP={pwood:20,pforest:14,forest:7,water:30,woodland:10,swamp:12,cultivated:30,field:40,pasture:45,orchard:18,settle:30};
function stealthOf(u){return (u&&u.c&&stats(u.c).stealth)||0}
function hideRange(F,u){return (HIDE_YD[bfCell(F,u.x,u.y)]||35)*(u.hide?.6:1)*(1-stealthOf(u))}
function bfHidden(b){var fs=b.foes.filter(function(f){return f.alive});if(b.spring)b.units.forEach(function(u){u.hide=false;u.creep=false});
  b.groups.forEach(function(g){if(b.plays&&b.plays[g.uid])return;var mem=b.units.filter(function(u){return u.uid===g.uid&&u.alive&&!u.gone&&u.hide});if(mem.length&&mem.some(function(u){return fs.some(function(f){return bfD(u,f)<=20})}))mem.forEach(function(u){u.hide=false})});b.units.forEach(function(u){if(!u.alive||u.gone){u.hid=false;return}if(u.rev>0)u.rev--;if(!(u.hide||u.creep)||u.rev>0){u.hid=false;return}var R=hideRange(b.F,u);u.hid=!fs.some(function(f){return bfD(u,f)<=R})})}
function unitHidden(U){var L=U.live;if(!L||L.battle)return false;var moving=L.leg&&L.leg.pace==='creep';if(!moving&&!L.hide)return false;return true}
function mapHideYd(U){var L=U.live,p=walkPos(L),k=microKind(p[0],p[1]),best=1;U.hids.map(byId).filter(Boolean).forEach(function(h){best=Math.min(best,1-(stats(h).stealth||0))});return (HIDE_MAP[k]||35)*(L.hide?.6:1)*best}
