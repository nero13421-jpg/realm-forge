/* ---------- elevation ----------
   Every placed tile has a base height and a shape: flat, slope (rising across the tile toward one of six sides) or mound.
   A new tile starts at the height its placed neighbours hand it: past a slope's high edge the land stays up, so slopes
   build plateaus; a slope dropped between level tiles climbs to a crest and falls away into the far neighbour as a bank. */
var HDIR=['east','north-east','north-west','west','south-west','south-east'],M_PER_U=SH*1.5/HEX_YD*0.9144*0+0;
var MPU=HEX_YD*0.9144/(Math.sqrt(3)*SH);/* metres per map unit */
function hgtAt(k){return (S.hgt&&S.hgt[k])||null}
function hdirVec(d){var a=d*Math.PI/3;return[Math.cos(a),-Math.sin(a)]}
function edgeH(h,side){if(!h)return 0;if(h.s!=='slope')return h.b;return h.b+h.r*(1+Math.cos((side-h.d)*Math.PI/3))/2}
function baseFor(c,r,sh,rise,dir){var best=null;nbrs(c,r).forEach(function(p,i){var nh=hgtAt(ix(p[0],p[1]));if(!nh)return;var side=HEXD[r&1].findIndex?i:i;var fs=sh==='slope'?(1+Math.cos((i-dir)*Math.PI/3))/2:0,v=edgeH(nh,(i+3)%6)-rise*fs;if(best==null||v>best)best=v});return Math.max(0,Math.round(best||0))}
function ptH(h,c,r,x,y){if(!h)return null;if(h.s==='flat'||!h.r)return h.b;var p=center(c,r),dx=x-p[0],dy=y-p[1];
  if(h.s==='slope'){var v=hdirVec(h.d),A=Math.sqrt(3)*SH/2,q=Math.max(-1,Math.min(1,(dx*v[0]+dy*v[1])/A));return h.b+h.r*(q+1)/2}
  var d=Math.min(1,Math.hypot(dx,dy)/(SH*.98)),t=d*d*(3-2*d);return h.b+h.r*(1-t)}
/* the ground's height anywhere: each nearby tile's own surface, blended near the edges so seams become banks */
function heightAt(x,y){var k0=hexOf(x,y);if(k0==null)return null;var c0=k0%COLS,r0=Math.floor(k0/COLS),L=[[c0,r0]].concat(nbrs(c0,r0)),sw=0,sh=0;
  for(var i=0;i<L.length;i++){var c=L[i][0],r=L[i][1],h=hgtAt(ix(c,r));if(!h)continue;var p=center(c,r),d=Math.max(.5,Math.hypot(x-p[0],y-p[1])),w=1/Math.pow(d,6);sw+=w;sh+=w*ptH(h,c,r,x,y)}
  return sw?sh/sw:null}
/* moving on a grade (rise over run): up to 20% everyone walks, jogs or sprints, slower uphill; 20-50% is a moderate
   scramble, 50-100% a hard scramble on all fours; past 100% only a jump or a climb gets you up (skills for later) */
var SCR_MOD=.7,SCR_HARD=.35,CLIMB=.08;
function gradeMul(g){var a=Math.abs(g);if(a>1)return{cap:CLIMB,mode:'climb'};if(a>.5)return{cap:SCR_HARD,mode:'hard'};if(a>.2)return{cap:SCR_MOD,mode:'scramble'};return{m:g>0?Math.max(.55,1-1.5*g):1+Math.min(a,.1)*.5,mode:''}}
function gradeSpeed(sp,g){var G=gradeMul(g);return G.cap!=null?Math.min(sp,G.cap):sp*G.m}
function gradeAt(x,y,dx,dy){/* grade going from (x,y) one map unit toward (dx,dy) */var d=Math.hypot(dx,dy);if(d<1e-6)return 0;var h1=heightAt(x,y),h2=heightAt(x+dx/d,y+dy/d);if(h1==null||h2==null)return 0;return (h2-h1)/MPU}
var GMODE={scramble:'scrambling',hard:'scrambling on all fours',climb:'climbing'};
function elevText(h){if(!h)return '';if(h.s==='flat')return 'Level ground at '+h.b+' m';if(h.s==='mound')return (h.r>20?'Large':'Small')+' mound, '+h.b+' m rising to '+(h.b+h.r)+' m in the middle';return (h.r>30?'Moderate':'Gentle')+' slope, '+h.b+' m rising to '+(h.b+h.r)+' m toward the '+HDIR[h.d]}
function touchesRealm(c,r){
  var any=S.setl.length>0||S.grid.some(function(g){return g});
  return !any||nbrs(c,r).some(function(p){return placedAt(p[0],p[1])});
}
function doPlace(c,r){
  if(S.match)return;
  var pl=UI.place,i=ix(c,r);
  if(!pl){var s=setAt(c,r);if(s){UI.sel=s.id;UI.tab='settle';say('')}else if(S.grid[i]){UI.look=[c,r];say('')}render();return}
  if(pl.t==='p'){
    var st=setAt(c,r);
    if(!st){say('A palisade goes on a settlement.',true);return render()}
    if(st.pal>=SETT[st.type].maxPal){say('This '+SETT[st.type].n.toLowerCase()+' already has all its palisades ('+SETT[st.type].maxPal+').',true);return render()}
    if(S.prestige<PAL_COST){say('Not enough prestige. A palisade costs '+PAL_COST+' prestige and '+matsText(PAL_MATS)+'.',true);return render()}
    var pm=matsShort(PAL_MATS);if(pm.length){say('Short on '+pm.join(', ')+'. A palisade costs '+PAL_COST+' prestige and '+matsText(PAL_MATS)+'.',true);return render()}
    S.prestige-=PAL_COST;payMats(PAL_MATS);st.pal++;say('Palisade built at '+lab(c,r)+'. '+PAL_COST+' prestige and '+matsText(PAL_MATS)+' spent.');save();return render();
  }
  if(pl.t==='b'){
    var big=pl.k==='mbridge',ft=big?'creek':'stream',BC=big?MBR:{cost:BRIDGE_COST,mats:BRIDGE_MATS,lab:1},bn=big?'medium footbridge':'footbridge';
    if(!(S.lines||[]).some(function(l){return l.type===ft&&l.hexes.indexOf(i)>=0})){say(big?'A medium footbridge spans a creek. This tile has no creek.':'A footbridge goes where a stream runs. This tile has no stream. A creek needs a medium footbridge.',true);return render()}
    if(bridgeSet()[i]){say('This tile already has a footbridge.',true);return render()}
    var sp0=streamPoint(i,ft);if(!sp0){say('The '+ft+' only clips the edge of this tile. Pick a tile it runs through.',true);return render()}
    var bm=workShort(BC);if(bm.length){say('Short on '+bm.join(', ')+'. A '+bn+' costs '+workText(BC)+'.',true);return render()}
    workPay(BC);var bpt=[Math.round(sp0.p[0]*10)/10,Math.round(sp0.p[1]*10)/10],nb={type:'bridge',pts:[bpt],hexes:lineHexes([bpt]),a:Math.round(sp0.a)};if(big)nb.m=1;S.lines.push(nb);
    say((big?'Medium footbridge':'Footbridge')+' built at '+lab(c,r)+'. Spent '+workText(BC)+'.');save();return render();
  }
  if(pl.t==='s'&&pl.first){
    var f0=pl.first;
    if(f0[0]===c&&f0[1]===r){pl.first=null;say('Village placement restarted. Tap the first of its two hexes.');return render()}
    if(S.grid[i]||setAt(c,r)){say('That hex is taken. Pick an empty hex next to the first one.',true);return render()}
    if(!nbrs(f0[0],f0[1]).some(function(p){return p[0]===c&&p[1]===r})){say('The second hex has to sit right next to the first one.',true);return render()}
    if(touchesSet(c,r)){say('Settlements cannot touch each other. Pick a second hex with no settlement beside it.',true);return render()}
    return found(pl.k,f0[0],f0[1],c,r);
  }
  if(S.grid[i]||setAt(c,r)){say('That hex is taken. Placements are permanent.',true);return render()}
  if(!touchesRealm(c,r)){say('Tiles must touch your realm. Place it next to a tile or settlement you already have.',true);return render()}
  if(pl.t==='e'){
    var ep=pl.k.split('_'),EE=ELEV[ep[0]],ek=ep[1],ecard=S.cards.filter(function(x){return x.at===null&&x.key==='e_'+pl.k})[0],ecost=TERR[ek].cost+EE.cost;
    if(!ecard){say('No '+CD['e_'+pl.k].n.toLowerCase()+' card in hand.',true);return render()}
    if(S.prestige<ecost){say('Not enough prestige.',true);return render()}
    var dir=UI.rot||0,eb=baseFor(c,r,EE.sh,EE.rise,dir);
    S.cards.splice(S.cards.indexOf(ecard),1);S.grid[i]=ek;S.hgt[i]={s:EE.sh,b:eb,r:EE.rise,d:dir};S.prestige-=ecost;
    say(CD['e_'+pl.k].n+' placed at '+lab(c,r)+': '+elevText(S.hgt[i]).toLowerCase()+'. '+ecost+' prestige sunk.');growRealm();if(UI.grown){say(UI.grown);UI.grown=null}
    if(!countHand('e_'+pl.k))UI.place=null;save();return render();
  }
  if(pl.t==='t'){
    var key=pl.k,card=S.cards.filter(function(x){return x.at===null&&x.key==='t_'+key})[0];
    if(key==='pond'&&nbrs(c,r).some(function(p){return terrAt(p[0],p[1])==='pond'})){say('Ponds cannot touch each other.',true);return render()}
    if(key==='orchard'&&!S.tut&&!waterNear(c,r)){say('An orchard is farmland: it needs water within two tiles, like a cultivated field.',true);return render()}
    if(key==='pasture'&&!S.tut&&card&&S.prestige>=TERR[key].cost){var was=S.grid[i],wh=S.hgt[i];S.grid[i]=key;S.hgt[i]={s:'flat',b:0};var SU0=supply(),okp=SU0.past[i]&&SU0.past[i].ok;S.grid[i]=was;S.hgt[i]=wh;if(!okp){say('Every pasture needs half a prairie: one field tile feeds two pastures, within an hour\'s walk, and no prairie in reach has room. Place a field nearby first.',true);return render()}}
    if(key==='cultivated'&&!S.tut&&!waterNear(c,r)){say('Cultivated fields need water within two tiles: a pond, swamp, small open water, stream or creek, with its water rules met.',true);return render()}
    if(!card){say('No '+TERR[key].n.toLowerCase()+' card in hand.',true);return render()}
    if(S.prestige<TERR[key].cost){say('Not enough prestige.',true);return render()}
    S.cards.splice(S.cards.indexOf(card),1);S.grid[i]=key;S.prestige-=TERR[key].cost;S.hgt[i]={s:'flat',b:baseFor(c,r,'flat',0,0)};
    say(TERR[key].n+' placed at '+lab(c,r)+'. '+TERR[key].cost+' prestige sunk.');growRealm();if(UI.grown){say(UI.grown);UI.grown=null}
    if(!countHand('t_'+key))UI.place=null;
    save();return render();
  }
  var d=SETT[pl.k],cards=S.cards.filter(function(x){return x.at===null&&x.key==='setcard'});
  if(touchesSet(c,r)){say('Settlements cannot touch each other. Leave at least one tile between them.',true);return render()}
  if(cards.length<d.cards){say('Needs '+d.cards+' settlement card'+(d.cards>1?'s':'')+'.',true);return render()}
  if(S.prestige<d.cost){say('Not enough prestige.',true);return render()}
  if(pl.k==='camp'&&wildCount()<CAMP_WILD){say('A military camp needs '+CAMP_WILD+' wild tiles in one connected stretch: woodland, swamp and field you can walk through without crossing farmland, pasture or a settlement. Your largest stretch is '+wildCount()+'.',true);return render()}
  var sm=matsShort(d.mats);if(sm.length){say('Short on '+sm.join(', ')+'. A '+d.n.toLowerCase()+' costs '+d.cost+' prestige and '+matsText(d.mats)+'.',true);return render()}
  if(needed()+d.need>capacity()){say('Your terrain feeds '+Math.floor(capacity())+' people. This would need '+(needed()+d.need)+'. Place more farmland first.',true);return render()}
  if((d.hexes||1)>1){
    if(!nbrs(c,r).some(function(p){return !placedAt(p[0],p[1])})){say('A '+d.n.toLowerCase()+' takes two hexes, and there is no empty hex next to this one.',true);return render()}
    pl.first=[c,r];say('Now tap an empty hex next to it for the '+d.n.toLowerCase()+'\'s second hex.');return render();
  }
  found(pl.k,c,r);
}
