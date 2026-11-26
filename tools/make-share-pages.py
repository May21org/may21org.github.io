#!/usr/bin/env python3
"""Build per-language share pages so Facebook, X, WhatsApp, Telegram etc. show the
title and summary in the language that was shared.

Link-preview crawlers do not run JavaScript, so they only see the English tags of an
article page. For every article page and language this writes

    share/<lang>/<path of the page>      e.g. share/tr/documents/2026-11-khabze-schools.html

a tiny page whose preview tags (og:title, og:description, ...) are in that language and
which sends visitors on to the real page (<path>?lang=<lang>). assets/share.js uses these
addresses for every language except English.

Run from the repository root after adding or changing an article:
    python3 tools/make-share-pages.py
"""
import html, json, re
from pathlib import Path

SITE = 'https://may21.org'
LANGS = ['en', 'tr', 'kbd', 'ru', 'de', 'ar', 'ady']
LOCALE = {'en': 'en_GB', 'tr': 'tr_TR', 'ru': 'ru_RU', 'de': 'de_DE', 'ar': 'ar_AR'}
ROOT = Path(__file__).resolve().parent.parent

def clean(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', s))).strip()

def short(s, n=300):
    if len(s) <= n:
        return s
    cut = s[:n].rsplit(' ', 1)[0].rstrip(',;:—–-')
    return cut + '…'

def panels(src):
    """{lang: (title, summary)} from the page's language panels."""
    out = {}
    for m in re.finditer(r'class="panel" id="lang-([a-z]+)"[^>]*>(.*?)(?=class="panel" id="lang-|<section class="refs"|</body>)', src, re.S):
        lang, body = m.group(1), m.group(2)
        h1 = re.search(r'<h1[^>]*>(.*?)</h1>', body, re.S)
        dek = re.search(r'<p class="dek"[^>]*>(.*?)</p>', body, re.S)
        if not dek:   # no summary line: use the first paragraph
            dek = re.search(r'<p(?: [^>]*)?>(.*?)</p>', body[h1.end():] if h1 else body, re.S)
        if h1:
            out[lang] = (clean(h1.group(1)), short(clean(dek.group(1))) if dek else '')
    return out

def library_entries():
    """{url path: {lang: (title, description)}} from documents.json and recognition.json."""
    out = {}
    for f in ['documents.json', 'recognition.json']:
        p = ROOT / f
        if not p.exists():
            continue
        for d in json.loads(p.read_text(encoding='utf-8')):
            path = str(d.get('url', '')).split('?')[0]
            if not path.endswith('.html'):
                continue
            e = out.setdefault(path, {})
            e.setdefault('en', (d.get('title', ''), d.get('description', '')))
            for l, ed in (d.get('editions') or {}).items():
                e.setdefault(l, (ed.get('title', d.get('title', '')), ed.get('description', d.get('description', ''))))
    return out

def stub(lang, path, title, desc):
    url = f'{SITE}/share/{lang}/{path}'
    target = f'/{path}?lang={lang}'
    t, d = html.escape(title), html.escape(desc)
    loc = f'\n  <meta property="og:locale" content="{LOCALE[lang]}" />' if lang in LOCALE else ''
    rtl = ' dir="rtl"' if lang == 'ar' else ''
    return f'''<!DOCTYPE html>
<html lang="{lang}"{rtl}>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{t} · May21.org</title>
  <meta name="description" content="{d}" />
  <meta name="robots" content="noindex" />
  <meta property="og:site_name" content="May21.org" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="{t}" />
  <meta property="og:description" content="{d}" />
  <meta property="og:url" content="{url}" />
  <meta property="og:image" content="{SITE}/img/may21-logo.png" />{loc}
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="{t}" />
  <meta name="twitter:description" content="{d}" />
  <script>location.replace({json.dumps(target)});</script>
  <style>body{{margin:0;background:#0a0a0a;color:#f0ede8;font:16px/1.6 sans-serif;display:grid;place-items:center;min-height:100vh}}a{{color:#d47c2b}}</style>
</head>
<body>
  <p><a href="{html.escape(target)}">{t}</a></p>
</body>
</html>
'''

def main():
    lib = library_entries()
    pages = sorted((ROOT / 'documents').glob('*.html')) + sorted((ROOT / 'articles').glob('*.html'))
    n = 0
    for p in pages:
        path = p.relative_to(ROOT).as_posix()
        found = panels(p.read_text(encoding='utf-8'))
        known = lib.get(path, {})
        en = found.get('en') or known.get('en')
        if not en:
            continue
        for lang in LANGS:
            title, desc = found.get(lang) or known.get(lang) or en
            if not desc:
                desc = (known.get(lang) or en)[1]
            dest = ROOT / 'share' / lang / path
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(stub(lang, path, title, desc), encoding='utf-8')
            n += 1
    # extra pages whose texts live in their own script (e.g. monuments.html): tools/share-extra.json
    extra = ROOT / 'tools' / 'share-extra.json'
    if extra.exists():
        for path, langs in json.loads(extra.read_text(encoding='utf-8')).items():
            for lang in LANGS:
                title, desc = langs.get(lang) or langs['en']
                dest = ROOT / 'share' / lang / path
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_text(stub(lang, path, title, short(desc)), encoding='utf-8')
                n += 1
    print(n, 'share pages written')

if __name__ == '__main__':
    main()
