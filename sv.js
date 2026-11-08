(function () {
  var top = document.getElementById('kds-top'), bottom = document.getElementById('kds-bottom');
  if (!window.KinetikDS) { top.innerHTML = '<p class="kds-error">The Kinetik blocks did not load: kinetik-ds.js is missing next to the page.</p>'; return; }
  try {
    window.KinetikDS.renderPage(top, JSON.parse(document.getElementById('page-top').textContent), { chrome: false });
    window.KinetikDS.renderPage(bottom, JSON.parse(document.getElementById('page-bottom').textContent), { chrome: false });
  } catch (e) { top.innerHTML = '<p class="kds-error">Could not render the page: ' + String(e.message) + '</p>'; }

  // The Slack mock draws initials for anyone who isn't Kinetik; give our three their faces and APP badges.
  // React reuses rows across tabs, so recompute from the current name every time and never swap nodes.
  var FACES = { Gilfoyle: 'assets/cast/gilfoyle-face.jpg', Dinesh: 'assets/cast/dinesh-face.jpg', Donald: 'assets/cast/donald-face.jpg' };
  function dress(root) {
    root.querySelectorAll('span.font-bold').forEach(function (name) {
      var row = name.parentElement && name.parentElement.parentElement && name.parentElement.parentElement.parentElement;
      var avatar = row && row.firstElementChild;
      if (!avatar || avatar.tagName !== 'SPAN' || avatar === name) return;
      var face = FACES[name.textContent.trim()];
      if (face) {
        avatar.style.backgroundImage = 'url("' + face + '")';
        avatar.style.backgroundSize = 'cover';
        avatar.style.backgroundPosition = 'center';
        avatar.style.color = 'transparent';
        name.setAttribute('data-sv-app', '');
      } else if (name.hasAttribute('data-sv-app')) {
        avatar.style.backgroundImage = ''; avatar.style.color = '';
        name.removeAttribute('data-sv-app');
      }
    });
  }
  // The demo tabs need one line of context: these are the four legs of one end-to-end flow.
  function demoIntro() {
    var tabs = top.querySelector('[role="tablist"]');
    if (!tabs || top.querySelector('.demo-intro')) return;
    var box = document.createElement('div');
    box.className = 'demo-intro';
    box.innerHTML = '<h2>One flow, end to end</h2><p>Development, code review, SRE and support, wired together in Slack. Pick a tab to watch it run.</p>';
    tabs.parentElement.insertBefore(box, tabs);
  }
  dress(top); demoIntro();
  new MutationObserver(function () { dress(top); demoIntro(); }).observe(top, { childList: true, subtree: true, characterData: true });

  // Wires between swimlane steps: right side out, a rounded elbow in the gutter before the target, left side in.
  var lanes = document.getElementById('lanes'), svg = document.getElementById('wires');
  var WIRES = [['s1','h1'],['s1','s2'],['s2','s3'],['s3','s7'],['s7','h2'],['h2','s4'],['s4','s5'],['s4','s6'],['s4','s8'],['s4','h3','up']];
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
})();
