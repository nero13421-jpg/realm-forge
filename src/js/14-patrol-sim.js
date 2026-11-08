/* ---------- patrol simulation ---------- */
function wtOf(k){var t=wkey(k);return WEAP[t]?WEAP[t].wt*(wmat(k).wd==='pine'?.85:1):ARM[k]?ARM[k].wt:AMMO_WT[t]||0}
function mmss(t){t=Math.floor(t);var m=Math.floor(t/60),s=t%60;return (m<10?'0':'')+m+':'+(s<10?'0':'')+s}
function makeUnit(c){
  var eq=gearOf(c),ws=eq.filter(function(x){return WEAP[wkey(x.key)]}).map(function(x){return wkey(x.key)});
  var wt=0;eq.forEach(function(x){wt+=wtOf(x.key)});
  var X=stats(c,wt,eq),melee=MELEE.filter(function(k){return ws.indexOf(k)>=0})[0]||null,bows=BOWS.filter(function(k){return ws.indexOf(k)>=0}),rng=null,ac=[];
  bows.some(function(k){var a=eq.filter(function(x){return wkey(x.key)===WEAP[k].ammo});if(a.length){rng=k;ac=a.map(function(x){return{card:x,cap:x.n===undefined?20:x.n}});return true}});
  if(!rng&&bows.length)rng=bows[0];
  return {c:c,mhp:X.hp,hp:Math.max(1,X.hp-Math.round(c.dmg||0)),sp:X.sp,dr:X.dr,strike:X.strike,str:X.str,range:X.range,keen:X.keen,dfn:X.def,dodge:X.dodge,grit:X.grit,react:X.react,rt:X.react,press:X.press,cast:X.cast,sight:X.sight,jd:X.jd,jh:X.jh,ce:100,ceDrain:100/X.cEnd,ceRec:100/60*X.rec,
    rod:ws.reduce(function(m,k){return Math.max(m,WEAP[k].rod||0)},0),eqk:eq.map(function(x){return x.key}),ac:ac,arrows:ac.reduce(function(t,a){return t+a.cap},0),name:hname(c),endur:100,wf:X.wf,melee:melee,rng:rng,mana:X.mana,spells:c.spells||[],sh:0,cds:0,
    mcard:melee?eq.filter(function(x){return wkey(x.key)===melee})[0]:null,md:0,rd:0,
    armor:eq.some(function(x){return kindOf(x)==='armor'}),shield:eq.some(function(x){return kindOf(x)==='shield'}),shDef:eq.reduce(function(t,x){return t+(kindOf(x)==='shield'&&ARM[x.key]?ARM[x.key].def:0)},0),helmet:eq.some(function(x){return kindOf(x)==='helmet'}),x:0,cdm:0,cdr:0,att:{},alive:true,gone:false};
}

/* ---------- zoomed tile detail ---------- */
function seeded(n){var a=n>>>0;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
var MICRO={};['tree','bush','reed','puddle','lily','ripple','tuft','flowerY','flowerW','sheep','stone','hut'].forEach(function(k){MICRO[k]=ART16['m_'+k]});
function microSvg(t,x,y){var o='';t.r.forEach(function(q){o+='<rect x="'+(x+q[1]).toFixed(1)+'" y="'+(y+q[2]).toFixed(1)+'" width="'+q[3]+'" height="'+q[4]+'" fill="'+t.c[q[0]]+'"/>'});return o}
function hexPts(c,r,k){var p=center(c,r),pts=[];for(var i=0;i<6;i++){var a=Math.PI/180*(60*i-30);pts.push((p[0]+SH*(k||.97)*Math.cos(a)).toFixed(1)+','+(p[1]+SH*(k||.97)*Math.sin(a)).toFixed(1))}return pts.join(' ')}

