// The page's only script: the Slack demo (script parser, window renderer, playback, tabs), the FAQ
// accordion and the wires of the swimlane. No framework; the markup is static HTML in index.html and
// the classes come from kinetik-ds.css, Kineto's design-system stylesheet.
(function () {
  'use strict';

  /* ---------------- Slack demo: script format ----------------
     #channel on the first line; "Name (time): text" starts a message (a name is 1-3 capitalised
     words); other lines continue the message; [react] / [chart] / [file] / [post] / [profile] attach
     to it; "---" splits the opening (shown at once) from the part that types in live.
     In text: **bold**, _italic_, @mentions, bare domains. */
  var MESSAGE = /^((?:[A-Z][\w.'-]*)(?:\s+[A-Z][\w.'-]*){0,2})\s*(?:\(([^)]{1,32})\))?:\s(.*)$/;
  function trim(s) { return s.trim(); }

  function attachment(tag, rest) {
    var f = rest.split('|').map(trim);
    switch (tag) {
      case 'chart':
        return { kind: 'chart', name: f[0] || '', title: f[1] || 'Weekly Active Users by Country', trend: /^up$/i.test(f[2] || '') ? 'up' : 'down' };
      case 'post':
        return f.length > 1 ? { kind: 'post', network: f[0], text: f.slice(1).join(' | ') } : { kind: 'post', network: 'LinkedIn', text: f[0] || '' };
      case 'profile':
        return { kind: 'profile', name: f[0] || '', handle: f[1] || '', stat: f[2] || '' };
      case 'react':
        return {
          kind: 'react',
          items: rest.split(/[·,]/).map(function (x) { return x.trim().match(/^(\S+)\s*(\d+)?$/); }).filter(Boolean)
            .map(function (m) { return { emoji: m[1], count: Number(m[2] || 1) }; })
        };
      default:
        return { kind: 'file', name: f[0] || '', sub: f.slice(1).join(' | ') };
    }
  }

  function parseScript(script) {
    var lines = script.replace(/\r/g, '').split('\n').map(trim);
    var channel = '#general', messages = [], intro = -1;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (!line) continue;
      if (/^-{3,}$/.test(line)) { if (intro < 0) intro = messages.length; continue; }
      if (messages.length === 0 && /^[#@][^\s:]+$/.test(line)) { channel = line; continue; }
      var last = messages[messages.length - 1];
      var art = line.match(/^\[(file|chart|post|profile|react)\]\s*(.*)$/i);
      if (art && last) { last.attachments.push(attachment(art[1].toLowerCase(), art[2])); continue; }
      var m = line.match(MESSAGE);
      if (m) {
        messages.push({ author: m[1].trim(), time: (m[2] || '').trim(), paragraphs: [m[3]], attachments: [] });
        continue;
      }
      if (last) last.paragraphs.push(line);
    }
    if (intro < 0) intro = messages.length;
    return { channel: channel, messages: messages, intro: Math.min(intro, messages.length) };
  }

  var RUN = /(\*\*[^*]+\*\*|_[^_]+_|@[A-Za-z0-9_.-]*[A-Za-z0-9_]|\b[a-z0-9-]+\.(?:com|io|app|ai|net|org)\b)/g;
  function runs(text) {
    var out = [], at = 0, m;
    RUN.lastIndex = 0;
    while ((m = RUN.exec(text))) {
      if (m.index > at) out.push({ kind: 'text', text: text.slice(at, m.index) });
      var t = m[0];
      if (t.indexOf('**') === 0) out.push({ kind: 'bold', text: t.slice(2, -2) });
      else if (t.charAt(0) === '_') out.push({ kind: 'italic', text: t.slice(1, -1) });
      else if (t.charAt(0) === '@') out.push({ kind: 'mention', text: t });
      else out.push({ kind: 'link', text: t });
      at = m.index + t.length;
    }
    if (at < text.length) out.push({ kind: 'text', text: text.slice(at) });
    return out;
  }

  /* ---------------- Slack demo: rendering ---------------- */
  var INK = 'text-[#1D1C1D]', MUTED = 'text-[#616061]', BORDER = 'border-[#DDDDDD]', LINK = 'text-[#1264A3]';
  // Our agents get their faces and an APP badge; everyone else gets ink initials on a brand colour
  // picked from the name, so a colleague keeps one face across tabs.
  var FACES = { Gilfoyle: 'assets/cast/gilfoyle-face.jpg', Dinesh: 'assets/cast/dinesh-face.jpg', Donald: 'assets/cast/donald-face.jpg' };
  var TONES = ['bg-sky', 'bg-lavender', 'bg-aqua', 'bg-yellow', 'bg-pink'];
  function faceTone(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return TONES[h % TONES.length];
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function avatar(name, size) {
    var box = size === 28 ? 'size-7 rounded-[6px]' : 'size-9 rounded-[8px]';
    var face = FACES[name];
    if (face) {
      return '<span aria-hidden="true" class="' + box + ' flex shrink-0 ' + faceTone(name) + '" style="background-image:url(\'' + face + '\');background-size:cover;background-position:center"></span>';
    }
    var initials = name.split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0); }).join('').toUpperCase();
    return '<span aria-hidden="true" class="' + box + ' flex shrink-0 items-center justify-center text-[13px] font-bold ' + INK + ' ' + faceTone(name) + '">' + esc(initials) + '</span>';
  }
  function paragraph(text) {
    return '<p class="m-0">' + runs(text).map(function (r) {
      switch (r.kind) {
        case 'bold': return '<strong class="font-bold">' + esc(r.text) + '</strong>';
        case 'italic': return '<em>' + esc(r.text) + '</em>';
        case 'mention': return '<span class="rounded-[3px] bg-[rgba(29,155,209,0.1)] px-[2px] ' + LINK + '">' + esc(r.text) + '</span>';
        case 'link': return '<span class="' + LINK + '">' + esc(r.text) + '</span>';
        default: return esc(r.text);
      }
    }).join('') + '</p>';
  }

  // A drawn stand-in for a dashboard screenshot.
  var CHARTS = {
    down: { a: [18, 24, 30, 34, 38, 41, 45, 50, 54, 12], b: [12, 16, 22, 28, 30, 36, 40, 44, 49, 8], mark: 266, stats: [['Total WAU', '42,318'], ['7d change', '−61%'], ['MoM', '+18%']] },
    up: { a: [20, 22, 19, 24, 28, 27, 33, 38, 44, 52], b: [14, 15, 13, 17, 21, 22, 26, 31, 36, 45], mark: 133, stats: [['This week', '48,902'], ['7d change', '+24%'], ['vs. plan', '+12%']] }
  };
  function chart(title, trend) {
    var c = CHARTS[trend];
    var line = function (pts) { return pts.map(function (y, i) { return (i / (pts.length - 1)) * 300 + ',' + (66 - y); }).join(' '); };
    return '<div class="mt-[6px] w-full max-w-[420px] overflow-hidden rounded-[8px] bg-[#1E1F24] p-3 text-[11px] text-[#ABABAD]">' +
      '<p class="m-0 mb-2 text-[12px] font-bold text-[#E8E8E8]">' + esc(title) + '</p>' +
      '<svg viewBox="0 0 300 70" class="block h-auto w-full" aria-hidden="true">' +
      [10, 32, 54].map(function (y) { return '<line x1="0" x2="300" y1="' + y + '" y2="' + y + '" stroke="#35373B" stroke-width="1"></line>'; }).join('') +
      '<polyline points="' + line(c.a) + '" fill="none" stroke="#5386E4" stroke-width="2"></polyline>' +
      '<polyline points="' + line(c.b) + '" fill="none" stroke="#00AF54" stroke-width="2"></polyline>' +
      '<line x1="' + c.mark + '" x2="' + c.mark + '" y1="0" y2="70" stroke="#FF5F4B" stroke-width="1"></line></svg>' +
      '<div class="mt-2 grid grid-cols-3 gap-2">' + c.stats.map(function (s) {
        return '<div class="rounded-[6px] bg-[#2A2C31] px-2 py-1.5"><p class="m-0">' + esc(s[0]) + '</p><p class="m-0 text-[14px] font-bold text-[#E8E8E8]">' + esc(s[1]) + '</p></div>';
      }).join('') + '</div></div>';
  }
  var NETWORK = { linkedin: ['in', 'bg-[#0A66C2]'], x: ['X', 'bg-[#0F1419]'], instagram: ['IG', 'bg-[#E1306C]'], tiktok: ['TT', 'bg-[#0F1419]'] };
  var CARD = 'mt-[6px] flex w-full max-w-[520px] items-center gap-3 rounded-[8px] border bg-white p-3 ' + BORDER;
  function attachmentHtml(a) {
    switch (a.kind) {
      case 'chart':
        return '<p class="m-0 mt-1 text-[13px] ' + MUTED + '">' + esc(a.name) + '</p>' + chart(a.title, a.trend);
      case 'post': {
        var n = NETWORK[a.network.toLowerCase()] || NETWORK.linkedin;
        return '<div class="mt-[6px] w-full max-w-[520px] rounded-[8px] border bg-white p-3 ' + BORDER + '">' +
          '<div class="mb-2 flex items-center gap-2"><span class="flex size-6 items-center justify-center rounded-[4px] text-[10px] font-bold text-white ' + n[1] + '">' + esc(n[0]) + '</span>' +
          '<span class="text-[13px] font-bold ' + INK + '">' + esc(a.network) + ' post · draft</span></div>' +
          '<p class="m-0 text-[14px] leading-5 ' + INK + '">' + esc(a.text) + '</p>' +
          '<p class="m-0 mt-2 text-[12px] ' + MUTED + '">Like · Comment · Repost</p></div>';
      }
      case 'profile':
        return '<div class="' + CARD + '">' + avatar(a.name, 36) + '<span class="min-w-0"><span class="block truncate text-[15px] font-bold ' + INK + '">' + esc(a.name) + '</span>' +
          '<span class="block truncate text-[13px] ' + LINK + '">' + esc(a.handle) + '</span>' +
          (a.stat ? '<span class="block text-[13px] ' + MUTED + '">' + esc(a.stat) + '</span>' : '') + '</span></div>';
      case 'react':
        return '<div class="mt-1 flex flex-wrap gap-1">' + a.items.map(function (r, i) {
          return '<span class="flex h-6 items-center gap-1 rounded-full border px-2 text-[12px] ' +
            (i === 0 ? 'border-[#1D9BD1] bg-[rgba(29,155,209,0.1)] text-[#1264A3]' : 'border-[#DDDDDD] bg-[#F8F8F8] text-[#616061]') +
            '"><span aria-hidden="true">' + esc(r.emoji) + '</span>' + r.count + '</span>';
        }).join('') + '</div>';
      default: {
        var pdf = /\.pdf$/i.test(a.name) || /pdf/i.test(a.sub), sheet = /\.(xlsx|csv)$/i.test(a.name) || /sheet/i.test(a.sub);
        return '<div class="' + CARD + '"><span class="flex size-9 shrink-0 items-center justify-center rounded-[6px] text-[10px] font-bold text-white ' +
          (pdf ? 'bg-[#E01E5A]' : sheet ? 'bg-[#007A5A]' : 'bg-[#1264A3]') + '">' + (pdf ? 'PDF' : sheet ? 'XLS' : 'DOC') + '</span>' +
          '<span class="min-w-0"><span class="block truncate text-[15px] font-bold ' + INK + '">' + esc(a.name) + '</span>' +
          (a.sub ? '<span class="block text-[13px] ' + MUTED + '">' + esc(a.sub) + '</span>' : '') + '</span></div>';
      }
    }
  }
  function messageHtml(m) {
    return '<div class="animate-in duration-300 fade-in slide-in-from-bottom-1 motion-reduce:animate-none"><div class="flex gap-2 px-5 py-2">' + avatar(m.author, 36) +
      '<div class="flex min-w-0 flex-col gap-[2px]"><div class="flex flex-wrap items-center gap-1.5">' +
      '<span class="text-[15px] leading-5 font-bold ' + INK + '">' + esc(m.author) + '</span>' +
      (FACES[m.author] ? '<span class="rounded-[2px] bg-[rgba(128,128,128,0.18)] px-1 py-px text-[10px] font-bold text-[#616061]">APP</span>' : '') +
      (m.time ? '<span class="text-[12px] ' + MUTED + '">' + esc(m.time) + '</span>' : '') + '</div>' +
      '<div class="flex flex-col gap-2 text-[15px] leading-[22px] ' + INK + '">' + m.paragraphs.map(paragraph).join('') + '</div>' +
      m.attachments.map(attachmentHtml).join('') + '</div></div></div>';
  }

  /* ---------------- Slack demo: playback ----------------
     Each conversation opens mid-dialogue (the script's opening) and carries on by itself: the next
     author "is typing…", the message lands, the thread scrolls. When one finishes the demo moves to
     the next tab. It only plays while on screen; the pointer over it holds the tab, a tab click hands
     control to the visitor, and with reduced motion every conversation is shown whole. */
  var PAUSE_MS = 250, HOLD_MS = 3500;
  function typingMs(m) {
    var chars = m.paragraphs.join(' ').length, agent = !!FACES[m.author];
    var ms = (agent ? 1200 : 1000) + chars * 4 + m.attachments.length * 200;
    return Math.min(1700, Math.max(agent ? 1400 : 1200, ms));
  }

  function demo() {
    var data = document.getElementById('demo-scripts'), root = document.getElementById('demo');
    if (!data || !root) return;
    var scenes = JSON.parse(data.textContent);
    var convs = scenes.map(function (s) { return parseScript(s.script); });
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var thread = document.getElementById('demo-thread'), channelEl = document.getElementById('demo-channel');
    var composer = document.getElementById('demo-composer'), typingEl = document.getElementById('demo-typing');
    var panel = document.getElementById('demo-window');

    var active = 0, visible = convs[0].messages.length, typing = null, started = false, manual = false, hovered = false;
    var onScreen = typeof IntersectionObserver === 'undefined', pinned = true, timers = [], shown = 0, shownOf = -1;
    var motion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    function reduce() { return !!(motion && motion.matches); }
    function conv() { return convs[active]; }

    function render() {
      var c = conv(), name = c.channel.replace(/^[#@]/, '');
      if (channelEl.textContent !== name) {
        channelEl.textContent = name;
        composer.textContent = 'Message ' + (c.channel.charAt(0) === '@' ? name : c.channel);
      }
      if (shownOf !== active || shown > visible) {
        thread.querySelectorAll(':scope > .animate-in').forEach(function (n) { n.remove(); });
        shown = 0; shownOf = active;
      }
      var html = '';
      for (; shown < visible && shown < c.messages.length; shown++) html += messageHtml(c.messages[shown]);
      if (html) thread.insertAdjacentHTML('beforeend', html);
      typingEl.innerHTML = typing ? '<b>' + esc(typing) + '</b> is typing…' : '';
      if (pinned) thread.scrollTop = thread.scrollHeight;
    }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function tick() {
      clearTimers();
      var total = conv().messages.length, playing = onScreen && !reduce();
      if (!playing) { visible = total; typing = null; render(); return; }
      if (!started) { started = true; visible = conv().intro; render(); }
      if (visible >= total) {
        typing = null; render();
        if (manual || hovered || convs.length < 2) return;
        timers.push(setTimeout(function () { open((active + 1) % convs.length); }, HOLD_MS));
        return;
      }
      var next = conv().messages[visible];
      timers.push(setTimeout(function () {
        typing = next.author; render();
        timers.push(setTimeout(function () { typing = null; visible++; render(); tick(); }, typingMs(next)));
      }, PAUSE_MS));
    }
    function open(i) {
      pinned = true; typing = null; active = i;
      visible = reduce() ? convs[i].messages.length : convs[i].intro;
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.setAttribute('data-state', on ? 'active' : 'inactive');
        var pill = t.querySelector('[aria-hidden]');
        if (on && !pill) t.insertAdjacentHTML('afterbegin', '<span aria-hidden="true" class="absolute inset-0 rounded-xl bg-light shadow-soft"></span>');
        else if (!on && pill) pill.remove();
      });
      panel.setAttribute('aria-labelledby', tabs[i] ? tabs[i].id : '');
      render(); tick();
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { manual = true; open(i); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var k = (i + d + tabs.length) % tabs.length;
        tabs[k].focus(); manual = true; open(k);
      });
    });
    thread.addEventListener('scroll', function () { pinned = thread.scrollHeight - thread.scrollTop - thread.clientHeight < 24; });
    root.addEventListener('pointerenter', function () { hovered = true; tick(); });
    root.addEventListener('pointerleave', function () { hovered = false; tick(); });
    if (motion && motion.addEventListener) motion.addEventListener('change', tick);
    render();
    if (!onScreen) {
      new IntersectionObserver(function (e) { onScreen = e[0].isIntersecting; tick(); }, { threshold: 0.35 }).observe(root);
    } else tick();
  }

  /* ---------------- FAQ ---------------- */
  function faq() {
    document.querySelectorAll('#kds-bottom button[aria-expanded]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') !== 'true', body = btn.nextElementSibling, icon = btn.querySelector('svg');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (icon) icon.classList.toggle('rotate-90', open);
        if (body) {
          body.classList.toggle('grid-rows-[0fr]', !open);
          body.classList.toggle('grid-rows-[1fr]', open);
          body.classList.toggle('pb-xs', open);
        }
      });
    });
  }

  /* ---------------- swimlane wires ----------------
     Right side out, a rounded elbow in the gutter before the target, left side in. */
  function wires() {
    var lanes = document.getElementById('lanes'), svg = document.getElementById('wires');
    if (!lanes || !svg) return;
    var WIRES = [['s1', 'h1'], ['s1', 's2'], ['s2', 's3'], ['s3', 's7'], ['s7', 'h2'], ['h2', 's4'], ['s4', 's5'], ['s4', 's6'], ['s4', 's8'], ['s4', 'h3', 'up']];
    function box(id) {
      var el = document.getElementById(id), o = lanes.getBoundingClientRect(), cell = el.getBoundingClientRect();
      var t = el.querySelector('.btn'), r = t ? t.getBoundingClientRect() : cell;
      return { cellL: cell.left - o.left, cellB: cell.bottom - o.top, l: r.left - o.left, r: r.right - o.left, t: r.top - o.top, cx: (r.left + r.right) / 2 - o.left, cy: (r.top + r.bottom) / 2 - o.top };
    }
    function elbow(x1, y1, x2, y2, xm) {
      var dy = y2 - y1, R = Math.min(14, Math.abs(dy) / 2), s = dy > 0 ? 1 : -1;
      if (Math.abs(dy) < 2) return 'M' + x1 + ' ' + y1 + ' H' + x2;
      return 'M' + x1 + ' ' + y1 + ' H' + (xm - R) + ' Q' + xm + ' ' + y1 + ' ' + xm + ' ' + (y1 + s * R) +
        ' V' + (y2 - s * R) + ' Q' + xm + ' ' + y2 + ' ' + (xm + R) + ' ' + y2 + ' H' + x2;
    }
    function draw() {
      var gap = parseFloat(getComputedStyle(lanes).columnGap) || 40;
      svg.querySelectorAll('path.w').forEach(function (p) { p.remove(); });
      WIRES.forEach(function (w) {
        var a = box(w[0]), b = box(w[1]), d;
        if (w[2] === 'up') d = 'M' + b.cx + ' ' + a.t + ' V' + (b.cellB + 6);
        else d = elbow(a.r, a.cy, b.l - 3, b.cy, b.cellL - gap / 2);
        var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('d', d); p.setAttribute('class', 'w' + (w[2] ? ' dash' : ''));
        p.setAttribute('marker-end', w[2] ? 'url(#ahr)' : 'url(#ah)');
        svg.appendChild(p);
      });
    }
    draw();
    if (window.ResizeObserver) new ResizeObserver(draw).observe(lanes);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  }

  demo(); faq(); wires();
})();
