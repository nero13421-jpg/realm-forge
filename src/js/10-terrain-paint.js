/* ---------- aged-parchment pixel terrain: one continuous pixel-art picture under the hex grid ----------
   Tile borders are pushed around by noise so neighbouring tiles bleed into each other. Each art pixel is 1.5 map
   units; every terrain has a 4-tone muted palette with ordered dithering, a paper grain, broken ink lines where
   terrains meet, and ink-outlined pixel sprites (trees, reeds, sheep, lily pads). Shown with crisp pixel scaling. */
var TPAL={pwood:['#465a44','#56684e','#687a5c','#7e8c6a'],pforest:['#36483a','#425444','#50604e','#62705c'],forest:['#34442a','#435432','#52643c','#66744a'],water:['#46687e','#577a90','#6e90a2','#a0b8b8'],woodland:['#4a5a34','#5e6e40','#72804c','#8a945e'],swamp:['#55604a','#677058','#7a8068','#5a6e6a'],pond:['#4e6e7e','#5f8090','#7896a0','#a8bcb8'],
  field:['#a8a468','#b8b276','#c8c086','#d8cf9a'],cultivated:['#a0804a','#b49456','#c8a866','#9a9a5a'],pasture:['#7e8e52','#8e9e5e','#a0ae6c','#b4bf80'],orchard:['#7c8a4c','#8c9a56','#9eaa64','#b0b874'],
  settle:['#9a8462','#aa946e','#baa47e','#8a7454']};
var TINK='#3a2814',TPX=1.5;
function tRGB(h){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]}
var TPALRGB={};Object.keys(TPAL).forEach(function(k){TPALRGB[k]=TPAL[k].map(tRGB)});
function th(i,j){var h=(i*374761393+j*668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295}
function vn(x,y){var i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),a=th(i,j),b=th(i+1,j),c=th(i,j+1),d=th(i+1,j+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function hexOf(x,y){var w=Math.sqrt(3)*SH,r0=Math.round((y-SH)/(1.5*SH)),best=null,bd=1e18;for(var r=r0-1;r<=r0+1;r++){if(r<0||r>=ROWS)continue;var c0=Math.round(x/w-.5-((r&1)?.5:0));for(var c=c0-1;c<=c0+1;c++){if(c<0||c>=COLS)continue;var cx=w*(c+.5+((r&1)?.5:0)),cy=SH*1.5*r+SH,d=(x-cx)*(x-cx)+(y-cy)*(y-cy);if(d<bd){bd=d;best=c+r*COLS}}}return best}
var TCACHE={};
function fillTerrain(root){(root||document).querySelectorAll('image.terr').forEach(function(el){var u=TCACHE[el.getAttribute('data-tk')];if(u&&el.getAttribute('href')!==u)el.setAttribute('href',u)})}
try{new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){if(ms[i].addedNodes.length){fillTerrain();return}}}).observe(document.documentElement,{childList:true,subtree:true})}catch(x){}
function terrainKind(k){var c=k%COLS,r=Math.floor(k/COLS);return setAt(c,r)?'settle':(S.grid[k]||null)}
function terrainImage(vis,x0,y0,W,H){
  var key=['px',COLS,ROWS,S.grid.join(','),(S.hgt||[]).map(function(h){return h?h.s.charAt(0)+h.b+'.'+(h.r||0)+'.'+(h.d||0):''}).join(';'),S.setl.map(function(x){return x.c+'.'+x.r+'.'+(x.c2==null?'':x.c2+'.'+x.r2)}).join(','),vis?'v':'a',Math.round(x0),Math.round(y0),Math.round(W),Math.round(H)].join('|');
  if(TCACHE[key])return key;
  var cw=Math.max(1,Math.round(W/TPX)),chh=Math.max(1,Math.round(H/TPX)),cv=document.createElement('canvas');cv.width=cw;cv.height=chh;var g=cv.getContext('2d');if(!g)return '';
  var img=g.createImageData(cw,chh),D=img.data,kind={},ang={},px,py,T=new Array(cw*chh),bay=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
  for(var i=0;i<COLS*ROWS;i++){var c=i%COLS,r=Math.floor(i/COLS);kind[i]=(vis&&!vis(c,r))?null:terrainKind(i);ang[i]=[0,Math.PI/3,2*Math.PI/3,Math.PI/2][Math.floor(th(c+7,r+3)*4)]}
  var w=Math.sqrt(3)*SH;
  for(py=0;py<chh;py++){var y=y0+(py+.5)*TPX;for(px=0;px<cw;px++){var x=x0+(px+.5)*TPX,o=(py*cw+px)*4;
    var wx=x+(vn(x/17,y/17)-.5)*SH*.75+(vn(x/6,y/6)-.5)*SH*.18,wy=y+(vn(x/17+40,y/17+40)-.5)*SH*.75+(vn(x/6+9,y/6+9)-.5)*SH*.18,hk=hexOf(wx,wy),t=hk==null?null:kind[hk];
    if(!t){var hk0=hexOf(x,y);t=hk0==null?null:kind[hk0];hk=hk0}
    T[py*cw+px]=t;
    if(!t){D[o+3]=0;continue}
    var v=vn(x/6,y/6)*.7+vn(x/2,y/2)*.3,d=(bay[(py%4)*4+(px%4)]/16-.5)*.28,lvl=Math.max(0,Math.min(3,Math.floor((v+d)*4)));
    if(t==='cultivated'){var a=ang[hk],sx=(x*Math.cos(a)+y*Math.sin(a))/3.2;sx-=Math.floor(sx);lvl=sx<.5?2:0;if(v>.75)lvl=3}
    else if(t==='pond'){var hc=[w*((hk%COLS)+.5+((Math.floor(hk/COLS)&1)?.5:0)),SH*1.5*Math.floor(hk/COLS)+SH],dd=Math.hypot(wx-hc[0],wy-hc[1])/SH;lvl=dd>.8?3:dd>.5?2:dd>.25?1:0;if(vn(x/2,y/7)>.8&&dd<.8)lvl=3}
    else if(t==='swamp'&&vn(x/8,y/8)>.6)lvl=3;
    else if(t==='orchard'){var oa=ang[hk],ox2=(x*Math.cos(oa)+y*Math.sin(oa))/5;ox2-=Math.floor(ox2);lvl=ox2<.3?1:v>.7?3:2}
    var col=TPALRGB[t][lvl],gr=(th(px+Math.round(x0),py+Math.round(y0))-.5)*18+(vn(x/40,y/40)-.5)*29;
    D[o]=Math.max(0,Math.min(255,col[0]+gr));D[o+1]=Math.max(0,Math.min(255,col[1]+gr));D[o+2]=Math.max(0,Math.min(255,col[2]+gr*.7));D[o+3]=255;
  }}
  /* height: light from the north-west, a thin ink contour every 10 m and a bold one every 50 m, hatching on banks */
  var HG=new Float32Array(cw*chh).fill(NaN);for(py=0;py<chh;py++)for(px=0;px<cw;px++){if(!T[py*cw+px])continue;var hv=heightAt(x0+(px+.5)*TPX,y0+(py+.5)*TPX);if(hv!=null)HG[py*cw+px]=hv}
  var hk0=[60,38,22];
  for(py=1;py<chh-1;py++)for(px=1;px<cw-1;px++){var q0=py*cw+px,h0=HG[q0];if(isNaN(h0))continue;var hl=HG[q0-1],hr=HG[q0+1],hu=HG[q0-cw],hd=HG[q0+cw];if(isNaN(hl))hl=h0;if(isNaN(hr))hr=h0;if(isNaN(hu))hu=h0;if(isNaN(hd))hd=h0;
    var gx=(hr-hl)/(2*TPX*MPU),gy=(hd-hu)/(2*TPX*MPU),g2=Math.hypot(gx,gy),lit=Math.max(.58,Math.min(1.38,1+(-gx-gy)*2.4)),o2=q0*4;
    D[o2]*=lit;D[o2+1]*=lit;D[o2+2]*=lit;
    if(g2>.28&&((px+py)%2===0))for(var z=0;z<3;z++)D[o2+z]=D[o2+z]*.6+hk0[z]*.4;
    var a10=Math.floor(h0/10),b10=Math.floor(hr/10),c10=Math.floor(hd/10);if(a10!==b10||a10!==c10){var mj=(Math.max(a10,b10,c10)%5===0),s2=mj?.7:.45;for(var z2=0;z2<3;z2++)D[o2+z2]=D[o2+z2]*(1-s2)+[58,36,20][z2]*s2}}
  /* broken ink line where two terrains meet */
  var ic=tRGB(TINK);
  for(py=0;py<chh-1;py++)for(px=0;px<cw-1;px++){var t0=T[py*cw+px];if(!t0)continue;var tr=T[py*cw+px+1],tb=T[(py+1)*cw+px];
    if(((tr&&tr!==t0)||(tb&&tb!==t0))&&th(px*3+Math.round(x0),py*7+Math.round(y0))<.5){o=(py*cw+px)*4;D[o]=D[o]*.35+ic[0]*.65;D[o+1]=D[o+1]*.35+ic[1]*.65;D[o+2]=D[o+2]*.35+ic[2]*.65}}
  g.putImageData(img,0,0);
  /* ink-outlined pixel sprites, nearer (lower) things drawn last */
  var items=[];
  for(i=0;i<COLS*ROWS;i++){var t2=kind[i];if(!t2||t2==='settle')continue;var c2=i%COLS,r2=Math.floor(i/COLS),cx=w*(c2+.5+((r2&1)?.5:0)),cy=SH*1.5*r2+SH,rn=seeded(i*9973+7);
    if(t2==='orchard'){var oa2=ang[i],ca2=Math.cos(oa2),sa2=Math.sin(oa2);for(var gu=-6;gu<=6;gu++)for(var gv=-6;gv<=6;gv++){var ox3=cx+(gu*ca2-gv*sa2)*5,oy3=cy+(gu*sa2+gv*ca2)*5,lx2=Math.floor((ox3-x0)/TPX),ly2=Math.floor((oy3-y0)/TPX);if(lx2<0||ly2<0||lx2>=cw||ly2>=chh||T[ly2*cw+lx2]!=='orchard')continue;items.push({t:'orchard',x:lx2,y:ly2,s:rn(),v:rn()})}continue}
    var n=({woodland:18,swamp:8,field:5,pasture:4,pond:3,forest:24,pwood:14,pforest:22})[t2]||0;
    for(var q=0;q<n;q++){var aa=rn()*Math.PI*2,rr=Math.sqrt(rn())*SH*1.05,ix2=cx+Math.cos(aa)*rr,iy2=cy+Math.sin(aa)*rr,lx=Math.floor((ix2-x0)/TPX),ly=Math.floor((iy2-y0)/TPX);
      if(lx<0||ly<0||lx>=cw||ly>=chh||T[ly*cw+lx]!==t2)continue;items.push({t:t2,x:lx,y:ly,s:rn(),v:rn()})}}
  items.sort(function(a,b){return a.y-b.y});
  function dot(x,y,ww,hh,c){g.fillStyle=c;g.fillRect(x,y,ww,hh)}
  items.forEach(function(it){var x=it.x,y=it.y,xx,yy;
    if(it.t==='pwood'||it.t==='pforest'){var pf=TPAL.pforest[it.v<.5?1:2],hh=4+Math.round(it.s*2);for(yy=0;yy<hh;yy++){var wd2=Math.floor((yy+1)/2);g.fillStyle=TINK;g.fillRect(x-wd2-1,y-hh+yy,wd2*2+3,1);g.fillStyle=pf;g.fillRect(x-wd2,y-hh+yy,wd2*2+1,1)}dot(x,y,1,2,TINK);return}
    if(it.t==='woodland'||it.t==='forest'){var R=2+Math.round(it.s*2),f=TPAL.woodland[it.v<.5?1:2];g.fillStyle=TINK;for(yy=-R-1;yy<=R+1;yy++)for(xx=-R-1;xx<=R+1;xx++){var qq=xx*xx+yy*yy;if(qq<=(R+1)*(R+1)&&qq>R*R)g.fillRect(x+xx,y+yy-R,1,1)}
      g.fillStyle=f;for(yy=-R;yy<=R;yy++)for(xx=-R;xx<=R;xx++)if(xx*xx+yy*yy<=R*R)g.fillRect(x+xx,y+yy-R,1,1);dot(x-1,y-R-1,2,1,TPAL.woodland[3]);dot(x,y+1,1,2,TINK)}
    else if(it.t==='swamp'){dot(x,y-3,1,3,TINK);dot(x+2,y-2,1,2,TINK);dot(x-2,y-2,1,2,TINK);dot(x-3,y,7,1,TINK)}
    else if(it.t==='field'){dot(x,y,1,1,TINK);dot(x+2,y+1,1,1,TINK)}
    else if(it.t==='pasture'){dot(x-2,y-1,5,4,TINK);dot(x-1,y,3,2,'#f4efe0')}
    else if(it.t==='orchard'){var R2=2;g.fillStyle=TINK;for(yy=-R2-1;yy<=R2+1;yy++)for(xx=-R2-1;xx<=R2+1;xx++){var q2=xx*xx+yy*yy;if(q2<=(R2+1)*(R2+1)&&q2>R2*R2)g.fillRect(x+xx,y+yy-R2,1,1)}g.fillStyle=TPAL.woodland[it.v<.5?2:3];for(yy=-R2;yy<=R2;yy++)for(xx=-R2;xx<=R2;xx++)if(xx*xx+yy*yy<=R2*R2)g.fillRect(x+xx,y+yy-R2,1,1);dot(x-1,y-R2-1,1,1,it.s<.5?'#c8402c':'#e8b030');dot(x+1,y-R2+1,1,1,it.s<.5?'#c8402c':'#e8b030');dot(x,y+1,1,1,TINK)}
    else if(it.t==='pond'){if(it.v<.6){dot(x-1,y-1,4,3,TINK);dot(x,y,2,1,'#6e8a50')}else dot(x,y,3,1,TINK)}
  });
  /* the picture is kept as a data: URL (the artifact viewer blocks blob: images). The map markup only carries its key;
     fillTerrain() attaches the picture after each redraw, so redraws never re-parse megabytes of HTML */
  var url='';try{url=cv.toDataURL('image/png')}catch(x){url=''}
  var ks=Object.keys(TCACHE);if(ks.length>6)delete TCACHE[ks[0]];
  TCACHE[key]=url;return url?key:'';
}

function mapSvg(opts){
  opts=opts||{};
  var w=Math.sqrt(3)*SH,camps=pockets(),marks={},r,c,i,out='';
  var vis=opts.vis||null,x0=0,y0=0,W=w*(COLS+.5),H=SH*1.5*(ROWS-1)+2*SH,ringMine=[],M=S.match;
  if(opts.crop&&vis){
    var ax=1e9,ay=1e9,bx=-1e9,by=-1e9;
    for(r=0;r<ROWS;r++)for(c=0;c<COLS;c++)if(vis(c,r)){var q=center(c,r);ax=Math.min(ax,q[0]-w/2);bx=Math.max(bx,q[0]+w/2);ay=Math.min(ay,q[1]-SH);by=Math.max(by,q[1]+SH)}
    if(ax<1e9){x0=ax-4;y0=ay-4;W=bx-ax+8;H=by-ay+8}
  }
  var mko='',DS=opts.pz?deepSet(opts.pz):{};/* markers go on top of every tile, so a party walking between tiles is never hidden */
  camps.forEach(function(p){
    var at,txt,cls='camp';
    if(opts.noMarks)return;var L0=MOBL[p.type]||'B';
    if(p.roam){at=ix(p.pos[0],p.pos[1]);marks[at]={t:L0+'!',c:cls+' roam',n:p.n,key:p.key,type:p.type,b:p.m&&p.m.mobs[0],active:true,roam:true}}
    if(!marks[p.lair]){if(p.active&&!p.roam)marks[p.lair]={t:L0,c:cls,n:p.n,key:p.key,type:p.type,b:p.m&&p.m.mobs[0],active:true,roam:false};else marks[p.lair]={t:L0+(p.razed?'✓':'⌂'),c:cls+(p.razed?' done':' empty'),key:p.key,type:p.type,active:false}}
  });
  out+='<svg class="hexmap'+(opts.world?' world':'')+'" viewBox="'+x0.toFixed(0)+' '+y0.toFixed(0)+' '+W.toFixed(0)+' '+H.toFixed(0)+'"'+(opts.minw?' style="min-width:'+opts.minw+'px"':'')+' role="img" aria-label="Hex map">'+artDefs();
  var turl=terrainImage(vis,x0,y0,W,H);if(turl)out+='<image class="terr" data-tk="'+esc(turl)+'" x="'+x0.toFixed(1)+'" y="'+y0.toFixed(1)+'" width="'+W.toFixed(1)+'" height="'+H.toFixed(1)+'" preserveAspectRatio="none" pointer-events="none"/>';
  for(r=0;r<ROWS;r++)for(c=0;c<COLS;c++){
    if(vis&&!vis(c,r))continue;
    var p=center(c,r),pts=hexPts(c,r);
    var s=setAt(c,r),t=terrAt(c,r);
    var cls=(s||t)&&turl?'h-clear':s?'h-set':(t?'h-'+t:'h-empty');
    out+='<polygon class="hx '+cls+'" points="'+pts+'" data-act="hex" data-c="'+c+'" data-r="'+r+'"><title>'+lab(c,r)+' '+(s?SETT[s.type].n:t?TERR[t].n:'Empty')+'</title></polygon>';
    if(opts.mineRing&&M&&M.mine[ix(c,r)])ringMine.push(pts);
    if(t&&!s&&!turl)out+=sprite(t,p[0],p[1]);
    if(s){
      out+='<g class="setspr">'+sprite('set_'+s.type,p[0],p[1]-3)+'</g>';
      if(s.c===c&&s.r===r)out+='<text class="hl setlab" x="'+p[0].toFixed(1)+'" y="'+(p[1]+19).toFixed(1)+'">'+(s.name?esc(s.name.slice(0,10)):SETT[s.type].ab)+'</text>';
    }
    if(!t&&!s)out+='<text class="hl" x="'+p[0].toFixed(1)+'" y="'+(p[1]+10).toFixed(1)+'" style="fill:#5a4f3d;font-size:9px">'+lab(c,r)+'</text>';
    var mk0=DS[ix(c,r)]?null:marks[ix(c,r)];
    if(mk0&&mk0.active){
      mko+='<g class="mk'+(mk0.roam?' roam':'')+'" id="mk-'+mk0.key+'" data-c="'+c+'" data-r="'+r+'" pointer-events="none"><circle class="mkbg" cx="'+p[0].toFixed(1)+'" cy="'+(p[1]-12).toFixed(1)+'" r="15"/><g transform="translate('+(p[0]-12).toFixed(1)+' '+(p[1]-25).toFixed(1)+') scale(1.5)"><g class="bob">'+mobInner(mk0.type,mk0.b||{w:'spear'})+'</g></g>'+
        (mk0.roam?'<text class="camp roam" x="'+(p[0]+15).toFixed(1)+'" y="'+(p[1]-20).toFixed(1)+'" style="font-size:13px">!</text>':'')+
        (M&&mk0.n?'<text class="cnt" x="'+p[0].toFixed(1)+'" y="'+(p[1]+5).toFixed(1)+'">'+mk0.n+'</text>':'')+'</g>';
    }else if(mk0)mko+='<text class="'+mk0.c+'" x="'+p[0].toFixed(1)+'" y="'+(p[1]-6).toFixed(1)+'">'+mk0.t+'</text>';
  }
  out+=linesSvg()+supplyMarks()+(UI.tab==='realm'?waterMarks():'')+(opts.pz?deepSvg(opts.pz):'')+worksSvg()+(UI.tab==='realm'?drawPreviewSvg(UI.pz&&UI.pz.r?Math.min(3,Math.max(.25,UI.pz.r.s*6)):3):'')+mko;
  if(S.match&&(opts.world||opts.crop)&&!opts.noMarks)out+=unitMarkers();
  ringMine.forEach(function(pt){out+='<polygon class="mine-ring" points="'+pt+'"/>'});
  if(opts.pz)out+=battleMarks(opts.pz);
  if(opts.play)out+=playSvg(opts.play.R,opts.play.home,opts.pz);
  if(opts.sel){
    out+='<polygon class="sel-ring" points="'+hexPts(opts.sel[0],opts.sel[1])+'"/>';
  }
  if(opts.route&&opts.route.length>1){
    out+='<polyline class="route" points="'+opts.route.map(function(q){var pp=center(q[0],q[1]);return pp[0].toFixed(1)+','+pp[1].toFixed(1)}).join(' ')+'"/>';
  }
  out+='</svg>';
  return out;
}
var LEG_COL={pwood:'#4e6e56',pforest:'#365240',woodland:'var(--t-wood)',swamp:'var(--t-swamp)',pond:'var(--t-pond)',field:'var(--t-field)',cultivated:'var(--t-cult)',pasture:'var(--t-past)',orchard:'#8a9a4a',forest:'#2f4a2c',water:'#4a7c9e'};
function legend(){
  return '<div class="legend">'+Object.keys(TERR).map(function(k){return '<span><i style="background:'+LEG_COL[k]+'"></i>'+TERR[k].n+'</span>'}).join('')+'<span>Thin brown lines = height every 10 m · bold every 50 m</span>'+'<span><i style="background:#7a6446"></i>Settlement</span><span><i style="background:#c9bda0"></i>Gravel road</span><span><i style="background:#6fb4e8"></i>Stream</span><span>Goblin or brigand figure = camp · ✓ cleared'+(S.match?' · ! party on the move · number = mobs left':'')+'</span></div>';
}

