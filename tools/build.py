"""Build the single-file game from src/.

  python tools/build.py          -> dist/realmforge-chalcolithic.html (the playable game)
  python tools/build.py --test   -> also dist/test-wrap.html (same game with a window.__ev hook the tests use)

The JS files in src/js are fragments of ONE function scope (the game is wrapped in an IIFE in src/shell.html),
concatenated in filename order. They are not standalone modules: keep the numeric prefixes, and add new files
with a number that puts them where they belong.
"""
import glob,os,sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def read(p):
    with open(p,encoding='utf-8',newline='') as f:return f.read()
def build():
    shell=read(os.path.join(ROOT,'src','shell.html'))
    css=read(os.path.join(ROOT,'src','css','game.css'))
    js=''.join(read(p) for p in sorted(glob.glob(os.path.join(ROOT,'src','js','*.js'))))
    assert shell.count('@@CSS@@')==1 and shell.count('@@JS@@')==1
    return shell.replace('@@CSS@@',css[:-1] if css.endswith('\n') else css).replace('@@JS@@',js[:-1] if js.endswith('\n') else js)
if __name__=='__main__':
    out=build();os.makedirs(os.path.join(ROOT,'dist'),exist_ok=True)
    with open(os.path.join(ROOT,'dist','realmforge-chalcolithic.html'),'w',encoding='utf-8',newline='') as f:f.write(out)
    if '--test' in sys.argv:
        hook='var saved=load();'
        assert out.count(hook)==1
        with open(os.path.join(ROOT,'dist','test-wrap.html'),'w',encoding='utf-8',newline='') as f:f.write(out.replace(hook,'window.__ev=function(x){return eval(x)};'+hook))
    print('built dist/realmforge-chalcolithic.html (%d bytes)'%len(out.encode('utf-8')))
