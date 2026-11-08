/* ---------- enemies against a wall ----------
   A foe that can't reach the man he wants goes for the wall. Smart ones (goblins, brigands) make for a gate they can see,
   or walk the wall looking for one, and break a panel only when they find none. Dumb ones hit the nearest panel. */
function bfIdx(x,y){var gx=Math.max(0,Math.min(BFX-1,Math.floor(x/BFC))),gy=Math.max(0,Math.min(BFY-1,Math.floor(y/BFC)));return gy*BFX+gx}
function bfFlood(F,s){var R=new Uint8Array(BFX*BFY),q=[s],h=0,o=BFM;R[s]=1;BFM={foe:true,jh:0};while(h<q.length){var k=q[h++],x=k%BFX,y=(k-x)/BFX;for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;var X=x+dx,Y=y+dy;if(X<0||Y<0||X>=BFX||Y>=BFY)continue;var kk=Y*BFX+X;if(R[kk]||cmv(F.g.charAt(kk))<=0)continue;if(dx&&dy&&(cmv(F.g.charAt(y*BFX+X))<=0||cmv(F.g.charAt(Y*BFX+x))<=0))continue;R[kk]=1;q.push(kk)}}BFM=o;return R}
function foeFlood(b,f){var s=bfIdx(f.x,f.y),L=b._fl||(b._fl=[]);for(var i=0;i<L.length;i++)if(L[i][s])return L[i];var R=bfFlood(b.F,s);L.push(R);return R}
function wallAI(b,f,tg){var F=b.F,R=foeFlood(b,f);if(tg&&R[bfIdx(tg.x,tg.y)])return false;
  var cand=[];F.wl.forEach(function(ci){var c=F.g.charAt(ci);if(!isWallC(c))return;var x=ci%BFX,y=(ci-x)/BFX,best=-1,bd=1e9;D4.forEach(function(q){var X=x+q[0],Y=y+q[1];if(X<0||Y<0||X>=BFX||Y>=BFY)return;var kk=Y*BFX+X;if(!R[kk])return;var dd=Math.hypot((X+.5)*BFC-f.x,(Y+.5)*BFC-f.y);if(dd<bd){bd=dd;best=kk}});if(best>=0)cand.push({i:ci,n:best,g:c==='G',d:bd})});
  if(!cand.length)return false;
  var near=function(a){var p=null;a.forEach(function(c){if(!p||c.d<p.d)p=c});return p},pick=null,walk=false;
  if(INTEL[f.kind]==='smart'){var gs=cand.filter(function(c){return c.g&&c.d<=GATE_SEE});if(gs.length)pick=near(gs);else{f.sv=f.sv||{};cand.forEach(function(c){if(c.d<=12)f.sv[c.i]=1});var un=cand.filter(function(c){return !f.sv[c.i]});if(un.length){pick=near(un);walk=true}else pick=near(cand)}}
  else pick=near(cand);
  var nx=(pick.n%BFX+.5)*BFC,ny=(Math.floor(pick.n/BFX)+.5)*BFC;f.woke=true;f.atW=walk?null:pick.i;
  if(Math.hypot(nx-f.x,ny-f.y)>.8)bfMove(F,f,nx,ny,f.spd);
  f.cd=Math.max(-1,f.cd-1);
  if(!walk&&Math.hypot(nx-f.x,ny-f.y)<=3.2&&f.cd<=0){f.cd+=60/f.apm;wallHit(b,f,pick.i)}
  return true}
function wallHit(b,f,ci){var F=b.F,W=F.wc[ci];if(!W)return;var M=S.match,dm=f.dmg*(WALLX[f.kind]||.15);
  if(W.g!=null){M.ghp=M.ghp||{};M.ghp[W.g]=gateHP(W.g)-dm;if(M.ghp[W.g]<=0){M.ghp[W.g]=0;wallOpen(b,function(X){return X.g===W.g});mlog('The '+f.kind+'s smash the gate at '+b.where+'.','bad')}}
  else{var w=wallById(W.w);if(!w)return;var G=wallGeo(w),hp=panHP(w,G),p=W.ps.filter(function(i){return hp[i]>0})[0];if(p==null){wallOpen(b,function(X){return X===W});return}hp[p]-=dm;
    if(hp[p]<=0){hp[p]=0;wallOpen(b,function(X){return X.w===W.w&&X.g==null&&X.ps.indexOf(p)>=0});mlog('The '+f.kind+'s break a panel of the '+PALS[w.h].n.toLowerCase()+' at '+b.where+'.','bad')}}
  b.wdmg=(b.wdmg||0)+dm}
function wallOpen(b,test){var F=b.F,g=F.g.split('');F.wl.forEach(function(ci){var X=F.wc[ci];if(X&&isWallC(g[ci])&&test(X))g[ci]=F.wu[ci]||'o'});F.g=g.join('');b._fl=null;UI.needRender=true}
/* men who fight where they stand: a settlement's garrison, or the men on a watchtower */
function gName(b,g){var t=b.teams.filter(function(x){return x.uid===g.uid})[0];return t?t.name:'Men'}
/* a settlement with a palisade round its core: men at home there wait behind it instead of sallying out */
function setWalled(st){if(!st)return false;var C=coreOf(st);if(!C.r)return false;return walls().some(function(w){for(var j=1;j<w.pts.length;j++)if(segDist(C.c[0],C.c[1],w.pts[j-1],w.pts[j])<C.r*1.6)return true;return false})}
function busyMan(id){return activeBattles().some(function(b){return b.units.some(function(u){return u.c.id===id&&u.alive&&!u.gone})})}
function garrisonOf(st){var away=awaySet();return atSet(st.id).filter(function(c){return c.key==='human'&&c.sex!=='f'&&!away[c.id]&&!towerOf(c.id)&&!busyMan(c.id)})}
function fixedTeam(b,name,hs,pt,tw){b.xk=(b.xk||0)+1;var key='x'+b.xk,col=b.teams.length%TCOL.length,face=bfFacing(b,pt);
  var g={uid:-(1000+b.xk),n0:hs.length,fled:false,joined:b.bt,gone:false,mode:'hold',fo:'mv',td:face,pt:pt.slice(),pt0:pt.slice(),face:face,wheel:0,fixed:true};b.groups.push(g);
  b.teams.push({k:key,uid:g.uid,tid:0,name:name,order:'hold',shoot:true,fall:0,n0:hs.length,col:col,joined:b.bt,pt:pt.slice(),face:face});
  hs.forEach(function(c,i){var u=makeUnit(c);u.uid=g.uid;u.tk=key;u.si=i;if(tw){u.tw=1;u.x=pt[0]+((i%2)-.5)*1.1;u.y=pt[1]+(Math.floor(i/2)-.5)*.9}else{var sl=bfSlot(b,b.teams[b.teams.length-1],i),p=bfFree(b.F,sl[0],sl[1]);u.x=p[0];u.y=p[1]}u.px=u.x;u.py=u.y;
    u._ri=b.rec.ents.length;b.rec.ents.push({s:'p',eq:u.eqk||[],f:u.c.sex==='f',n:hname(u.c),m:u.mhp,col:col,id:u.c.id,tt:hTat(u.c)});b.units.push(u)})}
function addTowers(b){(b.F.tw||[]).forEach(function(t){var T=null;towers().forEach(function(x){if(x.id===t.id)T=x});if(!T)return;var hs=(T.men||[]).map(byId).filter(function(h){return h&&!busyMan(h.id)});if(hs.length)fixedTeam(b,'Watchtower '+(towers().indexOf(T)+1),hs,[t.x,t.y],true)})}
/* a mob walks into a wall. With men to hold it, the fight happens right there; with nobody, they batter it down */
function wallMeet(m,hit){var st=null,bd=1e9,R=HEX_YD*YU*.6;
  if(INTEL[m.type]==='smart'&&gates().some(function(g){return gateHP(g.id)<=0&&Math.hypot(g.pts[0][0]-hit.pt[0],g.pts[0][1]-hit.pt[1])<HEX_YD*YU*.8})){m.thru=ix(m.path[0][0],m.path[0][1]);return}
  if(INTEL[m.type]==='smart'){var gb=null,gd0=HEX_YD*YU*.8;gates().forEach(function(g){var d=Math.hypot(g.pts[0][0]-hit.pt[0],g.pts[0][1]-hit.pt[1]),gw=wallById(g.w);if(gw&&gateHP(g.id)>0&&d<gd0){gd0=d;gb={w:gw,i:0,g:g.id,pt:g.pts[0],d:hit.d}}});if(gb){hit=gb;mlog('The '+mobWord(m,1)+' walk the wall and find the gate.','bad')}}
  S.setl.forEach(function(s){var c=coreOf(s).c,d=Math.hypot(c[0]-hit.pt[0],c[1]-hit.pt[1]);if(d<R&&d<bd&&garrisonOf(s).length){bd=d;st=s}});
  var tw=towers().some(function(t){var p=t.pts[0];return Math.hypot(p[0]-hit.pt[0],p[1]-hit.pt[1])<90*YU&&(t.men||[]).some(function(id){return byId(id)&&!busyMan(id)})});
  if(st||tw)return startAssault(m,hit,st);
  var gd=null;if(INTEL[m.type]==='smart')gates().forEach(function(g){if(g.w===hit.w.id&&gateHP(g.id)>0&&Math.hypot(g.pts[0][0]-hit.pt[0],g.pts[0][1]-hit.pt[1])<HEX_YD*YU*.5)gd=g});
  var dps=0;m.mobs.forEach(function(x){var f=mkFoe(x,0,0);if(!f.rng)dps+=f.dmg*f.apm/60*(WALLX[f.kind]||.15)});var G=wallGeo(hit.w),hp=gd?gateHP(gd.id):hit.g!=null?gateHP(hit.g):((panHP(hit.w,G)||[])[hit.i]||PALS[hit.w.h].hp);
  m.batter={t:Math.max(5,Math.ceil(hp/Math.max(1,dps))),w:hit.w.id,i:hit.i,g:gd?gd.id:hit.g,k:ix(m.path[0][0],m.path[0][1])};
  mlog('The '+mobWord(m,1)+' reach the '+PALS[hit.w.h].n.toLowerCase()+' near '+lab(m.pos[0],m.pos[1])+' and '+(m.batter.g!=null?'batter the gate':'hack at a panel')+'. Nobody is there to stop them: it gives way in '+mmss(m.batter.t)+'.','bad');UI.needRender=true}
function startAssault(m,hit,st){
  var M=S.match;M.battles=M.battles||[];M.bid=(M.bid||0)+1;
  var p0=walkPos(m),pt=hit.pt,dx=pt[0]-p0[0],dy=pt[1]-p0[1],dl=Math.hypot(dx,dy)||1,ux=dx/dl,uy=dy/dl,IN=40;
  var F=bfGenAt(pt[0]+ux*IN*YU,pt[1]+uy*IN*YU,ix(m.pos[0],m.pos[1])*7919+M.bid*104729),where=lab(m.pos[0],m.pos[1]),tn=mobWord(m,1);
  var b={id:M.bid,pos:m.pos.slice(),camp:m.key,t0:M.clock,groups:[],teams:[],units:[],foes:m.mobs.map(function(x,i){return mkFoe(x,i,0)}),bt:0,dmgP:0,dmgE:0,tn:tn,where:where,done:false,F:F,phase:M.autoPause?'deploy':'fight',ev:[],evn:0,siege:st?st.id:null,asl:true};
  b.rec={F:F,title:st?'Assault on '+setName(st):'Assault on the wall at '+where,ents:[],fr:[],ev:[]};b.ft=m.type;b.eb=[-ux,-uy];
  var W0=[BFW/2-ux*IN,BFH/2-uy*IN],EA=[W0[0]-ux*32,W0[1]-uy*32];
  b.foes.forEach(function(f,i){var lat=((i%5)-2)*4,dep=Math.floor(i/5)*4,p=bfFree(F,EA[0]+uy*lat-ux*dep,EA[1]-ux*lat-uy*dep);f.x=p[0];f.y=p[1];f.px=f.x;f.py=f.y;f.woke=true;f._ri=b.rec.ents.length;b.rec.ents.push({s:'e',k:f.kind,b:f.ref,m:f.hp})});
  m.inBattle=b.id;M.battles.push(b);
  if(st){var gs=garrisonOf(st);if(gs.length){var gp=W0,bg=1e9;gates().forEach(function(g){var q=[(g.pts[0][0]-F.ox)/YU,(g.pts[0][1]-F.oy)/YU];if(q[0]<4||q[1]<4||q[0]>BFW-4||q[1]>BFH-4)return;var d=Math.hypot(q[0]-W0[0],q[1]-W0[1]);if(d<bg){bg=d;gp=q}});
    fixedTeam(b,'Garrison of '+setName(st),gs,[Math.max(6,Math.min(BFW-6,gp[0]+ux*14)),Math.max(6,Math.min(BFH-6,gp[1]+uy*14))],false)}}
  addTowers(b);
  UI.bsel=b.id;UI.bpick=null;UI.barm=null;
  mlog('The '+tn+' reach the '+PALS[hit.w.h].n.toLowerCase()+(st?' of '+setName(st):'')+' at '+where+'. '+b.units.length+' men stand to.','bad');
  UI.tab='match';if(UI.mview==='mine'&&!M.mine[ix(m.pos[0],m.pos[1])])UI.mview='all';UI.pzGo=bGo(b);UI.needRender=true;
  if(b.phase==='deploy')mlog('Set your men on the walls, then press Fight.','dim');
  bfFrame(b);autoPause()}
function finishGroup(b,g,res){
  var M=S.match,U=unitById(g.uid),mem=b.units.filter(function(u){return u.uid===g.uid});
  settleMen(mem);
  if(!U||!U.live)return;
  U.hids=U.hids.filter(function(id){return byId(id)});
  var L=U.live,al=mem.filter(function(u){return u.alive});L.battle=null;
  if(al.length&&b.F&&b.F.ox!=null){var ax=0,ay=0;al.forEach(function(u){ax+=u.x;ay+=u.y});var wx=b.F.ox+ax/al.length*YU,wy=b.F.oy+ay/al.length*YU,hk=hexAtXY(wx,wy),hq=[hk%COLS,Math.floor(hk/COLS)];if(hexSpeed(hk)&&!(setAt(hq[0],hq[1])&&setAt(hq[0],hq[1]).id!==U.sid&&false)){L.xy=[wx,wy];L.pos=hq}}L.endur=al.length?Math.min.apply(null,al.map(function(u){return u.endur})):0;
  if(res==='fled'||res==='draw'){L.spotted[b.camp]=M.clock;goHome(U,'Falling back home')}
  else if(L.mode==='reinforce'){L.status='Fight over'}
  else resume(U);
}
function endBattle(b){
  var M=S.match,m=campByKey(b.camp);b.done=true;b.t1=M.clock;
  var rec=b.rec;
  var left=b.foes.filter(function(f){return f.alive}),alive=b.units.filter(function(u){return u.alive&&!u.gone}),res;
  if(m){m.mobs=left.map(function(f){f.ref.hp=f.hp;return f.ref});m.inBattle=null;m.wait=Math.max(m.wait||0,20);if(left.length&&(b.wdmg||b.past)&&m.path&&m.path.length)m.thru=ix(m.path[0][0],m.path[0][1])}
  if(!left.length){res='won';var lt0='';if(m){S.prestige+=m.reward;M.earned+=m.reward;lt0=giveLoot(m,false)}mlog('The fight at '+b.where+' is won. The '+b.tn+' are destroyed.'+(m?' +'+m.reward+' prestige. Loot: '+lt0+'.'+(m.razed?'':' Their camp still stands.'):''),'good')}
  else if(!b.units.some(function(u){return u.alive})){res='lost';mlog('Everyone at '+b.where+' is killed. '+left.length+' '+b.tn+' remain.','bad')}
  else if(!alive.length){res='fled';mlog('Your men escape from '+b.where+'. '+left.length+' '+b.tn+' remain.','bad')}
  else if(b.past){res='draw';mlog('The '+b.tn+' at '+b.where+' cannot reach the men up the tower and move on.','bad')}
  else{res='draw';mlog('The fight at '+b.where+' breaks off after 15 minutes. '+left.length+' '+b.tn+' remain.','dim')}
  b.groups.forEach(function(g){if(!g.gone){g.gone=true;finishGroup(b,g,g.fled?'fled':res)}});
  if(M.tutEnc&&M.speed>0&&M.speed<10&&!(M.battles||[]).some(function(x){return !x.done}))M.speed=10;
  pushRaid({title:rec.title+' · '+(res==='won'?'won':res==='lost'?'wiped out':res==='fled'?'fell back':'broke off'),tac:rec,at:mmss(M.clock)});
  UI.needRender=true;
}
function battleStat(b){
  var pu=b.units.filter(function(u){return u.alive&&!u.gone}).length,eu=b.foes.filter(function(f){return f.alive}).length;
  var names=b.groups.map(function(g){var U=unitById(g.uid);return U?U.name:gName(b,g)}).join(' + ');
  return '<div><b>'+esc(names)+'</b> · '+pu+' of '+b.units.length+' standing · dealt <b>'+Math.round(b.dmgP)+'</b> damage</div><div><b>'+b.foes.length+' '+b.tn+'</b> · '+eu+' standing · dealt <b>'+Math.round(b.dmgE)+'</b> damage</div><div class="dim mono">'+esc(b.where)+' · '+esc(b.F.n)+' · '+(b.phase==='deploy'?'setting up':mmss(b.bt)+' into the fight')+'</div>';
}
var ORD={form:['Formation','Follows the squad: its order of movement or the order of battle it is using.'],hold:['Hold','Breaks from the formation and holds where it is, in a line.'],guard:['Defense posture','Breaks from the formation and holds where it is in a line, shields raised: +'+GUARD_DEF+' defense, +'+GUARD_SH+' more with a shield, strikes 20% slower, bows down.'],advance:['Advance','Breaks from the formation and goes at the nearest enemy. Archers close to bow range and shoot.'],move:['Move to','Breaks from the formation, walks to the spot you tap and holds there in a line.'],flank:['Flank to','Breaks from the formation, runs to the spot you tap, then charges from there.'],back:['Fall back','Runs off the west edge and leaves the fight.']};
var SQO={hold:['Hold here','The squad stops and keeps its formation where it is.'],guard:['Defense posture','The squad holds its formation and every man raises his shield: +'+GUARD_DEF+' defense, +'+GUARD_SH+' more with a shield, strikes 20% slower, bows down.'],push:['Push forward','The formation walks toward the enemy, keeping its shape, and stops on contact.'],dmarch:['Defense march','The formation walks toward the enemy in defense posture at half walking pace. Slow and tiring: it costs as much endurance as jogging. It halts in defense posture on contact.'],move:['Move to','Tap the field. The squad goes there in formation and holds.'],back:['Fall back','Every team runs off the west edge.']};
function bfPicked(b){var k=UI.bpick;if(!k)return[];if(k.charAt(0)==='u'){var uid=+k.slice(2);return b.teams.filter(function(t){return t.uid===uid})}return b.teams.filter(function(t){return 't:'+t.k===k})}
function bfSquad(b){var k=UI.bpick;return k&&k.charAt(0)==='u'?groupOf(b,+k.slice(2)):null}
function bctlHtml(b){
  var M=S.match,sel=bfPicked(b),sq=bfSquad(b),o='';
  if(b.phase==='deploy'&&b.asl)o+='<p class="msg">They are at the wall. Your garrison and tower men stand to where they are. Move them where you want them, then press Fight.</p>';
  else if(b.phase==='deploy')o+='<p class="msg">Contact. '+(b.ambush?'Your men are hidden and the enemy has not seen them. ':'They were caught on the march, facing the way they were going, and need a few seconds to wheel to face the enemy. ')+'Pick a play or give orders, then press Fight. Nobody moves until then.</p>';
  o+=b.groups.map(function(g){var U=unitById(g.uid);if(!U)return '';var o2=bpOf(U),Q=b.plays&&b.plays[g.uid];return '<div class="bplay"><span class="label">Play · '+esc(U.name)+'</span><select data-bplay="'+g.uid+'" aria-label="Play for '+esc(U.name)+'"><option value="">No play: orders below</option>'+o2.list.map(function(p){return '<option value="'+p.id+'"'+(Q&&Q.pid===p.id?' selected':'')+'>'+esc(p.name)+'</option>'}).join('')+'</select><button class="btn sm" data-act="bpedit" data-u="'+(U.det||U.id)+'">Edit plays</button>'+(g.wheel>0&&b.phase!=='deploy'?'<span class="mono dim">wheeling · '+g.wheel+' s</span>':'')+'</div>'}).join('');
  if(bpWaiting(b,'spring')&&!b.spring)o+='<div class="row"><button class="btn go" data-act="spring">Spring it</button></div>';
  else if(UI.barm)o+='<p class="msg">Tap the battlefield where '+esc(sq?(unitById(sq.uid)||{name:'the squad'}).name:sel.length===1?sel[0].name:'they')+' should go.</p>';
  o+='<div class="bsqs">'+b.groups.map(function(g){
    var U=unitById(g.uid),FM=U?fmOf(U):null,ts=b.teams.filter(function(t){return t.uid===g.uid}),mem=b.units.filter(function(u){return u.uid===g.uid}),al=mem.filter(function(u){return u.alive&&!u.gone}).length;
    var fbtn=FM?[['mv','Order of movement']].concat(FM.ob.map(function(x){return[x.id,x.name]})).map(function(x){return '<button class="btn sm'+(String(g.fo)===String(x[0])?' on':'')+'" data-act="bfob" data-u="'+g.uid+'" data-o="'+x[0]+'">'+esc(x[1])+'</button>'}).join(''):'';
    return '<div class="bsq"><button class="btn sm'+(UI.bpick==='u:'+g.uid?' on':'')+'" data-act="bfsel" data-k="u:'+g.uid+'">'+(U?'Squad '+esc(U.name):esc(gName(b,g)))+' · '+al+'/'+mem.length+(g.mode==='push'?' · pushing':g.mode==='guard'?' · defense posture':g.mode==='dmarch'?' · defense march':'')+'</button>'+
      ts.map(function(t){var tm=mem.filter(function(u){return u.tk===t.k}),ta=tm.filter(function(u){return u.alive&&!u.gone}).length;return '<button class="btn sm tbtn'+(UI.bpick==='t:'+t.k?' on':'')+'" data-act="bfsel" data-k="t:'+t.k+'"><i style="background:'+TCOL[t.col]+'"></i>'+esc(t.name.split(' · ').pop())+' · '+ta+'/'+tm.length+' · '+ORD[t.order][0].toLowerCase()+(t.shoot?'':' · bows off')+'</button>'}).join('')+
      '</div>'+(fbtn?'<div class="bsq fobs"><span class="label">Formation</span>'+fbtn+'</div>':'');
  }).join('')+'</div>';
  if(sq){
    o+='<div class="row">'+['hold','guard','push','dmarch','move','back'].map(function(k){return '<button class="btn sm'+(UI.barm==='sq'&&k==='move'||(!UI.barm&&k!=='move'&&k!=='back'&&sq.mode===k)?' on':'')+'" data-act="bfsq" data-o="'+k+'">'+SQO[k][0]+'</button>'}).join('')+'</div><p class="note">'+esc(UI.barm==='sq'?SQO.move[1]:SQO[sq.mode]&&sq.mode!=='hold'?SQO[sq.mode][0]+': '+SQO[sq.mode][1]:'Squad orders move the whole formation. Hold here: '+SQO.hold[1].toLowerCase()+' Push forward: '+SQO.push[1].toLowerCase())+'</p>';
  }else if(sel.length){
    var cur=sel[0].order,sh=sel.every(function(t){return t.shoot});
    o+='<div class="row">'+['form','hold','guard','advance','move','flank','back'].map(function(k){return '<button class="btn sm'+((UI.barm===k)||(!UI.barm&&sel.every(function(t){return t.order===k}))?' on':'')+'" data-act="bford" data-o="'+k+'">'+ORD[k][0]+'</button>'}).join('')+'<button class="btn sm'+(sh?' on':'')+'" data-act="bfshoot">Bows '+(sh?'on':'off')+'</button></div><p class="note">'+esc(ORD[UI.barm||cur][1])+'</p>';
  }else o+='<p class="note">Switch a squad\'s formation with the buttons above. Pick a squad to move the whole formation, or a single team to break it off with its own orders. With one picked, tap an enemy to charge it.</p>';
  var top='<div class="row bspd"><span class="mono clock">'+mmss(M.clock)+'</span>'+[[0,'Pause'],[1,'1×'],[10,'10×'],[60,'60×']].map(function(x){return '<button class="btn sm'+(M.speed===x[0]?' on':'')+'" data-act="mspd" data-s="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>'+(b.phase==='deploy'?'<div class="row"><button class="btn go" data-act="bfight">Fight</button><button class="btn sm" data-act="bfauto">Let the AI set up</button></div>':'');
  return top+o;
}
/* a close look at one tile: its battlefield ground, and in a match whoever is standing on it right now */
function lookField(c,r){return bfGen(c,r,ix(c,r)*7919+1)}
function lookEnts(c,r){
  var M=S.match,k=ix(c,r),o='',man=function(x,y,eq,f,col,hh){var q=pj(x,y);x=q[0];y=q[1];return '<g transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+')"><ellipse cx="0" cy="0" rx=".8" ry=".38" fill="'+TCOL[col||0]+'"/>'+manG(humanInner(eq,f,hh),false)+'</g>'},foe=function(x,y,t,bb){var q=pj(x,y);x=q[0];y=q[1];return '<g transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+')"><ellipse cx="0" cy="0" rx=".8" ry=".38" fill="#b8432c"/>'+manG(mobInner(t,bb),true)+'</g>'};
  var where=function(o2,home){var p=[BFW*(home?.62:.4),BFH/2],f=[1,0];if(o2.xy&&!(o2.path&&o2.path.length)){var B=fieldBox(c,r),fc=o2.face||[1,0],fd=Math.hypot(fc[0],fc[1])||1;return{pt:[(o2.xy[0]-B[0])/YU,(o2.xy[1]-B[1])/YU],face:[fc[0]/fd,fc[1]/fd]}}if(o2.path&&o2.path.length){var a=center(c,r),b=center(o2.path[0][0],o2.path[0][1]),dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,t=1-o2.rem/HEX_YD;f=[dx/d,dy/d];p=[BFW/2+f[0]*(t-.5)*BFW*.8,BFH/2+f[1]*(t-.5)*BFH*.8]}return{pt:p,face:f}};
  var who=[];
  if(M){
    S.units.forEach(function(U){var L=U.live;if(!L||L.battle||L.pos[0]!==c||L.pos[1]!==r)return;var g=where(L),FM=fmOf(U);who.push(esc(U.name)+' · '+U.hids.length+' men · '+esc((L.status||'').toLowerCase()));teamsOf(U).forEach(function(t,ti){t.hids.forEach(function(id){var h=byId(id);if(!h)return;var q=fmPos(g,{c:h},L.fo!=null?L.fo:'mv',FM);if(L.xy&&(q[0]<-4||q[1]<-4||q[0]>BFW+4||q[1]>BFH+4))return;o+=man(Math.max(2,Math.min(BFW-2,q[0])),Math.max(6,Math.min(BFH-2,q[1])),eqKeys(h),h.sex==='f',ti,h)})})});
    M.camps.forEach(function(m){var here=m.roam&&m.pos&&m.pos[0]===c&&m.pos[1]===r,home=!m.roam&&m.hexes.indexOf(k)>=0;if(!m.mobs.length||!(here||home)||m.inBattle)return;var g=home?{pt:[BFW*.65,BFH/2],face:[1,0]}:where(m);who.push(m.mobs.length+' '+mobWord(m,m.mobs.length>1)+(home?' in their camp':' roaming'));m.mobs.forEach(function(bb,i){var row=Math.floor(i/5),col=i%5;o+=foe(Math.max(2,Math.min(BFW-2,g.pt[0]+(col-2)*3.4-g.face[0]*row*3.4)),Math.max(6,Math.min(BFH-2,g.pt[1]+(col-2)*3.4*g.face[0]-g.face[1]*row*3.4)),m.type,bb)})});
    M.camps.forEach(function(m){if(m.hexes.indexOf(k)>=0&&(m.razed||!m.mobs.length||m.roam))who.push(mobWord(m,0,1)+' camp · '+(m.razed?'burned':'empty, still standing'))});
  }
  var st=setAt(c,r);if(st)who.push(setName(st)+' · '+atSet(st.id).filter(function(h){return h.key==='human'}).length+' people live here');
  return {svg:o,who:who};
}
function lookLive(){if(!S.match)return;((UI.pzDeep||{}).m||[]).forEach(function(k){var en=document.getElementById('lk'+k+'en');if(!en)return;var E=lookEnts(k%COLS,Math.floor(k/COLS));if(LIVE_CACHE['lk'+k]!==E.svg){LIVE_CACHE['lk'+k]=E.svg;en.innerHTML=E.svg}})}
function groundLegend(F){var have={};for(var i=0;i<F.g.length;i++)have[F.g.charAt(i)]=1;return '<div class="glegend">'+Object.keys(GROUND).filter(function(k){return have[k]}).map(function(k){var fl=GFILL[k]||OPEN[F.base]||OPEN.field;return '<span><i style="background:'+fl[0]+'"></i><b>'+GROUND[k].n+'</b> '+esc(GROUND[k].t)+'</span>'}).join('')+'</div>'}
var BVST={n:0};
function bfList(rec,getter){var o=[];rec.ents.forEach(function(e,i){var g=getter(i);if(g)o.push({i:i,s:e.s,x:g[0],y:g[1],hp:g[2],m:e.m,a:g[3],mv:g[4],col:e.col,e:e})});return o}
function bfFlag(x,y,c,op){return '<g opacity="'+op+'"><line x1="'+x.toFixed(1)+'" y1="'+y.toFixed(1)+'" x2="'+x.toFixed(1)+'" y2="'+(y-3.4).toFixed(1)+'" stroke="#1a140c" stroke-width=".3"/><polygon points="'+x.toFixed(1)+','+(y-3.4).toFixed(1)+' '+(x+2).toFixed(1)+','+(y-2.8).toFixed(1)+' '+x.toFixed(1)+','+(y-2.2).toFixed(1)+'" fill="'+c+'"/></g>'}
function bfMarks(b){
  var o='',sel=bfPicked(b),sk={},sq=bfSquad(b),f1=function(v){return v.toFixed(1)};sel.forEach(function(t){sk[t.k]=1});

  b.teams.forEach(function(t){var f=t.tgt!=null&&b.foes[t.tgt];if(f&&f.alive){var q=pj(f.x,f.y);o+='<circle cx="'+f1(q[0])+'" cy="'+f1(q[1]-.9)+'" r="1.6" fill="none" stroke="'+TCOL[t.col]+'" stroke-width=".3" stroke-dasharray=".7 .45"/>'}});
  o+=bpMarks(b);
  b.groups.forEach(function(g){if(g.gone)return;var on=sq===g,q=pj(g.pt[0],g.pt[1]);if(on||g.mode==='push'||g.mode==='dmarch')o+=bfFlag(q[0],q[1],'#f4ead2',on?1:.5);if(on){var U=unitById(g.uid);o+='<text class="bflab" x="'+f1(q[0])+'" y="'+f1(q[1]+4)+'">'+esc(U?U.name:'')+'</text>'}});
  b.teams.forEach(function(t){
    if(t.order==='back'||t.order==='form')return;var mem=b.units.filter(function(u){return u.tk===t.k&&u.alive&&!u.gone});if(!mem.length)return;
    var cx=0,cy=0;mem.forEach(function(u){cx+=u.x;cy+=u.y});cx/=mem.length;cy/=mem.length;
    var on=sk[t.k],c=TCOL[t.col],A=pj(cx,cy),T=pj(t.pt[0],t.pt[1]);
    if(t.order!=='advance'&&(on||t.order==='move'||t.order==='flank')&&Math.hypot(cx-t.pt[0],cy-t.pt[1])>3)o+='<line x1="'+f1(A[0])+'" y1="'+f1(A[1])+'" x2="'+f1(T[0])+'" y2="'+f1(T[1])+'" stroke="'+c+'" stroke-width="'+(on?.7:.4)+'" stroke-dasharray="1.6 1.2" opacity=".85"/>';
    if(t.order!=='advance')o+=bfFlag(T[0],T[1],c,on?1:.6);
    if(on)o+='<text class="bflab" x="'+f1(A[0])+'" y="'+f1(A[1]+5.5)+'">'+esc(t.name.split(' · ').pop())+'</text>';
  });
  return o;
}
function drawBattleView(){
  var b=battleById(UI.bsel);if(!b)return;
  setHtml('bstat',battleStat(b));setHtml('bctl',bctlHtml(b));
  var M=S.match,a=(M.speed>0&&b.phase==='fight')?Math.min(1,LIVE_ACC):1,sk={};bfPicked(b).forEach(function(t){sk[t.k]=1});
  var by={};b.units.concat(b.foes).forEach(function(x){by[x._ri]=x});
  var list=bfList(b.rec,function(i){var x=by[i];if(!x)return null;var px=x.px==null?x.x:x.px,py=x.py==null?x.y:x.py;return[px+(x.x-px)*a,py+(x.y-py)*a,x.hp,x.alive?(x.gone?2:1):0,Math.hypot(x.x-px,x.y-py)>.1&&M.speed>0]});
  list.forEach(function(e){var x=by[e.i];e.hid=!!(x&&x.hid&&x.alive);e.sel=x&&x.tk&&sk[x.tk];e.gd=!!(x&&x.guard&&x.alive);e.shd=!!(x&&x.sh>0&&x.alive)});
  var nev=b.ev.filter(function(ev){return ev.n>BVST.n}),dur=Math.max(250,Math.min(600,1000/Math.max(1,M.speed)));
  var host=document.getElementById('bview');
  if(host){if(host.dataset.k!==String(b.id)){host.dataset.k=String(b.id);host.innerHTML=placeField(bfSvg(b.F,'bv',true),b.F);nev=[]}
    bfDrawEnts('bv',list);if(!NOMOTION&&M.speed>0&&M.speed<=10){var dfx=document.getElementById('bvfx');if(dfx)b.units.concat(b.foes).forEach(function(x){if(!x.alive||x.px==null)return;var sp=Math.hypot(x.x-x.px,x.y-x.py);if(sp>3.2&&Math.random()<.35){var q=pj(x.px,x.py);fxAdd(dfx,'circle',{cx:q[0].toFixed(2),cy:q[1].toFixed(2),r:.35,class:'fx-dust'},[{transform:'scale(.6)',opacity:.7},{transform:'scale(2.2)',opacity:0}],500)}})}var mk=document.getElementById('bvmk'),mh=bfMarks(b);if(mk&&LIVE_CACHE.bvmk!==mh){mk.innerHTML=mh;LIVE_CACHE.bvmk=mh}}
  var ph=document.getElementById('pipv');
  if(ph&&UI.pip){CAM_FORCE=UI.pip;if(ph.dataset.k!==b.id+UI.pip){ph.dataset.k=b.id+UI.pip;ph.innerHTML=bfSvg(b.F,'cv',false)}var l2=list.map(function(e){var c={};for(var q in e)c[q]=e[q];return c});bfDrawEnts('cv',l2);bfFx('cv',nev,dur,BVST.n);var pv=ph.querySelector('svg.bfield'),ax=1e9,ay=1e9,bx=-1e9,by=-1e9;l2.forEach(function(e){if(e.a!==1)return;var q=pj(e.x,e.y);ax=Math.min(ax,q[0]);bx=Math.max(bx,q[0]);ay=Math.min(ay,q[1]);by=Math.max(by,q[1])});if(pv&&ax<1e9){var cxp=(ax+bx)/2,cyp=(ay+by)/2-1,ww=Math.max(56,bx-ax+24),hh=Math.max(ww/1.6,by-ay+18);ww=Math.max(ww,hh*1.6);pv.setAttribute('viewBox',(cxp-ww/2).toFixed(1)+' '+(cyp-hh/2).toFixed(1)+' '+ww.toFixed(1)+' '+hh.toFixed(1))}CAM_FORCE=null}
  if(host)BVST.n=bfFx('bv',nev,dur,BVST.n);else if(nev.length)BVST.n=nev[nev.length-1].n;
}
var CAM_FORCE=null;
function pipHtml(){if(!UI.pip||!S.match||!activeBattles().length)return '';var nm=(CAMS.filter(function(x){return x[0]===UI.pip})[0]||['',''])[1];return '<div class="pip" aria-label="Camera on the fight"><div class="pzhd"><b>Camera · '+esc(nm.toLowerCase())+'</b><button class="btn sm" data-act="pipcam" data-v="" aria-label="Close the camera">×</button></div><div id="pipv" class="bfwrap"></div></div>'}
