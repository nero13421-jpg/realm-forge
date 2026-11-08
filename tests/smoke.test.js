const path=require('path');{const o=path.join(__dirname,'out');require('fs').mkdirSync(o,{recursive:true});process.chdir(o)}
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'..','dist','test-wrap.html'));await p.evaluate(()=>localStorage.clear());await p.reload();
const E=x=>p.evaluate(x=>__ev(x),x);
for(const t of ['packs','realm','settle','units','res','patrol','info','realm']){await E(`UI.tab='${t}';render();1`);await p.waitForTimeout(150)}
await E(`openPackOf('starter');render();1`);await E(`UI.tab='res';render();1`);
console.log(await E(`JSON.stringify({st:timHave('stimber'),lt:timHave('ltimber'),row:[...document.querySelectorAll('td')].filter(td=>/timber/.test(td.textContent)).map(td=>td.parentNode.textContent)})`));
const st=fs.readFileSync(path.join(__dirname,'fixtures','fort2.json'),"utf8");await p.evaluate(s=>localStorage.setItem("realmforge-chal-1",s),st);await p.reload();
for(const t of ['realm','info','settle']){await E(`UI.tab='${t}';render();1`);await p.waitForTimeout(150)}
await E(`startMatch();UI.tab='match';render();1`);await p.waitForTimeout(400);await E(`advance(30);render();1`);
console.log(errs);await b.close()})();
