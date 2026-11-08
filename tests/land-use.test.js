const path=require('path');{const o=path.join(__dirname,'out');require('fs').mkdirSync(o,{recursive:true});process.chdir(o)}
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'..','dist','test-wrap.html'));await p.evaluate(()=>localStorage.clear());await p.reload();
const E=x=>p.evaluate(x=>__ev(x),x);
console.log(await E(`(function(){S.prestige=50000;var o=[];growRealm=function(){};
 var put=function(c,r,t){var k=ix(c,r);S.grid[k]=t;S.hgt[k]={s:'flat',b:0}};
 // a 9x7 realm: farm core with a pond, woods to the west, orchards
 for(var r=0;r<7;r++)for(var c=0;c<9;c++)put(c,r,'cultivated');
 put(4,3,'pond');[[0,0],[0,1],[0,2],[1,0],[1,1]].forEach(q=>put(q[0],q[1],'forest'));[[0,3],[0,4],[1,2]].forEach(q=>put(q[0],q[1],'woodland'));
 // empty spots for the village and the test pasture
 [[6,4],[7,4],[3,3],[5,3],[4,2]].forEach(q=>{S.grid[ix(q[0],q[1])]=null;S.hgt[ix(q[0],q[1])]=null});
 for(var i=0;i<3;i++)mk('setcard');for(var i=0;i<3;i++)mk('t_orchard');for(var i=0;i<3;i++)mk('t_pasture');mk('t_field');for(var i=0;i<20;i++){mk('lumber');mk('gravel')}
 var tryV=function(){UI.place={t:'s',k:'village'};doPlace(6,4);if(UI.place&&UI.place.first)doPlace(7,4);return UI.msg};
 o.push('village, no orchards: '+tryV());
 UI.place={t:'t',k:'orchard'};doPlace(3,3);doPlace(5,3);doPlace(4,2);o.push('orchards: '+UI.msg);
 o.push('village: '+tryV());
 // pastures need prairie
 S.grid[ix(5,0)]=null;S.grid[ix(6,0)]=null;S.grid[ix(7,0)]=null;
 UI.place={t:'t',k:'pasture'};doPlace(5,0);o.push('pasture w/o field: '+UI.msg.slice(0,50));
 UI.place={t:'t',k:'field'};doPlace(7,0);UI.place={t:'t',k:'pasture'};doPlace(5,0);o.push('pasture 1: '+UI.msg.slice(0,40));doPlace(6,0);o.push('pasture 2: '+UI.msg.slice(0,40));
 var SU=supply();o.push(JSON.stringify(SU.set));return o.join('\\n')})()`));
await E(`UI.tab='realm';UI.supSel=S.setl[0]?S.setl[0].id:'p';UI.place=null;render();1`);await p.waitForTimeout(500);
await (await p.$('#pz-r')).screenshot({path:'c16-map.png'});
const pan=await p.$$('.split section');await pan[1].screenshot({path:'c16-panel.png'});
console.log(errs);await b.close()})();
