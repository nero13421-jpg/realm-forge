const path=require('path');{const o=path.join(__dirname,'out');require('fs').mkdirSync(o,{recursive:true});process.chdir(o)}
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:1400}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'..','dist','test-wrap.html'));await p.evaluate(()=>localStorage.clear());await p.reload();
await p.evaluate(()=>{window.__S=function(){return __ev('S')};window.__UI=function(){return __ev('UI')}});
const S=(f,a)=>p.evaluate(f,a);const step=async()=>S(()=>__S().tut&&__S().tut.step);
const next=async(label)=>{if(await p.$('[data-act="lootok"]')){console.log('loot popup:',(await p.innerText('.lootcard')).replace(/\n/g,' ').slice(0,160));await p.click('[data-act="lootok"]')}const st=await step();const dis=await p.$eval('[data-act="tutnext"]',e=>e.disabled).catch(()=>'none');if(dis!==false){console.log('NOT DONE at',st,label,await p.innerText('.tutgoal').catch(()=>''));await p.click('[data-act="tutskip"]')}else await p.click('[data-act="tutnext"]');console.log('step',st,'→',await step(),label)};
const t0=Date.now();
await p.click('[data-act="tutstart"] >> nth=0');await p.click('[data-act="tutstart"] >> nth=0');console.log('tut started',await step());
await next('welcome');
// farmland: a block around the board centre
const placeTiles=async(k,n)=>{await p.click('[data-tab="realm"]');await p.click(`[data-act="plc"][data-t="t"][data-k="${k}"]`);let placed=0;
  for(let g=0;g<200&&placed<n;g++){const cand=await S(()=>{const s=__S(),W=s.bw,H=s.bh,out=[];const taken=(c,r)=>s.grid[r*W+c]||s.setl.some(x=>(x.c===c&&x.r===r)||(x.c2===c&&x.r2===r));const any=s.grid.some(Boolean)||s.setl.length;
    for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(taken(c,r))continue;const nb=(r&1)?[[1,0],[-1,0],[0,-1],[1,-1],[0,1],[1,1]]:[[1,0],[-1,0],[-1,-1],[0,-1],[-1,1],[0,1]];const t=nb.some(d=>{const C=c+d[0],R=r+d[1];return C>=0&&R>=0&&C<W&&R<H&&taken(C,R)});if(t||!any)out.push([c,r,Math.abs(c-W/2)+Math.abs(r-H/2)])}out.sort((a,b)=>a[2]-b[2]);return out[0]});
    if(!cand)break;const before=await S(()=>__S().grid.filter(Boolean).length);await p.click(`[data-act="hex"][data-c="${cand[0]}"][data-r="${cand[1]}"]`);const after=await S(()=>__S().grid.filter(Boolean).length);if(after>before)placed++;else{console.log('place fail',await p.innerText('.msg').catch(()=>''));break}}
  return placed};
const hamlet=async()=>{await p.click('[data-tab="realm"]');await p.click('[data-act="plc"][data-t="s"][data-k="hamlet"]');const cand=await S(()=>{const s=__S(),W=s.bw,H=s.bh;const taken=(c,r)=>s.grid[r*W+c]||s.setl.some(x=>x.c===c&&x.r===r);for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(taken(c,r))continue;const nb=(r&1)?[[1,0],[-1,0],[0,-1],[1,-1],[0,1],[1,1]]:[[1,0],[-1,0],[-1,-1],[0,-1],[-1,1],[0,1]];const ns=nb.map(d=>[c+d[0],r+d[1]]).filter(q=>q[0]>=0&&q[1]>=0&&q[0]<W&&q[1]<H);if(ns.some(q=>taken(q[0],q[1]))&&!ns.some(q=>s.setl.some(x=>x.c===q[0]&&x.r===q[1])))return[c,r]}});await p.click(`[data-act="hex"][data-c="${cand[0]}"][data-r="${cand[1]}"]`);console.log('hamlet',await p.innerText('.msg').catch(()=>''))};
console.log('placed',await placeTiles('cultivated',8));await next('farmland');
await hamlet();await next('hamlet');
await p.click('[data-tab="packs"]');await p.click('[data-act="assignall"]');await next('assign');
await p.click('[data-tab="settle"]');await p.fill('#snm','Riverbend');await p.press('#snm','Tab');await next('name');
const equip=async(hid,key)=>{await p.click(`[data-act="selhum"][data-id="${hid}"]`);const ids=await p.$$eval('[data-act="equip"]:not(.sel)',e=>e.map(x=>+x.dataset.id));const id=await S(([k,ids])=>{const c=ids.map(i=>__S().cards.find(x=>x.id===i)).find(x=>x&&x.key===k);return c&&c.id},[key,ids]);if(id)await p.click(`[data-act="equip"][data-id="${id}"]`);if(process.env.DBG)console.log('eq',hid,key,id,await p.innerText('.msg').catch(()=>'-'))};
const men=await S(()=>__S().cards.filter(c=>c.key==='human').map(c=>c.id));
for(let i=0;i<4;i++){await equip(men[i],'spear');if(i<2)await equip(men[i],'hide_armor')}
for(let i=4;i<8;i++){await equip(men[i],'shortbow');await equip(men[i],'short_arrows');await equip(men[i],'knife')}
await next('arm');if(process.env.DBG){await b.close();return}
await p.click('[data-tab="units"]');await p.click('[data-act="newunit"]');const uid=await S(()=>__S().units[0].id);
for(const m of men){await p.click(`[data-act="selh"][data-id="${m}"]`);await p.click(`[data-act="putin"][data-u="${uid}"] >> nth=0`)}
await p.click(`[data-act="addtm"][data-u="${uid}"]`);for(const m of men.slice(4)){await p.click(`[data-act="selh"][data-id="${m}"]`);await p.click(`[data-act="putin"][data-u="${uid}"][data-t="2"]`)}
await next('squad');
await p.selectOption(`#urt${uid}`,'defend');await next('defend');
await p.click('[data-tab="patrol"]');await p.click('[data-act="fmnew"]');await p.click('[data-act="fmshape"][data-s="ranks"] >> nth=1');await next('formations');
// encounters
const fight=async(n,opts)=>{for(let tryN=0;tryN<4;tryN++){await p.click('[data-act="tutenc"]');let did={},last=null;
  for(let k=0;k<1500;k++){await p.waitForTimeout(150);if(!(await S(()=>!!__S().match)))break;
    if(await p.$('[data-act="bfight"]')){if(opts.deploy)await opts.deploy(did);await p.click('[data-act="bfight"]').catch(()=>{});await p.waitForTimeout(300)}
    const inFight=await S(()=>{const M=__S().match;return !!(M&&M.battles&&M.battles.some(b=>!b.done&&b.phase==='fight'))});
    if(inFight&&opts.live&&!did.live){await p.waitForSelector('#bview svg');did.live=await opts.live()}
    if(await p.$('.speedbar [data-act="mspd"][data-s="0"].on')&&!(await p.$('[data-act="bfight"]')))await p.click('.speedbar [data-act="mspd"][data-s="60"]').catch(()=>{});
    else if(inFight&&await p.$('#bctl [data-act="mspd"][data-s="10"]:not(.on)'))await p.click('#bctl [data-act="mspd"][data-s="10"]').catch(()=>{});
    last=await S(()=>{const M=__S().match;return M?{log:M.log.slice(-4).map(x=>x.m).join(' / '),foes:M.camps.map(c=>c.mobs.length).join('+'),men:__S().units.map(U=>U.hids.filter(h=>{const c=__S().cards.find(x=>x.id===h);return c&&!c.dead}).length).join('+')}:null})||last;
    const need=await S(()=>{const M=__S().match;if(!M)return null;const m=M.camps.find(c=>!c.razed&&!c.mobs.length);if(!m)return null;if(__S().units.some(U=>U.live&&(U.live.mode==='raze'||U.live.raze)))return null;if(M.battles&&M.battles.some(b=>!b.done))return null;return m.key});
    if(need){const lr=await S(k=>{const M=__S().match,m=M.camps.find(c=>c.key===k);return[m.lair%M.W,Math.floor(m.lair/M.W)]},need);await p.click('[data-act="mview"][data-v="all"]').catch(()=>{});await p.click(`[data-act="hex"][data-c="${lr[0]}"][data-r="${lr[1]}"] >> nth=0`).catch(e=>console.log('hex fail',e.message));await p.click(`.lootcard [data-act="razego"][data-u="${uid}"]`).catch(e=>console.log('raze fail',e.message));console.log('burn ordered',n)}}
  if(await S(()=>!!__S().match))console.log('STUCK',errs.slice(0,3),await S(()=>[__S().match.speed,__S().match.halt]),JSON.stringify(await S(()=>{const M=__S().match;return{clock:M.clock,camps:M.camps.map(m=>({razed:m.razed,n:m.mobs.length,roam:m.roam,pos:m.pos,lair:m.lair,W:M.W})),units:__S().units.map(U=>({rem:U.live.rem,wait:U.live.wait,busy:U.live.busy,raze:U.live.raze,endur:U.live.endur,lairTerr:__S().grid[__S().match.camps[0].lair],sp:U.live.ub&&U.live.ub.sp,mode:U.live.mode,st:U.live.status,pos:U.live.pos,raze:U.live.raze,path:U.live.path.length,tg:U.live.target})),log:M.log.slice(-8).map(x=>x.t+' '+x.m)}})));
  const won=await S(n=>!!__S().tut.won[n],n);console.log('encounter',n,'try',tryN+1,won?'WON':'lost',JSON.stringify(last),(await p.innerText('.verdict').catch(()=>'')));if(won)return true}return false};
await fight(1,{deploy:async()=>{await p.click('[data-act="bfauto"]').catch(()=>{})}});await next('E1');
await p.click('[data-tab="packs"]');await p.click('[data-act="open"][data-k="booster"]');await next('packA');
console.log('placed',await placeTiles('cultivated',8));await hamlet();await next('hamlet2');
// road between: draw across two placed tiles using zoom clicks
await p.click('[data-tab="realm"]');await p.click('[data-act="draw"][data-k="road"]');const st0=await S(()=>{const s=__S().setl[0];return[s.c,s.r]});await p.click(`[data-act="hex"][data-c="${st0[0]}"][data-r="${st0[1]}"]`);
await p.click(`[data-act="hex"][data-c="${st0[0]+1}"][data-r="${st0[1]}"]`);await p.click('[data-act="dfinish"]');console.log('road',await p.innerText('.msg'));await next('road');
const s2=await S(()=>__S().setl[1].id);await p.click('[data-tab="packs"]');await p.selectOption('#asel',String(s2));await p.click('[data-act="assignall"]');
const new3=await S(s2=>__S().cards.filter(c=>c.key==='human'&&c.at===s2&&c.sex!=='f').map(c=>c.id),s2);
await p.click('[data-tab="settle"]');await p.click(`[data-act="selset"][data-id="${s2}"]`);await equip(new3[0],'longbow');await equip(new3[0],'long_arrows');await equip(new3[1],'spear');await equip(new3[2],'spear');if(new3[3])await equip(new3[3],'knife');await equip(new3[1],'hide_shield');await equip(new3[2],'hide_helmet');
await p.click('[data-tab="units"]');await p.selectOption('#nus',String(s2));await p.click('[data-act="newunit"]');const uid2=await S(()=>__S().units[1].id);
for(const m of new3.slice(0,4)){await p.click(`[data-act="selh"][data-id="${m}"]`);await p.click(`[data-act="putin"][data-u="${uid2}"] >> nth=0`)}await p.selectOption(`#urt${uid2}`,'defend');await next('squad2');fs.writeFileSync('tut15-new.json',await p.evaluate(()=>localStorage.getItem('realmforge-chal-1')));if(process.env.STOP15){await b.close();return}


await fight(2,{live:async()=>{const ob=await p.$('[data-act="bfob"]:not([data-o="mv"]):not(.on)');if(ob){return await ob.click({timeout:2000}).then(()=>true).catch(()=>false)}return false}});await next('E2');
console.log('woman still in hand',await S(()=>__S().cards.find(c=>c.sex==='f').at));
await p.click('[data-tab="settle"]');await p.click(`[data-act="selset"][data-id="${s2}"]`);await p.click('[data-act="altar"]');await next('altar');
const fem=await S(()=>__S().cards.find(c=>c.sex==='f').id);await p.click('[data-tab="packs"]');await p.selectOption('#asel',String(s2));await p.click(`[data-act="assign"][data-id="${fem}"]`);console.log('assign woman:',await p.innerText('.msg').catch(()=>''));
await p.click('[data-tab="settle"]');await p.click(`[data-act="selset"][data-id="${s2}"]`);await p.click(`[data-act="priest"][data-h="${fem}"]`);await next('priestess');
await p.click('[data-act="sacA"][data-k="rabbit"]');console.log('sac form',await p.innerText('.upanel:has(#sacV)').catch(()=>'none'));await p.click('[data-act="sacrifice"]');console.log(await p.innerText('.msg'));await next('sacrifice');
await p.click('[data-tab="packs"]');await p.click('[data-act="open"][data-k="booster"]');await next('packB');
console.log('placed',await placeTiles('cultivated',8));await hamlet();
const s3=await S(()=>__S().setl[2].id);await p.click('[data-tab="packs"]');await p.selectOption('#asel',String(s3));await p.click('[data-act="assignall"]');await next('hamlet3');
await p.click('[data-tab="settle"]');await p.click(`[data-act="selset"][data-id="${S0=await S(()=>__S().setl[0].id)}"]`);
for(const k of ['tat_antler','red_crystal','gnosis','p_bolt'])await equip(men[0],k);console.log(await p.innerText('.msg'));await next('powerup');

// a palisade round the first hamlet, and a gate in it (the drawing itself is covered by fort-ui.test.js)
console.log('palisade',await p.evaluate(()=>__ev(`(function(){var s=S.setl[0],C=coreOf(s);UI.tab='realm';UI.draw={type:'wall',fk:'wall_s',h:'s',pts:[],segs:[]};for(var i=0;i<=24;i++){var a=i/24*Math.PI*2;fortClick([C.c[0]+Math.cos(a)*C.r*.97,C.c[1]+Math.sin(a)*C.r*.97])}finishWall();var m1=UI.msg,w=walls()[0];if(!w)return m1;var G=wallGeo(w);UI.draw={type:'gate',fk:'gate',pts:[]};fortClick(G.at(G.L*.3));return m1+' | '+UI.msg})()`)));
await p.click('[data-tab="realm"]');await next('palisade');
await fight(3,{live:async()=>{await p.click('#bctl [data-act="mspd"][data-s="0"]');await p.waitForSelector('#bview svg');const tk=await S(()=>{const b=__S().match.battles.find(x=>!x.done);return b.teams[0].k});await p.click(`[data-act="bfsel"][data-k="t:${tk}"]`);await p.click('[data-act="bford"][data-o="move"]');const fb=await (await p.$('#bview svg')).boundingBox();await p.mouse.click(fb.x+fb.width*.5,fb.y+fb.height*.5);await p.click('#bctl [data-act="mspd"][data-s="10"]');return true}});await next('E3');
await fight(4,{live:async()=>{await p.click(`[data-act="mu"][data-u="${uid2}"]`).catch(()=>{});const sel=await p.$(`#rf${uid2}`);if(sel){await p.selectOption(`#rf${uid2}`,String(uid));return true}return false}});await next('E4');
// part 2
await p.click('[data-tab="packs"]');await p.click('[data-act="open"][data-k="booster"]');await next('packC');
const s3b=await S(()=>__S().setl[2].id);await p.selectOption('#asel',String(s3b));await p.click('[data-act="assignall"]');
const new6=await S(s3=>__S().cards.filter(c=>c.key==='human'&&c.at===s3&&c.sex!=='f'&&!__S().units.some(U=>U.hids.indexOf(c.id)>=0)).map(c=>c.id),s3b);console.log('new men',new6.length);
await p.click('[data-tab="settle"]');await p.click(`[data-act="selset"][data-id="${s3b}"]`);
await equip(new6[0],'spear@cu.oak');await equip(new6[0],'leather_armor');await equip(new6[1],'spear@cu.oak');await equip(new6[1],'leather_armor');await equip(new6[2],'spear@cu.pine');
await equip(new6[3],'longbow');await equip(new6[3],'long_arrows@cu.oak');await equip(new6[4],'longbow@-.pine');await equip(new6[4],'long_arrows@cu.oak');await equip(new6[5],'rod_cu');await equip(new6[5],'ring_endur');
for(const k of ['orange_crystal','gnosis','p_arrow'])await equip(new6[5],k);console.log('copper:',await p.innerText('.msg').catch(()=>''));await next('copper');
// a gentle slope beside the realm
await p.click('[data-tab="realm"]');await p.click('[data-act="plc"][data-t="e"][data-k="gs_field"]').catch(e=>console.log('no slope btn',e.message));
const sp=await S(()=>{const s=__S(),W=s.bw,H=s.bh;const taken=(c,r)=>s.grid[r*W+c]||s.setl.some(x=>(x.c===c&&x.r===r)||(x.c2===c&&x.r2===r));for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(taken(c,r))continue;const nb=(r&1)?[[1,0],[-1,0],[0,-1],[1,-1],[0,1],[1,1]]:[[1,0],[-1,0],[-1,-1],[0,-1],[-1,1],[0,1]];if(nb.some(d=>{const C=c+d[0],R=r+d[1];return C>=0&&R>=0&&C<W&&R<H&&taken(C,R)}))return[c,r]}});
await p.click(`[data-act="hex"][data-c="${sp[0]}"][data-r="${sp[1]}"]`);console.log('slope:',await p.innerText('.msg').catch(()=>''));await next('hill');
// farmland for a village, then the village on two empty hexes side by side
console.log('placed',await placeTiles('cultivated',22),await placeTiles('orchard',3));
await p.click('[data-tab="realm"]');await p.click('[data-act="plc"][data-t="s"][data-k="village"]');
const vp=await S(()=>{const s=__S(),W=s.bw,H=s.bh;const taken=(c,r)=>s.grid[r*W+c]||s.setl.some(x=>(x.c===c&&x.r===r)||(x.c2===c&&x.r2===r));const NB=(c,r)=>((r&1)?[[1,0],[-1,0],[0,-1],[1,-1],[0,1],[1,1]]:[[1,0],[-1,0],[-1,-1],[0,-1],[-1,1],[0,1]]).map(d=>[c+d[0],r+d[1]]).filter(q=>q[0]>=0&&q[1]>=0&&q[0]<W&&q[1]<H);const nearSet=(c,r)=>NB(c,r).some(q=>s.setl.some(x=>(x.c===q[0]&&x.r===q[1])||(x.c2===q[0]&&x.r2===q[1])));
  for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(taken(c,r)||nearSet(c,r)||!NB(c,r).some(q=>taken(q[0],q[1])))continue;for(const q of NB(c,r))if(!taken(q[0],q[1])&&!nearSet(q[0],q[1]))return[c,r,q[0],q[1]]}});
console.log('village at',vp);if(vp){await p.click(`[data-act="hex"][data-c="${vp[0]}"][data-r="${vp[1]}"]`);await p.click(`[data-act="hex"][data-c="${vp[2]}"][data-r="${vp[3]}"]`)}console.log('village:',await p.innerText('.msg').catch(()=>''));await next('village');
// a third squad from the new men
await p.click('[data-tab="units"]');await p.selectOption('#nus',String(s3b));await p.click('[data-act="newunit"]');const uid3=await S(()=>__S().units[__S().units.length-1].id);
for(const m of new6){await p.click(`[data-act="selh"][data-id="${m}"]`);await p.click(`[data-act="putin"][data-u="${uid3}"] >> nth=0`)}await p.selectOption(`#urt${uid3}`,'defend');
await fight(5,{deploy:async()=>{await p.click('[data-act="bfauto"]').catch(()=>{})}});await next('E5');
// encounters 6 and 7 stay put: every squad marches to the camp
const march=async(n)=>{for(let tryN=0;tryN<4&&!(await S(n=>!!__S().tut.won[n],n));tryN++){await p.click('[data-act="tutenc"]');await p.waitForTimeout(500);
  await S(()=>{const s=__S(),M=s.match,m=M.camps[0],lx=m.lair%M.W,ly=Math.floor(m.lair/M.W);s.rid=s.rid||1;const R={id:s.rid++,name:'To the camp',steps:[{type:'march',to:[lx,ly],pace:'walk'}],repeat:0,eng:{spot:'engage',fall:0}};s.routes.push(R);s.units.forEach(U=>{if(!U.hids.length)return;U.route=R.id;U.live.si=0;U.live.cur=-1;U.live.mode='route';U.live.path=[]})});
  for(let k=0;k<2500;k++){await p.waitForTimeout(150);if(!(await S(()=>!!__S().match)))break;if(await p.$('[data-act="bfight"]')){await p.click('[data-act="bfauto"]').catch(()=>{})}if(await p.$('.speedbar [data-act="mspd"][data-s="0"].on')&&!(await p.$('[data-act="bfight"]')))await p.click('.speedbar [data-act="mspd"][data-s="60"]').catch(()=>{});
    const need=await S(()=>{const M=__S().match;if(!M)return null;const m=M.camps.find(c=>!c.razed&&!c.mobs.length);if(!m||__S().units.some(U=>U.live&&(U.live.mode==='raze'||U.live.raze))||(M.battles&&M.battles.some(b=>!b.done)))return null;return m.key});
    if(need){const lr=await S(k=>{const M=__S().match,m=M.camps.find(c=>c.key===k);return[m.lair%M.W,Math.floor(m.lair/M.W)]},need);await p.click('[data-act="mview"][data-v="all"]').catch(()=>{});await p.click(`[data-act="hex"][data-c="${lr[0]}"][data-r="${lr[1]}"] >> nth=0`).catch(()=>{});await p.click(`.lootcard [data-act="razego"] >> nth=0`).catch(()=>{})}}
  console.log('encounter',n,'try',tryN+1,await S(n=>!!__S().tut.won[n],n),(await p.innerText('.verdict').catch(()=>'')),await S(()=>{const M=__S().match;return M?M.log.slice(-3).map(l=>l.m).join(' / '):''}))}};
await march(6);await next('E6');
await march(7);await next('E7');
await fight(8,{deploy:async()=>{await p.click('[data-act="bfauto"]').catch(()=>{})},live:async()=>{await p.click(`[data-act="mu"][data-u="${uid2}"]`).catch(()=>{});const sel=await p.$(`#rf${uid2}`);if(sel){await p.selectOption(`#rf${uid2}`,String(uid));return true}return false}});await next('E8');
console.log('final step',await step(),await p.innerText('.tut h2'));
await p.click('[data-act="tutend"][data-v="keep"]');console.log('tut after',await S(()=>__S().tut),'settlements',await S(()=>__S().setl.map(x=>x.type).join(',')),'walls',await S(()=>__S().lines.filter(l=>l.type==='wall').length),'humans',await S(()=>__S().cards.filter(c=>c.key==='human').length),'prestige',await S(()=>__S().prestige));
console.log('test minutes',((Date.now()-t0)/60000).toFixed(1));console.log(errs);await b.close()})();
