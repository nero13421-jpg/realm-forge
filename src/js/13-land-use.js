/* ---------- land use ----------
   Villages and camps burn firewood; villages also need specialty food (orchards for now); every pasture needs half a
   prairie for fodder and hay. A supply tile counts if it is within an hour's walk, and each tile serves one claimant. */
var WOOD={forest:1.5,woodland:1,pwood:.75,pforest:.75,swamp:.5},SPEC={orchard:1},NEED={village:{fire:8,spec:3},camp:{fire:2}},WALK_S=3600,PRAIRIE_CAP=2;
/* seconds to walk from a set of hexes to every hex within an hour, over placed ground (roads faster, slopes slower) */
function walkFrom(src){var N=COLS*ROWS,T=new Float64Array(N).fill(Infinity),done=new Uint8Array(N),RS=roadSet(),q=[];src.forEach(function(k){T[k]=0;q.push(k)});
  var spd=function(k){if(!placedAt(k%COLS,Math.floor(k/COLS)))return 0;return S.grid[k]?(RS[k]?ROAD_SP:TERR[S.grid[k]].sp):1};
  while(q.length){var bi=0;for(var j=1;j<q.length;j++)if(T[q[j]]<T[q[bi]])bi=j;var k=q.splice(bi,1)[0];if(done[k])continue;done[k]=1;var s1=spd(k)||1,h1=hgtAt(k),c=k%COLS,r=Math.floor(k/COLS);
    nbrs(c,r).forEach(function(p){var m=ix(p[0],p[1]);if(done[m])return;var s2=spd(m);if(!s2)return;var h2=hgtAt(m),gr=h1&&h2?((h2.b+(h2.r||0)/2)-(h1.b+(h1.r||0)/2))/(HEX_YD*.9144):0,G=gradeMul(gr),
      t=(HEX_YD/2)/(PACE.walk*s1)+(HEX_YD/2)/(PACE.walk*s2);t=G.cap!=null?Math.max(t,HEX_YD/G.cap):t/G.m;var nt=T[k]+t;if(nt<T[m]&&nt<=WALK_S){T[m]=nt;q.push(m)}})}
  return T}
function setHexes(s){return [ix(s.c,s.r)].concat(s.c2!=null?[ix(s.c2,s.r2)]:[])}
/* who gets which tile: settlements in the order they were founded take the nearest free tiles they need, then pastures take prairie */
var SUPC=null;
function supply(){var key=COLS+'|'+S.grid.join(',')+'|'+(S.hgt||[]).map(function(h){return h?h.b+'.'+(h.r||0):''}).join(',')+'|'+S.setl.map(function(x){return x.id+'.'+x.type+'.'+x.c+'.'+x.r}).join(',')+'|'+(S.lines||[]).filter(function(l){return l.type==='road'}).map(function(l){return l.hexes.join('.')}).join(';');if(SUPC&&SUPC.k===key)return SUPC.v;var v=supply0();SUPC={k:key,v:v};return v}
function supply0(){var N=COLS*ROWS,used={},prc={},out={set:{},past:{},claim:{}},k;
  S.setl.forEach(function(st){var nd=NEED[st.type];if(!nd)return;var T=walkFrom(setHexes(st)),R={fire:0,spec:0,need:nd,tiles:[]};
    var near=[];for(k=0;k<N;k++)if(T[k]<Infinity&&!used[k]&&(WOOD[S.grid[k]]||SPEC[S.grid[k]])&&!setAt(k%COLS,Math.floor(k/COLS)))near.push(k);near.sort(function(a,b){return T[a]-T[b]});
    near.forEach(function(k2){var g=S.grid[k2];if(nd.fire&&WOOD[g]&&R.fire<nd.fire){R.fire+=WOOD[g];used[k2]=1;R.tiles.push(k2);out.claim[k2]={by:st.id,kind:'fire'}}else if(nd.spec&&SPEC[g]&&R.spec<nd.spec){R.spec+=SPEC[g];used[k2]=1;R.tiles.push(k2);out.claim[k2]={by:st.id,kind:'spec'}}});
    R.ok=R.fire>=(nd.fire||0)-1e-9&&R.spec>=(nd.spec||0);out.set[st.id]=R});
  for(k=0;k<N;k++){if(S.grid[k]!=='pasture')continue;var T2=walkFrom([k]),best=-1;for(var m=0;m<N;m++)if(S.grid[m]==='field'&&!used[m]&&T2[m]<Infinity&&(prc[m]||0)<PRAIRIE_CAP&&(best<0||T2[m]<T2[best]))best=m;
    if(best>=0){prc[best]=(prc[best]||0)+1;out.past[k]={ok:true,by:best};out.claim[best]={by:'p',kind:'prairie',n:prc[best]}}else out.past[k]={ok:false}}
  return out}
function supplyPanel(){if(S.match||S.tut)return '';var SU=supply(),rows=[];
  S.setl.forEach(function(st){var R=SU.set[st.id];if(!R)return;rows.push('<div class="row suprow'+(R.ok?'':' bad')+'"><button class="btn sm'+(UI.supSel===st.id?' on':'')+'" data-act="supsel" data-id="'+st.id+'">'+esc(setName(st))+'</button><span>'+SETT[st.type].n+' · firewood <b>'+(Math.round(R.fire*100)/100)+'/'+R.need.fire+'</b>'+(R.need.spec?' · orchards <b>'+R.spec+'/'+R.need.spec+'</b>':'')+(R.ok?' ✓':' · short')+'</span></div>')});
  var ps=Object.keys(SU.past),pk=ps.filter(function(k){return SU.past[k].ok}).length;
  if(ps.length)rows.push('<div class="row suprow'+(pk<ps.length?' bad':'')+'"><button class="btn sm'+(UI.supSel==='p'?' on':'')+'" data-act="supsel" data-id="p">Pastures</button><span>'+pk+' of '+ps.length+' fed by prairie (1 field feeds 2)'+(pk<ps.length?' · '+(ps.length-pk)+' short':' ✓')+'</span></div>');
  return '<p class="label">Land use · within an hour\'s walk, one claim per tile</p>'+(rows.join('')||'<p class="note">Hamlets need nothing extra. Villages need 8 firewood and 3 orchards; camps 2 firewood; every pasture half a prairie.</p>')+(UI.supSel!=null?'<p class="note">Rings on the map: brown feeds firewood, red an orchard, yellow a prairie. Firewood: oak forest 1.5, oak woodland 1, pine 0.75, swamp peat 0.5.</p>':'')}
function supplyMarks(){if(S.match||UI.supSel==null||UI.tab!=='realm')return '';var SU=supply(),o='';Object.keys(SU.claim).forEach(function(k){var C=SU.claim[k];if(UI.supSel==='p'?C.kind!=='prairie':C.by!==UI.supSel)return;o+='<polygon class="sup-ring sup-'+C.kind+'" points="'+hexPts(k%COLS,Math.floor(k/COLS),.86)+'"/>'});
  if(UI.supSel==='p')Object.keys(SU.past).forEach(function(k){o+='<polygon class="sup-ring sup-past'+(SU.past[k].ok?'':' bad')+'" points="'+hexPts(k%COLS,Math.floor(k/COLS),.86)+'"/>'});
  else{var st=setById(UI.supSel);if(st)setHexes(st).forEach(function(k){o+='<polygon class="sup-ring sup-home" points="'+hexPts(k%COLS,Math.floor(k/COLS),.86)+'"/>'})}
  return o}
function found(type,c,r,c2,r2){
  if(NEED[type]&&!S.tut){var tmp={id:-7,type:type,c:c,r:r};if(c2!=null){tmp.c2=c2;tmp.r2=r2}S.setl.push(tmp);var SUf=supply(),Rf=SUf.set[-7];S.setl.pop();
    if(!Rf.ok){var nf=NEED[type];say('A '+SETT[type].n.toLowerCase()+' needs '+nf.fire+' firewood'+(nf.spec?' and '+nf.spec+' orchards':'')+' within an hour\'s walk that no other settlement already uses. In reach: '+(Math.round(Rf.fire*100)/100)+' firewood'+(nf.spec?', '+Rf.spec+' orchards':'')+'.',true);if(UI.place)UI.place.first=null;return render()}}
  S.hgt=S.hgt||[];S.hgt[ix(c,r)]={s:'flat',b:baseFor(c,r,'flat',0,0)};if(c2!=null)S.hgt[ix(c2,r2)]={s:'flat',b:S.hgt[ix(c,r)].b};
  var d=SETT[type],cards=S.cards.filter(function(x){return x.at===null&&x.key==='setcard'});
  for(var n=0;n<d.cards;n++)S.cards.splice(S.cards.indexOf(cards[n]),1);
  var o={id:S.sid++,type:type,c:c,r:r,pal:0};if(c2!=null){o.c2=c2;o.r2=r2}
  S.prestige-=d.cost;payMats(d.mats);S.setl.push(o);
  say(d.n+' founded at '+lab(c,r)+(c2!=null?' and '+lab(c2,r2):'')+'. '+d.cost+' prestige'+(d.mats?' and '+matsText(d.mats):'')+' spent.');UI.place=null;
  if(UI.sel===null)UI.sel=S.setl[0].id;
  growRealm();if(UI.grown){say(UI.grown);UI.grown=null}
  save();render();
}
function isSoldier(h){return !!unitOf(h.id)||S.cards.some(function(w){return w.eq===h.id&&kindOf(w)==='weapon'})}
function soldiersAt(sid){return S.cards.filter(function(h){return h.key==='human'&&h.at===sid&&isSoldier(h)}).length}
function toggleEquip(id){
  var it=byId(id),h=UI.hum?byId(UI.hum):null;if(!it||!h)return;
  if(it.eq===h.id){say(CD[it.key].n+' is his for good. Equipment cannot be taken off once it is on.',true);return render()}
  var k=kindOf(it),mine=gearOf(h);
  if(h.sex==='f'&&SOLDIER_GEAR[k]){say(womanMsg(),true);return render()}
  var nw=mine.filter(function(c){return kindOf(c)==='weapon'}).length;
  if(k==='weapon'&&nw>=2){say('Two weapons at most.',true);return render()}
  if(k==='armor'&&mine.some(function(c){return kindOf(c)==='armor'})){say('Already wearing armor.',true);return render()}
  if(k==='helmet'&&mine.some(function(c){return kindOf(c)==='helmet'})){say('Already wearing a helmet.',true);return render()}
  if(k==='shield'&&mine.some(function(c){return kindOf(c)==='shield'})){say('Already carrying a shield.',true);return render()}
  if(k==='greaves'&&mine.some(function(c){return kindOf(c)==='greaves'})){say('Already wearing greaves.',true);return render()}
  if(k==='shield'&&mine.some(function(c){return WEAP[wkey(c.key)]&&WEAP[wkey(c.key)].two})){say('A battle axe takes both hands. He cannot carry a shield with it.',true);return render()}
  if(WEAP[wkey(it.key)]&&WEAP[wkey(it.key)].two&&mine.some(function(c){return kindOf(c)==='shield'})){say('A battle axe takes both hands, and he already carries a shield for good. Give the axe to a man without one.',true);return render()}
  if(k==='weapon'&&nw===0){var stt=setById(h.at),cap=stt?SETT[stt.type].def:null;if(cap&&!unitOf(h.id)&&soldiersAt(h.at)>=cap){say('This '+SETT[stt.type].n.toLowerCase()+' holds '+cap+' soldiers at most.',true);return render()}}
  if(k==='parch'){
    h.spells=h.spells||[];
    if(h.spells.indexOf(it.key)>=0){say(hname(h)+' already knows '+SPELL[it.key].n+'.',true);return render()}
    if(!(h.gnosis>0)){say(hname(h)+' has no gnosis. Learning a spell costs 1 gnosis. Use a gnosis card on him first.',true);return render()}
    if(S.prestige<1){say('Using a parchment costs 1 prestige.',true);return render()}
    S.prestige-=1;h.gnosis--;h.spells.push(it.key);S.cards.splice(S.cards.indexOf(it),1);
    say('The parchment is consumed. '+hname(h)+' spends 1 gnosis and learns '+SPELL[it.key].n+'. 1 prestige sunk.');save();return render();
  }
  if(k==='tattoo'){
    h.tat=h.tat||[];
    if(tatHas(h,it.key)){say(hname(h)+' already has the '+TATTOO[it.key].n.toLowerCase()+' tattoo.',true);return render()}
    if(S.prestige<1){say('A tattoo costs 1 prestige.',true);return render()}
    S.prestige-=1;var ft=tatFreeze(h,it.key);h.tat.push(ft);S.cards.splice(S.cards.indexOf(it),1);
    say(hname(h)+' takes the '+TATTOO[it.key].n.toLowerCase()+' tattoo. Fixed at '+Object.keys(ft.v).map(function(s){return TATLAB[s]+' '+tatDelta(s,ft.v[s])}).join(', ')+', for good. 1 prestige sunk.');save();return render();
  }
  if(k==='crystal'){
    if(S.prestige<1){say('Using a crystal costs 1 prestige.',true);return render()}
    S.prestige-=1;h.mana=(h.mana||1)+1;S.cards.splice(S.cards.indexOf(it),1);
    say('The crystal is consumed. '+hname(h)+' now has '+h.mana+' mana, permanently. 1 prestige sunk.');save();return render();
  }
  if(k==='gnosis'){
    if(S.prestige<1){say('Using gnosis costs 1 prestige.',true);return render()}
    S.prestige-=1;h.gnosis=(h.gnosis||0)+1;S.cards.splice(S.cards.indexOf(it),1);
    say('The gnosis is consumed. '+hname(h)+' now holds '+h.gnosis+' gnosis, to spend on learning spells. 1 prestige sunk.');save();return render();
  }
  if(S.prestige<1){say('Equipping costs 1 prestige.',true);return render()}
  S.prestige-=1;it.eq=h.id;say('Equipped '+CD[it.key].n+'. 1 prestige sunk.');save();render();
}

