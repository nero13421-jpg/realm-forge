/* ---------- hex grid ---------- */
function ix(c,r){return r*COLS+c}
var HEXD=[[[1,0],[0,-1],[-1,-1],[-1,0],[-1,1],[0,1]],[[1,0],[1,-1],[0,-1],[-1,0],[0,1],[1,1]]];/* E NE NW W SW SE, even rows then odd rows */
function nbrs(c,r){
  var d=HEXD[r&1];
  return d.map(function(x){return[c+x[0],r+x[1]]}).filter(function(p){return p[0]>=0&&p[1]>=0&&p[0]<COLS&&p[1]<ROWS});
}
function center(c,r){var w=Math.sqrt(3)*SH;return[w*(c+.5+((r&1)?.5:0)),SH*1.5*r+SH]}
function colLab(c){var o='';c++;while(c>0){var m=(c-1)%26;o=LET.charAt(m)+o;c=Math.floor((c-1)/26)}return o}
function lab(c,r){return colLab(c)+(r+1)}
function setAt(c,r){for(var i=0;i<S.setl.length;i++){var q=S.setl[i];if((q.c===c&&q.r===r)||(q.c2===c&&q.r2===r))return q}return null}
function setName(st){return st.name?st.name:SETT[st.type].n+' '+lab(st.c,st.r)}
function setById(id){for(var i=0;i<S.setl.length;i++)if(S.setl[i].id===id)return S.setl[i];return null}
function terrAt(c,r){return S.grid[ix(c,r)]}
function capacity(){var t=0;S.grid.forEach(function(g,i){if(g&&(!S.match||S.match.mine[i]))t+=TERR[g].ppl});return t}
function needed(){var t=0;S.setl.forEach(function(s){t+=SETT[s.type].need});return t}
/* camps: first every 10+ stretch of connected swamp is a goblin camp; then what is left of the woodland and swamp, 10+ connected, holds brigands */
function scanPockets(grid,mine){
  var claimed={},out=[];
  function pass(ok,type){var seen={};for(var i=0;i<COLS*ROWS;i++){if(seen[i]||claimed[i]||!ok(i))continue;var comp=[],q=[i];seen[i]=1;
    while(q.length){var k=q.pop();comp.push(k);nbrs(k%COLS,Math.floor(k/COLS)).forEach(function(n){var m=ix(n[0],n[1]);if(!seen[m]&&!claimed[m]&&ok(m)){seen[m]=1;q.push(m)}})}
    if(comp.length<10)continue;comp.forEach(function(k){claimed[k]=1});
    var sx=0,sy=0;comp.forEach(function(k){var p=center(k%COLS,Math.floor(k/COLS));sx+=p[0];sy+=p[1]});sx/=comp.length;sy/=comp.length;
    var best=comp[0],bd=1e9;comp.forEach(function(k){var p=center(k%COLS,Math.floor(k/COLS)),d=Math.pow(p[0]-sx,2)+Math.pow(p[1]-sy,2);if(d<bd){bd=d;best=k}});
    out.push({key:Math.min.apply(null,comp),hexes:comp,type:type,lair:best,reward:100})}}
  var free=function(i){return !mine||!mine[i]};
  pass(function(i){return free(i)&&grid[i]==='swamp'},'goblin');
  pass(function(i){return free(i)&&(grid[i]==='woodland'||grid[i]==='swamp')},'brigand');
  return out;
}
function pockets(){
  if(S.match)return matchCamps();
  return scanPockets(S.grid,null).map(function(p){p.active=true;return p});
}
function findPath(from,to,rs){
  var N=COLS*ROWS,dist=new Array(N),prev=new Array(N),i,s0=ix(from[0],from[1]),t=ix(to[0],to[1]),h=[];
  var RS=rs||roadSet(),RD=roadSet(),SG=streamSegs(),SC=STREAM_S/(HEX_YD/PACE.walk),BS=bridgeSet(),SB=(BRIDGE_FILE_S+BRIDGE_REFORM_S)/(HEX_YD/PACE.walk);
  function sp(k){return hexSpeed(k,RS)}
  if(sp(t)===0)return null;
  for(i=0;i<N;i++){dist[i]=1e9;prev[i]=-1}
  function push(d,k){h.push([d,k]);var j=h.length-1;while(j>0){var q=(j-1)>>1;if(h[q][0]<=h[j][0])break;var x=h[q];h[q]=h[j];h[j]=x;j=q}}
  function pop(){var top=h[0],last=h.pop();if(h.length){h[0]=last;var j=0;for(;;){var l=2*j+1,r=l+1,m=j;if(l<h.length&&h[l][0]<h[m][0])m=l;if(r<h.length&&h[r][0]<h[m][0])m=r;if(m===j)break;var x=h[m];h[m]=h[j];h[j]=x;j=m}}return top}
  dist[s0]=0;push(0,s0);
  while(h.length){
    var e=pop(),u=e[1];if(e[0]>dist[u])continue;if(u===t)break;
    var n=nbrs(u%COLS,Math.floor(u/COLS));
    for(i=0;i<n.length;i++){var v=ix(n[i][0],n[i][1]),w=sp(v);if(w===0)continue;var nd=dist[u]+(RD[v]?.8:1)/w+(SG.length&&crossStream(u,v,SG)?(BS[u]||BS[v]?SB:SC):0);if(nd<dist[v]){dist[v]=nd;prev[v]=u;push(nd,v)}}
  }
  if(dist[t]>=1e9)return null;
  var path=[],k=t;
  while(k!==s0){path.unshift([k%COLS,Math.floor(k/COLS)]);k=prev[k]}
  return path;
}

