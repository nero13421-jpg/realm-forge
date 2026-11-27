/* ---------- live match ---------- */
var LIVE=null,LIVE_ACC=0,LIVE_LAST=0,LIVE_SAVE=0,LIVE_CACHE={};
function liveStart(){if(LIVE||!S.match)return;LIVE_LAST=performance.now();LIVE=setInterval(liveTick,100)}
function liveStop(){if(LIVE){clearInterval(LIVE);LIVE=null}}
function liveTick(){
  var M=S.match;if(!M){liveStop();return}
  var now=performance.now(),dt=Math.min(.5,(now-LIVE_LAST)/1000);LIVE_LAST=now;
  if(M.speed>0){LIVE_ACC+=dt*M.speed;var n=Math.floor(LIVE_ACC);if(n>0){LIVE_ACC-=n;advance(n);checkEnd();if(M.over){liveStop();endMatch(M.over);return}}}
  liveDraw();
  if(now-LIVE_SAVE>4000){LIVE_SAVE=now;save()}
}
/* a squad that runs out of endurance slows to a crawl: say so, pause, and ask what to do */
function spent(U){var M=S.match;if(!M)return;M.tired=M.tired||[];if(M.tired.indexOf(U.id)<0)M.tired.push(U.id);var L=U.live,q=L&&L.pos?' at '+lab(L.pos[0],L.pos[1]):'';mlog(U.name+' is spent'+q+': the men slow to a crawl. Give them a rest, or press on at a crawl.','bad');autoPause()}
function tiredHtml(){var M=S.match;if(!M||!M.tired||!M.tired.length)return '';M.tired=M.tired.filter(function(id){var U=unitById(id);return U&&U.hids.length&&U.live&&U.live.endur<=0&&!U.live.resting});if(!M.tired.length)return '';
  return M.tired.map(function(id){var U=unitById(id),L=U.live,q=L.pos?lab(L.pos[0],L.pos[1]):'';return '<div class="tired" role="alert"><b>'+esc(U.name)+' is spent'+(q?' at '+q:'')+'.</b> Endurance 0: the men crawl at a third of walking pace and cannot jog or sprint.<div class="row"><button class="btn go sm" data-act="tired" data-u="'+U.id+'" data-v="short">Short rest · 10 s, back to 50%</button><button class="btn sm" data-act="tired" data-u="'+U.id+'" data-v="long">Long rest · 1 min, back to 100%</button><button class="btn sm" data-act="tired" data-u="'+U.id+'" data-v="go">Press on</button></div></div>'}).join('')}
function autoPause(){var M=S.match;if(M&&M.autoPause&&M.speed>0){M.speed=0;M.halt=true}UI.needRender=true}
function unitWF(U){var w=1;U.hids.map(byId).filter(Boolean).forEach(function(h){var t=0;S.cards.forEach(function(c){if(c.eq===h.id)t+=wtOf(c.key)});if(t>25)w=Math.min(w,25/t)});return w}
function unitPace(U){var hs=U.hids.map(byId).filter(Boolean),o={sp:{},dr:{},rec:1};['walk','jog','sprint','creep'].forEach(function(k){o.sp[k]=hs.length?Math.min.apply(null,hs.map(function(h){return stats(h).sp[k]})):PACE[k];o.dr[k]=hs.length?Math.max.apply(null,hs.map(function(h){return stats(h).dr[k]})):DRAIN[k]});o.rec=hs.length?Math.min.apply(null,hs.map(function(h){return stats(h).rec})):1;return o}
function initLive(U){var st=setById(U.sid);if(!st)return;U.live={pos:[st.c,st.r],si:0,cur:-1,path:[],rem:HEX_YD,wait:0,busy:0,endur:100,cycle:S.match?S.match.clock:0,mode:U.route?'route':'idle',spotted:{},status:U.route?'Setting out':'At home',pace:'walk',wf:unitWF(U)}}
function homeOf(U){var st=setById(U.sid);return st?[st.c,st.r]:null}
function atHome(U){var L=U.live,st=setById(U.sid);return !L||(!L.path.length&&st&&setAt(L.pos[0],L.pos[1])===st)}
function awaySet(){var o={};S.units.forEach(function(U){if(!atHome(U)||(U.live&&U.live.battle))U.hids.forEach(function(id){o[id]=1})});return o}
function goHome(U,status,mode){var L=U.live,h=homeOf(U);if(!h)return;L.path=findPath(L.pos,h,uRoads(U))||[];L.rem=HEX_YD;L.status=status;L.mode=mode||'home';L.chase=null}
function resume(U){var L=U.live;if(L.mode==='raze'){var zc=campByKey(L.target);if(zc&&!zc.razed){L.path=[];L.status='Back to the camp';return}}if(isDefend(U)){L.chase=null;goHome(U,'Returning home');return}L.chase=null;L.path=[];L.mode=U.route?'route':'idle';if(L.cur>=0)L.si=L.cur;L.status=U.route?'Back on patrol':'At rest'}
function campByKey(k){var M=S.match;if(!M||k==null)return null;for(var i=0;i<M.camps.length;i++)if(String(M.camps[i].key)===String(k))return M.camps[i];return null}
function mobWord(m,pl,cap){var w=m.type==='dogman'?'dog man':m.type==='moon'?'moon eyes':m.type;if((m.type==='pigger'||m.type==='dogman'||m.type==='watcher')&&pl&&m.mobs&&m.mobs.length<2)pl=0;if(pl)w=m.type==='dogman'?'dog men':m.type==='moon'?w:w+'s';return cap?w.charAt(0).toUpperCase()+w.slice(1):w}
function lairPos(m){return[m.lair%COLS,Math.floor(m.lair/COLS)]}
function enemyNear(pos,U){
  var k=ix(pos[0],pos[1]),r=U?Math.max(1,Math.floor(Math.min.apply(null,U.hids.map(byId).filter(Boolean).map(function(h){return stats(h).sight}).concat([1e9]))/HEX_YD)):1,nb=nbrs(pos[0],pos[1]),best=null;
  if(r>=2)nbrs(pos[0],pos[1]).forEach(function(p){nbrs(p[0],p[1]).forEach(function(q){if(!nb.some(function(z){return z[0]===q[0]&&z[1]===q[1]}))nb.push(q)})});nb=nb.map(function(p){return ix(p[0],p[1])});
  S.match.camps.forEach(function(m){
    if(!m.mobs.length||(best&&best.inside))return;
    if(m.roam){if(!m.pos)return;var mk=ix(m.pos[0],m.pos[1]);if(mk===k)best={camp:m,inside:true,at:m.pos};else if(!best&&nb.indexOf(mk)>=0)best={camp:m,inside:false,at:m.pos}}
    else{if(m.hexes.indexOf(k)>=0)best={camp:m,inside:true,at:lairPos(m)};else if(!best&&nb.some(function(n){return m.hexes.indexOf(n)>=0}))best={camp:m,inside:false,at:lairPos(m)}}
  });
  return best;
}
function nextStep(U){
  var L=U.live,R=routeById(U.route),M=S.match;
  if(!R){L.mode='idle';L.status=atHome(U)?'At home':'Waiting for orders';return}
  if(L.si>=R.steps.length){
    if(R.repeat){
      if(!atHome(U)){goHome(U,'Returning home','route');return}
      var nt=L.cycle+R.repeat*60;
      if(M.clock>=nt){L.si=0;L.cycle=M.clock;mlog(U.name+' sets out on '+R.name+' again.','dim')}
      else{L.status='Home · next patrol at '+mmss(nt);return}
    }else{L.mode='idle';L.status='Patrol finished';return}
  }
  L.cur=L.si;var s=R.steps[L.si++];
  if(s.type==='march'){
    var p=findPath(L.pos,s.to,uRoads(U));if(p===null){mlog(U.name+' finds no route to '+lab(s.to[0],s.to[1])+' and skips that march.','bad');return}
    L.path=p;L.rem=HEX_YD;L.pace=s.pace;L.status='Marching to '+lab(s.to[0],s.to[1]);
    if(p.length)crossWait(U,ix(L.pos[0],L.pos[1]),ix(p[0][0],p[0][1]));
  }else if(s.type==='wait'){L.wait=s.secs;L.status='Waiting at '+lab(L.pos[0],L.pos[1])}
  else if(s.type==='rest'){L.wait=10;L.resting='short';L.status='Short rest'}
  else if(s.type==='lrest'){L.wait=60;L.resting='long';L.status='Long rest'}
  else goHome(U,'Returning home','route');
}
function crossWait(U,k1,k2){var L=U.live,w=streamWait(k1,k2,U);if(!w)return;L.wait=w;L.status=w===STREAM_S?'Wading the stream':inFile(U)?'Crossing the footbridge in file':'Filing over the footbridge, then re-forming'}
function unitStep(U){
  var M=S.match;if(!U.hids.length)return;
  if(!U.live)initLive(U);var L=U.live;if(!L||L.battle)return;
  if(L.busy>0){L.busy--;if(!L.busy){if(L.fled)goHome(U,'Falling back home');else resume(U)}return}
  if(L.raze){var rzm=campByKey(L.raze.key);if(!rzm||rzm.razed||(rzm.mobs.length&&!rzm.roam)){L.raze=null}else{L.raze.t--;L.status='Burning the camp · '+L.raze.t+' s';if(L.raze.t<=0){L.raze=null;razeCamp(rzm,U);if(L.mode==='raze')L.mode='idle';resume(U)}return}}
  if(L.wait>0){L.wait--;if(L.resting&&!L.wait){var rk=(L.ub&&L.ub.rec)||1;L.endur=Math.max(L.endur,Math.min(100,(L.resting==='long'?100:50)*rk));L.resting=false}return}
  if(isDefend(U)&&L.mode!=='chase'&&L.mode!=='raze'){
    var th=defendThreat(U);
    if(th){L.mode='chase';L.chase=th.key;L.path=[];L.status='Moving to defend';mlog(U.name+' moves to meet the '+mobWord(th,1)+' at '+lab(th.pos[0],th.pos[1])+'.','bad');autoPause();if(M.halt)return}
    else if(!atHome(U)){if(L.mode!=='home')goHome(U,'Returning home')}
    else{L.mode='idle';L.path=[];var hs0=setById(U.sid);L.status='Defending the '+(hs0?SETT[hs0.type].n.toLowerCase():'settlement');return}
  }
  var en=enemyNear(L.pos,U);
  if(en&&en.inside)return liveBattle(U,en.camp);
  var hc=campHere(L.pos);if(hc){L.raze={key:hc.key,t:RAZE_S};L.path=[];L.status='Burning the camp';mlog(U.name+' sets the '+mobWord(hc)+' camp at '+lab(L.pos[0],L.pos[1])+' alight.','dim');return}
  if(en&&L.mode!=='home'&&L.mode!=='chase'&&L.mode!=='reinforce'&&L.mode!=='raze'&&!isDefend(U)&&!(atHome(U)&&!U.route&&setWalled(setById(U.sid)))){
    var sk=en.camp.key;
    if(!L.spotted[sk]||M.clock-L.spotted[sk]>600){
      L.spotted[sk]=M.clock;var e=engOf(U);
      mlog(U.name+' spots '+mobDesc(en.camp)+' at '+lab(en.at[0],en.at[1])+'.','bad');
      if(e.spot==='engage'){L.mode='chase';L.chase=sk;L.path=[];L.status='Closing in'}
      else if(e.spot==='hold'){L.mode='hold';L.spotHold=true;L.status='Holding position'}
      else if(e.spot==='withdraw')goHome(U,'Withdrawing home');
      autoPause();if(M.halt)return;
    }
  }
  if(L.mode==='reinforce'){
    var TU=unitById(L.target);if(!TU||!TU.live||!TU.hids.length||TU===U){L.mode='idle';L.status='No one to reinforce';return}
    var tp=TU.live.pos,tk2=ix(tp[0],tp[1]);
    if(L.pos[0]===tp[0]&&L.pos[1]===tp[1]){var bb2=battleAt(L.pos);if(bb2)return joinBattle(bb2,U,false);L.path=[];L.status='With '+TU.name;return}
    if(!L.path.length||L.tk!==tk2){L.path=findPath(L.pos,tp,uRoads(U))||[];L.tk=tk2;L.rem=HEX_YD;if(!L.path.length){L.status='No route to '+TU.name;return}}
    L.status='Reinforcing '+TU.name;
  }
  if(L.mode==='raze'){var zc=campByKey(L.target);if(!zc||zc.razed){L.mode='idle';resume(U);return}var zt=lairPos(zc),zk=ix(zt[0],zt[1]),there=L.pos[0]===zt[0]&&L.pos[1]===zt[1];if(!there&&(!L.path.length||L.tk!==zk)){L.path=findPath(L.pos,zt,uRoads(U))||[];L.tk=zk;L.rem=HEX_YD;if(!L.path.length){L.mode='idle';L.status='No route to the camp';return}}L.status='Marching to burn the camp'}
  if(L.mode==='hold'){if(L.spotHold&&!en){L.spotHold=false;resume(U)}return}
  if(L.mode==='idle')return;
  if(L.mode==='chase'){
    var cm=campByKey(L.chase);if(!cm||!cm.mobs.length){resume(U);return}
    if(isDefend(U)&&cm.roam&&cm.pos&&!defendZone(U)[ix(cm.pos[0],cm.pos[1])]){mlog(U.name+' lets the '+mobWord(cm,1)+' go and heads home.','dim');goHome(U,'Returning home');return}
    var tg=cm.roam?cm.pos:lairPos(cm),tk=ix(tg[0],tg[1]);
    if(!L.path.length||L.tk!==tk){L.path=findPath(L.pos,tg,uRoads(U))||[];L.tk=tk;L.rem=HEX_YD;if(!L.path.length){resume(U);return}}
  }
  if(L.mode==='route'&&!L.path.length&&isPlay(routeById(U.route)))return planStep(U);
  if(!L.path.length){
    if(L.mode==='home'){var R=routeById(U.route);L.mode=R?'route':'idle';L.si=R?R.steps.length:0;L.status='At home';if(R&&!R.repeat&&!isPlay(R))L.mode='idle';if(U.det){var RT=planRoot(U);if(RT&&atHome(RT)&&!(RT.live&&RT.live.battle))mergeDet(U,RT)}else mergeHome(U);return}
    if(L.mode==='route')nextStep(U);
    return;
  }
  L.xy=null;var nx=L.path[0],pace=(L.mode==='chase'||L.mode==='reinforce'||L.mode==='raze')?'jog':(L.fleeing?'sprint':L.pace),pp=(L.endur<=0&&pace!=='creep')?'creep':pace;
  var UB=(L.ub&&L.ub.sp)?L.ub:(L.ub=unitPace(U)),wp0=walkPos(L),nc0=center(nx[0],nx[1]),gd2=gradeAt(wp0[0],wp0[1],nc0[0]-wp0[0],nc0[1]-wp0[1]),GM2=gradeMul(gd2);L.rem-=gradeSpeed(UB.sp[pp]*L.wf*hexSpeed(ix(nx[0],nx[1]),uRoads(U)),gd2);var e0=L.endur;L.endur=Math.max(0,L.endur-(GM2.mode==='hard'||GM2.mode==='climb'?UB.dr.sprint:GM2.mode==='scramble'?UB.dr.jog:UB.dr[pp]));if(e0>0&&L.endur<=0)spent(U);
  if(L.rem<=0){L.pos=L.path.shift();L.rem=HEX_YD;var bb=battleAt(L.pos);if(bb)return joinBattle(bb,U,false);if(L.path.length)crossWait(U,ix(L.pos[0],L.pos[1]),ix(L.path[0][0],L.path[0][1]))}
}
function contactCheck(){
  var M=S.match;
  M.camps.forEach(function(m){
    if(!m.roam||!m.mobs.length||!m.pos||m.inBattle)return;
    S.units.forEach(function(U){var L=U.live;if(M.halt||!L||L.battle||!U.hids.length||!m.mobs.length||m.inBattle)return;if(atHome(U)&&setWalled(setById(U.sid)))return;
      if(unitHidden(U)){var ha=walkPos(L),hm=walkPos(m),hd=Math.hypot(ha[0]-hm[0],ha[1]-hm[1])/YU;if(hd<=Math.max(60,mapHideYd(U)))liveBattle(U,m);return}
      if(L.pos[0]===m.pos[0]&&L.pos[1]===m.pos[1])return liveBattle(U,m);
      /* they meet between tiles: fight on whichever tile the meeting point falls in, at once */
      var a=walkPos(L),c=walkPos(m);if(Math.hypot(a[0]-c[0],a[1]-c[1])<SH*.9){var k=hexAtXY((a[0]+c[0])/2,(a[1]+c[1])/2),q=[k%COLS,Math.floor(k/COLS)];if(!hexSpeed(k)||setAt(q[0],q[1]))q=L.pos.slice();L.pos=q;L.path=[];L.rem=HEX_YD;m.pos=q.slice();m.path=[];m.rem=HEX_YD;m.wait=0;liveBattle(U,m)}});
  });
}
function liveBattle(U,m){
  var M=S.match,L=U.live;if(!U.hids.length||!m.mobs.length||L.battle)return;
  if(m.inBattle){var ob=battleById(m.inBattle);if(ob&&!ob.done&&ob.pos[0]===L.pos[0]&&ob.pos[1]===L.pos[1])joinBattle(ob,U,false);return}
  startBattle(U,m);
}
function battleById(id){var a=(S.match&&S.match.battles)||[];for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];return null}
function battleAt(pos){var a=(S.match&&S.match.battles)||[];for(var i=0;i<a.length;i++)if(!a[i].done&&a[i].pos[0]===pos[0]&&a[i].pos[1]===pos[1])return a[i];return null}
function activeBattles(){return ((S.match&&S.match.battles)||[]).filter(function(b){return !b.done})}
function startBattle(U,m){
  var M=S.match,L=U.live;M.battles=M.battles||[];M.bid=(M.bid||0)+1;
  var where=lab(L.pos[0],L.pos[1]),tn=mobWord(m,1);
  var TV0=bfTravel(L,U,m),up0=walkPos(L),F=bfGenAt(up0[0]+TV0.eb[0]*14*YU,up0[1]+TV0.eb[1]*10*YU,ix(L.pos[0],L.pos[1])*7919+M.bid*104729);
  var b={id:M.bid,pos:L.pos.slice(),camp:m.key,t0:M.clock,groups:[],teams:[],units:[],foes:m.mobs.map(function(x,i){return mkFoe(x,i,0)}),bt:0,dmgP:0,dmgE:0,tn:tn,where:where,done:false,F:F,phase:M.autoPause?'deploy':'fight',ev:[],evn:0};
  b.rec={F:F,title:U.name+' vs '+tn+' at '+where,ents:[],fr:[],ev:[]};
  var TV=bfTravel(L,U,m),eb=TV.eb,C0=[BFW/2,BFH/2],EA=[C0[0]+eb[0]*34,C0[1]+eb[1]*26];b.ft=m.type;b.eb=eb;
  b.foes.forEach(function(f,i){var lat=((i%5)-2)*5+((i*13)%3)-1,dep=Math.floor(i/5)*5,p=f.kind==='tiggle'?bfFreeWet(F,EA[0]-eb[1]*lat+eb[0]*dep,EA[1]+eb[0]*lat+eb[1]*dep):bfFree(F,EA[0]-eb[1]*lat+eb[0]*dep,EA[1]+eb[0]*lat+eb[1]*dep);f.x=p[0];f.y=p[1];f.px=f.x;f.py=f.y;f._ri=b.rec.ents.length;b.rec.ents.push({s:'e',k:f.kind,b:f.ref,m:f.hp})});
  if(unitHidden(U)){b.ambush=U.id;b.foes.forEach(function(f){f.woke=false;f.unaware=true});mlog(U.name+' springs an ambush at '+where+'.','good')}
  m.inBattle=b.id;M.battles.push(b);UI.bsel=b.id;UI.bpick=null;UI.barm=null;
  mlog(U.name+' engages '+b.foes.length+' '+tn+' at '+where+'.','bad');
  joinBattle(b,U,true);
  addTowers(b);
  UI.tab='match';if(UI.mview==='mine'&&!M.mine[ix(L.pos[0],L.pos[1])])UI.mview='all';UI.pzGo=bGo(b);UI.needRender=true;
  if(b.phase==='deploy'){mlog('Set up your teams on the battlefield, then press Fight.','dim')}
  bfFrame(b);autoPause();
}
function joinBattle(b,U,first){
  var L=U.live,e=engOf(U),FM=fmOf(U),ts=teamsOf(U).filter(function(t){return t.hids.length}),multi=ts.length>1;
  var TV=bfTravel(L,U,null),td=TV.td,amb=b.ambush===U.id&&first;
  var g={uid:U.id,n0:U.hids.length,fled:false,joined:b.bt,gone:false,mode:'hold',fo:'mv',td:td};
  if(first){var eb0=b.eb||td,C1=[BFW/2,BFH/2];g.pt=bfFree(b.F,C1[0]-eb0[0]*16,C1[1]-eb0[1]*12)}else g.pt=bfFree(b.F,BFW/2-td[0]*58,BFH/2-td[1]*40+((b.groups.length%3)-1)*14);
  g.pt0=g.pt.slice();var tf=bfFacing(b,g.pt),ang=Math.acos(Math.max(-1,Math.min(1,td[0]*tf[0]+td[1]*tf[1])));
  g.face=amb?tf:td;g.wheel=amb?0:Math.round(1+7*ang/Math.PI);g.wf0=g.face.slice();b.groups.push(g);
  ts.forEach(function(t){
    var key=U.id+':'+t.id,col=b.teams.length%TCOL.length;
    var tm={k:key,uid:U.id,tid:t.id,name:multi?U.name+' · '+t.name:U.name,order:'form',shoot:true,fall:+e.fall||0,n0:t.hids.length,col:col,joined:b.bt,pt:g.pt.slice(),face:g.face};
    b.teams.push(tm);
    t.hids.map(byId).filter(function(h){return h&&!b.units.some(function(x){return x.c.id===h.id&&x.alive&&!x.gone})}).map(makeUnit).forEach(function(u,i){
      u.endur=L.endur;u.uid=U.id;u.tk=key;u.si=i;
      var sl=fmPos(g,u,'mv',FM),p=bfFree(b.F,sl[0],sl[1]);u.x=p[0];u.y=p[1];u.px=u.x;u.py=u.y;u.rt=Math.max(u.rt||0,(g.wheel||0)+(g.wheel?Math.round(u.react||1):0));if(amb)u.hide=true;
      u._ri=b.rec.ents.length;b.rec.ents.push({s:'p',eq:u.eqk||[],f:u.c.sex==='f',n:hname(u.c),m:u.mhp,col:col,id:u.c.id,tt:hTat(u.c)});b.units.push(u);
    });
  });
  L.battle=b.id;L.path=[];L.status='Fighting at '+b.where;
  var BPP=bpFor(U,b.ft);if(BPP)bpSet(b,g,U,BPP);
  if(!first){mlog(U.name+' joins the fight at '+b.where+'.','good');UI.needRender=true}
}
function fmPos(g,u,key,FM){var o=key==='mv'?FM.mv:(obById(FM,key)||FM.mv),p=o.s[u.c.id]||[FMC,FMR],lat=(p[0]-FMC)*FMS,dep=(FMR-p[1])*FMS,f=g.face;return[g.pt[0]+f[0]*dep-f[1]*lat,g.pt[1]+f[1]*dep+f[0]*lat]}
function defStance(h){var eq=eqKeys(h).map(wkey);return BOWS.some(function(b){return eq.indexOf(b)>=0&&eq.indexOf(WEAP[b].ammo)>=0})?'shoot':'charge'}
function stanceOf(g,u,FM){if(g.fo==='mv')return u.rng&&u.arrows>0?'shoot':'charge';var o=obById(FM,g.fo);return (o&&o.st[u.c.id])||defStance(u.c)}
function groupOf(b,uid){for(var i=0;i<b.groups.length;i++)if(b.groups[i].uid===uid)return b.groups[i];return null}
function settleMen(us){
  var M=S.match;
  us.forEach(function(u){if(u.done)return;u.done=true;
    var wear=function(card,used,dealt){if(!card||!used||!headOf(card))return;card.wear=Math.min(1,(card.wear||0)+HEADS[headOf(card)].wear*(1+Math.floor(dealt/300))*(card.boon&&card.boon.k==='boar'?Math.max(.2,1-card.boon.p/20):1))};/* a boar-blessed head keeps its edge */
    wear(u.mcard,u.melee&&u.att[u.melee],u.md);if(u.rng&&u.att[u.rng])u.ac.forEach(function(a){wear(a.card,1,u.rd)});
    var lf=u.arrows;u.ac.forEach(function(a){a.card.n=Math.min(a.cap,lf);lf-=a.card.n;if(a.card.n<=0&&S.cards.indexOf(a.card)>=0)S.cards.splice(S.cards.indexOf(a.card),1)});
    if(u.alive&&u.mhp)u.c.dmg=Math.max(0,u.mhp-u.hp);
    if(u.alive)u.c.lead=Math.min(LEAD_CAP,(u.c.lead||0)+1);/* every fight he comes through steadies him for the next */
    if(u.alive)Object.keys(u.att).forEach(function(w){var g=u.att[w]/10;if(g>0)u.c.skill[w]=Math.min(100,Math.round((u.c.skill[w]+g)*10)/10)});
    else{S.cards.forEach(function(c){if(c.eq===u.c.id)c.eq=null});if(S.cards.indexOf(u.c)>=0){S.cards.splice(S.cards.indexOf(u.c),1);M.humLost++}}});
}
function hpSum(a){var t=0;a.forEach(function(x){t+=Math.max(0,x.hp)});return t}
function bfD(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function bfNear(from,arr,jit){var best=null,bs=1e9;arr.forEach(function(t,k){if(!t.alive||t.gone)return;var s=bfD(t,from)+((k*7+jit*13)%10)*.3;if(s<bs){bs=s;best=t}});return best}
function bfHt(F,x,y){/* smooth height inside the field, metres */if(!F.hg)return 0;var fx=Math.max(0,Math.min(BFX-1.001,x/BFC-.5)),fy=Math.max(0,Math.min(BFY-1.001,y/BFC-.5)),ix0=Math.floor(fx),iy0=Math.floor(fy),tx=fx-ix0,ty=fy-iy0,ix1=Math.min(BFX-1,ix0+1),iy1=Math.min(BFY-1,iy0+1),H=F.hg;
  return (H[iy0*BFX+ix0]*(1-tx)+H[iy0*BFX+ix1]*tx)*(1-ty)+(H[iy1*BFX+ix0]*(1-tx)+H[iy1*BFX+ix1]*tx)*ty}
function bfMeleeMod(F,u,holding,t){var g=GROUND[bfCell(F,u.x,u.y)]||GROUND.o,m=g.ml||0;if(holding&&g.ln)m+=g.ln;if(t&&F.hg)m+=Math.max(-8,Math.min(8,(bfHt(F,u.x,u.y)-bfHt(F,t.x,t.y))*.5));return m}
function bfSeen(F,u,f){var c=bfCell(F,f.x,f.y);return bfD(u,f)<=(u.sight||400)*(u.watch?(c==='w'?.7:c==='b'||c==='k'?.95:1):(c==='w'?.25:c==='b'?.6:c==='k'?.75:1))}/* the watcher's eyes see through cover */
function bfCover(F,a,t){/* your men behind a palisade take arrows ×0.25 */if(!F.wl||!F.wl.length||t.side==='e')return 1;var dx=a.x-t.x,dy=a.y-t.y,d=Math.hypot(dx,dy)||1,lim=Math.min(d-.5,6);for(var s=.5;s<=lim;s+=.75){if(isWallC(bfCell(F,t.x+dx/d*s,t.y+dy/d*s)))return COVER}return 1}
function bfShotMul(F,a,t){var hm=a.tw?1.2:F.hg?1+Math.max(-.2,Math.min(.2,(bfHt(F,a.x,a.y)-bfHt(F,t.x,t.y))*.01)):1;return ((GROUND[bfCell(F,a.x,a.y)]||GROUND.o).sh||1)*((GROUND[bfCell(F,t.x,t.y)]||GROUND.o).cv||1)*hm*bfCover(F,a,t)}
function bfEv(b,a,t,k,d,lab,x){b.evn++;b.ev.push({n:b.evn,k:k,x:x,a:a._ri,t:t._ri,ax:a.x,ay:a.y,bx:t.x,by:t.y,d:d,s:t.side==='e'?'e':'p',lab:lab});if(b.ev.length>150)b.ev.shift();b.rec.ev.push([b.bt,a._ri,t._ri,k,d,lab,x])}
function bfArc(a,t){var f=t.face;if(!f)return 'front';var dx=a.x-t.x,dy=a.y-t.y,d=Math.hypot(dx,dy),fd=Math.hypot(f[0],f[1]);if(d<1e-6||fd<1e-6)return 'front';var c=(dx*f[0]+dy*f[1])/(d*fd);if(c>=.5)return 'front';if(c<=-.5)return 'rear';return (dx*f[1]-dy*f[0])>0?'left':'right'}
function bfHit(b,a,t,dmg,skill,k,x){var arc=bfArc(a,t),A=arc==='rear'?ARC.rear:arc==='front'?null:ARC.side,noSh=t.shield&&(arc==='rear'||arc==='right'),sd=0,sh0=t.shield;
  if(A){skill*=A.hit;dmg*=A.dmg}if(noSh){if(t.dfn!=null){sd=t.shDef||0;t.dfn-=sd}else t.shield=false}
  a.face=[t.x-a.x,t.y-a.y];/* a man turns to whoever he strikes */
  var h0=t.hp,h=hitX(t,dmg,skill);if(noSh){if(t.dfn!=null)t.dfn+=sd;else t.shield=sh0}if(A&&h&&!t._dg){b.flk=(b.flk||0)+1;nerveHit(t,arc==='rear'?4:2)}if(t.side==='e')t.woke=true;bfEv(b,a,t,k,h?Math.max(0,h0-t.hp):-1,t._dg?'dodged':(A&&h?(arc==='rear'?'from behind!':'flank!'):null),x);if(h&&k==='m'&&t.gm&&t.gm.thorn&&a.alive){var th=Math.max(1,Math.round(dmg*t.gm.thorn));a.hp-=th;bfEv(b,t,a,'m',th,'hit back',null);if(a.hp<=0)a.alive=false}if(h&&t.hp<=0)t.alive=false;return h}
function bfFrame(b){var cen=function(L){var n=0,cx=0,cy=0;L.forEach(function(q){if(q.alive&&!q.gone){n++;cx+=q.x;cy+=q.y}});return n?[cx/n,cy/n]:null};
  b.units.concat(b.foes).forEach(function(x){if(!x.alive)return;if(!x.face){/* at contact men face the way their team faces, mobs face the men */var tm=x.side==='e'?null:b.teams.filter(function(t){return t.k===x.tk})[0],c0=cen(x.side==='e'?b.units:b.foes);x.face=tm&&tm.face?tm.face.slice():c0?[c0[0]-x.x,c0[1]-x.y]:[1,0]}if(x._px!=null){var dx=x.x-x._px,dy=x.y-x._py;if(dx*dx+dy*dy>.0025)x.face=[dx,dy]}x._px=x.x;x._py=x.y});var fr=[];b.units.concat(b.foes).forEach(function(x){fr[x._ri]=[Math.round(x.x*10)/10,Math.round(x.y*10)/10,Math.max(0,Math.round(x.hp)),x.alive?(x.gone?2:1):0]});b.rec.fr.push(fr)}
/* bodies keep apart: at least GAP_E yards between enemies, GAP_S between men of the same side, so the lines stay readable */
var GAP_E=1.5,GAP_S=1;
/* ---------- moon eyes: they scurry, never hold a line, and throw bursts of moonlight into the thickest knot of men ---------- */
var MOON_R=1.8,MOON_RNG=20;
function moonAI(b,F,f,seen,live){if(!seen.length)return;var tg=bfNear(f,seen,f.id);if(!tg)return;var d=bfD(f,tg);f.woke=true;
  f.cd=Math.max(-1,f.cd-1);f.bcd=(f.bcd||0)-1;
  /* the burst: centred on the man with the most others within 2 yd, if he is in throwing range */
  if(f.bcd<=0&&f.mana>0){var best=null,bn=0;seen.forEach(function(u){if(bfD(f,u)>MOON_RNG)return;var n=live.filter(function(v){return v.alive&&!v.gone&&bfD(u,v)<=MOON_R}).length;if(n>bn){bn=n;best=u}});
    if(best){f.mana--;f.bcd=10+Math.floor(Math.random()*7);bfEv(b,f,best,'b',0,null,'moon');live.forEach(function(v){if(!v.alive||v.gone||bfD(best,v)>MOON_R)return;var dm=10+Math.floor(Math.random()*6);hurt(v,dm);bfEv(b,f,v,'b',dm,v===best?'moonlight!':null,'moon');if(v.hp<=0)v.alive=false;nerveHit(v,4)});return}}
  /* close in to throwing range, then keep 8-14 yd off, darting about; a man on top of them gets the flint knife */
  if(d<=f.reach+.6&&f.cd<=0){f.cd+=60/f.apm;bfHit(b,f,tg,f.dmg,f.skill+bfMeleeMod(F,f,false,tg),'m','knife');return}
  /* with moonlight left they hang back at throwing range; spent, they rush in with the flint knives */
  var j=(Math.random()-.5)*6,want=f.mana>0?(d>16?12:d<6?14:null):Math.max(.8,f.reach*.8);
  if(f.mana<=0){bfMove(F,f,tg.x+(Math.random()-.5)*2,tg.y+(Math.random()-.5)*2,f.spd);return}
  if(want!=null||Math.random()<.5){var w=want||d,ux=(f.x-tg.x)/(d||1),uy=(f.y-tg.y)/(d||1);bfMove(F,f,tg.x+ux*w-uy*j,tg.y+uy*w+ux*j,f.spd)}}
/* ---------- the watcher: circles to the back of the line for an archer or caster, freezes everyone near, grabs one and drains him ---------- */
var W_FREEZE=10,W_FRZ_S=3,W_FCD=20,W_DRAIN=15;
function wFreeze(b,src,targets,label){var n=0;targets.forEach(function(v){if(!v.alive||v.gone||bfD(src,v)>W_FREEZE||v.kind==='watcher')return;v.frz=W_FRZ_S+(Math.random()<.5?1:0);hurt(v,5);if(v.hp<=0)v.alive=false;n++;nerveHit(v,6)});if(n)bfEv(b,src,src,'fz',0,label||'freeze!',null);return n}
function watcherAI(b,F,f,seen,live){f.fcd=Math.max(0,(f.fcd||0)-1);f.woke=true;
  if(f.grab){var g=f.grab;if(!g.alive||g.gone){f.grab=null;g.grabbed=false;
      /* the man is dead: he is gone 50-100 m off in a blink, takes back 10-20% of his strength, and comes again */
      var a=Math.random()*Math.PI*2,r=(55+Math.random()*55)/.9144*.9144,nx=Math.max(4,Math.min(BFW-4,f.x+Math.cos(a)*r)),ny=Math.max(4,Math.min(BFH-4,f.y+Math.sin(a)*r)),q=bfFree(F,nx,ny);f.x=q[0];f.y=q[1];f.px=f.x;f.py=f.y;
      var hl=Math.round((f.mhp||200)*(.1+Math.random()*.1));f.hp=Math.min(f.mhp||200,f.hp+hl);bfEv(b,f,f,'note',-1,'vanishes · +'+hl+' HP',null);return}
    f.x=g.x+.8;f.y=g.y;hurt(g,W_DRAIN);bfEv(b,f,g,'m',W_DRAIN,'drained',null);if(g.hp<=0)g.alive=false;nerveHit(g,10);return}
  if(!seen.length)return;
  /* his target: an archer or caster if there is one, else whoever stands furthest back from the fighting */
  var foesC=null,pick=null,ps=-1e9;seen.forEach(function(u){var sc=(u.rng||(u.spells&&u.spells.length)?40:0)-bfD(u,f)*.2;if(sc>ps){ps=sc;pick=u}});if(!pick)return;
  var d=bfD(f,pick),fc=pick.face||[1,0],fl=Math.hypot(fc[0],fc[1])||1,bx=pick.x-fc[0]/fl*2.5,by=pick.y-fc[1]/fl*2.5;
  if(d>6){/* swing wide of the line: aim for a point behind him, offset to the side while far off */var side=d>20?((f.id%2)?1:-1)*10:0;bfMove(F,f,bx-fc[1]/fl*side,by+fc[0]/fl*side,f.spd);return}
  if(f.fcd<=0){f.fcd=W_FCD;wFreeze(b,f,live,'the watcher rears up: everyone near is frozen!')}
  if(d>f.reach+.6){bfMove(F,f,pick.x,pick.y,f.spd);return}
  if(pick.frz>0||Math.random()<.35){f.grab=pick;pick.grabbed=true;bfEv(b,f,pick,'m',0,'grabbed!',null);mlog('The watcher has '+pick.name+'.','bad')}}
/* a man who has taken the watcher's eyes can rear up the same way: once every 20 s, when two or more enemies are within 10 yd */
function eyesFreeze(b,u,fs){u.wcd=Math.max(0,(u.wcd||0)-1);if(u.wcd>0)return;if(fs.filter(function(f){return bfD(u,f)<=W_FREEZE}).length<2)return;u.wcd=W_FCD;wFreeze(b,u,fs,u.name+' rears up: the enemy near him freezes')}
/* ---------- nerve: leadership, fear, cohesion and fortitude ----------
   Everyone starts a fight with 100 nerve. Losses: a man beside him falls (−12, less cohesion), a blow from the side (−2) or behind (−4),
   fighting on below grit (−1 a second), a frightening enemy close by (−fear÷20 a second), moonlight, a freeze, a grab. Fortitude cuts every
   loss by half its value in percent. Leaders within 15 yd give back leadership÷10 a second, and nerve comes back slowly out of contact.
   At 0 he breaks and runs for 8 seconds, then steadies at 35. Beasts (pigger, dog man, watcher) never break. */
var LEAD_CAP=25,NERVE_BREAK_S=8;
function nerveHit(e,n){if(!e||e.fearless||e.nerve==null||!e.alive||e.rout>0)return;var hp=e.mhp?Math.max(0,e.hp)/e.mhp:1;e.nerve-=n*(1-(e.fort||0)/200)*(hp<.5?1.25:1)}
function moraleTick(b){var all=b.units.concat(b.foes);
  all.forEach(function(d){if(d.alive||d._dn)return;d._dn=1;var side=d.side==='e'?b.foes:b.units;side.forEach(function(a){if(a!==d&&a.alive&&!a.gone&&bfD(a,d)<=10)nerveHit(a,12*(1-(a.coh||0)/100))})});
  var side=function(L,E){L.forEach(function(u){if(!u.alive||u.gone||u.nerve==null||u.fearless)return;
    var fm=0,near=false;E.forEach(function(f){if(!f.alive||f.gone)return;var d=bfD(u,f);if(d<=10)near=true;if(d<=6&&(f.fear||0)>fm)fm=f.fear});if(fm)nerveHit(u,fm/20);if(u.grit&&u.hp<u.grit)nerveHit(u,1);
    var ld=0;L.forEach(function(v){if(v!==u&&v.alive&&!v.gone&&(v.lead||0)>ld&&bfD(u,v)<=15)ld=v.lead});u.nerve=Math.min(100,u.nerve+ld/10+(near?0:.5));
    if(u.rout>0){u.rout--;if(!u.rout){u.nerve=35}return}
    if(u.nerve<=0){u.rout=NERVE_BREAK_S;u.nerve=0;bfEv(b,u,u,'note',-1,'breaks and runs!',null);b.brk=b.brk||{p:0,e:0};b.brk[u.side==='e'?'e':'p']++}})};
  side(b.units,b.foes);side(b.foes,b.units)}
/* a broken man or mob runs from the nearest enemy and strikes no one */
function routStep(F,e,E){var n=bfNear(e,E,0);if(!n)return;var d=bfD(e,n)||1;bfMove(F,e,e.x+(e.x-n.x)/d*12,e.y+(e.y-n.y)/d*12,e.sp?e.sp.sprint:(e.spd||PACE.jog)*1.2)}
function sepOk(F,e,x,y){var o=BFM;BFM={foe:e.side==='e',jh:0};var r=bfPass(F,x,y);BFM=o;return r}
function bfSep(F,all){
  for(var it=0;it<2;it++)for(var i=0;i<all.length;i++){var a=all[i];for(var j=i+1;j<all.length;j++){var c=all[j],mn=(a.side==='e')!==(c.side==='e')?GAP_E:GAP_S,dx=c.x-a.x,dy=c.y-a.y,d=Math.hypot(dx,dy);if(d>=mn)continue;
    if(d<.01){dx=((i*7+j*3)%5)-2||1;dy=((i*3+j*5)%5)-2;d=Math.hypot(dx,dy)}var push=(mn-d)/2,ux=dx/d*push,uy=dy/d*push;
    if(!a.tw&&sepOk(F,a,a.x-ux,a.y-uy)){a.x-=ux;a.y-=uy}if(!c.tw&&sepOk(F,c,c.x+ux,c.y+uy)){c.x+=ux;c.y+=uy}}}
}
function stepBattle(b){
  var M=S.match;
  if(b.phase==='deploy'){if(M.speed>0){b.phase='fight';UI.barm=null}else return}
  var live=b.units.filter(function(u){return u.alive&&!u.gone}),fl=b.foes.filter(function(f){return f.alive});
  if(!live.length||!fl.length||b.bt>=900)return endBattle(b);
  if(live.every(function(u){return u.tw})&&fl.every(function(f){return !f.rng})){b.past=true;return endBattle(b)}
  var F=b.F,e0=hpSum(b.foes),p0=hpSum(b.units),T={},G={},FM={};
  b.teams.forEach(function(t){T[t.k]=t});
  b.groups.forEach(function(g){G[g.uid]=g;var U=unitById(g.uid);FM[g.uid]=U?fmOf(U):{mv:{s:{}},ob:[]}});
  b.units.concat(b.foes).forEach(function(x){x.px=x.x;x.py=x.y});
  b.groups.forEach(function(g){if(g.gone||!(g.wheel>0))return;g.wheel--;var tf=bfFacing(b,g.pt),k=g.wheel>0?1/(g.wheel+1):1,fx=g.face[0]+(tf[0]-g.face[0])*k,fy=g.face[1]+(tf[1]-g.face[1])*k,fd=Math.hypot(fx,fy)||1;g.face=[fx/fd,fy/fd];
    if(!g.wheel){g.face=tf;if(!(b.plays&&b.plays[g.uid])){var U0=unitById(g.uid);if(g.fo==='mv'&&U0)g.fo=fmOf(U0).def}}});
  bpTick(b);bfHidden(b);b.teams.forEach(function(t){T[t.k]=t});
  b.groups.forEach(function(g){
    if(g.gone||(g.mode!=='push'&&g.mode!=='dmarch'))return;var nf=bfNear({x:g.pt[0],y:g.pt[1]},fl,0);if(!nf)return;
    var d=Math.hypot(nf.x-g.pt[0],nf.y-g.pt[1]),stp=Math.min(PACE.walk*(g.mode==='dmarch'?.5:1),d-6);
    if(stp>0){g.pt=[g.pt[0]+(nf.x-g.pt[0])/d*stp,g.pt[1]+(nf.y-g.pt[1])/d*stp]}else g.mode=g.mode==='dmarch'?'guard':'hold';
    g.face=bfFacing(b,g.pt);
  });
  b.teams.forEach(function(t){
    var mem=b.units.filter(function(u){return u.tk===t.k}),lv=mem.filter(function(u){return u.alive&&!u.gone});if(!lv.length||t.order==='back')return;
    if(t.order==='flank'&&lv.every(function(u){var sl=bfSlot(b,t,u.si);return Math.hypot(u.x-sl[0],u.y-sl[1])<4}))t.order='advance';
    if(t.fall>0&&(t.n0-mem.filter(function(u){return u.alive}).length)/t.n0>=t.fall){t.order='back';mlog(t.name+' falls back.','bad')}
  });
  var seenL=live.filter(function(u){return !u.hid}),seenG=seenL.filter(function(u){return !u.tw}),hasW=F.wl&&F.wl.length;b._fl=null;
  fl.forEach(function(f){
    if(f.frz>0){f.frz--;return}
    if(f.rout>0){routStep(F,f,live);return}
    if(f.kind==='moon'||f.kind==='watcher'){if(f.kind==='moon')moonAI(b,F,f,seenG,live);else watcherAI(b,F,f,seenG,live);return}
    var tg=bfNear(f,f.rng?seenL:seenG,f.id);if(!tg){if(hasW&&seenL.length)wallAI(b,f,null);return}if(f.unaware){f.unaware=false;mlog('The '+f.kind+'s spot the ambush.','bad')}
    var d=bfD(f,tg),aggro=f.kind==='goblin'||f.kind==='pigger'||d<=110||f.woke;if(aggro)f.woke=true;
    if(f.kind==='tiggle'&&F.wet&&F.wet.charAt(bfIdx(f.x,f.y))!=='1'){var hw=bfFreeWet(F,f.x,f.y);bfMove(F,f,hw[0],hw[1],f.spd);f.cd=Math.max(-1,f.cd-1);return}
    if(hasW&&aggro&&f.kind!=='tiggle'&&!(f.rng&&d<=f.reach)&&wallAI(b,f,tg))return;
    var stand=f.rng?f.reach-8:f.reach+.3;
    if(aggro&&d>stand)bfMove(F,f,tg.x+(f.x-tg.x)/d*stand*.9,tg.y+(f.y-tg.y)/d*stand*.9,f.spd);
    d=bfD(f,tg);f.cd=Math.max(-1,f.cd-1);
    if(f.woke&&d<=f.reach+.6&&f.cd<=0){f.cd+=60/f.apm;bfHit(b,f,tg,f.dmg,f.rng?f.skill*bfShotMul(F,f,tg):f.skill+bfMeleeMod(F,f,false,tg),f.rng?'r':'m',f.kind==='goblin'?'claw':f.kind==='tiggle'?(f.rng?'shortbow':'knife'):f.ref&&f.ref.w)}
  });
  live.forEach(function(u){
    if(!u.alive||u.gone)return;if(u.grabbed){if(!b.foes.some(function(f){return f.alive&&f.grab===u}))u.grabbed=false;else return}if(u.frz>0){u.frz--;return}if(u.rout>0){routStep(F,u,b.foes.filter(function(f){return f.alive}));return}if(u.watch)eyesFreeze(b,u,b.foes.filter(function(f){return f.alive}));var t=T[u.tk],g=G[u.uid],fs=b.foes.filter(function(f){return f.alive});if(!fs.length)return;
    var tf=t.tgt!=null&&b.foes[t.tgt]&&b.foes[t.tgt].alive?b.foes[t.tgt]:null;if(t.tgt!=null&&!tf)t.tgt=null;
    u.guard=false;var gr=u.hp<u.grit?.8:1,o=t.order,mv=0,used=0,near=tf&&o==='advance'?tf:bfNear(u,fs,u.c.num),dn=bfD(u,near),pace=(u.endur>0?u.sp.jog:u.sp.walk)*gr,run=(u.endur>0?u.sp.sprint:u.sp.walk)*gr,hold=false,ran=false;
    var fp=t.pace||(o==='form'&&g.mode==='leg'?g.pace:null);if(fp){pace=run=((fp==='sprint'&&u.endur<=0)?u.sp.walk:(u.sp[fp]||u.sp.walk))*gr}
    var go=function(x,y,p,lv){used=p;u.leap=p>u.sp.jog*gr+1e-6;return bfMove(F,u,x,y,p,lv)};
    u.cdm=Math.max(-1,u.cdm-1);u.cdr=Math.max(-1,u.cdr-1);
    u.ce=dn<=3?Math.max(0,u.ce-u.ceDrain):Math.min(100,u.ce+u.ceRec);
    if(o==='back'){var sp=u.endur>0;go(-6,u.y,(sp?u.sp.sprint:u.sp.walk)*gr,true);u.endur=Math.max(0,u.endur-(sp?u.dr.sprint:u.dr.walk));if(u.x<0)u.gone=true;return}
    var archer=u.rng&&u.arrows>0&&t.shoot,reach=u.melee?WEAP[u.melee].reach:1,bowR=u.rng?WEAP[u.rng].reach*u.range*(u.gm?u.gm.range:1)*(u.tw?1.2:1):0,sl=null;
    u.guard=false;
    if(u.rt>0){u.rt--;hold=true}
    else if(u.tw){hold=true}
    else if(o==='form'){
      var stc=(g.mode==='guard'||g.mode==='dmarch')?'guard':g.mode==='leg'||u.hide?'hold':stanceOf(g,u,FM[u.uid]);if(stc==='shoot'&&!archer)stc='charge';
      if(stc==='guard'){u.guard=true;archer=false}
      if(stc==='charge'){archer=false;if(dn>reach+.3){mv=go(near.x,near.y,run);ran=u.endur>0}}
      else if(stc==='shoot'){/* close only until the nearest foe is in bow range, then stand and loose */var inR=fs.some(function(f){return bfD(u,f)<=bowR-2&&bfSeen(F,u,f)});if(!inR&&!(u.melee&&dn<5))mv=go(near.x,near.y,pace);else hold=true}
      else{sl=fmPos(g,u,g.fo,FM[u.uid]);hold=true}
    }else if(o==='advance'){
      if(archer&&!(u.melee&&dn<5)){if(!fs.some(function(f){return bfD(u,f)<=bowR-2&&bfSeen(F,u,f)}))mv=go(near.x,near.y,pace)}
      else if(dn>reach+.3)mv=go(near.x,near.y,pace);
    }else{sl=bfSlot(b,t,u.si);hold=o!=='flank';if(o==='guard'){u.guard=true;archer=false}}
    if(sl){
      var ds=Math.hypot(u.x-sl[0],u.y-sl[1]);
      if(hold&&u.melee&&dn<5&&ds<6&&dn>reach+.3)mv=go(near.x,near.y,u.sp.walk*gr);
      else if(ds>.6){var fl2=o==='flank'&&u.endur>0;mv=go(sl[0],sl[1],fp?pace:fl2?run:(!hold||ds>6)?pace:u.sp.walk*gr);ran=fl2||fp==='sprint'}
    }
    if(mv)u.endur=Math.max(0,u.endur-(ran?u.dr.sprint:used>u.sp.walk*gr+1e-6?u.dr.jog:u.dr.walk));
    if(u.guard&&g.mode==='dmarch'&&o==='form')u.endur=Math.max(0,u.endur-u.dr.jog);
    if(u.hid){u.cds=Math.max(0,(u.cds||0)-1);return}
    var hp0=fs.map(function(f){return f.hp}),sh0=u.sh||0,cs=castAI(u,fs,null,F);if(cs||(!(sh0>0)&&u.sh>0)){u.casts=(u.casts||0)+1;u.hide=false;u.rev=8}if(!(sh0>0)&&u.sh>0)bfEv(b,u,u,'sh',-1,'shield up','p_shield');fs.forEach(function(f,i){if(f.hp<hp0[i]||(cs&&cs.t===f&&(cs.k==='p_push'||cs.k==='p_pull'))){bfEv(b,u,f,'b',hp0[i]-f.hp,cs&&cs.t===f?(cs.k==='p_pull'?'pulled!':cs.k==='p_push'?'pushed −'+Math.round(hp0[i]-f.hp)+' HP':cs.area?SPELL[cs.k].n+'!':null):null,cs&&(cs.t===f||(cs.area&&cs.area.indexOf(f)>=0))?cs.k:'p_bolt');f.woke=true}});
    fs=fs.filter(function(f){return f.alive});if(!fs.length)return;
    var GM=u.gm||{mstr:1,rstr:1,mspd:1,rspd:1,rhit:1,tired:0,pierce:0},sm=u.strike*(u.ce<=0?.7+GM.tired:1)*(u.guard?.8:1),mreach=u.melee?WEAP[u.melee].reach:1;
    if(u.melee&&u.cdm<=0){var mt=tf&&bfD(u,tf)<=reach+.6?tf:bfNear(u,fs,u.c.num);if(mt&&bfD(u,mt)<=reach+.6){u.hide=false;u.rev=8;u.cdm+=60/(WEAP[u.melee].apm*sm*GM.mspd);u.att[u.melee]=(u.att[u.melee]||0)+1;var mh0=mt.hp;bfHit(b,u,mt,WEAP[u.melee].dmg*u.str*GM.mstr*(mreach<=1.5?(u.short||1):1)*matMul(u.mcard,mt)+GM.pierce,(u.c.skill[u.melee]+bfMeleeMod(F,u,hold,mt))*gr,'m',u.melee);u.md+=Math.max(0,mh0-mt.hp);return}}
    if(archer&&u.cdr<=0&&mv<.5){var seen=fs.filter(function(f){return bfSeen(F,u,f)}),t2=tf&&seen.indexOf(tf)>=0&&bfD(u,tf)<=bowR?tf:bfNear(u,seen,u.c.num+3);if(t2&&bfD(u,t2)<=bowR){u.hide=false;u.rev=8;u.cdr+=60/(WEAP[u.rng].apm*sm*GM.rspd);u.att[u.rng]=(u.att[u.rng]||0)+1;u.arrows--;var ac0=u.ac.filter(function(a){return a.card})[0],rh0=t2.hp;bfHit(b,u,t2,WEAP[u.rng].dmg*u.str*GM.rstr*matMul(ac0&&ac0.card,t2),u.c.skill[u.rng]*u.keen*GM.rhit*bfShotMul(F,u,t2)*gr*(dn<5?1-u.press:1)*(GM.foot&&'kbm'.indexOf(bfCell(F,u.x,u.y))>=0?1+GM.foot/3:1),'r',u.rng);u.rd+=Math.max(0,rh0-t2.hp)}}
  });
  bfSep(F,b.units.filter(function(u){return u.alive&&!u.gone}).concat(b.foes.filter(function(f){return f.alive})));
  moraleTick(b);b.bt++;bfFrame(b);
  b.dmgP+=Math.max(0,e0-hpSum(b.foes));b.dmgE+=Math.max(0,p0-hpSum(b.units));
  b.groups.forEach(function(g){
    if(g.gone)return;var mem=b.units.filter(function(u){return u.uid===g.uid});
    if(mem.every(function(u){return !u.alive||u.gone})&&mem.some(function(u){return u.alive})){g.fled=true;g.gone=true;finishGroup(b,g,'fled')}
  });
}
