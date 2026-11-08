/* ---------- events ---------- */
document.addEventListener('click',function(e){
  if(UI.leg&&UI.leg.kind==='b'){var bz=e.target.closest&&e.target.closest('svg.board');if(bz&&!e.target.closest('.tmk')){var bpt=bz.createSVGPoint();bpt.x=e.clientX;bpt.y=e.clientY;var bq=bpt.matrixTransform(bz.getScreenCTM().inverse());UI.leg.pts.push([Math.round(Math.max(1,Math.min(BPW-1,bq.x))*10)/10,Math.round(Math.max(1,Math.min(BPH-1,bq.y))*10)/10]);return render()}}
  if(UI.leg&&UI.leg.kind!=='b'){var lz=e.target.closest&&e.target.closest('svg[data-pz]');if(lz&&!(e.target.closest('.tmk'))){var lp=lz.createSVGPoint();lp.x=e.clientX;lp.y=e.clientY;var lq=lp.matrixTransform(lz.getScreenCTM().inverse());return legAddPt([lq.x,lq.y])}}
  if(UI.draw&&UI.draw.fk&&UI.tab==='realm'&&!S.match){var fz=e.target.closest&&e.target.closest('svg[data-pz]');if(fz){var fp=fz.createSVGPoint();fp.x=e.clientX;fp.y=e.clientY;var fq=fp.matrixTransform(fz.getScreenCTM().inverse());return fortClick([Math.round(fq.x*100)/100,Math.round(fq.y*100)/100])}}
  var b=e.target.closest('[data-act]');if(!b)return;
  var d=b.dataset,a=d.act;
  if(a==='tab'){UI.tab=d.tab;say('');UI.confirm=false;UI.rc=false;return render()}
  if(a==='save'){save();var nw=new Date();UI.saved='Saved at '+nw.getHours()+':'+String(nw.getMinutes()).padStart(2,'0')+'.';return render()}
  if(a==='norestart'){UI.rc=false;return render()}
  if(a==='tutstart'){if(!UI.tc){UI.tc=true;return render()}UI.tc=false;return tutStart()}
  if(a==='tutnext'){var cs=tutStep();if(cs&&(!cs.chk||cs.chk())){S.tut.step++;tutEnter();save()}window.scrollTo(0,0);return render()}
  if(a==='tutskip'){if(S.tut){S.tut.step++;tutEnter();save()}window.scrollTo(0,0);return render()}
  if(a==='tutenc'){var es=tutStep();if(es&&es.enc&&!S.match){S.tut.enc=es.enc;UI.mshare=.25;startMatch()}return}
  if(a==='tutquit'){if(S.match)return;S.tut=null;save();say('Tutorial closed. This realm is yours to keep.');return render()}
  if(a==='tutend'){if(d.v==='old'){try{var o2=localStorage.getItem(TKEY);if(o2){S=JSON.parse(o2);localStorage.removeItem(TKEY);COLS=9;ROWS=7;migrate();syncDims();initUI();UI.tab='packs';say('Your old realm is back.');save();return render()}}catch(x){}}S.tut=null;try{localStorage.removeItem(TKEY)}catch(x){}UI.tab='packs';say('The realm is yours. Good luck out there.');save();return render()}
  if(a==='restart'){
    if(!UI.rc){UI.rc=true;return render()}
    COLS=9;ROWS=7;fresh();save();initUI();UI.tab='packs';UI.rc=false;UI.mres=null;UI.res=null;UI.tile=null;UI.fresh=[];UI.place=null;UI.confirm=false;UI.mview='mine';say('');UI.saved='Realm deleted. Fresh start.';return render();
  }
  if(a==='open'){
    var pkk=PACKS[d.k]?d.k:'booster';if(packCount(pkk)<1)return;openPackOf(pkk);
    say('');save();return render();
  }
  if(a==='look'){UI.pzGo={k:UI.tab==='match'?'m':'r',c:+d.c,r:+d.r};return render()}
  if(a==='mfold'){UI.mfold=UI.mfold||{};UI.mfold[d.k]=!UI.mfold[d.k];try{localStorage.setItem(KEY+'-folds',JSON.stringify(UI.mfold))}catch(x){}LIVE_CACHE.nb=null;return render()}
  if(a==='mfoldall'){var sh=!MFOLDS.every(function(k){return (UI.mfold||{})[k]});UI.mfold={};MFOLDS.forEach(function(k){UI.mfold[k]=sh});try{localStorage.setItem(KEY+'-folds',JSON.stringify(UI.mfold))}catch(x){}LIVE_CACHE.nb=null;return render()}
  if(a==='razego'){UI.campPop=null;var ZU2=unitById(+d.u);if(ZU2&&S.match){tutFlag('bn');if(!ZU2.live)initLive(ZU2);var ZL2=ZU2.live;if(ZL2.battle){say(ZU2.name+' is in a fight.',true);return render()}ZL2.mode='raze';ZL2.target=d.k;ZL2.path=[];ZL2.chase=null;ZL2.tk=null;var zm2=campByKey(d.k),zp2=lairPos(zm2);mlog(ZU2.name+' marches to destroy the camp at '+lab(zp2[0],zp2[1])+'.','dim');save()}return render()}
  if(a==='campx'){UI.campPop=null;return render()}
  if(a==='lootok'){UI.lootPop=null;return render()}
  if(a==='lookx'){UI.look=null;return render()}
  if(a==='cam'){UI.cam=d.v;LIVE_CACHE.nb=null;LIVE_CACHE.lk=null;LIVE_CACHE.bvmk=null;return render()}
  if(a==='claim'){packAdd(PACKS[d.k]&&d.k!=='starter'?d.k:'booster',1);save();return render()}
  if(a==='altar'){var as=setById(+d.s),ac=pool().filter(function(c){return c.key==='altar'})[0];if(!as||as.altar||as.type==='camp'||!ac||S.match)return render();if(S.prestige<ALTAR_COST){say('An altar costs '+ALTAR_COST+' prestige.',true);return render()}S.prestige-=ALTAR_COST;S.cards.splice(S.cards.indexOf(ac),1);as.altar={pr:null};say('An altar stands in the '+SETT[as.type].n.toLowerCase()+' at '+lab(as.c,as.r)+'. '+ALTAR_COST+' prestige sunk.');save();return render()}
  if(a==='priest'){var ps=setById(+d.s),ph=byId(+d.h);if(ps&&ps.altar&&ph&&ph.sex==='f'&&ph.at===ps.id){ps.altar.pr=ph.id;say(hname(ph)+' is now priestess of the altar.')}save();return render()}
  if(a==='unpriest'){var us2=setById(+d.s);if(us2&&us2.altar)us2.altar.pr=null;save();return render()}
  if(a==='sacA'){UI.sacA=d.k;return render()}
  if(a==='sacrifice'){var ss=setById(+d.s),T=byId(UI.sacT)||S.cards.filter(function(c){return c.key==='human'&&c.at===(ss&&ss.id)})[0],sc={};pool().forEach(function(c){if(kindOf(c)==='animal')sc[c.key]=1});var k=sacPick(T,sc),an=pool().filter(function(c){return c.key===k})[0];
    if(!ss||!ss.altar||!ss.altar.pr||!T||!an||S.match)return render();
    if(T.boon&&T.boon.k!==k){say(hname(T)+' already carries the '+BOON[T.boon.k].n.toLowerCase()+'. One animal kind per person.',true);return render()}
    if(S.prestige<SAC_COST){say('A sacrifice costs '+SAC_COST+' prestige.',true);return render()}
    var V=byId(UI.sacV);if(!V||V.key!=='human'||V.at!==ss.id||V===T||V.id===ss.altar.pr){say('Pick one more person living here to give to the gods.',true);return render()}
    var dem=sacDem(ss,k),dsh=matsShort(dem);if(dsh.length){say('The altar asks for '+matsText(dem)+'. Short on '+dsh.join(', ')+'.',true);return render()}
    var B=BOON[k],roll=Math.round((B.lo+Math.random()*(B.hi-B.lo))*10)/10,vn=hname(V);S.prestige-=SAC_COST;S.cards.splice(S.cards.indexOf(an),1);payMats(dem);delete ss.altar.dem[k];killHuman(V);UI.sacV=null;
    T.boon=T.boon||{k:k,p:0,n:0};T.boon.p=Math.round((T.boon.p+roll)*10)/10;T.boon.n++;
    say(hname(byId(ss.altar.pr))+' sacrifices a '+B.n.toLowerCase()+', '+vn+' and '+matsText(dem)+' for '+hname(T)+'. '+B.a+' +'+roll+'%'+(T.boon.n>1?', '+T.boon.p+'% in all from '+T.boon.n+' '+B.n.toLowerCase()+'s':'')+'. Cost: '+SAC_COST+' prestige.');save();return render()}
  if(a==='assign'){
    var c=byId(+d.id);if(!c||c.key!=='human')return;if(!S.setl.length){say('Place a settlement first.',true);return render()}
    var tsid=UI.sel||S.setl[0].id;if(c.sex==='f'&&!shrineAt(tsid)){say(womanMsg()+' Raise an altar first, or pick a settlement that has one under Assign men to.',true);return render()}
    c.at=tsid;say(c.sex==='f'?hname(c)+' goes to serve at the shrine in '+setName(setById(tsid))+'.':'');save();return render();
  }
  if(a==='assignall'){
    inHand().forEach(function(c){if(c.key==='human'&&c.sex!=='f'&&fpass('hand',c))c.at=UI.sel||S.setl[0].id});
    say('');save();return render();
  }
  if(a==='selset'){UI.sel=+d.id;UI.hum=null;say('');return render()}
  if(a==='selhum'){UI.hum=+d.id;say('');return render()}
  if(a==='equip')return toggleEquip(+d.id);
  if(a==='draw'&&/^(wall_s|wall_l|gate|tower)$/.test(d.k)){UI.place=null;UI.zoom=null;if(UI.draw&&UI.draw.fk===d.k){UI.draw=null;say('');return render()}
    var pre=d.k==='tower'?towerCost():d.k==='gate'?null:palCost(d.k.slice(-1),0),pms=pre?workShort(pre):[];if(pms.length){say('Short on '+pms.join(', ')+'.',true);return render()}
    if(d.k==='gate'&&!walls().length){say('Build a palisade first. A gate goes in a wall.',true);return render()}
    UI.draw=d.k==='gate'||d.k==='tower'?{type:d.k,fk:d.k,pts:[]}:{type:'wall',fk:d.k,h:d.k.slice(-1),pts:[],segs:[]};say(d.k==='gate'?'Tap a palisade.':d.k==='tower'?'Tap where the tower goes.':'Tap the map to lay the wall. Zoom in for precision.');return render()}
  if(a==='dpiece'){var DP=UI.draw;if(DP&&DP.segs&&DP.pts.length>=2){DP.segs.push(DP.pts);DP.pts=[];say('New piece: tap where it starts.')}return render()}
  if(a==='supsel'){var sv=d.id==='p'?'p':+d.id;UI.supSel=UI.supSel===sv?null:sv;return render()}
  if(a==='twoff'){towerOff(+d.h);save();return render()}
  if(a==='draw'){UI.draw=UI.draw&&UI.draw.type===d.k?null:{type:d.k,pts:[]};UI.zoom=null;UI.place=null;say(UI.draw?'Tap a tile to zoom in on it.':'');return render()}
  if(a==='dundo'){var DU=UI.draw;if(DU){if(!DU.pts.length&&DU.segs&&DU.segs.length)DU.pts=DU.segs.pop();DU.pts.pop()}return render()}
  if(a==='dcancel'){UI.draw=null;UI.zoom=null;say('');return render()}
  if(a==='dfinish')return UI.draw&&UI.draw.fk?finishWall():finishLine('');
  if(a==='plc'){UI.draw=null;var same=UI.place&&UI.place.t===d.t&&UI.place.k===d.k;UI.place=same?null:{t:d.t,k:d.k};say(UI.place?'Tap a hex to place it.':'');return render()}
  if(a==='hex'&&UI.tab==='realm'&&UI.draw)a='zpt';
  if(a==='bzoom'){var ZB=battleById(+d.id);if(ZB){UI.bsel=ZB.id;UI.pzGo=bGo(ZB);UI.tile=null}return render()}
  if(a==='rot'){UI.rot=+d.d;return render()}
  if(a==='pzgo'){UI.pzGo={k:d.k||'m',c:+d.c,r:+d.r};if(d.k==='m'||!d.k)UI.tile=null;else UI.look=null;return render()}
  if(a==='pzz'){var zs=document.querySelector('svg[data-pz="'+d.k+'"]');if(zs){var zr=zs.parentNode.getBoundingClientRect();pzZoomAt(zs,+d.d>0?1.8:1/1.8,zr.left+zr.width/2,zr.top+zr.height/2);pzLater(zs,0)}return}
  if(a==='pzfit'){if(UI.pz)delete UI.pz[d.k];var fs=document.querySelector('svg[data-pz="'+d.k+'"]');if(fs){pzApply(fs);pzLater(fs,0)}return}
  if(a==='pfin'){var FR2=routeById(UI.R),FU=FR2&&planUnit(FR2);if(!FR2||!FU)return;var PL2=UI.leg;if(PL2&&PL2.rid===FR2.id&&PL2.pts.length){var ns2={type:'leg',who:PL2.who,pace:PL2.pace,pts:PL2.pts,ord:[]};if(PL2.after!==undefined)ns2.after=PL2.after;FR2.steps.push(ns2);routeSids(FR2)}
    UI.leg=null;UI.tsel=null;FU.route=FR2.id;if(S.match){if(!FU.live)initLive(FU);if(!FU.live.battle)planRestart(FU);mlog(FU.name+' sets out on '+FR2.name+'.','dim');UI.medit=false;UI.mu=FU.id;if(UI.tab==='patrol')UI.tab='match';say(FU.name+' sets out on '+FR2.name+'.')}else say(FR2.name+' is now the patrol for '+FU.name+'. It sets out when a match starts.');save();return render()}
  if(a==='lgo'){var LR=routeById(UI.R);if(!LR)return;UI.leg={rid:LR.id,who:UI.lwho||'u',pace:UI.Rpace||'walk',pts:[]};UI.tsel=null;UI.tile=null;say('Tap the map to lay down the line. Zoom in to thread it through the ground.');return render()}
  if(a==='lpace'){UI.Rpace=d.p;if(UI.leg)UI.leg.pace=d.p;return render()}
  if(a==='lundo'){if(UI.leg)UI.leg.pts.pop();return render()}
  if(a==='lcan'){UI.leg=null;say('');return render()}
  if(a==='lfin'&&UI.leg&&UI.leg.kind==='b'){var BL=UI.leg,BU=unitById(BL.uid),BP2=BU&&bpById(BU,BL.pid);if(!BP2||!BL.pts.length)return;BP2.steps.push({type:'leg',who:BL.who,pace:BL.pace,pts:BL.pts,ord:[]});routeSids(BP2);UI.leg=null;UI.btsel=BP2.steps.length-1;save();return render()}
  if(a==='bgo'){var GU=UI.bp&&unitById(UI.bp.uid),GP=GU&&bpById(GU,UI.bp.pid);if(!GP)return;UI.leg={kind:'b',uid:GU.id,pid:GP.id,who:UI.lwho||'u',pace:UI.Rpace||'walk',pts:[]};UI.btsel=null;return render()}
  if(a==='bpnew'){var NU=unitById(+d.u);if(!NU)return;var no2=bpOf(NU),np={id:no2.nid++,name:'Play '+(no2.list.length+1),steps:[]};no2.list.push(np);UI.bp={uid:NU.id,pid:np.id};UI.leg=null;UI.btsel=null;save();return render()}
  if(a==='bpsel'){UI.bp={uid:+d.u,pid:+d.id};UI.leg=null;UI.btsel=null;UI.confirm=false;return render()}
  if(a==='bpdel'){var DU=UI.bp&&unitById(UI.bp.uid);if(!DU)return;if(UI.confirm!=='bp'){UI.confirm='bp';return render()}var dl=bpOf(DU);dl.list=dl.list.filter(function(p){return p.id!==UI.bp.pid});Object.keys(dl.for).forEach(function(k){if(dl.for[k]===UI.bp.pid)delete dl.for[k]});UI.bp=null;UI.confirm=false;UI.btsel=null;save();return render()}
  if(a==='btsel'){UI.btsel=+d.i;return render()}
  if(a==='btselx'){UI.btsel=null;return render()}
  if(a==='btup'||a==='btrm'||a==='btord'||a==='btordrm'||a==='btpace'||a==='btdel'){var XU=UI.bp&&unitById(UI.bp.uid),XP=XU&&bpById(XU,UI.bp.pid);if(!XP)return render();
    if(a==='btup'){var ui=+d.i;if(ui>0){var tt=XP.steps[ui];XP.steps[ui]=XP.steps[ui-1];XP.steps[ui-1]=tt}}
    else if(a==='btrm'||a==='btdel'){var ri=a==='btrm'?+d.i:UI.btsel,rs=XP.steps[ri];if(rs){XP.steps.splice(ri,1);XP.steps.forEach(function(x){if(x.after===rs.sid)delete x.after;(x.ord||[]).forEach(function(q){if(q.sid===rs.sid)q.sig='spring'})})}UI.btsel=null}
    else{var xs=XP.steps[UI.btsel];if(!xs)return render();if(a==='btord'){xs.ord=xs.ord||[];var bo2={k:d.k};if(d.n)bo2.n=+d.n;if(d.f)bo2.f=d.f;xs.ord.push(bo2)}else if(a==='btordrm')xs.ord.splice(+d.j,1);else xs.pace=d.p}
    save();return render()}
  if(a==='bpedit'){UI.bpm=+d.u;UI.bp=null;UI.btsel=null;UI.leg=null;return render()}
  if(a==='bpmx'){UI.bpm=null;UI.leg=null;UI.btsel=null;return render()}
  if(a==='spring'){var SB=battleById(UI.bsel);if(SB){SB.spring=true;mlog('Spring it!','good')}return render()}
  if(a==='lfin'){var P2=UI.leg,FR=P2&&routeById(P2.rid);if(!FR||!P2.pts.length)return;var ns={type:'leg',who:P2.who,pace:P2.pace,pts:P2.pts,ord:[]};if(P2.after!==undefined)ns.after=P2.after;FR.steps.push(ns);routeSids(FR);UI.leg=null;UI.tsel=FR.steps.length-1;say('');save();return render()}
  if(a==='tsel'){UI.tsel=+d.i;UI.tile=null;return render()}
  if(a==='tselx'){UI.tsel=null;return render()}
  if(a==='tord'||a==='tordrm'||a==='tpace'||a==='tdel'){var TR=routeById(UI.R),ts0=TR&&TR.steps[UI.tsel];if(!ts0)return render();
    if(a==='tord'){ts0.ord=ts0.ord||[];var no={k:d.k};if(d.m)no.m=+d.m;if(d.f)no.f=d.f;ts0.ord.push(no)}
    else if(a==='tordrm')ts0.ord.splice(+d.j,1);else if(a==='tpace')ts0.pace=d.p;
    else{var dsid=ts0.sid;TR.steps.splice(UI.tsel,1);TR.steps.forEach(function(x){if(x.after===dsid)x.after=undefined});UI.tsel=null}
    save();return render()}
  if(a==='tilex'){UI.tile=null;UI.look=null;UI.campPop=null;return render()}
  if(a==='pipcam'){UI.pip=d.v||null;return render()}
  if(a==='dockmin'){UI.dockMin=!UI.dockMin;return render()}
  if(a==='zpt'&&UI.draw){var svg=b.ownerSVGElement,sp0=svg.createSVGPoint();sp0.x=e.clientX;sp0.y=e.clientY;var q0=sp0.matrixTransform(svg.getScreenCTM().inverse()),np=[Math.round(q0.x*10)/10,Math.round(q0.y*10)/10];
    if(UI.draw.type!=='road'&&!UI.draw.pts.length&&UI.draw.type==='creek'&&!waterHex(hexAtXY(np[0],np[1]))){say('A creek starts in a body of water. Tap inside a pond, swamp or small open water first.',true);return render()}
    if(UI.draw.type!=='road'&&UI.draw.pts.length){var lp=UI.draw.pts[UI.draw.pts.length-1],k0=hexAtXY(lp[0],lp[1]),ks=hexAtXY(UI.draw.pts[0][0],UI.draw.pts[0][1]),n=Math.max(1,Math.ceil(Math.hypot(np[0]-lp[0],np[1]-lp[1])/2));
      for(var j=1;j<=n;j++){var qx=lp[0]+(np[0]-lp[0])*j/n,qy=lp[1]+(np[1]-lp[1])*j/n,kk=hexAtXY(qx,qy);if(kk!==k0&&kk!==ks&&waterHex(kk)){var pc=center(kk%COLS,Math.floor(kk/COLS));UI.draw.pts.push([Math.round((qx+(pc[0]-qx)*.5)*10)/10,Math.round((qy+(pc[1]-qy)*.5)*10)/10]);return finishLine(' It runs into the '+TERR[S.grid[kk]].n.toLowerCase()+' at '+lab(kk%COLS,Math.floor(kk/COLS))+' and ends there.')}
        if(UI.draw.type==='stream'&&nearCreek([qx,qy])&&Math.hypot(qx-UI.draw.pts[0][0],qy-UI.draw.pts[0][1])>3){UI.draw.pts.push([Math.round(qx*10)/10,Math.round(qy*10)/10]);return finishLine(' It joins the creek there.')}}}
    UI.draw.pts.push(np);return render()}
  if(a==='hex'){
    var c2=+d.c,r2=+d.r;
    if(UI.tab==='match'){var MR=routeById(UI.R);if(UI.medit&&UI.pick&&MR){if(terrAt(c2,r2)==='pond'){say('A pond blocks the way.',true);return render()}MR.steps.push({type:'march',to:[c2,r2],pace:UI.Rpace});UI.pick=false;say('');save();return render()}UI.tile=[c2,r2];var cpm=campOnTile(c2,r2);UI.campPop=cpm?cpm.key:null;return render()}
    if(UI.tab==='patrol'){
      var RR=routeById(UI.R);
      if(UI.pick&&RR){
        if(terrAt(c2,r2)==='pond'){say('A pond blocks the way.',true);return render()}
        RR.steps.push({type:'march',to:[c2,r2],pace:UI.Rpace});UI.pick=false;say('');save();return render();
      }
      return;
    }
    return doPlace(c2,r2);
  }
  if(a==='flt'){UI.f[d.v]=d.k;return render()}
  if(a==='selh'){UI.selH=UI.selH===+d.id?null:+d.id;return render()}
  if(a==='selu'){UI.selU=UI.selU===+d.u?null:+d.u;return render()}
  if(a==='putin')return UI.selH?moveHuman(UI.selH,+d.u,d.t?+d.t:0):undefined;
  if(a==='umin'){var mu=unitById(+d.u);if(mu){mu.min=!mu.min;save()}return render()}
  if(a==='uminall'){S.units.forEach(function(u){u.min=d.v==='1'});save();return render()}
  if(a==='addtm'){var au=unitById(+d.u);if(au){var ts=teamsOf(au),mx=0;ts.forEach(function(t){mx=Math.max(mx,t.id)});ts.push({id:mx+1,name:'Team '+(ts.length+1),hids:[]});save()}return render()}
  if(a==='deltm'){var du2=unitById(+d.u);if(du2){var ts2=teamsOf(du2),dt=teamById(du2,+d.t);if(dt&&ts2.length>1){if(du2.live&&du2.live.battle){say(du2.name+' is in a fight.',true);return render()}ts2.splice(ts2.indexOf(dt),1);ts2[0].hids=ts2[0].hids.concat(dt.hids);say('Team '+dt.name+' removed. Its men join '+ts2[0].name+'.');save()}}return render()}
  if(a==='unout')return removeFromUnit(+d.id);
  if(a==='stationat')return UI.selU?stationUnit(UI.selU,+d.s):undefined;
  if(a==='newunit'){
    var sid0=UI.sel||(S.setl[0]&&S.setl[0].id);if(!setById(sid0))return;
    var nu={id:S.uid++,name:'Unit '+(S.uid-1),sid:sid0,hids:[],route:null};S.units.push(nu);say(nu.name+' created. Drag men into it.');save();return render();
  }
  if(a==='disband'){var du=unitById(+d.u);if(du){S.units.splice(S.units.indexOf(du),1);say(du.name+' disbanded. Its men stay in the settlement.');if(UI.mu===du.id)UI.mu=null;save()}return render()}
  if(a==='rnew'){if(S.routes.length>=MAXR)return;var nr={id:S.rid++,name:'Patrol '+(S.rid-1),steps:[],repeat:0,eng:{spot:'engage',archers:'shoot',melee:'charge',fall:0}};S.routes.push(nr);UI.R=nr.id;UI.confirm=false;say('');save();return render()}
  if(a==='rsel'){UI.R=+d.id;UI.confirm=false;UI.pick=false;UI.leg=null;UI.tsel=null;say('');return render()}
  if(a==='rdel'){var DRt=routeById(UI.R);if(!DRt)return;if(!UI.confirm){UI.confirm=true;return render()}UI.confirm=false;S.routes.splice(S.routes.indexOf(DRt),1);S.units.forEach(function(u){if(u.route===DRt.id){u.route=null;if(u.live){u.live.mode='idle';u.live.path=[]}}});UI.R=S.routes.length?S.routes[0].id:null;save();return render()}
  if(a==='radd'){
    var RA=routeById(UI.R);if(!RA)return;
    if(d.o==='march'){UI.pick=!UI.pick;say(UI.pick?'Tap the destination hex.':'');return render()}
    if(d.o==='wait')RA.steps.push({type:'wait',secs:+UI.Rwait*60});
    if(d.o==='rest')RA.steps.push({type:'rest'});
    if(d.o==='lrest')RA.steps.push({type:'lrest'});
    if(d.o==='home')RA.steps.push({type:'home'});
    say('');save();return render();
  }
  if(a==='rsrm'){var R1=routeById(UI.R);if(R1)R1.steps.splice(+d.i,1);save();return render()}
  if(a==='rsup'&&+d.i>0){var R2=routeById(UI.R),i2=+d.i,t=R2.steps[i2];R2.steps[i2]=R2.steps[i2-1];R2.steps[i2-1]=t;save();return render()}
  if(a==='rsdn'){var R3=routeById(UI.R),i3=+d.i;if(i3<R3.steps.length-1){var t2=R3.steps[i3];R3.steps[i3]=R3.steps[i3+1];R3.steps[i3+1]=t2;save()}return render()}
  if(a==='topatrols'){UI.tab='patrol';say('');return render()}
  if(a==='bfsel'||a==='bford'||a==='bfshoot'||a==='bfpt'||a==='bfight'||a==='bfauto'||a==='bfob'||a==='bfsq'){
    var BB=battleById(UI.bsel);if(!BB||BB.done)return;var sel=bfPicked(BB),SQ=bfSquad(BB);
    var startFight=function(){BB.phase='fight';UI.barm=null;if(S.match.speed===0){S.match.speed=1;LIVE_LAST=performance.now()}render()};
    if(a==='bfsel'){UI.bpick=d.k;UI.barm=null}
    else if(a==='bfob'){if(BB.phase!=='deploy')tutFlag('sw');var GG=groupOf(BB,+d.u);if(GG){GG.fo=d.o==='mv'?'mv':+d.o;GG.face=bfFacing(BB,GG.pt);BB.teams.forEach(function(t){if(t.uid===GG.uid)t.order='form'});var UU=unitById(GG.uid);if(UU&&BB.phase!=='deploy')mlog(UU.name+' switches to '+fmName(fmOf(UU),GG.fo).toLowerCase()+'.','dim')}}
    else if(a==='bfsq'&&SQ){var gts=BB.teams.filter(function(t){return t.uid===SQ.uid});
      if(d.o==='move'){UI.barm='sq'}
      else{UI.barm=null;if(d.o==='back')gts.forEach(function(t){t.order='back'});else{SQ.mode=['push','guard','dmarch'].indexOf(d.o)>=0?d.o:'hold';gts.forEach(function(t){if(t.order!=='back')t.order='form'})}}}
    else if(a==='bford'){if(d.o==='move'||d.o==='flank'){UI.barm=d.o}else{UI.barm=null;sel.forEach(function(t){if(d.o==='hold'||d.o==='guard'){var mem=BB.units.filter(function(u){return u.tk===t.k&&u.alive&&!u.gone});if(mem.length){var cx=0,cy=0;mem.forEach(function(u){cx+=u.x;cy+=u.y});t.pt=bfFree(BB.F,cx/mem.length,cy/mem.length);t.face=bfFacing(BB,t.pt)}}t.order=d.o})}}
    else if(a==='bfshoot'){var on=!sel.every(function(t){return t.shoot});sel.forEach(function(t){t.shoot=on})}
    else if(a==='bfpt'){
      if(!sel.length){return}
      var svg=b.ownerSVGElement,sp1=svg.createSVGPoint();sp1.x=e.clientX;sp1.y=e.clientY;var q0=sp1.matrixTransform(svg.getScreenCTM().inverse()),q1=unpj(q0.x,q0.y),qx=q1.x;
      var hitF=null,hd=9;BB.foes.forEach(function(f,fi){if(!f.alive)return;var dd=Math.hypot(f.x-q1.x,f.y-q1.y+1);if(dd<hd){hd=dd;hitF=fi}});
      if(hitF!=null){tutFlag('tg');sel.forEach(function(t){t.order='advance';t.tgt=hitF});if(SQ)SQ.mode='hold';UI.barm=null;mlog((SQ?(unitById(SQ.uid)||{name:'The squad'}).name:sel.map(function(t){return t.name}).join(', '))+' charges a '+BB.foes[hitF].kind+'.','dim')}
      else{
      if(SQ){SQ.pt=[Math.max(1,Math.min(BFW-1,qx)),Math.max(1,Math.min(BFH-1,q1.y))];SQ.face=bfFacing(BB,SQ.pt);SQ.mode='hold';BB.teams.forEach(function(t){if(t.uid===SQ.uid&&t.order!=='back')t.order='form'})}
      else{if(BB.phase!=='deploy'&&!SQ)tutFlag('mv');bfPlace(BB,sel,qx,q1.y,UI.barm||(BB.phase==='deploy'?'hold':'move'))}
      UI.barm=null}}
    else if(a==='bfauto'){BB.groups.forEach(function(g){var U=unitById(g.uid);if(U&&!(BB.plays&&BB.plays[g.uid]))g.fo=fmOf(U).def;g.mode='hold'});BB.teams.forEach(function(t){t.order='form';t.shoot=true});return startFight()}
    else if(a==='bfight')return startFight();
    if(a==='bfob'||a==='bfsq'||a==='bford'){(a==='bfob'?BB.teams.filter(function(t){return t.uid===+d.u}):bfPicked(BB)).forEach(function(t){t.tgt=null})}
    if(a==='bfob'||a==='bfsq'||a==='bford'||a==='bfpt'){var RK={};if(a==='bfob')BB.teams.forEach(function(t){if(t.uid===+d.u)RK[t.k]=1});else bfPicked(BB).forEach(function(t){RK[t.k]=1});if(BB.phase!=='deploy')BB.units.forEach(function(u){if(RK[u.tk]&&u.alive)u.rt=Math.max(u.rt||0,Math.round(u.react||1))})}
    LIVE_CACHE.bctl=null;LIVE_CACHE.bvmk=null;drawBattleView();return;
  }
  if(a.slice(0,2)==='fm'){
    if(a==='fmu'||a==='fmgo'){if(a==='fmgo')UI.tab='patrol';UI.fu=+d.u;UI.fsel=null;UI.fob=null;return render()}var FU=unitById(UI.fu);if(!FU)return;var FF=fmOf(FU),fk=d.k==='mv'?'mv':(d.k?+d.k:null),FO=fk==='mv'?FF.mv:(fk?obById(FF,fk):null);
    if(a==='fmsel'){UI.fsel=UI.fsel&&UI.fsel.k===d.k&&UI.fsel.h===+d.h?null:{k:d.k,h:+d.h};return render()}
    if(a==='fmcell'&&FO){var x=+d.x,y=+d.y,occ=null;Object.keys(FO.s).forEach(function(h){if(FO.s[h][0]===x&&FO.s[h][1]===y)occ=+h});var ps=UI.fsel&&UI.fsel.k===d.k?UI.fsel.h:null;
      if(ps!=null&&FO.s[ps]){if(occ===ps){UI.fsel=null}else{if(occ!=null)FO.s[occ]=FO.s[ps];FO.s[ps]=[x,y];UI.fsel=null;save()}}
      else if(occ!=null)UI.fsel={k:d.k,h:occ};
      return render()}
    if(a==='fmshape'&&FO){FO.s=fmShape(FU,d.s);UI.fsel=null;save();return render()}
    if(a==='fmscope'){UI.fscope=d.s;return render()}
    if(a==='fmstance'&&FO&&FO.st){var sc=UI.fscope||'man',ps2=UI.fsel&&UI.fsel.k===d.k?UI.fsel.h:null,tgt=[];
      if(sc==='all')tgt=FU.hids.slice();else if(ps2!=null){if(sc==='team'){var tt=teamOfH(FU,ps2);tgt=tt?tt.hids.slice():[ps2]}else tgt=[ps2]}
      tgt.forEach(function(h){FO.st[h]=d.v});save();return render()}
    if(a==='fmob'){UI.fob=+d.o;UI.fsel=null;return render()}
    var CO=obById(FF,UI.fob);
    if(a==='fmnew'&&FF.ob.length<MAXOB){var nob={id:FF.nid++,name:'Order of battle '+(FF.ob.length+1),s:fmShape(FU,'ranks'),st:{}};FF.ob.push(nob);UI.fob=nob.id;UI.fsel=null;save();return render()}
    if(a==='fmdup'&&CO&&FF.ob.length<MAXOB){var dob=JSON.parse(JSON.stringify(CO));dob.id=FF.nid++;dob.name=(CO.name+' copy').slice(0,28);FF.ob.push(dob);UI.fob=dob.id;save();return render()}
    if(a==='fmdel'&&CO&&FF.ob.length>1){FF.ob.splice(FF.ob.indexOf(CO),1);if(FF.def===CO.id)FF.def=FF.ob[0].id;UI.fob=FF.def;save();return render()}
    if(a==='fmdef'&&CO){FF.def=CO.id;save();return render()}
    return;
  }
  if(a==='bsel'){UI.bsel=+d.id;return render()}
  if(a==='zm'){var kk='z'+d.k,zi=ZL.indexOf(UI[kk]||1);zi=Math.max(0,Math.min(ZL.length-1,(zi<0?0:zi)+(+d.d)));UI[kk]=ZL[zi];return render()}
  if(a==='rpopen'){UI.rp={t:0,playing:true,speed:30};return render()}
  if(a==='rpclose'){UI.rp=null;return render()}
  if(a==='rpplay'){var RP=UI.rp;if(!RP)return;if(!RP.playing&&RP.t>=UI.mres.replay.end)RP.t=0;RP.playing=!RP.playing;b.textContent=RP.playing?'Pause':'Play';RPLAST=performance.now();return rpStart()}
  if(a==='rpspd'){if(!UI.rp)return;UI.rp.speed=+d.s;document.querySelectorAll('[data-act="rpspd"]').forEach(function(x){x.classList.toggle('on',+x.dataset.s===UI.rp.speed)});return}
  if(a==='mu'){UI.mu=+d.u;var MUu=unitById(UI.mu);if(MUu)UI.Rfrom=MUu.sid;return render()}
  if(a==='medit'){UI.medit=!UI.medit;UI.pick=false;if(UI.medit&&!routeById(UI.R)&&S.routes.length)UI.R=S.routes[0].id;var MU2=unitById(UI.mu);if(MU2)UI.Rfrom=MU2.sid;return render()}
  if(a==='mspd'){if(S.match){S.match.speed=+d.s;LIVE_LAST=performance.now();if(+d.s===0&&activeBattles().some(function(x){return x.phase==='fight'}))tutFlag('pz')}return render()}
  if(a==='mauto'){if(S.match)S.match.autoPause=!S.match.autoPause;return render()}
  if(a==='ucmd'){
    var CU=unitById(+d.u);if(!CU||!S.match)return;if(!CU.live)initLive(CU);var CL=CU.live;if(CL.battle){say(CU.name+' is in a fight.',true);return render()}
    if(d.c==='home'){goHome(CU,'Returning home');mlog(CU.name+' ordered home.','dim')}
    else if(d.c==='hold'){CL.mode='hold';CL.spotHold=false;CL.path=[];CL.status='Holding at '+lab(CL.pos[0],CL.pos[1]);mlog(CU.name+' ordered to hold.','dim')}
    else{planRestart(CU);if(!CU.route)CL.status='At rest';mlog(CU.name+(CU.route?' starts '+routeName(CU)+'.':' stands by.'),'dim')}
    save();return render();
  }
  if(a==='pbplay'){var pb=UI.pb;if(!pb)return;if(!pb.playing&&pb.t>=pbTotal(pb)-1e-6){pb.t=0;pb.lastF=-1}pb.playing=!pb.playing;b.textContent=pb.playing?'Pause':'Play';PBLAST=performance.now();var hv=document.getElementById('pbview');if(hv&&pb.t===0)hv.dataset.seg='';return pbStart()}
  if(a==='pbspd'){if(!UI.pb)return;UI.pb.speed=+d.s;document.querySelectorAll('[data-act="pbspd"]').forEach(function(x){x.classList.toggle('on',+x.dataset.s===UI.pb.speed)});return}
  if(a==='pbskip'){var pk=UI.pb;if(!pk)return;pk.t=pbTotal(pk);pk.playing=false;var hk=document.getElementById('pbview'),bk=document.getElementById('pbplay');if(bk)bk.textContent='Play';if(hk)pbDraw(hk,pk);return}
  if(a==='pbreplay'){var pr=UI.pb;if(!pr)return;pr.t=0;pr.lastF=-1;pr.playing=true;var hr2=document.getElementById('pbview'),br=document.getElementById('pbplay');if(hr2)hr2.dataset.seg='';if(br)br.textContent='Pause';PBLAST=performance.now();return pbStart()}
  if(a==='pbclose'){UI.pb=null;return render()}
  if(a==='watch'){var rw=UI.raids&&UI.raids[+d.i];if(!rw)return;UI.pb={k:rw.tac?'tac':'fight',rec:rw.tac||rw.rec,t:0,playing:true,speed:2,title:rw.title};window.scrollTo(0,0);return render()}
  if(a==='startm')return startMatch();
  if(a==='mshare'){UI.mshare=+d.v/100;return render()}
  if(a==='mview'){UI.mview=d.v;if(UI.pz)delete UI.pz.m;return render()}
  if(a==='abandon'){var MA=S.match;if(!MA)return;if(!UI.confirm){UI.confirm=true;return render()}MA.over='abandoned';MA.why='You abandoned the match.';return endMatch('abandoned')}
});
document.addEventListener('dragstart',function(e){var t=e.target.closest&&e.target.closest('[data-drag]');if(!t)return;e.dataTransfer.setData('text/plain',t.dataset.drag);e.dataTransfer.effectAllowed='move'});
document.addEventListener('dragover',function(e){var z=e.target.closest&&e.target.closest('[data-drop]');if(z){e.preventDefault();z.classList.add('over')}});
document.addEventListener('dragleave',function(e){var z=e.target.closest&&e.target.closest('[data-drop]');if(z)z.classList.remove('over')});
document.addEventListener('drop',function(e){var z=e.target.closest&&e.target.closest('[data-drop]');if(!z)return;e.preventDefault();z.classList.remove('over');var v=e.dataTransfer.getData('text/plain');if(v)handleDrop(v,z.dataset.drop)});
document.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('div[role=button][data-act]')){e.preventDefault();e.target.click()}});
document.addEventListener('input',function(e){if(e.target.id==='rpscrub'&&UI.rp){UI.rp.t=+e.target.value;rpDraw()}});
document.addEventListener('change',function(e){
  var el=e.target;
  if(el.dataset.nm){var h=byId(+el.dataset.nm);if(h){h.name=el.value.trim();save();render()}return}
  if(el.dataset.snm){var NS=setById(+el.dataset.snm);if(NS){NS.name=el.value.trim();save();render()}return}
  if(el.dataset.so){S.so=S.so||{};S.so[el.dataset.so]=el.value;save();return render()}
  if(el.dataset.sel){UI.sel=+el.value;return render()}
  if(el.dataset.roadn!=null&&el.dataset.roadn!==''){var RL=S.lines[+el.dataset.roadn];if(RL&&RL.type==='road'){RL.name=el.value.trim()||RL.name;save()}return render()}
  if(el.dataset.twadd){var TW=null;towers().forEach(function(x){if(x.id===+el.dataset.twadd)TW=x});var TH=byId(+el.value);if(TW&&TH&&(TW.men||[]).length<TOWER.cap){removeFromUnit(TH.id);towerOff(TH.id);TW.men=(TW.men||[]).concat([TH.id]);say(hname(TH)+' is stationed on the watchtower.');save()}return render()}
  if(el.dataset.sact){UI.sacT=+el.value;return render()}
  if(el.dataset.sacv){UI.sacV=+el.value;return render()}
  var RC=routeById(UI.R);
  if(el.dataset.rn&&RC){RC.name=el.value.trim()||RC.name;save();return render()}
  if(el.dataset.rrep&&RC){RC.repeat=+el.value;save();return render()}
  if(el.dataset.reng&&RC){RC.eng=RC.eng||{};RC.eng[el.dataset.reng]=el.dataset.reng==='fall'?+el.value:el.value;save();return render()}
  if(el.dataset.rfrom){UI.Rfrom=+el.value;return render()}
  if(el.dataset.rpace){UI.Rpace=el.value;return}
  if(el.dataset.lwho){UI.lwho=el.value;if(UI.leg){UI.leg.who=el.value;UI.leg.pts=[]}return render()}
  if(el.dataset.bpn){var NU2=UI.bp&&unitById(UI.bp.uid),NP=NU2&&bpById(NU2,UI.bp.pid);if(NP){NP.name=el.value.slice(0,28)||NP.name;save()}return render()}
  if(el.dataset.bpvs!=null&&el.id==='bpvs'){var VU=UI.bp&&unitById(UI.bp.uid),VP=VU&&bpById(VU,UI.bp.pid);if(VP){var vo=bpOf(VU);Object.keys(vo.for).forEach(function(k){if(vo.for[k]===VP.id)delete vo.for[k]});if(el.value)vo.for[el.value]=VP.id;save()}return render()}
  if(el.dataset.btafter){var AU=UI.bp&&unitById(UI.bp.uid),AP=AU&&bpById(AU,UI.bp.pid),as1=AP&&AP.steps[+el.dataset.btafter];if(as1){if(el.value==='')delete as1.after;else as1.after=+el.value;save()}return render()}
  if(el.dataset.buntil){var WU=UI.bp&&unitById(UI.bp.uid),WP=WU&&bpById(WU,UI.bp.pid),ws=WP&&WP.steps[+el.dataset.buntil];if(ws&&el.value){var pv=el.value.split(':'),uo={k:'until',sig:pv[0]};if(pv[0]==='done')uo.sid=+pv[1];if(pv[0]==='near')uo.n=+pv[1];if(pv[0]==='arrows')uo.w=pv[1];ws.ord=ws.ord||[];ws.ord.push(uo);save()}return render()}
  if(el.dataset.bplay){var PB=battleById(UI.bsel),PG=PB&&groupOf(PB,+el.dataset.bplay),PU=PG&&unitById(PG.uid);if(PU){bpSet(PB,PG,PU,el.value?bpById(PU,+el.value):null);LIVE_CACHE.bvmk=null;LIVE_CACHE.bctl=null}return drawBattleView()}
  if(el.dataset.rpu){UI.Ru=+el.value;return render()}
  if(el.dataset.tafter){var AR=routeById(UI.R),as0=AR&&AR.steps[+el.dataset.tafter];if(as0){if(el.value==='')delete as0.after;else as0.after=+el.value;save()}return render()}
  if(el.dataset.rwait){UI.Rwait=el.value;return}
  if(el.dataset.urt){var UU=unitById(+el.dataset.urt);if(UU){UU.route=el.value==='defend'?'defend':(el.value?+el.value:null);if(S.match){if(!UU.live)initLive(UU);UU.live.si=0;UU.live.cur=-1;UU.live.cycle=S.match.clock;UU.live.mode=UU.route?'route':'idle';UU.live.path=[]}save()}return render()}
  if(el.dataset.reinf){var RU=unitById(+el.dataset.reinf);if(RU&&S.match&&el.value){tutFlag('rf');if(!RU.live)initLive(RU);var RL=RU.live;if(RL.battle){say(RU.name+' is in a fight.',true);return render()}RL.mode='reinforce';RL.target=+el.value;RL.path=[];RL.chase=null;mlog(RU.name+' moves to reinforce '+unitById(+el.value).name+'.','dim');save()}return render()}
  if(el.dataset.mrt){var MU=unitById(+el.dataset.mrt);if(MU&&S.match){MU.route=el.value==='defend'?'defend':(el.value?+el.value:null);if(!MU.live)initLive(MU);var ML=MU.live;if(!ML.busy&&!ML.battle)planRestart(MU);mlog(MU.name+(MU.route?' switches to '+routeName(MU)+'.':' stops its patrol.'),'dim');save()}return render()}
  if(el.dataset.fmn){var NU=unitById(UI.fu),NO=NU&&obById(fmOf(NU),+el.dataset.fmn);if(NO){NO.name=el.value.trim()||NO.name;save();render()}return}
  if(el.dataset.tn){var tp=el.dataset.tn.split(':'),tu=unitById(+tp[0]),tt=tu&&teamById(tu,+tp[1]);if(tt){tt.name=el.value.trim()||tt.name;save();render()}return}
  if(el.dataset.un){var ru=unitById(+el.dataset.un);if(ru){ru.name=el.value.trim()||ru.name;save();render()}return}
  if(el.dataset.ust)return stationUnit(+el.dataset.ust,+el.value);
  if(el.dataset.rf){UI.rf=el.value;return render()}
  if(el.dataset.rw){UI.rw=el.value;return render()}
  if(el.dataset.gc||el.dataset.gr){UI.tile=[+$('#gc').value,+$('#gr').value];return render()}
});

var saved=load();
if(saved&&saved.v===1){S=saved}else{fresh();save()}
function migrate(){
if(S.units)S.units.forEach(function(U){U.hids=U.hids.filter(function(id){var h=byId(id);return !(h&&h.sex==='f')});(U.teams||[]).forEach(function(t){t.hids=t.hids.filter(function(id){return U.hids.indexOf(id)>=0})})});
S.cards.forEach(function(c){var h=c.eq!=null?byId(c.eq):null;if(h&&h.sex==='f'&&SOLDIER_GEAR[kindOf(c)])c.eq=null});
if(!S.units){S.units=[];S.uid=1}
if(!S.lines)S.lines=[];
S.setl.forEach(function(x){if(x.pal)x.pal=0});
S.cards.forEach(function(c){if(c.key==='bow')c.key='shortbow';if(c.key==='arrows')c.key='short_arrows';if(c.key==='human'&&c.skill){if(c.skill.shortbow==null)c.skill.shortbow=c.skill.bow!=null?c.skill.bow:10;if(c.skill.longbow==null)c.skill.longbow=10;delete c.skill.bow}});
S.cards.forEach(function(c){if(c.key==='human'&&c.tat&&c.tat.some(function(t){return typeof t==='string'})){var old=c.tat;c.tat=[];old.forEach(function(t){c.tat.push(typeof t==='string'?tatFreeze(c,t):t)})}});
S.cards.forEach(function(c){if(c.key==='human'&&c.skill&&c.skill.battle_axe==null)c.skill.battle_axe=10});
if(!S.bw){S.bw=9;S.bh=7}
if(!S.hgt||S.hgt.length!==S.grid.length){var oh=S.hgt||[];S.hgt=S.grid.map(function(g,i){return oh[i]||(g?{s:'flat',b:0}:null)});S.setl.forEach(function(x){[[x.c,x.r]].concat(x.c2!=null?[[x.c2,x.r2]]:[]).forEach(function(p){var k=p[1]*(S.bw||9)+p[0];if(!S.hgt[k])S.hgt[k]={s:'flat',b:0}})})}
if(!S.routes){S.routes=[];S.rid=1}
if(S.match){S.units.forEach(function(U){if(U.live)U.live.battle=null});S.match.camps.forEach(function(m){m.inBattle=null})}
S.cards.forEach(function(c){if(CD[c.key]&&isItem(c))c.at=null});
S.cards=S.cards.filter(function(c){return CD[c.key]});
}
migrate();
syncDims();
if(!S.startSet&&!S.match){S.startSet=1;if(!S.setl.length&&!S.cards.some(function(c){return c.key==='setcard'})){for(var q=0;q<3;q++)mk('setcard')}save()}
initUI();
render();
if(S.match)liveStart();
