/* ============================================================
   magicianed - hardware simulations
     SimRear  : clickable rear panel connector explorer
     SimPanel : the HD8 front control panel, playable with a mouse
   ============================================================ */
(function (w) {
  'use strict';
  var el = w.UI.el, clear = w.UI.clear, Sound = w.UI.Sound;

  /* ============================================================
     REAR PANEL
     ============================================================ */
  var REAR = [
    { id: 'sdiin', label: 'SDI IN 1-8', accent: 'var(--pvw)', span: 4,
      ports: [1, 2, 3, 4, 5, 6, 7, 8].map(function (n) { return { t: 'bnc', n: String(n) }; }),
      title: 'SDI Inputs 1-8',
      body: 'Cameras and playback. Auto-detects 1.5G and 3G-SDI, with four channels of embedded audio each. Every source must match the switcher video standard exactly.' },
    { id: 'sdiout', label: 'SDI OUT 1-8', accent: 'var(--key)', span: 4,
      ports: [1, 2, 3, 4, 5, 6, 7, 8].map(function (n) { return { t: 'bnc', n: String(n) }; }),
      title: 'SDI Outputs 1-8 - camera returns',
      body: 'One return per camera, carrying program, tally and camera control back down the same coax. Camera 3 into IN 3, OUT 3 back to camera 3.' },
    { id: 'pgm', label: 'PGM / AUX / MV', accent: 'var(--pgm)', span: 2,
      ports: [{ t: 'bnc', n: 'PGM' }, { t: 'bnc', n: 'AUX 1' }, { t: 'bnc', n: 'AUX 2' }, { t: 'bnc', n: 'MV' }, { t: 'hdmi', n: 'MV' }],
      title: 'Program, Aux and Multiview',
      body: 'Program is the clean show output. The two aux outputs are independently routable - a stage screen, a clean feed. Multiview appears on both SDI and HDMI.' },
    { id: 'audio', label: 'ANALOG AUDIO', accent: 'var(--audio)', span: 2,
      ports: [{ t: 'xlr', n: 'IN 1' }, { t: 'xlr', n: 'IN 2' }, { t: 'rca', n: 'L' }, { t: 'rca', n: 'R' }, { t: 'jack', n: 'OUT' }],
      title: 'Analog audio',
      body: 'Two balanced XLR inputs for microphones or line level, RCA stereo for a laptop, and balanced jack outputs for monitoring or a PA send.' },
    { id: 'net', label: 'ETHERNET', accent: 'var(--info)', span: 1,
      ports: [{ t: 'rj', n: '1' }, { t: 'rj', n: '2' }, { t: 'rj', n: '3' }, { t: 'rj', n: '4' }],
      title: 'Ethernet x4',
      body: 'A gigabit network switch built into the box. Control computer, house network and the internet connection for streaming all land here.' },
    { id: 'usb', label: 'USB-C', accent: 'var(--iso)', span: 1,
      ports: [{ t: 'usb', n: '1' }, { t: 'usb', n: '2' }],
      title: 'USB-C x2',
      body: 'Record the show to an external SSD, output as a USB webcam, or connect a computer directly. Format record media as exFAT.' },
    { id: 'talk', label: 'TALKBACK', accent: 'var(--brand)', span: 1,
      ports: [{ t: 'xlr5', n: 'HEADSET' }],
      title: 'Talkback headset',
      body: 'A broadcast headset on the 5-pin XLR puts you on a party line with your camera operators over SDI, with mix-minus so nobody hears themselves.' },
    { id: 'power', label: 'POWER', accent: 'var(--ink-2)', span: 1,
      ports: [{ t: 'iec', n: 'AC' }, { t: 'dc', n: '12V' }],
      title: 'Power - mains + 12V DC',
      body: 'Two independent inputs. Wire both and mains can drop without the switcher rebooting. There is no power switch - it boots when it has power.' }
  ];


  function mountRear(host, opts) {
    opts = opts || {};
    var found = {};
    var done = false;

    var board = el('div', { class: 'rear' });
    var info = el('div', { class: 'rearinfo' }, [
      el('div', { class: 'rearinfo__t', text: 'Click a connector group' }),
      el('p', { class: 'rearinfo__b', text: 'Every socket you will actually use. Identify all eight to clear the level.' })
    ]);
    var counter = el('div', { class: 'rearcount' });

    REAR.forEach(function (g) {
      var group = el('button', {
        class: 'rgrp', style: { gridColumn: 'span ' + g.span, '--acc': g.accent },
        onclick: function () {
          if (!found[g.id]) { found[g.id] = true; Sound.good(); }
          else Sound.tap();
          group.classList.add('is-found');
          clear(info);
          info.appendChild(el('div', { class: 'rearinfo__t', text: g.title }));
          info.appendChild(el('p', { class: 'rearinfo__b', text: g.body }));
          paintCount();
        }
      });
      var pr = el('div', { class: 'rgrp__ports' });
      g.ports.forEach(function (p) {
        pr.appendChild(el('span', { class: 'port port--' + p.t, title: p.n }, [el('i'), el('b', { text: p.n })]));
      });
      group.appendChild(pr);
      group.appendChild(el('span', { class: 'rgrp__lbl', text: g.label }));
      board.appendChild(group);
    });

    function paintCount() {
      var n = Object.keys(found).length;
      clear(counter);
      counter.appendChild(el('div', { class: 'rearcount__bar' }, [el('i', { style: { width: (n / REAR.length * 100) + '%' } })]));
      counter.appendChild(el('span', { class: 'mono', text: n + ' / ' + REAR.length + ' groups identified' }));
      if (n === REAR.length && !done) {
        done = true;
        w.UI.toast('<b>Rear panel mapped.</b> You can name every connector on the box.', 'ok', 3600);
        if (opts.onComplete) opts.onComplete();
      }
    }

    var chassis = el('div', { class: 'chassis' }, [
      el('div', { class: 'chassis__ear' }),
      el('div', { class: 'chassis__face' }, [board]),
      el('div', { class: 'chassis__ear' })
    ]);

    clear(host).appendChild(el('div', { class: 'rearwrap' }, [
      el('div', { class: 'rearwrap__scroll' }, [chassis]),
      counter,
      info
    ]));
    paintCount();
    return { destroy: function () { clear(host); } };
  }

  /* ============================================================
     FRONT PANEL
     ============================================================ */
  var XPT = [
    { n: 1, s: 'CAM 1' }, { n: 2, s: 'CAM 2' }, { n: 3, s: 'CAM 3' }, { n: 4, s: 'WIDE' }, { n: 5, s: 'GREEN' },
    { n: 6, s: 'VT' }, { n: 7, s: 'SLIDES' }, { n: 8, s: 'ROVING' }, { n: 9, s: 'BLACK' }, { n: 10, s: 'BARS' }
  ];
  var XPT_SHIFT = [
    { n: 1, s: 'COL 1' }, { n: 2, s: 'COL 2' }, { n: 3, s: 'MP 1' }, { n: 4, s: 'MP 1 K' }, { n: 5, s: 'MP 2' },
    { n: 6, s: 'MP 2 K' }, { n: 7, s: 'SSRC' }, { n: 8, s: '-' }, { n: 9, s: '-' }, { n: 10, s: '-' }
  ];

  function mountPanel(host, opts) {
    opts = opts || {};
    var p = {
      pgm: 4, pvw: 6, shift: false, style: 'mix', rate: 25,
      keys: [false, false, false, false], dsk: [{ tie: false, air: false }, { tie: false, air: false }],
      aux: 1, tbar: 0, ftb: false, rec: false, stream: false,
      joy: { x: 0, y: 0, z: 0 }, keypad: '', macro: -1, lcd: 'READY   1080p50   DISK OK'
    };
    var met = { shiftUsed: false, tbarRuns: 0, joyMoved: false, keypadSet: false, macroFired: false, auxSet: false, cuts: 0, autos: 0 };
    var doneT = {}, finished = false;

    var DRILLS = [
      { id: 'a', label: 'Put CAM 1 on the program row', hint: 'Top crosspoint row - the red one.',
        check: function () { return p.pgm === 1; } },
      { id: 'b', label: 'Line CAM 3 up on preview and CUT to it', hint: 'Green row, then the CUT button.',
        check: function () { return met.cuts >= 1 && p.pgm === 3; } },
      { id: 'c', label: 'Use SHIFT to reach the second bank and put MEDIA PLAYER 1 on preview',
        hint: 'Press SHIFT - the LCD labels change - then crosspoint 3.',
        check: function () { return met.shiftUsed && p.pvw === 103; } },
      { id: 'd', label: 'Select the WIPE transition type', hint: 'Transition type buttons on the right.',
        check: function () { return p.style === 'wipe'; } },
      { id: 'e', label: 'Set the transition rate to 15 frames on the numeric keypad',
        hint: 'Type 1 then 5 then ENTER.', check: function () { return met.keypadSet && p.rate === 15; } },
      { id: 'f', label: 'Run a full manual transition on the fader bar', hint: 'Drag it end to end.',
        check: function () { return met.tbarRuns >= 1; } },
      { id: 'g', label: 'Arm KEY 1 and take it with AUTO', hint: 'KEY 1 button, then AUTO.',
        check: function () { return met.autos >= 1 && p.keys[0]; } },
      { id: 'h', label: 'Put DSK 1 on air', hint: 'DSK 1 ON AIR in the downstream key block.',
        check: function () { return p.dsk[0].air; } },
      { id: 'i', label: 'Route CAM 4 (WIDE) to AUX 1', hint: 'Press an AUX button, then a source.',
        check: function () { return met.auxSet && p.aux === 4; } },
      { id: 'j', label: 'Move the DVE with the joystick', hint: 'Drag the joystick puck.',
        check: function () { return met.joyMoved; } },
      { id: 'k', label: 'Fire a macro', hint: 'Any of the macro buttons.',
        check: function () { return met.macroFired; } },
      { id: 'l', label: 'Arm recording and streaming from the panel', hint: 'The REC and STREAM buttons.',
        check: function () { return p.rec && p.stream; } },
      { id: 'm', label: 'Fade to black', hint: 'FTB.', check: function () { return p.ftb; } }
    ];

    var root = el('div', { class: 'panelwrap' });
    var taskPanel = el('div', { class: 'card card--pad' });
    var coachBox = w.UI.coach({
      exam: !!opts.exam,
      root: root,
      onSpot: function () { var t = currentDrill(); if (t) w.UI.spotlight(root, t.spot); },
      onRefresh: function () { applyCoach(true); }
    });
    var wrap = el('div', { class: 'simwrap simwrap--stack' }, [
      el('div', {}, [coachBox.el, root]),
      el('div', { class: 'simside' }, [taskPanel])
    ]);
    clear(host).appendChild(wrap);

    function currentDrill() {
      for (var i = 0; i < DRILLS.length; i++) if (!doneT[DRILLS[i].id]) return DRILLS[i];
      return null;
    }
    function applyCoach() {
      var t = currentDrill();
      var idx = t ? DRILLS.indexOf(t) : DRILLS.length;
      coachBox.set(t, idx, DRILLS.length);
      if (!t) { w.UI.spotlight(root, null); return; }
      if (coachBox.auto) w.UI.spotlight(root, t.spot, { persist: true, quiet: true, scroll: false });
    }

    var tbarEl, tbarFill, tbarKnob, joyEl, joyPuck;

    function press(fn) { return function () { Sound.click(); fn(); check(); render(); }; }

    function render() {
      clear(root);
      var face = el('div', { class: 'pface' });

      /* ---- left: system LCD + keypad ---- */
      var left = el('div', { class: 'pcol pcol--left' });
      left.appendChild(el('div', { class: 'plcd' }, [
        el('div', { class: 'plcd__l1 mono', text: p.lcd }),
        el('div', { class: 'plcd__l2 mono', text: 'PGM ' + srcLabel(p.pgm) + '   PVW ' + srcLabel(p.pvw) }),
        el('div', { class: 'plcd__l3 mono', text: p.style.toUpperCase() + ' ' + p.rate + 'f' + (p.rec ? '  [REC]' : '') + (p.stream ? '  [LIVE]' : '') + (p.ftb ? '  [FTB]' : '') })
      ]));
      var pad = el('div', { class: 'pkeypad' });
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'ENT'].forEach(function (k) {
        pad.appendChild(el('button', {
          class: 'pkey' + (k === 'ENT' ? ' pkey--ent' : '') + (k === 'CLR' ? ' pkey--clr' : ''), text: k,
          onclick: press(function () {
            if (k === 'CLR') p.keypad = '';
            else if (k === 'ENT') {
              var v = parseInt(p.keypad, 10);
              if (v > 0 && v <= 250) { p.rate = v; met.keypadSet = true; w.UI.toast('Transition rate set to ' + v + ' frames', 'ok'); }
              p.keypad = '';
            } else if (p.keypad.length < 3) p.keypad += k;
          })
        }));
      });
      left.appendChild(el('div', { class: 'pkeywrap' }, [
        el('div', { class: 'plbl2', text: 'KEYPAD  ' + (p.keypad || '---') }), pad
      ]));
      face.appendChild(left);

      /* ---- centre: crosspoints ---- */
      var mid = el('div', { class: 'pcol pcol--mid' });
      var labels = el('div', { class: 'pxlcd' });
      (p.shift ? XPT_SHIFT : XPT).forEach(function (x) {
        labels.appendChild(el('span', { class: 'pxlcd__c mono', text: x.s }));
      });
      mid.appendChild(el('div', { class: 'plbl2', text: 'SOURCE LABELS' }));
      mid.appendChild(labels);

      var pgmRow = el('div', { class: 'pxrow' });
      var pvwRow = el('div', { class: 'pxrow' });
      (p.shift ? XPT_SHIFT : XPT).forEach(function (x) {
        var id = p.shift ? 100 + x.n : x.n;
        pgmRow.appendChild(el('button', {
          class: 'pxb' + (p.pgm === id ? ' is-pgm' : ''), text: String(x.n),
          onclick: press(function () { p.pgm = id; })
        }));
        pvwRow.appendChild(el('button', {
          class: 'pxb' + (p.pvw === id ? ' is-pvw' : ''), text: String(x.n),
          onclick: press(function () {
            if (metAuxArmed) { p.aux = id; met.auxSet = true; metAuxArmed = false; w.UI.toast('AUX 1 routed to ' + srcLabel(id), 'ok'); return; }
            p.pvw = id;
          })
        }));
      });
      mid.appendChild(el('div', { class: 'plbl2', text: 'PROGRAM' }));
      mid.appendChild(pgmRow);
      mid.appendChild(el('div', { class: 'plbl2', text: 'PREVIEW / SOURCE SELECT' }));
      mid.appendChild(pvwRow);

      var utility = el('div', { class: 'pxutil' }, [
        el('button', { class: 'pub' + (p.shift ? ' is-on' : ''), text: 'SHIFT', onclick: press(function () { p.shift = !p.shift; if (p.shift) met.shiftUsed = true; }) }),
        el('button', { class: 'pub' + (metAuxArmed ? ' is-on' : ''), text: 'AUX 1', onclick: press(function () { metAuxArmed = !metAuxArmed; w.UI.toast(metAuxArmed ? 'AUX 1 armed - now press a source' : 'AUX select cancelled', 'info'); }) }),
        el('button', { class: 'pub', text: 'AUX 2', onclick: press(function () {}) })
      ]);
      mid.appendChild(utility);

      /* macros */
      var macros = el('div', { class: 'pmacros' });
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].forEach(function (n, i) {
        macros.appendChild(el('button', {
          class: 'pmb' + (p.macro === i ? ' is-on' : ''), text: n,
          onclick: press(function () {
            p.macro = i; met.macroFired = true;
            w.UI.toast('Macro ' + n + ' fired', 'brand');
            setTimeout(function () { p.macro = -1; render(); }, 700);
          })
        }));
      });
      mid.appendChild(el('div', { class: 'plbl2', text: 'MACROS' }));
      mid.appendChild(macros);
      face.appendChild(mid);

      /* ---- right: transitions, keys, fader, joystick ---- */
      var right = el('div', { class: 'pcol pcol--right' });

      var styleBlock = el('div', { class: 'pblk' }, [el('div', { class: 'plbl2', text: 'TRANSITION TYPE' })]);
      var styleRow = el('div', { class: 'pbtns' });
      ['mix', 'dip', 'wipe', 'sting', 'dve'].forEach(function (st) {
        styleRow.appendChild(el('button', {
          class: 'ptb' + (p.style === st ? ' is-on' : ''), text: st.toUpperCase(),
          onclick: press(function () { p.style = st; })
        }));
      });
      styleBlock.appendChild(styleRow);
      right.appendChild(styleBlock);

      var keyBlock = el('div', { class: 'pblk' }, [el('div', { class: 'plbl2', text: 'KEYS' })]);
      var keyRow = el('div', { class: 'pbtns' });
      p.keys.forEach(function (k, i) {
        keyRow.appendChild(el('button', {
          class: 'ptb ptb--key' + (k ? ' is-on' : ''), text: 'KEY ' + (i + 1),
          onclick: press(function () { p.keys[i] = !p.keys[i]; })
        }));
      });
      keyBlock.appendChild(keyRow);
      right.appendChild(keyBlock);

      var dskBlock = el('div', { class: 'pblk' }, [el('div', { class: 'plbl2', text: 'DOWNSTREAM KEY' })]);
      p.dsk.forEach(function (d, i) {
        dskBlock.appendChild(el('div', { class: 'pbtns' }, [
          el('span', { class: 'pdsklbl mono', text: 'DSK ' + (i + 1) }),
          el('button', { class: 'ptb' + (d.tie ? ' is-on' : ''), text: 'TIE', onclick: press(function () { d.tie = !d.tie; }) }),
          el('button', { class: 'ptb ptb--air' + (d.air ? ' is-on' : ''), text: 'ON AIR', onclick: press(function () { d.air = !d.air; }) })
        ]));
      });
      right.appendChild(dskBlock);

      /* fader + auto/cut */
      tbarEl = el('div', { class: 'tbar tbar--panel' });
      tbarFill = el('div', { class: 'tbar__fill' });
      tbarKnob = el('div', { class: 'tbar__knob' });
      tbarEl.appendChild(el('div', { class: 'tbar__track' }));
      tbarEl.appendChild(tbarFill); tbarEl.appendChild(tbarKnob);
      var startV = 0;
      w.UI.drag(tbarEl, {
        start: function (e) { startV = p.tbar; setT(e); },
        move: setT,
        end: function () {
          if ((startV < 0.05 && p.tbar > 0.95) || (startV > 0.95 && p.tbar < 0.05)) {
            swap(); met.tbarRuns++; Sound.good();
          }
          p.tbar = 0; paintT(); check(); render();
        }
      });
      function setT(e) {
        var r = tbarEl.getBoundingClientRect();
        p.tbar = w.UI.clamp(1 - (e.clientY - r.top) / r.height, 0, 1);
        paintT();
      }

      /* joystick */
      joyEl = el('div', { class: 'joy' });
      joyPuck = el('div', { class: 'joy__puck' });
      joyEl.appendChild(el('div', { class: 'joy__cross' }));
      joyEl.appendChild(joyPuck);
      w.UI.drag(joyEl, {
        start: setJ, move: setJ,
        end: function () { p.joy.x = 0; p.joy.y = 0; paintJ(); check(); render(); }
      });
      function setJ(e) {
        var r = joyEl.getBoundingClientRect();
        p.joy.x = w.UI.clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
        p.joy.y = w.UI.clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
        if (Math.abs(p.joy.x) > 0.3 || Math.abs(p.joy.y) > 0.3) met.joyMoved = true;
        paintJ();
      }

      right.appendChild(el('div', { class: 'pfaderblk' }, [
        el('div', { class: 'pfaderblk__l' }, [el('div', { class: 'plbl2', text: 'FADER' }), tbarEl]),
        el('div', { class: 'pfaderblk__r' }, [
          el('button', { class: 'bigb bigb--auto', text: 'AUTO', onclick: press(function () { swap(); met.autos++; }) }),
          el('button', { class: 'bigb bigb--cut', text: 'CUT', onclick: press(function () { swap(); met.cuts++; }) }),
          el('button', { class: 'bigb bigb--ftb' + (p.ftb ? ' is-on' : ''), text: 'FTB', onclick: press(function () { p.ftb = !p.ftb; }) })
        ])
      ]));

      right.appendChild(el('div', { class: 'pjoyblk' }, [
        el('div', { class: 'plbl2', text: 'JOYSTICK - DVE / CAMERA' }), joyEl,
        el('div', { class: 'pxy mono', text: 'X ' + p.joy.x.toFixed(2) + '   Y ' + p.joy.y.toFixed(2) })
      ]));

      right.appendChild(el('div', { class: 'prsblk' }, [
        el('button', { class: 'prs prs--rec' + (p.rec ? ' is-on' : ''), text: p.rec ? 'RECORDING' : 'REC', onclick: press(function () { p.rec = !p.rec; }) }),
        el('button', { class: 'prs prs--str' + (p.stream ? ' is-on' : ''), text: p.stream ? 'ON AIR' : 'STREAM', onclick: press(function () { p.stream = !p.stream; }) })
      ]));

      face.appendChild(right);

      root.appendChild(el('div', { class: 'chassis chassis--front' }, [
        el('div', { class: 'chassis__ear' }),
        el('div', { class: 'chassis__face chassis__face--front' }, [face]),
        el('div', { class: 'chassis__ear' })
      ]));
      root.appendChild(el('p', { class: 'phint', style: { marginTop: '10px' }, text: 'Everything here is live: crosspoints, shift bank, transition type, fader bar, joystick, keypad, macros, DSK, aux routing, record and stream.' }));

      paintT(); paintJ();
      renderTasks();
    }
    var metAuxArmed = false;

    function swap() { var t = p.pgm; p.pgm = p.pvw; p.pvw = t; Sound.cut(); }
    function srcLabel(id) {
      if (id > 100) { var x = XPT_SHIFT[id - 101]; return x ? x.s : '?'; }
      var y = XPT[id - 1]; return y ? y.s : '?';
    }
    function paintT() {
      if (!tbarFill) return;
      tbarFill.style.height = (p.tbar * 100) + '%';
      tbarKnob.style.bottom = 'calc(' + (p.tbar * 100) + '% - 9px)';
    }
    function paintJ() {
      if (!joyPuck) return;
      joyPuck.style.transform = 'translate(' + (p.joy.x * 34) + 'px,' + (p.joy.y * 34) + 'px)';
    }

    function renderTasks() {
      clear(taskPanel);
      taskPanel.appendChild(el('div', { class: 'simside__head' }, [
        el('span', { class: 'simside__t', text: 'Panel drills' }),
        coachBox.autoEl
      ]));
      var list = el('div', { class: 'tasks' });
      DRILLS.forEach(function (t) {
        var d = !!doneT[t.id];
        list.appendChild(w.UI.taskRow(t, d, function (tt) {
          w.UI.spotlight(root, tt.spot);
        }));
      });
      taskPanel.appendChild(list);
      var n = DRILLS.filter(function (t) { return doneT[t.id]; }).length;
      taskPanel.appendChild(el('div', { class: 'simprog' }, [
        el('div', { class: 'simprog__bar' }, [el('i', { style: { width: (n / DRILLS.length * 100) + '%' } })]),
        el('span', { class: 'mono', text: n + '/' + DRILLS.length })
      ]));
      applyCoach();
    }

    function check() {
      var newly = [];
      DRILLS.forEach(function (t) {
        if (doneT[t.id]) return;
        var ok = false; try { ok = !!t.check(); } catch (e) {}
        if (ok) { doneT[t.id] = true; newly.push(t); }
      });
      newly.forEach(function (t) { Sound.good(); w.UI.toast('<b>Drill complete</b> &nbsp;' + w.UI.esc(t.label), 'ok', 2000); });
      if (!finished && DRILLS.every(function (t) { return doneT[t.id]; })) {
        finished = true;
        setTimeout(function () {
          w.UI.toast('<b>Panel mastered.</b> You can run the show without a computer.', 'brand', 4200);
          if (opts.onComplete) opts.onComplete();
        }, 380);
      }
    }

    render();
    return { destroy: function () { clear(host); } };
  }

  w.SimRear = { mount: mountRear, REAR: REAR };
  w.SimPanel = { mount: mountPanel };
})(window);
