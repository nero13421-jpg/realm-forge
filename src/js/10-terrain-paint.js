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

function vPacks(){
  var hand=inHand().filter(function(c){return !isItem(c)}),fresh=UI.fresh.map(byId).filter(Boolean);
  var men=hand.filter(function(c){return c.key==='human'&&c.sex!=='f'&&fpass('hand',c)});
  var opts=setOpts(UI.sel);
  var nudge=(!S.tut&&!S.setl.length&&!S.units.length&&!S.match)?'<section class="panel tut"><h3>New to RealmForge?</h3><p class="note">A 25 to 45 minute tutorial walks you through building three hamlets and six fights.</p><div class="row"><button class="btn go" data-act="tutstart">'+(UI.tc?'Confirm: start the tutorial':'Start the tutorial')+'</button></div></section>':'';
  return nudge+'<section class="panel"><h2>Packs</h2><p class="note">Booster Packs hold 10 cards and Buff Packs 25. About one human in ten, and about one human in twenty of those is a woman. Weapons, gear, materials, crystals, gnosis and parchments go straight to your stockpile in the Resources tab, shared by your whole realm. Terrain and settlement cards wait in your hand until you place them in the Realm. Men wait here until you assign them to a settlement. Real packs will cost money. In this beta they are free.</p>'+
   '<div class="packs">'+Object.keys(PACKS).map(function(k){var n=packCount(k),P=PACKS[k];return '<div class="packc pk-'+k+'"><span class="label">'+(k==='starter'?'Starter':k==='booster'?'Booster · 10 cards':'Buff · 25 cards')+'</span><b>'+esc(P.n)+'</b><span class="note">'+esc(P.t)+'</span><div class="row"><button class="btn go" data-act="open" data-k="'+k+'"'+(n<1?' disabled':'')+'>Open ('+n+')</button>'+(k==='starter'?'':'<button class="btn sm" data-act="claim" data-k="'+k+'">Claim one (beta)</button>')+'</div></div>'}).join('')+'</div></section>'+
   (fresh.length?'<section class="panel"><h3>Just pulled'+(UI.opened?' from your '+esc(UI.opened):'')+'</h3><div class="tags">'+tagsHtml(fresh,{fresh:true})+'</div></section>':'')+
   '<section class="panel"><h3>Your hand · '+hand.length+' cards</h3>'+
   '<div class="row"><label class="label" for="asel">Assign men to</label><select id="asel" data-sel="1" style="width:auto;max-width:100%">'+opts+'</select><button class="btn" data-act="assignall"'+(men.length&&S.setl.length?'':' disabled')+'>Assign all men ('+men.length+')</button></div>'+msgHtml()+fbar('hand',FHAND,true)+sbar('hand')+
   '<div class="tags">'+(tagsHtml(srt('hand',hand.filter(function(c){return fpass('hand',c)})),{act:function(c){return c.key==='human'?'assign':''}})||'<p class="note">'+(hand.length?'Nothing of that type in your hand.':'Hand is empty. Open a pack.')+'</p>')+'</div></section>';
}

function statsHtml(h){
  var eq=gearOf(h),keys=eq.map(function(c){return c.key}),wt=0;eq.forEach(function(c){wt+=wtOf(c.key)});
  var X=stats(h,wt,eq),u=unitOf(h.id),st=h.at!==null?setById(h.at):null,ws=keys.filter(function(k){return WEAP[k]}),wp=weapPick(keys);
  var who=tbl(['',''],[['Tattoos',h.tat&&h.tat.length?h.tat.map(function(t){return esc(tatText(t))}).join('<br>'):'none'],['Load',wt+' lb of '+X.carry+' lb'+(X.wf<1?' · slowed to ×'+X.wf.toFixed(2):' · full speed')],['Sacrifice',esc(boonText(h))],['Stationed at',st?setName(st):'in your hand, not assigned'],['Unit',u?esc(u.name):'none']]);
  var sheet='',grp='';
  STATS.forEach(function(r){if(r[1]!==grp){grp=r[1];sheet+='<tr><th colspan="2">'+grp+'</th></tr>'}var bb=r[6]&&bo(h,r[6])?' <span class="dim">('+BOON[r[6]].n.toLowerCase()+')</span>':'';sheet+='<tr><td>'+r[2]+'</td><td class="mono">'+statVal(h,r[0],X)+bb+'</td></tr>'});
  sheet='<div class="tblwrap"><table class="sheet">'+sheet+'</table></div>';
  var arrowsFor=function(k){return eq.filter(function(c){return c.key===WEAP[k].ammo}).reduce(function(t,c){return t+(c.n===undefined?20:c.n)},0)};
  var weap=ws.length?tbl(['Weapon','Role','Damage','Attacks/min','Reach','Hit chance','Avg damage/min'],ws.map(function(k){var w=WEAP[k],sk=Math.floor(h.skill[k]*(w.rng?X.keen:1)),dmg=Math.round(w.dmg*X.str*10)/10,apm=Math.round(w.apm*X.strike*10)/10,dpm=apm*sk/100*dmg;return[nm(icoArt(k),CD[k].n),w.rng?'ranged · '+arrowsFor(k)+' '+CD[w.ammo].n.toLowerCase():(k===wp.p||(BOWS.indexOf(wp.p)>=0&&k===wp.s)?'melee':'melee backup'),dmg,apm,Math.round(w.reach*(w.rng?X.range:1))+' yd',sk+'%',dpm.toFixed(1)]})):'<p class="note">Unarmed. He cannot attack in melee or at range.</p>';
  var sk=tbl(['Weapon','Skill'],WLIST.map(function(k){return[CD[k].n,Math.floor(h.skill[k]||10)+' ('+Math.floor(h.skill[k]||10)+'% hit chance)']}));
  var sp=(h.spells&&h.spells.length)?tbl(['Spell','School','Cost','Effect','Recharge'],h.spells.map(function(k){return[nm(icoSpell(k),SPELL[k].n),MAGIC_SCHOOL,SPELL[k].t.split(' · ')[0],SPELL[k].t.split(' · ').slice(1).join(' · '),Math.max(1,Math.round(SPELL_CD[k]*X.cast))+' s']})):'<p class="note">No spells learned.</p>';
  return who+'<h3>Character sheet</h3>'+sheet+'<h3>Weapons</h3>'+weap+'<p class="note">A bow needs its own arrows: short arrows for the short bow, long arrows for the long bow. Average damage per minute assumes no armor or dodging. Melee attacks land when an enemy is within reach; the bow fires when he stands still with bows on.</p><h3>Skill</h3>'+sk+'<h3>Magic</h3>'+sp;
}
function equipBlock(h){
  var items=pool().filter(function(c){var k=kindOf(c);return k!=='mat'&&k!=='animal'&&k!=='altar'&&(c.eq===null||c.eq===h.id)});
  var mine=items.filter(function(c){return c.eq===h.id}),free=items.filter(function(c){return c.eq===null});
  var wt=0;mine.forEach(function(c){wt+=wtOf(c.key)});
  return '<p class="label">Carrying '+wt+' lb of 25 lb free · up to 2 weapons, any number of quivers of arrows (1 lb each), 1 armor, 1 helmet, 1 shield · 1 prestige per item equipped, and equipping is permanent: nothing comes off once it is on. A crystal, gnosis, spell parchment or tattoo is consumed when used. Each tattoo once per person. A parchment teaches its spell for 1 gnosis. A crystal adds its value to that man\'s mana for good, with no limit</p>'+
    fbar('equip')+sbar('equip')+'<div class="tags">'+tagsHtml(srt('equip',mine),{act:'equip',sel:true})+tagsHtml(srt('equip',free.filter(function(c){return fpass('equip',c)})),{act:'equip'})+'</div>'+
    '<p class="note">Skill grows from fighting. Drilling will come later with schools.</p>'+statsHtml(h);
}
function altarHtml(s){
  var civ=s.type!=='camp',cards=pool().filter(function(c){return c.key==='altar'}),hs=atSet(s.id).filter(function(c){return c.key==='human'});
  if(!s.altar){
    if(!civ)return '<div class="upanel"><h3>Altar</h3><p class="note">Altars go in civilian settlements only, hamlets and villages, never a military camp.</p></div>';
    var ac={};pool().forEach(function(c){if(kindOf(c)==='animal')ac[c.key]=(ac[c.key]||0)+1});
    return '<div class="upanel"><h3>Altar</h3><p class="note">'+(cards.length?'You hold '+cards.length+' altar card'+(cards.length>1?'s':'')+'. An altar is raised to one animal: it costs '+ALTAR_COST+' prestige and '+ALTAR_N+' of that animal, given at the raising, and after that it takes only that animal.':'No altar card in your stockpile. Altars come from packs, and they are rare.')+'</p>'+(cards.length?'<div class="row">'+Object.keys(BOON).map(function(k){var n=ac[k]||0;return '<button class="btn sm go" data-act="altar" data-s="'+s.id+'" data-k="'+k+'"'+(n<ALTAR_N||S.prestige<ALTAR_COST||S.match?' disabled':'')+'>'+esc(BOON[k].n)+' altar · '+n+'/'+ALTAR_N+' '+esc(BOON[k].n.toLowerCase())+'s</button>'}).join('')+'</div>':'')+'</div>';
  }
  var pr=s.altar.pr?byId(s.altar.pr):null;if(pr&&pr.at!==s.id){s.altar.pr=null;pr=null}
  var women=hs.filter(function(h){return h.sex==='f'});
  var AK=s.altar.k,o='<div class="upanel"><h3>'+(AK?esc(BOON[AK].n)+' altar':'Altar')+' · '+setName(s)+'</h3>'+svgWrap(rects(ART.altar,0,0),48);
  if(!pr){o+='<p class="note">An altar needs a priestess. Only a woman can become one'+(women.length?'.':', and no woman lives here. Assign one from your hand in Packs: a woman can only go to a settlement with an altar. Women are rare pulls.')+'</p>'+women.map(function(w){return '<button class="btn sm" data-act="priest" data-s="'+s.id+'" data-h="'+w.id+'">Make '+esc(hname(w))+' priestess</button>'}).join('');return o+'</div>'}
  o+='<p class="note">Priestess: <b>'+esc(hname(pr))+'</b> <button class="btn sm" data-act="unpriest" data-s="'+s.id+'">Release her</button></p>';
  var an=pool().filter(function(c){return kindOf(c)==='animal'&&(!AK||c.key===AK)}),cnt={};an.forEach(function(c){cnt[c.key]=(cnt[c.key]||0)+1});
  var who=S.cards.filter(function(c){return c.key==='human'&&c.at===s.id}),gear=pool().filter(blessable),T=byId(UI.sacT);if(T&&T.key!=='human'&&!blessable(T))T=null;if(!T||(T.key==='human'&&T.at!==s.id)){T=who.filter(function(h){return h.id!==s.altar.pr&&unitOf(h.id)})[0]||who.filter(function(h){return h.id!==s.altar.pr})[0]||who[0]||null;UI.sacT=T?T.id:null}
  var A=sacPick(T,cnt);
  var vics=who.filter(function(h){return h!==T&&h.id!==s.altar.pr}),V=byId(UI.sacV);if(!V||vics.indexOf(V)<0){V=vics.filter(function(h){return !isSoldier(h)})[0]||vics[0]||null;UI.sacV=V?V.id:null}
  if(!an.length)return o+'<p class="note">'+(AK?'No '+esc(BOON[AK].n.toLowerCase())+'s in your stockpile. This altar takes only '+esc(BOON[AK].n.toLowerCase())+'s.':'No animals in your stockpile. Animals come from packs.')+'</p></div>';
  o+='<p class="label">Sacrifice · costs '+SAC_COST+' prestige, the animal, one more person and the goods the altar asks</p><div class="row">'+Object.keys(cnt).map(function(k){return '<button class="btn sm tbtn'+(A===k?' on':'')+'" data-act="sacA" data-k="'+k+'">'+esc(BOON[k].n)+' ×'+cnt[k]+'</button>'}).join('')+'</div>'+
    (A?'<p class="note">'+esc(BOON[A].n)+': '+esc(BOON[A].a)+', +'+BOON[A].lo+' to '+BOON[A].hi+'% at random each time, and more of the same animal keep adding up, '+esc(BOON[A].t.replace(/\.$/,''))+'.</p>':'')+
    '<div class="field"><label class="label" for="sacT">Offered for</label><select id="sacT" data-sact="1"><optgroup label="People">'+who.map(function(h){return '<option value="'+h.id+'"'+(T&&T.id===h.id?' selected':'')+'>'+esc(hname(h))+' · '+esc(boonText(h))+'</option>'}).join('')+'</optgroup>'+(gear.length?'<optgroup label="Gear never worn">'+gear.map(function(c){return '<option value="'+c.id+'"'+(T&&T.id===c.id?' selected':'')+'>'+esc(cardName(c))+' RF-'+String(c.id).padStart(4,'0')+(c.boon?' · '+esc(resText(c)):'')+'</option>'}).join('')+'</optgroup>':'')+'</select></div>'+(T&&T.key!=='human'?'<p class="note">Blessed gear carries the boon to whoever wears it, and each offering deepens its resonance. Once it is worn it can take no more.</p>':'');
  var dem=A?sacDem(s,A):null,dsh=dem?matsShort(dem):[];
  o+='<div class="field"><label class="label" for="sacV">Given to the gods</label><select id="sacV" data-sacv="1">'+(vics.length?vics.map(function(h){return '<option value="'+h.id+'"'+(V&&V.id===h.id?' selected':'')+'>'+esc(hname(h))+(isSoldier(h)?' · soldier':'')+'</option>'}).join(''):'<option value="">No one else lives here</option>')+'</select></div>';
  o+=(dem?'<p class="note">With the '+BOON[A].n.toLowerCase()+' the altar asks for <b>'+esc(matsText(dem))+'</b>'+(dsh.length?'. Short on '+esc(dsh.join(', ')):'')+'.</p>':'')+(V?'':'<p class="msg bad">A sacrifice takes one more person living here, besides the one it is offered for and the priestess.</p>');
  var bad=T&&A&&T.boon&&T.boon.k!==A;
  o+=(bad?'<p class="msg bad">'+esc(T.key==='human'?hname(T):cardName(T))+' already carries the '+BOON[T.boon.k].n.toLowerCase()+'. One animal kind each.</p>':'')+'<button class="btn go" data-act="sacrifice" data-s="'+s.id+'"'+(!A||!T||!V||bad||dsh.length||S.prestige<SAC_COST||S.match?' disabled':'')+'>Sacrifice a '+(A?BOON[A].n.toLowerCase():'beast')+' (−'+SAC_COST+' prestige)</button>'+(S.match?'<p class="note">Sacrifices happen at home, between matches.</p>':'');
  return o+'</div>';
}
function vSettle(){
  if(!S.setl.length)return '<section class="panel"><h2>Settlements</h2><p class="note">No settlements yet. Place a settlement card in the Realm tab.</p></section>';
  var s=setById(UI.sel)||S.setl[0];UI.sel=s.id;
  var list=S.setl.map(function(x){return '<button class="btn'+(x.id===s.id?' on':'')+'" data-act="selset" data-id="'+x.id+'">'+setName(x)+'</button>'}).join('');
  var hs=atSet(s.id).filter(function(c){return c.key==='human'});
  if(!hs.some(function(h){return h.id===UI.hum}))UI.hum=hs.length?hs[0].id:null;
  var h=UI.hum?byId(UI.hum):null;
  return '<section class="panel"><h2>Settlements</h2><div class="row">'+list+'</div></section>'+
   '<div class="split"><section class="panel"><div class="field"><label class="label" for="snm">Settlement name</label><input type="text" id="snm" data-snm="'+s.id+'" value="'+esc(s.name||'')+'" maxlength="24" placeholder="'+esc(SETT[s.type].n+' '+lab(s.c,s.r))+'"></div><h3>'+setName(s)+(s.name?' <span class="dim mono">'+SETT[s.type].n+' '+lab(s.c,s.r)+'</span>':'')+(s.altar?' · altar':'')+' · '+hs.length+' humans · soldiers '+soldiersAt(s.id)+(SETT[s.type].def?' / '+SETT[s.type].def:'')+'</h3>'+
   '<div class="tags">'+(hs.map(function(x){return tagHtml(x,{act:'selhum',sel:x.id===UI.hum})}).join('')||'<p class="note">No humans here. Assign some from your hand.</p>')+'</div>'+
   '<p class="note">Gear comes from your shared stockpile. Pick a man to equip him. See everything you hold in the Resources tab.</p>'+altarHtml(s)+'</section>'+
   '<section class="panel">'+(h?'<div class="portrait">'+humanSvg(h,128)+'</div><h3>'+esc(hname(h))+'</h3><div class="field"><label class="label" for="nm">Name '+(h.sex==='f'?'this woman':'this man')+'</label><input type="text" id="nm" data-nm="'+h.id+'" value="'+esc(h.name)+'" maxlength="24" placeholder="'+esc(hname({num:h.num,sex:h.sex}))+'"></div>'+msgHtml()+equipBlock(h):'<p class="note">Select a human to name him and equip him.</p>')+'</section></div>';
}
function vRes(){
  var items=pool();
  if(!items.length)return '<section class="panel"><h2>Resources</h2><p class="note">Your stockpile is empty. Weapons, gear, materials, crystals, gnosis and parchments land here when you open packs.</p></section>';
  var shown=srt('res',items.filter(function(c){return fpass('res',c)})),free=shown.filter(function(c){return !c.eq});
  var by={},order=[];
  shown.forEach(function(c){var r=by[c.key];if(!r){r=by[c.key]={n:CD[c.key].n,k:KIND[kindOf(c)],t:0,e:0,a:0};order.push(c.key)}r.t++;if(c.eq)r.e++;if(AMMO_WT[c.key])r.a+=(c.n===undefined?20:c.n);if(TIMB[c.key])r.a+=(c.n==null?TIMB_N:c.n)});
  var rows=order.map(function(k){var r=by[k];return '<tr><td>'+esc(r.n)+'</td><td>'+r.k+'</td><td class="mono">'+r.t+(AMMO_WT[k]?' ('+r.a+' arrows)':TIMB[k]?' ('+r.a+' timbers)':'')+'</td><td class="mono">'+r.e+'</td><td class="mono">'+(r.t-r.e)+'</td></tr>'}).join('');
  return '<section class="panel"><h2>Resources</h2><p class="note">Your stockpile. It belongs to the whole realm, not to any one settlement. Men and units are the only things stationed at settlements. Equip men from here in the Settlements tab.</p>'+fbar('res')+sbar('res')+
    '<div class="tblwrap"><table><tr><th>Item</th><th>Kind</th><th>Total</th><th>Equipped</th><th>Free</th></tr>'+(rows||'<tr><td colspan="5" class="dim">Nothing of that type.</td></tr>')+'</table></div></section>'+
    '<section class="panel"><h3>Stockpile · '+free.length+' free cards in '+stackOf(free).length+' stacks</h3><p class="note">Equipped gear is left out of these counts. It shows on the man carrying it.</p><div class="tags">'+(tagsHtml(free)||'<p class="note">Everything of that type is equipped.</p>')+'</div></section>';
}
function realmPop(){var l=UI.look;if(!l||UI.place||UI.draw||!placedAt(l[0],l[1]))return '';var F=lookField(l[0],l[1]);return tilePopHtml(l[0],l[1],'<p class="note">'+esc(elevText(hgtAt(ix(l[0],l[1]))))+'. '+esc(F.n)+' ground. Zoom in to see it the way a fight would.</p><div class="row">'+(deepSet('r')[ix(l[0],l[1])]?'':'<button class="btn sm go" data-act="pzgo" data-k="r" data-c="'+l[0]+'" data-r="'+l[1]+'">Zoom in here</button>')+'</div>')}
function vRealm(){
  var cap=capacity(),need=needed(),pct=Math.min(100,need?cap/need*100:100);
  var tb=Object.keys(TERR).map(function(k){var n=countHand('t_'+k);return '<button class="btn sm'+(UI.place&&UI.place.t==='t'&&UI.place.k===k?' on':'')+'" data-act="plc" data-t="t" data-k="'+k+'"'+(n?'':' disabled')+'>'+TERR[k].n+' ×'+n+' · '+TERR[k].cost+'</button>'}).join('');
  var nset=countHand('setcard');
  var sb=Object.keys(SETT).map(function(k){var d=SETT[k];return '<button class="btn sm'+(UI.place&&UI.place.t==='s'&&UI.place.k===k?' on':'')+'" data-act="plc" data-t="s" data-k="'+k+'"'+(nset>=d.cards?'':' disabled')+'>'+d.n+' · '+d.cards+' card'+(d.cards>1?'s':'')+' · '+d.cost+(d.mats?' + '+matsText(d.mats):'')+(k==='camp'?' · needs '+CAMP_WILD+' connected wild tiles ('+wildCount()+')':'')+'</button>'}).join('');
  return '<div class="split"><section class="panel"><h2>Realm</h2>'+mapView(mapSvg({sel:UI.place&&UI.place.first,pz:'r'}),'r',realmPop())+legend()+'<p class="note">Drag to move around, scroll or pinch to zoom. Tap a settlement to see who lives there. Every placement is permanent and its prestige is sunk. Terrain is never destroyed.</p></section>'+
   '<section class="panel"><p class="note">Tap a placed tile, with nothing picked to place, to zoom in on its ground right there on the map.</p><h3>Place</h3><p class="label">Terrain in hand</p><div class="row">'+tb+'</div><p class="label">Settlements · '+nset+' settlement card'+(nset===1?'':'s')+' in hand</p><div class="row">'+sb+'</div>'+
   '<p class="label">Elevation in hand</p><div class="row">'+Object.keys(ELEV).map(function(e){return EKIND.map(function(k){var key=e+'_'+k,n=countHand('e_'+key);return n?'<button class="btn sm'+(UI.place&&UI.place.t==='e'&&UI.place.k===key?' on':'')+'" data-act="plc" data-t="e" data-k="'+key+'">'+CD['e_'+key].n+' ×'+n+' · '+(TERR[k].cost+ELEV[e].cost)+'</button>':''}).join('')}).join('')+'</div>'+
   (UI.place&&UI.place.t==='e'&&ELEV[UI.place.k.split('_')[0]].sh==='slope'?'<div class="row"><span class="label">Uphill toward the</span>'+HDIR.map(function(dn,di){return '<button class="btn sm'+((UI.rot||0)===di?' on':'')+'" data-act="rot" data-d="'+di+'">'+['→ E','↗ NE','↖ NW','← W','↙ SW','↘ SE'][di]+'</button>'}).join('')+'</div><p class="note">Turn the card before you place it. The slope rises '+ELEV[UI.place.k.split('_')[0]].rise+' m across the tile toward that side. Tiles placed past its high edge start up there; a level tile on the far side of a crest gets a bank down to it.</p>':'')+
   fortPanel()+
   '<p class="label">Roads, streams and creeks · road '+lineCostText('road')+' · stream '+lineCostText('stream')+'</p>'+waterPanel()+'<div class="row"><button class="btn sm'+(UI.draw&&UI.draw.type==='road'?' on':'')+'" data-act="draw" data-k="road">Gravel road</button><button class="btn sm'+(UI.draw&&UI.draw.type==='stream'?' on':'')+'" data-act="draw" data-k="stream">Stream</button><button class="btn sm'+(UI.draw&&UI.draw.type==='creek'?' on':'')+'" data-act="draw" data-k="creek">Creek · '+lineCostText('creek')+'</button><button class="btn sm'+(UI.place&&UI.place.k==='bridge'?' on':'')+'" data-act="plc" data-t="b" data-k="bridge">Footbridge (stream) · '+workText({cost:BRIDGE_COST,mats:BRIDGE_MATS,lab:1})+'</button><button class="btn sm'+(UI.place&&UI.place.k==='mbridge'?' on':'')+'" data-act="plc" data-t="b" data-k="mbridge">Medium footbridge (creek) · '+workText(MBR)+'</button></div>'+roadNames()+(UI.draw&&!UI.draw.fk?drawPanel():'')+msgHtml()+
   supplyPanel()+'<p class="label">Sustainment · '+Math.floor(cap)+' people fed, '+need+' needed</p><div class="bar'+(need>cap?' over':'')+'"><i style="width:'+pct+'%"></i></div>'+
   '<p class="note">Your terrain feeds people. Settlements need them. You cannot place a settlement that your terrain cannot feed. Hamlet 150, camp 100 and village 450 are placeholders.</p>'+
   '</section></div>';
}

function render(){
  cleanUnits();
  head();
  if(S.match&&UI.tab==='realm')UI.tab='match';
  var v={info:vInfo,packs:vPacks,settle:vSettle,units:vUnits,res:vRes,realm:vRealm,match:vMatch,patrol:vPatrols}[UI.tab];
  $('#view').innerHTML=tutPanel()+(UI.pb&&UI.tab==='match'?pbPanel():'')+v()+foot()+lootPopHtml()+campPopHtml()+bpModal();
  pbStart();LIVE_CACHE={};UI._bsig=bsig();pzInit();if(UI.rp&&UI.tab==='match'){rpStart();rpDraw()}
}
/* the spoils, shown once after a win */
function lootPopHtml(){var L=UI.lootPop;if(!L)return '';var ks=Object.keys(L.lc);
  return '<div class="lootbg" role="dialog" aria-modal="true" aria-labelledby="loott"><div class="lootcard"><p class="label">Victory · '+L.t+' · '+L.mobs+' mobs slain · '+L.camps+' camp'+(L.camps===1?'':'s')+' burned</p><h2 id="loott">Spoils of the match</h2>'+
    '<div class="lootpr"><span class="label">Prestige</span><b>+'+L.p+'</b></div>'+
    (ks.length?'<div class="lootgrid">'+ks.map(function(k){return '<div class="lootit">'+icoArt(k)+'<span>'+esc(CD[k].n)+'</span><b>×'+L.lc[k]+'</b></div>'}).join('')+'</div><p class="note">Everything above is in your stockpile now, in Resources.</p>':'<p class="note">No goods this time, only prestige.</p>')+
    '<div class="row"><button class="btn go" data-act="lootok">Collect</button></div></div></div>'}
function foot(){
  return '<section class="panel"><div class="row"><button class="btn sm" data-act="save">Save</button>'+(S.tut||S.match?'':'<button class="btn sm'+(UI.tc?' on':'')+'" data-act="tutstart">'+(UI.tc?'Confirm: start the tutorial (your realm is set aside)':'Tutorial')+'</button>')+'<button class="btn sm'+(UI.rc?' on':'')+'" data-act="restart">'+(UI.rc?'Confirm: delete this realm':'Restart realm')+'</button>'+(UI.rc?'<button class="btn sm" data-act="norestart">Cancel</button>':'')+'</div><p class="note">'+(UI.saved?esc(UI.saved)+' ':'')+'The game also saves itself after every action. Restart deletes your realm, hand, humans and any running match, and starts a fresh beta.</p></section>';
}
function say(m,bad){UI.msg=m;UI.bad=!!bad}

