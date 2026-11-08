/* ---------- one map: drag to pan, wheel or pinch to zoom, tap a tile to zoom in right there ----------
   The camera is kept per map (UI.pz[key] = centre and map units per screen pixel). Zoomed in far enough, the tiles in view
   open up as their real ground (the 140 x 96 yard field a fight would happen on), and a running fight plays out there. */
var YU=Math.sqrt(3)*SH/HEX_YD,PZ_MIN=.006,PZ_LOD=.07,PZ={ptr:{},drag:false,sup:0,t:null,svg:null,pd:null};
function fieldBox(c,r){var p=center(c,r),fw=BFW*YU,fh=BFH*YU;return[p[0]-fw/2,p[1]-fh/2,fw,fh]}
function fieldBoxF(F){return F.ox!=null?[F.ox,F.oy,BFW*YU,BFH*YU]:[0,0,BFW*YU,BFH*YU]}
function placeField(svg,F){var b=fieldBoxF(F);return svg.replace('<svg class="bfield"','<svg class="bfield inmap" x="'+b[0].toFixed(2)+'" y="'+b[1].toFixed(2)+'" width="'+b[2].toFixed(2)+'" height="'+b[3].toFixed(2)+'" preserveAspectRatio="none"')}
function deepSet(key){var o={};((UI.pzDeep||{})[key]||[]).forEach(function(k){o[k]=1});return o}
function deepSvg(key){
  var L=(UI.pzDeep||{})[key];if(!L||!L.length)return '';var o='',bs=S.match?activeBattles():[];
  var bb=bs.map(function(x){return fieldBoxF(x.F)}),over=function(B){return bb.some(function(A){return !(B[0]+B[2]<A[0]||A[0]+A[2]<B[0]||B[1]+B[3]<A[1]||A[1]+A[3]<B[1])})};
  L.forEach(function(k){var c=k%COLS,r=Math.floor(k/COLS),b=null,bx=fieldBox(c,r);bs.forEach(function(x){if(x.pos[0]===c&&x.pos[1]===r)b=x});
    if(b){bx=fieldBoxF(b.F);if(b.id===UI.bsel)o+='<g id="bview" class="bvhost" data-c="'+c+'" data-r="'+r+'"></g>';else o+='<g data-act="bsel" data-id="'+b.id+'" style="cursor:pointer">'+placeField(bfSvg(b.F,'bo'+b.id,false),b.F)+'</g>'}
    else{if(over(bx))return;var F=lookField(c,r),E=S.match?lookEnts(c,r):{svg:''};o+=placeField(bfSvg(F,'lk'+k,false).replace('<g id="lk'+k+'en" shape-rendering="auto"></g>','<g id="lk'+k+'en" shape-rendering="auto">'+E.svg+'</g>'),F)}
    o+='<rect class="ffr" x="'+bx[0].toFixed(2)+'" y="'+bx[1].toFixed(2)+'" width="'+bx[2].toFixed(2)+'" height="'+bx[3].toFixed(2)+'"/><text class="ffl" x="'+(bx[0]+.3).toFixed(2)+'" y="'+(bx[1]-.4).toFixed(2)+'">'+lab(c,r)+' · '+BFW+' × '+BFH+' yd of ground'+(b?' · fight':'')+'</text>';
  });
  return '<g class="deep">'+o+'</g>';
}
function battleMarks(key){if(!S.match)return '';var D=deepSet(key);return activeBattles().map(function(b){var k=ix(b.pos[0],b.pos[1]);if(D[k])return '';var p=center(b.pos[0],b.pos[1]);return '<g class="bmark" data-act="bzoom" data-id="'+b.id+'"><title>Fight at '+esc(b.where)+': tap to zoom in</title><circle cx="'+p[0].toFixed(1)+'" cy="'+(p[1]+14).toFixed(1)+'" r="9"/><text x="'+p[0].toFixed(1)+'" y="'+(p[1]+18.5).toFixed(1)+'">⚔</text></g>'}).join('')}
function mapView(svg,key,over,pre){
  var m=/viewBox="([^"]+)"/.exec(svg),home=m?m[1]:'0 0 100 100';
  svg=svg.replace('<svg class="hexmap','<svg data-pz="'+key+'"'+(svg.indexOf('<g class="play">')>=0?' data-play="1" data-s="'+(UI.pz&&UI.pz[key]?UI.pz[key].s:.3)+'"':'')+' data-home="'+home+'" data-deep="'+((UI.pzDeep||{})[key]||[]).join(',')+'" class="hexmap');
  return (pre||'')+'<div class="pz'+(UI.leg?' drawing':'')+'" id="pz-'+key+'">'+svg+'<div class="pzctl"><button class="btn sm" data-act="pzz" data-k="'+key+'" data-d="1" aria-label="Zoom in">+</button><button class="btn sm" data-act="pzz" data-k="'+key+'" data-d="-1" aria-label="Zoom out">−</button><button class="btn sm" data-act="pzfit" data-k="'+key+'">Whole map</button></div>'+(over||'')+'</div>';
}
function pzKey(svg){return svg.getAttribute('data-pz')}
function pzHome(svg){return (svg.getAttribute('data-home')||'0 0 100 100').split(' ').map(Number)}
function pzSize(svg){var r=svg.parentNode.getBoundingClientRect();return[Math.max(1,r.width),Math.max(1,r.height)]}
function pzFitS(svg){var h=pzHome(svg),z=pzSize(svg);return Math.max(h[2]/z[0],h[3]/z[1])*1.03}
function pzCam(svg){UI.pz=UI.pz||{};var k=pzKey(svg),c=UI.pz[k];if(!c){var h=pzHome(svg);c=UI.pz[k]={cx:h[0]+h[2]/2,cy:h[1]+h[3]/2,s:pzFitS(svg)}}return c}
function pzClamp(svg,c){var h=pzHome(svg),f=pzFitS(svg);c.s=Math.max(PZ_MIN,Math.min(f*1.4,c.s));c.cx=Math.max(h[0],Math.min(h[0]+h[2],c.cx));c.cy=Math.max(h[1],Math.min(h[1]+h[3],c.cy))}
function pzApply(svg){var c=pzCam(svg);pzClamp(svg,c);var z=pzSize(svg);svg.setAttribute('viewBox',(c.cx-c.s*z[0]/2).toFixed(3)+' '+(c.cy-c.s*z[1]/2).toFixed(3)+' '+(c.s*z[0]).toFixed(3)+' '+(c.s*z[1]).toFixed(3));svg.classList.toggle('lod1',c.s<PZ_LOD);svg.classList.toggle('near',c.s<.16);pzPop(svg)}
function pzDeepOf(svg){var c=pzCam(svg);if(c.s>=PZ_LOD)return[];var z=pzSize(svg),x0=c.cx-c.s*z[0]/2,y0=c.cy-c.s*z[1]/2,x1=x0+c.s*z[0],y1=y0+c.s*z[1],out=[],r,cc,fw=BFW*YU/2,fh=BFH*YU/2;
  for(r=0;r<ROWS;r++)for(cc=0;cc<COLS;cc++){var p=center(cc,r),fb=S.match&&battleAt([cc,r]);if(fb){var FB=fieldBoxF(fb.F);p=[FB[0]+FB[2]/2,FB[1]+FB[3]/2]}if(p[0]+fw<x0||p[0]-fw>x1||p[1]+fh<y0||p[1]-fh>y1)continue;if(!terrAt(cc,r)&&!setAt(cc,r))continue;if(pzKey(svg)==='m'&&UI.mview==='mine'&&S.match&&!S.match.mine[ix(cc,r)])continue;out.push([ix(cc,r),Math.hypot(p[0]-c.cx,p[1]-c.cy)])}
  return out.sort(function(a,b){return a[1]-b[1]}).slice(0,4).map(function(x){return x[0]}).sort(function(a,b){return a-b})}
function pzSettle(svg){if(!svg||!svg.isConnected)return;var k=pzKey(svg),d=pzDeepOf(svg),ds=d.join(',');UI.pzDeep=UI.pzDeep||{};UI.pzDeep[k]=d;if(ds!==(svg.getAttribute('data-deep')||''))return render();var s0=+svg.getAttribute('data-s'),c=pzCam(svg);if(svg.hasAttribute('data-play')&&s0&&(c.s/s0>1.5||s0/c.s>1.5))render()}
function pzZoomAt(svg,f,x,y){var c=pzCam(svg),rc=svg.parentNode.getBoundingClientRect(),z=pzSize(svg),px=x-rc.left-z[0]/2,py=y-rc.top-z[1]/2,wx=c.cx+px*c.s,wy=c.cy+py*c.s;c.s=c.s/f;pzClamp(svg,c);c.cx=wx-px*c.s;c.cy=wy-py*c.s;pzApply(svg)}
function pzLater(svg,ms){clearTimeout(PZ.t);PZ.t=setTimeout(function(){pzSettle(svg)},ms||0)}
function pzInit(){document.querySelectorAll('svg[data-pz]').forEach(function(svg){var k=pzKey(svg);
  if(UI.pzGo&&UI.pzGo.k===k){var c=pzCam(svg),z=pzSize(svg),p=UI.pzGo.x!=null?[UI.pzGo.x,UI.pzGo.y]:center(UI.pzGo.c,UI.pzGo.r),dk=svg.parentNode.querySelector('.pzdock:not(.min)'),dw=dk&&z[0]>=820?dk.offsetWidth+16:0,fw=z[0]-dw;c.s=Math.max(PZ_MIN,Math.max((UI.pzGo.w||140*YU)/(fw*.94),(UI.pzGo.h||96*YU)/(z[1]*.9)));c.cx=p[0]+dw/2*c.s;c.cy=p[1];UI.pzGo=null}
  pzApply(svg);pzLater(svg,0)})}
function pzPop(svg){var pop=svg.parentNode.querySelector('.pzpop[data-c],.pzpop[data-x]');if(!pop)return;var p=pop.dataset.x!=null?[+pop.dataset.x,+pop.dataset.y]:center(+pop.dataset.c,+pop.dataset.r),cam=pzCam(svg),z=pzSize(svg),x=(p[0]-cam.cx)/cam.s+z[0]/2,y=(p[1]-cam.cy)/cam.s+z[1]/2,hh=(pop.dataset.x!=null?6*cam.s:SH)/cam.s,pw=pop.offsetWidth,ph=pop.offsetHeight;
  var left=Math.max(8,Math.min(z[0]-pw-8,x-pw/2)),top=y-hh*.6-ph-6;if(top<8)top=y+hh*.6+6;if(top+ph>z[1]-8)top=Math.max(8,z[1]-ph-8);pop.style.left=left+'px';pop.style.top=top+'px'}
document.addEventListener('pointerdown',function(e){var svg=e.target.closest&&e.target.closest('svg[data-pz]');if(!svg||e.button>0)return;PZ.ptr[e.pointerId]={x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY};PZ.svg=svg;PZ.drag=false;PZ.pd=null});
document.addEventListener('pointermove',function(e){var P=PZ.ptr[e.pointerId];if(!P||!PZ.svg||!PZ.svg.isConnected)return;var svg=PZ.svg,c=pzCam(svg),ids=Object.keys(PZ.ptr);
  if(ids.length>=2){P.x=e.clientX;P.y=e.clientY;var a=PZ.ptr[ids[0]],b=PZ.ptr[ids[1]],d=Math.hypot(a.x-b.x,a.y-b.y);if(PZ.pd)pzZoomAt(svg,d/PZ.pd,(a.x+b.x)/2,(a.y+b.y)/2);PZ.pd=d;PZ.drag=true;return}
  if(!PZ.drag){if(Math.hypot(e.clientX-P.x0,e.clientY-P.y0)<6)return;PZ.drag=true;svg.parentNode.classList.add('dragging')}
  c.cx-=(e.clientX-P.x)*c.s;c.cy-=(e.clientY-P.y)*c.s;P.x=e.clientX;P.y=e.clientY;pzApply(svg)});
function pzUp(e){if(!PZ.ptr[e.pointerId])return;delete PZ.ptr[e.pointerId];PZ.pd=null;if(Object.keys(PZ.ptr).length)return;var svg=PZ.svg;if(svg&&svg.parentNode)svg.parentNode.classList.remove('dragging');if(PZ.drag){PZ.sup=Date.now();PZ.drag=false;pzLater(svg,60)}}
var LHD=null;
function svgPt(svg,e){var p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;var q=p.matrixTransform(svg.getScreenCTM().inverse());return[q.x,q.y]}
document.addEventListener('pointerdown',function(e){var g=e.target.closest&&e.target.closest('[data-lh]');if(!g||S.match||UI.draw||UI.place||e.button>0)return;var ps=g.dataset.lh.split(':'),st=setById(+ps[0]);if(!st)return;LHD={g:g,svg:g.ownerSVGElement,s:st,i:ps[1],x0:e.clientX,y0:e.clientY,mv:false};e.stopPropagation();e.preventDefault()},true);
document.addEventListener('pointermove',function(e){if(!LHD)return;e.stopPropagation();if(!LHD.mv&&Math.hypot(e.clientX-LHD.x0,e.clientY-LHD.y0)<5)return;LHD.mv=true;var q=svgPt(LHD.svg,e),C=coreOf(LHD.s),dx=q[0]-C.c[0],dy=q[1]-C.c[1],d=Math.hypot(dx,dy),lim=Math.max(0,C.r-(LHD.i==='a'?.4:LH_M[0]/2/MPU));if(d>lim){dx*=lim/d;dy*=lim/d}var Q=LHD.i==='a'?LHD.s.alt:LHD.s.lh[+LHD.i];Q[0]=Math.round(dx*100)/100;Q[1]=Math.round(dy*100)/100;LHD.g.setAttribute('transform',lhT(C,Q))},true);
document.addEventListener('pointerup',function(e){if(!LHD)return;var L=LHD;LHD=null;e.stopPropagation();if(!L.mv&&L.i!=='a'){var Q=L.s.lh[+L.i];Q[2]=((Q[2]||0)+90)%360}save();PZ.sup=Date.now();render()},true);
document.addEventListener('pointerup',pzUp);document.addEventListener('pointercancel',pzUp);
document.addEventListener('click',function(e){if(Date.now()-PZ.sup<350&&e.target.closest&&e.target.closest('svg[data-pz]')){e.stopPropagation();e.preventDefault()}},true);
document.addEventListener('wheel',function(e){var svg=e.target.closest&&e.target.closest('.pz');svg=svg&&svg.querySelector('svg[data-pz]');if(!svg)return;e.preventDefault();pzZoomAt(svg,Math.exp(-e.deltaY*(e.deltaMode===1?.05:.0018)),e.clientX,e.clientY);pzLater(svg,180)},{passive:false});
window.addEventListener('resize',function(){document.querySelectorAll('svg[data-pz]').forEach(function(svg){pzApply(svg);pzLater(svg,150)})});
function tilePopHtml(c,r,body){return '<div class="pzpop" data-c="'+c+'" data-r="'+r+'" role="dialog" aria-label="Tile '+lab(c,r)+'"><div class="pzhd"><b>'+lab(c,r)+' · '+esc(terrName(c,r))+'</b><button class="btn sm" data-act="tilex" aria-label="Close">×</button></div>'+body+'</div>'}
function bdockHtml(){var bs=S.match?activeBattles():[];if(!bs.length)return '';var b=battleById(UI.bsel);if(!b||b.done)b=bs[bs.length-1];UI.bsel=b.id;var mn=!!UI.dockMin;
  return '<aside class="bdock pzdock'+(mn?' min':'')+'" aria-label="Battle controls"><div class="pzhd" style="display:flex;justify-content:space-between;gap:6px;align-items:center"><b>Fight · '+esc(b.where)+'</b><span class="row" style="gap:4px;flex-wrap:nowrap"><button class="btn sm" data-act="bzoom" data-id="'+b.id+'">Zoom to it</button><button class="btn sm" data-act="dockmin" aria-label="'+(mn?'Open the battle controls':'Fold the battle controls')+'">'+(mn?'▾':'▴')+'</button></span></div>'+
    (mn?'':'<div class="row cambar"><span class="label">Camera</span>'+CAMS.filter(function(x){return x[0]!=='top'}).map(function(x){return '<button class="btn sm'+(UI.pip===x[0]?' on':'')+'" data-act="pipcam" data-v="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>'+(bs.length>1?'<div class="row">'+bs.map(function(x){return '<button class="btn sm'+(x.id===b.id?' on':'')+'" data-act="bsel" data-id="'+x.id+'">'+esc(x.where)+'</button>'}).join('')+'</div>':'')+'<div id="bctl">'+bctlHtml(b)+'</div><div id="bstat" class="bstat">'+battleStat(b)+'</div><details><summary class="label">Ground key</summary>'+groundLegend(b.F)+'</details>')+'</aside>'}
function bpModal(){var U=UI.bpm?unitById(UI.bpm):null;if(!U)return '';return '<div class="boardpop" role="dialog" aria-modal="true" aria-label="Battle plays"><div><div class="pzhd"><h2 style="margin:0">Battle plays · '+esc(U.name)+'</h2><button class="btn sm" data-act="bpmx">Close</button></div>'+boardEd(U)+(S.match&&activeBattles().some(function(b){return groupOf(b,U.id)})?'<p class="note">Pick the play in the battle controls to use it in this fight. Changing a play here does not change one already running.</p>':'')+'</div></div>'}
function bGo(b){var B=fieldBoxF(b.F);return{k:'m',x:B[0]+B[2]/2,y:B[1]+B[3]/2,w:170*YU,h:120*YU}}
function bsig(){return S.match?activeBattles().map(function(x){return x.id+':'+x.groups.length}).join(',')+'|'+UI.bsel+'|'+S.units.length:''}
