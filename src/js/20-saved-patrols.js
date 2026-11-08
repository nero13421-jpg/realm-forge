/* ---------- saved patrols ---------- */
var MAXR=10;
var ENG_DEF={spot:'engage',fall:0};
var ENG_OPT={
  spot:[['engage','Attack them'],['hold','Stop and hold position'],['ignore','Keep to the route'],['withdraw','Go home']],
  fall:[['0','Never'],['0.25','When a quarter are down'],['0.5','When half are down'],['0.75','When three quarters are down']]
};
var ENG_LAB={spot:'When enemies are spotted',fall:'Fall back'};
function routeById(id){for(var i=0;i<S.routes.length;i++)if(S.routes[i].id===id)return S.routes[i];return null}
function isDefend(U){return U.route==='defend'&&!U.det}
function routeName(U){return isDefend(U)?'Defend settlement':(routeById(U.route)?routeById(U.route).name:null)}
function defendZone(U){var st=setById(U.sid),z={};if(!st)return z;[[st.c,st.r]].concat(st.c2!=null?[[st.c2,st.r2]]:[]).forEach(function(p){z[ix(p[0],p[1])]=1;nbrs(p[0],p[1]).forEach(function(q){z[ix(q[0],q[1])]=1})});return z}
function defendThreat(U){var z=defendZone(U),t=null;S.match.camps.forEach(function(m){if(!t&&m.roam&&m.mobs.length&&m.pos&&z[ix(m.pos[0],m.pos[1])])t=m});return t}
function engOf(U){var r=routeById(U.route);return (r&&r.eng)||ENG_DEF}
function engText(e){return Object.keys(ENG_LAB).map(function(k){var o=ENG_OPT[k].filter(function(x){return x[0]===String(e[k])})[0];return ENG_LAB[k]+': '+(o?o[1].toLowerCase():'')}).join(' · ')}
function stepText(st){
  if(st.type==='march')return 'March to '+lab(st.to[0],st.to[1])+' ('+terrName(st.to[0],st.to[1])+') at a '+st.pace;
  if(st.type==='wait')return 'Wait '+Math.round(st.secs/60)+' min';
  if(st.type==='rest')return 'Short rest, 10 s';
  if(st.type==='lrest')return 'Long rest, 1 min';
  return 'Return home';
}
function routePreview(R,st){
  if(!st||!R)return{route:[],ok:true};
  var cur=[st.c,st.r],pts=[cur],ok=true;
  R.steps.forEach(function(s){
    if(s.type==='march'){var p=findPath(cur,s.to);if(!p){ok=false;return}p.forEach(function(q){pts.push(q)});cur=s.to}
    if(s.type==='home'){var bk=findPath(cur,[st.c,st.r]);if(bk)bk.forEach(function(q){pts.push(q)});cur=[st.c,st.r]}
  });
  return{route:pts,ok:ok};
}
function shiftRoutes(dc,dr){var wx=Math.sqrt(3)*SH*dc,wy=SH*1.5*dr;S.routes.forEach(function(R){R.steps.forEach(function(s){if(s.pts)s.pts=s.pts.map(function(p){return[Math.round((p[0]+wx)*100)/100,Math.round((p[1]+wy)*100)/100]});if(s.to)s.to=[s.to[0]+dc,s.to[1]+dr]})})}
function routeListHtml(R){return '<div class="row">'+S.routes.map(function(r){return '<button class="btn sm'+(R&&r.id===R.id?' on':'')+'" data-act="rsel" data-id="'+r.id+'">'+esc(r.name)+'</button>'}).join('')+'<button class="btn sm go" data-act="rnew"'+(S.routes.length>=MAXR?' disabled':'')+'>New patrol ('+S.routes.length+' of '+MAXR+')</button></div>'}
function routeEditor(R,st){
  var e=R.eng||ENG_DEF,users=S.units.filter(function(u){return u.route===R.id}).map(function(u){return esc(u.name)}).join(', ')||'no unit yet';
  var steps=R.steps.map(function(s,i){return '<li><span>'+(i+1)+'. '+esc(stepText(s))+'</span><span class="acts"><button class="btn sm" data-act="rsup" data-i="'+i+'" aria-label="Move up">↑</button><button class="btn sm" data-act="rsdn" data-i="'+i+'" aria-label="Move down">↓</button><button class="btn sm" data-act="rsrm" data-i="'+i+'" aria-label="Remove">✕</button></span></li>'}).join('')||'<li class="dim">No steps yet. Add a march first.</li>';
  var opt=function(list,cur){return list.map(function(o){return '<option value="'+o[0]+'"'+(String(cur)===String(o[0])?' selected':'')+'>'+o[1]+'</option>'}).join('')};
  var engSel=Object.keys(ENG_LAB).map(function(k){return '<div class="field"><label class="label" for="re-'+k+'">'+ENG_LAB[k]+'</label><select id="re-'+k+'" data-reng="'+k+'">'+opt(ENG_OPT[k],e[k])+'</select></div>'}).join('');
  var sopts=S.setl.map(function(s){return[''+s.id,setName(s)]});
  var PU=planUnit(R),pro=planRoster(PU);routeSids(R);
  var plays=R.steps.map(function(s,i){if(s.type!=='leg')return '<li><span>'+(i+1)+'. '+esc(stepText(s))+'</span><span class="acts"><button class="btn sm" data-act="rsrm" data-i="'+i+'" aria-label="Remove">✕</button></span></li>';
    var af=s.after===0?'at the start':s.after==null?(i?'after the move above':'at the start'):'when move '+(stepBySid(R,s.after)+1)+' is done';
    return '<li><span><b style="color:'+whoCol(s.who)+'">'+(i+1)+'. '+esc(whoName(pro,s.who))+'</b> · '+paceIcon(s.pace,whoCol(s.who))+' '+s.pace+' · '+s.pts.length+' pt · starts '+af+((s.ord||[]).length?' · then '+s.ord.map(function(o){return esc(ordText(o,PU).toLowerCase())}).join(', '):'')+'</span><span class="acts"><button class="btn sm" data-act="tsel" data-i="'+i+'">Orders</button><button class="btn sm" data-act="rsup" data-i="'+i+'" aria-label="Move up">↑</button><button class="btn sm" data-act="rsdn" data-i="'+i+'" aria-label="Move down">↓</button><button class="btn sm" data-act="rsrm" data-i="'+i+'" aria-label="Remove">✕</button></span></li>'}).join('')||'<li class="dim">No moves yet. Press Draw a move on the map.</li>';
  var units=S.units.filter(function(u){return u.hids.length&&!u.det});
  return '<div class="field"><label class="label" for="rn">Patrol name</label><input type="text" id="rn" data-rn="1" value="'+esc(R.name)+'" maxlength="24"></div>'+
    '<div class="row"><div class="field"><label class="label" for="rrep">Repeat</label><select id="rrep" data-rrep="1">'+opt([['0','Run once'],['10','Every 10 minutes'],['20','Every 20 minutes'],['30','Every 30 minutes'],['60','Every hour']],R.repeat||0)+'</select></div>'+
    (units.length?'<div class="field"><label class="label" for="rpu">Draw it for</label><select id="rpu" data-rpu="1">'+opt(units.map(function(u){return[''+u.id,u.name+' · '+u.hids.length]}),PU?PU.id:'')+'</select></div>':'')+'</div>'+
    '<h3>The play</h3><p class="note">On the map: pick who moves (the whole unit, a team or one man) and the pace, press <b>Draw a move</b>, tap points anywhere, even inside a tile, then <b>End move · T</b>. Tap a T for its orders: rests, formations, hold, return home, rejoin. The line shows the pace: dotted creep, dashed walk, solid jog, zigzag sprint. Woods, swamp and roads under the line set the speed, so you can thread a faster way through.</p>'+
    '<ul class="orders">'+plays+'</ul>'+msgHtml()+
    '<h3>Engagement criteria</h3><div class="engrid">'+engSel+'</div>'+
    '<p class="note">Used by: '+users+'. Repeating patrols return home after the last step and set out again on the timer.</p>'+
    '<div class="row"><button class="btn sm'+(UI.confirm?' on':'')+'" data-act="rdel">'+(UI.confirm?'Confirm delete':'Delete patrol')+'</button></div>';
}
/* how far each of a man's attacks reaches, in yards (spell reaches match when the fight AI uses them) */
var SPELL_RNG={p_jab:2,p_push:30,p_pull:40,p_bolt:70,p_slash:70,p_arrow:150};
var RCOL={melee:'#f4ead2',bow:'#f0c64e',p_jab:'#9fe3ff',p_push:'#bfe9ff',p_pull:'#b9a2ff',p_bolt:'#c9b6ff',p_slash:'#7fd6ff',p_arrow:'#5fc4ff'};
function rangesOf(h){
  var eq=eqKeys(h),X=stats(h),o=[];
  eq=eq.map(wkey);var ml=MELEE.filter(function(k){return eq.indexOf(k)>=0})[0];if(ml)o.push({k:'melee',n:CD[ml].n+' reach',r:WEAP[ml].reach});
  BOWS.forEach(function(b){if(eq.indexOf(b)>=0)o.push({k:'bow',n:CD[b].n+(eq.indexOf(WEAP[b].ammo)>=0?'':' (no '+CD[WEAP[b].ammo].n.toLowerCase()+')'),r:Math.round(WEAP[b].reach*X.range)})});
  (h.spells||[]).forEach(function(k){if(SPELL_RNG[k])o.push({k:k,n:SPELL[k].n,r:SPELL_RNG[k]})});
  return o.sort(function(a,b){return a.r-b.r});
}
/* the picked man's reach drawn to scale around him, with the rest of the formation as dots */
function rangeMap(U,o,sel){
  var R=rangesOf(sel);if(!R.length)return '<p class="note">'+esc(hname(sel))+' has no weapon or attack spell, so he has no reach to show.</p>';
  var p0=o.s[sel.id]||[FMC,FMR],mx=Math.max.apply(null,R.map(function(x){return x.r}))*1.08+8,f1=function(v){return v.toFixed(1)};
  var g='<svg class="rmap" viewBox="'+f1(-mx)+' '+f1(-mx)+' '+f1(2*mx)+' '+f1(2*mx)+'" role="img" aria-label="Attack ranges of '+esc(hname(sel))+'"><rect x="'+f1(-mx)+'" y="'+f1(-mx)+'" width="'+f1(2*mx)+'" height="'+f1(2*mx)+'" fill="#17140f"/>';
  var step=mx>100?50:mx>40?20:5;for(var v=step;v<mx;v+=step)g+='<circle r="'+v+'" class="rgrid"/>';
  g+='<line x1="0" y1="'+f1(-mx*.96)+'" x2="0" y2="'+f1(-mx*.8)+'" class="rfront"/><text class="rtx" x="0" y="'+f1(-mx*.97)+'" style="font-size:'+f1(mx*.045)+'px">FRONT</text>';
  Object.keys(o.s).forEach(function(h){var q=o.s[h];g+='<circle cx="'+f1((q[0]-p0[0])*FMS)+'" cy="'+f1((q[1]-p0[1])*FMS)+'" r="'+f1(Math.max(.6,mx*.008))+'" fill="'+(+h===sel.id?'#fff':'#a99d84')+'"/>'});
  R.forEach(function(x){var c=RCOL[x.k]||'#fff';g+='<circle r="'+x.r+'" fill="'+c+'0d" stroke="'+c+'" stroke-width="'+f1(mx*.011)+'"'+(x.k==='bow'||x.k==='melee'?'':' stroke-dasharray="'+f1(mx*.03)+' '+f1(mx*.018)+'"')+'/>'});
  R.filter(function(x){return x.r>=mx*.08}).forEach(function(x,i){var c=RCOL[x.k]||'#fff',an=(-35+i*22)*Math.PI/180;g+='<text class="rtx" x="'+f1(Math.cos(an)*x.r)+'" y="'+f1(Math.sin(an)*x.r+mx*.02)+'" fill="'+c+'" style="font-size:'+f1(mx*.06)+'px;paint-order:stroke;stroke:#17140f;stroke-width:'+f1(mx*.012)+'px">'+x.r+'</text>'});
  g+='</svg>';
  return '<div class="rwrap"><div class="rmapbox">'+g+'</div><ul class="rleg">'+R.map(function(x){return '<li><i style="border-color:'+(RCOL[x.k]||'#fff')+'"></i>'+esc(x.n)+' · <b>'+x.r+' yd</b></li>'}).join('')+'<li class="dim">Grid squares are '+FMS+' yd, rings on the map every '+step+' yd. Dots are the rest of the formation.</li></ul></div>';
}
function fmSvg(U,key,o,isOb){
  var C=24,W=FMX*C,H=FMY*C,sel=UI.fsel&&UI.fsel.k===String(key)?UI.fsel.h:null,ts=teamsOf(U),tiOf={};
  ts.forEach(function(t,ti){t.hids.forEach(function(h){tiOf[h]=ti})});
  var out='<svg class="fmgrid" viewBox="0 -16 '+W+' '+(H+16)+'" role="img" aria-label="'+esc(fmName(U.fm,key))+' grid"><rect x="0" y="-16" width="'+W+'" height="'+(H+16)+'" fill="#17140f"/><text class="fmfront" x="'+W/2+'" y="-4">▲ FRONT · toward the enemy and the direction of march</text>';
  for(var y=0;y<FMY;y++)for(var x=0;x<FMX;x++)out+='<rect x="'+(x*C+.5)+'" y="'+(y*C+.5)+'" width="'+(C-1)+'" height="'+(C-1)+'" class="fmc'+(x===FMC&&y===FMR?' anc':'')+'"/>';
  Object.keys(o.s).forEach(function(h){var p=o.s[h],m=byId(+h);if(!m)return;var on=+h===sel,st=isOb?(o.st[h]||defStance(m)):null;
    out+='<g transform="translate('+(p[0]*C)+' '+(p[1]*C)+')">'+(on?'<rect x="1" y="1" width="'+(C-2)+'" height="'+(C-2)+'" class="fmsel"/>':'')+'<rect x="3" y="'+(C-4)+'" width="'+(C-6)+'" height="3" fill="'+TCOL[(tiOf[h]||0)%TCOL.length]+'"/><g transform="translate(3 1) scale(1.15)" shape-rendering="crispEdges">'+humanInner(eqKeys(m),m.sex==='f',m)+'</g>'+(st&&st!=='hold'?'<text class="fmst" x="'+(C-3)+'" y="8">'+(st==='charge'?'C':'S')+'</text>':'')+'</g>'});
  if(sel&&o.s[sel]){var sm=byId(sel),sp=o.s[sel],cx0=sp[0]*C+C/2,cy0=sp[1]*C+C/2;out+='<clipPath id="fmclip'+key+'"><rect width="'+W+'" height="'+H+'"/></clipPath><g clip-path="url(#fmclip'+key+')" pointer-events="none">'+rangesOf(sm).map(function(r){var c=RCOL[r.k]||'#fff';return '<circle cx="'+cx0+'" cy="'+cy0+'" r="'+(r.r/FMS*C)+'" fill="'+c+'14" stroke="'+c+'" stroke-width="1.2"'+(r.k==='bow'||r.k==='melee'?'':' stroke-dasharray="5 3"')+'/>'}).join('')+'</g>'}
  for(y=0;y<FMY;y++)for(x=0;x<FMX;x++)out+='<rect x="'+(x*C)+'" y="'+(y*C)+'" width="'+C+'" height="'+C+'" fill="transparent" data-act="fmcell" data-k="'+key+'" data-x="'+x+'" data-y="'+y+'" style="cursor:pointer"/>';
  return out+'</svg>';
}
function fmEditor(U,key){
  var FM=fmOf(U),isOb=key!=='mv',o=isOb?obById(FM,key):FM.mv,sel=UI.fsel&&UI.fsel.k===String(key)?byId(UI.fsel.h):null,ts=teamsOf(U);
  var tOf={};ts.forEach(function(t,ti){t.hids.forEach(function(h){tOf[h]={t:t,ti:ti}})});
  var chips=U.hids.map(byId).filter(Boolean).map(function(h){var st=isOb?(o.st[h.id]||defStance(h)):'',tt=tOf[h.id];return '<button class="btn sm tbtn'+(sel&&sel.id===h.id?' on':'')+'" data-act="fmsel" data-k="'+key+'" data-h="'+h.id+'"><i style="background:'+TCOL[(tt?tt.ti:0)%TCOL.length]+'"></i>'+esc(hname(h))+(tt&&ts.length>1?' · '+esc(tt.t.name):'')+(isOb?' · '+STANCE[st][0].toLowerCase():'')+'</button>'}).join('');
  var shapes='<div class="row"><span class="label">Start from</span>'+[['line','Line'],['ranks','Ranks by team'],['file','File'],['wedge','Wedge']].map(function(x){return '<button class="btn sm" data-act="fmshape" data-k="'+key+'" data-s="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>';
  var stc='';
  if(isOb){var sc=UI.fscope||'man';
    stc='<div class="row"><span class="label">Stance for</span>'+[['man',sel?esc(hname(sel)):'the picked man'],['team',sel&&tOf[sel.id]&&ts.length>1?'his team, '+esc(tOf[sel.id].t.name):'his team'],['all','the whole squad']].map(function(x){return '<button class="btn sm'+(sc===x[0]?' on':'')+'" data-act="fmscope" data-s="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>'+
      '<div class="row">'+Object.keys(STANCE).map(function(k){return '<button class="btn sm'+(sel&&(o.st[sel.id]||defStance(sel))===k?' on':'')+'" data-act="fmstance" data-k="'+key+'" data-v="'+k+'"'+(sel||sc==='all'?'':' disabled')+'>'+STANCE[k][0]+'</button>'}).join('')+'</div>'+
      '<ul class="facts">'+Object.keys(STANCE).map(function(k){return '<li><b>'+STANCE[k][0]+'.</b> '+esc(STANCE[k][1])+'</li>'}).join('')+'</ul>';
  }
  return '<p class="note">'+(sel?esc(hname(sel))+' is picked. Tap a square to put him there. Tapping a square someone holds swaps them.':'Tap a man on the grid or in the list, then tap the square where he goes. Each square is '+FMS+' yards. The marked square is where the squad\'s flag stands.')+'</p>'+
    '<div class="fmwrap">'+fmSvg(U,key,o,isOb)+'</div><div class="chips2 fmchips">'+chips+'</div>'+(sel?'<h3>Reach of '+esc(hname(sel))+'</h3>'+rangeMap(U,o,sel):'<p class="note">Pick a man to see how far his weapons and spells reach.</p>')+shapes+stc;
}
function vPatrols(){
  var R=routeById(UI.R)||S.routes[0]||null;if(R)UI.R=R.id;
  var us=S.units.filter(function(u){return u.hids.length}),U=unitById(UI.fu);if(!U||!U.hids.length)U=us[0]||null;if(U)UI.fu=U.id;
  var head='<section class="panel"><h2>Patrols</h2><p class="note">Each unit has its own formations. The order of movement is how the unit marches, and it is the shape they are in when contact is made. Orders of battle are the setups you switch between in a fight, each with a spot and a stance for every man. Patrol routes are saved routes any unit can follow.</p>'+
    (us.length?'<div class="row"><span class="label">Formations for</span>'+us.map(function(u){return '<button class="btn sm'+(U===u?' on':'')+'" data-act="fmu" data-u="'+u.id+'">'+esc(u.name)+' · '+u.hids.length+'</button>'}).join('')+'</div>':'<p class="note">Form a unit with men in the Units tab to set its formations.</p>')+'</section>';
  var fm='';
  if(U){var FM=fmOf(U),ob=obById(FM,UI.fob)||obById(FM,FM.def);UI.fob=ob.id;
    fm='<section class="panel"><h2>Order of movement · '+esc(U.name)+'</h2><p class="note">'+(inFile(U)?'Marching in a file. This unit gets the ×'+ROAD_SP+' gravel road speed.':'Not in a file. Only a unit marching in one column gets the gravel road speed. Use File, or put every man in the same column.')+'</p>'+fmEditor(U,'mv')+'</section>'+
      '<section class="panel"><h2>Battle plays · '+esc(U.name)+'</h2>'+boardEd(U)+'</section>'+
      '<section class="panel"><h2>Orders of battle · '+esc(U.name)+'</h2><div class="row">'+FM.ob.map(function(x){return '<button class="btn sm'+(x===ob?' on':'')+'" data-act="fmob" data-o="'+x.id+'">'+esc(x.name)+(x.id===FM.def?' ★':'')+'</button>'}).join('')+(FM.ob.length<MAXOB?'<button class="btn sm" data-act="fmnew">New order of battle</button>':'')+'</div>'+
      '<div class="row"><div class="field" style="flex:1"><label class="label" for="fmn">Name</label><input type="text" id="fmn" data-fmn="'+ob.id+'" value="'+esc(ob.name)+'" maxlength="28"></div>'+(ob.id===FM.def?'<span class="dim mono">★ default: the AI uses this one</span>':'<button class="btn sm" data-act="fmdef">Make default</button>')+'<button class="btn sm" data-act="fmdup"'+(FM.ob.length<MAXOB?'':' disabled')+'>Duplicate</button>'+(FM.ob.length>1?'<button class="btn sm" data-act="fmdel">Delete</button>':'')+'</div>'+fmEditor(U,ob.id)+'</section>';
  }
  var top='<section class="panel"><h2>Patrol routes</h2><p class="note">A patrol route is the path: march, wait, rest, return. It also carries the engagement criteria, what the unit does when it spots enemies. Give each unit a default patrol in the Units tab. In a match you can switch any unit to any saved patrol.</p>'+routeListHtml(R)+(R?'':msgHtml())+'</section>';
  if(!R)return head+fm+top;
  var st=setById(UI.Rfrom)||S.setl[0]||null;if(st)UI.Rfrom=st.id;
  var pf=routePreview(R,st),left;
  var PLY={R:R,home:planHome(R,planUnit(R))};
  if(S.match)left=mapView(mapSvg({world:true,mineRing:true,route:pf.route,pz:'p',play:PLY}),'p',planOver(R),planBar(R))+legend();
  else left=mapView(mapSvg({route:pf.route,pz:'p',play:PLY}),'p',planOver(R),planBar(R))+legend();
  return head+fm+top+'<div class="split"><section class="panel"><h2>'+esc(R.name)+'</h2>'+left+(pf.ok?'':'<p class="msg bad">A march in this patrol has no route from here. Ponds block it.</p>')+'</section>'+
    '<section class="panel">'+routeEditor(R,st)+'</section></div>';
}

