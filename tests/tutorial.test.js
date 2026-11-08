const path=require('path');{const o=path.join(__dirname,'out');require('fs').mkdirSync(o,{recursive:true});process.chdir(o)}
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:1400}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
let h=fs.readFileSync(path.resolve(__dirname,'..','dist','realmforge-chalcolithic.html'),'utf8').replace('var saved=load();','window.__S=function(){return S};window.__UI=function(){return UI};var saved=load();');
fs.writeFileSync('wrap43.html','<!doctype html><html><head><meta charset="utf-8"></head><body>'+h+'</body></html>');
await p.goto('file://'+__dirname+'/wrap43.html');await p.evaluate(()=>localStorage.clear());await p.reload();
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
const fight=async(n,opts)=>{for(let tryN=0;tryN<4;tryN++){await p.click('[data-act="tutenc"]');let did={};
  for(let k=0;k<1500;k++){await p.waitForTimeout(150);if(!(await S(()=>!!__S().match)))break;
    if(await p.$('[data-act="bfight"]')){if(opts.deploy)await opts.deploy(did);await p.click('[data-act="bfight"]').catch(()=>{});await p.waitForTimeout(300)}
    const inFight=await S(()=>{const M=__S().match;return !!(M&&M.battles&&M.battles.some(b=>!b.done&&b.phase==='fight'))});
    if(inFight&&opts.live&&!did.live){await p.waitForSelector('#bview svg');did.live=await opts.live()}
    if(await p.$('.speedbar [data-act="mspd"][data-s="0"].on')&&!(await p.$('[data-act="bfight"]')))await p.click('.speedbar [data-act="mspd"][data-s="60"]').catch(()=>{});
    else if(inFight&&await p.$('#bctl [data-act="mspd"][data-s="10"]:not(.on)'))await p.click('#bctl [data-act="mspd"][data-s="10"]').catch(()=>{});
    const need=await S(()=>{const M=__S().match;if(!M)return null;const m=M.camps[0];if(m.razed||m.mobs.length)return null;if(__S().units.some(U=>U.live&&(U.live.mode==='raze'||U.live.raze)))return null;if(M.battles&&M.battles.some(b=>!b.done))return null;return m.key});
    if(need){const lr=await S(()=>{const M=__S().match,m=M.camps[0];return[m.lair%M.W,Math.floor(m.lair/M.W)]});await p.click('[data-act="mview"][data-v="all"]').catch(()=>{});await p.click(`[data-act="hex"][data-c="${lr[0]}"][data-r="${lr[1]}"] >> nth=0`).catch(e=>console.log('hex fail',e.message));await p.click(`.lootcard [data-act="razego"][data-u="${uid}"]`).catch(e=>console.log('raze fail',e.message));console.log('burn ordered',n)}}
  if(await S(()=>!!__S().match))console.log('STUCK',errs.slice(0,3),await S(()=>[__S().match.speed,__S().match.halt]),JSON.stringify(await S(()=>{const M=__S().match;return{clock:M.clock,camps:M.camps.map(m=>({razed:m.razed,n:m.mobs.length,roam:m.roam,pos:m.pos,lair:m.lair,W:M.W})),units:__S().units.map(U=>({rem:U.live.rem,wait:U.live.wait,busy:U.live.busy,raze:U.live.raze,endur:U.live.endur,lairTerr:__S().grid[__S().match.camps[0].lair],sp:U.live.ub&&U.live.ub.sp,mode:U.live.mode,st:U.live.status,pos:U.live.pos,raze:U.live.raze,path:U.live.path.length,tg:U.live.target})),log:M.log.slice(-8).map(x=>x.t+' '+x.m)}})));
  const won=await S(n=>!!__S().tut.won[n],n);console.log('encounter',n,'try',tryN+1,won?'WON':'lost',(await p.innerText('.verdict').catch(()=>'')));if(won)return true}return false};
await fight(1,{deploy:async()=>{await p.click('[data-act="bfauto"]').catch(()=>{})}});await next('E1');
await fight(2,{live:async()=>{const ob=await p.$('[data-act="bfob"]:not([data-o="mv"]):not(.on)');if(ob){return await ob.click({timeout:2000}).then(()=>true).catch(()=>false)}return false}});await next('E2');
await p.click('[data-tab="packs"]');await p.click('[data-act="open"][data-k="booster"]');await next('packA');
console.log('placed',await placeTiles('cultivated',8));await hamlet();await next('hamlet2');
// road between: draw across two placed tiles using zoom clicks
await p.click('[data-tab="realm"]');await p.click('[data-act="draw"][data-k="road"]');const st0=await S(()=>{const s=__S().setl[0];return[s.c,s.r]});await p.click(`[data-act="hex"][data-c="${st0[0]}"][data-r="${st0[1]}"]`);
await p.click(`[data-act="hex"][data-c="${st0[0]+1}"][data-r="${st0[1]}"]`);await p.click('[data-act="dfinish"]');console.log('road',await p.innerText('.msg'));await next('road');
const s2=await S(()=>__S().setl[1].id);await p.click('[data-tab="packs"]');await p.selectOption('#asel',String(s2));await p.click('[data-act="assignall"]');
const new3=await S(s2=>__S().cards.filter(c=>c.key==='human'&&c.at===s2&&c.sex!=='f').map(c=>c.id),s2);
await p.click('[data-tab="settle"]');await p.click(`[data-act="selset"][data-id="${s2}"]`);await equip(new3[0],'longbow');await equip(new3[0],'long_arrows');await equip(new3[1],'spear');await equip(new3[2],'spear');
await p.click('[data-tab="units"]');await p.selectOption('#nus',String(s2));await p.click('[data-act="newunit"]');const uid2=await S(()=>__S().units[1].id);
for(const m of new3.slice(0,3)){await p.click(`[data-act="selh"][data-id="${m}"]`);await p.click(`[data-act="putin"][data-u="${uid2}"] >> nth=0`)}await p.selectOption(`#urt${uid2}`,'defend');await next('squad2');fs.writeFileSync('tut15.json',await p.evaluate(()=>localStorage.getItem('realmforge-chal-1')));if(process.env.STOP15){await b.close();return}
const tapFoe=async()=>{await p.click('#bctl [data-act="mspd"][data-s="0"]').catch(()=>{});await p.waitForSelector('#bview svg');const gu=await S(()=>{const b=__S().match.battles.find(x=>!x.done);return b.groups[0].uid});await p.click(`[data-act="bfsel"][data-k="u:${gu}"]`).catch(()=>{});const pos=await S(()=>{const b=__S().match.battles.find(x=>!x.done);const f=b&&b.foes.find(x=>x.alive);return f&&[f.x,f.y]});if(!pos)return false;const fb=await (await p.$('#bview svg')).boundingBox();await p.mouse.click(fb.x+fb.width*pos[0]/280,fb.y+fb.height*(pos[1]-2.5)/192);await p.click('#bctl [data-act="mspd"][data-s="10"]').catch(()=>{});return true};
await fight(3,{live:tapFoe});await next('E3');
await fight(4,{live:async()=>{await p.click('#bctl [data-act="mspd"][data-s="0"]');await p.waitForSelector('#bview svg');const tk=await S(()=>{const b=__S().match.battles.find(x=>!x.done);return b.teams[0].k});await p.click(`[data-act="bfsel"][data-k="t:${tk}"]`);await p.click('[data-act="bford"][data-o="move"]');const fb=await (await p.$('#bview svg')).boundingBox();await p.mouse.click(fb.x+fb.width*.5,fb.y+fb.height*.5);await p.click('#bctl [data-act="mspd"][data-s="10"]');return true}});await next('E4');
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
await fight(5,{live:async()=>{await p.click(`[data-act="mu"][data-u="${uid2}"]`).catch(()=>{});const sel=await p.$(`#rf${uid2}`);if(sel){await p.selectOption(`#rf${uid2}`,String(uid));return true}return false}});await next('E5');
// encounter 6: march the main squad to the camp (route built the way the planner does it)
for(let tryN=0;tryN<4&&!(await S(()=>__S().tut.won[6]));tryN++){await p.click('[data-act="tutenc"]');await p.waitForTimeout(500);
  await S(u=>{const s=__S(),M=s.match,m=M.camps[0],lx=m.lair%M.W,ly=Math.floor(m.lair/M.W);s.rid=s.rid||1;const R={id:s.rid++,name:'To the camp',steps:[{type:'march',to:[lx,ly],pace:'walk'}],repeat:0,eng:{spot:'engage',fall:0}};s.routes.push(R);s.units.forEach(U=>{if(!U.hids.length)return;U.route=R.id;U.live.si=0;U.live.cur=-1;U.live.mode='route';U.live.path=[]})},uid);
  for(let k=0;k<1500;k++){await p.waitForTimeout(150);if(!(await S(()=>!!__S().match)))break;if(await p.$('[data-act="bfight"]')){await p.click('[data-act="bfauto"]').catch(()=>{})}if(await p.$('.speedbar [data-act="mspd"][data-s="0"].on')&&!(await p.$('[data-act="bfight"]')))await p.click('.speedbar [data-act="mspd"][data-s="60"]').catch(()=>{});}
  console.log('encounter 6 try',tryN+1,await S(()=>!!__S().tut.won[6]),(await p.innerText('.verdict').catch(()=>'')))}
await next('E6');
console.log('final step',await step(),await p.innerText('.tut h2'));await p.screenshot({path:'f60.png',clip:await (await p.$('.tut')).boundingBox()});
await p.click('[data-act="tutend"][data-v="keep"]');console.log('tut after',await S(()=>__S().tut),'hamlets',await S(()=>__S().setl.length),'altar',await S(()=>__S().setl.some(x=>x.altar)),'humans',await S(()=>__S().cards.filter(c=>c.key==='human').length),'prestige',await S(()=>__S().prestige));
console.log('test minutes',((Date.now()-t0)/60000).toFixed(1));console.log(errs);await b.close()})();
