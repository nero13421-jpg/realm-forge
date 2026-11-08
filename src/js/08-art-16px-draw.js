/* 16-bit art: every sprite is drawn in half-unit pixels inside the same boxes the old art used */
var ART=(function(){var a={};['spear','axe','battle_axe','club','knife','shortbow','longbow','short_arrows','long_arrows','hide_armor','hide_shield','hide_helmet','o_armor','o_helmet','o_shield','rabbit','stag','boar','wolf','hawk','altar','lumber','gravel','red_crystal','gnosis','parch','setcard','tat_spiral','tat_antler','tat_serpent','tat_eye','tat_hand'].forEach(function(k){a[k]=ART16[k]});a.human={c:ART16.h_body.c,r:ART16.h_body.r.concat(ART16.h_legA.r)};return a})();
ART.stimber={c:{o:'#2a1a10',W:'#b0804e',w:'#8a6036',l:'#ecd09c',L:'#caa070'},r:ART16.lumber.r};ART.ltimber={c:{o:'#160e06',W:'#6a4020',w:'#4a2c14',l:'#b88a58',L:'#8a5e30'},r:ART16.lumber.r};
function rects(a,dx,dy){var o='';a.r.forEach(function(q){o+='<rect x="'+(q[1]+dx)+'" y="'+(q[2]+dy)+'" width="'+q[3]+'" height="'+q[4]+'" fill="'+a.c[q[0]]+'"/>'});return o}
function svgWrap(inner,sz){return '<svg class="ic" width="'+sz+'" height="'+sz+'" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">'+inner+'</svg>'}
function setOpts(cur){return S.setl.map(function(s){return '<option value="'+s.id+'"'+(cur===s.id?' selected':'')+'>'+setName(s)+'</option>'}).join('')}
function routeOpts(cur,none){return '<option value="">'+none+'</option><option value="defend"'+(cur==='defend'?' selected':'')+'>Defend settlement</option>'+S.routes.map(function(r){return '<option value="'+r.id+'"'+(cur===r.id?' selected':'')+'>'+esc(r.name)+'</option>'}).join('')}
function eqKeys(h){return gearOf(h).map(function(c){return c.key})}
function humanSvg(h,sz){return svgWrap(humanInner(eqKeys(h),h.sex==='f',h),sz)}
function iconFor(c){
  if(c.key==='human')return humanSvg(c,44);
  if(ART[c.key])return svgWrap(rects(ART[c.key],0,0),44);
  var k=kindOf(c);
  if(k==='parch')return svgWrap(rects(ART.parch,0,0)+(spArt(c.key)?rects(spArt(c.key),3,-3):''),44);
  if(k==='terrain'){var t=cardTerr(c.key),el=c.key.charAt(0)==='e'?ELEV[c.key.split('_')[1]]:null;return icoWrap('<rect width="12" height="12" fill="'+DITHER[t][0]+'"/>'+rects(SPR[t],0,0)+(el?(el.sh==='slope'?'<polygon points="0,12 12,12 12,'+(el.rise>30?3:7)+'" fill="#f4ead2" opacity=".55"/>':'<ellipse cx="6" cy="12" rx="6" ry="'+(el.rise>20?6:4)+'" fill="#f4ead2" opacity=".55"/>'):''),12,44)}
  return '';
}

function stackOf(list){var o=[],by={};list.forEach(function(c){if(c.key==='human'){o.push([c]);return}var g=by[c.key];if(!g){g=by[c.key]=[];o.push(g)}g.push(c)});return o}
function tagsHtml(list,o){o=o||{};return stackOf(list).map(function(g){var c=g[0];if(AMMO_WT[c.key])c=g.slice().sort(function(a,b){return (b.n===undefined?20:b.n)-(a.n===undefined?20:a.n)})[0];return tagHtml(c,{grp:g,act:typeof o.act==='function'?o.act(c):o.act,sel:o.sel,fresh:o.fresh})}).join('')}
function tagHtml(c,o){
  o=o||{};
  var k=kindOf(c),st='',g=o.grp&&o.grp.length>1?o.grp:null;
  if(c.key==='human')st='HP '+stats(c).hp+' · Mana '+(c.mana||1)+(c.gnosis?' · Gnosis '+c.gnosis:'')+(c.spells&&c.spells.length?' · '+c.spells.map(function(x){return SPELL[x].n}).join(', '):'');
  else if(k==='parch')st=MAGIC_SCHOOL+' · '+SPELL[c.key].t+' · one use';
  else if(WEAP[wkey(c.key)]){var wm=wmat(c.key),base=WEAP[wkey(c.key)].dmg*(wm.hd?HEADS[wm.hd].mul:1);st=Math.round(base)+' dmg'+(wm.hd==='cu'?' · ×1.25 vs men':wm.hd==='fl'?' · ×1.25 vs beasts':'')+' · '+wtOf(c.key)+' lb'+(c.wear?' · sharp '+Math.round(sharpOf(c)*100)+'%':'')}
  else if(AMMO_WT[wkey(c.key)])st=(c.wear?'sharp '+Math.round(sharpOf(c)*100)+'% · ':'')+(g?g.reduce(function(t,x){return t+(x.n===undefined?20:x.n)},0)+' arrows in all':(c.n===undefined?20:c.n)+' arrows')+' · '+AMMO_WT[wkey(c.key)]+' lb a quiver · '+(wkey(c.key)==='long_arrows'?'long bow':'short bow')+(wmat(c.key).hd==='cu'?' · ×1.25 vs men':' · ×1.25 vs beasts');
  else if(TIMB[c.key])st=(g?g.reduce(function(t,x){return t+(x.n==null?TIMB_N:x.n)},0)+' timbers in all':(c.n==null?TIMB_N:c.n)+' timbers')+' · for palisades, gates and towers';
  else if(ARM[c.key])st='−'+ARM[c.key].def+' per hit'+(ARM[c.key].dodge?' · +'+ARM[c.key].dodge+'% dodge':'')+' · '+ARM[c.key].wt+' lb';
  else if(k==='terrain')st=cardCost(c.key)+' prestige';
  else if(k==='crystal')st='value 1';
  else if(k==='tattoo')st=TATTOO[c.key].t+' of his stats when applied, then fixed';
  var eq=c.eq?byId(c.eq):null,ne=g?g.filter(function(x){return x.eq}).length:0;
  if(g&&ne===g.length&&g.every(function(x){return x.eq===c.eq}))st+=(st?' · ':'')+'on '+esc(hname(eq));else if(g){if(ne)st+=(st?' · ':'')+ne+' equipped'}else if(eq)st+=(st?' · ':'')+'on '+esc(hname(eq));
  var cls='tag'+(o.sel?' sel':'')+(o.fresh?' fresh':'');
  var inner='<span class="cat">'+(g?g.length+' cards':'RF-'+String(c.id).padStart(4,'0'))+' · '+KIND[k]+'</span><span class="mid">'+iconFor(c)+'<span class="nm">'+esc(cardName(c))+(g?' <span class="cnt">×'+g.length+'</span>':'')+'</span></span>'+(madeOf(c.key)?'<span class="made">'+esc(madeOf(c.key))+'</span>':'')+'<span class="st">'+st+'</span>';
  return o.act?'<button class="'+cls+'" data-act="'+o.act+'" data-id="'+c.id+'">'+inner+'</button>':'<div class="'+cls+'">'+inner+'</div>';
}
function head(){
  var cap=capacity(),need=needed(),hum=humans().length;
  $('#ledger').innerHTML='<div><dt>Prestige</dt><dd>'+S.prestige+'</dd></div>'+
    '<div><dt>People fed / needed</dt><dd class="'+(need>cap?'bad':'')+'">'+Math.floor(cap)+' / '+need+'</dd></div>'+
    '<div><dt>Settlements</dt><dd>'+S.setl.length+'</dd></div><div><dt>Humans</dt><dd>'+hum+'</dd></div>'+(S.match?'<div><dt>Match clock</dt><dd id="hclock">'+mmss(S.match.clock)+'</dd></div>':'');
  var T=S.match?[['packs','Packs'],['settle','Settlements'],['units','Units'],['res','Resources'],['match','Match'],['patrol','Patrols'],['info','Info']]:[['packs','Packs'],['settle','Settlements'],['units','Units'],['res','Resources'],['realm','Realm'],['match','Match'],['patrol','Patrols'],['info','Info']];
  var TS=tutStep(),TH=TS&&TS.tab&&!S.match?TS.tab:(TS&&TS.enc&&!S.match?null:null);
  $('#tabs').innerHTML=T.map(function(t){return '<button class="btn'+(UI.tab===t[0]?' on':'')+(TH===t[0]&&UI.tab!==t[0]?' tuthint':'')+'" data-act="tab" data-tab="'+t[0]+'">'+t[1]+'</button>'}).join('');
}
function msgHtml(){return '<p class="msg'+(UI.bad?' bad':'')+'">'+esc(UI.msg)+'</p>'}


