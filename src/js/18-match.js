/* ---------- match mode ---------- */
var RAID_AT=300;
function raidAt(){return S.match&&S.match.raidAt!=null?S.match.raidAt:RAID_AT}
function syncDims(){COLS=S.match?S.match.W:(S.bw||9);ROWS=S.match?S.match.H:(S.bh||7)}
/* a lone pigger is one animal: fix the grammar the group messages were written for */
var PIGV={are:'is',have:'has',reach:'reaches','break':'breaks',walk:'walks',leave:'leaves',go:'goes',remain:'remains',find:'finds',swarm:'swarms',batter:'batters',hack:'hacks',start:'starts',cannot:'cannot',move:'moves'};
function pigFix(m){return m.replace(/\b(1 |The |the )pigger((?: at [A-Z]+\d+| of [A-Z]+\d+)?) (are|have|reach|break|walk|leave|go|remain|find|batter|hack|start|move)\b/g,function(a,p,at,v){return p+'pigger'+at+' '+PIGV[v]}).replace(/pigger((?: at [A-Z]+\d+)?) has found the (\w+) at ([A-Z]+\d+) and go for it/g,'pigger$1 has found the $2 at $3 and goes for it').replace(/The pigger is destroyed/g,'The pigger is dead')}
function mlog(m,c){var M=S.match;m=pigFix(String(m));M.log.push({t:mmss(M.clock),m:m,c:c||''});if(M.log.length>80)M.log.shift()}
function matchCamps(){
  return S.match.camps.filter(function(m){return !(m.type==='pigger'&&!m.roam)}).map(function(m){
    return{key:m.key,hexes:m.hexes,type:m.type,lair:m.lair,reward:m.reward,razed:!!m.razed,active:m.mobs.length>0,roam:m.roam&&m.mobs.length>0,pos:m.pos,m:m,n:m.mobs.length};
  });
}
function footprint(){
  var n=0,ax=99,bx=-1,ay=99,by=-1,r,c;
  var BW=S.bw,BH=S.bh;
  for(r=0;r<BH;r++)for(c=0;c<BW;c++)if(S.grid[r*BW+c]||setAt(c,r)){n++;ax=Math.min(ax,c);bx=Math.max(bx,c);ay=Math.min(ay,r);by=Math.max(by,r)}
  return{n:n,ax:ax,bx:bx,ay:ay,by:by,bw:bx-ax+1,bh:by-ay+1};
}
function worldDims(fp,share){
  var best=null,W,H,sc,t=Math.round(fp.n/(share||.25));
  var mW=Math.max(26,fp.bw+4,Math.ceil(Math.sqrt(t*1.3))+6),mH=Math.max(26,fp.bh+4,Math.ceil(Math.sqrt(t/1.3))+6);
  for(W=fp.bw+2;W<=mW;W++)for(H=fp.bh+2;H<=mH;H++){sc=Math.abs(W*H-t)+Math.abs(W/H-1.3)*3;if(!best||sc<best.sc)best={W:W,H:H,sc:sc}}
  return best;
}
function fixPonds(wg,mine,start){
  var W=COLS,H=ROWS,it,k;
  for(it=0;it<40;it++){
    var seen={},q=[start],changed=false;seen[start]=1;
    while(q.length){var u=q.pop();nbrs(u%W,Math.floor(u/W)).forEach(function(p){var m=ix(p[0],p[1]);if(!seen[m]&&wg[m]!=='pond'){seen[m]=1;q.push(m)}})}
    for(k=0;k<W*H&&!changed;k++){
      if(wg[k]!=='pond'||mine[k])continue;
      var a=false,b=false;
      nbrs(k%W,Math.floor(k/W)).forEach(function(p){var m=ix(p[0],p[1]);if(wg[m]!=='pond'){if(seen[m])a=true;else b=true}});
      if(a&&b){wg[k]='field';changed=true}
    }
    if(!changed)break;
  }
}
function genWorld(){
  var fp=footprint(),d=worldDims(fp,UI.mshare),W=d.W,H=d.H,N=W*H,i,c,r,x;
  COLS=W;ROWS=H;
  var dc=rnd(W-fp.bw+1)-fp.ax,okR=[];
  for(x=-fp.ay;x<=H-1-fp.by;x++)if((x&1)===0)okR.push(x);
  var dr=pick(okR),wg=[],mine=[],done=[];
  for(i=0;i<N;i++){wg.push(null);mine.push(0);done.push(false)}
  var BW=S.bw,BH=S.bh;
  for(r=0;r<BH;r++)for(c=0;c<BW;c++)if(S.grid[r*BW+c]||setAt(c,r)){var k=ix(c+dc,r+dr);wg[k]=S.grid[r*BW+c]||null;mine[k]=1;done[k]=true}
  var order=[];for(i=0;i<N;i++)if(!mine[i])order.push(i);
  for(i=order.length-1;i>0;i--){var j=rnd(i+1),t=order[i];order[i]=order[j];order[j]=t}
  var WW=[['woodland',26],['swamp',24],['pond',6],['field',30]];/* wild land only: farmland and pasture exist only where you placed them */
  order.forEach(function(k){
    var ts=[];nbrs(k%W,Math.floor(k/W)).forEach(function(p){var m=ix(p[0],p[1]);if(done[m]&&wg[m]&&wg[m]!=='cultivated'&&wg[m]!=='pasture')ts.push(wg[m])});
    var tt=(ts.length&&Math.random()<.58)?pick(ts):wpick(WW);
    if(tt==='pond'&&Math.random()<.5)tt=wpick(WW);
    wg[k]=tt;done[k]=true;
  });
  var WNP=WW.filter(function(x){return x[0]!=='pond'});
  order.forEach(function(k){if(wg[k]==='pond'&&nbrs(k%W,Math.floor(k/W)).some(function(p){return wg[ix(p[0],p[1])]==='pond'}))wg[k]=wpick(WNP)});
  var pk=scanPockets(wg,mine),tries=0;
  while(pk.length<2&&tries<20){
    tries++;
    var seed=pick(order),blob=[seed],set={},swampy=(pk.length%2===0);set[seed]=1;
    while(blob.length<11){
      var f=[];
      blob.forEach(function(k2){nbrs(k2%W,Math.floor(k2/W)).forEach(function(p){var m=ix(p[0],p[1]);if(!mine[m]&&!set[m])f.push(m)})});
      if(!f.length)break;
      var m2=pick(f);set[m2]=1;blob.push(m2);
    }
    blob.forEach(function(k2){wg[k2]=swampy?'swamp':(Math.random()<.5?'woodland':'swamp')});
    pk=scanPockets(wg,mine);
  }
  var st0=S.setl[0];
  fixPonds(wg,mine,ix(st0.c+dc,st0.r+dr));
  var camps=pk.map(function(p){
    var ty=p.type;if(ty==='goblin'&&Math.random()<.5)ty='tiggle';
    var mobs=newMobs(ty),o={key:p.key,type:ty,hexes:p.hexes,lair:p.lair,reward:p.reward,mobs:mobs,roam:false,pos:null,path:[],rem:0,wait:0};
    if(ty==='tiggle'){/* their ground: every wet tile joined to the swamp, through ponds, open water, streams and creeks */
      var T={},q=[p.lair];T[p.lair]=1;while(q.length){var k=q.pop();nbrs(k%W,Math.floor(k/W)).forEach(function(n){var m=n[1]*W+n[0];if(!T[m]&&!mine[m]&&WATERK[wg[m]]){T[m]=1;q.push(m)}})}
      o.terr=Object.keys(T).map(Number);var sw=o.terr.filter(function(k){return wg[k]==='swamp'}).length;o.mobs=[];for(var j=0;j<Math.min(40,sw*2);j++)o.mobs.push({k:'tiggle',hp:30,w:Math.random()<.35?'bow':'knife'});
      o.roam=true;o.pos=[p.lair%W,Math.floor(p.lair/W)]}
    return o;
  });
  /* piggers: every so often one crashes out of the oak woods and bounces about on its own. No camp. */
  var woods=[];for(var wi=0;wi<N;wi++)if(!mine[wi]&&(wg[wi]==='woodland'||wg[wi]==='forest'))woods.push(wi);
  var npg=Math.min(3,Math.floor(woods.length/14*Math.random()*1.6+(Math.random()<.35?1:0)));
  for(var pi2=0;pi2<npg&&woods.length;pi2++){var wk=pick(woods);camps.push({key:'pg'+pi2,type:'pigger',hexes:[],lair:wk,reward:100,mobs:[{k:'pigger',hp:300,w:'spear'}],roam:false,pos:null,path:[],rem:0,wait:0,razed:true,spawnAt:120+rnd(900)})}
  var wh=[],sd=Math.random()*1000;for(i=0;i<N;i++)wh.push(null);
  for(r=0;r<BH;r++)for(c=0;c<BW;c++){var hk=(S.hgt||[])[r*BW+c];if(hk&&(S.grid[r*BW+c]||setAt(c,r)))wh[ix(c+dc,r+dr)]=JSON.parse(JSON.stringify(hk))}
  for(i=0;i<N;i++){if(wh[i])continue;var cc0=i%W,rr0=Math.floor(i/W),nb0=Math.round(vn(cc0/3+sd,rr0/3+sd)*6)*5;if(wg[i]==='pond'||wg[i]==='swamp'||wg[i]==='water')nb0=Math.max(0,nb0-10);
    wh[i]=(wg[i]!=='pond'&&wg[i]!=='water'&&Math.random()<.12)?{s:'mound',b:nb0,r:Math.random()<.5?15:30,d:0}:{s:'flat',b:nb0}}
  return{W:W,H:H,grid:wg,hgt:wh,mine:mine,camps:camps,dc:dc,dr:dr,n:fp.n};
}

