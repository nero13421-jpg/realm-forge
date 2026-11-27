/* kharst: placeable, half a pasture toward a hamlet, slow, broken ground on the battlefield; hillside fields and pastures */
const path=require('path');{const o=path.join(__dirname,'out');require('fs').mkdirSync(o,{recursive:true});process.chdir(o)}
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'..','dist','test-wrap.html'));await p.evaluate(()=>localStorage.clear());await p.reload();
const E=x=>p.evaluate(x=>__ev(x),x);
console.log(await E(`(function(){S.prestige=50000;var o=[];growRealm=function(){};
 var put=function(c,r,t){var k=ix(c,r);S.grid[k]=t;S.hgt[k]={s:'flat',b:0}};
 for(var r=0;r<6;r++)for(var c=0;c<8;c++)put(c,r,'cultivated');put(3,2,'pond');put(0,0,'woodland');
 [[6,4],[5,0],[6,0],[7,0],[7,2],[0,5],[7,5]].forEach(q=>{S.grid[ix(q[0],q[1])]=null;S.hgt[ix(q[0],q[1])]=null});
 mk('setcard');for(var i=0;i<6;i++)mk('t_kharst');mk('t_pasture');mk('t_field');mk('e_gs_cultivated');mk('e_ms_pasture');for(var i=0;i<20;i++){mk('lumber');mk('gravel')}
 o.push('kharst cost '+TERR.kharst.cost+' · pasture cost '+TERR.pasture.cost+' · speed '+TERR.kharst.sp);
 UI.place={t:'t',k:'kharst'};doPlace(5,0);doPlace(6,0);doPlace(7,0);doPlace(7,2);o.push('kharst: '+UI.msg.slice(0,40));
 UI.place={t:'s',k:'hamlet'};doPlace(6,4);o.push('hamlet on 4 kharst: '+UI.msg.slice(0,70));
 var R=supply().set[S.setl[0]&&S.setl[0].id];o.push('pastures '+(R?R.past:'-'));
 UI.rot=0;UI.place={t:'e',k:'gs_cultivated'};doPlace(0,5);o.push('hill field near water: '+UI.msg.slice(0,60));
 S.grid[ix(4,3)]=null;S.hgt[ix(4,3)]=null;UI.place={t:'e',k:'gs_cultivated'};doPlace(4,3);o.push('hill field by the pond: '+UI.msg.slice(0,60));UI.place={t:'e',k:'ms_pasture'};doPlace(7,5);o.push('hill pasture, no field: '+UI.msg.slice(0,50));
 return o.join('\\n')})()`));
const bf=await E(`(function(){var F=bfGenAt(center(6,0)[0],center(6,0)[1],5),c={};for(var i=0;i<F.g.length;i++){var ch=F.g.charAt(i);c[ch]=(c[ch]||0)+1}return JSON.stringify(c)})()`);
console.log('battlefield cells on kharst',bf);
await E(`UI.tab='realm';UI.place=null;render();1`);await p.waitForTimeout(600);await (await p.$('#pz-r')).screenshot({path:'kharst-map.png'});
await E(`(function(){var F=bfGenAt(center(6,0)[0],center(6,0)[1],5);F.n='Kharst';document.body.innerHTML='<div style="width:900px">'+bfSvg(F,'kx',false)+'</div>';return 1})()`);await p.waitForTimeout(300);await (await p.$('svg.bfield')).screenshot({path:'kharst-field.png'});
console.log(errs);await b.close()})();
