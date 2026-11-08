const path=require('path');{const o=path.join(__dirname,'out');require('fs').mkdirSync(o,{recursive:true});process.chdir(o)}
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:950}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'..','dist','test-wrap.html'));
const st=fs.readFileSync(path.join(__dirname,'fixtures','fort.json'),"utf8");await p.evaluate(s=>localStorage.setItem("realmforge-chal-1",s),st);await p.reload();
const E=x=>p.evaluate(x=>__ev(x),x);
// c8 left a saved fort realm in localStorage
await E(`(function(){startMatch();var M=S.match;M.camps.forEach(m=>{m.mobs=[]});M.autoPause=false;M.speed=0;
 var s=S.setl[0],nb=nbrs(s.c,s.r).filter(q=>hexSpeed(ix(q[0],q[1]))&&!setAt(q[0],q[1]))[0];
 var m={key:'tg',type:'${process.argv[2]||'goblin'}',hexes:[],lair:ix(nb[0],nb[1]),mobs:[],roam:true,pos:nb.slice(),path:[[s.c,s.r]],rem:HEX_YD,wait:0,reward:100};
 for(var i=0;i<${process.argv[3]||8};i++)m.mobs.push(m.type==='goblin'?{k:'goblin',hp:50}:{k:'brigand',hp:100,w:i%3?'spear':'club'});
 M.camps.push(m);window.TM=m;S.units.forEach(U=>{U.route=null;if(U.live){U.live.mode='idle';U.live.path=[]}});return JSON.stringify({set:[s.c,s.r],nb:nb,garr:garrisonOf(s).length,tw:towers().map(t=>(t.men||[]).length)})})()`).then(console.log);
for(let t=0;t<900;t++){const r=await E(`(function(){advance(1);var M=S.match;if(!M)return 'over';var b=(M.battles||[])[0];return b?('B'+b.bt+' '+b.units.filter(u=>u.alive&&!u.gone).length+'v'+b.foes.filter(f=>f.alive).length):(TM.batter?'batter '+TM.batter.t:'.')})()`);
  if(t%60===0||r==='over')console.log(t,r); if(r==='over')break;
  if(t===40){await E(`(function(){var b=(S.match.battles||[])[0];if(!b)return 0;UI.tab='match';UI.pzGo=bGo(b);render();return 1})()`);await p.waitForTimeout(600);await (await p.$('#pz-m')).screenshot({path:'c9-a.png'})}
  if(r.startsWith&&r.startsWith('B')){} }
console.log(await E(`S.match?S.match.log.map(l=>l.t+' '+l.m).slice(-14).join('\\n'):'no match'`));
console.log(await E(`JSON.stringify({whp:S.match&&S.match.whp?Object.values(S.match.whp)[0].filter(x=>x<600).map(x=>Math.round(x)):null,ghp:S.match&&S.match.ghp})`));
console.log(errs);await b.close()})();
