/* ---------- playbook patrols: moves drawn on the map like a football play ----------
   A patrol is a list of moves. Each move belongs to the whole unit, one team, or one man; it is a line of points drawn
   anywhere on the map (not just tile to tile), walked at one pace, and ends in a T where a chain of orders runs in order.
   A move starts right after the move above it, at the start, or after any other move finishes. A team or a man whose move
   comes up breaks off as a detachment, walks its own line, and can rejoin the unit later. */
var PACE_VERB={creep:'Creeping',walk:'Walking',jog:'Jogging',sprint:'Sprinting'};
var PACE_STY={creep:['Creep','dotted line'],walk:['Walk','dashed line'],jog:['Jog','solid line'],sprint:['Sprint','zigzag line']};
function paceIcon(p,col){var c=col||'#f4ead2',ln=p==='sprint'?'<polyline points="1,6 5,2 9,10 13,2 17,10 21,2 25,6" fill="none" stroke="'+c+'" stroke-width="1.6"/>':'<line x1="1" y1="6" x2="25" y2="6" stroke="'+c+'" stroke-width="2" stroke-linecap="round"'+(p==='creep'?' stroke-dasharray=".1 4"':p==='walk'?' stroke-dasharray="5 3"':'')+'/>';return '<svg width="26" height="12" viewBox="0 0 26 12" aria-hidden="true">'+ln+'</svg>'}
function isPlay(R){return !!(R&&R.steps.some(function(s){return s.type==='leg'}))}
function routeSids(R){R.steps.forEach(function(s){if(!s.sid){R.nsid=(R.nsid||0)+1;s.sid=R.nsid}})}
function stepBySid(R,id){for(var i=0;i<R.steps.length;i++)if(R.steps[i].sid===id)return i;return -1}
function whoParent(w){return !w||w==='u'?null:w.charAt(0)==='m'?'t'+w.slice(1).split('.')[0]:'u'}
function whoUnder(w,anc){for(var x=w;x;x=whoParent(x))if(x===anc)return true;return false}
function rosterOf(U){return teamsOf(U).map(function(t){return{id:t.id,name:t.name,hids:t.hids.slice()}})}
function whoHids(ro,w){var o=[];if(w==='u'){ro.forEach(function(t){o=o.concat(t.hids)});return o}var p=w.slice(1).split('.'),t=ro[+p[0]-1];if(!t)return[];if(w.charAt(0)==='t')return t.hids.slice();var h=t.hids[+p[1]-1];return h?[h]:[]}
function whoName(ro,w){if(!w||w==='u')return 'Whole unit';var p=w.slice(1).split('.'),t=ro&&ro[+p[0]-1];if(w.charAt(0)==='t')return t?t.name:'Team '+p[0];var h=t&&byId(t.hids[+p[1]-1]);return h?hname(h):'Man '+p[1]+' of '+(t?t.name:'team '+p[0])}
function whoCol(w){return !w||w==='u'?'#e8b84a':TCOL[(+w.slice(1).split('.')[0]+1)%TCOL.length]}
function whoOpts(ro){var o=[['u','Whole unit']];(ro||[]).forEach(function(t,ti){o.push(['t'+(ti+1),'Team · '+t.name]);t.hids.forEach(function(h,hi){var m=byId(h);o.push(['m'+(ti+1)+'.'+(hi+1),'  Man · '+(m?hname(m):'?')+' ('+t.name+')'])})});return o}
function afterOk(R,i,done){var s=R.steps[i];if(s.after===0)return true;if(s.after==null){for(var j=i-1;j>=0;j--)if(R.steps[j].type==='leg')return !!done[R.steps[j].sid];return true}return !!done[s.after]}
var TORD={rest:'Short rest',lrest:'Long rest',wait:'Wait',form:'Form',hold:'Hold here',hide:'Lie in wait',home:'Return home',rejoin:'Rejoin the unit'};
function ordText(o,U){if(o.k==='wait')return 'Wait '+(o.m||1)+' min';if(o.k==='form')return U?'Form '+fmName(fmOf(U),o.f==='mv'?'mv':+o.f).toLowerCase():'Change formation';return TORD[o.k]||o.k}
/* micro-terrain: the painted ground under any point, not just the tile it falls in */
function microKind(x,y){var wx=x+(vn(x/17,y/17)-.5)*SH*.75+(vn(x/6,y/6)-.5)*SH*.18,wy=y+(vn(x/17+40,y/17+40)-.5)*SH*.75+(vn(x/6+9,y/6+9)-.5)*SH*.18,k=hexOf(wx,wy);if(k==null||!terrainKind(k))k=hexOf(x,y);return k==null?null:terrainKind(k)}
function nearRoad(x,y){var best=1e9;(S.lines||[]).forEach(function(l){if(l.type!=='road')return;for(var i=1;i<l.pts.length;i++){var a=l.pts[i-1],b=l.pts[i],vx=b[0]-a[0],vy=b[1]-a[1],q=vx*vx+vy*vy||1,t=Math.max(0,Math.min(1,((x-a[0])*vx+(y-a[1])*vy)/q));best=Math.min(best,Math.hypot(a[0]+vx*t-x,a[1]+vy*t-y))}});return best}
function microSpeed(x,y,U){if(U&&inFile(U)&&nearRoad(x,y)<1.6)return ROAD_SP;var k=microKind(x,y);if(!k||k==='settle')return 1;var v=TERR[k]?TERR[k].sp:1;return v>0?v:.25}
function legBlocked(a,b){var n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.2)),px=a[0],py=a[1];for(var j=1;j<=n;j++){var x=a[0]+(b[0]-a[0])*j/n,y=a[1]+(b[1]-a[1])*j/n;if(hexOf(x,y)==null)return 'off';var mk=microKind(x,y);if(mk==='pond'||mk==='water')return 'pond';if(Math.abs(gradeAt(px,py,x-px,y-py))>1)return 'cliff';px=x;py=y}return ''}
function legStream(a,b,U){var sg=streamSegs();if(!sg.length||!sg.some(function(z){return segX(a,b,z[0],z[1])}))return 0;var bs=bridgeSet();if(!bs[hexAtXY(a[0],a[1])]&&!bs[hexAtXY(b[0],b[1])])return STREAM_S;return inFile(U)?BRIDGE_FILE_S:BRIDGE_FILE_S+BRIDGE_REFORM_S}
/* running a play */
function planRoot(U){return U.det?unitById(U.det):U}
function planWho(U){return U.who||'u'}
function rosterAll(U){var ro=rosterOf(U),tm=U.live&&U.live.tmap;if(tm)S.units.forEach(function(d){if(d.det!==U.id)return;d.hids.forEach(function(h){var t=ro.filter(function(x){return x.id===tm[h]})[0];if(t&&t.hids.indexOf(h)<0)t.hids.push(h)})});return ro}
function planRestart(U){var L=U.live;if(!L)return;L.si=0;L.cur=-1;L.path=[];L.chase=null;L.cycle=S.match?S.match.clock:0;L.mode=U.route?'route':'idle';L.leg=null;L.oq=null;L.step=null;L.hold=false;L.hide=false;L.rejoin=false;L.pd=null;L.ps=null;L.status=U.route?'Setting out':'Waiting for orders';
  S.units.forEach(function(d){if(d.det===U.id&&d.live&&!d.live.battle){d.live.leg=null;d.live.oq=null;d.live.step=null;d.live.hold=false;d.live.hide=false;d.live.path=[];d.live.mode='route';d.live.rejoin=true}})}
function planInit(U){var L=U.live;var ro=rosterAll(U);L.pd={};L.ps={};L.roster=ro;L.fmSnap=U.fm?JSON.parse(JSON.stringify(U.fm)):null;L.tmap={};teamsOf(U).forEach(function(t){t.hids.forEach(function(h){L.tmap[h]=t.id})})}
function detOf(root,w){for(var i=0;i<S.units.length;i++){var d=S.units[i];if(d.det===root.id&&d.who===w)return d}return null}
function spawnDet(P,root,who,hs){var RL=root.live,D={id:S.uid++,name:root.name+' · '+whoName(RL.roster,who),sid:P.sid,hids:hs.slice(),route:root.route,det:root.id,who:who};
  D.teams=teamsOf(P).filter(function(t){return t.hids.some(function(h){return hs.indexOf(h)>=0})}).map(function(t){return{id:t.id,name:t.name,hids:t.hids.filter(function(h){return hs.indexOf(h)>=0})}});
  D.fm=JSON.parse(JSON.stringify(fmOf(P)));
  P.hids=P.hids.filter(function(h){return hs.indexOf(h)<0});teamsOf(P);P.live.ub=null;P.live.wf=unitWF(P);
  var PL=P.live;D.live={pos:PL.pos.slice(),xy:(PL.xy||walkPos(PL)).slice(),si:0,cur:-1,path:[],rem:HEX_YD,wait:0,busy:0,endur:PL.endur,cycle:PL.cycle,mode:'route',spotted:{},status:'Breaking off',pace:'walk',wf:1,fo:PL.fo};D.live.wf=unitWF(D);
  S.units.push(D);mlog(D.name+' breaks off from '+P.name+'.','dim');return D}
function mergeDet(D,T){var root=planRoot(D)||T,RL=root.live||{};
  D.hids.forEach(function(h){if(T.hids.indexOf(h)<0)T.hids.push(h)});var ts=teamsOf(T);
  D.hids.forEach(function(h){var tid=RL.tmap?RL.tmap[h]:null,t=null;ts.forEach(function(x){x.hids=x.hids.filter(function(y){return y!==h});if(x.id===tid)t=x});(t||ts[0]).hids.push(h)});
  if(T===root&&RL.fmSnap){var F=fmOf(T),SN=RL.fmSnap;D.hids.forEach(function(h){if(SN.mv&&SN.mv.s[h])F.mv.s[h]=SN.mv.s[h];F.ob.forEach(function(o){var so=(SN.ob||[]).filter(function(x){return x.id===o.id})[0];if(so&&so.s&&so.s[h])o.s[h]=so.s[h];if(so&&so.st&&so.st[h]){o.st=o.st||{};o.st[h]=so.st[h]}})})}
  S.units.forEach(function(x){if(x.det===D.id)x.det=root.id});
  S.units=S.units.filter(function(x){return x!==D});if(UI.mu===D.id)UI.mu=T.id;if(T.live){T.live.ub=null;T.live.wf=unitWF(T)}mlog(D.name+' rejoins '+T.name+'.','dim')}
function mergeHome(root){S.units.filter(function(d){return d.det===root.id&&d.live&&!d.live.battle&&atHome(d)}).forEach(function(d){mergeDet(d,root)})}
function legStart(U,R,i){var s=R.steps[i],L=U.live;L.step=i;L.hide=false;L.leg={pts:s.pts.map(function(p){return p.slice()}),i:0,pace:s.pace};L.pace=s.pace;L.oq=null;L.hold=false;L.rejoin=false;L.status=PACE_VERB[s.pace]+' to the end of move '+(i+1)}
function legMove(U,R){var L=U.live,G=L.leg,UB=(L.ub&&L.ub.sp)?L.ub:(L.ub=unitPace(U)),pace=G.pace,pp=(L.endur<=0&&pace!=='creep')?'creep':pace;
  var t0=G.pts[G.i]||L.xy,gd=gradeAt(L.xy[0],L.xy[1],t0[0]-L.xy[0],t0[1]-L.xy[1]),GM=gradeMul(gd),left=gradeSpeed(UB.sp[pp]*L.wf*microSpeed(L.xy[0],L.xy[1],U),gd)*YU,from=L.xy.slice();L.endur=Math.max(0,L.endur-(GM.mode==='hard'||GM.mode==='climb'?UB.dr.sprint:GM.mode==='scramble'?UB.dr.jog:UB.dr[pp]));L.gm=GM.mode;
  while(left>0&&G.i<G.pts.length){var t=G.pts[G.i],d=Math.hypot(t[0]-L.xy[0],t[1]-L.xy[1]);if(d<=left){L.xy=[t[0],t[1]];left-=d;G.i++}else{L.xy=[L.xy[0]+(t[0]-L.xy[0])*left/d,L.xy[1]+(t[1]-L.xy[1])*left/d];left=0}}
  var fx=L.xy[0]-from[0],fy=L.xy[1]-from[1];if(Math.hypot(fx,fy)>1e-6)L.face=[fx,fy];
  var w=legStream(from,L.xy,U);if(w){L.wait=w;L.status=w===STREAM_S?'Wading the stream':inFile(U)?'Crossing the footbridge in file':'Filing over the footbridge, then re-forming'}
  var k=hexAtXY(L.xy[0],L.xy[1]),np=[k%COLS,Math.floor(k/COLS)];if(np[0]!==L.pos[0]||np[1]!==L.pos[1]){L.pos=np;var bb=battleAt(L.pos);if(bb)return joinBattle(bb,U,false)}
  if(G.i>=G.pts.length){L.leg=null;var st=R.steps[L.step];L.oq=((st&&st.ord)||[]).slice();if(!w)L.status='At the end of move '+(L.step+1)}else if(!w)L.status=(L.gm?GMODE[L.gm].charAt(0).toUpperCase()+GMODE[L.gm].slice(1):PACE_VERB[G.pace])+' to the end of move '+(L.step+1)
}
function stepDone(U,R){var L=U.live,root=planRoot(U);if(L.step!=null&&root&&root.live&&root.live.pd&&R.steps[L.step])root.live.pd[R.steps[L.step].sid]=1;L.step=null}
function orderNext(U,R){var L=U.live,o=L.oq.shift();
  if(o.k==='rest'){L.wait=10;L.resting='short';L.status='Short rest'}
  else if(o.k==='lrest'){L.wait=60;L.resting='long';L.status='Long rest'}
  else if(o.k==='wait'){L.wait=(o.m||1)*60;L.status='Waiting '+(o.m||1)+' min'}
  else if(o.k==='form'){L.fo=o.f==='mv'?'mv':+o.f;L.status='In '+fmName(fmOf(U),L.fo).toLowerCase()}
  else if(o.k==='hold'){L.hold=true;L.status='Holding at '+lab(L.pos[0],L.pos[1])}
  else if(o.k==='hide'){L.hold=true;L.hide=true;L.status='Lying in wait at '+lab(L.pos[0],L.pos[1])}
  else if(o.k==='home'){L.oq=[];stepDone(U,R);L.xy=null;goHome(U,'Returning home','route')}
  else if(o.k==='rejoin'){L.oq=[];stepDone(U,R);if(U.det)L.rejoin=true}
}
function rejoinTarget(U){var root=planRoot(U);if(!root)return null;for(var w=whoParent(planWho(U));w;w=whoParent(w)){if(w==='u')return root;var d=detOf(root,w);if(d&&d!==U)return d}return root}
function rejoinStep(U){var L=U.live,T=rejoinTarget(U);if(!T||!T.live||!T.hids.length){L.rejoin=false;return}var tp=T.live.xy||walkPos(T.live),d=Math.hypot(tp[0]-L.xy[0],tp[1]-L.xy[1]);
  if(T.live.battle){var tb=battleById(T.live.battle);if(tb&&L.pos[0]===tb.pos[0]&&L.pos[1]===tb.pos[1]){L.rejoin=false;return joinBattle(tb,U,false)}}
  if(d<.6){if(!T.live.battle)return mergeDet(U,T)}
  var UB=(L.ub&&L.ub.sp)?L.ub:(L.ub=unitPace(U)),step=UB.sp.jog*L.wf*microSpeed(L.xy[0],L.xy[1],U)*YU;L.endur=Math.max(0,L.endur-UB.dr.jog);
  if(d<=step)L.xy=tp.slice();else L.xy=[L.xy[0]+(tp[0]-L.xy[0])*step/d,L.xy[1]+(tp[1]-L.xy[1])*step/d];L.face=[tp[0]-L.xy[0],tp[1]-L.xy[1]];
  var k=hexAtXY(L.xy[0],L.xy[1]);L.pos=[k%COLS,Math.floor(k/COLS)];L.status='Rejoining '+T.name}
function planStep(U){
  var L=U.live,root=planRoot(U),R=routeById((root||U).route);if(!R||!root||!root.live){L.mode='idle';return}
  routeSids(R);var RL=root.live;if(!RL.pd)planInit(root);if(!L.xy)L.xy=center(L.pos[0],L.pos[1]);var me=planWho(U);
  if(L.rejoin)return rejoinStep(U);
  /* teams and men whose move has come up break off here, unless a detachment nearer to them carries them */
  R.steps.forEach(function(s,i){if(s.type!=='leg'||RL.ps[s.sid]||s.who===me||!whoUnder(s.who,me)||!afterOk(R,i,RL.pd))return;
    for(var anc=whoParent(s.who);anc&&anc!==me;anc=whoParent(anc))if(detOf(root,anc))return;
    var ex=detOf(root,s.who);if(ex&&ex!==U){if(ex.live&&ex.live.battle)return;RL.ps[s.sid]=1;return legStart(ex,R,i)}
    var hs=whoHids(RL.roster,s.who).filter(function(h){return U.hids.indexOf(h)>=0});
    if(!hs.length){var any=whoHids(RL.roster,s.who).some(function(h){return S.units.some(function(x){return x.hids.indexOf(h)>=0})});if(!any){RL.ps[s.sid]=1;RL.pd[s.sid]=1;mlog('Move '+(i+1)+' of '+R.name+' has nobody left to make it, so it is skipped.','dim')}return}
    RL.ps[s.sid]=1;var D=spawnDet(U,root,s.who,hs);legStart(D,R,i)});
  if(!U.hids.length){R.steps.forEach(function(s,i){if(s.type==='leg'&&s.who===me&&!RL.ps[s.sid]&&afterOk(R,i,RL.pd)){RL.ps[s.sid]=1;RL.pd[s.sid]=1}});return}
  if(L.leg)return legMove(U,R);
  if(L.oq&&L.oq.length)return orderNext(U,R);
  if(L.step!=null)stepDone(U,R);
  for(var i=0;i<R.steps.length;i++){var s=R.steps[i];if(s.type!=='leg'||s.who!==me||RL.ps[s.sid])continue;
    if(!afterOk(R,i,RL.pd)){if(!L.hold)L.status='Waiting to start move '+(i+1);return}RL.ps[s.sid]=1;return legStart(U,R,i)}
  if(U.det){if(!L.hold)L.status='Done · holding at '+lab(L.pos[0],L.pos[1]);return}
  var all=R.steps.every(function(s){return s.type!=='leg'||RL.pd[s.sid]}),dets=S.units.some(function(d){return d.det===U.id});
  if(R.repeat){if(!atHome(U)){L.xy=null;goHome(U,'Returning home','route');return}mergeHome(U);if(S.units.some(function(d){return d.det===U.id})||!all){L.status='Home · waiting for the others';return}
    var nt=L.cycle+R.repeat*60;if(S.match.clock>=nt){planInit(U);L.cycle=S.match.clock;mlog(U.name+' sets out on '+R.name+' again.','dim')}else L.status='Home · next patrol at '+mmss(nt);return}
  if(!L.hold)L.status=all&&!dets?'Play finished':'Waiting for the others';
}
/* drawing a play */
function zig(pts,amp,per){if(pts.length<2)return pts;var o=[pts[0]];for(var i=1;i<pts.length;i++){var a=pts[i-1],b=pts[i],d=Math.hypot(b[0]-a[0],b[1]-a[1])||1e-6,n=Math.max(2,Math.round(d/per)),ux=(b[0]-a[0])/d,uy=(b[1]-a[1])/d;for(var j=1;j<n;j++){var t=j/n,q=(j%2?1:-1)*amp;o.push([a[0]+(b[0]-a[0])*t-uy*q,a[1]+(b[1]-a[1])*t+ux*q])}o.push(b)}return o}
function plLine(pts,pace,col,sc,cls){var P=pace==='sprint'?zig(pts,3.5*sc,8*sc):pts;return '<polyline class="pl '+pace+(cls?' '+cls:'')+'" stroke="'+col+'" points="'+P.map(function(p){return p[0].toFixed(2)+','+p[1].toFixed(2)}).join(' ')+'"/>'}
function tMark(a,b,col,sc,i,on,act){var dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d,px=-uy*8*sc,py=ux*8*sc,cx=b[0]+ux*13*sc,cy=b[1]+uy*13*sc;
  return '<g class="tmk'+(on?' on':'')+'" data-act="'+(act||'tsel')+'" data-i="'+i+'"><title>Move '+(i+1)+': tap for its orders</title><line x1="'+(b[0]-px).toFixed(2)+'" y1="'+(b[1]-py).toFixed(2)+'" x2="'+(b[0]+px).toFixed(2)+'" y2="'+(b[1]+py).toFixed(2)+'" stroke="'+col+'"/><circle cx="'+cx.toFixed(2)+'" cy="'+cy.toFixed(2)+'" r="'+(7*sc).toFixed(2)+'" fill="#17140f" stroke="'+col+'"/><text x="'+cx.toFixed(2)+'" y="'+(cy+3*sc).toFixed(2)+'" style="font-size:'+(8.5*sc).toFixed(2)+'px" fill="'+col+'">'+(i+1)+'</text></g>'}
function playGeo(R,home){var last={},end={},o=[];routeSids(R);
  R.steps.forEach(function(s,i){if(s.type!=='leg'){o.push(null);return}var st=last[s.who]||null;
    if(!st){var ai=-1;if(s.after==null){for(var j=i-1;j>=0;j--)if(R.steps[j].type==='leg'){ai=j;break}}else if(s.after)ai=stepBySid(R,s.after);var A=ai>=0?R.steps[ai]:null;
      if(A&&end[A.sid]&&whoUnder(s.who,A.who))st=end[A.sid];else for(var w=whoParent(s.who);w&&!st;w=whoParent(w))st=last[w]||null;if(!st)st=typeof home==='function'?home(s.who):home}
    var pts=[st].concat(s.pts);last[s.who]=pts[pts.length-1];if(s.sid)end[s.sid]=last[s.who];o.push(pts)});
  return o}
function pendStart(R,home){var P=UI.leg;if(!P)return typeof home==='function'?home('u'):home;var T={steps:R.steps.concat([{type:'leg',who:P.who,pts:[],after:P.after,sid:-1}])},G=playGeo(T,home);routeSids(R);return G[G.length-1][0]}
function playSvg(R,home,key){var sc=(UI.pz&&UI.pz[key]?UI.pz[key].s:.3),G=playGeo(R,home),o='<g class="play">';
  R.steps.forEach(function(s,i){var pts=G[i];if(!pts||pts.length<2)return;var col=whoCol(s.who);o+=plLine(pts,s.pace,col,sc);o+=tMark(pts[pts.length-2],pts[pts.length-1],col,sc,i,UI.tsel===i)});
  var P=UI.leg;if(P&&P.rid===R.id){var pts=[pendStart(R,home)].concat(P.pts),col=whoCol(P.who);if(pts.length>1)o+=plLine(pts,P.pace,col,sc,'pend');pts.forEach(function(p,j){o+='<circle class="lpt" cx="'+p[0].toFixed(2)+'" cy="'+p[1].toFixed(2)+'" r="'+((j?3:4.5)*sc).toFixed(2)+'"/>'})}
  return o+'</g>'}
/* the planner's bar and the T menu, both on the map itself */
function planUnit(R){var U=unitById(UI.Ru);if(!U||!U.hids.length||U.det){U=S.units.filter(function(u){return u.route===R.id&&u.hids.length&&!u.det})[0]||unitById(UI.mu)||S.units.filter(function(u){return u.hids.length&&!u.det})[0]||null;if(U&&U.det)U=planRoot(U)}if(U)UI.Ru=U.id;return U}
function planRoster(U){return U?(U.live&&U.live.roster&&!U.det?U.live.roster:rosterOf(U)):[]}
function planHome(R,U){var st=(U&&setById(U.sid))||setById(UI.Rfrom)||S.setl[0];return st?center(st.c,st.r):[0,0]}
function planBar(R){var U=planUnit(R),ro=planRoster(U),P=UI.leg&&UI.leg.rid===R.id?UI.leg:null,w=P?P.who:(UI.lwho||'u'),pc=P?P.pace:(UI.Rpace||'walk');
  return '<div class="pzbar" role="toolbar" aria-label="Draw a move"><b>'+esc(R.name)+'</b>'+(U?'<span class="dim">for '+esc(U.name)+'</span>':'')+
    '<select data-lwho="1" aria-label="Who moves">'+whoOpts(ro).map(function(o){return '<option value="'+o[0]+'"'+(o[0]===w?' selected':'')+'>'+esc(o[1])+'</option>'}).join('')+'</select>'+
    Object.keys(PACE_STY).map(function(k){return '<button class="btn sm pc'+(pc===k?' on':'')+'" data-act="lpace" data-p="'+k+'" title="'+PACE_STY[k][0]+': '+PACE_STY[k][1]+'">'+paceIcon(k,whoCol(w))+PACE_STY[k][0]+'</button>'}).join('')+
    (P?'<span class="mono">'+P.pts.length+' pt</span><button class="btn sm go" data-act="lfin"'+(P.pts.length?'':' disabled')+'>End move · T</button><button class="btn sm" data-act="lundo"'+(P.pts.length?'':' disabled')+'>Undo</button><button class="btn sm" data-act="lcan">Cancel</button>':'<button class="btn sm go" data-act="lgo">Draw a move</button>')+
    (U?'<button class="btn sm go" data-act="pfin" style="margin-left:auto">Finish plan · '+esc(U.name)+(S.match?' sets out':' takes it')+'</button>':'')+'</div>'}
function tPopHtml(R,i){var s=R.steps[i];if(!s||s.type!=='leg')return '';var U=planUnit(R),ro=planRoster(U),G=playGeo(R,planHome(R,U)),pts=G[i],e=pts[pts.length-1],FM=U?fmOf(U):null;
  var aft='<select data-tafter="'+i+'" aria-label="When this move starts"><option value=""'+(s.after==null?' selected':'')+'>Right after the move above</option><option value="0"'+(s.after===0?' selected':'')+'>At the start</option>'+R.steps.map(function(x,j){return x.type==='leg'&&j!==i?'<option value="'+x.sid+'"'+(s.after===x.sid?' selected':'')+'>When move '+(j+1)+' is done</option>':''}).join('')+'</select>';
  var b=function(k,lab,ex){return '<button class="btn sm" data-act="tord" data-k="'+k+'"'+(ex||'')+'>'+lab+'</button>'};
  return '<div class="pzpop tpop" data-x="'+e[0].toFixed(2)+'" data-y="'+e[1].toFixed(2)+'" role="dialog" aria-label="Orders at the end of move '+(i+1)+'"><div class="pzhd"><b style="color:'+whoCol(s.who)+'">Move '+(i+1)+' · '+esc(whoName(ro,s.who))+'</b><button class="btn sm" data-act="tselx" aria-label="Close">×</button></div>'+
    '<div class="tgrp"><span class="label">Pace</span>'+Object.keys(PACE_STY).map(function(k){return '<button class="btn sm pc'+(s.pace===k?' on':'')+'" data-act="tpace" data-p="'+k+'">'+paceIcon(k,whoCol(s.who))+PACE_STY[k][0]+'</button>'}).join('')+'</div>'+
    '<div class="tgrp"><span class="label">Starts</span>'+aft+'</div>'+
    '<p class="label" style="margin:0">At the T, in order</p><div class="ochips">'+((s.ord||[]).map(function(o,j){return '<span class="ochip">'+(j+1)+'. '+esc(ordText(o,U))+'<button class="btn sm" data-act="tordrm" data-j="'+j+'" aria-label="Remove">×</button></span>'}).join('')||'<span class="note">Nothing yet: they go straight on to their next move.</span>')+'</div>'+
    '<div class="tgrp"><span class="label">Rest</span>'+b('rest','Short rest')+b('lrest','Long rest')+b('wait','Wait 1 min',' data-m="1"')+b('wait','5 min',' data-m="5"')+b('wait','10 min',' data-m="10"')+'</div>'+
    (FM?'<div class="tgrp"><span class="label">Formation</span>'+b('form','Order of movement',' data-f="mv"')+FM.ob.map(function(o){return b('form',esc(o.name),' data-f="'+o.id+'"')}).join('')+'</div>':'')+
    '<div class="tgrp"><span class="label">Then</span>'+b('hold','Hold here')+b('hide','Lie in wait')+b('home','Return home')+(s.who!=='u'?b('rejoin','Rejoin the unit'):'')+'</div>'+
    '<div class="row"><button class="btn sm go" data-act="tselx">Done</button><button class="btn sm" data-act="tdel">Delete move</button></div></div>'}
function planOver(R){if(!R)return '';return UI.tsel!=null&&!UI.leg?tPopHtml(R,UI.tsel):''}
function legAddPt(p){var P=UI.leg,R=routeById(P.rid);if(!R)return;var U=planUnit(R),prev=P.pts.length?P.pts[P.pts.length-1]:pendStart(R,planHome(R,U)),bl=legBlocked(prev,p);
  if(bl){say(bl==='pond'?'Deep water is in the way. Tap a point beside it to go around.':bl==='cliff'?'Too steep: past 100% only a jump or a climb gets a man up, and nobody has those skills yet. Go around, or find a gentler part of the bank.':'That is off the map.',true);return render()}P.pts.push([Math.round(p[0]*100)/100,Math.round(p[1]*100)/100]);say('');render()}
