/* moon eyes and the watcher: forced onto ground next to a squad, then fought out. node tests/moon-watcher.test.js <moon|watcher> */
const path=require('path');{const o=path.join(__dirname,'out');require('fs').mkdirSync(o,{recursive:true});process.chdir(o)}
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:950}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'..','dist','test-wrap.html'));const st=fs.readFileSync(path.join(__dirname,'fixtures','fort2.json'),"utf8");await p.evaluate(s=>localStorage.setItem("realmforge-chal-1",s),st);await p.reload();
const E=x=>p.evaluate(x=>__ev(x),x);const which=process.argv[2]||'moon';
console.log(await E(`(function(){startMatch();var M=S.match;M.autoPause=false;
 var gen=M.camps.filter(c=>c.type==='moon'||c.type==='watcher').map(c=>c.type+' on '+c.terr.length+' tiles').join(', ')||'none generated this time';
 var s=S.setl[0],U=S.units[0],L=U.live;if(${process.env.SPELLS?1:0})U.hids.slice(4).forEach(id=>{var h=byId(id);h.mana=6;h.spells=['p_shower','p_grenade','p_bolt']});S.units.forEach(V=>{V.route=null});
 /* their ground: a ring of open tiles two steps out from the first hamlet */
 var ring=[];for(var k=0;k<COLS*ROWS;k++){var c=k%COLS,r=Math.floor(k/COLS);if(M.mine[k]||!hexSpeed(k))continue;var d=hexDist([c,r],[s.c,s.r]);if(d>=3&&d<=5)ring.push(k)}
 var RS={};ring.forEach(k=>RS[k]=1);var terr=[ring[0]],seen={};seen[ring[0]]=1;for(var qi=0;qi<terr.length&&terr.length<('${which}'==='moon'?18:5);qi++){nbrs(terr[qi]%COLS,Math.floor(terr[qi]/COLS)).forEach(q=>{var j=ix(q[0],q[1]);if(RS[j]&&!seen[j]&&terr.length<('${which}'==='moon'?18:5)){seen[j]=1;terr.push(j)}})}var mobs=[];if('${which}'==='moon'){for(var i=0;i<24;i++)mobs.push({k:'moon',hp:20})}else mobs.push({k:'watcher',hp:200});
 M.camps=[{key:'t0',type:'${which}',hexes:[],lair:terr[0],terr:terr,reward:100,mobs:mobs,roam:true,pos:[terr[0]%COLS,Math.floor(terr[0]/COLS)],path:[],rem:0,wait:0,razed:true}];
 var T={};terr.forEach(k=>T[k]=1);var edge=null;for(var k=0;k<COLS*ROWS;k++){if(T[k]||!hexSpeed(k))continue;var c=k%COLS,r=Math.floor(k/COLS);if(nbrs(c,r).some(q=>T[ix(q[0],q[1])])){edge=[c,r];break}}
 L.pos=edge.slice();L.path=[];L.mode='hold';L.xy=null;return 'generated: '+gen+' · squad of '+U.hids.length+' at '+lab(edge[0],edge[1])})()`));
let shot=false,frz=0,grab=0,burst=0;
for(let t=0;t<2500;t++){const r=await E(`(function(){advance(1);var M=S.match;if(!M)return 'over';if(M.over)return 'over:'+M.over;var b=(M.battles||[]).filter(x=>!x.done)[0];if(!b)return '.';if(${process.env.CHARGE?1:0}&&!b._ch){b._ch=1;b.teams.forEach(t=>{t.order='advance'})}
  var ev=b.ev.slice(-20).map(e=>e.lab||'').join('|');return 'B'+b.bt+' '+b.units.filter(u=>u.alive&&!u.gone).length+'v'+b.foes.filter(f=>f.alive).length+' '+ev})()`);
 if(/freeze|rears up/.test(r))frz++;if(/grabbed/.test(r))grab++;if(/moonlight/.test(r))burst++;
 if(t%(+process.env.EV||150)===0)console.log(t,r.slice(0,90));var bm=/^B(\d+)/.exec(r);if(bm&&+bm[1]>=15&&!shot){shot=true;await E(`(function(){var b=S.match.battles.filter(x=>!x.done)[0];UI.tab='match';UI.pzGo=bGo(b);render();return 1})()`);await p.waitForTimeout(800);await (await p.$('#pz-m')).screenshot({path:'mw-'+which+'.png'})}
 if(r.startsWith('over')||(r==='.'&&shot&&t>40))break}
console.log('ticks with freeze',frz,'grab',grab,'moonlight',burst);
console.log(await E(`S.match?S.match.log.slice(-8).map(l=>l.t+' '+l.m).join('\\n'):'no match'`));
console.log(errs);await b.close()})();
