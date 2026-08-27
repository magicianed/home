/* ============================================================
   magicianed - Picture
   Draws what a source actually LOOKS like, and composites the
   keyers, graphics, transitions and camera grade on top, so you
   can see the effect of what you just did instead of reading a
   label that says "CAM 1".
   Flat shapes only. No gradients.
   ============================================================ */
(function (w) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs, kids) {
    var n = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function txt(str) { return document.createTextNode(str); }
  var W = 320, H = 180;

  /* ---------- building blocks ---------- */
  function bg(fill) { return s('rect', { x: 0, y: 0, width: W, height: H, fill: fill }); }

  /* a seated person, flat silhouette */
  function person(cx, baseY, scale, fill) {
    scale = scale || 1;
    var g = s('g', { transform: 'translate(' + cx + ',' + baseY + ') scale(' + scale + ')' });
    g.appendChild(s('path', {
      d: 'M -34 0 C -34 -30 -18 -42 0 -42 C 18 -42 34 -30 34 0 Z', fill: fill
    }));
    g.appendChild(s('circle', { cx: 0, cy: -56, r: 17, fill: fill }));
    return g;
  }
  function desk(y, fill) { return s('rect', { x: 0, y: y, width: W, height: H - y, fill: fill }); }

  /* ---------- the raw picture for each source ---------- */
  var FRAME = {
    0: function () { return [bg('#000000')]; },

    1: function () { /* CAM 1 - host, mid shot */
      return [bg('#16202c'), s('rect', { x: 0, y: 0, width: W, height: 74, fill: '#1d2a38' }),
        person(160, 168, 1.5, '#5b7d9e'), desk(150, '#101821')];
    },
    2: function () { /* CAM 2 - guest */
      return [bg('#1d1a2c'), s('rect', { x: 0, y: 0, width: W, height: 74, fill: '#26223a' }),
        person(160, 168, 1.5, '#8878b8'), desk(150, '#141222')];
    },
    3: function () { /* CAM 3 - two shot */
      return [bg('#122420'), s('rect', { x: 0, y: 0, width: W, height: 80, fill: '#183029' }),
        person(108, 172, 1.25, '#4f9e7f'), person(212, 172, 1.25, '#3f8268'), desk(156, '#0c1a16')];
    },
    4: function () { /* WIDE - three people, small in frame */
      return [bg('#231b12'), s('rect', { x: 0, y: 0, width: W, height: 96, fill: '#2c2318' }),
        person(88, 158, 0.82, '#a8834f'), person(160, 158, 0.82, '#b8925a'), person(232, 158, 0.82, '#a8834f'),
        desk(148, '#170f08')];
    },
    5: function () { /* GREEN SCREEN - subject on a flat green plate */
      return [bg('#00b140'), person(160, 168, 1.5, '#3f6f8f')];
    },
    6: function () { /* VT playback */
      return [bg('#2a1218'),
        s('polygon', { points: '142,66 142,114 186,90', fill: '#e07a94' }),
        s('rect', { x: 96, y: 132, width: 128, height: 5, rx: 2, fill: '#4a2029' }),
        s('rect', { x: 96, y: 132, width: 52, height: 5, rx: 2, fill: '#e07a94' })];
    },
    7: function () { /* SLIDES / holding card */
      return [bg('#15151a'),
        s('rect', { x: 52, y: 58, width: 216, height: 12, rx: 2, fill: '#c9c9d4' }),
        s('rect', { x: 82, y: 82, width: 156, height: 7, rx: 2, fill: '#63636e' }),
        s('rect', { x: 104, y: 98, width: 112, height: 7, rx: 2, fill: '#4a4a55' })];
    },
    8: function () { /* ROVING - handheld tilt */
      var g = s('g', { transform: 'rotate(-3 160 90)' });
      [bg('#0f2530'), s('rect', { x: -20, y: 0, width: W + 40, height: 86, fill: '#153140' }),
        person(150, 176, 1.35, '#4b90a4'), desk(158, '#0a1a22')].forEach(function (n) { g.appendChild(n); });
      return [bg('#0f2530'), g];
    },

    1000: function () { /* colour bars */
      var cols = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'];
      return [bg('#000')].concat(cols.map(function (c, i) {
        return s('rect', { x: i * (W / 7), y: 0, width: W / 7 + 1, height: 132, fill: c });
      })).concat([s('rect', { x: 0, y: 132, width: W, height: 48, fill: '#101018' })]);
    },
    2001: function () { return [bg('#3b3bd0')]; },
    2002: function () { return [bg('#d03b8f')]; },
    6000: function () { /* SuperSource - four boxes */
      var g = [bg('#15111c')];
      [[14, 14], [166, 14], [14, 96], [166, 96]].forEach(function (p, i) {
        g.push(s('rect', { x: p[0], y: p[1], width: 140, height: 70, fill: ['#2a3a4c', '#33294a', '#20382f', '#3a2e1e'][i] }));
      });
      return g;
    }
  };

  /* graphics that live in the media pool */
  function graphic(tag, kind) {
    if (tag === 'LOWER THIRD') {
      return [s('rect', { x: 18, y: 118, width: 178, height: 34, rx: 3, fill: '#0d0d0f', opacity: '.92' }),
        s('rect', { x: 18, y: 118, width: 4, height: 34, fill: '#a259ff' }),
        s('rect', { x: 30, y: 126, width: 96, height: 8, rx: 2, fill: '#ffffff' }),
        s('rect', { x: 30, y: 139, width: 62, height: 6, rx: 2, fill: '#8a8a94' })];
    }
    if (tag === 'BUG') {
      return [s('rect', { x: 262, y: 14, width: 44, height: 26, rx: 3, fill: '#0d0d0f', opacity: '.85' }),
        s('rect', { x: 270, y: 22, width: 28, height: 10, rx: 2, fill: '#ffffff' })];
    }
    if (tag === 'HOLDING') return FRAME[7]();
    if (tag === 'BACKGROUND') {
      return [bg('#1a2330'), s('rect', { x: 0, y: 108, width: W, height: 72, fill: '#111822' }),
        s('rect', { x: 24, y: 30, width: 76, height: 60, fill: '#22303f' }),
        s('rect', { x: 220, y: 30, width: 76, height: 60, fill: '#22303f' })];
    }
    if (tag === 'STINGER') return [bg('#1b1420')];
    return [bg('#1a1a20')];
  }

  function poolItem(st, playerIdx) {
    var p = st && st.players && st.players[playerIdx];
    if (!p || p.slot < 0) return null;
    return st.pool[p.slot] || null;
  }

  /* media player pictures depend on what is loaded */
  function mpFrame(st, idx, keyOnly) {
    var item = poolItem(st, idx);
    if (!item) return [bg('#0c0c0e'), s('rect', { x: 130, y: 84, width: 60, height: 3, fill: '#3a3a44' })];
    if (keyOnly) {
      /* the alpha channel: white where the graphic is */
      if (item.tag === 'LOWER THIRD') return [bg('#000'), s('rect', { x: 18, y: 118, width: 178, height: 34, rx: 3, fill: '#fff' })];
      if (item.tag === 'BUG') return [bg('#000'), s('rect', { x: 262, y: 14, width: 44, height: 26, rx: 3, fill: '#fff' })];
      return [bg('#ffffff')];
    }
    if (item.alpha) return [checker()].concat(graphic(item.tag, item.kind));
    return graphic(item.tag, item.kind);
  }
  function checker() {
    var g = s('g', {});
    g.appendChild(bg('#0c0c0e'));
    for (var y = 0; y < H; y += 16) for (var x = 0; x < W; x += 16) {
      if (((x / 16) + (y / 16)) % 2 === 0) g.appendChild(s('rect', { x: x, y: y, width: 16, height: 16, fill: '#16161a' }));
    }
    return g;
  }

  function frameFor(id, st) {
    if (id === 3010) return mpFrame(st, 0, false);
    if (id === 3011) return mpFrame(st, 0, true);
    if (id === 3020) return mpFrame(st, 1, false);
    if (id === 3021) return mpFrame(st, 1, true);
    var f = FRAME[id];
    return f ? f() : [bg('#0c0c0e')];
  }

  /* the green-screen subject with the green removed */
  function keyedSubject() { return [person(160, 168, 1.5, '#3f6f8f')]; }

  /* ---------- camera grade, as flat overlays ---------- */
  function gradeOverlays(g) {
    var out = [];
    if (!g) return out;
    /* iris: f/1.8 open (bright) .. f/16 closed (dark). 5.6 is correct. */
    var ev = (g.iris - 5.6);
    if (ev > 0.05) out.push(s('rect', { x: 0, y: 0, width: W, height: H, fill: '#000000', opacity: Math.min(0.62, ev * 0.075).toFixed(3) }));
    else if (ev < -0.05) out.push(s('rect', { x: 0, y: 0, width: W, height: H, fill: '#ffffff', opacity: Math.min(0.5, -ev * 0.075).toFixed(3) }));
    /* white balance away from the 3200K reference reads as a colour cast */
    var dk = (g.wb - 3200);
    if (dk > 60) out.push(s('rect', { x: 0, y: 0, width: W, height: H, fill: '#2f6fff', opacity: Math.min(0.42, dk / 14000).toFixed(3) }));
    else if (dk < -60) out.push(s('rect', { x: 0, y: 0, width: W, height: H, fill: '#ff9a2f', opacity: Math.min(0.42, -dk / 3000).toFixed(3) }));
    /* tint */
    if (Math.abs(g.tint) > 0.5) {
      out.push(s('rect', { x: 0, y: 0, width: W, height: H, fill: g.tint > 0 ? '#38d048' : '#d038b0', opacity: Math.min(0.3, Math.abs(g.tint) / 60).toFixed(3) }));
    }
    /* lifted black = milky shadows */
    if (g.black > 0.5) out.push(s('rect', { x: 0, y: 0, width: W, height: H, fill: '#7a7a88', opacity: Math.min(0.4, g.black / 60).toFixed(3) }));
    else if (g.black < -0.5) out.push(s('rect', { x: 0, y: 0, width: W, height: H, fill: '#000000', opacity: Math.min(0.4, -g.black / 60).toFixed(3) }));
    return out;
  }

  /* ============================================================
     make(opts) -> <svg>
     opts: { src, st, ftb, mix:{from,to,t}, usk, dsk, grade, badge }
     ============================================================ */
  function make(opts) {
    opts = opts || {};
    var st = opts.st || null;
    var root = s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'pic', preserveAspectRatio: 'xMidYMid slice' });

    if (opts.ftb) {
      root.appendChild(bg('#000000'));
      root.appendChild(s('text', { x: W / 2, y: H / 2 + 4, class: 'pic__t pic__t--big', fill: '#ff2d2d' }, [txt('FADED TO BLACK')]));
      return root;
    }

    /* background layer, with a crossfade during a transition */
    var base = s('g', {});
    frameFor(opts.src, st).forEach(function (n) { base.appendChild(n); });
    root.appendChild(base);
    if (opts.mix && opts.mix.t > 0) {
      var t = Math.min(1, opts.mix.t);
      var style = opts.mix.style || 'mix';
      var over = s('g', {});
      frameFor(opts.mix.to, st).forEach(function (n) { over.appendChild(n); });

      if (style === 'wipe') {
        /* a hard edge sweeps across, revealing the new picture */
        var cid = 'wipe' + Math.random().toString(36).slice(2, 7);
        var cp = s('clipPath', { id: cid }, [s('rect', { x: 0, y: 0, width: (W * t).toFixed(1), height: H })]);
        root.appendChild(cp);
        over.setAttribute('clip-path', 'url(#' + cid + ')');
        root.appendChild(over);
        root.appendChild(s('rect', { x: (W * t - 2).toFixed(1), y: 0, width: 4, height: H, fill: '#ffffff' }));
      } else if (style === 'dve') {
        /* the new picture slides in from the right, pushing nothing */
        over.setAttribute('transform', 'translate(' + (W * (1 - t)).toFixed(1) + ',0)');
        root.appendChild(over);
        root.appendChild(s('rect', { x: (W * (1 - t)).toFixed(1), y: 0, width: 3, height: H, fill: '#ffffff', opacity: '.8' }));
      } else if (style === 'dip') {
        /* out through a colour, then in to the new picture */
        if (t < 0.5) {
          root.appendChild(s('rect', { x: 0, y: 0, width: W, height: H, fill: '#ffffff', opacity: (t * 2).toFixed(3) }));
        } else {
          over.setAttribute('opacity', '1');
          root.appendChild(over);
          root.appendChild(s('rect', { x: 0, y: 0, width: W, height: H, fill: '#ffffff', opacity: (2 - t * 2).toFixed(3) }));
        }
        root.appendChild(s('text', { x: W / 2, y: 16, class: 'pic__t', fill: '#000' }, [txt('DIPPING THROUGH WHITE')]));
      } else if (style === 'sting') {
        /* a graphic covers the screen, and the shot changes behind it */
        if (t >= 0.5) { over.setAttribute('opacity', '1'); root.appendChild(over); }
        var cover = Math.min(1, (0.5 - Math.abs(t - 0.5)) * 2 + 0.15);
        root.appendChild(s('rect', { x: 0, y: 0, width: W, height: H, fill: '#a259ff', opacity: cover.toFixed(3) }));
        root.appendChild(s('rect', { x: 96, y: 82, width: 128, height: 16, rx: 3, fill: '#ffffff', opacity: cover.toFixed(3) }));
      } else {
        over.setAttribute('opacity', t.toFixed(3));
        root.appendChild(over);
      }
    }

    /* upstream key */
    var k = opts.usk;
    if (k && k.onAir) {
      if (k.type === 'chroma' && k.fill === 5) {
        if (k.sampled) {
          keyedSubject().forEach(function (n) { root.appendChild(n); });
        } else {
          /* not sampled: the whole green plate is still there, covering everything */
          frameFor(5, st).forEach(function (n) { root.appendChild(n); });
          root.appendChild(s('text', { x: W / 2, y: 24, class: 'pic__t', fill: '#0d0d0f' }, [txt('KEY NOT SAMPLED')]));
        }
      } else {
        var box = s('g', {});
        box.appendChild(s('rect', { x: 168, y: 22, width: 132, height: 74, fill: '#000', opacity: '.5' }));
        var inner = s('svg', { x: 172, y: 26, width: 124, height: 66, viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'xMidYMid slice' });
        frameFor(k.fill, st).forEach(function (n) { inner.appendChild(n); });
        box.appendChild(inner);
        root.appendChild(box);
      }
    }

    /* downstream keys */
    (opts.dsk || []).forEach(function (d, i) {
      if (!d.onAir) return;
      var item = d.fill === 3010 ? poolItem(st, 0) : (d.fill === 3020 ? poolItem(st, 1) : null);
      if (item) {
        graphic(item.tag, item.kind).forEach(function (n) { root.appendChild(n); });
        if (!d.pre && item.alpha) {
          /* un-ticked pre-multiplied key: the classic black halo */
          root.appendChild(s('rect', {
            x: 14, y: 114, width: 186, height: 42, rx: 4, fill: 'none',
            stroke: '#000', 'stroke-width': 8, opacity: '.75'
          }));
          root.appendChild(s('text', { x: W / 2, y: 172, class: 'pic__t', fill: '#ff2d2d' }, [txt('BLACK HALO - TICK PRE MULTIPLIED KEY')]));
        }
      } else {
        var f = s('g', { opacity: '.9' });
        frameFor(d.fill, st).forEach(function (n) { f.appendChild(n); });
        root.appendChild(f);
      }
    });

    /* camera grade sits over everything for a single camera view */
    gradeOverlays(opts.grade).forEach(function (n) { root.appendChild(n); });

    if (opts.badge) {
      root.appendChild(s('rect', { x: 6, y: 6, width: 8 + opts.badge.length * 5.6, height: 15, rx: 2, fill: '#000', opacity: '.6' }));
      root.appendChild(s('text', { x: 10, y: 17, class: 'pic__t pic__t--l', fill: '#fff' }, [txt(opts.badge)]));
    }
    return root;
  }

  w.Pic = { make: make, W: W, H: H, FRAME: FRAME };
})(window);
