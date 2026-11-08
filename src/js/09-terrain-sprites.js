/* ---------- 8-bit terrain art ---------- */
var DITHER={pwood:['#3d5e4a','#456852'],pforest:['#2a4a3c','#315444'],forest:['#2c4a2e','#335536'],water:['#3a6e98','#4680aa'],woodland:['#3f6b3f','#467546'],swamp:['#456b66','#4d746f'],pond:['#3f78a0','#4a85ae'],field:['#9db25a','#a8bc66'],cultivated:['#b88f3d','#c09845'],pasture:['#7fa04a','#88a953'],orchard:['#8a9a4a','#96a654']};
var SPR={};['woodland','swamp','pond','field','cultivated','pasture'].forEach(function(k){SPR[k]=ART16['t_'+k]});SPR.forest=SPR.woodland;SPR.water=SPR.pond;SPR.pwood=SPR.woodland;SPR.pforest=SPR.woodland;SPR.orchard=SPR.woodland;['hamlet','camp','village'].forEach(function(k){SPR['set_'+k]=ART16['set_'+k]});
DITHER.settle=['#6f5a3e','#7a6446'];
function artDefs(){
  var o='<defs>';
  Object.keys(DITHER).forEach(function(k){var d=DITHER[k];o+='<pattern id="pt-'+k+'" width="8" height="8" patternUnits="userSpaceOnUse" shape-rendering="crispEdges"><rect width="8" height="8" fill="'+d[0]+'"/><rect width="2" height="2" fill="'+d[1]+'"/><rect x="4" y="4" width="2" height="2" fill="'+d[1]+'"/></pattern>'});
  return o+'</defs>';
}
function sprite(k,cx,cy){
  var sp=SPR[k],o='<g transform="translate('+(cx-18).toFixed(1)+' '+(cy-18).toFixed(1)+') scale(3)" shape-rendering="crispEdges" pointer-events="none">';
  sp.r.forEach(function(q){o+='<rect x="'+q[1]+'" y="'+q[2]+'" width="'+q[3]+'" height="'+q[4]+'" fill="'+sp.c[q[0]]+'"/>'});
  return o+'</g>';
}


