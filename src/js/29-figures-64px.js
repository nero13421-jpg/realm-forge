/* ---------- animation art ---------- */
function weapPick(eq){eq=(eq||[]).map(wkey);var ws=MELEE.concat(BOWS).filter(function(k){return eq.indexOf(k)>=0});return{p:ws[0]||null,s:ws[1]||null}}

/* ---------- 64 x 64 figures, 7 heads tall, side-on ----------
   Each figure is built from parts on a 64-pixel grid, then shaded (light from the upper left, three tones), given dark
   lines where parts meet and a warm dark-brown outline. Every person has a look of his own (skin, hair, beard, dyes,
   beads, tattoos) and seven frames: two walk frames, two attack frames, a casting pose, a guard pose and a fallen body. */
var A64={},A64N=64,A64OUT=[43,20,16];
var A64PAL={skin:'#eeb48e',skinB:'#c98f6c',hair:'#6b4426',beard:'#6b4426',brow:'#4a2a1a',eyew:'#f4ecdc',pupil:'#2a1610',tunic:'#8a5a3c',btunic:'#5e5040',robe:'#e8dcc4',fur:'#f4ecdc',belt:'#5a3424',accent:'#e0782c',accent2:'#3aa0c8',scarf:'#c8382c',
  leg:'#d49a74',legB:'#a8765a',wrap:'#7a4a30',boot:'#7a4e34',bootB:'#5e3a26',armB:'#9a6448',wood:'#a06a3c',stone:'#b8bcc2',cord:'#d8c8a8',string:'#f0e6cc',quiver:'#6a4026',fletch:'#f0e6cc',
  vest:'#5e3a22',lace:'#e8d4a8',helm:'#7a5634',shield:'#a8804a',shieldR:'#5e3a22',hood:'#4e4a3c',mask:'#3a362e',cloak:'#3e4232',gskin:'#93bf52',gskinB:'#6f9a3a',giris:'#f0c030',mouth:'#5a1a10',tooth:'#fff8e0',rag:'#7a6a44',antler:'#c89a64',
  pskin:'#d8968a',pskinB:'#b07464',snout:'#eab0a2',nostril:'#5a2a22',tusk:'#f4ecd8',bristle:'#6a4234',fskin:'#7a9a46',fskinB:'#5a7a34',fbelly:'#d8d090',fspot:'#4a6428',web:'#9ab85a',
  tat:'#2c5a6e',glow:'#bfeaff',glow2:'#6fc8ff',blood:'#7a1a14',arrow:'#c8b088'};
var A64DET={eyew:1,pupil:1,brow:1,lace:1,tooth:1,mouth:1,giris:1,tat:1,glow:1,glow2:1,nostril:1,tusk:1,fspot:1};
var LK_FROG=[['#7a9a46','#5a7a34','#4a6428'],['#6a8a3e','#4e6a2c','#3a5220'],['#8a9a4e','#6a7a36','#5a6a28'],['#5e8a52','#44683a','#34542c'],['#9aa058','#78803e','#5e6630']],LK_PIG=[['#d8968a','#b07464'],['#c48678','#9c6454'],['#b8806a','#8e5e4a'],['#e0a898','#b8806e'],['#a87a62','#80583e']];
var LK_SKIN=['#f4c8a4','#eeb48e','#e0a47e','#c98a62','#a8704c','#82543a'],LK_HAIR=['#2a1a10','#3e2616','#5a3820','#7a4c2a','#a06a36','#c9a26c','#8e3a1e','#8a8680'],
    LK_DYE=['#8a5a3c','#7a6a44','#6e4a3a','#9a7448','#5e5a48','#8a4a34','#6a5a50','#7e5a2e'],LK_BEAD=[['#c8382c','#3aa0c8'],['#e0782c','#2e8a6a'],['#d8b040','#a03a5a'],['#3aa0c8','#e0782c'],['#e8e0d0','#c8382c'],['#7a3a8a','#d8b040']],
    LK_HOOD=['#4e4a3c','#3e3a30','#5a4a3a','#3a4238','#4a3a34'],LK_GOB=[['#93bf52','#6f9a3a'],['#7fae48','#5e8a30'],['#a6b85a','#7e9040'],['#6fa060','#4e7a44'],['#9aa84e','#73803a']];
function lookOf(who,seed,tt){var r=seeded((seed|0)*2654435761+(who==='gob'?7:who==='brig'?13:3)),pk=function(a){return a[Math.floor(r()*a.length)]};
  var L={sk:pk(LK_SKIN),hr:pk(LK_HAIR),dye:pk(LK_DYE),bead:pk(LK_BEAD),hs:pk(['short','short','long','shaved','topknot','braid']),bd:pk(['full','full','short','none','mustache','long']),tt:tt||0,hood:pk(LK_HOOD),mask:r()<.65,gob:pk(LK_GOB),gs:.9+r()*.2,ear:.8+r()*.5,robe:pk(['#e8dcc4','#d8c8a4','#c8a87a','#e0d0b8']),head:pk(['antler','antler','feather','band']),hg:r()<.25};
  L.frog=pk(LK_FROG);L.pig=pk(LK_PIG);L.tusk=r()<.7;
  if(L.hr==='#8a8680'&&r()<.6)L.hr=pk(LK_HAIR.slice(0,6));return L}
function a64parts(who,eq,pose,L){var P=[],add=function(id,fn){P.push([id,fn])};add.P=P;var kd=function(k){return CD[k]?CD[k].k:''},has=function(k){if(k==='hide_armor')return eq.some(function(x){return kd(x)==='armor'});if(k==='hide_helmet')return eq.some(function(x){return kd(x)==='helmet'});if(k==='hide_shield')return eq.some(function(x){return kd(x)==='shield'});return eq.map(wkey).indexOf(k)>=0};
  var poly=function(pts){return function(g){g.beginPath();pts.forEach(function(p,i){i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.closePath();g.fill()}},
      el=function(x,y,rx,ry){return function(g){g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill()}},
      rc=function(x,y,w,h){return function(g){g.fillRect(x,y,w,h)}},
      ln=function(pts,w){return function(g){g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach(function(p,i){i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.stroke()}},
      arc=function(x,y,r,a0,a1,w){return function(g){g.lineWidth=w;g.beginPath();g.arc(x,y,r,a0,a1);g.stroke()}},
      qd=function(pts,w){return function(g){g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(pts[0][0],pts[0][1]);g.quadraticCurveTo(pts[1][0],pts[1][1],pts[2][0],pts[2][1]);g.stroke()}};
  if(who==='frog')return frogParts(eq,pose,L,add,poly,el,rc,ln,arc);
  var pig=who==='pig',PMB=[1.16,.58,-4.8,25.6],PMH=[1.62,1.6,-18.6,11.3],PM=PMB;/* the pigger is drawn chibi: a squat body under a huge head */
  if(pig){var add0=add;add=function(id,fn){var m=PM;add0(id,function(g){g.save();g.transform(m[0],0,0,m[1],m[2],m[3]);fn(g);g.restore()})}}
  var gob=who==='gob',fem=who==='woman',brig=who==='brig',W=weapPick(eq),wp=W.p,ws=W.s,bow=wp==='shortbow'||wp==='longbow',ammo=has('short_arrows')||has('long_arrows')||(brig&&bow),grv=eq.indexOf('leather_greaves')>=0,oakSh=eq.indexOf('oak_shield')>=0,oakH=eq.indexOf('oak_helmet')>=0,lthH=eq.indexOf('leather_helmet')>=0;
  var atk=pose==='a1'||pose==='a2',fr=pose==='w1'?1:0,cast=pose==='cast',guard=pose==='guard';
  if(brig)add('cloak',poly([[25.5,16],[29,15.5],[27.5,41],[21.5,42]]));
  if(!fem&&!gob&&!pig&&(L.hs==='long'||L.hs==='braid'))add('hair',L.hs==='braid'?ln([[27,10],[25.4,18],[26,25]],2):poly([[25.4,8],[28.6,8],[28.4,18],[25,17]]));
  if(ws){if(BOWS.indexOf(ws)>=0)add('wood',arc(27,22,12,-1.9,-.25,1.4));else{add('wood',ln([[22,34],[31,6]],1.6));if(ws!=='club')add('stone',poly([[29.6,8],[31.6,3],[32.4,8.6]]))}}
  if(ammo&&!fem){add('quiver',poly([[23.5,15],[26.8,14],[28.5,28],[25.4,28.6]]));add('fletch',poly([[23,11],[26.4,10.4],[27,14.4],[23.6,15]]))}
  /* legs */
  var hipY=gob?44:35,knY=gob?52:47,anY=59.5,Lg,Bk;
  if(fr){Lg=[[31,hipY],[31.6,knY],[31.4,anY]];Bk=[[29,hipY],[29.4,knY],[28.2,anY]]}
  else if(atk&&(wp==='spear'||wp==='knife'||(gob&&pose==='a2'))){Lg=[[31,hipY],[35,knY-1],[37,anY]];Bk=[[29,hipY],[26,knY],[23.4,anY]]}
  else if(guard){Lg=[[31,hipY],[33.6,knY],[34,anY]];Bk=[[29,hipY],[27.4,knY],[26,anY]]}
  else{Lg=[[31,hipY],[33.4,knY],[34.4,anY]];Bk=[[29,hipY],[27,knY],[25.4,anY]]}
  if(pig){add('pskinB',ln(Bk,4));add('nostril',el(Bk[2][0]+1,61,2.4,1.5));add('pskin',ln(Lg,4.2));add('nostril',el(Lg[2][0]+1,61,2.4,1.6))}
  else if(!fem){add(gob?'gskinB':'legB',ln(Bk,gob?3:3.4));add('bootB',el(Bk[2][0]+1.2,61,3,1.7));add(gob?'gskin':'leg',ln(Lg,gob?3:3.6));add('boot',el(Lg[2][0]+1.2,61,3,1.8));
    if(!gob){[Bk,Lg].forEach(function(q){var a=q[1],b=q[2];if(grv)add(q===Bk?'greaveB':'greave',ln([[a[0]+(b[0]-a[0])*.1,a[1]+(b[1]-a[1])*.1],[a[0]+(b[0]-a[0])*.82,a[1]+(b[1]-a[1])*.82]],3.9));else for(var t=.15;t<.9;t+=.22)add('wrap',rc(a[0]+(b[0]-a[0])*t-1.6,a[1]+(b[1]-a[1])*t,3.4,1))});add('fur',rc(Bk[2][0]-2,57,4,1.6));add('fur',rc(Lg[2][0]-2,57,4,1.6))}}
  else{add('bootB',el(27.5,61,3,1.7));add('boot',el(32.5,61,3,1.8))}
  /* far arm: it draws the string on a bow, lifts in a cast, else hangs */
  var farA=gob?'gskinB':pig?'pskinB':fem?'robe':'armB',farH=gob?'gskinB':pig?'pskinB':'skinB',FA;
  if(bow&&pose==='a1')FA=[[28.5,18],[27,17],[29.6,13.6]];else if(cast)FA=[[28.5,18],[31,14],[34,11]];else if(gob)FA=[[28,33],[26.5,39],[28.5,44]];else FA=[[28.5,18],[27.4,25],[28.8,30.5]];
  if(gob&&atk)FA=[[28,33],[31,31],[35,29]];
  add(farA,ln(FA,gob?2.6:2.8));add(farH,el(FA[2][0],FA[2][1]+.8,1.4,1.4));
  /* body */
  if(fem){add('robe',poly([[27,16.5],[32,16],[34,19],[33,28],[36.5,59.5],[23.5,59.5],[26,28],[26,18]]));add('fur',rc(23.5,57.5,13,2));add('belt',rc(26,27,7.4,1.6));add('accent',rc(31,27,2,1.6));add('accent2',rc(27.4,17.6,5.4,1));add('scarf',rc(27.6,18.6,4.6,1))}
  else if(gob){add('rag',poly([[26,31],[33,30.5],[35.5,34],[34.4,44.5],[25,44.5],[24.4,36]]));add('belt',rc(25,40,10,1.6))}
  else if(pig){add('pskin',poly([[26.4,16],[32.6,15.6],[35.4,19],[35,28],[34.4,31],[25.4,31],[25.6,22]]));add('pskin',el(33.6,27.6,8,7.4));add('snout',el(36.4,28.4,4.6,5.6));add('pskinB',rc(39,27.4,1.2,1.2));add('pskinB',poly([[26.4,16],[28.6,16],[27.6,30],[25.4,30],[25.6,22]]));PM=[1,1,0,0];add('snout',function(g){g.lineWidth=1.3;g.lineCap='round';g.beginPath();g.moveTo(24.4,43.6);g.quadraticCurveTo(20.6,44,20.4,41.2);g.arc(22.2,41,1.8,Math.PI,Math.PI*2.75);g.stroke()});PM=PMB;add('rag',poly([[25,29.6],[34.8,29.6],[35.6,37],[24.4,37]]));add('belt',rc(25,29,10.4,1.8));add('bristle',rc(27,17,5,.8));add('tusk',rc(31,30,1.2,1.4))}
  else{add(brig?'btunic':'tunic',poly([[27,16.5],[32,16],[34.5,19],[33.5,28],[35.5,36.5],[25,36.5],[26,28],[26,18]]));add('fur',rc(25,35,10.6,2));add('belt',rc(26,27,8,1.8));add('accent',rc(32,27,1.6,1.8));
    add('scarf',rc(27,16.4,6,1.4));add('accent2',rc(27.4,17.8,5,1));
    if(has('hide_armor')){add('vest',poly([[26.6,18.6],[33.2,18.4],[34.6,20.4],[33.6,27],[26.2,27]]));[20,22,24].forEach(function(y){add('lace',rc(32.6,y,1,1))})}}
  /* head */
  if(gob){var e=L.ear;add('gskin',poly([[27.6,23],[27.6-12.6*e,23-6.5*e],[27,28]]));add('gskin',el(31,25.5,5.4,5.4));add('gskin',poly([[35,24.4],[39.5,27],[35.4,28.4]]));add('gskinB',el(30,21.6,3.6,1.3));
    add('giris',rc(33,23.5,2,2));add('pupil',rc(34,24,1,1));add('mouth',rc(32.5,29,4,atk?2:1));add('tooth',rc(33,29,1,1));add('tooth',rc(35,29,1,1))}
  else if(pig){PM=PMH;add('pskin',rc(28.6,12,3.6,4.6));add('pskinB',poly([[27.2,4.6],[25.6,-.2],[30.4,2.8]]));add('snout',poly([[28.2,4.2],[27,1.4],[29.6,3.2]]));add('pskin',el(31,8.8,5.6,5.4));add('pskinB',el(28.4,10.6,2.4,2.8));add('pskin',el(33.6,11.2,2.6,2.2));
    add('pskin',poly([[33.6,7.4],[37.6,8],[38,13],[33.6,13.6]]));add('pskin',el(37.8,10.4,1.4,2.7));add('nostril',rc(38.4,9.2,.7,.8));add('nostril',rc(38.4,11.2,.7,.8));
    add('bristle',ln([[26.4,5.6],[25.8,10.4],[26.8,15]],1.2));
    add('eyew',rc(32,6.6,1.4,1.4));add('pupil',rc(32.8,6.8,.8,1.1));add('brow',rc(31.6,5.6,2.4,.8));add('mouth',rc(32.6,12.8,3,atk?1.4:.6));
    add('tusk',poly([[33,13.2],[33.6,9.6],[34.6,13.4]]));add('tusk',poly([[34.4,13],[35.2,10.6],[35.8,13]]));PM=PMB}
  else{add('skin',rc(29,13.6,3,3.4));
    if(fem)add('hair',poly([[25.6,8],[28,4.6],[31,4.2],[29,9],[29.4,24],[25.4,24]]));
    if(L.hs!=='shaved'||fem)add('hair',el(29.5,9,4.4,4.6));else add('skinB',el(29.5,9,4.2,4.4));
    add('skin',el(31,10.6,3.3,3.9));
    if(L.hs!=='shaved'||fem)add('hair',poly([[25.6,8.4],[27.8,4.8],[31.6,4.2],[34.6,6.4],[34.6,7.8],[31.2,7.2],[29,8.6],[28.6,11.6],[26,11.4]]));
    if(L.hs==='topknot'&&!fem)add('hair',el(29,3.4,1.8,1.6));
    add('skin',rc(34,9.6,1.2,1.6));add('skin',el(29.3,10.6,.9,1.3));
    add('eyew',rc(31.6,9,1,1));add('pupil',rc(32.6,9,1,1));add('brow',rc(31.4,8,2.2,.9));
    if(!fem&&!(brig&&L.mask)){if(L.bd==='full')add('beard',poly([[30,12.4],[34.8,12],[34.2,14.8],[31,15.2]]));else if(L.bd==='long')add('beard',poly([[30,12.4],[34.8,12],[34,17.6],[31.4,18]]));else if(L.bd==='short')add('beard',poly([[30.6,13.4],[34.6,13],[34,14.8],[31.2,15]]));else if(L.bd==='mustache')add('beard',rc(32.4,12.2,2.6,.9));if(atk||cast)add('mouth',rc(33.4,13.2,1.4,1))}
    if(brig){add('hood',poly([[25,15.4],[25.4,7],[28,3.4],[32,3.2],[35.2,5.8],[35.6,8.4],[34,8],[31,6.8],[28.4,8],[28.2,14.4]]));if(L.mask)add('mask',poly([[30.4,11.6],[35.2,11.2],[34.8,14.6],[30.6,14.8]]))}
    if(has('hide_helmet')){add('helm',el(30,6.8,4.6,3.2));add('helm',rc(25.4,8.4,10,1.4));if(lthH)add('helm',poly([[26,8.6],[28.4,8.6],[28,13.4],[26.4,13]]));if(oakH){add('lace',rc(27,6,6,.8));add('lace',rc(29.6,3.8,.8,4.4))}}
    if(fem){if(L.head==='antler'){add('antler',ln([[29,5],[26.4,.6]],1.1));add('antler',ln([[27.6,2.6],[24.4,2.4]],.9));add('antler',ln([[31,5],[34,.6]],1.1));add('antler',ln([[32.8,2.6],[35.8,2.2]],.9))}else if(L.head==='feather'){add('fletch',poly([[27,5],[25,-.4],[28.4,4.6]]));add('accent',poly([[28.6,4.6],[29,.2],[30,4.6]]))}add('accent',rc(28,5.4,4,1))}
    if(L.tt&&!fem){add('tat',rc(33,10.8,1,2));if(L.tt>1)add('tat',rc(31.8,13,1,1))}}
  /* near arm and weapon, by pose */
  var sk=gob?'gskin':pig?'pskin':'skin',ar=gob?'gskin':pig?'pskin':fem?'robe':brig?'btunic':'tunic',S0=gob?[31,32]:[30.6,18];
  var hand=function(pts){add(ar,ln(pts,gob?2.6:2.8));var h=pts[pts.length-1];add(sk,el(h[0],h[1],1.5,1.5));if(L.tt&&!gob&&!fem)add('tat',rc((pts[0][0]+pts[1][0])/2,(pts[0][1]+pts[1][1])/2,1,1.4));return h};
  var stone=function(pts){add('stone',poly(pts))};
  if(cast){hand([S0,[34,14],[38,10]]);add('glow2',el(39.2,9.4,2.6,2.6));add('glow',el(39.2,9.4,1.3,1.3));add('glow2',el(35,10.4,1.6,1.6));if(wp==='spear')add('wood',ln([[29,60],[33,6]],1.5));if(wp==='rod_wood'||wp==='rod_cu'){add('wood',ln([[36.4,13],[41.4,1.6]],1.4));if(wp==='rod_cu')add('stone',el(41.6,1.4,1.7,1.7))}}
  else if(fem)hand([S0,[31,25],[32.4,30.4]]);
  else if(wp==='rod_wood'||wp==='rod_cu'){var hr=pose==='a2'?hand([S0,[35,20],[39.6,19]]):hand([S0,[33,24],[36,26]]);var rt=pose==='a2'?[[34,30],[48,8]]:[[35,40],[38.4,6]];add('wood',ln(rt,1.4));if(wp==='rod_cu'){add('stone',el(rt[1][0],rt[1][1]-.4,1.9,1.9));add('stone',rc(hr[0]-.8,hr[1]-3.6,1.8,1.2))}else add('wood',el(rt[1][0],rt[1][1]-.4,1.6,2))}
  else if(wp==='spear'){if(pose==='a1'){hand([S0,[30,24],[33,25]]);add('wood',ln([[20,25.6],[48,23.4]],1.5));stone([[47,21.6],[52.6,23],[47,25]]);add('cord',rc(45.4,22.4,1.4,2.2))}
    else if(pose==='a2'){hand([S0,[35,21],[40,22]]);add('wood',ln([[27,23.4],[58,21.4]],1.5));stone([[57,19.6],[62.6,21],[57,23]]);add('cord',rc(55.4,20.4,1.4,2.2))}
    else if(pig){hand([S0,[33,24],[37,27]]);add('wood',ln([[24,50],[50,28]],1.8));stone([[48.6,26.4],[54.6,24.4],[50.8,30]]);add('cord',rc(47.6,27.6,2.4,1.4))}
    else{hand([S0,[33,24],[37,26]]);add('wood',ln([[33.4,60],[41.4,2.4]],1.5));stone([[39.6,6],[41.8,-.2],[43,6.4]]);add('cord',rc(39.8,6,3,1.2))}}
  else if(bow){var lb=wp==='longbow',R=lb?15:10,cx=lb?31:34,bx0=cx+(pose==='a1'?2:0);hand([S0,[34.4,20],[38.2,21]]);
    if(pose==='a1'){add('wood',arc(bx0,21,R,-1.05,1.05,1.5));var ex=bx0+R*Math.cos(1.05),ey=R*Math.sin(1.05);add('string',ln([[ex,21-ey],[29.8,14],[ex,21+ey]],.7));add('arrow',ln([[29.8,14.4],[40.6,20.4]],.9));stone([[40,19.4],[43,21.2],[40,21.6]])}
    else{add('wood',arc(cx,21,R,-1.2,1.2,1.5));var sx=cx+R*Math.cos(1.2),sy=R*Math.sin(1.2);add('string',ln([[sx,21-sy],[sx,21+sy]],.7))}}
  else if(wp==='club'||wp==='axe'||wp==='battle_axe'||gob){var big=wp==='battle_axe',hd;
    if(pose==='a1'){hd=hand(gob?[S0,[31,26],[30,21]]:[S0,[30,12],[28.6,7]]);var tx=hd[0]-(big?9:6),ty=hd[1]-(big?6:4);add('wood',ln([[hd[0]+1,hd[1]+1],[tx,ty]],big?1.8:wp==='club'||gob?2.2:1.6));if(wp==='club'||gob)add('wood',el(tx-.6,ty-.6,2.3,2.8));else stone([[tx-3,ty-4],[tx+2,ty-4.6],[tx+2,ty+.4],[tx-2,ty+1]])}
    else if(pose==='a2'){hd=hand(gob?[S0,[35,33],[38,34]]:[S0,[35,21],[39,25]]);var ux=hd[0]+(big?11:8),uy=hd[1]+(big?6:5);add('wood',ln([[hd[0]-1,hd[1]-1],[ux,uy]],big?1.8:wp==='club'||gob?2.2:1.6));if(wp==='club'||gob)add('wood',el(ux+.8,uy+.6,2.3,2.8));else stone([[ux-1,uy-1],[ux+4.6,uy+2],[ux+2,uy+6],[ux-2.6,uy+3]])}
    else if(gob&&!wp)hand([S0,[33,37],[34,42]]);
    else if(wp==='club'||gob){var hc=hand(gob?[S0,[34,36],[36.4,38]]:[S0,[33,23.4],[36,25]]);add('wood',ln([[hc[0],hc[1]+1],[hc[0]+6,hc[1]-12]],2.2));add('wood',el(hc[0]+6.6,hc[1]-13.4,2.3,2.9))}
    else if(wp==='axe'){var ha=hand([S0,[33,23.4],[36,25.6]]);add('wood',ln([[ha[0]-.4,ha[1]+3],[ha[0]+5,ha[1]-13]],1.6));stone([[ha[0]+3.4,ha[1]-15],[ha[0]+9,ha[1]-14],[ha[0]+9,ha[1]-9.6],[ha[0]+4.6,ha[1]-10.4]]);add('cord',rc(ha[0]+3.6,ha[1]-12.6,2.4,1.2))}
    else{var hb=hand([S0,[33,24],[36,27]]);add('wood',ln([[hb[0]-1.6,hb[1]+6],[hb[0]+6,hb[1]-22]],1.8));stone([[hb[0]+4,hb[1]-24.6],[hb[0]+11.6,hb[1]-23],[hb[0]+11.6,hb[1]-15.6],[hb[0]+5.6,hb[1]-17]]);stone([[hb[0]+4,hb[1]-21],[hb[0]+1,hb[1]-19.6],[hb[0]+4.6,hb[1]-18.4]]);add('cord',rc(hb[0]+4.2,hb[1]-21,2.4,1.4))}}
  else if(wp==='knife'){var hk=hand(pose==='a2'?[S0,[35.4,21],[41,22]]:pose==='a1'?[S0,[31,24],[32.4,26]]:[S0,[33,24],[36,27]]);add('wood',rc(hk[0]-.4,hk[1]-.8,2,1.6));stone([[hk[0]+1.4,hk[1]-1.4],[hk[0]+6.4,hk[1]-.2],[hk[0]+1.4,hk[1]+.8]])}
  else hand(pose==='a2'?[S0,[35,21],[40,22]]:[S0,[31,25],[32.4,30.4]]);
  /* shield on the near arm, in front; raised in guard */
  if(has('hide_shield')&&!fem){var sy2=guard?20:27,sx2=guard?35:31.6;if(oakSh){add('shieldR',rc(sx2-3.6,sy2-6.6,7.2,13.2));add('shield',rc(sx2-2.8,sy2-5.8,5.6,11.6));add('shieldR',rc(sx2-.9,sy2-5.8,.8,11.6));add('shieldR',rc(sx2+1.4,sy2-5.8,.6,11.6))}else{add('shieldR',el(sx2,sy2,3.9,6.6));add('shield',el(sx2,sy2,3.1,5.8));add('stone',el(sx2,sy2,.9,.9))}}
  return P}
function frogParts(eq,pose,L,add,poly,el,rc,ln,arc){/* a tiggle: knee-high frog-man, about two-thirds a goblin */
  var W=weapPick(eq),bow=W.p==='shortbow',atk=pose==='a1'||pose==='a2',fr=pose==='w1',cast=pose==='cast';
  var hy=fr?41:42;
  if(bow)add('quiver',poly([[25,40],[27.6,39.4],[28.6,47],[26,47.6]]));
  /* legs: big folded thighs, webbed feet */
  var B=fr?[[29,48],[26.4,53],[29.4,59.4]]:[[29,48],[24.6,53],[27.6,59.6]],F=fr?[[31.4,48],[35,52.6],[32.6,59.4]]:[[31.4,48],[36.4,52],[35,59.6]];if(atk&&pose==='a2')F=[[31.4,48],[37.4,53],[38,59.6]];
  add('fskinB',ln(B,3.6));add('web',poly([[B[2][0]-2.6,60],[B[2][0]+3.4,59.4],[B[2][0]+4,61.8],[B[2][0]-2.6,61.8]]));
  add('fskin',ln(F,3.8));add('web',poly([[F[2][0]-2.4,60],[F[2][0]+4,59.4],[F[2][0]+4.6,61.8],[F[2][0]-2.4,61.8]]));add('fspot',rc(F[0][0]+2.2,F[0][1]+1.6,1.2,1));
  /* far arm */
  add('fskinB',ln(cast?[[29.4,hy],[31,hy-5],[33.6,hy-8]]:[[29.4,hy],[27.6,hy+3.6],[28.6,hy+6.4]],2.2));
  /* body: round, pale belly, a strap */
  add('fskin',el(30.4,hy+3.6,5.2,6.4));add('fbelly',el(32.4,hy+5,2.8,4.6));add('fspot',rc(27,hy+1,1.4,1.2));add('fspot',rc(28.4,hy+5,1.2,1));add('fspot',rc(26.6,hy+7,1,1));
  add('belt',poly([[25.4,hy+7.4],[35.4,hy+6.6],[35.6,hy+8],[25.6,hy+8.8]]));add('accent',rc(33.6,hy+6.8,1.4,1.4));
  /* head: wide and flat, eyes on top, a long mouth */
  var hx=atk&&pose==='a2'?1:0;add('fskin',el(32+hx,hy-5.6,5.8,3.8));add('fskinB',el(29.6+hx,hy-4.6,2.6,2.6));add('fskin',el(32.4+hx,hy-9,2.3,2.2));add('fspot',rc(28.4+hx,hy-7.6,1,1));
  add('giris',el(32.8+hx,hy-9.2,1.4,1.4));add('pupil',rc(33.2+hx,hy-9.8,.9,1.4));add('mouth',rc(31.4+hx,hy-3.6,6.6,atk?1.6:.7));if(atk)add('tooth',rc(36.4+hx,hy-3.6,.8,.8));add('fbelly',rc(32.4+hx,hy-2.6,4,1));
  /* near arm and weapon */
  var S=[31.6,hy+.6],hand=function(pts){add('fskin',ln(pts,2.3));var h=pts[pts.length-1];add('fskin',el(h[0],h[1],1.3,1.2));add('web',rc(h[0]-.4,h[1]+.6,1.6,.8));return h},stone=function(pts){add('stone',poly(pts))};
  if(cast){hand([S,[35,hy-3],[38,hy-6]])}
  else if(bow){var bx=pose==='a1'?38:37,R=6.4;hand([S,[34.6,hy+.4],[bx,hy]]);
    if(pose==='a1'){add('wood',arc(bx,hy,R,-1.05,1.05,1.2));var ex=bx+R*Math.cos(1.05),ey=R*Math.sin(1.05);add('string',ln([[ex,hy-ey],[32.4,hy-.4],[ex,hy+ey]],.6));add('arrow',ln([[32.6,hy-.4],[41.6,hy]],.8));stone([[41.2,hy-.9],[43.4,hy],[41.2,hy+.9]])}
    else{add('wood',arc(bx-2,hy,R,-1.2,1.2,1.2));var sx=bx-2+R*Math.cos(1.2),sy=R*Math.sin(1.2);add('string',ln([[sx,hy-sy],[sx,hy+sy]],.6))}}
  else{var h=pose==='a2'?hand([S,[36,hy],[40.6,hy+.4]]):pose==='a1'?hand([S,[30.6,hy-3],[29.4,hy-5.6]]):hand([S,[34.2,hy+3.6],[35.6,hy+6]]);
    add('wood',rc(h[0]-.5,h[1]-.7,1.6,1.4));if(pose==='a1')stone([[h[0]-.6,h[1]-1],[h[0]+.4,h[1]-5.6],[h[0]+1.2,h[1]-1]]);else stone([[h[0]+1.1,h[1]-1.1],[h[0]+5,h[1]],[h[0]+1.1,h[1]+.7]])}
  return P_FROG(add)}
function P_FROG(add){return add.P}
function a64draw(who,eq,pose,L){var N=A64N,c=document.createElement('canvas');c.width=c.height=N;var g=c.getContext('2d');if(!g)return null;var map=new Array(N*N).fill(null),pal={};for(var k in A64PAL)pal[k]=A64PAL[k];
  pal.skin=L.sk;pal.hair=pal.beard=L.hr;pal.tunic=L.dye;pal.accent=L.bead[0];pal.accent2=L.bead[1];pal.hood=L.hood;pal.robe=L.robe;if(who==='gob'){pal.gskin=L.gob[0];pal.gskinB=L.gob[1]}if(who==='frog'){pal.fskin=L.frog[0];pal.fskinB=L.frog[1];pal.fspot=L.frog[2]}if(who==='pig'){pal.pskin=L.pig[0];pal.pskinB=L.pig[1]}
  var sh=function(h,m){var v=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)].map(function(x){return Math.round(x*m)});return '#'+v.map(function(x){return ('0'+Math.max(0,Math.min(255,x)).toString(16)).slice(-2)}).join('')};
  var W0=weapPick(eq),pk0=eq.filter(function(x){return wkey(x)===W0.p})[0],m0=pk0?wmat(pk0):null;if((m0&&m0.hd==='cu')||W0.p==='rod_cu')pal.stone='#c27a40';if(m0&&m0.wd==='pine')pal.wood='#c89858';
  if(eq.indexOf('leather_armor')>=0)pal.vest='#8a5834';if(eq.indexOf('leather_helmet')>=0)pal.helm='#8a5834';if(eq.indexOf('oak_helmet')>=0)pal.helm='#9a6c3a';if(eq.indexOf('leather_shield')>=0){pal.shield='#8a5834';pal.shieldR='#4a2c18'}if(eq.indexOf('oak_shield')>=0){pal.shield='#b07a40';pal.shieldR='#5e3a1e'}pal.greave='#8a5834';pal.greaveB='#6e4428';
  pal.skinB=sh(L.sk,.82);pal.leg=sh(L.sk,.92);pal.legB=sh(L.sk,.75);pal.armB=sh(L.dye,.82);pal.btunic=sh(L.hood,1.15);
  a64parts(who,eq,pose,L).forEach(function(p){g.clearRect(0,0,N,N);g.fillStyle=g.strokeStyle='#000';p[1](g);var d=g.getImageData(0,0,N,N).data;for(var i=0;i<N*N;i++)if(d[i*4+3]>120)map[i]=p[0]});
  var at=function(x,y){return x<0||y<0||x>=N||y>=N?null:map[y*N+x]},out=new Array(N*N).fill(null),R=[.72,1,1.14],hx=function(h){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]};
  for(var y=0;y<N;y++)for(var x=0;x<N;x++){var id=at(x,y);if(!id)continue;var bb=hx(pal[id]||'#ff00ff'),cc=bb;
    if(!A64DET[id]){var up=at(x,y-1)===id,lf=at(x-1,y)===id,dn=at(x,y+1)===id,rt=at(x+1,y)===id,l=1;if(!rt||!dn)l=0;else if(!up||!lf)l=2;cc=bb.map(function(v){return v*R[l]})}
    out[y*N+x]=cc}
  var o=out.slice();
  for(y=0;y<N;y++)for(x=0;x<N;x++){var a=at(x,y);if(!a||A64DET[a])continue;var r=at(x+1,y),d2=at(x,y+1);if((r&&r!==a&&!A64DET[r]&&pal[r]!==pal[a])||(d2&&d2!==a&&!A64DET[d2]&&pal[d2]!==pal[a]))o[y*N+x]=o[y*N+x].map(function(v,i){return v*.5+A64OUT[i]*.38})}
  var img=g.createImageData(N,N),D=img.data,glowy=pose==='cast';
  for(y=0;y<N;y++)for(x=0;x<N;x++){var q=y*N+x,col=o[q];if(!col&&D4.some(function(z){var X=x+z[0],Y=y+z[1];return X>=0&&Y>=0&&X<N&&Y<N&&out[Y*N+X]}))col=(glowy&&D4.some(function(z){var X=x+z[0],Y=y+z[1];return X>=0&&Y>=0&&X<N&&Y<N&&(map[Y*N+X]==='glow2'||map[Y*N+X]==='glow')}))?[120,200,255]:A64OUT;if(!col)continue;D[q*4]=col[0];D[q*4+1]=col[1];D[q*4+2]=col[2];D[q*4+3]=255}
  g.putImageData(img,0,0);return c}
function a64dead(src){/* the fallen body: the standing figure laid on its back, with a dark pool under it */var N=A64N,c=document.createElement('canvas');c.width=c.height=N;var g=c.getContext('2d');g.imageSmoothingEnabled=false;
  g.fillStyle='#5a1410';g.beginPath();g.ellipse(30,61,14,2.4,0,0,7);g.fill();g.fillStyle='#7a1a14';g.fillRect(22,60,10,2);g.fillRect(36,61,6,1);
  g.save();g.translate(32,32);g.rotate(-Math.PI/2);g.translate(-32,-32);g.drawImage(src,-20,0);g.restore();
  var d=g.getImageData(0,0,N,N),D=d.data;for(var i=0;i<D.length;i+=4){if(!D[i+3])continue;D[i+3]=255}g.putImageData(d,0,0);return c}
var A64POSES=['w0','w1','a1','a2','cast','guard'];
function a64set(who,eq,seed,tt){eq=(eq||[]).slice().sort();var key=who+'|'+eq.join(',')+'|'+(seed|0)+'|'+(tt|0);if(A64[key])return A64[key];var L=lookOf(who,seed,tt),o={};
  A64POSES.forEach(function(p){var cv=a64draw(who,eq,p,L);try{o[p]=cv?cv.toDataURL('image/png'):''}catch(e){o[p]=''}if(p==='w0'&&cv){try{o.dead=a64dead(cv).toDataURL('image/png')}catch(e){o.dead=''}}});
  A64[key]=o;return o}
function a64img(u,cl){return u?'<image class="'+cl+'" href="'+u+'" x="0" y="0" width="16" height="16" preserveAspectRatio="none" style="image-rendering:pixelated"/>':''}
function a64fig(who,eq,seed,tt){var o=a64set(who,eq,seed,tt);return '<g class="lA">'+a64img(o.w0,'pw')+'</g><g class="lB">'+a64img(o.w1,'pw')+'</g>'+a64img(o.a1,'pa1')+a64img(o.a2,'pa2')+a64img(o.cast,'pc')+a64img(o.guard,'pg')+a64img(o.dead,'pd')}
function hSeed(h){return h&&(h.id!=null?h.id:h.c&&h.c.id)||0}
function hTat(h){if(!h)return 0;if(h.tt!=null)return h.tt;return (h.tat||[]).filter(function(t){return t&&(t.v||t.k)}).length}
function humanInner(eq,f,h){return a64fig(f?'woman':'man',f?[]:(eq||[]),hSeed(h),f?0:hTat(h))}
function mobSeed(b){if(!b)return 0;if(b.sd==null)b.sd=Math.floor(Math.random()*1e6);return b.sd}
function goblinInner(b){return a64fig('gob',['club'],mobSeed(b),0)}
function brigandInner(b){b=b||{w:'club'};var eq=[b.w==='bow'?'shortbow':b.w];if(b.armor)eq.push('hide_armor');if(b.shield)eq.push('hide_shield');return a64fig('brig',eq,mobSeed(b),0)}
function piggerInner(b){return a64fig('pig',['spear'],mobSeed(b),0)}
function tiggleInner(b){b=b||{};return a64fig('frog',[b.w==='bow'?'shortbow':'knife'],mobSeed(b),0)}
function mobInner(kind,b){return kind==='goblin'?goblinInner(b):kind==='pigger'?piggerInner(b):kind==='tiggle'?tiggleInner(b):brigandInner(b)}

