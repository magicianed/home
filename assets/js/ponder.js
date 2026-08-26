/* ============================================================
   magicianed - Ponder
   Animated isometric scenes with one short caption per beat.
   Built for showing, not telling: you watch the thing happen,
   scrub back and forth, and the words stay out of the way.
   ============================================================ */
(function (w) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  function sv(tag, attrs, kids) {
    var n = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  /* ---------- isometric projection ---------- */
  function iso(x, y, z) { return [(x - y) * 0.866, (x + y) * 0.5 - z]; }
  function P(list) { return list.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }

  var uid = 0;

  /* ============================================================
     STAGE
     ============================================================ */
  function Stage(vbw, vbh, ox, oy) {
    var svg = sv('svg', { viewBox: '0 0 ' + vbw + ' ' + vbh, class: 'pn__svg' });
    var world = sv('g', { transform: 'translate(' + ox + ',' + oy + ')' });
    svg.appendChild(world);
    var reg = {};      /* key -> [nodes] */
    var cables = {};   /* key -> path id */

    var S = {
      svg: svg, world: world, reg: reg,

      add: function (node, key, always) {
        if (key) {
          (reg[key] = reg[key] || []).push(node);
          node.classList.add('pn-el');
          if (always) node.classList.add('pn-always');
        }
        world.appendChild(node);
        return node;
      },

      /* a solid isometric box: three flat faces, no gradients */
      prism: function (x, y, z, wd, dp, ht, o) {
        o = o || {};
        var g = sv('g', { class: 'pn-prism' + (o.accent ? ' pn-acc' : ''), style: o.accent ? '--acc:' + o.accent : null });
        var t = [iso(x, y, z + ht), iso(x + wd, y, z + ht), iso(x + wd, y + dp, z + ht), iso(x, y + dp, z + ht)];
        var l = [iso(x, y + dp, z + ht), iso(x + wd, y + dp, z + ht), iso(x + wd, y + dp, z), iso(x, y + dp, z)];
        var r = [iso(x + wd, y, z + ht), iso(x + wd, y + dp, z + ht), iso(x + wd, y + dp, z), iso(x + wd, y, z)];
        g.appendChild(sv('polygon', { points: P(l), class: 'f f--l' }));
        g.appendChild(sv('polygon', { points: P(r), class: 'f f--r' }));
        g.appendChild(sv('polygon', { points: P(t), class: 'f f--t' }));
        if (o.label) {
          var c = iso(x + wd / 2, y + dp / 2, z + ht);
          g.appendChild(sv('text', { x: c[0], y: c[1] + 3, class: 'pn-t pn-t--face' + (o.small ? ' pn-t--sm' : '') }, [txt(o.label)]));
        }
        return S.add(g, o.key, o.always);
      },

      /* a flat isometric plate - good for stacked layers */
      plate: function (x, y, z, wd, dp, o) {
        o = o || {};
        var g = sv('g', { class: 'pn-plate' + (o.accent ? ' pn-acc' : ''), style: o.accent ? '--acc:' + o.accent : null });
        var t = [iso(x, y, z), iso(x + wd, y, z), iso(x + wd, y + dp, z), iso(x, y + dp, z)];
        g.appendChild(sv('polygon', { points: P(t), class: 'f f--plate' }));
        if (o.label) {
          var c = iso(x + wd / 2, y + dp / 2, z);
          g.appendChild(sv('text', { x: c[0], y: c[1] + 3, class: 'pn-t pn-t--face' }, [txt(o.label)]));
        }
        return S.add(g, o.key, o.always);
      },

      /* camera: body + lens + tally lamp */
      cam: function (x, y, z, o) {
        o = o || {};
        var g = sv('g', { class: 'pn-cam' });
        [[0, 0, 0, 26, 18, 14]].forEach(function (b) {
          var t = [iso(x, y, z + 14), iso(x + 26, y, z + 14), iso(x + 26, y + 18, z + 14), iso(x, y + 18, z + 14)];
          var l = [iso(x, y + 18, z + 14), iso(x + 26, y + 18, z + 14), iso(x + 26, y + 18, z), iso(x, y + 18, z)];
          var r = [iso(x + 26, y, z + 14), iso(x + 26, y + 18, z + 14), iso(x + 26, y + 18, z), iso(x + 26, y, z)];
          g.appendChild(sv('polygon', { points: P(l), class: 'f f--l' }));
          g.appendChild(sv('polygon', { points: P(r), class: 'f f--r' }));
          g.appendChild(sv('polygon', { points: P(t), class: 'f f--t' }));
        });
        var lens = iso(x + 26, y + 9, z + 7);
        g.appendChild(sv('ellipse', { cx: lens[0] + 5, cy: lens[1], rx: 4, ry: 5.5, class: 'pn-lens' }));
        var lamp = iso(x + 13, y + 4, z + 17);
        var tl = sv('circle', { cx: lamp[0], cy: lamp[1], r: 3.4, class: 'pn-tally' });
        g.appendChild(tl);
        if (o.key) { (reg[o.key + ':tally'] = reg[o.key + ':tally'] || []).push(tl); tl.classList.add('pn-el', 'pn-always'); }
        if (o.label) {
          var c = iso(x + 13, y + 9, z);
          g.appendChild(sv('text', { x: c[0], y: c[1] + 22, class: 'pn-t pn-t--lbl' }, [txt(o.label)]));
        }
        return S.add(g, o.key, o.always);
      },

      /* a screen standing up in iso space */
      screen: function (x, y, z, wd, ht, o) {
        o = o || {};
        var g = sv('g', { class: 'pn-screen' + (o.accent ? ' pn-acc' : ''), style: o.accent ? '--acc:' + o.accent : null });
        var a = iso(x, y, z), b = iso(x + wd, y, z), c = iso(x + wd, y, z + ht), d = iso(x, y, z + ht);
        g.appendChild(sv('polygon', { points: P([a, b, c, d]), class: 'f f--scr' }));
        if (o.label) {
          var m = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
          g.appendChild(sv('text', { x: m[0], y: m[1] + 3, class: 'pn-t pn-t--face' }, [txt(o.label)]));
        }
        return S.add(g, o.key, o.always);
      },

      /* cable between two iso points, with signal dots that ride it */
      cable: function (p1, p2, o) {
        o = o || {};
        var a = iso(p1[0], p1[1], p1[2]), b = iso(p2[0], p2[1], p2[2]);
        var sag = o.sag === undefined ? 26 : o.sag;
        var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + sag;
        var d = 'M' + a[0].toFixed(1) + ',' + a[1].toFixed(1) + ' Q' + mx.toFixed(1) + ',' + my.toFixed(1) + ' ' + b[0].toFixed(1) + ',' + b[1].toFixed(1);
        var id = 'pnp' + (++uid);
        var g = sv('g', { class: 'pn-cable', style: o.accent ? '--acc:' + o.accent : null });
        g.appendChild(sv('path', { id: id, d: d, class: 'pn-cable__l' }));
        var dots = sv('g', { class: 'pn-flow' });
        for (var i = 0; i < 3; i++) {
          var dot = sv('circle', { r: 3.6, class: 'pn-dot' });
          var mo = sv('animateMotion', { dur: (o.speed || 1.7) + 's', repeatCount: 'indefinite', begin: (i * (o.speed || 1.7) / 3).toFixed(2) + 's' });
          mo.appendChild(sv('mpath', { href: '#' + id }));
          mo.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);
          dot.appendChild(mo);
          dots.appendChild(dot);
        }
        g.appendChild(dots);
        if (o.key) cables[o.key] = id;
        return S.add(g, o.key, o.always);
      },

      /* screen-space helpers for UI mock-ups */
      ui: function (x, y, wd, ht, o) {
        o = o || {};
        var g = sv('g', { class: 'pn-ui' + (o.accent ? ' pn-acc' : ''), style: o.accent ? '--acc:' + o.accent : null });
        g.appendChild(sv('rect', { x: x, y: y, width: wd, height: ht, rx: o.r === undefined ? 4 : o.r, class: 'pn-ui__r' }));
        if (o.label) {
          g.appendChild(sv('text', { x: x + wd / 2, y: y + ht / 2 + 3.5, class: 'pn-t pn-t--ui' + (o.small ? ' pn-t--sm' : '') }, [txt(o.label)]));
        }
        return S.add(g, o.key, o.always);
      },

      note: function (x, y, text, o) {
        o = o || {};
        var g = sv('g', { class: 'pn-note', style: o.accent ? '--acc:' + o.accent : null });
        g.appendChild(sv('text', { x: x, y: y, class: 'pn-t pn-t--note', 'text-anchor': o.anchor || 'middle' }, [txt(text)]));
        return S.add(g, o.key, o.always);
      },

      arrow: function (x1, y1, x2, y2, o) {
        o = o || {};
        var g = sv('g', { class: 'pn-arrow', style: o.accent ? '--acc:' + o.accent : null });
        g.appendChild(sv('path', { d: 'M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2, class: 'pn-arrow__l' }));
        var ang = Math.atan2(y2 - y1, x2 - x1), hw = 6;
        g.appendChild(sv('polygon', {
          points: P([
            [x2, y2],
            [x2 - hw * Math.cos(ang - 0.42), y2 - hw * Math.sin(ang - 0.42)],
            [x2 - hw * Math.cos(ang + 0.42), y2 - hw * Math.sin(ang + 0.42)]
          ]),
          class: 'pn-arrow__h'
        }));
        return S.add(g, o.key, o.always);
      },

      keys: function () { return Object.keys(reg); }
    };
    return S;
  }
  function txt(s) { return document.createTextNode(s); }

  /* ============================================================
     PLAYER
     ============================================================ */
  function mount(host, scene, opts) {
    opts = opts || {};
    var el = w.UI.el, clear = w.UI.clear;
    var S = Stage.apply(null, scene.view || [900, 470, 450, 250]);
    scene.build(S);

    var beats = scene.beats;
    var i = -1, playing = true, timer = null, done = false;

    var stageBox = el('div', { class: 'pn__stage' });
    stageBox.appendChild(S.svg);

    var cap = el('div', { class: 'pn__cap' });
    var capN = el('span', { class: 'pn__capn mono' });
    var capT = el('p', { class: 'pn__capt' });
    cap.appendChild(capN); cap.appendChild(capT);

    var dots = el('div', { class: 'pn__dots' });
    var btnPrev = el('button', { class: 'pn__b', title: 'Previous', html: '&#9664;', onclick: function () { playing = false; go(i - 1); } });
    var btnPlay = el('button', { class: 'pn__b pn__b--play', title: 'Play / pause', onclick: function () { playing = !playing; if (playing) { if (i >= beats.length - 1) go(0); else schedule(); } else stop(); paintCtl(); } });
    var btnNext = el('button', { class: 'pn__b', title: 'Next', html: '&#9654;', onclick: function () { playing = false; go(i + 1); } });
    var btnAgain = el('button', { class: 'btn btn--ghost btn--sm', text: 'Replay', onclick: function () { playing = true; go(0); } });
    var gotIt = el('button', { class: 'btn btn--go btn--sm pn__got', text: 'Got it', onclick: finish, hidden: true });

    var ctl = el('div', { class: 'pn__ctl' }, [btnPrev, btnPlay, btnNext, dots, btnAgain, gotIt]);

    clear(host).appendChild(el('div', { class: 'pn' }, [
      el('div', { class: 'pn__head' }, [
        el('span', { class: 'chip chip--brand', text: 'Ponder' }),
        el('span', { class: 'pn__title', text: scene.title })
      ]),
      stageBox, cap, ctl
    ]));

    beats.forEach(function (b, k) {
      dots.appendChild(el('button', {
        class: 'pn__dot', title: 'Beat ' + (k + 1),
        onclick: function () { playing = false; go(k); }
      }));
    });

    function stop() { if (timer) { clearTimeout(timer); timer = null; } }
    function schedule() {
      stop();
      var b = beats[i];
      timer = setTimeout(function () {
        if (i >= beats.length - 1) { playing = false; paintCtl(); finish(); return; }
        go(i + 1);
      }, b && b.ms ? b.ms : 3400);
    }

    function go(n) {
      n = w.UI.clamp(n, 0, beats.length - 1);
      i = n;
      apply(n);
      paintCap(); paintCtl();
      if (playing) schedule(); else stop();
      if (n === beats.length - 1) finish();
    }

    function apply(n) {
      var on = {};
      for (var k = 0; k <= n; k++) {
        (beats[k].on || []).forEach(function (x) { on[x] = 1; });
        (beats[k].off || []).forEach(function (x) { delete on[x]; });
      }
      var hi = {}, fl = {};
      (beats[n].hi || []).forEach(function (x) { hi[x] = 1; });
      (beats[n].flow || []).forEach(function (x) { fl[x] = 1; });
      Object.keys(S.reg).forEach(function (key) {
        S.reg[key].forEach(function (node) {
          if (!node.classList.contains('pn-always')) node.classList.toggle('is-on', !!on[key]);
          node.classList.toggle('is-hi', !!hi[key]);
          node.classList.toggle('is-flow', !!fl[key]);
        });
      });
    }

    function paintCap() {
      capN.textContent = (i + 1) + ' / ' + beats.length;
      capT.textContent = beats[i].t;
      cap.classList.remove('is-in');
      void cap.offsetWidth;
      cap.classList.add('is-in');
    }
    function paintCtl() {
      btnPlay.innerHTML = playing ? '&#10074;&#10074;' : '&#9654;';
      w.UI.qsa('.pn__dot', dots).forEach(function (d, k) {
        d.classList.toggle('is-on', k === i);
        d.classList.toggle('is-past', k < i);
      });
      btnPrev.disabled = i <= 0;
      btnNext.disabled = i >= beats.length - 1;
    }

    function finish() {
      if (done) return;
      done = true;
      gotIt.hidden = false;
      w.UI.Sound.good();
      if (opts.onComplete) opts.onComplete();
    }

    go(0);
    return {
      destroy: function () { stop(); clear(host); }
    };
  }

  w.Ponder = { mount: mount, Stage: Stage, iso: iso, sv: sv };
})(window);
