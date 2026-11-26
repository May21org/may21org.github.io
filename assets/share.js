/* May21.org share bar
   Include on any article page:  <script src="../assets/share.js" defer></script>
   (from the site root: assets/share.js). It adds
   - a share bar at the end of the article (before "Sources" if there is one),
     or wherever an element with class "share-slot" is placed;
   - a "Share" link in the page's top menu (.top-links) that jumps to the bar.
   Shared links point to https://may21.org/<page>?lang=<the language the reader is viewing>. */
(function () {
  var NETS = [
    ['Facebook', function (u, t) { return 'https://www.facebook.com/sharer/sharer.php?u=' + u; }],
    ['X', function (u, t) { return 'https://x.com/intent/post?url=' + u + '&text=' + t; }],
    ['WhatsApp', function (u, t) { return 'https://wa.me/?text=' + t + '%20' + u; }],
    ['Telegram', function (u, t) { return 'https://t.me/share/url?url=' + u + '&text=' + t; }],
    ['VK', function (u, t) { return 'https://vk.com/share.php?url=' + u + '&title=' + t; }],
    ['LinkedIn', function (u, t) { return 'https://www.linkedin.com/sharing/share-offsite/?url=' + u; }],
    ['Email', function (u, t) { return 'mailto:?subject=' + t + '&body=' + u; }]
  ];
  var L = {
    en: ['Share', 'Copy link', 'Link copied', 'Share via…'],
    tr: ['Paylaş', 'Bağlantıyı kopyala', 'Bağlantı kopyalandı', 'Paylaş…'],
    ru: ['Поделиться', 'Скопировать ссылку', 'Ссылка скопирована', 'Поделиться…'],
    de: ['Teilen', 'Link kopieren', 'Link kopiert', 'Teilen über…'],
    ar: ['مشاركة', 'نسخ الرابط', 'تم نسخ الرابط', 'مشاركة عبر…'],
    kbd: ['Гуэшын', 'Линкыр копие щӀын', 'Линкыр копие хъуащ', 'Гуэшын…'],
    ady: ['Гощын', 'Линкыр копие шӀын', 'Линкыр копие хъугъэ', 'Гощын…']
  };
  var CSS = '.m21-share{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:48px 0 8px;padding:20px 0;border-top:1px solid rgba(255,255,255,0.12);border-bottom:1px solid rgba(255,255,255,0.12)}' +
    '.m21-share .m21-label{font-family:"DM Mono",monospace;font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:#c8382a;margin-inline-end:6px}' +
    '.m21-share a,.m21-share button{display:inline-flex;align-items:center;min-height:40px;padding:0 14px;border:1px solid #444;background:transparent;color:#bbb;' +
    'font-family:"DM Mono",monospace;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;cursor:pointer;transition:border-color .2s,color .2s}' +
    '.m21-share a:hover,.m21-share button:hover,.m21-share a:focus-visible,.m21-share button:focus-visible{border-color:#d47c2b;color:#f0ede8;outline:none}' +
    '.m21-share .m21-native{border-color:#c8382a;color:#f0ede8}' +
    'body.reader .m21-share{border-color:rgba(0,0,0,.15)}body.reader .m21-share a,body.reader .m21-share button{color:#2b2b2b;border-color:#bbb}' +
    '[dir="rtl"] .m21-share .m21-label,[dir="rtl"] .m21-share a,[dir="rtl"] .m21-share button{letter-spacing:0}';

  function lang() {
    var l = (document.documentElement.getAttribute('lang') || 'en').toLowerCase();
    return L[l] ? l : 'en';
  }
  function shareUrl() {
    return 'https://may21.org' + location.pathname + '?lang=' + lang();
  }
  function title() {
    var h = document.querySelector('.panel:not([hidden]) h1, article:not([hidden]) h1, .mon h1, h1');
    return (h && h.textContent.trim()) || document.title.replace(/\s*·\s*May21\.org$/, '');
  }

  function fill(bar) {
    var l = L[lang()], u = encodeURIComponent(shareUrl()), t = encodeURIComponent(title());
    var html = '<span class="m21-label">' + l[0] + '</span>';
    if (navigator.share) html += '<button type="button" class="m21-native" data-native>' + l[3] + '</button>';
    NETS.forEach(function (n) {
      html += '<a lang="en" href="' + n[1](u, t) + '" target="_blank" rel="noopener" aria-label="' + l[0] + ': ' + n[0] + '">' + n[0] + '</a>';
    });
    html += '<button type="button" data-copy>' + l[1] + '</button>';
    bar.innerHTML = html;
    bar.setAttribute('dir', lang() === 'ar' ? 'rtl' : 'ltr');
  }

  function build() {
    var style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
    var slots = [].slice.call(document.querySelectorAll('.share-slot'));
    if (!slots.length) {
      var refs = document.querySelector('.refs');
      var arts = document.querySelectorAll('article');
      if (refs) { var s = document.createElement('div'); refs.parentNode.insertBefore(s, refs); slots.push(s); }
      else if (arts.length) [].forEach.call(arts, function (a) { var s = document.createElement('div'); a.appendChild(s); slots.push(s); });
    }
    if (!slots.length) return;
    var bars = slots.map(function (s, i) {
      s.classList.add('m21-share'); if (i === 0) s.id = 'share';
      s.addEventListener('click', function (ev) {
        var b = ev.target.closest('button'); if (!b) return;
        if (b.hasAttribute('data-native')) { navigator.share({ title: title(), url: shareUrl() }).catch(function () {}); }
        if (b.hasAttribute('data-copy')) {
          var done = function () { b.textContent = L[lang()][2]; setTimeout(function () { b.textContent = L[lang()][1]; }, 2000); };
          if (navigator.clipboard) navigator.clipboard.writeText(shareUrl()).then(done, function () { prompt('', shareUrl()); });
          else { prompt('', shareUrl()); }
        }
      });
      return s;
    });
    var top = document.querySelector('.top-links');
    var jump = null;
    if (top && !top.querySelector('.m21-jump')) {
      jump = document.createElement('a'); jump.href = '#share'; jump.className = 'm21-jump';
      top.insertBefore(jump, top.firstChild);
    }
    function refresh() { bars.forEach(fill); if (jump) jump.textContent = L[lang()][0] + ' ↓'; }
    refresh();
    // the page's own language switch changes <html lang>: follow it
    new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
