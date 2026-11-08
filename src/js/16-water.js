/* ---------- water ----------
   Water only runs downhill (level is fine). A stream starts anywhere and must end in a body of water: a pond, a swamp,
   small open water or a creek. A creek, twice a stream's width, must start in a body of water and end in one. Ponds
   never touch ponds. Small open water needs water flowing in. A pond, swamp or open water standing above land next to
   it must have an outlet: a stream or creek running out of it. Cultivated fields need water within two tiles. */
var WATERK={pond:1,swamp:1,water:1};
function waterHex(k){return k!=null&&k>=0&&!!WATERK[S.grid[k]]}
function nearCreek(p,skip){return (S.lines||[]).some(function(l){if(l.type!=='creek'||l===skip)return false;for(var i=1;i<l.pts.length;i++)if(segDist(p[0],p[1],l.pts[i-1],l.pts[i])<1.2)return true;return false})}
function flowBad(pts){/* where a line would climb, and by how much */var low=null,i,j,bad=null;for(i=0;i<pts.length;i++){var a=pts[Math.max(0,i-1)],b=pts[i],n=i?Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1]))):1;for(j=1;j<=n;j++){var x=a[0]+(b[0]-a[0])*j/n,y=a[1]+(b[1]-a[1])*j/n,h=heightAt(x,y);if(h==null)continue;if(low==null||h<low)low=h;else if(h>low+1.5&&(!bad||h-low>bad.rise))bad={at:bad?bad.at:[x,y],rise:Math.round(h-low)}}}return bad}
function lineRuleMsg(type,pts){var a=pts[0],z=pts[pts.length-1],ka=hexAtXY(a[0],a[1]),kz=hexAtXY(z[0],z[1]);
  if(type==='creek'&&!waterHex(ka))return 'A creek has to start in a body of water: a pond, a swamp or small open water.';
  if(type==='creek'&&(!waterHex(kz)||kz===ka))return 'A creek has to end in another body of water.';
  if(type==='stream'&&!waterHex(kz)&&!nearCreek(z))return 'A stream has to end in a body of water: a pond, a swamp, small open water or a creek.';
  var fb=flowBad(pts);if(fb){var fk=hexAtXY(fb.at[0],fb.at[1]);return 'Water only runs downhill. This line climbs '+fb.rise+' m near '+lab(fk%COLS,Math.floor(fk/COLS))+'.'}
  return ''}
function waterState(){/* which water tiles are fed, which need an outlet, and which tiles count as a water source */
  var N=S.grid.length,fed={},outl={},src={},probs=[],k;
  (S.lines||[]).forEach(function(l){if(!isFlow(l))return;var z=l.pts[l.pts.length-1],a=l.pts[0];fed[hexAtXY(z[0],z[1])]=1;outl[hexAtXY(a[0],a[1])]=1;l.hexes.forEach(function(h){src[h]=1})});
  for(var it=0;it<4;it++)for(k=0;k<N;k++){if(S.grid[k]!=='water'||fed[k])continue;var c=k%COLS,r=Math.floor(k/COLS),hk=hgtAt(k);nbrs(c,r).forEach(function(p){var m=ix(p[0],p[1]);if((S.grid[m]==='pond'||S.grid[m]==='swamp'||fed[m])&&hgtAt(m)&&hk&&hgtAt(m).b>=hk.b)fed[k]=1})}
  for(k=0;k<N;k++){var g=S.grid[k];if(!WATERK[g])continue;var c2=k%COLS,r2=Math.floor(k/COLS),h2=hgtAt(k),ok=true;
    if(g==='water'&&!fed[k]){probs.push({k:k,m:'Small open water at '+lab(c2,r2)+' has nothing flowing in. Run a stream or creek into it, or set it beside a pond or swamp at its level or higher.'});ok=false}
    var lower=h2&&nbrs(c2,r2).some(function(p){var m=ix(p[0],p[1]),hm=hgtAt(m);return hm&&S.grid[m]!==undefined&&(S.grid[m]||setAt(p[0],p[1]))&&hm.b<h2.b-4});
    if(lower&&!outl[k]){probs.push({k:k,m:TERR[g].n+' at '+lab(c2,r2)+' stands above the land beside it and needs an outlet: a stream or creek running out of it.'});ok=false}
    if(ok)src[k]=1}
  return{fed:fed,src:src,probs:probs}}
function waterNear(c,r,W){W=W||waterState();for(var k in W.src){var kk=+k;if(hexDist([c,r],[kk%COLS,Math.floor(kk/COLS)])<=2)return true}return false}
function waterPanel(){var W=waterState();return W.probs.length?'<div class="msg bad"><b>Water · '+W.probs.length+' to fix</b><br>'+W.probs.map(function(p){return esc(p.m)}).join('<br>')+'<br>Until it is fixed it does not count as water for farms.</div>':''}
function waterMarks(){if(S.match)return '';var W=waterState();return W.probs.map(function(p){var q=center(p.k%COLS,Math.floor(p.k/COLS));return '<g pointer-events="none"><circle class="wprob" cx="'+q[0].toFixed(1)+'" cy="'+(q[1]-13).toFixed(1)+'" r="6"/><text class="wprobt" x="'+q[0].toFixed(1)+'" y="'+(q[1]-10).toFixed(1)+'">!</text></g>'}).join('')}
var FALL_G=.45;/* a drop steeper than 45% is a fall */
function fallRuns(l){var P=l.pts,st=.35,runs=[],cur=null,i,j;for(i=1;i<P.length;i++){var a=P[i-1],b=P[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/st)),h0=heightAt(a[0],a[1]);
  for(j=1;j<=n;j++){var x=a[0]+(b[0]-a[0])*j/n,y=a[1]+(b[1]-a[1])*j/n,h=heightAt(x,y),g=h0!=null&&h!=null?(h0-h)/(L/n*MPU):0,px=a[0]+(b[0]-a[0])*(j-1)/n,py=a[1]+(b[1]-a[1])*(j-1)/n;
    if(g>FALL_G){if(!cur){cur={p:[[px,py]],drop:0};runs.push(cur)}cur.p.push([x,y]);cur.drop+=h0-h}else cur=null;h0=h}}
  return runs.filter(function(r){return r.drop>=2})}
function fallsSvg(l){var w=l.type==='creek'?1:.55;return fallRuns(l).map(function(r){var pts=r.p.map(function(p){return p[0].toFixed(2)+','+p[1].toFixed(2)}).join(' '),z=r.p[r.p.length-1];
  return '<g class="falls"><title>Waterfall · '+Math.round(r.drop)+' m drop</title><polyline class="ln fall-b" points="'+pts+'" style="stroke-width:'+(3.6*w*1.5).toFixed(1)+'"/><polyline class="ln fall-w" points="'+pts+'" style="stroke-width:'+(3*w*1.5).toFixed(1)+'"/><polyline class="ln fall-w f2" points="'+pts+'" style="stroke-width:'+(1.6*w*1.5).toFixed(1)+'"/>'+
    '<circle class="fall-m" cx="'+z[0].toFixed(2)+'" cy="'+z[1].toFixed(2)+'" r="'+(2.6*w*1.5).toFixed(1)+'"/><circle class="fall-m m2" cx="'+z[0].toFixed(2)+'" cy="'+z[1].toFixed(2)+'" r="'+(1.7*w*1.5).toFixed(1)+'"/></g>'}).join('')}
function linesSvg(){
  var o='';
  (S.lines||[]).slice().sort(function(a,b){return (a.type==='bridge')-(b.type==='bridge')}).forEach(function(l){
    var pts=l.pts.map(function(p){return p[0]+','+p[1]}).join(' ');
    if(l.type==='bridge'){var bp=l.pts[0];o+='<g class="ln bridge" transform="translate('+bp[0]+' '+bp[1]+') rotate('+((l.a||0)+90)+')'+(l.m?' scale(1.7 1.5)':'')+'"><rect x="-7" y="-2.6" width="14" height="5.2" class="br-deck"/><line x1="-7" y1="-2.6" x2="7" y2="-2.6" class="br-rail"/><line x1="-7" y1="2.6" x2="7" y2="2.6" class="br-rail"/><line x1="-2.3" y1="-2.6" x2="-2.3" y2="2.6" class="br-plank"/><line x1="2.3" y1="-2.6" x2="2.3" y2="2.6" class="br-plank"/></g>';return}
    if(l.type==='wall'||l.type==='gate'||l.type==='tower')return;
    if(l.type==='road'){o+='<polyline class="ln road-o" points="'+pts+'"/><polyline class="ln road-i" points="'+pts+'"/>';if(l.name){var mi=Math.floor((l.pts.length-1)/2),pa=l.pts[mi],pb=l.pts[mi+1]||pa;o+='<text class="roadlab" x="'+((pa[0]+pb[0])/2).toFixed(1)+'" y="'+((pa[1]+pb[1])/2-5).toFixed(1)+'">'+esc(l.name)+'</text>'}}
    else if(l.type==='creek')o+='<polyline class="ln creek-o" points="'+pts+'"/><polyline class="ln creek-i" points="'+pts+'"/>'+fallsSvg(l);
    else o+='<polyline class="ln stream-o" points="'+pts+'"/><polyline class="ln stream-i" points="'+pts+'"/>'+fallsSvg(l);
  });
  return o;
}
function drawPreviewSvg(pr){
  var D=UI.draw;if(!D)return '';if(D.type==='wall')return (D.segs||[]).concat([D.pts]).map(function(P){return P.length?'<polyline class="ln draw-wall" points="'+P.map(function(p){return p[0]+','+p[1]}).join(' ')+'"/>'+P.map(function(p){return '<circle class="ln draw-pt" cx="'+p[0]+'" cy="'+p[1]+'" r="'+(pr||3)*.6+'"/>'}).join(''):''}).join('');if(!D.pts.length)return '';
  var pts=D.pts.map(function(p){return p[0]+','+p[1]}).join(' ');
  return '<polyline class="ln draw-'+D.type+'" points="'+pts+'"/>'+D.pts.map(function(p){return '<circle class="ln draw-pt" cx="'+p[0]+'" cy="'+p[1]+'" r="'+(pr||3)+'"/>'}).join('');
}
function finishLine(extra){
  var DR=UI.draw;if(!DR||DR.pts.length<2)return render();var hxs=lineHexes(DR.pts),LD=LINE[DR.type],lm=lineShort(DR.type,hxs.length);
  if(DR.type!=='road'){var wm=lineRuleMsg(DR.type,DR.pts);if(wm){if(extra)DR.pts.pop();say(wm,true);return render()}}
  if(lm.length){if(extra)DR.pts.pop();say('Short on '+lm.join(', ')+'. This '+LD.n.toLowerCase()+' costs '+lineCostText(DR.type,hxs.length)+'.',true);return render()}
  S.prestige-=LD.cost*hxs.length;payMats(lineMats(DR.type,hxs.length));if(DR.type==='road')payLabor(hxs.length);
  var nl={type:DR.type,pts:DR.pts,hexes:hxs};if(DR.type==='road')nl.name='Road '+(S.lines.filter(function(l){return l.type==='road'}).length+1);S.lines.push(nl);UI.zoom=null;say(LD.n+' laid across '+hxs.length+' tile'+(hxs.length===1?'':'s')+'.'+(extra||'')+' Spent '+lineCostText(DR.type,hxs.length)+'.');UI.draw=null;save();return render();
}
function drawPanel(){
  var D=UI.draw,hx=D.pts.length?lineHexes(D.pts):[],cost=lineCostText(D.type,hx.length||null),miss=D.pts.length>=2?lineShort(D.type,hx.length):[];
  return '<p class="note">Tap the map to lay down points. Zoom in for precision. The '+LINE[D.type].n.toLowerCase()+' runs straight from point to point, wherever you click. '+D.pts.length+' point'+(D.pts.length===1?'':'s')+' · crosses '+hx.length+' tile'+(hx.length===1?'':'s')+' · costs '+cost+(D.type==='stream'?'. A stream that reaches a pond ends there.':'')+'</p>'+(miss.length?'<p class="msg bad">Short on '+miss.join(', ')+'.</p>':'')+
    '<div class="row"><button class="btn sm go" data-act="dfinish"'+(D.pts.length>=2?'':' disabled')+'>Finish '+LINE[D.type].n.toLowerCase()+'</button><button class="btn sm" data-act="dundo"'+(D.pts.length?'':' disabled')+'>Undo point</button><button class="btn sm" data-act="dcancel">Cancel</button></div>';
}
