/* ---------- fort works ---------- */
function wnid(){S.wid=(S.wid||0)+1;return S.wid}
function timHave(k){var n=0;ownedMat(k).forEach(function(c){n+=c.n==null?TIMB_N:c.n});return n}
function payTim(k,n){ownedMat(k).sort(function(a,b){return (a.n==null?TIMB_N:a.n)-(b.n==null?TIMB_N:b.n)}).forEach(function(c){if(n<=0)return;if(c.n==null)c.n=TIMB_N;var t=Math.min(n,c.n);c.n-=t;n-=t;if(c.n<=0)S.cards.splice(S.cards.indexOf(c),1)})}
function walls(){return (S.lines||[]).filter(function(l){return l.type==='wall'})}
function gates(){return (S.lines||[]).filter(function(l){return l.type==='gate'})}
function towers(){return (S.lines||[]).filter(function(l){return l.type==='tower'})}
function hasWalls(){return (S.lines||[]).some(function(l){return l.type==='wall'})}
function towerOf(hid){var t=null;towers().forEach(function(x){if((x.men||[]).indexOf(hid)>=0)t=x});return t}
function towerOff(hid){towers().forEach(function(x){x.men=(x.men||[]).filter(function(i){return i!==hid})})}
/* labor: a free man (not in a unit, not on a tower, not the one picked at an altar), from your hand first */
function laborFree(){var inU={},pr={};S.units.forEach(function(U){U.hids.forEach(function(h){inU[h]=1})});S.setl.forEach(function(x){if(x.altar&&x.altar.pr)pr[x.altar.pr]=1});return S.cards.filter(function(c){return c.key==='human'&&c.sex!=='f'&&!inU[c.id]&&!pr[c.id]&&!towerOf(c.id)}).sort(function(a,b){return (a.at===null?0:1)-(b.at===null?0:1)})}
function laborNeed(n){return S.tut?0:n}/* labor is free in the tutorial, both parts */
function payLabor(n){laborFree().slice(0,laborNeed(n)).forEach(killHuman)}
function laborText(n){n=laborNeed(n);return n?n+' '+(n===1?'man':'men')+' as labor':''}
function palCost(h,m){return{cost:PALS[h].cost,tk:PALS[h].tim,tn:PAL_TIM,mats:{},lab:Math.ceil(m/PAL_LAB_M)}}
function gateCost(w){return{cost:GATE.cost,tk:PALS[w.h].tim,tn:GATE.tim,mats:GATE.mats,lab:GATE.lab}}
function towerCost(){return{cost:TOWER.cost,tk:'ltimber',tn:TOWER.tim,mats:TOWER.mats,lab:TOWER.lab}}
function workShort(o){var m=[];if(S.prestige<(o.cost||0))m.push('prestige ('+S.prestige+' of '+o.cost+')');if(o.tk&&timHave(o.tk)<o.tn)m.push(CD[o.tk].n.toLowerCase()+' ('+timHave(o.tk)+' of '+o.tn+')');m=m.concat(matsShort(o.mats));var L=laborNeed(o.lab||0);if(L&&laborFree().length<L)m.push('men free for labor ('+laborFree().length+' of '+L+')');return m}
function workPay(o){S.prestige-=o.cost||0;if(o.tk)payTim(o.tk,o.tn);payMats(o.mats);payLabor(o.lab||0)}
function workText(o){return [(o.cost||0)+' prestige',o.tk?o.tn+' '+CD[o.tk].n.toLowerCase():'',matsText(o.mats),laborText(o.lab||0)].filter(Boolean).join(' + ')}
/* a wall's length, its panels and where a distance along it falls */
function wallGeo(w){var P=w.pts,cum=[0],i;for(i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));var L=cum[cum.length-1]||1e-6,n=Math.max(1,Math.round(L*MPU/PANEL_M));
  function at(s){s=Math.max(0,Math.min(L,s));for(var j=1;j<P.length;j++)if(s<=cum[j]||j===P.length-1){var t=(s-cum[j-1])/((cum[j]-cum[j-1])||1);return[P[j-1][0]+(P[j][0]-P[j-1][0])*t,P[j-1][1]+(P[j][1]-P[j-1][1])*t]}return P[0]}
  function slice(a,b){var o=[at(a)];for(var j=1;j<P.length-1;j++)if(cum[j]>a&&cum[j]<b)o.push(P[j]);o.push(at(b));return o}
  var bx=[1e9,1e9,-1e9,-1e9];P.forEach(function(p){bx[0]=Math.min(bx[0],p[0]);bx[1]=Math.min(bx[1],p[1]);bx[2]=Math.max(bx[2],p[0]);bx[3]=Math.max(bx[3],p[1])});
  return {L:L,n:n,at:at,slice:slice,cum:cum,bx:bx}}
function wallById(id){var o=null;walls().forEach(function(w){if(w.id===id)o=w});return o}
function gatePanels(w,G){var o={};gates().forEach(function(g){if(g.w!==w.id)return;var i0=Math.max(0,Math.min(G.n-2,Math.round(g.s/G.L*G.n)-1));o[i0]=g.id;if(G.n>1)o[i0+1]=g.id});return o}
/* panel and gate health live in the match, so every match starts with whole walls */
function panHP(w,G){var M=S.match;if(!M)return null;M.whp=M.whp||{};var a=M.whp[w.id];if(!a||a.length!==G.n){a=M.whp[w.id]=[];for(var i=0;i<G.n;i++)a.push(PALS[w.h].hp)}return a}
function gateHP(gid){var M=S.match;if(!M)return 1;M.ghp=M.ghp||{};if(M.ghp[gid]==null){var g=null;gates().forEach(function(x){if(x.id===gid)g=x});var w=g&&wallById(g.w);M.ghp[gid]=w?PALS[w.h].hp:PALS.s.hp}return M.ghp[gid]}
function nearWall(p){var best=null;walls().forEach(function(w){var G=wallGeo(w);for(var j=1;j<w.pts.length;j++){var a=w.pts[j-1],b=w.pts[j],vx=b[0]-a[0],vy=b[1]-a[1],q=vx*vx+vy*vy||1,t=Math.max(0,Math.min(1,((p[0]-a[0])*vx+(p[1]-a[1])*vy)/q)),x=a[0]+vx*t,y=a[1]+vy*t,d=Math.hypot(p[0]-x,p[1]-y);if(!best||d<best.d)best={w:w,G:G,d:d,s:G.cum[j-1]+Math.sqrt(q)*t,pt:[x,y],a:Math.atan2(vy,vx)*180/Math.PI}}});return best}
/* the first standing panel or shut gate a step from p0 to p1 runs into */
function segXi(p1,p2,p3,p4){function o(a,b,c){return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])}var d1=o(p3,p4,p1),d2=o(p3,p4,p2),d3=o(p1,p2,p3),d4=o(p1,p2,p4);return d1*d2<=0&&d3*d4<=0&&!(d1===0&&d2===0)}
function wallCross(p0,p1){var hit=null;walls().forEach(function(w){var G=wallGeo(w);if(Math.max(p0[0],p1[0])<G.bx[0]||Math.min(p0[0],p1[0])>G.bx[2]||Math.max(p0[1],p1[1])<G.bx[1]||Math.min(p0[1],p1[1])>G.bx[3])return;var hp=panHP(w,G),gp=gatePanels(w,G);
  for(var i=0;i<G.n;i++){var gid=gp[i];if(gid!=null?gateHP(gid)<=0:(hp&&hp[i]<=0))continue;var sl=G.slice(i*G.L/G.n,(i+1)*G.L/G.n);for(var j=1;j<sl.length;j++)if(segXi(p0,p1,sl[j-1],sl[j])){var d=Math.hypot(sl[j][0]-p0[0],sl[j][1]-p0[1]);if(!hit||d<hit.d)hit={w:w,i:i,g:gid,pt:sl[j-1],d:d}}}});return hit}
/* a settlement's core: where its longhouses stand. Hamlets 2.5 ha with 8 longhouses, villages 7.5 ha with 24 */
function coreOf(s){var C=CORE[s.type],c=center(s.c,s.r);if(s.c2!=null){var c2=center(s.c2,s.r2);c=[(c[0]+c2[0])/2,(c[1]+c2[1])/2]}if(!C)return{lh:[],r:0,c:c};var r=Math.sqrt(C.ha*1e4/Math.PI)/MPU;
  if(!s.lh||s.lh.length!==C.lh){s.lh=[];for(var i=0;i<C.lh;i++){var ring=i<8?0:1,k=ring?i-8:i,nn=ring?C.lh-8:Math.min(8,C.lh),a=k/nn*Math.PI*2+(ring?.2:0),rr=r*(ring?.74:(C.lh>8?.4:.58));s.lh.push([Math.round(Math.cos(a)*rr*100)/100,Math.round(Math.sin(a)*rr*100)/100,Math.round(a*180/Math.PI+90)%360])}}
  if(!s.alt)s.alt=[0,0];return{lh:s.lh,r:r,c:c}}
function lhT(C,Q){return 'translate('+(C.c[0]+Q[0]).toFixed(2)+' '+(C.c[1]+Q[1]).toFixed(2)+') rotate('+(Q[2]||0)+')'}
/* drawn on the map above the ground. Walls, gates and towers step aside when you zoom right in: the ground shows them then */
function worksSvg(){var o='',M=S.match,hl=LH_M[0]/2/MPU,hw=LH_M[1]/2/MPU;
  walls().forEach(function(w){var G=wallGeo(w),hp=panHP(w,G),gp=gatePanels(w,G),run=null,runs=[];for(var i=0;i<G.n;i++){var ok=gp[i]==null&&!(hp&&hp[i]<=0);if(ok){var sl=G.slice(i*G.L/G.n,(i+1)*G.L/G.n);run=run?run.concat(sl.slice(1)):sl}else if(run){runs.push(run);run=null}}if(run)runs.push(run);
    runs.forEach(function(r){var pts=r.map(function(p){return p[0].toFixed(2)+','+p[1].toFixed(2)}).join(' ');o+='<polyline class="wk wkw wall-o wall-'+w.h+'" points="'+pts+'"/><polyline class="wk wkw wall-i wall-'+w.h+'" points="'+pts+'"/>'})});
  gates().forEach(function(g){var p=g.pts[0],br=M&&gateHP(g.id)<=0;o+='<g class="wk wkw gate'+(br?' broken':'')+'" transform="translate('+p[0]+' '+p[1]+') rotate('+(g.a||0)+')"><rect class="gate-door" x="-.27" y="-.16" width=".54" height=".32"/><rect class="gate-post" x="-.36" y="-.24" width=".1" height=".48"/><rect class="gate-post" x=".26" y="-.24" width=".1" height=".48"/></g>'});
  towers().forEach(function(t){var p=t.pts[0],n=(t.men||[]).filter(byId).length;o+='<g class="wk wkw tower" transform="translate('+p[0]+' '+p[1]+')"><rect class="tw-deck" x="-.32" y="-.32" width=".64" height=".64"/><path class="tw-x" d="M-.32 -.32L.32 .32M.32 -.32L-.32 .32"/>'+(n?'<text class="tw-n" x="0" y="-.48">'+n+'</text>':'')+'</g>'});
  S.setl.forEach(function(s){var C=coreOf(s);if(!C.r)return;
    C.lh.forEach(function(q,i){o+='<g class="wk lh" data-lh="'+s.id+':'+i+'" transform="'+lhT(C,q)+'"><title>Longhouse · about 20 people · drag to move, tap to turn</title><rect class="lh-sh" x="'+(-hl+.12).toFixed(2)+'" y="'+(-hw+.14).toFixed(2)+'" width="'+(hl*2).toFixed(2)+'" height="'+(hw*2).toFixed(2)+'"/><rect class="lh-roof" x="'+(-hl).toFixed(2)+'" y="'+(-hw).toFixed(2)+'" width="'+(hl*2).toFixed(2)+'" height="'+(hw*2).toFixed(2)+'" rx=".12"/><line class="lh-ridge" x1="'+(-hl+.15).toFixed(2)+'" y1="0" x2="'+(hl-.15).toFixed(2)+'" y2="0"/><rect class="lh-door" x="-.1" y="'+(hw-.1).toFixed(2)+'" width=".2" height=".14"/></g>'});
    if(s.altar)o+='<g class="wk lh" data-lh="'+s.id+':a" transform="'+lhT(C,s.alt)+'"><title>Flint altar · drag to move</title><rect class="alt-st" x="-.26" y="-.16" width=".52" height=".32"/><path class="alt-h" d="M-.2 -.16L-.3 -.42M.2 -.16L.3 -.42"/></g>';
  });
  return '<g class="works">'+o+'</g>'}
/* the fort works section of the Realm tab */
function drawLenM(D){var t=0;(D.segs||[]).concat([D.pts||[]]).forEach(function(P){for(var i=1;i<P.length;i++)t+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1])});return t*MPU}
function fortPanel(){var D=UI.draw&&UI.draw.fk?UI.draw:null,lf=laborFree().length;
  var btn=function(k,lab){return '<button class="btn sm'+(D&&D.fk===k?' on':'')+'" data-act="draw" data-k="'+k+'">'+lab+'</button>'};
  var o='<p class="label">Fort works · '+timHave('stimber')+' small timber · '+timHave('ltimber')+' large timber · '+lf+' m'+(lf===1?'a':'e')+'n free for labor</p><div class="row">'+
    btn('wall_s','Small palisade, 6 ft · '+PALS.s.cost+' prestige + '+PAL_TIM+' small timber'+(laborNeed(1)?' + 1 man per 100 m':''))+btn('wall_l','Large palisade, 10 ft · '+PALS.l.cost+' prestige + '+PAL_TIM+' large timber'+(laborNeed(1)?' + 1 man per 100 m':''))+
    btn('gate','Gate · '+GATE.cost+' prestige + '+GATE.tim+' timber of the wall + '+matsText(GATE.mats)+(laborNeed(1)?' + 1 man':''))+btn('tower','Watchtower · '+workText(towerCost()))+'</div>';
  if(D&&D.type==='wall'){var len=drawLenM(D),left=Math.max(0,PAL_M-len),pc=palCost(D.h,len),miss=len>0?workShort(pc):[];
    o+='<p class="note">Draw the '+PALS[D.h].n.toLowerCase()+' point by point, like a road. One palisade is '+PAL_M+' m of wall: just enough for one tight loop round a hamlet. Drawn <b>'+Math.round(len)+' m</b> · '+Math.round(left)+' m left · about '+Math.round(len/PANEL_M)+' panels'+(laborNeed(1)?' · labor '+Math.ceil(len/PAL_LAB_M)+' m'+(Math.ceil(len/PAL_LAB_M)===1?'a':'e')+'n':'')+'. <b>New piece</b> starts a separate stretch, like a funnel arm by the gate. Whatever you leave undrawn is lost when you finish.</p>'+(miss.length?'<p class="msg bad">Short on '+miss.join(', ')+'.</p>':'')+
      '<div class="row"><button class="btn sm go" data-act="dfinish"'+(D.segs.length||D.pts.length>=2?'':' disabled')+'>Finish palisade</button><button class="btn sm" data-act="dpiece"'+(D.pts.length>=2?'':' disabled')+'>New piece</button><button class="btn sm" data-act="dundo"'+(D.pts.length||D.segs.length?'':' disabled')+'>Undo point</button><button class="btn sm" data-act="dcancel">Cancel</button></div>'}
  else if(D&&D.type==='gate')o+='<p class="note">Tap right on a palisade to set a gate in it. It takes the place of two panels, opens by itself for your men and stays shut to enemies. It costs timber of its wall\'s size. <button class="btn sm" data-act="dcancel">Cancel</button></p>';
  else if(D&&D.type==='tower')o+='<p class="note">Tap anywhere on your ground to raise a watchtower: inside the walls, on a palisade, out on the approach, on a footbridge. <button class="btn sm" data-act="dcancel">Cancel</button></p>';
  return o+towerRoster()}
function towerRoster(){var T=towers();if(!T.length)return '';var el=laborFree();
  return '<p class="label">Watchtowers · up to '+TOWER.cap+' on each</p>'+T.map(function(t,ti){var p=t.pts[0],k=hexAtXY(p[0],p[1]),men=(t.men||[]).map(byId).filter(Boolean);
    return '<div class="row twrow"><span class="label">Tower '+(ti+1)+' · '+lab(k%COLS,Math.floor(k/COLS))+' · '+men.length+'/'+TOWER.cap+'</span>'+men.map(function(h){return '<button class="btn sm" data-act="twoff" data-h="'+h.id+'" title="Bring him down">'+esc(hname(h))+' ×</button>'}).join('')+
      (men.length<TOWER.cap&&el.length?'<select data-twadd="'+t.id+'" aria-label="Station a man on tower '+(ti+1)+'"><option value="">Station a man…</option>'+el.map(function(h){return '<option value="'+h.id+'">'+esc(hname(h))+(defStance(h)==='shoot'?' · archer':'')+'</option>'}).join('')+'</select>':'')+'</div>'}).join('')+
    '<p class="note">Men on a tower stand 15 ft up: +20% bow range and hit chance, and enemies on the ground cannot reach them in melee. They fight in any battle whose ground takes in their tower. A man on a tower is not in a unit. Pick any free man; archers and casters do best up there.</p>'}
/* a tap on the map while laying a fort work */
function fortClick(p){var D=UI.draw,k=hexAtXY(p[0],p[1]),kc=k%COLS,kr=Math.floor(k/COLS),cc=center(kc,kr);
  if(k<0||Math.hypot(cc[0]-p[0],cc[1]-p[1])>SH||!placedAt(kc,kr)){say('Fort works go on your own ground. Tap inside a tile you have placed.',true);return render()}
  if(D.type==='wall'){var left=PAL_M-drawLenM(D);if(left<=.5){say('That is the whole palisade: '+PAL_M+' m. Finish it, or undo a point.',true);return render()}
    var snp=[];if(D.pts.length>2)snp.push(D.pts[0]);D.segs.forEach(function(P){snp.push(P[0],P[P.length-1])});walls().forEach(function(w){snp.push(w.pts[0],w.pts[w.pts.length-1])});snp.forEach(function(q){if(Math.hypot(q[0]-p[0],q[1]-p[1])<.8)p=q.slice()});
    say('');if(D.pts.length){var lp=D.pts[D.pts.length-1],dm=Math.hypot(p[0]-lp[0],p[1]-lp[1])*MPU;if(dm>left){var f=left/dm;p=[Math.round((lp[0]+(p[0]-lp[0])*f)*100)/100,Math.round((lp[1]+(p[1]-lp[1])*f)*100)/100];say('The palisade runs out here: that is all '+PAL_M+' m.')}}
    D.pts.push(p);return render()}
  if(D.type==='tower'){var to=towerCost(),tm=workShort(to);if(tm.length){say('Short on '+tm.join(', ')+'. A watchtower costs '+workText(to)+'.',true);return render()}
    workPay(to);S.lines.push({type:'tower',id:wnid(),pts:[p],hexes:lineHexes([p]),men:[]});UI.draw=null;say('Watchtower raised at '+lab(kc,kr)+'. Spent '+workText(to)+'. Station up to four men on it below.');save();return render()}
  if(D.type==='gate'){var nw=nearWall(p);if(!nw||nw.d>1.5){say('Tap right on a palisade to set a gate in it.',true);return render()}
    var G=nw.G,pm=G.L/G.n;if(G.n<4||nw.s<pm*1.5||nw.s>G.L-pm*1.5){say('Too near the end of that wall. A gate needs wall on both sides.',true);return render()}
    if(gates().some(function(g){return g.w===nw.w.id&&Math.abs(g.s-nw.s)<pm*2.5})){say('There is already a gate there.',true);return render()}
    var go=gateCost(nw.w),gm=workShort(go);if(gm.length){say('Short on '+gm.join(', ')+'. A gate in this wall costs '+workText(go)+'.',true);return render()}
    workPay(go);var gp=[Math.round(nw.pt[0]*100)/100,Math.round(nw.pt[1]*100)/100];S.lines.push({type:'gate',id:wnid(),w:nw.w.id,s:Math.round(nw.s*1000)/1000,pts:[gp],hexes:lineHexes([gp]),a:Math.round(nw.a)});UI.draw=null;say('Gate set in the '+PALS[nw.w.h].n.toLowerCase()+' at '+lab(kc,kr)+'. Spent '+workText(go)+'.');save();return render()}
}
function finishWall(){var D=UI.draw,pcs=D.segs.concat(D.pts.length>=2?[D.pts]:[]);if(!pcs.length){say('Draw at least one stretch of wall: two points or more.',true);return render()}
  var len=drawLenM({segs:pcs,pts:[]}),o=palCost(D.h,len),ms=workShort(o);if(ms.length){say('Short on '+ms.join(', ')+'.',true);return render()}
  workPay(o);var lot=wnid();pcs.forEach(function(pts){S.lines.push({type:'wall',id:wnid(),lot:lot,h:D.h,pts:pts,hexes:lineHexes(pts)})});
  var lost=Math.max(0,PAL_M-len),h=D.h;UI.draw=null;say(PALS[h].n+' built: '+Math.round(len)+' m of wall in '+pcs.length+' piece'+(pcs.length>1?'s':'')+'. Spent '+workText(o)+'.'+(lost>1?' The other '+Math.round(lost)+' m were never drawn and are lost.':''));save();return render()}
function shiftLines(dx,dy){(S.lines||[]).forEach(function(l){l.pts=l.pts.map(function(p){return[Math.round((p[0]+dx)*10)/10,Math.round((p[1]+dy)*10)/10]});l.hexes=lineHexes(l.pts)})}

