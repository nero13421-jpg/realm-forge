const path=require('path');{const o=path.join(__dirname,'out');require('fs').mkdirSync(o,{recursive:true});process.chdir(o)}
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'..','dist','test-wrap.html'));await p.evaluate(()=>localStorage.clear());await p.reload();
const E=x=>p.evaluate(x=>__ev(x),x);
console.log(await E(`(function(){var put=function(c,r,t,h){var k=ix(c,r);S.grid[k]=t;S.hgt[k]=h};
 put(2,3,'field',{s:'flat',b:50});put(3,3,'woodland',{s:'flat',b:0});put(4,3,'field',{s:'flat',b:0});put(5,3,'pond',{s:'flat',b:0});put(3,2,'field',{s:'flat',b:50});put(4,2,'field',{s:'flat',b:0});put(2,2,'field',{s:'flat',b:50});put(3,4,'field',{s:'flat',b:50});put(4,4,'field',{s:'flat',b:0});
 // a high pool up on the plateau feeding a creek over the drop
 put(1,3,'pond',{s:'flat',b:50});
 var a=center(1,3),z=center(5,3);var pts=[[a[0]+4,a[1]],[center(2,3)[0],a[1]+3],[center(3,3)[0],a[1]-2],[center(4,3)[0]-6,a[1]+1],[z[0]-6,z[1]]];
 S.lines.push({type:'creek',pts:pts,hexes:lineHexes(pts)});
 var runs=fallRuns(S.lines[0]);UI.tab='realm';var m=center(3,3);var rr=fallRuns(S.lines[0])[0].p,zz=rr[Math.floor(rr.length/2)];UI.pzGo={k:"r",x:zz[0],y:zz[1],w:60,h:44};save();render();
 return JSON.stringify({runs:runs.map(r=>[r.p.length,Math.round(r.drop)]),rule:lineRuleMsg('creek',pts)})})()`));
await p.waitForTimeout(500);await (await p.$('#pz-r')).screenshot({path:'c14-map.png'});
await E(`(function(){var r=fallRuns(S.lines[0])[0],z=r.p[Math.floor(r.p.length/2)];UI.pzGo={k:'r',x:z[0],y:z[1],w:20,h:15};render();return 1})()`);await p.waitForTimeout(900);
await (await p.$('#pz-r')).screenshot({path:'c14-deep.png'});
console.log(await E(`(function(){var r=fallRuns(S.lines[0])[0],z=r.p[Math.floor(r.p.length/2)],F=bfGenAt(z[0],z[1],5),sv=bfSvg(F,"tt",false);var d=document.createElement("div");d.id="tst";d.style.width="900px";d.innerHTML=sv;document.body.prepend(d);return (sv.match(/<rect x/g)||[]).length+" rects; foam "+d.querySelectorAll(".wfall rect").length})()`));await (await p.$("#tst")).screenshot({path:"c14-field.png"});
console.log(await E('document.querySelectorAll(".wfall rect").length+" foam cells, "+document.querySelectorAll(".falls").length+" falls"'));
console.log(errs);await b.close()})();
