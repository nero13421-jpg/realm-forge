/* ---------- fight recording ---------- */
var REC=null;
function recStart(units,foes,extra){
  REC={ents:[],frames:[],ev:[]};
  units.forEach(function(u){u._ri=REC.ents.length;REC.ents.push({s:'p',eq:u.eqk||[],f:u.c.sex==='f',n:hname(u.c),m:u.mhp})});
  foes.forEach(function(e){e._ri=REC.ents.length;REC.ents.push({s:'e',k:e.kind,b:e.ref||null,m:e.kind==='goblin'?50:e.kind==='dogman'?600:e.kind==='pigger'?300:e.kind==='tiggle'?30:100})});
  REC.all=units.concat(foes);
  if(extra)Object.keys(extra).forEach(function(k){REC[k]=extra[k]});
  recFrame();
}
function recFrame(){
  if(!REC)return;
  REC.frames.push({x:REC.all.map(function(e){return Math.round(e.x*10)/10}),hp:REC.all.map(function(e){return Math.max(0,Math.round(e.hp))}),a:REC.all.map(function(e){return e.gone?2:e.alive?1:0})});
}
function recEv(a,b,k,h){if(REC&&a&&b&&a._ri!=null&&b._ri!=null)REC.ev.push({t:REC.frames.length-1,a:a._ri,b:b._ri,k:k,h:h?1:0})}
function recEnd(){var r=REC;REC=null;if(r)delete r.all;return r}

/* ---------- playback ---------- */
var FPS=8,PBRAF=null,PBLAST=0;
function pbTotal(pb){return Math.max(1,(pb.k==='tac'?pb.rec.fr:pb.rec.frames).length/FPS)}
function pbPanel(){
  var pb=UI.pb;
  return '<section class="panel" id="pbpanel"><div class="row" style="justify-content:space-between"><h3 id="pbcap">'+esc(pb.title||'Playback')+'</h3><span class="mono dim" id="pbclock"></span></div>'+(pb.k==='tac'?camBar():'')+'<div id="pbview" class="pbview"></div>'+
    '<div class="row"><button class="btn sm" id="pbplay" data-act="pbplay">'+(pb.playing?'Pause':'Play')+'</button>'+[1,2,4,8].map(function(s){return '<button class="btn sm'+(pb.speed===s?' on':'')+'" data-act="pbspd" data-s="'+s+'">'+s+'×</button>'}).join('')+
    '<button class="btn sm" data-act="pbskip">Skip to end</button><button class="btn sm" data-act="pbreplay">Replay</button><button class="btn sm" data-act="pbclose">Close</button></div></section>';
}
function pbStart(){if(UI.pb&&!PBRAF){PBLAST=performance.now();PBRAF=requestAnimationFrame(pbLoop)}}
function pbLoop(now){
  PBRAF=null;var pb=UI.pb;if(!pb)return;
  var host=document.getElementById('pbview');if(!host)return;
  var dt=Math.min(.25,(now-PBLAST)/1000);PBLAST=now;
  if(pb.playing){pb.t+=dt*pb.speed;var tot=pbTotal(pb);if(pb.t>=tot){pb.t=tot;pb.playing=false;var b=document.getElementById('pbplay');if(b)b.textContent='Play'}}
  pbDraw(host,pb);
  if(pb.playing)PBRAF=requestAnimationFrame(pbLoop);
}
function mapX(x){return 40+(Math.max(-60,Math.min(160,x))+60)/220*560}
function stripSvg(rec,P){P=P||'pb';
  var terr=rec.terr,ground=terr?'url(#pt-'+terr+')':'#3a3226';
  var o='<svg class="strip" viewBox="0 0 640 210" role="img" aria-label="Battle line">'+artDefs()+'<rect x="0" y="0" width="640" height="210" fill="#17140f"/><rect x="0" y="40" width="640" height="170" fill="'+ground+'" opacity=".55"/>';
  if(rec.wall){var wx=mapX(2);o+='<g id="'+P+'wall">';for(var y=46;y<200;y+=10)o+='<rect x="'+(wx-3)+'" y="'+y+'" width="6" height="12" fill="#7b3a22" stroke="#3a1a0e"/>';o+='</g>'}
  var pi=0,ei=0;
  rec.ents.forEach(function(e,i){
    var lane=e.s==='p'?(pi++):(ei++);e.y=48+(lane%6)*25;e.j=((i*7)%5)*3;
    var art=e.s==='p'?humanInner(e.eq,e.f,e):mobInner(e.k,e.b),flip=e.s==='e';
    o+='<g class="ent '+(e.s==='p'?'side-p':'side-e')+'" id="'+P+'e'+i+'"><g class="bob"><g class="lw"><g transform="'+(flip?'translate(32 0) scale(-2 2)':'scale(2)')+'">'+art+'</g></g></g><rect class="hpbg" x="4" y="-5" width="24" height="3"/><rect class="hpb" id="'+P+'h'+i+'" x="4" y="-5" width="24" height="3"/></g>';
  });
  return o+'<g id="'+P+'fx"></g></svg>';
}
function fxShot(fx,x1,y1,x2,y2,k,hit,dur){
  var NS=SVGNS,el;
  if(k==='r'){el=document.createElementNS(NS,'line');el.setAttribute('x1',0);el.setAttribute('y1',0);el.setAttribute('x2',x2>x1?8:-8);el.setAttribute('y2',0);el.setAttribute('class','fx-arrow')}
  else{el=document.createElementNS(NS,'circle');el.setAttribute('r',k==='b'?7:k==='j'?5:4);el.setAttribute('class',k==='b'?'fx-bolt':k==='j'?'fx-jab':'fx-slash')}
  fx.appendChild(el);
  var ex=hit?x2:x2+(x2>x1?18:-18),ey=hit?y2:y2-10;
  if(el.animate){var an=el.animate([{transform:'translate('+x1+'px,'+y1+'px)'},{transform:'translate('+ex+'px,'+ey+'px)'}],{duration:dur,easing:'linear'});an.onfinish=function(){el.remove()}}
  else setTimeout(function(){el.remove()},dur);
}
function fxRing(fx,x,y,cls){
  var NS=SVGNS,el=document.createElementNS(NS,'circle');
  el.setAttribute('cx',x);el.setAttribute('cy',y);el.setAttribute('r',18);el.setAttribute('class',cls);fx.appendChild(el);setTimeout(function(){el.remove()},600);
}
function flash(el,cls,ms){if(!el)return;el.classList.add(cls);setTimeout(function(){el.classList.remove(cls)},ms)}
function pbDraw(host,pb){
  var R=pb.rec,tau=Math.max(0,pb.t)*FPS,cap=document.getElementById('pbcap'),clk=document.getElementById('pbclock'),cnt;
  if(host.dataset.seg!==pb.k+camOf().v){host.dataset.seg=pb.k+camOf().v;pb.lastF=-1;pb.lastE=-1;host.innerHTML=pb.k==='tac'?bfSvg(R.F,'pb',false):stripSvg(R)}
  if(pb.k==='tac'){
    tau=Math.min(R.fr.length-1,tau);var f0=Math.floor(tau),f1=Math.min(f0+1,R.fr.length-1),fa=tau-f0,A0=R.fr[f0],B0=R.fr[f1];
    bfDrawEnts('pb',(bfList(R,function(i){var p=A0[i];if(!p)return null;var q=B0[i]||p;return[p[0]+(q[0]-p[0])*fa,p[1]+(q[1]-p[1])*fa,p[2],p[3],pb.playing&&Math.hypot(q[0]-p[0],q[1]-p[1])>.1]})));
    if(f0<pb.lastE)pb.lastE=f0-1;
    if(f0>pb.lastE){var evs=[];R.ev.forEach(function(x){if(x[0]>pb.lastE&&x[0]<=f0&&(x[4]>=0||x[3]==='r'||x[3]==='m'||x[3]==='sh'||x[5])){var pa=A0[x[1]],pt2=A0[x[2]];if(pa&&pt2)evs.push({k:x[3],d:x[4],x:x[6],a:x[1],t:x[2],ax:pa[0],ay:pa[1],bx:pt2[0],by:pt2[1],s:R.ents[x[2]].s,lab:x[5]})}});bfFx('pb',evs.slice(-6),Math.max(150,Math.min(400,1000/(FPS*pb.speed))),0);pb.lastE=f0}
    cnt=function(sd){var n=0;R.ents.forEach(function(e,i){if(e.s===sd&&A0[i]&&A0[i][3]===1)n++});return n};
    if(clk)clk.textContent=mmss(f0);
  }else{
    var r=drawFight(R,tau,'pb',pb,pb.playing,pb.speed);
    cnt=function(sd){return R.ents.filter(function(e,i){return e.s===sd&&r.A.a[i]===1}).length};
    if(clk)clk.textContent=mmss(r.f);
  }
  if(cap)cap.textContent=(R.title||'Fight')+' · '+cnt('p')+' standing vs '+cnt('e');
}
function drawFight(rec,tau,P,st,playing,speed){
  var fr=rec.frames;tau=Math.max(0,Math.min(fr.length-1,tau));var f=Math.floor(tau),g=Math.min(f+1,fr.length-1),a=tau-f,A=fr[f],B=fr[g],pos=[];
  rec.ents.forEach(function(e,i){
    var el=document.getElementById(P+'e'+i);
    if(A.x[i]===undefined){if(el)el.style.display='none';pos[i]=[0,0];return}
    if(el)el.style.display='';
    var bx=B.x[i]===undefined?A.x[i]:B.x[i],x=A.x[i]+(bx-A.x[i])*a,px=mapX(x)+e.j-16+(e.s==='p'?-12:12),py=e.y-16;pos[i]=[px+16,py+16];
    if(!el)return;
    el.setAttribute('transform','translate('+px.toFixed(1)+' '+py.toFixed(1)+')');
    var sa=A.a[i];
    el.classList.toggle('dead',sa===0);el.classList.toggle('gone',sa===2||(e.s==='p'&&x<-60));
    el.classList.toggle('walk',sa===1&&Math.abs(bx-A.x[i])>.05&&playing);
    var hb=document.getElementById(P+'h'+i);if(hb)hb.setAttribute('width',(24*A.hp[i]/e.m).toFixed(1));
  });
  var wall=document.getElementById(P+'wall');if(wall)wall.style.display=(rec.breach!=null&&f>=rec.breach)?'none':'';
  if(f>st.lastF){
    var fx=document.getElementById(P+'fx'),n=0,dur=Math.max(120,Math.min(400,1000/(FPS*speed)));
    rec.ev.forEach(function(ev){
      if(ev.t<=st.lastF||ev.t>f||n>40)return;n++;
      var ae=document.getElementById(P+'e'+ev.a),be=document.getElementById(P+'e'+ev.b),pa=pos[ev.a],pbb=pos[ev.b];
      if(!pa||!pbb)return;
      if(ev.k==='m'){var lw=ae&&ae.querySelector('.lw');if(lw)flash(lw,rec.ents[ev.a].s==='p'?'lungeR':'lungeL',220);if(ev.h)flash(be&&be.querySelector('.bob'),'hit',160)}
      else if(ev.k==='sh'){if(fx)fxRing(fx,pa[0],pa[1],'fx-shield')}
      else{if(fx)fxShot(fx,pa[0],pa[1]-6,pbb[0],pbb[1]-6,ev.k,ev.h,dur);if(ev.h)setTimeout(function(){flash(be&&be.querySelector('.bob'),'hit',160)},dur)}
    });
    st.lastF=f;
  }
  return{A:A,f:f};
}

