/* ---------- battlefield ground and drawing ---------- */
var BFW=280,BFH=192,BFC=4,BFX=70,BFY=48,BPW=140,BPH=96,D4=[[1,0],[-1,0],[0,1],[0,-1]];/* the four grid steps */
var GROUND={
  o:{n:'Open',mv:1,sh:1,cv:1,t:'full speed, best for archers'},
  f:{n:'Footbridge',mv:.9,sh:1,cv:1,t:'a plank path one man wide over the stream: crossing single file, no wading'},
  r:{n:'Road',mv:1.25,sh:1,cv:1,ln:10,t:'speed ×1.25; a team holding a line on it gets +10 melee skill'},
  c:{n:'Crops',mv:.85,sh:1,cv:.9,t:'speed ×0.85, a little cover'},
  b:{n:'Brush',mv:.8,sh:.85,cv:.75,t:'speed ×0.8 (a sprinting man with 0.5 yd jump height hops it); arrows into it hit ×0.75, out of it ×0.85'},
  p:{n:'Pine stand',mv:.85,sh:.75,cv:.8,t:'speed ×0.85; thin cover under the pines: arrows from or into it hit ×0.75, men are seen from 14 yd'},
  w:{n:'Woods',mv:.6,sh:.5,cv:.5,t:'speed ×0.6; arrows shot from or into the trees hit half as often'},
  m:{n:'Mud',mv:.5,sh:.9,cv:1,ml:-10,t:'speed ×0.5, −10 melee skill while standing in it'},
  s:{n:'Stream',mv:.35,sh:.9,cv:1,ml:-10,t:'wading at ×0.35 speed, −10 melee skill; a sprinting man leaps it if his jump distance reaches 4 yd'},
  a:{n:'Deep water',mv:0,t:'nobody can cross'},
  t:{n:'Thicket',mv:0,t:'trees and brush too dense to pass; go around'},
  q:{n:'Deep bog',mv:0,t:'sucking mud nobody can cross; go around'},
  h:{n:'Longhouse',mv:0,sh:1,cv:1,t:'blocks movement'},
  W:{n:'Small palisade',mv:0,sh:1,cv:1,t:'6 ft of stakes: only a jump of 2 yd clears it; 600 HP a panel; men behind it take arrows ×0.25'},
  X:{n:'Large palisade',mv:0,sh:1,cv:1,t:'10 ft of stakes: only a jump of 3.3 yd clears it; 1,150 HP a panel; men behind it take arrows ×0.25'},
  G:{n:'Gate',mv:1,sh:1,cv:1,t:'opens for your men, shut to enemies until they break it'}
};
var BFM={foe:false,jh:0,tig:false,dry:false};
/* tiggles only move on wet ground (swamp, mud, bog, deep water, streams), at full speed; caught on dry ground they only head back */
function cmvAt(F,k){if(BFM.tig){if(F.wet&&F.wet.charCodeAt(k)===49)return 1;return BFM.dry&&cmv(F.g.charAt(k))>0?1:0}return cmv(F.g.charAt(k))}/* who is moving: gates shut for enemies, a high enough jump clears a palisade */
function cmv(c){if(c==='G')return BFM.foe?0:1;if(c==='W'||c==='X')return BFM.jh>=(c==='X'?PALS.l.yd:PALS.s.yd)?1:0;return (GROUND[c]||GROUND.o).mv}
function isWallC(c){return c==='W'||c==='X'||c==='G'}
var GFILL={W:['#4a3826','#3e2e1e'],X:['#3e2e1e','#33261a'],G:['#5a4630','#4a3826'],p:['#3c5a3e','#446444'],f:['#c49a5c','#5e4024'],t:['#0c1c10','#122614'],q:['#231c10','#2c2414'],w:['#2b4f2e','#335c37'],b:['#4a6f3a','#557c43'],m:['#4c5234','#565d3b'],s:['#3f86b8','#4f97c8'],r:['#9a8768','#a8967a'],c:['#7a5a33','#86653b'],a:['#346a90','#3d77a0'],h:['#5a3f26','#6a4a2a']};
var OPEN={pwood:['#6a8452','#748e5a'],pforest:['#5a7448','#647e50'],forest:['#4e6a3a','#587444'],water:['#6f9150','#7a9b58'],woodland:['#5f7f45','#6a8a4e'],swamp:['#5b7350','#647d59'],pond:['#6f9150','#7a9b58'],field:['#97ad55','#a3b861'],cultivated:['#8f9e4f','#9aaa58'],pasture:['#7a9b46','#84a650'],orchard:['#7f9248','#8a9c50'],settle:['#7d7550','#877f58']};
var TCOL=['#f0c64e','#6fd0c0','#e58ad6','#8ab4f5','#f59a5a','#b6e070'];
var BFNAME={pwood:'Pine woodland',pforest:'Pine forest',forest:'Oak forest',water:'Open water shore',woodland:'Woodland',swamp:'Swamp',pond:'Pond shore',field:'Open field',cultivated:'Cultivated field',pasture:'Pasture',orchard:'Orchard',settle:'Settlement'};
/* the ground of a fight: a 280 x 192 yard window onto the map wherever the fight happens. Every 4-yard cell takes the
   painted ground under it, so a field near a tile edge runs straight on into the next tile, and the same spot always has
   the same ground whether you look at it or fight on it. */
function bfGen(c,r,seed){var p=center(c,r);return bfGenAt(p[0],p[1],seed)}
function microAt(x,y){var wx=x+(vn(x/17,y/17)-.5)*SH*.75+(vn(x/6,y/6)-.5)*SH*.18,wy=y+(vn(x/17+40,y/17+40)-.5)*SH*.75+(vn(x/6+9,y/6+9)-.5)*SH*.18,k=hexOf(wx,wy);if(k==null||!terrainKind(k))k=hexOf(x,y);return{k:k==null?null:terrainKind(k),hk:k,wx:wx,wy:wy}}
function segDist(x,y,a,b){var vx=b[0]-a[0],vy=b[1]-a[1],q=vx*vx+vy*vy||1,t=Math.max(0,Math.min(1,((x-a[0])*vx+(y-a[1])*vy)/q));return Math.hypot(a[0]+vx*t-x,a[1]+vy*t-y)}
function bfGenAt(cx,cy,seed){
  var rn=seeded(seed),g=[],i,x,y,ox=cx-BFW*YU/2,oy=cy-BFH*YU/2,w=Math.sqrt(3)*SH,rs=[],ss=[],cnt={};
  var cs=[];(S.lines||[]).forEach(function(l){if(l.type!=='road'&&l.type!=='stream'&&l.type!=='creek')return;for(var j=1;j<l.pts.length;j++)(l.type==='road'?rs:l.type==='creek'?cs:ss).push([l.pts[j-1],l.pts[j]])});
  var hg=[];for(y=0;y<BFY;y++)for(x=0;x<BFX;x++){var hh0=heightAt(ox+(x+.5)*BFC*YU,oy+(y+.5)*BFC*YU);hg.push(hh0==null?0:Math.round(hh0*10)/10)}
  for(y=0;y<BFY;y++)for(x=0;x<BFX;x++){var px=ox+(x+.5)*BFC*YU,py=oy+(y+.5)*BFC*YU,M=microAt(px,py),k=M.k,n=vn(px/1.6+5,py/1.6+5),n2=vn(px/.7+9,py/.7+3),code='o';
    if(!k)code='t';
    else if(k==='woodland')code=n>.72?'t':n<.2?'o':n<.3||n2>.86?'b':'w';
    else if(k==='swamp')code=n>.8?'q':n>.75?'a':n<.24?'b':n2>.82?'w':'m';
    else if(k==='pond'){var hr=Math.floor(M.hk/COLS),hc=[w*((M.hk%COLS)+.5+((hr&1)?.5:0)),SH*1.5*hr+SH],dd=Math.hypot(M.wx-hc[0],M.wy-hc[1])/SH;code=dd<.74?'a':dd<.88?(n2<.55?'m':'b'):'o'}
    else if(k==='forest')code=n>.6?'t':n<.14?'b':'w';
    else if(k==='pwood')code=n<.32?'o':n>.9?'b':'p';
    else if(k==='pforest')code=n<.12?'o':n>.86?'w':'p';
    else if(k==='water')code='a';
    else if(k==='field')code=n>.9?'w':n>.8?'b':'o';
    else if(k==='pasture')code=n>.86?'b':'o';
    else if(k==='orchard')code=(x%3===1&&y%3===1)?'w':n>.92?'b':'o';
    else if(k==='cultivated')code=n>.9?'b':y%4===3?'o':'c';
    else if(k==='settle'){var sh=hexOf(px,py),sr=Math.floor(sh/COLS),sc0=[w*((sh%COLS)+.5+((sr&1)?.5:0)),SH*1.5*sr+SH];code=n>.88?'b':'o'}
    if(code!=='a'&&code!=='t'&&rs.some(function(z){return segDist(px,py,z[0],z[1])<.56}))code='r';
    if(ss.some(function(z){return segDist(px,py,z[0],z[1])<.36})||cs.some(function(z){return segDist(px,py,z[0],z[1])<.72}))code='s';
    if(k)cnt[k]=(cnt[k]||0)+1;g.push(code)}
  (S.lines||[]).forEach(function(l){if(l.type!=='bridge')return;var an=(l.a||0)*Math.PI/180,qx=-Math.sin(an),qy=Math.cos(an);
    (l.m?[-.6,.6]:[0]).forEach(function(oo){for(var t=-7;t<=7;t+=.5){var X=Math.floor((l.pts[0][0]+qx*t*BFC*YU-qy*oo*BFC*YU-ox)/(BFC*YU)),Y=Math.floor((l.pts[0][1]+qy*t*BFC*YU+qx*oo*BFC*YU-oy)/(BFC*YU));if(X>=0&&X<BFX&&Y>=0&&Y<BFY&&(g[Y*BFX+X]==='s'||g[Y*BFX+X]==='a'))g[Y*BFX+X]='f'}})});
  var cm=microAt(cx,cy),base=cm.k||'field';if(base==='pond'){var bk=Object.keys(cnt).filter(function(q){return q!=='pond'}).sort(function(a2,b2){return cnt[b2]-cnt[a2]})[0];base=bk||'field'}
  // keep the field crossable: if the east side can't be reached from the west, cut a track through
  var open=function(k){return (GROUND[g[k]]||GROUND.o).mv>0};
  for(var tries=0;tries<6;tries++){
    var seen=new Array(g.length),qq=[];for(y=0;y<BFY;y++){var k0=y*BFX;if(open(k0)){seen[k0]=1;qq.push(k0)}}
    while(qq.length){var k1=qq.shift(),cx1=k1%BFX,cy1=(k1-cx1)/BFX;D4.forEach(function(dd){var X=cx1+dd[0],Y=cy1+dd[1];if(X<0||Y<0||X>=BFX||Y>=BFY)return;var kk=Y*BFX+X;if(!seen[kk]&&open(kk)){seen[kk]=1;qq.push(kk)}})}
    var ok=false;for(y=0;y<BFY;y++)if(seen[y*BFX+BFX-1])ok=true;if(ok)break;
    var ty=Math.floor(BFY*(.3+rn()*.4)),tyy=ty;for(x=0;x<BFX;x++){if(rn()<.3)tyy=Math.max(1,Math.min(BFY-2,tyy+(rn()<.5?-1:1)));[tyy,tyy+1].forEach(function(Y){var kk=Y*BFX+x;if(!open(kk))g[kk]=base==='swamp'?'m':base==='woodland'?'w':'o'})}
  }
  /* longhouses block their ground; palisades are laid panel by panel (broken panels and gates stay open) */
  var wc={},wu={},wl=[],tw=[],cs4=BFC*YU,inF=function(X,Y){var fx=(X-ox)/YU,fy=(Y-oy)/YU;if(fx<0||fy<0||fx>=BFW||fy>=BFH)return -1;return Math.floor(fy/BFC)*BFX+Math.floor(fx/BFC)};
  S.setl.forEach(function(s2){var C=coreOf(s2);if(!C.r||Math.abs(C.c[0]-cx)>BFW*YU/2+C.r+4||Math.abs(C.c[1]-cy)>BFH*YU/2+C.r+4)return;var hl=LH_M[0]/2/MPU,hw=LH_M[1]/2/MPU;
    C.lh.forEach(function(q){var hx=C.c[0]+q[0],hy=C.c[1]+q[1],an=(q[2]||0)*Math.PI/180,ca=Math.cos(an),sa=Math.sin(an),R=hl+cs4,gx0=Math.floor((hx-R-ox)/cs4),gx1=Math.floor((hx+R-ox)/cs4),gy0=Math.floor((hy-R-oy)/cs4),gy1=Math.floor((hy+R-oy)/cs4);
      for(var gy=Math.max(0,gy0);gy<=Math.min(BFY-1,gy1);gy++)for(var gx=Math.max(0,gx0);gx<=Math.min(BFX-1,gx1);gx++){var X=ox+(gx+.5)*cs4-hx,Y=oy+(gy+.5)*cs4-hy,u=X*ca+Y*sa,v=-X*sa+Y*ca;if(Math.abs(u)<=hl&&Math.abs(v)<=hw&&g[gy*BFX+gx]!=='a')g[gy*BFX+gx]='h'}})});
  walls().forEach(function(w){var G=wallGeo(w);if(G.bx[2]<ox||G.bx[0]>ox+BFW*YU||G.bx[3]<oy||G.bx[1]>oy+BFH*YU)return;var hp=panHP(w,G),gp=gatePanels(w,G),code=w.h==='l'?'X':'W',prev=-1,stp=.5*YU;
    for(var sd=0;sd<=G.L+1e-9;sd+=stp){var p=G.at(sd),ci=inF(p[0],p[1]);if(ci<0){prev=-1;continue}var pi=Math.min(G.n-1,Math.floor(sd/G.L*G.n)),gid=gp[pi];
      if(gid!=null?gateHP(gid)<=0:(hp&&hp[pi]<=0)){prev=-1;continue}
      var mark=function(k){if(!wc[k]){wc[k]={w:w.id,h:w.h,ps:[],g:null};wu[k]=g[k]==='h'?'o':g[k];wl.push(k)}var Q=wc[k];if(Q.ps.indexOf(pi)<0)Q.ps.push(pi);if(gid!=null)Q.g=gid;g[k]=Q.g!=null?'G':code};
      mark(ci);if(prev>=0&&prev!==ci){var px0=prev%BFX,py0=(prev-px0)/BFX,qx0=ci%BFX,qy0=(ci-qx0)/BFX;if(px0!==qx0&&py0!==qy0)mark(py0*BFX+qx0)}prev=ci}});
  towers().forEach(function(t){var p=t.pts[0],fx=(p[0]-ox)/YU,fy=(p[1]-oy)/YU;if(fx>=0&&fy>=0&&fx<BFW&&fy<BFH)tw.push({id:t.id,x:fx,y:fy})});
  var wet='';for(var wq=0;wq<g.length;wq++){var wx2=wq%BFX,wy2=(wq-wx2)/BFX,MK=microAt(ox+(wx2+.5)*BFC*YU,oy+(wy2+.5)*BFC*YU).k;wet+=(g[wq]==='s'||g[wq]==='a'||MK==='swamp'||MK==='pond'||MK==='water')?'1':'0'}
  return {g:g.join(''),base:base,seed:seed,n:BFNAME[base]||'Field',ox:ox,oy:oy,hg:hg,wc:wc,wu:wu,wl:wl,tw:tw,wet:wet};
}
function bfCell(F,x,y){var gx=Math.max(0,Math.min(BFX-1,Math.floor(x/BFC))),gy=Math.max(0,Math.min(BFY-1,Math.floor(y/BFC)));return F.g.charAt(gy*BFX+gx)}
function bfPass(F,x,y,leave){if(x<0)return !!leave&&y>=0&&y<BFH;if(x>=BFW||y<0||y>=BFH)return false;return cmvAt(F,bfIdx(x,y))>0}
function bfFree(F,x,y){x=Math.max(1,Math.min(BFW-1,x));y=Math.max(1,Math.min(BFH-1,y));if(bfPass(F,x,y))return[x,y];for(var rr=2;rr<60;rr+=2)for(var a=0;a<12;a++){var nx=x+Math.cos(a/12*Math.PI*2)*rr,ny=y+Math.sin(a/12*Math.PI*2)*rr;if(bfPass(F,nx,ny))return[nx,ny]}return[x,y]}
function bfFreeWet(F,x,y){if(!F.wet||F.wet.indexOf('1')<0)return bfFree(F,x,y);var best=null,bd=1e9;for(var k=0;k<F.wet.length;k++){if(F.wet.charAt(k)!=='1')continue;var cx=(k%BFX+.5)*BFC,cy=(Math.floor(k/BFX)+.5)*BFC,d=Math.hypot(cx-x,cy-y)+((k*7)%5)*.4;if(d<bd){bd=d;best=[cx+((k*3)%3-1)*.8,cy+((k*5)%3-1)*.8]}}return best}
function bfClear(F,x0,y0,x1,y1){var d=Math.hypot(x1-x0,y1-y0),n=Math.ceil(d/1.5);for(var i=1;i<=n;i++){if(!bfPass(F,x0+(x1-x0)*i/n,y0+(y1-y0)*i/n))return false}return true}
function bfWay(F,sx,sy,tx,ty){
  var cl=function(v,m){return Math.max(0,Math.min(m-1,v))},s0=cl(Math.floor(sy/BFC),BFY)*BFX+cl(Math.floor(sx/BFC),BFX),q0=bfFree(F,tx,ty),t0=cl(Math.floor(q0[1]/BFC),BFY)*BFX+cl(Math.floor(q0[0]/BFC),BFX);
  if(s0===t0)return null;var prev=new Int32Array(BFX*BFY).fill(-2),qq=[s0],h=0;prev[s0]=-1;
  while(h<qq.length){var k=qq[h++];if(k===t0)break;var x=k%BFX,y=(k-x)/BFX;for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;var X=x+dx,Y=y+dy;if(X<0||Y<0||X>=BFX||Y>=BFY)continue;var kk=Y*BFX+X;if(prev[kk]!==-2)continue;if(cmvAt(F,kk)<=0)continue;if(dx&&dy&&(cmvAt(F,y*BFX+X)<=0||cmvAt(F,Y*BFX+x)<=0))continue;prev[kk]=k;qq.push(kk)}}
  if(prev[t0]===-2)return null;var path=[],c=t0;while(c!==-1){path.push(c);c=prev[c]}path.reverse();
  for(var i=path.length-1;i>0;i--){var px=(path[i]%BFX+.5)*BFC,py=(Math.floor(path[i]/BFX)+.5)*BFC;if(bfClear(F,sx,sy,px,py))return[px,py]}
  return[(path[1]%BFX+.5)*BFC,(Math.floor(path[1]/BFX)+.5)*BFC];
}
function bfMove(F,e,tx,ty,pace,leave){var o0=BFM,tg=e.kind==='tiggle';BFM={foe:e.side==='e',jh:e.leap&&e.jh?e.jh:0,tig:tg,dry:tg&&!(F.wet&&F.wet.charAt(bfIdx(e.x,e.y))==='1')};var r0=bfMove0(F,e,tx,ty,pace,leave);BFM=o0;return r0}
function bfSegOk(F,x0,y0,x1,y1,leave){var d=Math.hypot(x1-x0,y1-y0),n=Math.ceil(d/1.2);for(var i=1;i<n;i++)if(!bfPass(F,x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,leave))return false;return true}
function bfMove0(F,e,tx,ty,pace,leave){
  if(!leave&&!bfClear(F,e.x,e.y,tx,ty)){var wp=bfWay(F,e.x,e.y,tx,ty);if(wp){tx=wp[0];ty=wp[1]}}
  var dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);if(d<.2)return 0;
  var gc=bfCell(F,e.x,e.y),g=GROUND[gc]||GROUND.o,gm=g.mv||.3;if(e.kind==='tiggle')gm=1;if(e.leap&&((gc==='s'&&e.jd>=BFC)||(gc==='b'&&e.jh>=.5)))gm=1;var gfx=F.hg?(bfHt(F,e.x+dx/d*2,e.y+dy/d*2)-bfHt(F,e.x,e.y))/(2*.9144):0,sp=Math.min(d,gradeSpeed(pace*(e.wf||1)*gm,gfx)),a0=Math.atan2(dy,dx),tr=[0,.5,-.5,1,-1,1.5,-1.5,2.2,-2.2];
  for(var i=0;i<tr.length;i++){var a=a0+tr[i],nx=e.x+Math.cos(a)*sp,ny=e.y+Math.sin(a)*sp;if(bfPass(F,nx,ny,leave)&&(!F.wl||!F.wl.length||bfSegOk(F,e.x,e.y,nx,ny,leave))){e.x=nx;e.y=ny;return sp}}
  return 0;
}
function bfFacing(b,pt){var fs=b.foes.filter(function(f){return f.alive}),cx=0,cy=0;if(!fs.length)return[1,0];fs.forEach(function(f){cx+=f.x;cy+=f.y});cx/=fs.length;cy/=fs.length;var dx=cx-pt[0],dy=cy-pt[1],d=Math.hypot(dx,dy)||1;return[dx/d,dy/d]}
function bfSlot(b,t,i){var f=t.face||[1,0],n=t.n0,row=Math.floor(i/8),inRow=Math.min(8,n-row*8),lat=((i%8)-(inRow-1)/2)*3.2;return[t.pt[0]-f[1]*lat-f[0]*row*3.4,t.pt[1]+f[0]*lat-f[1]*row*3.4]}
/* above: straight down. From a side: the ground is turned so that side is nearest you and tilted back; men, trees and huts stay upright */
var CAMS=[['top','Above'],['w','From west'],['e','From east'],['n','From north'],['s','From south']],CAM_ROT={top:0,s:0,n:180,w:-90,e:90},CAM_K=.58,CAM_PAD=8;
function camOf(){var v=CAM_FORCE||(UI&&UI.pb&&UI.cam)||'top',t=CAM_ROT[v]*Math.PI/180,k=v==='top'?1:CAM_K,side=v==='w'||v==='e',W=side?BFH:BFW,H=side?BFW:BFH;return{v:v,c:Math.round(Math.cos(t)),s:Math.round(Math.sin(t)),k:k,W:W,H:H,pad:v==='top'?0:CAM_PAD}}
function pj(x,y){var C=camOf(),u=x-BFW/2,w=y-BFH/2;return[C.c*u-C.s*w+C.W/2,C.k*(C.s*u+C.c*w)+C.k*C.H/2]}
function unpj(X,Y){var C=camOf(),u=X-C.W/2,w=(Y-C.k*C.H/2)/C.k;return{x:C.c*u+C.s*w+BFW/2,y:-C.s*u+C.c*w+BFH/2}}
function camMatrix(){var C=camOf(),cx=BFW/2,cy=BFH/2;return 'matrix('+C.c+' '+(C.k*C.s)+' '+(-C.s)+' '+(C.k*C.c)+' '+(-C.c*cx+C.s*cy+C.W/2)+' '+(C.k*(-C.s*cx-C.c*cy)+C.k*C.H/2)+')'}
function camBar(){return '<div class="row cambar"><span class="label">View</span>'+CAMS.map(function(x){return '<button class="btn sm'+(camOf().v===x[0]?' on':'')+'" data-act="cam" data-v="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>'}
function bfSvg(F,P,click){
  var C=camOf(),rn=seeded(F.seed+17),op=OPEN[F.base]||OPEN.field,o='<svg class="bfield" viewBox="0 '+(-C.pad)+' '+C.W+' '+(C.H*C.k+C.pad)+'" shape-rendering="crispEdges" role="img" aria-label="Battlefield, '+esc(F.n)+'"><defs>';
  o+='<pattern id="'+P+'gp-o" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="'+op[0]+'"/><rect width="1" height="1" fill="'+op[1]+'"/></pattern>';
  Object.keys(GFILL).forEach(function(k){var f=GFILL[k];o+='<pattern id="'+P+'gp-'+k+'" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="'+f[0]+'"/><rect x="1" y="1" width="1" height="1" fill="'+f[1]+'"/></pattern>'});
  [['tree',.62],['bush',.38],['reed',.32],['puddle',.45],['tuft',.3],['stone',.25],['ripple',.45],['flowerY',.3],['sheep',.28]].forEach(function(q){o+='<g id="'+P+'d-'+q[0]+'" transform="scale('+q[1]+')">'+microSvg(MICRO[q[0]],-MICRO[q[0]].w/2,-MICRO[q[0]].h)+'</g>'});
  o+='<g id="'+P+'d-pine"><polygon points="0,-3.2 1.5,0 -1.5,0" fill="#22402c"/><polygon points="0,-5 1.1,-2 -1.1,-2" fill="#2c5236"/><rect x="-.18" y="0" width=".36" height=".7" fill="#4a3220"/></g>';
  o+='<g id="'+P+'d-bog"><ellipse cx="0" cy="0" rx="1.6" ry=".7" fill="#120e08"/><circle cx=".6" cy="-.2" r=".25" fill="#5a5030"/><circle cx="-.7" cy=".1" r=".18" fill="#5a5030"/></g>';
  o+='<g id="'+P+'d-hut" transform="scale(.55)">'+microSvg(MICRO.hut,-MICRO.hut.w/2,-MICRO.hut.h)+'</g>'+fortDefs(P)+'</defs>';
  o+='<g transform="'+camMatrix()+'"><rect width="'+BFW+'" height="'+BFH+'" fill="url(#'+P+'gp-o)"/>';
  for(var y=0;y<BFY;y++){var x=0;while(x<BFX){var k=F.g.charAt(y*BFX+x),x2=x;while(x2<BFX&&F.g.charAt(y*BFX+x2)===k)x2++;if(k!=='o'&&k!=='h')o+='<rect x="'+x*BFC+'" y="'+y*BFC+'" width="'+(x2-x)*BFC+'" height="'+BFC+'" fill="url(#'+P+'gp-'+k+')"/>';x=x2}}
  if(F.hg){var sh2='',ct='',ctb='';for(var y2=0;y2<BFY;y2++){var run=null,rs=0;for(var x2=0;x2<=BFX;x2++){var lv=null;if(x2<BFX){var q=y2*BFX+x2,H=F.hg,hl=H[q-(x2>0?1:0)],hr=H[q+(x2<BFX-1?1:0)],hu=H[q-(y2>0?BFX:0)],hd=H[q+(y2<BFY-1?BFX:0)],gx=(hr-hl)/(2*BFC*.9144),gy=(hd-hu)/(2*BFC*.9144);lv=Math.max(-3,Math.min(3,Math.round((-gx-gy)*6)))}
      if(lv!==run){if(run)sh2+='<rect x="'+rs*BFC+'" y="'+y2*BFC+'" width="'+(x2-rs)*BFC+'" height="'+BFC+'" fill="'+(run>0?'#fff':'#000')+'" opacity="'+(Math.abs(run)*.07).toFixed(2)+'"/>';run=lv;rs=x2}}}
    for(var y3=0;y3<BFY;y3++)for(var x3=0;x3<BFX;x3++){var q3=y3*BFX+x3,a3=Math.floor(F.hg[q3]/5);if(x3<BFX-1){var b3=Math.floor(F.hg[q3+1]/5);if(a3!==b3){var seg='M'+(x3+1)*BFC+' '+y3*BFC+'v'+BFC;if(Math.max(a3,b3)%5===0)ctb+=seg;else ct+=seg}}if(y3<BFY-1){var c3=Math.floor(F.hg[q3+BFX]/5);if(a3!==c3){var sg2='M'+x3*BFC+' '+(y3+1)*BFC+'h'+BFC;if(Math.max(a3,c3)%5===0)ctb+=sg2;else ct+=sg2}}}
    o+='<g shape-rendering="crispEdges">'+sh2+(ct?'<path d="'+ct+'" stroke="#3a2410" stroke-width=".35" opacity=".55" fill="none"/>':'')+(ctb?'<path d="'+ctb+'" stroke="#3a2410" stroke-width=".7" opacity=".7" fill="none"/>':'')+'</g>'}
  if(F.hg){var wf='';for(var y4=0;y4<BFY;y4++)for(var x4=0;x4<BFX;x4++){var q4=y4*BFX+x4,c4=F.g.charAt(q4);if(c4!=='s'&&c4!=='f')continue;var H4=F.hg,gm=0;D4.forEach(function(dd){var X=x4+dd[0],Y=y4+dd[1];if(X<0||Y<0||X>=BFX||Y>=BFY)return;var k2=Y*BFX+X;if(F.g.charAt(k2)==='s'||F.g.charAt(k2)==='a')gm=Math.max(gm,Math.abs(H4[q4]-H4[k2])/(BFC*.9144))});
      if(gm>FALL_G&&c4==='s')wf+='<rect x="'+x4*BFC+'" y="'+y4*BFC+'" width="'+BFC+'" height="'+BFC+'"/>'}
    if(wf)o+='<g class="wfall">'+wf+'</g><g class="wfall w2">'+wf+'</g>'}
  o+='</g>';var items=[];
  function d(nm,x,y){var q=pj(x,y);items.push({y:q[1],h:'<use href="#'+P+'d-'+nm+'" x="'+q[0].toFixed(1)+'" y="'+q[1].toFixed(1)+'"/>'})}
  for(var j=0;j<F.g.length;j++){var ck=F.g.charAt(j),cx=(j%BFX)*BFC,cy=Math.floor(j/BFX)*BFC,jx=cx+.5+rn()*3,jy=cy+1+rn()*3,q=rn();
    if(ck==='w'){if(q<.62)d('tree',jx,jy+2);else if(q<.8)d('bush',jx,jy)}
    if(ck==='p'){if(q<.5)d('pine',jx,jy+2)}
    else if(ck==='t'){d('tree',cx+1,cy+2.6);d('tree',cx+3,cy+3.4);d('bush',cx+2,cy+4.2);if(q<.6)d('tree',cx+2,cy+1.4)}
    else if(ck==='q'){d('bog',cx+2,cy+2.4);if(q<.5)d('bog',cx+1,cy+3.6);if(q<.35)d('reed',jx,jy+1)}
    else if(ck==='b'){if(q<.7)d('bush',jx,jy)}
    else if(ck==='m'){if(q<.3)d('reed',jx,jy+1);else if(q<.5)d('puddle',jx,jy)}
    else if(ck==='a'||ck==='s'){if(q<.18)d('ripple',jx,jy)}
    else if(ck==='r'){if(q<.12)d('stone',jx,jy)}
    else if(ck==='c'){if(q<.5)d('tuft',jx,jy)}
    else if(ck==='h'){}
    else if(ck==='W'||ck==='X'||ck==='G')d(ck==='W'?'palS':ck==='X'?'palL':'gate',cx+2,cy+3.4);
    else if(ck==='o'){if(q<.1)d('tuft',jx,jy);else if(q<.13&&F.base==='field')d('flowerY',jx,jy);else if(q<.125&&F.base==='pasture')d('sheep',jx,jy);else if(q<.135)d('stone',jx,jy)}}
  (F.tw||[]).forEach(function(t){d('tower',t.x,t.y)});
  items.sort(function(a,b){return a.y-b.y}).forEach(function(it){o+=it.h});
  o+='<g id="'+P+'mk" shape-rendering="auto"></g><g id="'+P+'en" shape-rendering="auto"></g><g id="'+P+'fx" shape-rendering="auto"></g>';
  if(click)o+='<g transform="'+camMatrix()+'"><rect width="'+BFW+'" height="'+BFH+'" fill="transparent" data-act="bfpt" style="cursor:crosshair"/></g>';
  return o+'</svg>';
}
/* stakes, a gate, a tower, drawn in yards: a man is about 2.1 yd tall */
function fortDefs(P){var st=function(h){var o='';for(var i=0;i<4;i++){var x=-2+i;o+='<rect x="'+x+'" y="'+(-h)+'" width="1" height="'+h+'" fill="#2a1a0e"/><rect x="'+(x+.12)+'" y="'+(-h+.25)+'" width=".76" height="'+(h-.25)+'" fill="'+(i%2?'#8a5a30':'#7a4e2a')+'"/><rect x="'+(x+.12)+'" y="'+(-h+.25)+'" width=".22" height="'+(h-.25)+'" fill="#b07a40"/><polygon points="'+(x+.12)+','+(-h+.3)+' '+(x+.5)+','+(-h-.25)+' '+(x+.88)+','+(-h+.3)+'" fill="#c89a5a"/>'}return o};
  return '<g id="'+P+'d-palS">'+st(2)+'</g><g id="'+P+'d-palL">'+st(3.33)+'</g>'+
    '<g id="'+P+'d-gate"><rect x="-2" y="-3" width=".45" height="3" fill="#2a1a0e"/><rect x="1.55" y="-3" width=".45" height="3" fill="#2a1a0e"/><rect x="-1.55" y="-2.3" width="1.5" height="2.1" fill="#7a4e2a" stroke="#2a1a0e" stroke-width=".12"/><rect x=".05" y="-2.3" width="1.5" height="2.1" fill="#8a5a30" stroke="#2a1a0e" stroke-width=".12"/><rect x="-1.55" y="-1.5" width="3.1" height=".25" fill="#4a3018"/></g>'+
    '<g id="'+P+'d-tower"><rect x="-1.7" y="0" width=".35" height="5" fill="#2a1a0e"/><rect x="1.35" y="0" width=".35" height="5" fill="#2a1a0e"/><path d="M-1.5 .6L1.5 4.4M1.5 .6L-1.5 4.4" stroke="#4a3018" stroke-width=".22"/><rect x="-2.1" y="-.5" width="4.2" height="1.1" fill="#8a5a30" stroke="#2a1a0e" stroke-width=".14"/><rect x="-2.1" y="-1.3" width="4.2" height=".8" fill="none" stroke="#5a3a1e" stroke-width=".16"/></g>'}
var MANK=.13;/* sprite art is 16 px tall: ×0.13 makes a man about 2.1 yards tall */
function manG(art,foe){return '<g transform="'+(foe?'translate('+(8*MANK).toFixed(2)+' '+(-16*MANK).toFixed(2)+') scale(-'+MANK+' '+MANK+')':'translate('+(-8*MANK).toFixed(2)+' '+(-16*MANK).toFixed(2)+') scale('+MANK+')')+'">'+art+'</g>'}
function bfDrawEnts(P,list){
  var lay=document.getElementById(P+'en');if(!lay)return;
  list.forEach(function(e){
    var id=P+'n'+e.i,el=document.getElementById(id);
    if(!el){el=document.createElementNS(SVGNS,'g');el.setAttribute('id',id);el.setAttribute('class','bfe '+(e.s==='p'?'side-p':'side-e'));
      var art=e.s==='p'?humanInner(e.e.eq,e.e.f,e.e):mobInner(e.e.k,e.e.b);
      el.innerHTML='<ellipse class="shr" cx="0" cy="-1.05" rx="1.15" ry="1.55"/><ellipse class="bfr" cx="0" cy="0" rx=".8" ry=".38" fill="'+(e.s==='p'?TCOL[e.col||0]:'#b8432c')+'"/>'+manG('<g class="bob">'+art+'</g>',e.s==='e')+(e.s==='p'?'<g class="gsh"><rect x=".35" y="-1.9" width=".62" height="1.35" rx=".22" fill="'+((e.e.eq||[]).indexOf('hide_shield')>=0?'#a07a44':'#0000')+'" stroke="'+((e.e.eq||[]).indexOf('hide_shield')>=0?'#3a2814':'#f4ead2')+'" stroke-width=".12"/></g>':'')+'<rect class="hpbg" x="-1" y="-2.75" width="2" height=".32"/><rect class="hpb" x="-1" y="-2.75" width="2" height=".32"/>';
      lay.appendChild(el)}
    var pq=pj(e.x,e.y);e.sy=pq[1];el.setAttribute('transform','translate('+pq[0].toFixed(2)+' '+pq[1].toFixed(2)+')');
    el.classList.toggle('dead',e.a===0);el.classList.toggle('gone',e.a===2);el.classList.toggle('walk',!!e.mv&&e.a===1);el.classList.toggle('sel',!!e.sel);el.classList.toggle('guard',!!e.gd);el.classList.toggle('hid',!!e.hid);el.classList.toggle('shd',!!e.shd);
    var hb=el.lastChild;if(hb)hb.setAttribute('width',(2*Math.max(0,e.hp)/(e.m||100)).toFixed(2));
  });
  if(camOf().v!=='top'){var srt=list.slice().sort(function(a,b){return a.sy-b.sy}),ok=true;for(var j=1;j<srt.length;j++)if(lay.children[j-1]&&lay.children[j-1].id!==P+'n'+srt[j-1].i){ok=false;break}if(!ok)srt.forEach(function(e){var n=document.getElementById(P+'n'+e.i);if(n)lay.appendChild(n)})}
}
var NOMOTION=false;try{NOMOTION=window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(x){}
/* moves: a melee swing lunges at the target, a bow recoils, a spell glows; the man hit flashes and is knocked back, a dodge sidesteps */
function bfAnim(P,i,frames,ms,delay){if(NOMOTION||i==null)return;var el=document.getElementById(P+'n'+i);if(!el)return;var bob=el.querySelector('.bob');if(!bob||!bob.animate)return;try{bob.animate(frames,{duration:ms,delay:delay||0,easing:'ease-out'})}catch(x){}}
var POP=[{transform:'scale(.1)',opacity:1},{transform:'scale(1)',opacity:0}],SWING={club:1,axe:1,battle_axe:1},FLYSP={p_bolt:1,p_arrow:1};
function bfPose(P,i,cls,ms){if(i==null)return;var el=document.getElementById(P+'n'+i);if(!el)return;el.style.setProperty('--pd',ms+'ms');el.classList.remove('atk','cst');void el.getBoundingClientRect();el.classList.add(cls);clearTimeout(el._pt);el._pt=setTimeout(function(){el.classList.remove(cls)},ms+140)}
function bfMoves(P,ev,dur){
  if(ev.k==='m')bfPose(P,ev.a,'atk',ev.x==='battle_axe'?480:380);else if(ev.k==='r')bfPose(P,ev.a,'atk',Math.max(380,dur));else if(ev.k==='b'||ev.k==='s'||ev.k==='j')bfPose(P,ev.a,'cst',520);
  var dir=ev.bx>=ev.ax?1:-1,as=ev.s==='e'?1:-1,ts=ev.s==='e'?-1:1,fly=ev.k==='r'||(ev.k==='b'&&FLYSP[ev.x]),hd=fly?dur:0,X=ev.x,f=dir*as;/* art of your men faces right, mobs are mirrored */
  if(ev.k==='m'){
    if(X==='spear')bfAnim(P,ev.a,[{transform:'none'},{transform:'translate('+(-f*2)+'px,0)',offset:.25},{transform:'translate('+(f*11)+'px,0)',offset:.5},{transform:'none'}],300);/* draw back, drive the point in */
    else if(SWING[X])bfAnim(P,ev.a,[{transform:'none'},{transform:'translate('+(-f*2)+'px,-2px) rotate('+(-f*22)+'deg)',offset:.35},{transform:'translate('+(f*6)+'px,1px) rotate('+(f*28)+'deg)',offset:.6},{transform:'none'}],X==='battle_axe'?420:340);/* wind up overhead, chop down */
    else if(X==='knife')bfAnim(P,ev.a,[{transform:'none'},{transform:'translate('+(f*5)+'px,0)',offset:.2},{transform:'none',offset:.4},{transform:'translate('+(f*5)+'px,-1px)',offset:.6},{transform:'none'}],260);/* two quick stabs */
    else if(X==='claw')bfAnim(P,ev.a,[{transform:'none'},{transform:'translate('+(f*7)+'px,-5px) rotate('+(f*10)+'deg)',offset:.45},{transform:'none'}],240);/* goblin pounce */
    else bfAnim(P,ev.a,[{transform:'none'},{transform:'translate('+(f*7)+'px,-1px) rotate('+(f*14)+'deg)',offset:.4},{transform:'none'}],260);
  }
  else if(ev.k==='r')bfAnim(P,ev.a,[{transform:'none'},{transform:'translate('+(-f*2)+'px,0)',offset:.3},{transform:'none'}],200);
  else if(ev.k==='b'||ev.k==='sh')bfAnim(P,ev.a,[{filter:'drop-shadow(0 0 4px #9fd8ff) brightness(1.6)'},{filter:'none'}],420);
  if(ev.k==='sh')return;
  if(ev.lab==='dodged')bfAnim(P,ev.t,[{transform:'none'},{transform:'translate(0,-5px)',offset:.4},{transform:'none'}],240,hd);
  else if(ev.d>0)bfAnim(P,ev.t,[{transform:'none',filter:'brightness(2.6) saturate(0)'},{transform:'translate('+(dir*ts*(X==='battle_axe'||X==='p_push'?7:4))+'px,0)',filter:'none',offset:.5},{transform:'none',filter:'none'}],230,hd);
  else if(ev.d===0)bfAnim(P,ev.t,[{transform:'none'},{transform:'translate('+(dir*ts*2)+'px,0)',offset:.5},{transform:'none'}],180,hd);
}
/* effects drawn on the field itself, in yards */
function fxAdd(fx,tag,at,frames,ms,delay){var el=document.createElementNS(SVGNS,tag);Object.keys(at).forEach(function(k){el.setAttribute(k,at[k])});fx.appendChild(el);if(NOMOTION||!el.animate){setTimeout(function(){el.remove()},ms+(delay||0));return el}var an=el.animate(frames,{duration:ms,delay:delay||0,easing:'ease-out',fill:'both'});an.onfinish=function(){el.remove()};return el}
function bfEffect(fx,ev,dur){
  var X=ev.x,ax=ev.ax,ay=ev.ay-1.1,bx=ev.bx,by=ev.by-1.1,dir=bx>=ax?1:-1,hit=ev.d>0;
  if(hit&&ev.k!=='sh'){var dl=(ev.k==='r'||FLYSP[X])?dur:0;for(var bi=0;bi<(ev.d>30?6:3);bi++){var vx=dir*(.4+Math.random()*1.2),vy=-(.5+Math.random()*1.1);fxAdd(fx,'rect',{x:bx.toFixed(2),y:by.toFixed(2),width:.22,height:.22,class:'fx-blood'},[{transform:'translate(0,0)',opacity:1},{transform:'translate('+vx.toFixed(2)+'px,'+vy.toFixed(2)+'px)',opacity:1,offset:.4},{transform:'translate('+(vx*1.5).toFixed(2)+'px,'+(1.2).toFixed(2)+'px)',opacity:0}],420,dl)}}
  if(ev.k==='m'){
    if(X==='spear'){var dx=bx-ax,dy=by-ay,dd=Math.hypot(dx,dy)||1;fxAdd(fx,'line',{x1:(bx-dx/dd*1.7).toFixed(2),y1:(by-dy/dd*1.7).toFixed(2),x2:(bx+dx/dd*.35).toFixed(2),y2:(by+dy/dd*.35).toFixed(2),class:'fx-thrust'},[{opacity:0},{opacity:1,offset:.45},{opacity:0}],300)}
    else if(SWING[X]){var r=X==='battle_axe'?1.6:1.2;fxAdd(fx,'path',{d:'M'+(bx-dir*r*.4).toFixed(1)+' '+(by-r).toFixed(1)+' A'+r+' '+r+' 0 0 '+(dir>0?1:0)+' '+(bx+dir*r*.6).toFixed(1)+' '+(by+r*.7).toFixed(1),class:'fx-swing'+(X==='battle_axe'?' big':'')},[{opacity:0},{opacity:1,offset:.55},{opacity:0}],X==='battle_axe'?420:340)}
    else if(X==='knife'){fxAdd(fx,'circle',{cx:bx.toFixed(1),cy:by.toFixed(1),r:.32,class:'fx-stab'},[{opacity:0},{opacity:1,offset:.25},{opacity:0,offset:.45},{opacity:1,offset:.65},{opacity:0}],260)}
    else if(X==='claw'){[-.4,0,.4].forEach(function(o){fxAdd(fx,'line',{x1:(bx-.55).toFixed(2),y1:(by-.7+o).toFixed(2),x2:(bx+.55).toFixed(2),y2:(by+.2+o).toFixed(2),class:'fx-claw'},[{opacity:0},{opacity:1,offset:.5},{opacity:0}],240)})}
    return;
  }
  if(ev.k==='sh'){fxAdd(fx,'circle',{cx:ax.toFixed(1),cy:(ay+.2).toFixed(1),r:1.8,class:'fx-shield'},[{transform:'scale(.2)',opacity:1},{transform:'scale(1)',opacity:.9,offset:.6},{opacity:0}],520);return}
  if(ev.k==='r'){var el=fxAdd(fx,'line',{x1:0,y1:0,x2:((bx-ax)/(Math.hypot(bx-ax,by-ay)||1)*1.1).toFixed(2),y2:((by-ay)/(Math.hypot(bx-ax,by-ay)||1)*1.1).toFixed(2),class:'bfarrow'},[{transform:'translate('+ax+'px,'+ay+'px)'},{transform:'translate('+(ev.d>=0?bx:bx+dir*2)+'px,'+(ev.d>=0?by:by+1.2)+'px)'}],dur);return}
  if(ev.k!=='b')return;
  if(X==='p_bolt'){fxAdd(fx,'circle',{cx:0,cy:0,r:.7,class:'fx-bolt'},[{transform:'translate('+ax+'px,'+ay+'px)'},{transform:'translate('+bx+'px,'+by+'px)'}],dur);fxAdd(fx,'circle',{cx:bx.toFixed(1),cy:by.toFixed(1),r:2,class:'fx-burst bolt'},POP,380,dur)}
  else if(X==='p_arrow'){var L=Math.hypot(bx-ax,by-ay)||1;fxAdd(fx,'line',{x1:0,y1:0,x2:((bx-ax)/L*2.4).toFixed(2),y2:((by-ay)/L*2.4).toFixed(2),class:'fx-arcarrow'},[{transform:'translate('+ax+'px,'+ay+'px)'},{transform:'translate('+bx+'px,'+by+'px)'}],dur)}
  else if(X==='p_jab'){fxAdd(fx,'circle',{cx:bx.toFixed(1),cy:by.toFixed(1),r:1.3,class:'fx-burst'},POP,320)}
  else if(X==='p_slash'){fxAdd(fx,'path',{d:'M'+(bx-1.8).toFixed(1)+' '+(by-1.3).toFixed(1)+' Q'+bx.toFixed(1)+' '+(by+.9).toFixed(1)+' '+(bx+1.8).toFixed(1)+' '+(by-1.3).toFixed(1),class:'fx-slash'},[{opacity:0,strokeDashoffset:5},{opacity:1,strokeDashoffset:0,offset:.5},{opacity:0,strokeDashoffset:0}],380)}
  else if(X==='p_push'){fxAdd(fx,'circle',{cx:ax.toFixed(1),cy:ay.toFixed(1),r:5,class:'fx-wave'},POP,420)}
  else if(X==='p_pull'){fxAdd(fx,'line',{x1:ax.toFixed(1),y1:ay.toFixed(1),x2:bx.toFixed(1),y2:by.toFixed(1),class:'fx-tether'},[{opacity:0},{opacity:1,offset:.3},{opacity:0}],480)}
}
function bfFx(P,evs,dur,last){
  var fx=document.getElementById(P+'fx'),NS=SVGNS;
  evs.slice(-40).forEach(function(ev){
    last=Math.max(last,ev.n||0);if(!fx)return;if(ev.k==='b'&&!ev.x)ev.x='p_bolt';var A=pj(ev.ax,ev.ay),B=pj(ev.bx,ev.by);ev=Object.assign({},ev,{ax:A[0],ay:A[1],bx:B[0],by:B[1]});bfMoves(P,ev,dur);bfEffect(fx,ev,dur);
    if(ev.d<0&&ev.k!=='r'&&!ev.lab)return;
    var tx=document.createElementNS(NS,'text');tx.setAttribute('x',(ev.bx+((ev.n||0)%3-1)*1.2).toFixed(1));tx.setAttribute('y',(ev.by-3.6).toFixed(1));
    tx.setAttribute('class','bpop '+(ev.d<0?'miss':ev.s));tx.textContent=ev.lab||(ev.d<0?'miss':ev.d===0?'block':'−'+Math.round(ev.d)+' HP');
    setTimeout(function(){fx.appendChild(tx);setTimeout(function(){tx.remove()},1200)},ev.k==='r'||(ev.k==='b'&&FLYSP[ev.x])?dur:0);
  });
  return last;
}
function bfPlace(b,sel,x,y,mode){
  var n=sel.length,f=bfFacing(b,[x,y]),w=sel.map(function(t){return Math.min(8,t.n0)*3.2+5}),tot=0;w.forEach(function(v){tot+=v});
  var off=-tot/2;
  sel.forEach(function(t,i){var lat=off+w[i]/2;off+=w[i];var p=bfFree(b.F,x-f[1]*lat,y+f[0]*lat);t.pt=p;t.face=bfFacing(b,p);
    if(mode)t.order=mode;

  });
}
function walkPos(o){if(o.xy&&!(o.path&&o.path.length))return o.xy;var a=center(o.pos[0],o.pos[1]);if(!o.path||!o.path.length||o.wait||o.busy)return a;var b=center(o.path[0][0],o.path[0][1]),f=Math.max(0,Math.min(1,1-o.rem/HEX_YD));return[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f]}
function unitMarkers(){
  var o='';
  S.units.forEach(function(U){
    var L=U.live;if(!L||!U.hids.length)return;
    var p=walkPos(L),h=byId(U.hids[0]),eq=h?eqKeys(h):[],fem=h&&h.sex==='f';
    o+='<g class="umk'+(UI.mu===U.id?' on':'')+'" id="um-'+U.id+'" data-bx="'+p[0].toFixed(1)+'" data-by="'+p[1].toFixed(1)+'" pointer-events="none"><circle class="umbg" cx="'+p[0].toFixed(1)+'" cy="'+(p[1]-10).toFixed(1)+'" r="13"/><g transform="translate('+(p[0]-10).toFixed(1)+' '+(p[1]-22).toFixed(1)+') scale(1.25)"><g class="bob">'+humanInner(eq,fem,h)+'</g></g><text class="ulab" x="'+p[0].toFixed(1)+'" y="'+(p[1]+9).toFixed(1)+'">'+esc(U.name.slice(0,10))+' · '+U.hids.length+'</text></g>';
  });
  return o;
}
function unitListHtml(){
  var rows=S.units.filter(function(U){return U.hids.length}).map(function(U){var L=U.live,R=routeName(U);return '<tr><td><button class="btn sm'+(UI.mu===U.id?' on':'')+'" data-act="mu" data-u="'+U.id+'">'+esc(U.name)+'</button></td><td class="mono">'+U.hids.length+'</td><td>'+(R?esc(R):'<span class="dim">none</span>')+'</td><td>'+esc(L?L.status:'At home')+'</td><td class="mono">'+(L?lab(L.pos[0],L.pos[1]):'')+'</td></tr>'}).join('');
  return rows?'<div class="tblwrap"><table><tr><th>Unit</th><th>Men</th><th>Patrol</th><th>Doing</th><th>At</th></tr>'+rows+'</table></div>':'<p class="note">No units with men. Form units in the Units tab.</p>';
}
function mstatHtml(){
  var M=S.match,alive=0,campsLeft=0;M.camps.forEach(function(m){alive+=m.mobs.length;if(!m.razed)campsLeft++});
  var hum=S.cards.filter(function(c){return c.key==='human'&&c.at!==null}).length;
  return '<table><tr><th>Mobs left</th><th>Camps standing</th><th>Settlements</th><th>Humans</th></tr><tr class="mono"><td>'+alive+'</td><td>'+campsLeft+' of '+M.camps.length+'</td><td>'+S.setl.length+'</td><td>'+hum+'</td></tr></table>';
}
function logHtml(){return S.match.log.slice().reverse().slice(0,24).map(function(l){return '<div><b>'+l.t+'</b><span class="'+(l.c||'')+'">'+esc(l.m)+'</span></div>'}).join('')}
function setHtml(id,h){var el=document.getElementById(id);if(el&&LIVE_CACHE[id]!==h){el.innerHTML=h;LIVE_CACHE[id]=h}}
function liveDraw(){
  var M=S.match;if(!M)return;
  if(UI.needRender){UI.needRender=false;render();return}
  ['mclock','hclock'].forEach(function(id){var el=document.getElementById(id);if(el)el.textContent=mmss(M.clock)});
  var ph=document.getElementById('mphase');if(ph)ph.textContent=M.clock<raidAt()?'Mobs hold their base range for '+mmss(raidAt()-M.clock)+' more.':'Mobs are exploring and aggressive.';
  if(UI.tab==='match'&&UI._bsig!==bsig()){render();return}
  var DSm=deepSet('m');
  S.units.forEach(function(U){var el=document.getElementById('um-'+U.id);if(!el||!U.live)return;var p=walkPos(U.live);el.style.display=DSm[hexAtXY(p[0],p[1])]?'none':'';el.classList.toggle('hid',unitHidden(U));el.setAttribute('transform','translate('+(p[0]-(+el.dataset.bx)).toFixed(1)+' '+(p[1]-(+el.dataset.by)).toFixed(1)+')');el.classList.toggle('walk',M.speed>0&&U.live.path.length>0&&!U.live.wait&&!U.live.busy)});
  M.camps.forEach(function(m){if(!m.roam||!m.mobs.length||!m.pos)return;var el=document.getElementById('mk-'+m.key);if(!el)return;var p=walkPos(m),f=center(+el.dataset.c,+el.dataset.r);el.style.display=DSm[hexAtXY(p[0],p[1])]?'none':'';el.setAttribute('transform','translate('+(p[0]-f[0]).toFixed(1)+' '+(p[1]-f[1]).toFixed(1)+')')});
  drawBattleView();
  lookLive();setHtml('ulive',unitListHtml());setHtml('mstat',mstatHtml());setHtml('mloglist',logHtml());setHtml('battles',raidList());
}
function raidList(){return UI.raids&&UI.raids.length?UI.raids.map(function(r,i){return '<button class="btn sm" data-act="watch" data-i="'+i+'">Watch '+esc(r.at+' '+r.title)+'</button>'}).join(''):'<span class="note">No battles yet.</span>'}
function unitPanel(){
  var U=unitById(UI.mu);if(!U||!S.match)return '<p class="note">Pick a unit above to give it orders.</p>';
  var L=U.live,R=routeById(U.route);
  var opts=routeOpts(U.route,'No patrol');
  return '<h3>'+esc(U.name)+' · '+U.hids.length+' men</h3><div class="field"><label class="label" for="mrt">Patrol</label><select id="mrt" data-mrt="'+U.id+'">'+opts+'</select></div>'+
    (isDefend(U)?'<p class="note">Stays home and goes after any mob that steps onto the settlement or one of the tiles touching it, then comes back.</p>':R?'<p class="note">'+esc(engText(R.eng||ENG_DEF))+'</p>':'')+
    (S.units.length>1?'<div class="field"><label class="label" for="rf'+U.id+'">Reinforce</label><select id="rf'+U.id+'" data-reinf="'+U.id+'"><option value="">Pick a unit to reinforce…</option>'+S.units.filter(function(x){return x!==U&&x.hids.length}).map(function(x){return '<option value="'+x.id+'"'+(L&&L.mode==='reinforce'&&L.target===x.id?' selected':'')+'>'+esc(x.name)+'</option>'}).join('')+'</select></div>':'')+
    '<div class="row"><button class="btn sm go" data-act="ucmd" data-c="resume" data-u="'+U.id+'">'+(R?'Restart patrol':'Resume')+'</button><button class="btn sm" data-act="ucmd" data-c="hold" data-u="'+U.id+'">Hold here</button><button class="btn sm" data-act="ucmd" data-c="home" data-u="'+U.id+'">Return home</button><button class="btn sm" data-act="topatrols">Edit patrols</button></div>';
}
function speedBar(){
  var M=S.match;
  return '<div class="row speedbar"><span class="mono clock" id="mclock">'+mmss(M.clock)+'</span>'+[[0,'Pause'],[1,'1×'],[10,'10×'],[60,'60×']].map(function(x){return '<button class="btn sm'+(M.speed===x[0]?' on':'')+'" data-act="mspd" data-s="'+x[0]+'">'+x[1]+'</button>'}).join('')+'<button class="btn sm'+(M.autoPause?' on':'')+'" data-act="mauto">Pause on contact</button></div>';
}

