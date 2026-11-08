/* ---------- actions ---------- */
function placedCount(){var n=0,r,c;for(r=0;r<S.bh;r++)for(c=0;c<S.bw;c++)if(S.grid[r*S.bw+c]||setAt(c,r))n++;return n}
function growRealm(){
  if(S.match)return;
  var n=placedCount(),bw=S.bw,bh=S.bh;if(n<bw*bh*.5)return;
  var area=n*10,W=Math.max(bw+2,Math.ceil(Math.sqrt(area*bw/bh))),H=Math.max(bh+2,Math.ceil(area/W));
  var dc=Math.floor((W-bw)/2),dr=Math.floor((H-bh)/2);dr-=dr%2;
  var g=[],i;for(i=0;i<W*H;i++)g.push(null);
  var hg=[];for(i=0;i<W*H;i++)hg.push(null);
  for(i=0;i<bw*bh;i++){var c=i%bw,r=Math.floor(i/bw);g[(r+dr)*W+(c+dc)]=S.grid[i];hg[(r+dr)*W+(c+dc)]=(S.hgt||[])[i]||null}
  S.grid=g;S.hgt=hg;S.bw=W;S.bh=H;
  S.setl.forEach(function(s){s.c+=dc;s.r+=dr;if(s.c2!=null){s.c2+=dc;s.r2+=dr}});
  syncDims();shiftLines(Math.sqrt(3)*SH*dc,SH*1.5*dr);shiftRoutes(dc,dr);
  UI.tile=null;UI.zoom=null;
  UI.grown='Your realm filled half the map, so the map zoomed out to '+W+' × '+H+'. Keep building.';
}
function placedAt(c,r){return !!(S.grid[ix(c,r)]||setAt(c,r))}
