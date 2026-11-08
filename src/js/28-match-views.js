/* ---------- match views ---------- */
function terrName(c,r){var s=setAt(c,r),t=terrAt(c,r);return s?SETT[s.type].n:t?TERR[t].n:'Open ground'}
function mobDesc(m){
  if(m.type==='goblin')return m.mobs.length+' goblins, 50 hp each';
  if(m.type==='pigger')return 'a pigger, '+(m.mobs[0]?Math.round(m.mobs[0].hp):300)+' hp';
  if(m.type==='tiggle'){var nb=m.mobs.filter(function(b){return b.w==='bow'}).length;return m.mobs.length+' tiggles ('+nb+' little bows, '+(m.mobs.length-nb)+' daggers)'}
  var w={};m.mobs.forEach(function(b){w[b.w]=(w[b.w]||0)+1});
  return m.mobs.length+' brigands ('+Object.keys(w).map(function(k){return CD[k].n.toLowerCase().replace('self ','')+' '+w[k]}).join(', ')+')';
}
function tileFacts(c,r){
  var f=[],t=terrAt(c,r),s=setAt(c,r),k=ix(c,r),M=S.match;
  f.push(terrName(c,r)+' · '+(M.mine[k]?'your tile':'wild tile'));if(hgtAt(k))f.push(elevText(hgtAt(k)));
  var road=roadSet()[k],str=(S.lines||[]).some(function(l){return l.type==='stream'&&l.hexes.indexOf(k)>=0});
  var rdn=(S.lines||[]).filter(function(l){return l.type==='road'&&l.hexes.indexOf(k)>=0&&l.name}).map(function(l){return l.name});f.push(t==='pond'?'Blocks the way':'Travel speed ×'+hexSpeed(k)+(road?' ('+(rdn.length?rdn.join(', '):'gravel road')+', for units marching in a file)':''));
  if(str)f.push('A stream runs through here. Crossing it takes 2 minutes.');
  if(s)f.push(atSet(s.id).filter(function(h){return h.key==='human'}).length+' humans live here');
  M.camps.forEach(function(m){
    var home=m.hexes.indexOf(k)>=0,here=m.roam&&m.mobs.length&&m.pos&&ix(m.pos[0],m.pos[1])===k,nm=mobWord(m,0,1);
    if(home){
      if(m.razed)f.push(nm+' camp · burned'+(m.mobs.length?' · '+m.mobs.length+' of its mobs still roam':''));
      else if(!m.mobs.length)f.push(nm+' camp · its mobs are dead · still standing: burn it for +'+m.reward+' prestige and loot');
      else if(m.roam)f.push(nm+' camp · '+m.mobs.length+' have left to explore · the camp is empty: burn it for +'+m.reward+' prestige and loot');
      else f.push(nm+' camp · '+mobDesc(m)+' · reward +'+m.reward+' · '+(M.clock<raidAt()?'holds base range for '+mmss(raidAt()-M.clock)+' more':'about to leave'));
    }
    if(here)f.push('Roaming '+nm.toLowerCase()+' party here · '+mobDesc(m));
  });
  return f;
}
function pushRaid(r){UI.raids=UI.raids||[];UI.raids.unshift(r);if(UI.raids.length>8)UI.raids.length=8}
function raidBtns(){return UI.raids&&UI.raids.length?'<h3>Battles</h3><div class="row">'+UI.raids.map(function(r,i){return '<button class="btn sm" data-act="watch" data-i="'+i+'">Watch '+esc(r.at+' '+r.title)+'</button>'}).join('')+'</div>':''}
function vMatchStart(){
  var fp=footprint(),hs=S.cards.filter(function(h){return h.key==='human'&&h.at!==null}).length,d=fp.n?worldDims(fp,UI.mshare):null,can=S.setl.length&&hs&&fp.n;
  var R=UI.mres,res='';
  if(R)res='<section class="panel"><div class="verdict '+(R.out==='won'?'win':R.out==='lost'?'lose':'')+'">'+R.title+'</div><p class="note">'+esc(R.summary)+'</p><div class="log">'+R.log.map(function(l){return '<div><b>'+l.t+'</b><span class="'+(l.c||'')+'">'+esc(l.m)+'</span></div>'}).join('')+'</div>'+raidBtns()+replayPanel()+'</section>';
  return '<section class="panel"><h2>Match</h2>'+
    '<p class="note">Pick a match type. Your placed tiles become 25% or 50% of a new world and the rest is generated at random. Goblin camps form in 10 contiguous swamp hexes, brigand camps in 10 contiguous woodland and swamp hexes, always in the generated land. Clear every mob to win. You lose if every settlement falls or every human dies. There is no time limit. For the first 5 minutes the mobs stay in their base range, then they set out to explore and attack.</p>'+
    '<div class="tblwrap"><table><tr><th>Placed tiles</th><th>World</th><th>Your share</th><th>Settlements</th><th>Humans housed</th></tr><tr class="mono"><td>'+fp.n+'</td><td>'+(d?d.W+' × '+d.H+' = '+(d.W*d.H):'—')+'</td><td>'+(d?Math.round(fp.n/(d.W*d.H)*100)+'%':'—')+'</td><td>'+S.setl.length+'</td><td>'+hs+'</td></tr></table></div>'+
    (can?'':'<p class="msg bad">Place a settlement and house at least one human in it first.</p>')+msgHtml()+
    '<p class="label">Match type</p><div class="row"><button class="btn sm'+(UI.mshare===.25?' on':'')+'" data-act="mshare" data-v="25">25% yours · wide world</button><button class="btn sm'+(UI.mshare===.5?' on':'')+'" data-act="mshare" data-v="50">50% yours · compact world</button></div><div class="row"><button class="btn go" data-act="startm"'+(can?'':' disabled')+'>Start match</button></div>'+
    '<p class="note">The match plays on a copy of your realm. When it ends, win, lose or abandoned, the match world is gone and your realm comes back exactly as it was before, plus any prestige you earned clearing mobs.</p></section>'+res;
}
function plannerHtml(R,st){
  return '<div class="upanel"><h3>Patrol planner</h3><p class="note">Pick a patrol or make a new one, then draw its moves right on the map above. Tap Whole map to plan outside your own land.</p>'+routeListHtml(R)+(R?routeEditor(R,st):'')+'</div>';
}
function fold(k,title,body,cls){var f=UI.mfold||{},shut=!!f[k];return '<div class="fold'+(shut?' shut':'')+(cls?' '+cls:'')+'"><button class="foldh" data-act="mfold" data-k="'+k+'" aria-expanded="'+(!shut)+'"><span>'+title+'</span><i>'+(shut?'▸':'▾')+'</i></button><div class="foldb"'+(shut?' hidden':'')+'>'+body+'</div></div>'}
var MFOLDS=['bf','map','stat','units','plan','battles','tile','log'];
function matchPop(){var tl=UI.tile;if(!tl)return '';var c=tl[0],r=tl[1],cam=UI.pz&&UI.pz.m,deep=deepSet('m')[ix(c,r)];
  return tilePopHtml(c,r,'<ul class="facts">'+tileFacts(c,r).map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>'+razeRow(c,r)+'<div class="row">'+(deep?'':'<button class="btn sm go" data-act="pzgo" data-k="m" data-c="'+c+'" data-r="'+r+'">Zoom in here</button>')+'<button class="btn sm" data-act="topatrols">Plan a march to '+lab(c,r)+'</button></div>')}
var MFOLDS=['map','stat','units','plan','battles','log'];
function vMatch(){
  var M=S.match;if(!M)return vMatchStart();
  var PR=UI.medit?routeById(UI.R):null,pst=setById(UI.Rfrom)||S.setl[0],ppf=PR?routePreview(PR,pst):{route:[]};
  var PU0=unitById(UI.mu),PR0=PR||(PU0?routeById(planRoot(PU0)?planRoot(PU0).route:PU0.route):null),PLY=isPlay(PR0)||(PR&&UI.medit)?{R:PR0,home:planHome(PR0,planUnit(PR0))}:null;
  var sv=UI.mview==='mine'?mapSvg({crop:true,vis:function(c,r){return M.mine[ix(c,r)]},sel:UI.leg?null:UI.tile,route:ppf.route,pz:'m',play:PLY}):mapSvg({world:true,mineRing:true,sel:UI.leg?null:UI.tile,route:ppf.route,pz:'m',play:PLY});
  var allShut=MFOLDS.every(function(k){return (UI.mfold||{})[k]});
  return '<section class="panel" id="mappanel"><div class="row" style="justify-content:space-between"><h2>Match</h2>'+speedBar()+'</div>'+
    '<div class="row"><button class="btn sm'+(UI.mview==='mine'?' on':'')+'" data-act="mview" data-v="mine">My terrain</button><button class="btn sm'+(UI.mview==='all'?' on':'')+'" data-act="mview" data-v="all">Whole map</button></div>'+
    mapView(sv,'m',(UI.medit&&PR?planOver(PR):'')+(UI.leg||UI.tsel!=null&&UI.medit?'':matchPop())+bdockHtml()+pipHtml(),UI.medit&&PR?planBar(PR):'')+
    '<p class="note">Drag to move around, scroll or pinch to zoom, or tap a tile and press Zoom in here. Zoomed in, each tile opens up as the ground a fight would happen on, and a fight plays out right there on the map. '+(UI.mview==='all'?'Gold outlines mark your tiles.':'')+'</p>'+legend()+'</section>'+
    '<div class="row foldall"><button class="btn sm" data-act="mfoldall">'+(allShut?'Expand everything':'Collapse everything')+'</button></div>'+
    '<div class="split"><section class="panel">'+
    fold('stat','<h3 id="mphase">'+(M.clock<raidAt()?'Mobs hold their base range for '+mmss(raidAt()-M.clock)+' more.':'Mobs are exploring and aggressive.')+'</h3>','<div class="tblwrap" id="mstat">'+mstatHtml()+'</div>')+
    fold('units','<h3>Units</h3>','<div id="ulive">'+unitListHtml()+'</div><div class="upanel">'+unitPanel()+'</div>')+
    fold('battles','<h3>Battles</h3>','<div class="row" id="battles">'+raidList()+'</div>')+'</section>'+
    '<section class="panel">'+fold('plan','<h3>Patrol planner</h3>','<div class="row"><button class="btn sm'+(UI.medit?' on':'')+'" data-act="medit">'+(UI.medit?'Close patrol planner':'Plan patrols here')+'</button></div>'+(UI.medit?plannerHtml(PR,pst):''))+
    fold('log','<h3>Events</h3>','<div class="log" id="mloglist">'+logHtml()+'</div>')+
    '<div class="row"><button class="btn sm'+(UI.confirm?' on':'')+'" data-act="abandon">'+(UI.confirm?'Confirm abandon':'Abandon match')+'</button></div></section></div>';
}

