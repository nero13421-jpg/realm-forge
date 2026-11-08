/* ---------- joining the Chalcolithic realm (tutorial part 2) onto your permanent realm ----------
   The new realm moves as one block: it can be turned in 60 degree steps and set down anywhere it touches
   your realm's edge without overlapping it, as long as no settlement of one touches a settlement of the other. */
var HW=Math.sqrt(3)*SH;
function hexAtPx(x,y){var r=Math.round((y-SH)/(1.5*SH)),c=Math.round(x/HW-.5-((r&1)?.5:0));return[c,r]}
function rotPx(v,k){var a=-k*Math.PI/3,ca=Math.cos(a),sa=Math.sin(a);return[v[0]*ca-v[1]*sa,v[0]*sa+v[1]*ca]}
/* the cells a realm occupies: placed tiles and settlement hexes, as [c,r] in its own grid */
function realmCells(R){var o=[],seen={},W=R.bw;(R.grid||[]).forEach(function(g,k){if(g){o.push([k%W,Math.floor(k/W)]);seen[k]=1}});
  (R.setl||[]).forEach(function(x){[[x.c,x.r]].concat(x.c2!=null?[[x.c2,x.r2]]:[]).forEach(function(q){var k=q[1]*W+q[0];if(!seen[k]){seen[k]=1;o.push(q)}})});return o}
function setCells(R){var o=[];(R.setl||[]).forEach(function(x){o.push([x.c,x.r]);if(x.c2!=null)o.push([x.c2,x.r2])});return o}
function nb6(c,r){return HEXD[r&1].map(function(d){return[c+d[0],r+d[1]]})}
function mergeStart(){var pj;try{pj=localStorage.getItem(PKEY)}catch(e){}
  if(!pj){say('Your permanent realm could not be found, so there is nothing to join this one to. This realm becomes your realm.',true);S.tut=null;S.p1=1;S.p2=1;save();return render()}
  var P=JSON.parse(pj),C=JSON.parse(JSON.stringify(S)),cc=realmCells(C),sx=0,sy=0;
  cc.forEach(function(q){var p=center(q[0],q[1]);sx+=p[0];sy+=p[1]});var piv=cc.length?hexAtPx(sx/cc.length,sy/cc.length):[0,0];
  var pc=realmCells(P),best=null;
  /* start it to the east of your realm, in the first spot that works */
  var maxC=0;pc.forEach(function(q){maxC=Math.max(maxC,q[0])});
  UI.merge={P:P,C:C,piv:piv,rot:0,at:[maxC+4,Math.round((P.bh||7)/2)&~1]};
  for(var tries=0;tries<40&&!mergeCheck().ok;tries++){UI.merge.at[0]--}
  UI.tab='realm';render()}
/* where every cell of the new realm lands, in the permanent realm's grid */
function mergeMap(){var M=UI.merge,pp=center(M.piv[0],M.piv[1]),pa=center(M.at[0],M.at[1]);
  return function(c,r){var p=center(c,r),v=rotPx([p[0]-pp[0],p[1]-pp[1]],M.rot);return hexAtPx(pa[0]+v[0],pa[1]+v[1])}}
function mergePx(){var M=UI.merge,pp=center(M.piv[0],M.piv[1]),pa=center(M.at[0],M.at[1]);return function(p){var v=rotPx([p[0]-pp[0],p[1]-pp[1]],M.rot);return[pa[0]+v[0],pa[1]+v[1]]}}
function mergeCheck(){var M=UI.merge,f=mergeMap(),P=M.P,W=P.bw,pk={},ps={};
  realmCells(P).forEach(function(q){pk[q[0]+','+q[1]]=1});setCells(P).forEach(function(q){ps[q[0]+','+q[1]]=1});
  var cells=realmCells(M.C).map(function(q){return f(q[0],q[1])}),scs=setCells(M.C).map(function(q){return f(q[0],q[1])}),touch=false;
  for(var i=0;i<cells.length;i++){var q=cells[i];if(pk[q[0]+','+q[1]])return{ok:false,why:'It overlaps your realm at '+lab(Math.max(0,q[0]),Math.max(0,q[1]))+'.',cells:cells};if(nb6(q[0],q[1]).some(function(n){return pk[n[0]+','+n[1]]}))touch=true}
  for(i=0;i<scs.length;i++){var s=scs[i];if(nb6(s[0],s[1]).some(function(n){return ps[n[0]+','+n[1]]}))return{ok:false,why:'A settlement of the new realm would touch one of yours. Settlements cannot touch.',cells:cells}}
  if(!touch)return{ok:false,why:'It has to touch your realm\'s edge somewhere.',cells:cells};
  return{ok:true,why:'It fits here.',cells:cells}}
function mergeView(){var M=UI.merge,P=M.P,chk=mergeCheck(),f=mergeMap(),all=realmCells(P).concat(chk.cells),x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  all.forEach(function(q){var p=center(q[0],q[1]);x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])});
  var pad=SH*4;x0-=pad;y0-=pad;x1+=pad;y1+=pad;
  var tc=function(g){return g?(LEG_COL[g]||'#6a6050'):'#221d15'},o='<svg class="mergesvg" viewBox="'+x0.toFixed(0)+' '+y0.toFixed(0)+' '+(x1-x0).toFixed(0)+' '+(y1-y0).toFixed(0)+'" role="img" aria-label="Your realm and the new realm to be joined">';
  /* empty ground you can tap to move the new realm there */
  var a0=hexAtPx(x0,y0),a1=hexAtPx(x1,y1);for(var r=a0[1]-1;r<=a1[1]+1;r++)for(var c=a0[0]-1;c<=a1[0]+1;c++){o+='<polygon class="mgnd" data-act="mhex" data-c="'+c+'" data-r="'+r+'" points="'+hexPts(c,r)+'"/>'}
  var W=P.bw;(P.grid||[]).forEach(function(g,k){if(g)o+='<polygon class="mperm" style="fill:'+tc(g)+'" points="'+hexPts(k%W,Math.floor(k/W))+'"/>'});
  setCells(P).forEach(function(q){o+='<polygon class="mperm mset" points="'+hexPts(q[0],q[1])+'"/>'});
  var C=M.C,CW=C.bw;(C.grid||[]).forEach(function(g,k){if(!g)return;var q=f(k%CW,Math.floor(k/CW));o+='<polygon class="mnew'+(chk.ok?'':' bad')+'" style="fill:'+tc(g)+'" points="'+hexPts(q[0],q[1])+'"/>'});
  setCells(C).forEach(function(q0){var q=f(q0[0],q0[1]);o+='<polygon class="mnew mset'+(chk.ok?'':' bad')+'" points="'+hexPts(q[0],q[1])+'"/>'});
  o+='</svg>';
  var dirs=[['west','←',3],['north-west','↖',2],['north-east','↗',1],['east','→',0],['south-west','↙',4],['south-east','↘',5]];
  return '<section class="panel tut"><span class="label">Tutorial · Part 2 · Join your realms</span><h2>Set the new realm down</h2>'+
    '<p class="note">Your realm is solid; the new one is the lighter block. Tap the map to move the new realm there, use the arrows to nudge it, and turn it with the turn buttons. It has to touch your realm, cannot overlap it, and no settlement of one may touch a settlement of the other.</p>'+
    '<div class="mergewrap">'+o+'</div>'+
    '<div class="row">'+dirs.map(function(d){return '<button class="btn sm" data-act="mnudge" data-v="'+d[2]+'" aria-label="Move it '+d[0]+'">'+d[1]+'</button>'}).join('')+
    '<button class="btn sm" data-act="mturn" data-v="1">Turn ⟲</button><button class="btn sm" data-act="mturn" data-v="5">Turn ⟳</button></div>'+
    '<p class="msg'+(chk.ok?'':' bad')+'">'+esc(chk.why)+'</p>'+
    '<div class="row"><button class="btn go" data-act="mjoin"'+(chk.ok?'':' disabled')+'>Join here</button><button class="btn sm" data-act="mcancel">Back to the tutorial</button></div></section>'}
/* the join itself: one realm, both sets of tiles, settlements, people, gear and squads */
function mergeApply(){var M=UI.merge,chk=mergeCheck();if(!chk.ok){say(chk.why,true);return render()}
  var P=M.P,C=M.C,f=mergeMap(),fp=mergePx(),k6=M.rot%6,PW=P.bw,CW=C.bw;
  var cells=realmCells(P).concat(chk.cells),minC=0,minR=0,maxC=PW-1,maxR=(P.bh||7)-1;
  cells.forEach(function(q){minC=Math.min(minC,q[0]);minR=Math.min(minR,q[1]);maxC=Math.max(maxC,q[0]);maxR=Math.max(maxR,q[1])});
  var dc=-minC+1,dr=-minR+1;if(dr&1)dr++;/* shift by an even number of rows so the hex lattice lines up */
  var NW=maxC+dc+2,NH=maxR+dr+2,grid=[],hgt=[];for(var i=0;i<NW*NH;i++){grid.push(null);hgt.push(null)}
  var put=function(c,r,g,h){var k=(r+dr)*NW+(c+dc);grid[k]=g;hgt[k]=h};
  (P.grid||[]).forEach(function(g,k){var c=k%PW,r=Math.floor(k/PW);if(g||(P.hgt||[])[k])put(c,r,g,(P.hgt||[])[k]||null)});
  (C.grid||[]).forEach(function(g,k){var c=k%CW,r=Math.floor(k/CW),h=(C.hgt||[])[k];if(!g&&!h)return;var q=f(c,r);h=h?JSON.parse(JSON.stringify(h)):null;if(h&&h.d!=null)h.d=(h.d+k6)%6;put(q[0],q[1],g,h)});
  var px=function(p){return[Math.round((p[0]+HW*dc)*10)/10,Math.round((p[1]+SH*1.5*dr)*10)/10]};
  var N=JSON.parse(JSON.stringify(P));N.grid=grid;N.hgt=hgt;N.bw=NW;N.bh=NH;
  N.setl.forEach(function(s){s.c+=dc;s.r+=dr;if(s.c2!=null){s.c2+=dc;s.r2+=dr}});
  N.lines=(N.lines||[]).map(function(l){l.pts=l.pts.map(px);return l});
  /* new ids for everything from the Chalcolithic realm */
  var sid={},hid={},uid={},wid={};N.sid=N.sid||1;N.nid=N.nid||1;N.uid=N.uid||1;N.wid=N.wid||1;
  C.setl.forEach(function(s){sid[s.id]=N.sid++});C.cards.forEach(function(c){hid[c.id]=N.nid++});C.units.forEach(function(U){uid[U.id]=N.uid++});(C.lines||[]).forEach(function(l){if(l.id!=null)wid[l.id]=N.wid++});
  var ang=-60*k6,rv=function(v){return rotPx(v,k6)};
  C.setl.forEach(function(s0){var s=JSON.parse(JSON.stringify(s0)),q=f(s.c,s.r);s.id=sid[s0.id];s.c=q[0]+dc;s.r=q[1]+dr;if(s.c2!=null){var q2=f(s.c2,s.r2);s.c2=q2[0]+dc;s.r2=q2[1]+dr}
    if(s.lh)s.lh=s.lh.map(function(h){var v=rv([h[0],h[1]]);return[Math.round(v[0]*100)/100,Math.round(v[1]*100)/100,((h[2]+ang)%360+360)%360]});
    if(s.alt){var va=rv(s.alt);s.alt=[Math.round(va[0]*100)/100,Math.round(va[1]*100)/100]}
    if(s.altar&&s.altar.pr!=null)s.altar.pr=hid[s.altar.pr]||null;N.setl.push(s)});
  C.cards.forEach(function(c0){var c=JSON.parse(JSON.stringify(c0));c.id=hid[c0.id];if(c.at!=null)c.at=sid[c.at]!=null?sid[c.at]:null;if(c.eq!=null)c.eq=hid[c.eq]!=null?hid[c.eq]:null;N.cards.push(c)});
  C.units.forEach(function(U0){var U=JSON.parse(JSON.stringify(U0)),rm=function(a){return (a||[]).map(function(h){return hid[h]}).filter(function(h){return h!=null})};U.id=uid[U0.id];U.sid=sid[U.sid]!=null?sid[U.sid]:U.sid;U.hids=rm(U.hids);U.route=U.route==='defend'?'defend':null;delete U.live;
    (U.teams||[]).forEach(function(t){t.hids=rm(t.hids)});
    if(U.fm){var rk=function(o){var n={};Object.keys(o||{}).forEach(function(k){if(hid[k]!=null)n[hid[k]]=o[k]});return n};if(U.fm.mv)U.fm.mv.s=rk(U.fm.mv.s);(U.fm.ob||[]).forEach(function(b){b.s=rk(b.s);b.st=rk(b.st)})}
    N.units.push(U)});
  (C.lines||[]).forEach(function(l0){var l=JSON.parse(JSON.stringify(l0));l.pts=l.pts.map(function(p){return px(fp(p))});if(l.id!=null)l.id=wid[l0.id];if(l.w!=null)l.w=wid[l.w];if(l.a!=null)l.a=((l.a+ang)%360+360)%360;if(l.men)l.men=l.men.map(function(h){return hid[h]}).filter(function(h){return h!=null});N.lines.push(l)});
  N.prestige=(N.prestige||0)+(C.prestige||0);N.packs=(N.packs||0)+(C.packs||0);N.hn=Math.max(N.hn||0,C.hn||0);N.p1=1;N.p2=1;N.tut=null;
  S=N;COLS=NW;ROWS=NH;(S.lines||[]).forEach(function(l){l.hexes=lineHexes(l.pts)});
  try{localStorage.removeItem(PKEY)}catch(e){}
  UI.merge=null;UI.tab='realm';say('The realms are one. Everything from the Chalcolithic realm, its settlements, people, gear and squads, is now part of yours.');save();render()}
