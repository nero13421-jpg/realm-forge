/* blessed gear works on the gear; the new animals raise a man; every altar needs 10 tiles */
const path=require('path');{const o=path.join(__dirname,'out');require('fs').mkdirSync(o,{recursive:true});process.chdir(o)}
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'..','dist','test-wrap.html'));await p.evaluate(()=>localStorage.clear());await p.reload();
const E=x=>p.evaluate(x=>__ev(x),x);
console.log(await E(`(function(){var o=[],h=mk('human'),bw=mk('shortbow'),ar=mk('short_arrows'),hr=mk('hide_armor');bw.eq=h.id;ar.eq=h.id;hr.eq=h.id;
 var u0=makeUnit(h);bw.boon={k:'rabbit',p:10,n:2};hr.boon={k:'wolf',p:6,n:1};var u1=makeUnit(h);
 o.push('bow range ×'+u1.gm.range.toFixed(2)+' hit ×'+u1.gm.rhit.toFixed(2)+' · armor hits back '+u1.gm.thorn+' · sprint same: '+(u0.sp.sprint===u1.sp.sprint));
 hr.boon={k:'turtle',p:8,n:2};var u2=makeUnit(h);o.push('turtle armor: def '+u0.dfn+' → '+u2.dfn+', hp '+u0.mhp+' → '+u2.mhp);
 h.boon={k:'serpent',p:6,n:1};var X=stats(h);o.push('serpent man: str ×'+X.str.toFixed(2)+' strike ×'+X.strike.toFixed(2)+' sprint '+X.sprint.toFixed(2));
 h.boon={k:'goat',p:10,n:2};var u3=makeUnit(h);o.push('goat man: footing '+u3.foot.toFixed(2)+' short ×'+u3.short.toFixed(2));
 o.push(Object.keys(HABITAT).map(function(k){return k+' '+HABITAT[k].n}).join(', '));
 o.push(resText(bw));return o.join('\\n')})()`));
await E(`UI.tab='info';render();1`);const t=await p.content();console.log('info has blessed gear table',t.includes('On a melee weapon'),'serpent',t.includes('Constrictor serpent'));
console.log(errs);await b.close()})();
