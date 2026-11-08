const path=require('path');{const o=path.join(__dirname,'out');require('fs').mkdirSync(o,{recursive:true});process.chdir(o)}
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:950}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'..','dist','test-wrap.html'));const st=fs.readFileSync(path.join(__dirname,'fixtures','fort2.json'),"utf8");await p.evaluate(s=>localStorage.setItem("realmforge-chal-1",s),st);await p.reload();
const E=x=>p.evaluate(x=>__ev(x),x);const which=process.argv[2];
let info='';
for(let tries=0;tries<20;tries++){info=await E(`(function(){if(S.match){delete S.match;Object.assign(S,JSON.parse(localStorage.getItem('realmforge-chal-1')));syncDims()}startMatch();var M=S.match;M.autoPause=false;return JSON.stringify(M.camps.map(m=>[m.type,m.mobs.length]))})()`);if(info.indexOf(which)>=0)break}
console.log(info);
console.log(await E(`(function(){var M=S.match;M.camps=M.camps.filter(c=>c.type==='${which}').slice(0,1);var m=M.camps[0];var U=S.units[0],L=U.live;U.route=null;
 if(m.type==='pigger'){m.spawnAt=5;var s=S.setl[0];var nb=nbrs(s.c,s.r).filter(q=>hexSpeed(ix(q[0],q[1]))&&!setAt(q[0],q[1]))[0];m.lair=ix(nbrs(nb[0],nb[1])[0][0],nbrs(nb[0],nb[1])[0][1]);S.units.forEach(U=>{U.route=null});return 'pigger lair '+lab(lairPos(m)[0],lairPos(m)[1])}
 var T={};m.terr.forEach(k=>T[k]=1);var edge=null;for(var k=0;k<COLS*ROWS;k++){if(T[k]||!hexSpeed(k))continue;var c=k%COLS,r=Math.floor(k/COLS);if(nbrs(c,r).some(q=>T[ix(q[0],q[1])])){edge=[c,r];break}}
 L.pos=edge.slice();L.path=[];L.mode='hold';L.xy=null;return 'unit at '+lab(edge[0],edge[1])})()`));
let shot=false;
for(let t=0;t<1500;t++){const r=await E(`(function(){advance(1);var M=S.match;if(!M)return 'over';if(M.over)return 'over:'+M.over;var b=(M.battles||[]).filter(x=>!x.done)[0];var pm=M.camps[0];return b?('B'+b.bt+' '+b.units.filter(u=>u.alive&&!u.gone).length+'v'+b.foes.filter(f=>f.alive).length):('.'+(pm&&pm.pos?lab(pm.pos[0],pm.pos[1]):'')+(pm&&pm.batter?' batter':''))})()`);
 if(t%100===0)console.log(t,r);var bm=/^B(\d+)/.exec(r);if(bm&&+bm[1]>=12&&!shot){shot=true;await E(`(function(){var b=S.match.battles.filter(x=>!x.done)[0];UI.tab='match';UI.pzGo=bGo(b);render();return 1})()`);await p.waitForTimeout(700);await (await p.$('#pz-m')).screenshot({path:'c19-'+which+'.png'})}
 if(r.startsWith('over'))break}
console.log(await E(`S.match?S.match.log.map(l=>l.t+' '+l.m).join('\\n'):'no match'`));
console.log(errs);await b.close()})();
