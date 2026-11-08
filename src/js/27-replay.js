/* ---------- zoom (replays only) ---------- */
var ZL=[1,1.5,2,3,4];
function zoomWrap(svg,key){
  var z=UI['z'+key]||1;
  return '<div class="row zoombar"><button class="btn sm" data-act="zm" data-k="'+key+'" data-d="-1"'+(z<=1?' disabled':'')+' aria-label="Zoom out">−</button><span class="mono dim">'+Math.round(z*100)+'%</span><button class="btn sm" data-act="zm" data-k="'+key+'" data-d="1"'+(z>=4?' disabled':'')+' aria-label="Zoom in">+</button></div><div class="mapscroll"><div class="zin" style="width:'+(z*100)+'%">'+svg+'</div></div>';
}

/* ---------- match replay ---------- */
function snapM(){
  var M=S.match;M.snaps=M.snaps||[];
  M.snaps.push({t:M.clock,
    u:S.units.filter(function(U){return U.live&&U.hids.length}).map(function(U){var p=walkPos(U.live);return[U.id,Math.round(p[0]),Math.round(p[1]),U.hids.length,U.live.battle?1:0]}),
    m:M.camps.filter(function(m){return m.mobs.length}).map(function(m){var p=m.roam&&m.pos?walkPos(m):center(m.lair%COLS,Math.floor(m.lair/COLS));return[m.key,Math.round(p[0]),Math.round(p[1]),m.mobs.length,MOBL[m.type]||'B',m.roam?1:0]}),
    s:S.setl.map(function(x){return x.id})});
}
function replayBase(){return mapSvg({world:true,minw:Math.round(COLS*40),mineRing:true,noMarks:true}).replace(/ data-act="hex"/g,'')}
var RPRAF=null,RPLAST=0;
function rpStart(){if(UI.rp&&!RPRAF){RPLAST=performance.now();RPRAF=requestAnimationFrame(rpLoop)}}
function rpLoop(now){
  RPRAF=null;var R=UI.rp,P=UI.mres&&UI.mres.replay;if(!R||!P)return;
  var ov=document.getElementById('rpov');if(!ov)return;
  var dt=Math.min(.25,(now-RPLAST)/1000);RPLAST=now;
  if(R.playing){R.t+=dt*R.speed;if(R.t>=P.end){R.t=P.end;R.playing=false;var pb=document.getElementById('rpplay');if(pb)pb.textContent='Play'}}
  rpDraw();
  if(R.playing)RPRAF=requestAnimationFrame(rpLoop);
}
function rpDraw(){
  var R=UI.rp,P=UI.mres.replay,ov=document.getElementById('rpov');if(!ov||!P.snaps.length)return;
  var sn=P.snaps,i=0;while(i<sn.length-1&&sn[i+1].t<=R.t)i++;
  var A=sn[i],B=sn[Math.min(i+1,sn.length-1)],f=B.t>A.t?Math.max(0,Math.min(1,(R.t-A.t)/(B.t-A.t))):0,o='';
  function lerp(a,list){for(var j=0;j<list.length;j++)if(list[j][0]===a[0])return[a[1]+(list[j][1]-a[1])*f,a[2]+(list[j][2]-a[2])*f];return[a[1],a[2]]}
  P.setc.forEach(function(s){if(A.s.indexOf(s[0])<0)o+='<g class="rpx"><line x1="'+(s[1]-12)+'" y1="'+(s[2]-12)+'" x2="'+(s[1]+12)+'" y2="'+(s[2]+12)+'"/><line x1="'+(s[1]+12)+'" y1="'+(s[2]-12)+'" x2="'+(s[1]-12)+'" y2="'+(s[2]+12)+'"/></g>'});
  A.m.forEach(function(m){var p=lerp(m,B.m);o+='<g transform="translate('+p[0].toFixed(1)+' '+p[1].toFixed(1)+')"><circle class="rpm'+(m[5]?' roam':'')+'" r="10"/><text class="rpt">'+(typeof m[4]==='string'?m[4]:m[4]?'G':'B')+m[3]+'</text></g>'});
  A.u.forEach(function(u){var p=lerp(u,B.u);o+='<g transform="translate('+p[0].toFixed(1)+' '+p[1].toFixed(1)+')">'+(u[4]?'<circle class="rpfight" r="16"/>':'')+'<circle class="rpu" r="10"/><text class="rpt dark">'+u[3]+'</text><text class="ulab" y="20">'+esc((P.names[u[0]]||'').slice(0,10))+'</text></g>'});
  ov.innerHTML=o;
  var ck=document.getElementById('rpclock');if(ck)ck.textContent=mmss(R.t)+' / '+mmss(P.end);
  var sc=document.getElementById('rpscrub');if(sc&&document.activeElement!==sc)sc.value=Math.round(R.t);
}
function replayPanel(){
  var P=UI.mres&&UI.mres.replay;if(!P)return '';
  if(!UI.rp)return '<div class="row"><button class="btn go" data-act="rpopen">Watch the match back</button></div>';
  var R=UI.rp;
  return '<h3>Match replay</h3><div class="row"><span class="mono clock" id="rpclock">'+mmss(R.t)+' / '+mmss(P.end)+'</span><button class="btn sm" id="rpplay" data-act="rpplay">'+(R.playing?'Pause':'Play')+'</button>'+[10,30,60,120].map(function(s){return '<button class="btn sm'+(R.speed===s?' on':'')+'" data-act="rpspd" data-s="'+s+'">'+s+'×</button>'}).join('')+'<button class="btn sm" data-act="rpclose">Close replay</button></div>'+
    '<input type="range" id="rpscrub" class="scrub" min="0" max="'+P.end+'" value="'+Math.round(R.t)+'" aria-label="Replay time">'+
    zoomWrap(P.svg.replace(/<\/svg>$/,'<g id="rpov"></g></svg>'),'m')+
    '<p class="note">White circles are your units with their head count, a red ring means they are fighting. Red circles are mobs (G goblins, B brigands) with how many are left. A red X marks a settlement that fell.</p>';
}

