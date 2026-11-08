/* ---------- roads and streams ---------- */

var LINE={road:{n:'Gravel road',cost:100,mats:{gravel:3,lumber:1}},stream:{n:'Stream',cost:100,mats:{}},creek:{n:'Creek',cost:160,mats:{}}};/* prestige and materials are per tile crossed */
function roadNames(){var rs=(S.lines||[]).map(function(l,i){return[l,i]}).filter(function(x){return x[0].type==='road'});if(!rs.length)return '';return '<div class="roadnames">'+rs.map(function(x){var l=x[0];if(!l.name)l.name='Road '+(rs.indexOf(x)+1);return '<label class="rdn"><span class="label">'+l.hexes.length+' tiles</span><input type="text" maxlength="24" value="'+esc(l.name)+'" data-roadn="'+x[1]+'" aria-label="Road name"></label>'}).join('')+'</div>'}
function lineCostText(k,n){var L=LINE[k],q=n==null?1:n,m=Object.keys(L.mats).map(function(x){return L.mats[x]*q+' '+CD[x].n.toLowerCase()});if(k==='road'&&laborNeed(1))m.push(laborText(q));return (n==null?L.cost+' prestige'+(m.length?' + '+m.join(' + '):'')+' per tile crossed':(n*L.cost)+' prestige'+(m.length?' + '+m.join(' + '):'')+' ('+n+' tile'+(n===1?'':'s')+')')}
function ownedMat(key){return S.cards.filter(function(c){return c.key===key&&!c.eq})}
function matsShort(m){var o=[];Object.keys(m||{}).forEach(function(x){var h=ownedMat(x).length;if(h<m[x])o.push(CD[x].n.toLowerCase()+' ('+h+' of '+m[x]+')')});return o}
function payMats(m){Object.keys(m||{}).forEach(function(x){ownedMat(x).slice(0,m[x]).forEach(function(c){S.cards.splice(S.cards.indexOf(c),1)})})}
function matsText(m){return Object.keys(m||{}).map(function(x){return m[x]+' '+CD[x].n.toLowerCase()}).join(' + ')}
function lineMats(k,n){var L=LINE[k],o={};Object.keys(L.mats).forEach(function(x){o[x]=L.mats[x]*Math.max(1,n||1)});return o}
function lineShort(k,n){var pc=LINE[k].cost*Math.max(1,n||1),miss=S.prestige<pc?['prestige ('+S.prestige+' of '+pc+')']:[];if(k==='road'){var L=laborNeed(Math.max(1,n||1));if(laborFree().length<L)miss.push('men free for labor ('+laborFree().length+' of '+L+')')}return miss.concat(matsShort(lineMats(k,n)))}
var ROAD_SP=1.25,STREAM_S=120,BRIDGE_COST=50,BRIDGE_MATS={lumber:1,gravel:1},BRIDGE_FILE_S=10,BRIDGE_REFORM_S=30,BRIDGE_MOB_S=20;
/* a footbridge sits where a stream crosses a tile; it is stored as a one-point line so it moves with the map like roads do */
function bridgeSet(){var o={};(S.lines||[]).forEach(function(l){if(l.type==='bridge')l.hexes.forEach(function(k){o[k]=1})});return o}
function streamWait(k1,k2,U){if(!crossStream(k1,k2))return 0;var bs=bridgeSet();if(!bs[k1]&&!bs[k2])return STREAM_S;return U?(inFile(U)?BRIDGE_FILE_S:BRIDGE_FILE_S+BRIDGE_REFORM_S):BRIDGE_MOB_S}
function streamPoint(k,ty){var c=k%COLS,r=Math.floor(k/COLS),cc=center(c,r),best=null,bd=1e9;streamSegs(ty).forEach(function(sg){var a=sg[0],b=sg[1],vx=b[0]-a[0],vy=b[1]-a[1],L=vx*vx+vy*vy||1,t=Math.max(0,Math.min(1,((cc[0]-a[0])*vx+(cc[1]-a[1])*vy)/L)),p=[a[0]+vx*t,a[1]+vy*t],d=Math.hypot(p[0]-cc[0],p[1]-cc[1]);if(d<bd){bd=d;best={p:p,a:Math.atan2(vy,vx)*180/Math.PI}}});return best&&bd<SH?best:null}
function hexAtXY(x,y){var best=-1,bd=1e18,r,c;for(r=0;r<ROWS;r++)for(c=0;c<COLS;c++){var p=center(c,r),d=(p[0]-x)*(p[0]-x)+(p[1]-y)*(p[1]-y);if(d<bd){bd=d;best=ix(c,r)}}return best}
function lineHexes(pts){
  var set={},out=[],i,j;
  function add(p){var k=hexAtXY(p[0],p[1]);if(k>=0&&!set[k]){set[k]=1;out.push(k)}}
  for(i=0;i<pts.length;i++){
    if(!i){add(pts[0]);continue}
    var a=pts[i-1],b=pts[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/3));
    for(j=1;j<=n;j++)add([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n]);
  }
  return out;
}
function inFile(U){var s=fmOf(U).mv.s,x=null,ok=true;Object.keys(s).forEach(function(h){if(x===null)x=s[h][0];else if(s[h][0]!==x)ok=false});return ok}
function uRoads(U){return inFile(U)?roadSet():{}}
function roadSet(){var o={};(S.lines||[]).forEach(function(l){if(l.type==='road')l.hexes.forEach(function(k){o[k]=1})});return o}
function hexSpeed(k,rs){var g=S.grid[k],b=g?TERR[g].sp:1;if(b===0)return 0;return (rs||roadSet())[k]?ROAD_SP:b}
function isFlow(l){return l.type==='stream'||l.type==='creek'}
function hasStream(k){return (S.lines||[]).some(function(l){return isFlow(l)&&l.hexes.indexOf(k)>=0})}
function streamSegs(ty){var o=[];(S.lines||[]).forEach(function(l){if(isFlow(l)&&(!ty||l.type===ty))for(var i=1;i<l.pts.length;i++)o.push([l.pts[i-1],l.pts[i]])});return o}
function segX(p1,p2,p3,p4){
  function o(a,b,c){return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])}
  var d1=o(p3,p4,p1),d2=o(p3,p4,p2),d3=o(p1,p2,p3),d4=o(p1,p2,p4);
  return ((d1>0&&d2<0)||(d1<0&&d2>0))&&((d3>0&&d4<0)||(d3<0&&d4>0));
}
function crossStream(k1,k2,segs){
  segs=segs||streamSegs();if(!segs.length)return false;
  var a=center(k1%COLS,Math.floor(k1/COLS)),b=center(k2%COLS,Math.floor(k2/COLS));
  return segs.some(function(s){return segX(a,b,s[0],s[1])});
}
