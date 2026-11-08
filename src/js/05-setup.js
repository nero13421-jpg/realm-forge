/* ---------- setup ---------- */
function fresh(){
  S={v:1,nid:1,hn:0,sid:1,prestige:3500,grid:[],hgt:[],setl:[],cards:[],packs:5,units:[],uid:1,lines:[],routes:[],rid:1,bw:9,bh:7};
  for(var i=0;i<COLS*ROWS;i++){S.grid.push(null);(S.hgt=S.hgt||[]).push(null)}
  Object.keys(TERR).forEach(function(k){for(var n=0;n<10;n++)mk('t_'+k)});Object.keys(ELEV).forEach(function(e){EKIND.forEach(function(k){for(var n=0;n<3;n++)mk('e_'+e+'_'+k)})});
  for(var q=0;q<3;q++)mk('setcard');for(var hq=0;hq<15;hq++)mk('human');S.startSet=1;
}
function initUI(){
  if(!UI.mfold){try{UI.mfold=JSON.parse(localStorage.getItem(KEY+'-folds')||'{}')||{}}catch(x){UI.mfold={}}}
  UI.sel=S.setl.length?S.setl[0].id:null;
  var hs=humans();
  UI.hum=hs.length?hs[0].id:null;
  UI.R=S.routes&&S.routes.length?S.routes[0].id:null;
}

/* ---------- views ---------- */

