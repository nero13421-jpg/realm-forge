/* 16-bit art: every sprite is drawn in half-unit pixels inside the same boxes the old art used */
var ART=(function(){var a={};['spear','axe','battle_axe','club','knife','shortbow','longbow','short_arrows','long_arrows','hide_armor','hide_shield','hide_helmet','o_armor','o_helmet','o_shield','rabbit','stag','boar','wolf','hawk','altar','lumber','gravel','red_crystal','gnosis','parch','setcard','tat_spiral','tat_antler','tat_serpent','tat_eye','tat_hand'].forEach(function(k){a[k]=ART16[k]});a.human={c:ART16.h_body.c,r:ART16.h_body.r.concat(ART16.h_legA.r)};return a})();
ART.stimber={c:{o:'#2a1a10',W:'#b0804e',w:'#8a6036',l:'#ecd09c',L:'#caa070'},r:ART16.lumber.r};ART.ltimber={c:{o:'#160e06',W:'#6a4020',w:'#4a2c14',l:'#b88a58',L:'#8a5e30'},r:ART16.lumber.r};
ART.rod_wood={"c": {"o": "#2a1a10", "W": "#b8864a", "w": "#e0bc80"}, "r": [["o", 2, 12, 3, 3], ["o", 3, 11, 3, 3], ["o", 4, 10, 3, 3], ["o", 5, 9, 3, 3], ["o", 6, 8, 3, 3], ["o", 7, 7, 3, 3], ["o", 8, 6, 3, 3], ["o", 9, 5, 3, 3], ["o", 10, 4, 3, 3], ["o", 11, 3, 3, 3], ["W", 3, 12.5, 1.5, 1.5], ["w", 3.5, 12, 1, 1], ["W", 4, 11.5, 1.5, 1.5], ["w", 4.5, 11, 1, 1], ["W", 5, 10.5, 1.5, 1.5], ["w", 5.5, 10, 1, 1], ["W", 6, 9.5, 1.5, 1.5], ["w", 6.5, 9, 1, 1], ["W", 7, 8.5, 1.5, 1.5], ["w", 7.5, 8, 1, 1], ["W", 8, 7.5, 1.5, 1.5], ["w", 8.5, 7, 1, 1], ["W", 9, 6.5, 1.5, 1.5], ["w", 9.5, 6, 1, 1], ["W", 10, 5.5, 1.5, 1.5], ["w", 10.5, 5, 1, 1], ["W", 11, 4.5, 1.5, 1.5], ["w", 11.5, 4, 1, 1], ["W", 12, 3.5, 1.5, 1.5], ["w", 12.5, 3, 1, 1], ["o", 11.5, 0.5, 4, 4], ["W", 12.5, 1.5, 2, 2], ["w", 12.5, 1.5, 1, 1]]};ART.rod_cu={"c": {"o": "#2a1a10", "W": "#b8864a", "w": "#e0bc80", "c": "#d8833a", "h": "#f6c48a"}, "r": [["o", 2, 12, 3, 3], ["o", 3, 11, 3, 3], ["o", 4, 10, 3, 3], ["o", 5, 9, 3, 3], ["o", 6, 8, 3, 3], ["o", 7, 7, 3, 3], ["o", 8, 6, 3, 3], ["o", 9, 5, 3, 3], ["o", 10, 4, 3, 3], ["o", 11, 3, 3, 3], ["W", 3, 12.5, 1.5, 1.5], ["w", 3.5, 12, 1, 1], ["W", 4, 11.5, 1.5, 1.5], ["w", 4.5, 11, 1, 1], ["W", 5, 10.5, 1.5, 1.5], ["w", 5.5, 10, 1, 1], ["W", 6, 9.5, 1.5, 1.5], ["w", 6.5, 9, 1, 1], ["W", 7, 8.5, 1.5, 1.5], ["w", 7.5, 8, 1, 1], ["W", 8, 7.5, 1.5, 1.5], ["w", 8.5, 7, 1, 1], ["W", 9, 6.5, 1.5, 1.5], ["w", 9.5, 6, 1, 1], ["W", 10, 5.5, 1.5, 1.5], ["w", 10.5, 5, 1, 1], ["W", 11, 4.5, 1.5, 1.5], ["w", 11.5, 4, 1, 1], ["W", 12, 3.5, 1.5, 1.5], ["w", 12.5, 3, 1, 1], ["o", 11, 0, 5, 5], ["c", 12, 1, 3, 3], ["h", 12, 1, 1.5, 1.5], ["o", 6.5, 6.5, 3, 3], ["c", 7, 7, 2, 2]]};ART.leather_greaves={"c": {"o": "#2a1a10", "L": "#8a4a2a", "l": "#b06a3a", "d": "#5a2e1a", "k": "#e8dec6"}, "r": [["o", 2, 2, 5, 13], ["o", 9, 2, 5, 13], ["L", 3, 3, 3, 11], ["L", 10, 3, 3, 11], ["l", 3, 3, 1, 11], ["l", 10, 3, 1, 11], ["d", 5, 3, 1, 11], ["d", 12, 3, 1, 11], ["k", 2, 5, 5, 1], ["k", 9, 5, 5, 1], ["k", 2, 10, 5, 1], ["k", 9, 10, 5, 1], ["d", 3, 13, 3, 1], ["d", 10, 13, 3, 1]]};
ART.ring_swift={"c": {"o": "#2a1a10", "c": "#d8833a", "h": "#f6c48a", "s": "#9a5420", "g": "#7ec8e8", "G": "#3a86b0", "w": "#ffffff"}, "r": [["o", 7, 2, 1, 1], ["o", 8, 2, 1, 1], ["o", 6, 3, 1, 1], ["g", 7, 3, 1, 1], ["g", 8, 3, 1, 1], ["o", 9, 3, 1, 1], ["o", 5, 4, 1, 1], ["g", 6, 4, 1, 1], ["g", 7, 4, 1, 1], ["g", 8, 4, 1, 1], ["g", 9, 4, 1, 1], ["o", 10, 4, 1, 1], ["o", 5, 5, 1, 1], ["o", 6, 5, 1, 1], ["G", 7, 5, 1, 1], ["G", 8, 5, 1, 1], ["o", 9, 5, 1, 1], ["o", 10, 5, 1, 1], ["o", 4, 6, 1, 1], ["o", 5, 6, 1, 1], ["h", 6, 6, 1, 1], ["o", 7, 6, 1, 1], ["o", 8, 6, 1, 1], ["c", 9, 6, 1, 1], ["o", 10, 6, 1, 1], ["o", 11, 6, 1, 1], ["o", 3, 7, 1, 1], ["o", 4, 7, 1, 1], ["h", 5, 7, 1, 1], ["h", 6, 7, 1, 1], ["c", 7, 7, 1, 1], ["c", 8, 7, 1, 1], ["c", 9, 7, 1, 1], ["c", 10, 7, 1, 1], ["o", 11, 7, 1, 1], ["o", 12, 7, 1, 1], ["o", 3, 8, 1, 1], ["h", 4, 8, 1, 1], ["h", 5, 8, 1, 1], ["h", 6, 8, 1, 1], ["o", 7, 8, 1, 1], ["o", 8, 8, 1, 1], ["c", 9, 8, 1, 1], ["c", 10, 8, 1, 1], ["c", 11, 8, 1, 1], ["o", 12, 8, 1, 1], ["o", 3, 9, 1, 1], ["h", 4, 9, 1, 1], ["h", 5, 9, 1, 1], ["o", 6, 9, 1, 1], ["o", 9, 9, 1, 1], ["c", 10, 9, 1, 1], ["c", 11, 9, 1, 1], ["o", 12, 9, 1, 1], ["o", 3, 10, 1, 1], ["c", 4, 10, 1, 1], ["c", 5, 10, 1, 1], ["o", 6, 10, 1, 1], ["o", 9, 10, 1, 1], ["c", 10, 10, 1, 1], ["c", 11, 10, 1, 1], ["o", 12, 10, 1, 1], ["o", 3, 11, 1, 1], ["c", 4, 11, 1, 1], ["c", 5, 11, 1, 1], ["o", 6, 11, 1, 1], ["o", 9, 11, 1, 1], ["s", 10, 11, 1, 1], ["s", 11, 11, 1, 1], ["o", 12, 11, 1, 1], ["o", 3, 12, 1, 1], ["c", 4, 12, 1, 1], ["c", 5, 12, 1, 1], ["c", 6, 12, 1, 1], ["c", 7, 12, 1, 1], ["c", 8, 12, 1, 1], ["s", 9, 12, 1, 1], ["s", 10, 12, 1, 1], ["s", 11, 12, 1, 1], ["o", 12, 12, 1, 1], ["o", 4, 13, 1, 1], ["c", 5, 13, 1, 1], ["c", 6, 13, 1, 1], ["c", 7, 13, 1, 1], ["c", 8, 13, 1, 1], ["s", 9, 13, 1, 1], ["s", 10, 13, 1, 1], ["o", 11, 13, 1, 1], ["o", 5, 14, 1, 1], ["o", 6, 14, 1, 1], ["c", 7, 14, 1, 1], ["c", 8, 14, 1, 1], ["o", 9, 14, 1, 1], ["o", 10, 14, 1, 1], ["o", 7, 15, 1, 1], ["o", 8, 15, 1, 1], ["w", 7, 3, 1, 1]]};ART.ring_endur={c:Object.assign({},ART.ring_swift.c,{g:'#7ccc7a',G:'#3e8a40'}),r:ART.ring_swift.r};ART.ring_str={c:Object.assign({},ART.ring_swift.c,{g:'#e05a46',G:'#9a2a20'}),r:ART.ring_swift.r};
/* recolours for the variants: copper heads, pine wood, cow leather, oak, the orange crystal */
(function(){var rc=function(base,map){var a=ART[base];if(!a)return null;var c={};Object.keys(a.c).forEach(function(k){c[k]=map[k]||a.c[k]});return{c:c,r:a.r}};
  var LEA={A:'#8a4a2a',a:'#5a2e1a',u:'#b06a3a',W:'#8a4a2a',w:'#5a2e1a',R:'#4a2414'},OAK={A:'#9a6a38',a:'#6a4424',u:'#c8945a',W:'#9a6a38',w:'#6a4424',R:'#4a2e18'};
  ART.leather_armor=rc('hide_armor',LEA);ART.leather_helmet=rc('hide_helmet',LEA);ART.leather_shield=rc('hide_shield',LEA);ART.oak_helmet=rc('hide_helmet',OAK);ART.oak_shield=rc('hide_shield',OAK);
  ART.orange_crystal=rc('red_crystal',{o:'#3a1e0a',R:'#f08a2a',r:'#ffd09a',D:'#a8501a'});
  var CU={g:'#f0a868',G:'#a85a2a',H:'#f4b880',h:'#d8833a',F:'#9a5420'},PINE={w:'#dcb878',W:'#a07c44',T:'#c89858',t:'#e0bc80',D:'#8a6a3a'};
  WTYPES.forEach(function(t){(HEADED[t]?['fl','cu']:['-']).forEach(function(hd){['oak','pine'].forEach(function(wd){var k=wvar(t,hd,wd);if(k===t||ART[k])return;var m={};if(hd==='cu')Object.keys(CU).forEach(function(x){m[x]=CU[x]});if(wd==='pine')Object.keys(PINE).forEach(function(x){m[x]=PINE[x]});ART[k]=rc(t,m)})})})})();
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

function stackOf(list){var o=[],by={};list.forEach(function(c){if(c.key==='human'||c.boon){o.push([c]);return}var g=by[c.key];if(!g){g=by[c.key]=[];o.push(g)}g.push(c)});return o}
function tagsHtml(list,o){o=o||{};return stackOf(list).map(function(g){var c=g[0];if(AMMO_WT[c.key])c=g.slice().sort(function(a,b){return (b.n===undefined?20:b.n)-(a.n===undefined?20:a.n)})[0];return tagHtml(c,{grp:g,act:typeof o.act==='function'?o.act(c):o.act,sel:o.sel,fresh:o.fresh})}).join('')}
function tagHtml(c,o){
  o=o||{};
  var k=kindOf(c),st='',g=o.grp&&o.grp.length>1?o.grp:null;
  if(c.key==='human')st='HP '+stats(c).hp+' · Mana '+(c.mana||1)+(c.gnosis?' · Gnosis '+c.gnosis:'')+(c.spells&&c.spells.length?' · '+c.spells.map(function(x){return SPELL[x].n}).join(', '):'');
  else if(k==='parch')st=MAGIC_SCHOOL+' · '+SPELL[c.key].t+' · one use';
  else if(WEAP[wkey(c.key)]&&WEAP[wkey(c.key)].rod)st='spells +'+Math.round(WEAP[wkey(c.key)].rod*100)+'% range and impact · must be his primary carry · '+wtOf(c.key)+' lb';
  else if(WEAP[wkey(c.key)]){var wm=wmat(c.key),base=WEAP[wkey(c.key)].dmg*(wm.hd?HEADS[wm.hd].mul:1);st=Math.round(base)+' dmg'+(wm.hd==='cu'?' · ×1.25 vs men':wm.hd==='fl'?' · ×1.25 vs beasts':'')+' · '+wtOf(c.key)+' lb'+(c.wear?' · sharp '+Math.round(sharpOf(c)*100)+'%':'')}
  else if(AMMO_WT[wkey(c.key)])st=(c.wear?'sharp '+Math.round(sharpOf(c)*100)+'% · ':'')+(g?g.reduce(function(t,x){return t+(x.n===undefined?20:x.n)},0)+' arrows in all':(c.n===undefined?20:c.n)+' arrows')+' · '+AMMO_WT[wkey(c.key)]+' lb a quiver · '+(wkey(c.key)==='long_arrows'?'long bow':'short bow')+(wmat(c.key).hd==='cu'?' · ×1.25 vs men':' · ×1.25 vs beasts');
  else if(TIMB[c.key])st=(g?g.reduce(function(t,x){return t+(x.n==null?TIMB_N:x.n)},0)+' timbers in all':(c.n==null?TIMB_N:c.n)+' timbers')+' · for palisades, gates and towers';
  else if(ARM[c.key])st='−'+ARM[c.key].def+' per hit'+(ARM[c.key].dodge?' · +'+ARM[c.key].dodge+'% dodge':'')+' · '+ARM[c.key].wt+' lb';
  else if(k==='terrain')st=cardCost(c.key)+' prestige';
  else if(k==='crystal')st='+'+(CRYSTAL[c.key]||1)+' mana, for good';
  else if(k==='ring')st=RING[c.key].t+' · copper';
  else if(k==='tattoo')st=TATTOO[c.key].t+' of his stats when applied, then fixed';
  if(c.boon&&c.key!=='human')st+=(st?' · ':'')+'blessed: '+resText(c);
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


