'use strict';
var KEY='realmforge-chal-1';
var COLS=9,ROWS=7,SH=30,LET='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var TERR={
  woodland:{n:'Oak woodland',cost:25,ppl:.04,ab:'Wo',sp:.7},
  swamp:{n:'Swamp',cost:10,ppl:.15,ab:'Sw',sp:.5},
  pond:{n:'Pond',cost:50,ppl:1.3,ab:'Po',sp:0},
  field:{n:'Field',cost:25,ppl:.25,ab:'Fi',sp:1},
  cultivated:{n:'Cultivated field',cost:100,ppl:20,ab:'Cu',sp:1},
  pasture:{n:'Pasture',cost:100,ppl:5,ab:'Pa',sp:1},
  forest:{n:'Oak forest',cost:30,ppl:.03,ab:'Fo',sp:.5},
  pwood:{n:'Pine woodland',cost:25,ppl:.04,ab:'Pw',sp:.85},
  pforest:{n:'Pine forest',cost:30,ppl:.03,ab:'Pf',sp:.7},
  water:{n:'Small open water',cost:60,ppl:1.5,ab:'Ow',sp:0},
  orchard:{n:'Orchard',cost:100,ppl:12,ab:'Or',sp:.9}
};
var TERR_W={woodland:14,swamp:18,pond:7,field:16,cultivated:12,pasture:12,forest:8,water:5,pwood:12,pforest:8,orchard:6};
var SETT={
  hamlet:{n:'Hamlet',cost:500,mats:{lumber:10,gravel:10},cards:1,need:150,ab:'Ha',maxPal:1,def:15},
  camp:{n:'Military camp',cost:500,cards:1,need:100,ab:'Ca',maxPal:1,def:50},
  village:{n:'Village',cost:1000,cards:3,need:450,ab:'Vi',maxPal:3,def:null,hexes:2}
};
var CAMP_WILD=50,WILD={woodland:1,swamp:1,field:1,forest:1,pwood:1,pforest:1};
/* the largest stretch of wilderness you can walk through without touching farmland, pasture or a settlement */
function wildCount(){var best=0,seen={},W=S.bw,H=S.bh,r,c;
  for(r=0;r<H;r++)for(c=0;c<W;c++){var k0=r*W+c;if(seen[k0]||!WILD[S.grid[k0]]||setAt(c,r))continue;var q=[[c,r]],n=0;seen[k0]=1;
    while(q.length){var p=q.pop();n++;nbrs(p[0],p[1]).forEach(function(z){var k=z[1]*W+z[0];if(!seen[k]&&WILD[S.grid[k]]&&!setAt(z[0],z[1])){seen[k]=1;q.push(z)}})}
    if(n>best)best=n}
  return best}
var PAL_COST=300,PAL_MATS={lumber:10};/* the old palisade card, kept only so old saves load */
