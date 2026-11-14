// Replays tutorial fight 1 from a checkpoint N times and prints how each battle ended. CK=<file in tests/out> N=<runs>
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:900}});
const url='file://'+path.join(__dirname,'..','dist','test-wrap.html');await p.goto(url);
const ck=fs.readFileSync(path.join(__dirname,'out',process.env.CK||'tut-f1.json'),'utf8');
const N=+(process.env.N||3);const res=[];
for(let i=0;i<N;i++){await p.evaluate(ck=>localStorage.setItem('realmforge-chal-1',ck),ck);await p.reload();
await p.evaluate(()=>__ev(`(function(){var o=endBattle;endBattle=function(b){window.__bres=window.__bres||[];window.__bres.push({men:b.units.map(function(u){return u.name.slice(-3)+':'+Math.round(u.hp)+(u.alive?'':'X')+(u.spells&&u.spells.length?' m'+u.mana+' c'+(u.casts||0):'')+' '+(u.w||'')}),foes:b.foes.filter(function(f){return f.alive}).length+'/'+b.foes.length,clock:Math.round(b.t1||0),flk:b.flk});return o(b)}})()`));
await p.click('[data-act="tutenc"]');
for(let k=0;k<400;k++){if(k%50==0)console.log(k,await p.evaluate(()=>{const M=__ev("S.match");return M?M.log.slice(-1)[0].m+" | "+(M.battles||[]).map(b=>b.phase+(b.done?"D":"")).join(","):"none"}));await p.waitForTimeout(100);if(!(await p.evaluate(()=>!!__ev("S.match")))||await p.evaluate(()=>!!window.__bres))break;
 if(await p.$('[data-act="bfight"]')){if(!process.env.NOAUTO)await p.click('[data-act="bfauto"]').catch(()=>{});await p.click('[data-act="bfight"]').catch(()=>{})}
 await p.click('.speedbar [data-act="mspd"][data-s="60"]:not(.on)',{timeout:200}).catch(()=>{});await p.click('#bctl [data-act="mspd"][data-s="10"]:not(.on)',{timeout:200}).catch(()=>{});}
const r=await p.evaluate(()=>({b:window.__bres,won:!!__ev('S.tut.won[1]')}));console.log(JSON.stringify(r));}
await b.close()})();
