/*
 * Pocket Arcade shared engine (classic script, exposes window.Arcade).
 * Every game uses it for: language choice, one JSON score result, challenge links,
 * the 1200x630 share card, and the share / save / copy actions.
 *
 *   Arcade.pickLang()                 -> 'en' | 'hk' | 'tw' | 'jp'  (?lang=, saved choice, browser)
 *   Arcade.setLang(code)              save the choice and put ?lang=<tag> in the address bar
 *   Arcade.result(game, data)         -> ScoreResult JSON; also fires window 'arcade:result'
 *   Arcade.challengeUrl(result, lang) -> link a friend opens to play against this score
 *   Arcade.readChallenge(game)        -> {score, level, perfect} from ?c=, or null
 *   Arcade.renderCard(opts)           -> 1200x630 canvas
 *   Arcade.share / download / copy    share sheet, file save, clipboard
 */
(function () {
  'use strict';

  var SITE = 'https://pocket-arcade-ruddy.vercel.app';
  var CODES = ['en', 'hk', 'tw', 'jp'];
  var TAG = { en: 'en', hk: 'zh-HK', tw: 'zh-TW', jp: 'ja-JP' };
  var HTML = { en: 'en', hk: 'zh-Hant-HK', tw: 'zh-Hant-TW', jp: 'ja' };
  var LABEL = { en: 'EN', hk: '港', tw: '繁', jp: '日' };
  var NAME = { en: 'English', hk: '香港繁體（廣東話）', tw: '台灣繁體', jp: '日本語' };
  var KEY = 'pa-lang';

  // Game registry: the hub lists these; the card renderer reads the accent colour.
  var GAMES = [
    {
      id: 'wild-catch', path: 'wild-catch/', status: 'live', accent: '#d6402a', name: 'Wild Catch', bestKey: 'ika-best',
      title: { en: 'Giant Ika Catch', hk: '野生捕捉 大魷魚', tw: '大烏賊 捕獲大作戰', jp: '大イカ 捕獲作戦' },
      blurb: {
        en: 'A giant squid falls back from space. Turn it, jet ink, and land it between the tower’s chopsticks.',
        hk: '大魷魚由太空跌返嚟。轉身、噴墨，等座塔嘅筷子夾住佢。',
        tw: '大烏賊從太空掉回來。轉向、噴墨，讓鐵塔的筷子夾住牠。',
        jp: '宇宙から落ちてくる大イカ。旋回と墨噴射で、タワーの箸に捕まえさせよう。'
      }
    },
    {
      id: 'kaiju-catch', path: 'kaiju-catch/', status: 'live', kind: 'film', accent: '#e0873a', name: 'Kaiju Catch 3D',
      title: { en: 'Operation: Giant Squid', hk: '野生捕捉 大魷魚 3D', tw: '大烏賊 捕獲大作戰 3D', jp: '大イカ 捕獲作戦 3D' },
      blurb: {
        en: 'The tower catch retold as a 1960s kaiju film, in 3D. Switch cameras, scrub the timeline, freeze the 10:26 frame.',
        hk: '用六十年代特攝片風格，3D 重現成個捕捉過程。可以轉鏡頭、拉時間軸，停喺 10:26 嗰格。',
        tw: '以六〇年代特攝片風格，3D 重現整個捕獲過程。可切換鏡頭、拖動時間軸，停在 10:26 那一格。',
        jp: '昭和の怪獣映画風に、捕獲の一部始終を3Dで再現。カメラ切替、タイムライン操作、10:26 の場面で一時停止も。'
      }
    }
  ];

  // Strings every game shares (score card, challenge, share actions).
  var S = {
    en: {
      pts: 'pts', cta: 'Can you beat this?',
      vs: 'A friend reached level {0} with {1} pts. Beat it!', target: 'Target {0}', beaten: 'Challenge beaten!',
      won: 'You beat your friend’s {0} pts!', toBeat: '{0} more pts to beat your friend.',
      share: 'Share challenge', shareTo: 'Send the challenge', more: 'More…', saveCard: 'Save score card', copyPost: 'Copy post',
      copied: 'Post and challenge link copied.', saved: 'Score card saved.', cardFail: 'Could not make the score card.',
      noShare: 'Sharing isn’t available here, so the post and link were copied instead.'
    },
    hk: {
      pts: '分', cta: '你夠膽挑戰嗎？',
      vs: '朋友喺第 {0} 關攞咗 {1} 分，打贏佢！', target: '目標 {0}', beaten: '超越挑戰！',
      won: '你贏咗朋友嘅 {0} 分！', toBeat: '仲差 {0} 分先贏到朋友。',
      share: '分享挑戰', shareTo: '分享挑戰去', more: '其他', saveCard: '儲存成績卡', copyPost: '複製文案',
      copied: '已複製文案同挑戰連結。', saved: '已儲存成績卡。', cardFail: '整唔到成績卡。',
      noShare: '呢度分享唔到，已經幫你複製咗文案同連結。'
    },
    tw: {
      pts: '分', cta: '你敢挑戰嗎？',
      vs: '朋友在第 {0} 關拿到 {1} 分，來打破這個紀錄！', target: '目標 {0}', beaten: '挑戰成功！',
      won: '你贏過朋友的 {0} 分！', toBeat: '再 {0} 分就能贏過朋友。',
      share: '分享挑戰', shareTo: '分享挑戰到', more: '其他', saveCard: '儲存成績卡', copyPost: '複製文案',
      copied: '已複製文案和挑戰連結。', saved: '成績卡已儲存。', cardFail: '無法產生成績卡。',
      noShare: '這裡無法分享，已幫你複製文案和連結。'
    },
    jp: {
      pts: '点', cta: 'この記録、超えられる？',
      vs: '友だちの記録：第{0}面・{1}点。超えてみよう！', target: '目標 {0}', beaten: '記録突破！',
      won: '友だちの {0} 点を超えた！', toBeat: '友だちの記録を超えるまで、あと {0} 点。',
      share: '挑戦をシェア', shareTo: '挑戦をシェア', more: 'その他', saveCard: 'スコアカードを保存', copyPost: '投稿文をコピー',
      copied: '投稿文と挑戦リンクをコピーしました。', saved: 'スコアカードを保存しました。', cardFail: 'スコアカードを作れません。',
      noShare: 'ここではシェアできないので、投稿文とリンクをコピーしました。'
    }
  };

  function fmt(s, a) { return String(s).replace(/\{(\d)\}/g, function (m, i) { return a[+i]; }); }
  function t(lang, k) { return fmt((S[lang] || S.en)[k], [].slice.call(arguments, 2)); }
  function store(k, v) {
    try { if (arguments.length < 2) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {}
    return null;
  }

  // Accepts short codes (en, hk, tw, jp, tc) and BCP 47 tags (zh-HK, zh-Hant-TW, en-GB, ja-JP).
  function norm(x) {
    x = String(x || '').toLowerCase().replace(/_/g, '-');
    if (!x) return null;
    if (x === 'hk' || x === 'tc' || /^yue/.test(x) || /^zh-(hant-)?(hk|mo)\b/.test(x)) return 'hk';
    if (x === 'tw' || /^zh\b/.test(x)) return 'tw';
    if (x === 'jp' || /^ja\b/.test(x)) return 'jp';
    if (/^en\b/.test(x)) return 'en';
    return null;
  }
  function param(name) { try { return new URLSearchParams(location.search).get(name); } catch (e) { return null; } }
  function pickLang() {
    var n = norm(param('lang')); if (n) return n;
    n = norm(store(KEY)) || norm(store('ika-lang')); if (n) return n;
    var list = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || 'en'];
    for (var i = 0; i < list.length; i++) { n = norm(list[i]); if (n) return n; }
    return 'en';
  }
  function setLang(code) {
    store(KEY, code);
    try {
      var u = new URL(location.href); u.searchParams.set('lang', TAG[code]);
      history.replaceState(history.state, '', u.pathname + u.search + u.hash);
    } catch (e) {}
  }

  function game(id) { for (var i = 0; i < GAMES.length; i++) if (GAMES[i].id === id) return GAMES[i]; return null; }
  function siteBase() { return /^https?:$/.test(location.protocol) ? location.origin : SITE; }
  function gameUrl(id) { var g = game(id); return siteBase() + '/' + (g ? g.path : ''); }

  // ---------- score result ----------
  function result(id, d) {
    var r = {
      v: 1, game: id,
      score: Math.max(0, Math.round(d.score || 0)),
      level: Math.max(1, d.level | 0),
      outcome: d.outcome || 'over',
      perfect: !!d.perfect,
      stats: d.stats || {},
      lang: TAG[d.lang] || 'en',
      at: new Date().toISOString()
    };
    store('pa-last-' + id, JSON.stringify(r));
    try { window.dispatchEvent(new CustomEvent('arcade:result', { detail: r })); } catch (e) {}
    return r;
  }

  // ---------- challenge links ----------
  function b64u(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function unb64u(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return decodeURIComponent(escape(atob(s))); }
  function challengeUrl(r, lang) {
    var code = b64u(JSON.stringify({ v: 1, g: r.game, s: r.score, l: r.level, p: r.perfect ? 1 : 0 }));
    return gameUrl(r.game) + '?lang=' + encodeURIComponent(lang ? TAG[lang] : r.lang) + '&c=' + code;
  }
  function readChallenge(id) {
    var c = param('c'); if (!c) return null;
    try {
      var o = JSON.parse(unb64u(c));
      if (o.g !== id || !(o.s >= 0 && o.s < 1e7) || !(o.l >= 1 && o.l < 1000)) return null;
      return { score: Math.round(o.s), level: Math.round(o.l), perfect: !!o.p };
    } catch (e) { return null; }
  }

  // ---------- 1200 x 630 cards ----------
  var DISPLAY = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", "Noto Serif CJK TC", "Songti TC", serif';
  var UI = '"PingFang HK", "PingFang TC", "Hiragino Sans", "Noto Sans TC", system-ui, -apple-system, "Segoe UI", sans-serif';
  var C = { film: '#0b0a0d', paper: '#ece6d6', dim: 'rgba(236,230,214,0.62)', faint: 'rgba(236,230,214,0.16)', amber: '#f0b44a', verm: '#d6402a' };
  var CW = 1200, CH = 630;

  function newCard() { var cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; return cv; }
  function fit(ctx, text, font, size, max) {
    for (; size > 12; size -= 2) { ctx.font = fmt(font, [size]); if (ctx.measureText(text).width <= max) break; }
    return size;
  }
  function spaced(ctx, text, x, y, sp, align) {
    var w = 0, i;
    for (i = 0; i < text.length; i++) w += ctx.measureText(text[i]).width + (i < text.length - 1 ? sp : 0);
    if (align === 'right') x -= w; else if (align === 'center') x -= w / 2;
    ctx.textAlign = 'left';
    for (i = 0; i < text.length; i++) { ctx.fillText(text[i], x, y); x += ctx.measureText(text[i]).width + sp; }
  }
  function backdrop(ctx, accent) {
    ctx.fillStyle = C.film; ctx.fillRect(0, 0, CW, CH);
    var g = ctx.createRadialGradient(920, 140, 30, 920, 140, 760);
    g.addColorStop(0, 'rgba(214,64,42,0.16)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
    var n = document.createElement('canvas'); n.width = n.height = 96;
    var nx = n.getContext('2d'), im = nx.createImageData(96, 96);
    for (var i = 0; i < im.data.length; i += 4) { var v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    nx.putImageData(im, 0, 0);
    ctx.save(); ctx.globalAlpha = 0.05; ctx.fillStyle = ctx.createPattern(n, 'repeat'); ctx.fillRect(0, 0, CW, CH); ctx.restore();
    ctx.strokeStyle = C.faint; ctx.lineWidth = 1; ctx.strokeRect(20.5, 20.5, CW - 41, CH - 41);
    ctx.fillStyle = accent; ctx.fillRect(20, 20, CW - 40, 5);
  }
  function pane(ctx, snap, x, y, w, h, accent) {
    ctx.fillStyle = '#000'; ctx.fillRect(x, y, w, h);
    if (snap) {
      var s = Math.max(w / snap.width, h / snap.height), sw = w / s, sh = h / s;
      ctx.drawImage(snap, (snap.width - sw) / 2, (snap.height - sh) / 2, sw, sh, x, y, w, h);
    }
    ctx.strokeStyle = 'rgba(236,230,214,0.35)'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    ctx.fillStyle = accent; ctx.fillRect(x, y, w, 6);
  }
  function wordmark(ctx, text, x, y, size, max, accent, align) {
    size = fit(ctx, text, '800 {0}px ' + DISPLAY, size, max);
    ctx.textAlign = align || 'left'; ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(3, size / 11); ctx.strokeStyle = C.paper; ctx.strokeText(text, x, y);
    ctx.fillStyle = accent; ctx.fillText(text, x, y);
    ctx.textAlign = 'left';
  }
  function shortUrl(u) { return String(u || SITE).replace(/^https?:\/\//, '').replace(/[?#].*$/, '').replace(/\/$/, ''); }

  /*
   * opts: { game, lang, snapshot (canvas/img), title, score, detail, url }
   *   or  { game, lang, snapshot, title, promo: [lines], cta, url } for a store-style card
   */
  function renderCard(o) {
    var cv = newCard(), ctx = cv.getContext('2d'), g = game(o.game) || {}, accent = g.accent || C.verm, lang = o.lang || 'en';
    var X = 456, R = 1140, MW = R - X;
    backdrop(ctx, accent);
    pane(ctx, o.snapshot, 60, 60, 340, 510, accent);
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = accent; ctx.fillRect(X, 80, 11, 11);
    ctx.font = '700 18px ' + UI; ctx.fillStyle = C.dim; spaced(ctx, 'POCKET ARCADE', X + 22, 92, 5);
    if (g.name && g.name !== o.title) { ctx.font = '700 18px ' + UI; ctx.fillStyle = C.dim; spaced(ctx, g.name.toUpperCase(), R, 92, 4, 'right'); }
    wordmark(ctx, o.title || g.name || '', X, 172, 62, MW, accent);
    var i;
    if (o.promo) {
      ctx.fillStyle = C.paper;
      for (i = 0; i < o.promo.length; i++) { fit(ctx, o.promo[i], '600 {0}px ' + UI, 30, MW); ctx.fillText(o.promo[i], X, 248 + i * 46); }
    } else {
      var sc = String(o.score || 0);
      ctx.fillStyle = C.amber; fit(ctx, sc, '800 {0}px ' + UI, 150, MW - 130); ctx.fillText(sc, X, 334);
      var sw = ctx.measureText(sc).width;
      ctx.font = '700 36px ' + UI; ctx.fillStyle = C.paper; ctx.fillText(t(lang, 'pts'), X + sw + 16, 334);
      if (o.detail) { ctx.fillStyle = C.paper; fit(ctx, o.detail, '600 {0}px ' + UI, 30, MW); ctx.fillText(o.detail, X, 392); }
    }
    ctx.fillStyle = C.faint; ctx.fillRect(X, 432, MW, 2);
    ctx.fillStyle = C.paper; fit(ctx, o.cta || t(lang, 'cta'), '800 {0}px ' + DISPLAY, 38, MW); ctx.fillText(o.cta || t(lang, 'cta'), X, 492);
    ctx.fillStyle = C.amber; fit(ctx, shortUrl(o.url), '600 {0}px ' + UI, 22, MW); ctx.fillText(shortUrl(o.url), X, 532);
    ctx.font = '700 15px ' + UI; ctx.fillStyle = C.dim; spaced(ctx, 'PLAY · SCORE · SHARE · CHALLENGE', R, 578, 3, 'right');
    return cv;
  }

  function coverInto(ctx, img, x, y, w, h, shiftY) {
    var s = Math.max(w / img.width, h / img.height), sw = w / s, sh = h / s;
    ctx.drawImage(img, (img.width - sw) / 2, Math.max(0, Math.min(img.height - sh, (img.height - sh) / 2 + (shiftY || 0) * img.height)), sw, sh, x, y, w, h);
  }

  // Series card for the hub's link preview. o.snaps = { gameId: canvas or image }
  function renderSeries(o) {
    o = o || {};
    var cv = newCard(), ctx = cv.getContext('2d'), snaps = o.snaps || {};
    backdrop(ctx, C.verm);
    ctx.textBaseline = 'alphabetic';
    ctx.font = '700 20px ' + UI; ctx.fillStyle = C.dim; spaced(ctx, 'SMALL GAMES · BIG MOMENTS', 64, 100, 6);
    wordmark(ctx, 'POCKET ARCADE', 60, 206, 104, 1080, C.verm);
    ctx.font = '700 22px ' + UI; ctx.fillStyle = C.amber; spaced(ctx, 'MULTILINGUAL PLAY　EN · 港 · 繁 · 日', 64, 256, 2);
    var gap = 26, n = GAMES.length, w = Math.min(520, (1072 - gap * (n - 1)) / n), h = 232, y = 300, pw = Math.round(w * 0.46);
    for (var i = 0; i < n; i++) {
      var gm = GAMES[i], x = 64 + i * (w + gap), live = gm.status === 'live', sn = snaps[gm.id];
      ctx.fillStyle = 'rgba(236,230,214,0.05)'; ctx.fillRect(x, y, w, h);
      if (sn) {
        ctx.save(); ctx.beginPath(); ctx.rect(x + w - pw, y, pw, h); ctx.clip();
        ctx.globalAlpha = 0.9; coverInto(ctx, sn, x + w - pw, y, pw, h, gm.kind === 'film' ? 0 : -0.08);
        var fade = ctx.createLinearGradient(x + w - pw, 0, x + w - pw + 110, 0); fade.addColorStop(0, 'rgba(18,17,21,1)'); fade.addColorStop(1, 'rgba(18,17,21,0)');
        ctx.globalAlpha = 1; ctx.fillStyle = fade; ctx.fillRect(x + w - pw, y, 110, h); ctx.restore();
      }
      ctx.strokeStyle = C.faint; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      ctx.fillStyle = gm.accent; ctx.fillRect(x, y, w, 6);
      ctx.fillStyle = C.paper; fit(ctx, gm.name, '800 {0}px ' + DISPLAY, 36, w - pw + 40); ctx.fillText(gm.name, x + 24, y + 66);
      ctx.fillStyle = C.dim; ctx.font = '600 22px ' + UI; ctx.fillText(gm.title.hk, x + 24, y + 106); ctx.fillText(gm.title.jp, x + 24, y + 140);
      ctx.font = '700 16px ' + UI; ctx.fillStyle = live ? C.amber : C.dim;
      spaced(ctx, !live ? 'COMING SOON' : gm.kind === 'film' ? 'WATCH IN 3D' : 'PLAY NOW', x + 24, y + h - 26, 3);
    }
    ctx.font = '700 15px ' + UI; ctx.fillStyle = C.dim; spaced(ctx, 'PLAY · SCORE · SHARE · CHALLENGE', 1136, 578, 3, 'right');
    return cv;
  }

  // Full-bleed poster for landscape scenes (the 3D film). opts: { game, image, title, lines, cta, url }
  function renderPoster(o) {
    var cv = newCard(), ctx = cv.getContext('2d'), g = game(o.game) || {}, accent = g.accent || C.verm, X = 64, MW = 640;
    ctx.fillStyle = C.film; ctx.fillRect(0, 0, CW, CH);
    if (o.image) {   // place the subject (focusX of the image width) at 70% across, so the text side stays clear
      var im = o.image, sc = Math.max(CW / im.width, CH / im.height), dw = im.width * sc, dh = im.height * sc;
      var dx = Math.min(CW * 0.35, Math.max(CW - dw, CW * 0.7 - (o.focusX == null ? 0.5 : o.focusX) * dw));
      ctx.drawImage(im, dx, (CH - dh) / 2, dw, dh);
      if (dx > 0) {   // soften the image's left edge into the film black
        var edge = ctx.createLinearGradient(dx, 0, dx + 240, 0);
        edge.addColorStop(0, 'rgba(11,10,13,1)'); edge.addColorStop(1, 'rgba(11,10,13,0)');
        ctx.fillStyle = edge; ctx.fillRect(dx - 1, 0, 241, CH);
      }
    }
    var sh = ctx.createLinearGradient(0, 0, CW * 0.78, 0);
    sh.addColorStop(0, 'rgba(11,10,13,0.94)'); sh.addColorStop(0.55, 'rgba(11,10,13,0.72)'); sh.addColorStop(1, 'rgba(11,10,13,0)');
    ctx.fillStyle = sh; ctx.fillRect(0, 0, CW, CH);
    ctx.strokeStyle = C.faint; ctx.lineWidth = 1; ctx.strokeRect(20.5, 20.5, CW - 41, CH - 41);
    ctx.fillStyle = accent; ctx.fillRect(20, 20, CW - 40, 5);
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = accent; ctx.fillRect(X, 80, 11, 11);
    ctx.font = '700 18px ' + UI; ctx.fillStyle = C.dim; spaced(ctx, 'POCKET ARCADE · ' + (g.name || '').toUpperCase(), X + 22, 92, 5);
    wordmark(ctx, o.title || g.name || '', X, 178, 70, MW, accent);
    ctx.fillStyle = C.paper;
    (o.lines || []).forEach(function (l, i) { fit(ctx, l, '600 {0}px ' + UI, 28, MW); ctx.fillText(l, X, 250 + i * 44); });
    ctx.fillStyle = C.faint; ctx.fillRect(X, 432, MW, 2);
    ctx.fillStyle = C.paper; fit(ctx, o.cta || '', '800 {0}px ' + DISPLAY, 36, MW); ctx.fillText(o.cta || '', X, 490);
    ctx.fillStyle = C.amber; fit(ctx, shortUrl(o.url), '600 {0}px ' + UI, 22, MW); ctx.fillText(shortUrl(o.url), X, 530);
    ctx.font = '700 15px ' + UI; ctx.fillStyle = C.dim; spaced(ctx, 'PLAY · SCORE · SHARE · CHALLENGE', 1136, 578, 3, 'right');
    return cv;
  }

  // ---------- actions ----------
  function toBlob(cv) { return new Promise(function (res) { try { cv.toBlob(function (b) { res(b); }, 'image/png'); } catch (e) { res(null); } }); }
  function download(blob, name) {
    var u = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(u); }, 5000);
  }
  function copy(text) {
    return new Promise(function (res) {
      try { navigator.clipboard.writeText(text).then(function () { res(true); }, function () { res(false); }); } catch (e) { res(false); }
    });
  }
  // Call straight from a click with the blob already made: some browsers drop the share sheet after an await.
  // Resolves 'shared' | 'aborted' | 'unsupported' | 'failed'.
  function share(o) {
    if (!navigator.share) return Promise.resolve('unsupported');
    var data = { title: o.title, text: o.text };
    try {
      var f = o.blob && new File([o.blob], o.filename || 'score.png', { type: 'image/png' });
      if (f && navigator.canShare && navigator.canShare({ files: [f] })) data.files = [f];
    } catch (e) {}
    if (!data.files && o.url && o.text.indexOf(o.url) < 0) data.url = o.url;
    return navigator.share(data).then(function () { return 'shared'; }, function (e) { return e && e.name === 'AbortError' ? 'aborted' : 'failed'; });
  }

  // Direct share links. Both open the app on phones (if installed) and the web composer on desktop.
  // They carry text only, so the link inside the text is what shows the preview card.
  var TARGETS = {
    whatsapp: { max: 4000, url: function (tx) { return 'https://wa.me/?text=' + encodeURIComponent(tx); } },
    threads: { max: 500, url: function (tx) { return 'https://www.threads.com/intent/post?text=' + encodeURIComponent(tx); } }
  };
  function fitPost(target, text) {   // Threads allows 500 characters: drop the hashtag line first, then trim the body
    var max = (TARGETS[target] || {}).max || 4000, len = function (s) { return Array.from(s).length; };
    if (len(text) <= max) return text;
    text = text.replace(/\n+#[^\n]*$/, '');
    if (len(text) <= max) return text;
    var link = (text.match(/https?:\/\/\S+/) || [''])[0], body = text.replace(link, '').trim();
    return Array.from(body).slice(0, max - len(link) - 2).join('') + '\n' + link;
  }
  function shareTo(target, text) {
    var u = TARGETS[target].url(fitPost(target, text)), w = window.open(u, '_blank');
    if (w) { try { w.opener = null; } catch (e) {} } else location.href = u;
    return u;
  }

  window.Arcade = {
    SITE: SITE, CODES: CODES, TAG: TAG, LABEL: LABEL, NAME: NAME, games: GAMES,
    t: t, fmt: fmt, norm: norm, pickLang: pickLang, setLang: setLang, htmlLang: function (c) { return HTML[c] || 'en'; },
    game: game, gameUrl: gameUrl, result: result, challengeUrl: challengeUrl, readChallenge: readChallenge,
    renderCard: renderCard, renderSeries: renderSeries, renderPoster: renderPoster, toBlob: toBlob, download: download, copy: copy, share: share,
    shareTo: shareTo, fitPost: fitPost
  };

  // Vercel Web Analytics (cookieless page views) through shared/analytics.mjs.
  // Skipped on a local server, which has no /_vercel/insights endpoint.
  if (!/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) && location.protocol !== 'file:') {
    var me = document.currentScript, va = document.createElement('script');
    va.type = 'module';
    va.src = new URL('analytics.mjs', me && me.src ? me.src : SITE + '/shared/').href;
    document.head.appendChild(va);
  }
})();
