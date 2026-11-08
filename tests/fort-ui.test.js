const path=require('path');{const o=path.join(__dirname,'out');require('fs').mkdirSync(o,{recursive:true});process.chdir(o)}
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'..','dist','test-wrap.html'));const st=fs.readFileSync(path.join(__dirname,'fixtures','tut15.json'),'utf8');await p.evaluate(s=>{const o=JSON.parse(s);o.tut=null;localStorage.setItem('realmforge-chal-1',JSON.stringify(o))},st);await p.reload();
const E=x=>p.evaluate(x=>__ev(x),x);
await E(`(function(){for(var i=0;i<7;i++)mk('stimber');for(var i=0;i<2;i++)mk('ltimber');for(var i=0;i<4;i++)mk('gravel');for(var i=0;i<12;i++)mk('human');S.prestige+=3000;UI.tab='realm';var C=coreOf(S.setl[1]);UI.pzGo={k:'r',x:C.c[0],y:C.c[1],w:46,h:34};render();return 1})()`);
await p.waitForTimeout(400);
await p.click('button[data-k="wall_s"]');
// click a loop on screen around the hamlet core, via map->screen conversion
const pts=await E(`(function(){var svg=document.querySelector('svg[data-pz="r"]'),M=svg.getScreenCTM(),C=coreOf(S.setl[1]),o=[];for(var i=0;i<=12;i++){var a=i/12*Math.PI*2,x=C.c[0]+Math.cos(a)*C.r*.98,y=C.c[1]+Math.sin(a)*C.r*.98;o.push([M.a*x+M.c*y+M.e,M.b*x+M.d*y+M.f])}return JSON.stringify(o)})()`);
for(const q of JSON.parse(pts)){await p.mouse.click(q[0],q[1]);await p.waitForTimeout(60)}
console.log(await E('JSON.stringify({n:UI.draw&&UI.draw.pts.length,len:UI.draw&&Math.round(drawLenM(UI.draw)),msg:UI.msg})'));
await (await p.$('.split section:nth-child(2)')).screenshot({path:'c11-panel.png'});
await p.click('button[data-act="dfinish"]');await p.waitForTimeout(200);
console.log(await E('JSON.stringify({walls:walls().length,msg:UI.msg,free:laborFree().length})'));
// gate on the east side via button + tap
await p.click('button[data-k="gate"]');
await p.evaluate(()=>document.querySelector('#pz-r').scrollIntoView());await p.waitForTimeout(100);
const gq=await E(`(function(){var svg=document.querySelector('svg[data-pz="r"]'),M=svg.getScreenCTM(),w=walls()[0],G=wallGeo(w),q=G.at(G.L*.5);return JSON.stringify([M.a*q[0]+M.c*q[1]+M.e,M.b*q[0]+M.d*q[1]+M.f])})()`);
const g2=JSON.parse(gq);console.log(g2,await p.evaluate(([x,y])=>{var e=document.elementFromPoint(x,y);return e?e.outerHTML.slice(0,160):"none"},g2));
await p.mouse.click(g2[0],g2[1]);await p.waitForTimeout(200);
console.log(await E('JSON.stringify({gates:gates().length,msg:UI.msg})'));
// tower
await p.click('button[data-k="tower"]');await p.evaluate(()=>document.querySelector('#pz-r').scrollIntoView());await p.waitForTimeout(100);const tq=await E(`(function(){var svg=document.querySelector('svg[data-pz="r"]'),M=svg.getScreenCTM(),g=gates()[0].pts[0],x=g[0]-1.2,y=g[1]-1.2;return JSON.stringify([M.a*x+M.c*y+M.e,M.b*x+M.d*y+M.f])})()`);
const t2=JSON.parse(tq);await p.mouse.click(t2[0],t2[1]);await p.waitForTimeout(200);
console.log(await E('JSON.stringify({towers:towers().length,msg:UI.msg})'));
// station a man
const opt=await E(`document.querySelector('select[data-twadd]')?document.querySelector('select[data-twadd] option:nth-child(2)').value:''`);
if(opt){await p.selectOption('select[data-twadd]',opt);await p.waitForTimeout(200)}
console.log(await E('JSON.stringify({men:towers()[0].men,msg:UI.msg})'));
// drag a longhouse
const lh=await p.$('[data-lh="'+(await E('S.setl[1].id'))+':0"]');const bb=await lh.boundingBox();const before=await E('JSON.stringify(S.setl[1].lh[0])');
await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.mouse.move(bb.x+bb.width/2-60,bb.y+bb.height/2+40,{steps:6});await p.mouse.up();await p.waitForTimeout(200);
const lh2=await p.$('[data-lh="'+(await E('S.setl[1].id'))+':1"]');const bb2=await lh2.boundingBox();await p.mouse.click(bb2.x+bb2.width/2,bb2.y+bb2.height/2);await p.waitForTimeout(200);
console.log('lh',before,await E('JSON.stringify([S.setl[1].lh[0],S.setl[1].lh[1]])'));
await (await p.$('#pz-r')).screenshot({path:'c11-map.png'});
await (await p.$('.split section:nth-child(2)')).screenshot({path:'c11-panel2.png'});
console.log(errs);await b.close()})();
