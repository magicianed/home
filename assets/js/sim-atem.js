/* ============================================================
   magicianed - ATEM Software Control simulation
   A working recreation of the real application: crosspoint buses,
   transition control, keyers, media, audio and camera control.
   Missions drive task checking against real switcher state.
   ============================================================ */
(function (w) {
  'use strict';
  var el = w.UI.el, clear = w.UI.clear, Sound = w.UI.Sound;

  /* ---------------- source table (real ATEM source IDs) ---------------- */
  var SRC = [
    { id: 0,    short: 'Blk',    long: 'Black',            bank: 2 },
    { id: 1,    short: 'Cam1',   long: 'Camera 1',         bank: 1 },
    { id: 2,    short: 'Cam2',   long: 'Camera 2',         bank: 1 },
    { id: 3,    short: 'Cam3',   long: 'Camera 3',         bank: 1 },
    { id: 4,    short: 'Wide',   long: 'Wide Shot',        bank: 1 },
    { id: 5,    short: 'Grn',    long: 'Green Screen',     bank: 1 },
    { id: 6,    short: 'VT',     long: 'VT Playback',      bank: 1 },
    { id: 7,    short: 'Slide',  long: 'Slides',           bank: 1 },
    { id: 8,    short: 'Rove',   long: 'Roving Camera',    bank: 1 },
    { id: 1000, short: 'Bars',   long: 'Colour Bars',      bank: 2 },
    { id: 2001, short: 'Col1',   long: 'Colour 1',         bank: 2 },
    { id: 2002, short: 'Col2',   long: 'Colour 2',         bank: 2 },
    { id: 3010, short: 'MP1',    long: 'Media Player 1',   bank: 2 },
    { id: 3011, short: 'MP1K',   long: 'Media Player 1 Key', bank: 2 },
    { id: 3020, short: 'MP2',    long: 'Media Player 2',   bank: 2 },
    { id: 3021, short: 'MP2K',   long: 'Media Player 2 Key', bank: 2 },
    { id: 6000, short: 'SSrc',   long: 'SuperSource',      bank: 2 }
  ];
  function src(id) { for (var i = 0; i < SRC.length; i++) if (SRC[i].id === id) return SRC[i]; return SRC[0]; }
  function srcName(id) { return src(id).long; }

  /* visual identity for the fake video tiles - flat colour + label, no gradients */
  var LOOK = {
    0:    { bg: '#000000', ink: '#3a3a3a', cap: 'BLACK' },
    1:    { bg: '#16202c', ink: '#6fa8dc', cap: 'CAM 1 / HOST' },
    2:    { bg: '#1d1a2c', ink: '#a58fe0', cap: 'CAM 2 / GUEST' },
    3:    { bg: '#122420', ink: '#63c9a0', cap: 'CAM 3 / 2-SHOT' },
    4:    { bg: '#231b12', ink: '#d9a86c', cap: 'WIDE' },
    5:    { bg: '#0e2a12', ink: '#4fd45f', cap: 'GREEN SCREEN' },
    6:    { bg: '#2a1218', ink: '#e07a94', cap: 'VT' },
    7:    { bg: '#1a1a1f', ink: '#b9b9c4', cap: 'SLIDES' },
    8:    { bg: '#0f2530', ink: '#5cc8d8', cap: 'ROVING' },
    1000: { bg: '#101010', ink: '#cfcf60', cap: 'BARS' },
    2001: { bg: '#2b2b2b', ink: '#9b9bff', cap: 'COLOUR 1' },
    2002: { bg: '#2b2b2b', ink: '#ff9bd0', cap: 'COLOUR 2' },
    3010: { bg: '#141b28', ink: '#7fb2ff', cap: 'MP 1' },
    3011: { bg: '#0b0b0b', ink: '#888', cap: 'MP 1 KEY' },
    3020: { bg: '#28141b', ink: '#ff8fae', cap: 'MP 2' },
    3021: { bg: '#0b0b0b', ink: '#888', cap: 'MP 2 KEY' },
    6000: { bg: '#1b1420', ink: '#c08fff', cap: 'SUPERSOURCE' }
  };

  var MEDIA_LIBRARY = [
    { name: 'LT_01_HostName.png', alpha: true,  kind: 'still', tag: 'LOWER THIRD' },
    { name: 'LT_02_GuestName.png', alpha: true, kind: 'still', tag: 'LOWER THIRD' },
    { name: 'BUG_Logo.png',       alpha: true,  kind: 'still', tag: 'BUG' },
    { name: 'BG_Studio.png',      alpha: false, kind: 'still', tag: 'BACKGROUND' },
    { name: 'HOLDING_Slide.png',  alpha: false, kind: 'still', tag: 'HOLDING' },
    { name: 'STINGER_Open.tga',   alpha: true,  kind: 'clip',  tag: 'STINGER' }
  ];

  /* ---------------- switcher state ---------------- */
  function freshState() {
    return {
      program: 4,
      preview: 6,
      style: 'mix',
      rate: 25,
      next: { bkgd: true, k1: false, k2: false, k3: false, k4: false },
      prevTrans: false,
      tbar: 0,
      inTransition: false,
      ftb: false,
      usk: [0, 1, 2, 3].map(function (i) {
        return { onAir: false, type: 'chroma', fill: 5, keySrc: 0, sampled: false, spill: 50, edge: 50, fg: 50, bg: 50 };
      }),
      dsk: [0, 1].map(function () {
        return { tie: false, onAir: false, fill: 3010, keySrc: 3011, pre: false, rate: 25 };
      }),
      pool: [null, null, null, null, null, null, null, null],
      players: [{ slot: -1 }, { slot: -1 }],
      audio: {
        ch: {},   /* filled below */
        master: 0
      },
      cam: {},
      sel: 1,     /* selected camera in camera tab */
      stream: { platform: '', key: '', quality: '', live: false, bitrate: 0 },
      rec: { disk: '', iso: false, recording: false, mins: 0 },
      aux: [1, 1],
      openPalette: { trans: true, usk: false, dsk: false, media: false, stream: false, rec: false, aux: false, macro: false },
      tab: 'switcher',
      bank: 1,
      log: []
    };
  }
  function initAudio(s) {
    [1, 2, 3, 4, 5, 6, 7, 8].forEach(function (i) {
      s.audio.ch['in' + i] = { name: srcName(i), state: 'afv', gain: 0, hpf: false, comp: false, lim: false, peak: -22 };
    });
    s.audio.ch.mic1 = { name: 'XLR Mic 1', state: 'off', gain: 0, hpf: false, comp: false, lim: false, peak: -30 };
    s.audio.ch.mic2 = { name: 'XLR Mic 2', state: 'off', gain: 0, hpf: false, comp: false, lim: false, peak: -40 };
    s.audio.ch.rca  = { name: 'RCA Stereo', state: 'off', gain: 0, hpf: false, comp: false, lim: false, peak: -35 };
    s.audio.ch.mp1  = { name: 'Media Player 1', state: 'afv', gain: 0, hpf: false, comp: false, lim: false, peak: -45 };
  }
  function initCam(s) {
    for (var i = 1; i <= 8; i++) {
      s.cam[i] = { iris: 5.6, black: 0, wb: 3200, tint: 0, gain: 0, shutter: 50, gamma: 0, sat: 1.0 };
    }
    /* camera 2 arrives wrong on purpose - module 10 is about fixing it */
    s.cam[2] = { iris: 8.0, black: 12, wb: 7500, tint: 6, gain: 0, shutter: 50, gamma: 0, sat: 1.0 };
  }

  /* ============================================================
     MISSIONS
     ============================================================ */
  var MISSIONS = {
    /* used when another simulation owns the task list */
    freeplay: { title: 'Free play', tasks: [] },

    switching: {
      title: 'Your first live cut',
      tasks: [
        { id: 'a', label: 'Put Camera 1 on Program', hint: 'Click CAM 1 on the red program row.',
          check: function (s) { return s.program === 1; } },
        { id: 'b', label: 'Line up Camera 2 on Preview', hint: 'Click CAM 2 on the green preview row.',
          check: function (s) { return s.preview === 2; } },
        { id: 'c', label: 'CUT to it', hint: 'Press the CUT button. Program and preview swap.',
          check: function (s, m) { return m.cuts >= 1 && s.program === 2; } },
        { id: 'd', label: 'Set the transition style to MIX and the rate to 12 frames',
          hint: 'Transition style buttons, then the rate field in the Transitions palette.',
          check: function (s) { return s.style === 'mix' && s.rate === 12; } },
        { id: 'e', label: 'Line up Camera 3 and AUTO to it', hint: 'Preview CAM 3, then press AUTO.',
          check: function (s, m) { return m.autos >= 1 && s.program === 3; } },
        { id: 'f', label: 'Perform a full manual transition with the fader bar',
          hint: 'Drag the T-bar all the way from one end to the other.',
          check: function (s, m) { return m.tbarRuns >= 1; } },
        { id: 'g', label: 'Fade to black, then bring the picture back',
          hint: 'Press FTB once to go to black, and again to return.',
          check: function (s, m) { return m.ftbCount >= 2 && !s.ftb; } }
      ]
    },

    keying: {
      title: 'Transitions and keys',
      tasks: [
        { id: 'a', label: 'Select the WIPE transition style', hint: 'Transition style row, WIPE.',
          check: function (s) { return s.style === 'wipe'; } },
        { id: 'b', label: 'Set Upstream Key 1 to Chroma and its fill to Green Screen',
          hint: 'Open the Upstream Key palette, choose Chroma, set Fill Source.',
          check: function (s) { return s.usk[0].type === 'chroma' && s.usk[0].fill === 5; } },
        { id: 'c', label: 'Sample the green screen', hint: 'Press SAMPLE in the chroma key controls.',
          check: function (s) { return s.usk[0].sampled; } },
        { id: 'd', label: 'Put the studio background on Program', hint: 'Program row: SLIDES.',
          check: function (s) { return s.program === 7; } },
        { id: 'e', label: 'Put Upstream Key 1 on air', hint: 'ON AIR in the Upstream Key palette.',
          check: function (s) { return s.usk[0].onAir; } },
        { id: 'f', label: 'Set DSK 1 fill to Media Player 1, key to Media Player 1 Key, and enable Pre Multiplied Key',
          hint: 'Open the Downstream Key palette.',
          check: function (s) { return s.dsk[0].fill === 3010 && s.dsk[0].keySrc === 3011 && s.dsk[0].pre; } },
        { id: 'g', label: 'Put DSK 1 on air', hint: 'ON AIR on the DSK 1 strip.',
          check: function (s) { return s.dsk[0].onAir; } },
        { id: 'h', label: 'Arm KEY 1 in Next Transition and AUTO so the key transitions with the background',
          hint: 'Click KEY 1 under NEXT TRANSITION, then AUTO.',
          check: function (s, m) { return m.autoWithKey >= 1; } }
      ]
    },

    audio: {
      title: 'Mix the show',
      startTab: 'audio',
      tasks: [
        { id: 'a', label: 'Set XLR Mic 1 to ON so the host is always heard',
          hint: 'The ON / AFV / OFF buttons on the Mic 1 channel strip.',
          check: function (s) { return s.audio.ch.mic1.state === 'on'; } },
        { id: 'b', label: 'Set Cameras 1, 2 and 3 to AFV', hint: 'Audio follows video on the camera channels.',
          check: function (s) { return ['in1', 'in2', 'in3'].every(function (k) { return s.audio.ch[k].state === 'afv'; }); } },
        { id: 'c', label: 'Turn the Green Screen camera audio OFF - it has no useful microphone',
          hint: 'Channel for Green Screen, press OFF.',
          check: function (s) { return s.audio.ch.in5.state === 'off'; } },
        { id: 'd', label: 'Enable the high-pass filter on Mic 1',
          hint: 'The HPF button on the Mic 1 strip - it clears rumble below 80 Hz.',
          check: function (s) { return s.audio.ch.mic1.hpf; } },
        { id: 'e', label: 'Enable the limiter on Mic 1 as a safety net', hint: 'LIM on the Mic 1 strip.',
          check: function (s) { return s.audio.ch.mic1.lim; } },
        { id: 'f', label: 'Bring Mic 1 to a sensible level - between -12 dB and -4 dB',
          hint: 'Drag the Mic 1 fader.',
          check: function (s) { return s.audio.ch.mic1.gain >= -12 && s.audio.ch.mic1.gain <= -4; } },
        { id: 'g', label: 'Leave the master fader between -6 dB and 0 dB',
          hint: 'The master strip on the right.',
          check: function (s) { return s.audio.master >= -6 && s.audio.master <= 0; } }
      ]
    },

    camera: {
      title: 'Match the cameras',
      startTab: 'camera',
      tasks: [
        { id: 'a', label: 'Select Camera 2 in camera control', hint: 'The camera selector row at the top.',
          check: function (s) { return s.sel === 2; } },
        { id: 'b', label: 'Set Camera 2 white balance to 3200K to match Camera 1',
          hint: 'The white balance control. Camera 1 is on 3200K.',
          check: function (s) { return s.cam[2].wb === 3200; } },
        { id: 'c', label: 'Bring Camera 2 master black back to 0', hint: 'It is lifted at +12 - blacks look milky.',
          check: function (s) { return s.cam[2].black === 0; } },
        { id: 'd', label: 'Open the iris on Camera 2 to f/5.6 to match exposure',
          hint: 'Drag the iris control. It is closed down at f/8.',
          check: function (s) { return Math.abs(s.cam[2].iris - 5.6) < 0.05; } },
        { id: 'e', label: 'Remove the tint offset on Camera 2', hint: 'Tint should be 0.',
          check: function (s) { return s.cam[2].tint === 0; } },
        { id: 'f', label: 'Put Camera 2 on Preview and confirm its tally goes green',
          hint: 'Back on the Switcher tab, preview CAM 2.',
          check: function (s) { return s.preview === 2; } },
        { id: 'g', label: 'Cut Camera 2 to Program and confirm its tally goes red',
          hint: 'Press CUT with CAM 2 on preview.',
          check: function (s) { return s.program === 2; } }
      ]
    },

    stream: {
      title: 'Arm the stream and roll ISO',
      tasks: [
        { id: 'a', label: 'Set the streaming platform to YouTube', hint: 'Open the Streaming palette.',
          check: function (s) { return s.stream.platform === 'YouTube'; } },
        { id: 'b', label: 'Enter a stream key', hint: 'Paste anything at least 8 characters into the key field.',
          check: function (s) { return s.stream.key.length >= 8; } },
        { id: 'c', label: 'The venue tests at 10 Mb/s upload - choose the 1080p 5 Mb/s quality',
          hint: 'Roughly half of measured upload.',
          check: function (s) { return s.stream.quality === '1080p 5 Mb/s'; } },
        { id: 'd', label: 'Select the exFAT SSD as the record disk', hint: 'Recording palette. One of the disks is NTFS - avoid it.',
          check: function (s) { return s.rec.disk === 'SHOW_SSD (exFAT)'; } },
        { id: 'e', label: 'Enable ISO recording of all inputs', hint: 'The ISO switch in the Recording palette.',
          check: function (s) { return s.rec.iso; } },
        { id: 'f', label: 'Start recording', hint: 'The record button.',
          check: function (s, m) { return m.recStarted >= 1; } },
        { id: 'g', label: 'Take the stream on air', hint: 'ON AIR in the Streaming palette.',
          check: function (s, m) { return m.streamStarted >= 1; } },
        { id: 'h', label: 'Shut down cleanly: fade to black, stop the stream, then stop the record',
          hint: 'Order matters - off air first, outputs last.',
          check: function (s, m) { return m.cleanShutdown; } }
      ]
    },

    showtime: {
      title: 'Run the show',
      ordered: true,
      tasks: [
        { id: '1', label: 'Holding slide on program', hint: 'Program row: SLIDES.',
          check: function (s) { return s.program === 7; } },
        { id: '2', label: 'Arm recording with ISO on the exFAT disk and start it',
          hint: 'Recording palette: disk, ISO, then record.',
          check: function (s, m) { return s.rec.iso && s.rec.disk === 'SHOW_SSD (exFAT)' && m.recStarted >= 1; } },
        { id: '3', label: 'Set the stream to YouTube with a key and take it on air',
          hint: 'Streaming palette.',
          check: function (s, m) { return s.stream.platform === 'YouTube' && s.stream.key.length >= 8 && m.streamStarted >= 1; } },
        { id: '4', label: 'Preview Camera 1 and take it with a MIX transition',
          hint: 'Style MIX, preview CAM 1, then AUTO.',
          check: function (s, m) { return s.program === 1 && m.autos >= 1 && s.style === 'mix'; } },
        { id: '5', label: 'Bring the host lower third on with DSK 1',
          hint: 'DSK 1 fill Media Player 1, key Media Player 1 Key, pre-multiplied, ON AIR.',
          check: function (s) { return s.dsk[0].onAir && s.dsk[0].fill === 3010 && s.dsk[0].pre; } },
        { id: '6', label: 'Take the lower third off again', hint: 'ON AIR off, or AUTO on the DSK strip.',
          check: function (s, m) { return m.dsk1Cycles >= 1 && !s.dsk[0].onAir; } },
        { id: '7', label: 'Cut between Camera 2 and Camera 3 at least three times',
          hint: 'Preview, cut, preview, cut.',
          check: function (s, m) { return m.discussionCuts >= 3; } },
        { id: '8', label: 'Key the green screen guest over the studio background on Upstream Key 1',
          hint: 'USK 1 chroma, fill Green Screen, sample, ON AIR.',
          check: function (s) { return s.usk[0].onAir && s.usk[0].type === 'chroma' && s.usk[0].fill === 5 && s.usk[0].sampled; } },
        { id: '9', label: 'Wipe to the wide shot', hint: 'Style WIPE, preview WIDE, AUTO.',
          check: function (s, m) { return s.program === 4 && m.wipeTakes >= 1; } },
        { id: '10', label: 'Fade to black', hint: 'FTB.',
          check: function (s) { return s.ftb; } },
        { id: '11', label: 'Stop the stream and then stop the record', hint: 'Outputs last, in that order.',
          check: function (s, m) { return m.cleanShutdown; } }
      ]
    }
  };

  /* ============================================================
     COMPONENT
     ============================================================ */
  function mount(host, opts) {
    opts = opts || {};
    var mission = MISSIONS[opts.mission] || MISSIONS.switching;
    var s = freshState();
    initAudio(s); initCam(s);
    if (opts.mission === 'keying' || opts.mission === 'showtime') {
      s.pool[0] = MEDIA_LIBRARY[0]; s.pool[1] = MEDIA_LIBRARY[3];
      s.players[0].slot = 0; s.players[1].slot = 1;
    }
    if (mission.startTab) s.tab = mission.startTab;

    /* mission metrics - things that are events, not state */
    var m = {
      cuts: 0, autos: 0, tbarRuns: 0, ftbCount: 0, autoWithKey: 0,
      recStarted: 0, streamStarted: 0, cleanShutdown: false,
      dsk1Cycles: 0, discussionCuts: 0, wipeTakes: 0,
      shutdownStage: 0
    };
    var doneTasks = {};
    var finished = false;

    /* ---------- root ---------- */
    var root = el('div', { class: 'atem' });
    var win = el('div', { class: 'aw' });
    root.appendChild(win);

    var titlebar = el('div', { class: 'aw__title' }, [
      el('div', { class: 'aw__dots' }, [el('i'), el('i'), el('i')]),
      el('div', { class: 'aw__name', text: 'ATEM Software Control' }),
      el('div', { class: 'aw__dev' }, [
        el('span', { class: 'aw__devdot' }),
        el('span', { text: 'ATEM Television Studio HD8 ISO' })
      ])
    ]);
    var tabs = el('div', { class: 'aw__tabs' });
    ['switcher', 'media', 'audio', 'camera'].forEach(function (t) {
      tabs.appendChild(el('button', {
        class: 'awtab', data: { tab: t }, text: t.charAt(0).toUpperCase() + t.slice(1),
        onclick: function () { s.tab = t; Sound.tap(); render(); }
      }));
    });
    var body = el('div', { class: 'aw__body' });
    win.appendChild(titlebar); win.appendChild(tabs); win.appendChild(body);

    /* ---------- task panel ---------- */
    var taskPanel = el('div', { class: 'card card--pad' });
    var sidebar = el('div', { class: 'simside' }, [taskPanel]);

    if (opts.embedded) {
      win.classList.add('aw--embed');
      clear(host).appendChild(root);
      if (opts.taskHost) clear(opts.taskHost).appendChild(taskPanel);
    } else {
      clear(host).appendChild(el('div', { class: 'simwrap' }, [root, sidebar]));
    }

    /* ============================================================
       state helpers
       ============================================================ */
    function log(txt) { s.log.unshift(txt); if (s.log.length > 6) s.log.pop(); }

    function programAfterTake() { return s.preview; }

    function doCut() {
      if (s.inTransition) return;
      var old = s.program;
      var p = s.program; s.program = s.preview; s.preview = p;
      applyNextTransToKeys();
      m.cuts++;
      countDiscussion(old, s.program);
      Sound.cut();
      log('CUT to ' + srcName(s.program));
      after();
    }
    function countDiscussion(from, to) {
      if ((from === 2 && to === 3) || (from === 3 && to === 2)) m.discussionCuts++;
    }
    function applyNextTransToKeys() {
      ['k1', 'k2', 'k3', 'k4'].forEach(function (k, i) {
        if (s.next[k]) s.usk[i].onAir = !s.usk[i].onAir;
      });
      s.dsk.forEach(function (d) { if (d.tie) d.onAir = !d.onAir; });
    }
    function doAuto() {
      if (s.inTransition) return;
      var hadKey = s.next.k1 || s.next.k2 || s.next.k3 || s.next.k4;
      var wasWipe = s.style === 'wipe';
      s.inTransition = true;
      var frames = s.rate, i = 0;
      var oldPgm = s.program;
      Sound.arm();
      log('AUTO ' + s.style.toUpperCase() + ' ' + s.rate + 'f');
      var iv = setInterval(function () {
        i++;
        s.tbar = i / frames;
        paintTbar();
        paintMonitors();
        if (i >= frames) {
          clearInterval(iv);
          s.tbar = 0;
          s.inTransition = false;
          var p = s.program; s.program = s.preview; s.preview = p;
          applyNextTransToKeys();
          m.autos++;
          if (hadKey) m.autoWithKey++;
          if (wasWipe) m.wipeTakes++;
          countDiscussion(oldPgm, s.program);
          after();
        }
      }, 1000 / 50);
      after();
    }
    function doFtb() {
      s.ftb = !s.ftb;
      m.ftbCount++;
      Sound.bad();
      log(s.ftb ? 'FADE TO BLACK' : 'BACK FROM BLACK');
      after();
    }

    /* ============================================================
       render
       ============================================================ */
    function render() {
      w.UI.qsa('.awtab', tabs).forEach(function (b) {
        b.classList.toggle('is-on', b.dataset.tab === s.tab);
      });
      clear(body);
      if (s.tab === 'switcher') body.appendChild(renderSwitcher());
      else if (s.tab === 'media') body.appendChild(renderMedia());
      else if (s.tab === 'audio') body.appendChild(renderAudio());
      else body.appendChild(renderCamera());
      renderTasks();
    }

    /* ---------- monitors / multiview ---------- */
    var mvEls = null;
    function tile(id, label, big) {
      var lk = LOOK[id] || LOOK[0];
      var t = el('div', { class: 'mvt' + (big ? ' mvt--big' : '') });
      var scr = el('div', { class: 'mvt__scr', style: { background: lk.bg } });
      scr.appendChild(el('div', { class: 'mvt__cap', style: { color: lk.ink }, text: lk.cap }));
      t.appendChild(scr);
      t.appendChild(el('div', { class: 'mvt__lbl', text: label || src(id).short }));
      return t;
    }
    function renderMonitors() {
      var box = el('div', { class: 'mvbar' });
      var pv = el('div', { class: 'mvbig mvbig--pvw' });
      var pg = el('div', { class: 'mvbig mvbig--pgm' });
      mvEls = { pv: pv, pg: pg, strip: el('div', { class: 'mvstrip' }) };
      box.appendChild(pv); box.appendChild(pg);
      var whole = el('div', { class: 'mvwrap' }, [box, mvEls.strip]);
      paintMonitors();
      return whole;
    }
    function bigMon(node, id, tag, keys) {
      clear(node);
      var lk = LOOK[id] || LOOK[0];
      var scr = el('div', { class: 'mvbig__scr', style: { background: lk.bg } });
      scr.appendChild(el('div', { class: 'mvbig__cap', style: { color: lk.ink }, text: lk.cap }));
      (keys || []).forEach(function (k) { scr.appendChild(k); });
      node.appendChild(scr);
      node.appendChild(el('div', { class: 'mvbig__lbl' }, [
        el('span', { class: 'mvbig__tag', text: tag }),
        el('span', { text: srcName(id) })
      ]));
    }
    function paintMonitors() {
      if (!mvEls) return;
      /* program picture accounting for FTB, transition and keys */
      var pgmId = s.program;
      var overlays = [];
      if (s.usk[0].onAir) {
        overlays.push(el('div', { class: 'ovl ovl--key', text: s.usk[0].type === 'chroma' && s.usk[0].sampled ? 'KEYED: ' + src(s.usk[0].fill).short : 'KEY 1' }));
      }
      s.dsk.forEach(function (d, i) {
        if (d.onAir) overlays.push(el('div', { class: 'ovl ovl--dsk', text: 'DSK ' + (i + 1) + ' - ' + (s.players[0].slot >= 0 && s.pool[s.players[0].slot] ? s.pool[s.players[0].slot].name : 'no media') }));
      });
      if (s.inTransition) overlays.push(el('div', { class: 'ovl ovl--trans', text: s.style.toUpperCase() + '  ' + Math.round(s.tbar * 100) + '%' }));
      if (s.ftb) { pgmId = 0; overlays = [el('div', { class: 'ovl ovl--ftb', text: 'FADE TO BLACK' })]; }
      bigMon(mvEls.pg, pgmId, 'PGM', overlays);
      bigMon(mvEls.pv, s.preview, 'PVW', s.usk[0].onAir ? [] : []);

      clear(mvEls.strip);
      for (var i = 1; i <= 8; i++) {
        var t = tile(i, src(i).short + '  ' + src(i).long.toUpperCase());
        if (s.program === i && !s.ftb) t.classList.add('is-pgm');
        else if (s.preview === i) t.classList.add('is-pvw');
        mvEls.strip.appendChild(t);
      }
    }

    /* ---------- switcher tab ---------- */
    var tbarEl = null, tbarFill = null, tbarKnob = null;
    function paintTbar() {
      if (!tbarFill) return;
      var pct = s.tbar * 100;
      tbarFill.style.height = pct + '%';
      tbarKnob.style.bottom = 'calc(' + pct + '% - 9px)';
    }

    function xptButton(o, isProgram) {
      var on = isProgram ? (s.program === o.id) : (s.preview === o.id);
      var b = el('button', {
        class: 'xpt' + (isProgram ? ' xpt--pgm' : ' xpt--pvw') + (on ? ' is-on' : ''),
        title: o.long
      }, [
        el('span', { class: 'xpt__lbl', text: o.short }),
        el('span', { class: 'xpt__long', text: o.long })
      ]);
      b.onclick = function () {
        if (isProgram) { s.program = o.id; Sound.cut(); log('PGM direct: ' + o.long); }
        else { s.preview = o.id; Sound.tap(); }
        after();
      };
      return b;
    }

    function renderSwitcher() {
      var pane = el('div', { class: 'sw' });
      pane.appendChild(renderMonitors());

      var lower = el('div', { class: 'sw__lower' });
      var me = el('div', { class: 'me' });

      /* bank switch */
      var bankRow = el('div', { class: 'me__bank' }, [
        el('span', { class: 'me__banklbl', text: 'SOURCE BANK' }),
        el('button', { class: 'bankbtn' + (s.bank === 1 ? ' is-on' : ''), text: 'INPUTS 1-8', onclick: function () { s.bank = 1; render(); } }),
        el('button', { class: 'bankbtn' + (s.bank === 2 ? ' is-on' : ''), text: 'SHIFT', onclick: function () { s.bank = 2; Sound.tap(); render(); } })
      ]);
      me.appendChild(bankRow);

      var list = SRC.filter(function (o) { return o.bank === s.bank; });
      var pgmRow = el('div', { class: 'me__row me__row--pgm' });
      var pvwRow = el('div', { class: 'me__row me__row--pvw' });
      list.forEach(function (o) { pgmRow.appendChild(xptButton(o, true)); });
      list.forEach(function (o) { pvwRow.appendChild(xptButton(o, false)); });
      me.appendChild(el('div', { class: 'me__rowlbl', text: 'PROGRAM' }));
      me.appendChild(pgmRow);
      me.appendChild(el('div', { class: 'me__rowlbl', text: 'PREVIEW' }));
      me.appendChild(pvwRow);

      /* --- transition control --- */
      var tc = el('div', { class: 'tc' });

      var nt = el('div', { class: 'tc__block' }, [el('div', { class: 'tc__lbl', text: 'NEXT TRANSITION' })]);
      var ntRow = el('div', { class: 'tc__btns' });
      [['bkgd', 'BKGD'], ['k1', 'KEY 1'], ['k2', 'KEY 2'], ['k3', 'KEY 3'], ['k4', 'KEY 4']].forEach(function (p) {
        ntRow.appendChild(el('button', {
          class: 'tcb tcb--nt' + (s.next[p[0]] ? ' is-on' : ''), text: p[1],
          onclick: function () { s.next[p[0]] = !s.next[p[0]]; Sound.tap(); after(); }
        }));
      });
      nt.appendChild(ntRow);
      nt.appendChild(el('button', {
        class: 'tcb tcb--prev' + (s.prevTrans ? ' is-on' : ''), text: 'PREV TRANS',
        onclick: function () { s.prevTrans = !s.prevTrans; Sound.tap(); after(); }
      }));
      tc.appendChild(nt);

      var st = el('div', { class: 'tc__block' }, [el('div', { class: 'tc__lbl', text: 'TRANSITION STYLE' })]);
      var stRow = el('div', { class: 'tc__btns' });
      [['mix', 'MIX'], ['dip', 'DIP'], ['wipe', 'WIPE'], ['sting', 'STING'], ['dve', 'DVE']].forEach(function (p) {
        stRow.appendChild(el('button', {
          class: 'tcb tcb--st' + (s.style === p[0] ? ' is-on' : ''), text: p[1],
          onclick: function () { s.style = p[0]; Sound.tap(); after(); }
        }));
      });
      st.appendChild(stRow);
      tc.appendChild(st);

      /* fader + auto/cut */
      var faderBlock = el('div', { class: 'tc__fader' });
      tbarEl = el('div', { class: 'tbar' });
      tbarFill = el('div', { class: 'tbar__fill' });
      tbarKnob = el('div', { class: 'tbar__knob' });
      tbarEl.appendChild(el('div', { class: 'tbar__track' }));
      tbarEl.appendChild(tbarFill);
      tbarEl.appendChild(tbarKnob);
      var dragStart = 0;
      w.UI.drag(tbarEl, {
        start: function (e) { dragStart = s.tbar; setTbar(e); },
        move: function (e) { setTbar(e); },
        end: function () {
          if ((dragStart < 0.05 && s.tbar > 0.95) || (dragStart > 0.95 && s.tbar < 0.05)) {
            /* full travel = a completed manual transition */
            var oldPgm = s.program;
            var p = s.program; s.program = s.preview; s.preview = p;
            applyNextTransToKeys();
            if (s.style === 'wipe') m.wipeTakes++;
            countDiscussion(oldPgm, s.program);
            m.tbarRuns++;
            s.tbar = 0;
            Sound.good();
            log('MANUAL ' + s.style.toUpperCase() + ' complete');
          }
          paintTbar(); after();
        }
      });
      function setTbar(e) {
        var r = tbarEl.getBoundingClientRect();
        var v = 1 - (e.clientY - r.top) / r.height;
        s.tbar = w.UI.clamp(v, 0, 1);
        paintTbar(); paintMonitors();
      }
      faderBlock.appendChild(el('div', { class: 'tc__lbl', text: 'FADER BAR' }));
      faderBlock.appendChild(tbarEl);
      tc.appendChild(faderBlock);

      var bigs = el('div', { class: 'tc__bigs' }, [
        el('button', { class: 'bigb bigb--auto', text: 'AUTO', onclick: doAuto }),
        el('button', { class: 'bigb bigb--cut', text: 'CUT', onclick: doCut }),
        el('div', { class: 'tc__rate' }, [
          el('span', { class: 'tc__lbl', text: 'RATE' }),
          el('input', {
            class: 'ratein mono', type: 'number', min: '1', max: '250', value: String(s.rate),
            oninput: function () { s.rate = parseInt(this.value, 10) || 1; after(true); }
          }),
          el('span', { class: 'tc__unit', text: 'f' })
        ])
      ]);
      tc.appendChild(bigs);

      /* DSK strips + FTB */
      var dskBlock = el('div', { class: 'tc__block tc__block--dsk' });
      s.dsk.forEach(function (d, i) {
        var strip = el('div', { class: 'dskstrip' }, [
          el('div', { class: 'tc__lbl', text: 'DSK ' + (i + 1) }),
          el('button', { class: 'tcb' + (d.tie ? ' is-on' : ''), text: 'TIE', onclick: function () { d.tie = !d.tie; Sound.tap(); after(); } }),
          el('button', {
            class: 'tcb tcb--air' + (d.onAir ? ' is-on' : ''), text: 'ON AIR',
            onclick: function () {
              d.onAir = !d.onAir; Sound.cut();
              if (i === 0 && !d.onAir) m.dsk1Cycles++;
              after();
            }
          }),
          el('button', {
            class: 'tcb', text: 'AUTO',
            onclick: function () {
              d.onAir = !d.onAir; Sound.arm();
              if (i === 0 && !d.onAir) m.dsk1Cycles++;
              after();
            }
          })
        ]);
        dskBlock.appendChild(strip);
      });
      dskBlock.appendChild(el('button', {
        class: 'bigb bigb--ftb' + (s.ftb ? ' is-on' : ''), text: 'FTB', onclick: doFtb
      }));
      tc.appendChild(dskBlock);

      me.appendChild(tc);
      lower.appendChild(me);
      lower.appendChild(renderPalettes());
      pane.appendChild(lower);
      paintTbar();
      return pane;
    }

    /* ---------- palettes ---------- */
    function palette(key, title, accent, content) {
      var open = s.openPalette[key];
      var head = el('button', { class: 'pal__head' + (open ? ' is-open' : '') }, [
        el('i', { class: 'pal__dot', style: { background: accent } }),
        el('span', { class: 'pal__t', text: title }),
        el('span', { class: 'pal__chev', text: open ? '\u2212' : '+' })
      ]);
      head.onclick = function () { s.openPalette[key] = !open; Sound.tap(); render(); };
      var p = el('div', { class: 'pal' }, [head]);
      if (open) p.appendChild(el('div', { class: 'pal__body' }, content()));
      return p;
    }
    function selectSource(value, onChange, filter) {
      var sel = el('select', { class: 'asel' });
      SRC.filter(filter || function () { return true; }).forEach(function (o) {
        sel.appendChild(el('option', { value: String(o.id), text: o.long, selected: o.id === value }));
      });
      sel.onchange = function () { onChange(parseInt(sel.value, 10)); };
      return sel;
    }
    function toggleRow(label, on, onClick, accent) {
      return el('div', { class: 'trow' }, [
        el('span', { class: 'trow__l', text: label }),
        el('button', {
          class: 'tgl' + (on ? ' is-on' : ''), style: on && accent ? { background: accent, borderColor: accent } : null,
          onclick: function () { onClick(); Sound.tap(); after(); }
        }, [el('i')])
      ]);
    }

    function renderPalettes() {
      var col = el('div', { class: 'pals' });

      col.appendChild(palette('trans', 'Transitions', 'var(--info)', function () {
        return [
          el('div', { class: 'prow' }, [
            el('span', { class: 'plbl', text: 'Style' }),
            el('span', { class: 'pval mono', text: s.style.toUpperCase() })
          ]),
          el('div', { class: 'prow' }, [
            el('span', { class: 'plbl', text: 'Rate' }),
            el('input', {
              class: 'ratein mono', type: 'number', min: '1', max: '250', value: String(s.rate),
              oninput: function () { s.rate = parseInt(this.value, 10) || 1; after(true); }
            }),
            el('span', { class: 'pval mono', text: 'frames' })
          ]),
          s.style === 'wipe' ? el('div', { class: 'prow' }, [
            el('span', { class: 'plbl', text: 'Pattern' }),
            el('span', { class: 'pval', text: 'Horizontal bar' })
          ]) : null,
          s.style === 'dip' ? el('div', { class: 'prow' }, [
            el('span', { class: 'plbl', text: 'Dip source' }),
            el('span', { class: 'pval', text: 'Colour 1' })
          ]) : null,
          el('p', { class: 'phint', text: 'Rate applies to the armed style. AUTO and the DSK auto buttons both use it.' })
        ];
      }));

      col.appendChild(palette('usk', 'Upstream Key 1', 'var(--key)', function () {
        var k = s.usk[0];
        var out = [
          el('div', { class: 'ptabs' }, ['chroma', 'luma', 'pattern', 'dve'].map(function (t) {
            return el('button', {
              class: 'ptab' + (k.type === t ? ' is-on' : ''), text: t.toUpperCase(),
              onclick: function () { k.type = t; k.sampled = false; Sound.tap(); after(); }
            });
          })),
          el('div', { class: 'prow' }, [el('span', { class: 'plbl', text: 'Fill Source' }),
            selectSource(k.fill, function (v) { k.fill = v; k.sampled = false; after(); })]),
          toggleRow('On Air', k.onAir, function () { k.onAir = !k.onAir; }, 'var(--pgm)')
        ];
        if (k.type === 'chroma') {
          out.push(el('div', { class: 'sampler' }, [
            el('div', { class: 'sampler__scr' }, [
              el('div', { class: 'sampler__box' + (k.sampled ? ' is-set' : '') }),
              el('span', { class: 'sampler__cap', text: k.sampled ? 'SAMPLED' : 'DRAG THE BOX OVER CLEAN GREEN' })
            ]),
            el('button', {
              class: 'btn btn--sm btn--go', text: k.sampled ? 'RE-SAMPLE' : 'SAMPLE',
              onclick: function () { k.sampled = true; Sound.good(); w.UI.toast('Chroma key sampled', 'ok'); after(); }
            })
          ]));
          out.push(slider('Foreground', k.fg, 0, 100, function (v) { k.fg = v; }));
          out.push(slider('Background', k.bg, 0, 100, function (v) { k.bg = v; }));
          out.push(slider('Key Edge', k.edge, 0, 100, function (v) { k.edge = v; }));
          out.push(slider('Spill', k.spill, 0, 100, function (v) { k.spill = v; }));
        }
        return out;
      }));

      col.appendChild(palette('dsk', 'Downstream Key 1', 'var(--brand)', function () {
        var d = s.dsk[0];
        return [
          el('div', { class: 'prow' }, [el('span', { class: 'plbl', text: 'Fill Source' }),
            selectSource(d.fill, function (v) { d.fill = v; after(); })]),
          el('div', { class: 'prow' }, [el('span', { class: 'plbl', text: 'Key Source' }),
            selectSource(d.keySrc, function (v) { d.keySrc = v; after(); })]),
          toggleRow('Pre Multiplied Key', d.pre, function () { d.pre = !d.pre; }, 'var(--brand)'),
          toggleRow('Tie', d.tie, function () { d.tie = !d.tie; }, 'var(--audio)'),
          toggleRow('On Air', d.onAir, function () {
            d.onAir = !d.onAir; if (!d.onAir) m.dsk1Cycles++;
          }, 'var(--pgm)'),
          el('p', { class: 'phint', text: 'Pre Multiplied Key is correct for almost every PNG or TGA exported with an alpha channel.' })
        ];
      }));

      col.appendChild(palette('media', 'Media Players', 'var(--key)', function () {
        return s.players.map(function (p, i) {
          return el('div', { class: 'prow' }, [
            el('span', { class: 'plbl', text: 'Media Player ' + (i + 1) }),
            (function () {
              var sel = el('select', { class: 'asel' });
              sel.appendChild(el('option', { value: '-1', text: 'None', selected: p.slot < 0 }));
              s.pool.forEach(function (item, idx) {
                if (item) sel.appendChild(el('option', { value: String(idx), text: (idx + 1) + '. ' + item.name, selected: p.slot === idx }));
              });
              sel.onchange = function () { p.slot = parseInt(sel.value, 10); after(); };
              return sel;
            })()
          ]);
        }).concat([el('p', { class: 'phint', text: 'Load media on the Media tab first. Players point at pool slots.' })]);
      }));

      col.appendChild(palette('aux', 'Aux Outputs', 'var(--pvw)', function () {
        return s.aux.map(function (a, i) {
          return el('div', { class: 'prow' }, [
            el('span', { class: 'plbl', text: 'Aux ' + (i + 1) }),
            selectSource(a, function (v) { s.aux[i] = v; after(); })
          ]);
        });
      }));

      col.appendChild(palette('stream', 'Streaming', 'var(--iso)', function () {
        return [
          el('div', { class: 'prow' }, [
            el('span', { class: 'plbl', text: 'Platform' }),
            (function () {
              var sel = el('select', { class: 'asel' });
              ['', 'YouTube', 'Twitch', 'Facebook', 'Custom RTMP'].forEach(function (p) {
                sel.appendChild(el('option', { value: p, text: p || 'Select...', selected: s.stream.platform === p }));
              });
              sel.onchange = function () { s.stream.platform = sel.value; after(); };
              return sel;
            })()
          ]),
          el('div', { class: 'prow' }, [
            el('span', { class: 'plbl', text: 'Key' }),
            el('input', {
              class: 'atxt mono', type: 'text', placeholder: 'paste stream key', value: s.stream.key,
              oninput: function () { s.stream.key = this.value; after(true); }
            })
          ]),
          el('div', { class: 'prow' }, [
            el('span', { class: 'plbl', text: 'Quality' }),
            (function () {
              var sel = el('select', { class: 'asel' });
              ['', '720p 2.5 Mb/s', '1080p 5 Mb/s', '1080p 9 Mb/s', '1080p 16 Mb/s'].forEach(function (q) {
                sel.appendChild(el('option', { value: q, text: q || 'Select...', selected: s.stream.quality === q }));
              });
              sel.onchange = function () { s.stream.quality = sel.value; after(); };
              return sel;
            })()
          ]),
          el('button', {
            class: 'onair' + (s.stream.live ? ' is-live' : ''),
            text: s.stream.live ? 'ON AIR - STOP STREAM' : 'ON AIR',
            onclick: function () {
              if (!s.stream.live) {
                if (!s.stream.platform || s.stream.key.length < 8 || !s.stream.quality) {
                  w.UI.toast('Set a platform, key and quality first', 'bad'); Sound.bad(); return;
                }
                s.stream.live = true; m.streamStarted++; Sound.good();
                log('STREAM LIVE - ' + s.stream.platform);
              } else {
                s.stream.live = false;
                if (s.ftb) m.shutdownStage = 1;
                log('STREAM STOPPED');
              }
              after();
            }
          }),
          s.stream.live ? el('div', { class: 'livebar' }, [
            el('span', { class: 'livedot' }),
            el('span', { class: 'mono', text: 'LIVE  ' + (s.stream.quality || '') + '  cache 0%' })
          ]) : null
        ];
      }));

      col.appendChild(palette('rec', 'Recording', 'var(--iso)', function () {
        return [
          el('div', { class: 'prow' }, [
            el('span', { class: 'plbl', text: 'Disk' }),
            (function () {
              var sel = el('select', { class: 'asel' });
              ['', 'SHOW_SSD (exFAT)', 'BACKUP_HDD (NTFS)', 'USB_STICK (FAT32)'].forEach(function (d) {
                sel.appendChild(el('option', { value: d, text: d || 'Select disk...', selected: s.rec.disk === d }));
              });
              sel.onchange = function () {
                s.rec.disk = sel.value;
                if (sel.value.indexOf('NTFS') > -1) w.UI.toast('NTFS works on Windows only - exFAT is the safe choice', 'bad');
                if (sel.value.indexOf('FAT32') > -1) w.UI.toast('FAT32 caps files at 4 GB - it will split your show', 'bad');
                after();
              };
              return sel;
            })()
          ]),
          toggleRow('ISO record all inputs', s.rec.iso, function () { s.rec.iso = !s.rec.iso; }, 'var(--iso)'),
          el('div', { class: 'prow' }, [
            el('span', { class: 'plbl', text: 'Remaining' }),
            el('span', { class: 'pval mono', text: s.rec.disk ? (s.rec.iso ? '01:12:00' : '06:40:00') : '--:--:--' })
          ]),
          el('button', {
            class: 'recbtn' + (s.rec.recording ? ' is-rec' : ''),
            text: s.rec.recording ? 'STOP RECORD' : 'RECORD',
            onclick: function () {
              if (!s.rec.recording) {
                if (!s.rec.disk) { w.UI.toast('Select a record disk first', 'bad'); Sound.bad(); return; }
                s.rec.recording = true; m.recStarted++; Sound.good(); log('RECORD START' + (s.rec.iso ? ' (ISO)' : ''));
              } else {
                s.rec.recording = false;
                if (s.ftb && !s.stream.live && m.shutdownStage === 1) { m.cleanShutdown = true; w.UI.toast('Clean shutdown - copy the media before you unplug it', 'ok'); }
                log('RECORD STOP');
              }
              after();
            }
          }),
          el('p', { class: 'phint', text: s.rec.iso ? 'ISO writes 8 input files, separate WAVs, the program mix and a DaVinci Resolve .drp project.' : 'Program only: one H.264 .mp4 at the streaming quality setting.' })
        ];
      }));

      col.appendChild(palette('macro', 'Macros', 'var(--audio)', function () {
        return [
          el('p', { class: 'phint', text: 'Recorded sequences of switcher actions. Fire one and everything happens at once.' }),
          el('div', { class: 'macros' }, ['Show Open', 'Lower Third', 'Go To Break', 'Wide Reset'].map(function (n, i) {
            return el('button', {
              class: 'macrobtn', text: n,
              onclick: function () {
                Sound.arm();
                if (i === 1) { s.dsk[0].onAir = !s.dsk[0].onAir; if (!s.dsk[0].onAir) m.dsk1Cycles++; }
                if (i === 3) { s.preview = 4; }
                w.UI.toast('Macro fired: ' + n, 'brand'); after();
              }
            });
          }))
        ];
      }));

      /* activity log strip */
      col.appendChild(el('div', { class: 'logbox' }, [
        el('div', { class: 'logbox__t', text: 'SWITCHER LOG' }),
        el('div', { class: 'logbox__l' }, s.log.length ? s.log.map(function (l) { return el('div', { class: 'mono', text: l }); }) : el('div', { class: 'mono muted', text: 'no activity' }))
      ]));

      return col;
    }

    function slider(label, val, min, max, onChange, unit, step) {
      var out = el('span', { class: 'sl__v mono', text: val + (unit || '') });
      var inp = el('input', {
        class: 'sl__i', type: 'range', min: String(min), max: String(max), step: String(step || 1), value: String(val)
      });
      inp.oninput = function () {
        var v = parseFloat(inp.value);
        out.textContent = v + (unit || '');
        onChange(v); after(true);
      };
      return el('div', { class: 'sl' }, [
        el('span', { class: 'sl__l', text: label }), inp, out
      ]);
    }

    /* ---------- media tab ---------- */
    function renderMedia() {
      var pane = el('div', { class: 'mediatab' });
      pane.appendChild(el('div', { class: 'mt__head' }, [
        el('span', { class: 'mt__title', text: 'Media Pool' }),
        el('span', { class: 'mt__sub', text: '20 still slots / 2 clip slots - 8 shown' })
      ]));
      var browser = el('div', { class: 'mt__browser' });
      browser.appendChild(el('div', { class: 'mt__bt', text: 'C:\\Shows\\Graphics' }));
      var files = el('div', { class: 'mt__files' });
      MEDIA_LIBRARY.forEach(function (f, i) {
        var card = el('div', { class: 'mfile', draggable: 'true' }, [
          el('div', { class: 'mfile__th' + (f.alpha ? ' mfile__th--alpha' : '') }, [el('span', { text: f.tag })]),
          el('div', { class: 'mfile__n', text: f.name })
        ]);
        card.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/plain', String(i)); });
        files.appendChild(card);
      });
      browser.appendChild(files);
      pane.appendChild(browser);

      var pool = el('div', { class: 'mt__pool' });
      s.pool.forEach(function (item, idx) {
        var slot = el('div', { class: 'mslot' + (item ? ' is-full' : '') }, [
          el('div', { class: 'mslot__n mono', text: String(idx + 1) }),
          item ? el('div', { class: 'mslot__th' + (item.alpha ? ' mslot__th--alpha' : '') }, [el('span', { text: item.tag })])
               : el('div', { class: 'mslot__empty', text: 'empty' }),
          item ? el('div', { class: 'mslot__l', text: item.name }) : null
        ]);
        slot.addEventListener('dragover', function (e) { e.preventDefault(); slot.classList.add('is-over'); });
        slot.addEventListener('dragleave', function () { slot.classList.remove('is-over'); });
        slot.addEventListener('drop', function (e) {
          e.preventDefault(); slot.classList.remove('is-over');
          var i = parseInt(e.dataTransfer.getData('text/plain'), 10);
          if (isNaN(i)) return;
          s.pool[idx] = MEDIA_LIBRARY[i];
          Sound.good(); w.UI.toast('Uploaded ' + MEDIA_LIBRARY[i].name + ' to slot ' + (idx + 1), 'ok');
          after();
        });
        pool.appendChild(slot);
      });
      pane.appendChild(pool);
      pane.appendChild(el('p', { class: 'phint', text: 'Drag a file from the browser onto a pool slot to upload it into the switcher, then point a Media Player at that slot on the Switcher tab.' }));
      return pane;
    }

    /* ---------- audio tab ---------- */
    function renderAudio() {
      var pane = el('div', { class: 'audiotab' });
      var strips = el('div', { class: 'strips' });
      var order = ['mic1', 'mic2', 'rca', 'in1', 'in2', 'in3', 'in4', 'in5', 'in6', 'in7', 'in8', 'mp1'];
      order.forEach(function (k) {
        var c = s.audio.ch[k];
        if (!c) return;
        var live = (c.state === 'on') || (c.state === 'afv' && isOnAir(k));
        var strip = el('div', { class: 'strip' + (live ? ' is-live' : '') }, [
          el('div', { class: 'strip__n', text: c.name }),
          el('div', { class: 'strip__meter' }, [
            el('i', { class: 'strip__mfill', style: { height: (live ? meterFor(c) : 3) + '%' } })
          ]),
          el('div', { class: 'strip__proc' }, [
            procBtn('HPF', c.hpf, function () { c.hpf = !c.hpf; }),
            procBtn('COMP', c.comp, function () { c.comp = !c.comp; }),
            procBtn('LIM', c.lim, function () { c.lim = !c.lim; })
          ]),
          (function () {
            var v = el('span', { class: 'strip__val mono', text: fmtDb(c.gain) });
            var inp = el('input', { class: 'strip__fader', type: 'range', min: '-60', max: '10', step: '1', value: String(c.gain) });
            inp.oninput = function () { c.gain = parseInt(inp.value, 10); v.textContent = fmtDb(c.gain); after(true); };
            return el('div', { class: 'strip__fw' }, [inp, v]);
          })(),
          el('div', { class: 'strip__states' }, ['on', 'afv', 'off'].map(function (st) {
            return el('button', {
              class: 'stbtn stbtn--' + st + (c.state === st ? ' is-on' : ''), text: st.toUpperCase(),
              onclick: function () { c.state = st; Sound.tap(); after(); }
            });
          }))
        ]);
        strips.appendChild(strip);
      });

      /* master */
      var mv = el('span', { class: 'strip__val mono', text: fmtDb(s.audio.master) });
      var minp = el('input', { class: 'strip__fader', type: 'range', min: '-60', max: '10', step: '1', value: String(s.audio.master) });
      minp.oninput = function () { s.audio.master = parseInt(minp.value, 10); mv.textContent = fmtDb(s.audio.master); after(true); };
      strips.appendChild(el('div', { class: 'strip strip--master' }, [
        el('div', { class: 'strip__n', text: 'MASTER' }),
        el('div', { class: 'strip__meter strip__meter--m' }, [
          el('i', { class: 'strip__mfill', style: { height: masterMeter() + '%' } })
        ]),
        el('div', { class: 'strip__proc' }, [el('span', { class: 'mono muted', style: { fontSize: '10px' }, text: 'PGM BUS' })]),
        el('div', { class: 'strip__fw' }, [minp, mv]),
        el('div', { class: 'strip__states' }, [el('span', { class: 'mono muted', style: { fontSize: '10px' }, text: 'PEAK ' + fmtDb(Math.round(masterMeter() / 100 * 60 - 60)) })])
      ]));

      pane.appendChild(strips);
      pane.appendChild(el('div', { class: 'audiohint' }, [
        el('p', { class: 'phint', text: 'ON = always in the mix. AFV = audio follows video, only live when that source is on program. OFF = never. Aim for peaks around -10 dBFS and never touch 0.' })
      ]));
      return pane;
    }
    function procBtn(label, on, fn) {
      return el('button', { class: 'pbtn' + (on ? ' is-on' : ''), text: label, onclick: function () { fn(); Sound.tap(); after(); } });
    }
    function isOnAir(k) {
      if (k.slice(0, 2) !== 'in') return false;
      return s.program === parseInt(k.slice(2), 10) && !s.ftb;
    }
    function meterFor(c) { return w.UI.clamp(Math.round((c.gain + 60) / 70 * 88) + 6, 4, 100); }
    function masterMeter() {
      if (s.ftb) return 2;
      var sum = 0;
      Object.keys(s.audio.ch).forEach(function (k) {
        var c = s.audio.ch[k];
        var live = c.state === 'on' || (c.state === 'afv' && isOnAir(k));
        if (live) sum += Math.pow(10, (c.gain - 8) / 20);
      });
      var db = sum > 0 ? 20 * Math.log10(sum) : -60;
      db += s.audio.master;
      return w.UI.clamp(Math.round((db + 60) / 70 * 100), 2, 100);
    }
    function fmtDb(v) { return (v > 0 ? '+' : '') + v + '.0'; }

    /* ---------- camera tab ---------- */
    function renderCamera() {
      var pane = el('div', { class: 'camtab' });
      var picker = el('div', { class: 'campick' });
      for (var i = 1; i <= 8; i++) {
        (function (n) {
          picker.appendChild(el('button', {
            class: 'campick__b' + (s.sel === n ? ' is-on' : '') + (s.program === n ? ' is-pgm' : '') + (s.preview === n ? ' is-pvw' : ''),
            text: String(n),
            onclick: function () { s.sel = n; Sound.tap(); after(); }
          }));
        })(i);
      }
      pane.appendChild(el('div', { class: 'camtab__head' }, [
        el('span', { class: 'mt__title', text: 'Camera Control' }),
        picker
      ]));

      var c = s.cam[s.sel];
      var lk = LOOK[s.sel] || LOOK[0];
      var mon = el('div', { class: 'cammon', style: { background: lk.bg } }, [
        el('div', { class: 'cammon__cap', style: { color: lk.ink }, text: lk.cap }),
        el('div', { class: 'cammon__tally' + (s.program === s.sel ? ' is-pgm' : (s.preview === s.sel ? ' is-pvw' : '')) },
          [s.program === s.sel ? 'ON AIR' : (s.preview === s.sel ? 'PREVIEW' : 'OFF')]),
        el('div', { class: 'cammon__ex', style: { opacity: String(w.UI.clamp(0.15 + (8 - c.iris) / 12, 0, 0.85)) } })
      ]);

      var ctrls = el('div', { class: 'camctrl' }, [
        slider('Iris (f-stop)', c.iris, 1.8, 16, function (v) { c.iris = v; }, '', 0.1),
        slider('Master Black', c.black, -20, 40, function (v) { c.black = v; }),
        slider('White Balance', c.wb, 2500, 10000, function (v) { c.wb = v; }, 'K', 100),
        slider('Tint', c.tint, -20, 20, function (v) { c.tint = v; }),
        slider('Gain (dB)', c.gain, -6, 24, function (v) { c.gain = v; }),
        slider('Shutter (deg)', c.shutter, 45, 360, function (v) { c.shutter = v; }, '', 5),
        slider('Gamma', c.gamma, -50, 50, function (v) { c.gamma = v; }),
        slider('Saturation', c.sat, 0, 2, function (v) { c.sat = v; }, '', 0.05)
      ]);

      pane.appendChild(el('div', { class: 'camgrid' }, [mon, ctrls]));
      pane.appendChild(el('div', { class: 'camref' }, [
        el('span', { class: 'phint', text: 'Reference - Camera 1: f/5.6, black 0, 3200K, tint 0. Match camera 2 to it.' })
      ]));
      return pane;
    }

    /* ============================================================
       tasks
       ============================================================ */
    function renderTasks() {
      clear(taskPanel);
      taskPanel.appendChild(el('div', { class: 'simside__t', text: 'Tasks - ' + mission.title }));
      var list = el('div', { class: 'tasks' });
      var blocked = false;
      mission.tasks.forEach(function (t, i) {
        var done = !!doneTasks[t.id];
        var lock = mission.ordered && blocked && !done;
        if (mission.ordered && !done) blocked = true;
        list.appendChild(el('div', { class: 'task' + (done ? ' is-done' : '') + (lock ? ' is-lock' : '') }, [
          el('i', { class: 'task__box', text: '\u2713' }),
          el('div', { class: 'grow' }, [
            el('span', { text: (mission.ordered ? (i + 1) + '. ' : '') + t.label }),
            !done && !lock ? el('span', { class: 'task__hint', text: t.hint }) : null
          ])
        ]));
      });
      taskPanel.appendChild(list);

      var n = mission.tasks.filter(function (t) { return doneTasks[t.id]; }).length;
      taskPanel.appendChild(el('div', { class: 'simprog' }, [
        el('div', { class: 'simprog__bar' }, [el('i', { style: { width: (n / mission.tasks.length * 100) + '%' } })]),
        el('span', { class: 'mono', text: n + '/' + mission.tasks.length })
      ]));
      if (finished) {
        taskPanel.appendChild(el('div', { class: 'simdone' }, [
          el('span', { class: 'chip chip--pvw', text: 'Simulation complete' })
        ]));
      }
    }

    function checkTasks() {
      var blocked = false;
      var newly = [];
      for (var i = 0; i < mission.tasks.length; i++) {
        var t = mission.tasks[i];
        if (doneTasks[t.id]) continue;
        if (mission.ordered && blocked) break;
        var ok = false;
        try { ok = !!t.check(s, m); } catch (e) { ok = false; }
        if (ok) { doneTasks[t.id] = true; newly.push(t); }
        else if (mission.ordered) blocked = true;
      }
      newly.forEach(function (t) {
        Sound.good();
        w.UI.toast('<b>Task complete</b> &nbsp;' + w.UI.esc(t.label), 'ok', 2200);
      });
      if (!finished && mission.tasks.length && mission.tasks.every(function (t) { return doneTasks[t.id]; })) {
        finished = true;
        Sound.good();
        setTimeout(function () {
          w.UI.toast('<b>Simulation passed.</b> Every task checked against live switcher state.', 'brand', 4200);
          if (opts.onComplete) opts.onComplete();
        }, 380);
      }
    }

    /* after() - central "something changed" hook.
       quiet=true skips a full re-render (used by sliders / typing) */
    function after(quiet) {
      /* stream/record shutdown ordering */
      if (s.ftb && !s.stream.live && m.streamStarted > 0 && m.shutdownStage === 0) m.shutdownStage = 1;
      checkTasks();
      paintMonitors();
      if (opts.onChange) opts.onChange(s, m);
      if (quiet) { renderTasks(); return; }
      render();
    }

    render();
    return { state: s, destroy: function () { clear(host); } };
  }

  w.SimATEM = { mount: mount, MISSIONS: MISSIONS, SRC: SRC, MEDIA_LIBRARY: MEDIA_LIBRARY, LOOK: LOOK };
})(window);
