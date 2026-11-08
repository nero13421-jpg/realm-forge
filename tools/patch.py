"""Tiny helper for exact-match edits across src/ files: rep(file, old, new, count=1)."""
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rep(fn,a,b,n=1):
    p=os.path.join(ROOT,'src',fn) if not os.path.isabs(fn) else fn
    s=open(p,encoding='utf-8',newline='').read();c=s.count(a)
    assert c==n,(fn,c,a[:120]);open(p,'w',encoding='utf-8',newline='').write(s.replace(a,b))
