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
  var STYLE_NAME = { mix: 'FADING ACROSS', dip: 'DIPPING THROUGH WHITE', wipe: 'WIPING ACROSS', sting: 'GRAPHIC WIPE', dve: 'SLIDING ACROSS' };
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
        return { onAir: false, type: 'luma', fill: 0, keySrc: 0, sampled: false, spill: 50, edge: 50, fg: 50, bg: 50 };
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
        { id: 'a', label: 'Put Camera 1 on air',
          hint: 'The red row is what the audience sees. Click CAM 1 on it.',
          spot: '.me__row--pgm .xpt[data-src="1"]',
          check: function (s) { return s.program === 1; } },
        { id: 'b', label: 'Line up Camera 2 to go next',
          hint: 'The green row is private - nobody sees it. Click CAM 2 there.',
          spot: '.me__row--pvw .xpt[data-src="2"]',
          check: function (s) { return s.preview === 2; } },
        { id: 'c', label: 'Press CUT to swap them',
          hint: 'CUT switches instantly. Watch the two pictures trade places.',
          spot: '.bigb--cut',
          check: function (s, m) { return m.cuts >= 1 && s.program === 2; } },
        { id: 'd', label: 'Choose FADE, and set the length to 12',
          hint: 'FADE blends one picture into the other. 12 means about half a second.',
          spot: '.tcb--st[data-style="mix"], .tc__rate',
          check: function (s) { return s.style === 'mix' && s.rate === 12; } },
        { id: 'e', label: 'Line up Camera 3, then press AUTO',
          hint: 'AUTO plays the fade for you, over the length you just set.',
          spot: '.bigb--auto',
          check: function (s, m) { return m.autos >= 1 && s.program === 3; } },
        { id: 'f', label: 'Do one transition by hand with the fader bar',
          hint: 'Drag the tall slider from one end to the other. Stop halfway and you will see both pictures at once.',
          spot: '.tbar',
          check: function (s, m) { return m.tbarRuns >= 1; } },
        { id: 'g', label: 'Press FTB to go to black, then press it again to come back',
          hint: 'FTB means Fade To Black. It kills picture and sound together - your emergency stop.',
          spot: '.bigb--ftb',
          check: function (s, m) { return m.ftbCount >= 2 && !s.ftb; } }
      ]
    },

    keying: {
      title: 'Put a guest on a fake background, and a name on screen',
      tasks: [
        { id: 'a', label: 'Choose the WIPE transition',
          hint: 'WIPE slides one picture across the other instead of fading.',
          spot: '.tcb--st[data-style="wipe"]',
          check: function (s) { return s.style === 'wipe'; } },
        { id: 'b', label: 'Open Upstream Key 1, set it to CHROMA, and set Fill Source to Green Screen',
          hint: 'A chroma key removes one colour from a picture. Upstream just means it happens early, before the transition.',
          pre: function (s) { s.openPalette.usk = true; },
          spot: '.pal[data-pal="usk"]',
          check: function (s) { return s.usk[0].type === 'chroma' && s.usk[0].fill === 5; } },
        { id: 'c', label: 'Press SAMPLE to tell it which green to remove',
          hint: 'Until you sample, the switcher does not know what to delete - watch the picture when you do it.',
          pre: function (s) { s.openPalette.usk = true; },
          spot: '.sampler .btn',
          check: function (s) { return s.usk[0].sampled; } },
        { id: 'd', label: 'Put the studio background on air - click Slides on the red row',
          hint: 'This is the picture the guest will appear in front of.',
          spot: '.me__row--pgm .xpt[data-src="7"]',
          check: function (s) { return s.program === 7; } },
        { id: 'e', label: 'Turn the key ON AIR',
          hint: 'The guest should now be standing in the background, with no green left.',
          pre: function (s) { s.openPalette.usk = true; },
          spot: '.pal[data-pal="usk"] .tgl',
          check: function (s) { return s.usk[0].onAir; } },
        { id: 'f', label: 'In Downstream Key 1 set Fill to Media Player 1, Key to Media Player 1 Key, and switch on Pre Multiplied Key',
          hint: 'Fill is the picture. Key is the see-through part. Pre Multiplied stops a black outline appearing round the text.',
          pre: function (s) { s.openPalette.dsk = true; },
          spot: '.pal[data-pal="dsk"]',
          check: function (s) { return s.dsk[0].fill === 3010 && s.dsk[0].keySrc === 3011 && s.dsk[0].pre; } },
        { id: 'g', label: 'Turn Downstream Key 1 ON AIR',
          hint: 'The name strip appears along the bottom. Downstream means last, so it sits over everything.',
          spot: '.dskstrip[data-dsk="1"] .tcb--air',
          check: function (s) { return s.dsk[0].onAir; } },
        { id: 'h', label: 'Click KEY 1 under NEXT TRANSITION, then press AUTO',
          hint: 'That makes the green-screen guest arrive with the transition, instead of popping on.',
          spot: '.tcb--nt[data-nt="k1"]',
          check: function (s, m) { return m.autoWithKey >= 1; } }
      ]
    },

    audio: {
      title: 'Mix the sound',
      startTab: 'audio',
      tasks: [
        { id: 'a', label: 'Set the host microphone to ON',
          hint: 'ON means it is always heard, whichever camera is live.',
          spot: '.strip[data-ch="mic1"] .stbtn--on',
          check: function (s) { return s.audio.ch.mic1.state === 'on'; } },
        { id: 'b', label: 'Set Cameras 1, 2 and 3 to AFV',
          hint: 'AFV is Audio Follows Video - that camera is only heard while it is on air.',
          spot: '.strip[data-ch="in1"] .stbtn--afv, .strip[data-ch="in2"] .stbtn--afv, .strip[data-ch="in3"] .stbtn--afv',
          check: function (s) { return ['in1', 'in2', 'in3'].every(function (k) { return s.audio.ch[k].state === 'afv'; }); } },
        { id: 'c', label: 'Set the Green Screen camera to OFF',
          hint: 'It has no useful microphone, so it should never be heard.',
          spot: '.strip[data-ch="in5"] .stbtn--off',
          check: function (s) { return s.audio.ch.in5.state === 'off'; } },
        { id: 'd', label: 'Switch on HPF on the host microphone',
          hint: 'HPF is a High Pass Filter. It removes the low rumble from air conditioning and footsteps.',
          spot: '.strip[data-ch="mic1"]',
          check: function (s) { return s.audio.ch.mic1.hpf; } },
        { id: 'e', label: 'Switch on LIM on the host microphone',
          hint: 'LIM is a limiter. It catches a sudden loud noise before it distorts.',
          spot: '.strip[data-ch="mic1"]',
          check: function (s) { return s.audio.ch.mic1.lim; } },
        { id: 'f', label: 'Set the host microphone level between -12 and -4',
          hint: 'Drag its slider. The bar beside it shows how loud it is.',
          spot: '.strip[data-ch="mic1"] .strip__fader',
          check: function (s) { return s.audio.ch.mic1.gain >= -12 && s.audio.ch.mic1.gain <= -4; } },
        { id: 'g', label: 'Leave the MASTER level between -6 and 0',
          hint: 'Master is everything added together. Above 0 the sound breaks up.',
          spot: '.strip--master .strip__fader',
          check: function (s) { return s.audio.master >= -6 && s.audio.master <= 0; } }
      ]
    },

    camera: {
      title: 'Make two cameras look the same',
      startTab: 'camera',
      tasks: [
        { id: 'a', label: 'Click camera 2',
          hint: 'You will see it side by side with camera 1, which is the one to match.',
          spot: '.campick__b[data-cam="2"]',
          check: function (s) { return s.sel === 2; } },
        { id: 'b', label: 'Camera 2 looks blue. Set White balance to 3200',
          hint: 'White balance tells the camera what colour the room light is. Camera 1 is on 3200.',
          spot: '.sl[data-sl="wb"]',
          check: function (s) { return s.cam[2].wb === 3200; } },
        { id: 'c', label: 'Its blacks look washed out. Set Black level back to 0',
          hint: 'Black level decides how dark the shadows are. Lifted blacks look grey and foggy.',
          spot: '.sl[data-sl="black"]',
          check: function (s) { return s.cam[2].black === 0; } },
        { id: 'd', label: 'It is too dark. Open the iris to 5.6',
          hint: 'A bigger f-number lets in less light. Camera 1 is on 5.6.',
          spot: '.sl[data-sl="iris"]',
          check: function (s) { return Math.abs(s.cam[2].iris - 5.6) < 0.05; } },
        { id: 'e', label: 'Set Tint back to 0',
          hint: 'Tint is a green or pink shift on top of the colour temperature.',
          spot: '.sl[data-sl="tint"]',
          check: function (s) { return s.cam[2].tint === 0; } },
        { id: 'f', label: 'Go to the Switcher tab and line camera 2 up on the green row',
          hint: 'Its tally marker turns green - that tells the operator they are next.',
          pre: function (s) { s.tab = 'switcher'; },
          spot: '.me__row--pvw .xpt[data-src="2"]',
          check: function (s) { return s.preview === 2; } },
        { id: 'g', label: 'Press CUT so camera 2 goes live',
          hint: 'Its tally marker turns red. Watch that it cuts cleanly against camera 1 now.',
          pre: function (s) { s.tab = 'switcher'; },
          spot: '.bigb--cut',
          check: function (s) { return s.program === 2; } }
      ]
    },

    stream: {
      title: 'Go live and record',
      tasks: [
        { id: 'a', label: 'Open the Streaming panel and choose YouTube',
          hint: 'The switcher sends the show straight to the internet on its own - no computer needed.',
          pre: function (s) { s.openPalette.stream = true; },
          spot: '.pal[data-pal="stream"]',
          check: function (s) { return s.stream.platform === 'YouTube'; } },
        { id: 'b', label: 'Paste a stream key',
          hint: 'A stream key is the password YouTube gives you so it knows the video is yours. Type anything here.',
          pre: function (s) { s.openPalette.stream = true; },
          spot: '.pal[data-pal="stream"] .atxt',
          check: function (s) { return s.stream.key.length >= 8; } },
        { id: 'c', label: 'The venue upload speed is 10 Mb/s. Choose 1080p 5 Mb/s',
          hint: 'Send at about half of what the internet connection can manage, so it never stutters.',
          pre: function (s) { s.openPalette.stream = true; },
          spot: '.pal[data-pal="stream"]',
          check: function (s) { return s.stream.quality === '1080p 5 Mb/s'; } },
        { id: 'd', label: 'Open Recording and choose the SHOW_SSD (exFAT) drive',
          hint: 'exFAT is a disk format both Windows and Mac can read. The other two will cause you trouble.',
          pre: function (s) { s.openPalette.rec = true; },
          spot: '.pal[data-pal="rec"]',
          check: function (s) { return s.rec.disk === 'SHOW_SSD (exFAT)'; } },
        { id: 'e', label: 'Press RECORD',
          hint: 'Always start recording before you go live, not after.',
          pre: function (s) { s.openPalette.rec = true; },
          spot: '.recbtn',
          check: function (s, m) { return m.recStarted >= 1; } },
        { id: 'f', label: 'Press ON AIR to start streaming',
          hint: 'From here, everything on the red row is going out to the internet.',
          pre: function (s) { s.openPalette.stream = true; },
          spot: '.onair',
          check: function (s, m) { return m.streamStarted >= 1; } },
        { id: 'g', label: 'Finish properly: press FTB, then stop the stream, then stop the recording',
          hint: 'That order matters. Get off air first, turn the outputs off last.',
          spot: '.bigb--ftb',
          check: function (s, m) { return m.cleanShutdown; } }
      ]
    },

    /* the final. Two halves: build the rig with all the time in the
       world, then run the show against a clock. */
    showtime: {
      title: 'Run the show',
      ordered: true,
      rundown: true,
      phases: ['Set the show up — no clock, take your time', 'On air — hit each cue near its time'],
      tasks: [
        /* ---------- phase 1: build the rig ---------- */
        { id: 'p1', phase: 1, label: 'Go to the Media page and drag the name strip into slot 1',
          hint: 'LT_01_HostName.png. Drag it from the row of files down onto the first empty slot.',
          pre: function (s) { s.tab = 'media'; }, spot: '.mt__files',
          check: function (s) { return s.pool[0] && s.pool[0].name === 'LT_01_HostName.png'; } },
        { id: 'p2', phase: 1, label: 'Drag the holding slide into slot 2',
          hint: 'HOLDING_Slide.png. This is what the audience sees before you start.',
          pre: function (s) { s.tab = 'media'; }, spot: '.mt__files',
          check: function (s) { return s.pool[1] && s.pool[1].name === 'HOLDING_Slide.png'; } },
        { id: 'p3', phase: 1, label: 'Point Player 1 at slot 1',
          hint: 'Back on the Switcher page, in the Media Players panel.',
          pre: function (s) { s.tab = 'switcher'; s.openPalette.media = true; },
          spot: '.pal[data-pal="media"]',
          check: function (s) { return s.players[0].slot === 0; } },
        { id: 'p4', phase: 1, label: 'Set the graphic layer to use Player 1, with Pre Multiplied Key on',
          hint: 'Downstream Key 1: Fill = Media Player 1, Key = Media Player 1 Key, then the Pre Multiplied switch.',
          pre: function (s) { s.tab = 'switcher'; s.openPalette.dsk = true; },
          spot: '.pal[data-pal="dsk"]',
          check: function (s) { return s.dsk[0].fill === 3010 && s.dsk[0].keySrc === 3011 && s.dsk[0].pre; } },
        { id: 'p5', phase: 1, label: 'Set Upstream Key 1 to Chroma on the Green Screen camera, and sample it',
          hint: 'Type Chroma, Fill Source Green Screen, then press SAMPLE.',
          pre: function (s) { s.tab = 'switcher'; s.openPalette.usk = true; },
          spot: '.pal[data-pal="usk"]',
          check: function (s) { return s.usk[0].type === 'chroma' && s.usk[0].fill === 5 && s.usk[0].sampled; } },
        { id: 'p6', phase: 1, label: 'Sound: presenter microphone ON, cameras 1-3 on AFV',
          hint: 'AFV means that camera is only heard while it is on air.',
          pre: function (s) { s.tab = 'audio'; }, spot: '.strip[data-ch="mic1"], .strip[data-ch="in1"], .strip[data-ch="in2"], .strip[data-ch="in3"]',
          check: function (s) {
            return s.audio.ch.mic1.state === 'on' &&
              ['in1', 'in2', 'in3'].every(function (k) { return s.audio.ch[k].state === 'afv'; });
          } },
        { id: 'p7', phase: 1, label: 'Sound: green screen camera OFF, master between -6 and 0',
          hint: 'That camera has no useful microphone. The master is the strip on the far right.',
          pre: function (s) { s.tab = 'audio'; }, spot: '.strip[data-ch="in5"], .strip--master',
          check: function (s) { return s.audio.ch.in5.state === 'off' && s.audio.master >= -6 && s.audio.master <= 0; } },
        { id: 'p8', phase: 1, label: 'Match camera 2 to camera 1',
          hint: 'Colour temperature 3200, black level 0, iris 5.6, tint 0.',
          pre: function (s) { s.tab = 'camera'; s.sel = 2; }, spot: '.camctrl',
          check: function (s) {
            var c = s.cam[2];
            return c.wb === 3200 && c.black === 0 && Math.abs(c.iris - 5.6) < 0.05 && c.tint === 0;
          } },
        { id: 'p9', phase: 1, label: 'Set the stream up: YouTube, a stream key, and 1080p 5 Mb/s',
          hint: 'The venue uploads at 10 Mb/s, so send at about half.',
          pre: function (s) { s.tab = 'switcher'; s.openPalette.stream = true; },
          spot: '.pal[data-pal="stream"]',
          check: function (s) { return s.stream.platform === 'YouTube' && s.stream.key.length >= 8 && s.stream.quality === '1080p 5 Mb/s'; } },
        { id: 'p10', phase: 1, label: 'Choose the SHOW_SSD (exFAT) drive to record onto',
          hint: 'The other two drives will cause you trouble later.',
          pre: function (s) { s.tab = 'switcher'; s.openPalette.rec = true; },
          spot: '.pal[data-pal="rec"]',
          check: function (s) { return s.rec.disk === 'SHOW_SSD (exFAT)'; } },

        /* ---------- phase 2: the show ---------- */
        { id: '1', phase: 2, at: 0, label: 'Holding slide up',
          hint: 'Click SLIDES on the red row. This is what people see as they arrive.',
          pre: function (s) { s.tab = 'switcher'; }, spot: '.me__row--pgm .xpt[data-src="7"]',
          check: function (s) { return s.program === 7; } },
        { id: '2', phase: 2, at: 12, label: 'Start recording',
          hint: 'Always roll the recording before you go live.',
          pre: function (s) { s.tab = 'switcher'; s.openPalette.rec = true; }, spot: '.recbtn',
          check: function (s, m) { return m.recStarted >= 1; } },
        { id: '3', phase: 2, at: 24, label: 'Go live to YouTube',
          hint: 'ON AIR in the Streaming panel.',
          pre: function (s) { s.tab = 'switcher'; s.openPalette.stream = true; }, spot: '.onair',
          check: function (s, m) { return m.streamStarted >= 1; } },
        { id: '4', phase: 2, at: 40, label: 'Fade up on Camera 1 for the welcome',
          hint: 'Camera 1 on the green row, then press AUTO.',
          pre: function (s) { s.tab = 'switcher'; }, spot: '.bigb--auto',
          check: function (s, m) { return s.program === 1 && m.autos >= 1; } },
        { id: '5', phase: 2, at: 55, label: 'Name strip on for the host',
          hint: 'ON AIR on the DSK 1 strip. You set this up earlier.',
          pre: function (s) { s.tab = 'switcher'; }, spot: '.dskstrip[data-dsk="1"] .tcb--air',
          check: function (s) { return s.dsk[0].onAir; } },
        { id: '6', phase: 2, at: 70, label: 'Name strip off again',
          hint: 'Press the same button. Eight seconds on screen is plenty.',
          pre: function (s) { s.tab = 'switcher'; }, spot: '.dskstrip[data-dsk="1"] .tcb--air',
          check: function (s, m) { return m.dsk1Cycles >= 1 && !s.dsk[0].onAir; } },
        { id: '7', phase: 2, at: 95, label: 'Cut between Camera 2 and Camera 3, three times',
          hint: 'Green row, CUT, green row, CUT. This is the discussion.',
          pre: function (s) { s.tab = 'switcher'; }, spot: '.bigb--cut',
          check: function (s, m) { return m.discussionCuts >= 3; } },
        { id: '8', phase: 2, at: 125, label: 'Bring in the green-screen guest',
          hint: 'Turn Upstream Key 1 ON AIR. You already sampled it.',
          pre: function (s) { s.tab = 'switcher'; s.openPalette.usk = true; },
          spot: '.pal[data-pal="usk"] .trow .tgl',
          check: function (s) { return s.usk[0].onAir; } },
        { id: '9', phase: 2, at: 150, label: 'Wipe across to the wide shot for the close',
          hint: 'Choose WIPE, put WIDE on the green row, then AUTO.',
          pre: function (s) { s.tab = 'switcher'; }, spot: '.tcb--st[data-style="wipe"]',
          check: function (s, m) { return s.program === 4 && m.wipeTakes >= 1; } },
        { id: '10', phase: 2, at: 170, label: 'Fade to black',
          hint: 'FTB. You are off air.',
          pre: function (s) { s.tab = 'switcher'; }, spot: '.bigb--ftb',
          check: function (s) { return s.ftb; } },
        { id: '11', phase: 2, at: 185, label: 'Stop the stream, then stop the recording',
          hint: 'That order. Then the show exists on the drive.',
          pre: function (s) { s.tab = 'switcher'; s.openPalette.stream = true; s.openPalette.rec = true; },
          spot: '.onair, .recbtn',
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
    if (opts.mission === 'keying') {
      s.pool[0] = MEDIA_LIBRARY[0]; s.pool[1] = MEDIA_LIBRARY[3];
      s.players[0].slot = 0; s.players[1].slot = 1;
    }
    if (mission.startTab) s.tab = mission.startTab;

    /* ---------- show clock (final only) ---------- */
    var clock = { running: false, t0: 0, elapsed: 0, hits: {}, done: false, tick: null };
    function clockNow() { return clock.running ? (Date.now() - clock.t0) / 1000 : clock.elapsed; }
    function phaseOneDone() {
      return mission.tasks.filter(function (t) { return t.phase === 1; })
        .every(function (t) { return doneTasks[t.id]; });
    }
    function startClock() {
      if (clock.running || clock.done) return;
      if (!phaseOneDone()) { w.UI.toast('Finish setting the rig up first.', 'info'); return; }
      clock.running = true;
      clock.t0 = Date.now() - clock.elapsed * 1000;
      clock.tick = setInterval(function () {
        clock.elapsed = clockNow();
        paintClock();
      }, 250);
      Sound.arm();
      w.UI.toast('<b>You are on.</b> Follow the running order down the right.', 'brand', 3600);
      renderTasks();
      applyCoach(true);
    }
    function stopClock() {
      clock.running = false;
      if (clock.tick) { clearInterval(clock.tick); clock.tick = null; }
    }

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
        el('span', { text: 'ATEM Television Studio HD8' })
      ])
    ]);
    var tabs = el('div', { class: 'aw__tabs' });
    ['switcher', 'media', 'audio', 'camera'].forEach(function (t) {
      tabs.appendChild(el('button', {
        class: 'awtab', data: { tab: t }, text: t.charAt(0).toUpperCase() + t.slice(1),
        onclick: function () { s.tab = t; Sound.tap(); after(); }
      }));
    });
    var body = el('div', { class: 'aw__body' });
    win.appendChild(titlebar); win.appendChild(tabs); win.appendChild(body);

    /* ---------- task panel ---------- */
    var taskPanel = el('div', { class: 'card card--pad' });
    var sidebar = el('div', { class: 'simside' }, [taskPanel]);

    /* the instruction you are on, pinned above the window */
    var coachBox = w.UI.coach({
      root: root,
      onSpot: function () { var t = currentTask(); if (t) spotTask(t); },
      onRefresh: function () { applyCoach(true); }
    });
    /* Only show the instruction bar when this switcher owns the task list.
       Inside the Windows simulation the ATEM is mounted in free-play with no
       tasks of its own - the host owns them - and a coach there would report
       an empty list as 'every step done'. */
    var ownsTasks = mission.tasks.length > 0 && !opts.embedded;
    if (ownsTasks) root.insertBefore(coachBox.el, root.firstChild);

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
      if (!coachBusy) applyCoach();
    }

    /* ---------- monitors / multiview ---------- */
    var mvEls = null;
    function tile(id, label) {
      var t = el('div', { class: 'mvt' });
      var scr = el('div', { class: 'mvt__scr' });
      scr.appendChild(w.Pic.make({ src: id, st: s, grade: s.cam[id] }));
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
    function bigMon(node, pic, tag, label, notes) {
      clear(node);
      var scr = el('div', { class: 'mvbig__scr' });
      scr.appendChild(pic);
      (notes || []).forEach(function (n) { scr.appendChild(n); });
      node.appendChild(scr);
      node.appendChild(el('div', { class: 'mvbig__lbl' }, [
        el('span', { class: 'mvbig__tag', text: tag }),
        el('span', { text: label })
      ]));
    }
    function paintMonitors() {
      if (!mvEls) return;

      /* ---- what is actually going out ---- */
      var notes = [];
      if (s.tbar > 0) notes.push(el('div', { class: 'ovl ovl--trans', text: STYLE_NAME[s.style] + '  ' + Math.round(s.tbar * 100) + '%' }));
      var pgmPic = w.Pic.make({
        src: s.program,
        st: s,
        ftb: s.ftb,
        mix: s.tbar > 0 ? { to: s.preview, t: s.tbar, style: s.style } : null,
        usk: s.usk[0],
        dsk: s.dsk,
        grade: s.cam[s.program]
      });
      var pgmLabel = s.ftb ? 'Black' : srcName(s.program);
      if (!s.ftb && s.usk[0].onAir) pgmLabel += ' + key';
      if (!s.ftb && (s.dsk[0].onAir || s.dsk[1].onAir)) pgmLabel += ' + graphic';
      bigMon(mvEls.pg, pgmPic, 'ON AIR', pgmLabel, notes);

      /* preview shows the background and any upstream key, never the
         downstream graphics - which is the lesson */
      var pvwPic = w.Pic.make({ src: s.preview, st: s, usk: s.usk[0], grade: s.cam[s.preview] });
      bigMon(mvEls.pv, pvwPic, 'NEXT UP', srcName(s.preview),
        (s.dsk[0].onAir || s.dsk[1].onAir) ? [el('div', { class: 'ovl ovl--dsk', text: 'graphic is on air but never shows here' })] : []);

      clear(mvEls.strip);
      for (var i = 1; i <= 8; i++) {
        var t = tile(i, src(i).long);
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
        title: o.long, data: { src: String(o.id) }
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
          class: 'tcb tcb--nt' + (s.next[p[0]] ? ' is-on' : ''), text: p[1], data: { nt: p[0] },
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
      [['mix', 'FADE'], ['dip', 'DIP'], ['wipe', 'WIPE'], ['sting', 'STING'], ['dve', 'SLIDE']].forEach(function (p) {
        stRow.appendChild(el('button', {
          class: 'tcb tcb--st' + (s.style === p[0] ? ' is-on' : ''), text: p[1], data: { style: p[0] },
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
        var strip = el('div', { class: 'dskstrip', data: { dsk: String(i + 1) } }, [
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
      var p = el('div', { class: 'pal', data: { pal: key } }, [head]);
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
          el('div', { class: 'prow' }, [
            el('span', { class: 'plbl', text: 'Remaining' }),
            el('span', { class: 'pval mono', text: s.rec.disk ? '06:40:00' : '--:--:--' })
          ]),
          el('button', {
            class: 'recbtn' + (s.rec.recording ? ' is-rec' : ''),
            text: s.rec.recording ? 'STOP RECORD' : 'RECORD',
            onclick: function () {
              if (!s.rec.recording) {
                if (!s.rec.disk) { w.UI.toast('Select a record disk first', 'bad'); Sound.bad(); return; }
                s.rec.recording = true; m.recStarted++; Sound.good(); log('RECORD START');
              } else {
                s.rec.recording = false;
                if (s.ftb && !s.stream.live && m.shutdownStage === 1) { m.cleanShutdown = true; w.UI.toast('Clean shutdown - copy the media before you unplug it', 'ok'); }
                log('RECORD STOP');
              }
              after();
            }
          }),
          el('p', { class: 'phint', text: 'The program mix, recorded as one H.264 .mp4 at the streaming quality setting.' })
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

    function slider(label, val, min, max, onChange, unit, step, key) {
      var out = el('span', { class: 'sl__v mono', text: val + (unit || '') });
      var inp = el('input', {
        class: 'sl__i', type: 'range', min: String(min), max: String(max), step: String(step || 1), value: String(val)
      });
      inp.oninput = function () {
        var v = parseFloat(inp.value);
        out.textContent = v + (unit || '');
        onChange(v); after(true);
      };
      return el('div', { class: 'sl', data: key ? { sl: key } : null }, [
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
        var strip = el('div', { class: 'strip' + (live ? ' is-live' : ''), data: { ch: k } }, [
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
    var camRepaint = null;
    function renderCamera() {
      var pane = el('div', { class: 'camtab' });
      var picker = el('div', { class: 'campick' });
      for (var i = 1; i <= 8; i++) {
        (function (n) {
          picker.appendChild(el('button', {
            class: 'campick__b' + (s.sel === n ? ' is-on' : '') + (s.program === n ? ' is-pgm' : '') + (s.preview === n ? ' is-pvw' : ''),
            text: String(n), data: { cam: String(n) },
            onclick: function () { s.sel = n; Sound.tap(); after(); }
          }));
        })(i);
      }
      pane.appendChild(el('div', { class: 'camtab__head' }, [
        el('span', { class: 'mt__title', text: 'Camera Control' }),
        picker
      ]));

      var c = s.cam[s.sel];

      /* side by side, so you can actually see the match happen */
      var refMon = el('div', { class: 'cammon' });
      var liveMon = el('div', { class: 'cammon' });
      var verdict = el('div', { class: 'cammatch' });

      camRepaint = function () {
        var cc = s.cam[s.sel];
        clear(refMon);
        refMon.appendChild(w.Pic.make({ src: 1, st: s, grade: s.cam[1] }));
        refMon.appendChild(el('div', { class: 'cammon__tag', text: 'CAMERA 1 — the one you are matching to' }));

        clear(liveMon);
        liveMon.appendChild(w.Pic.make({ src: s.sel, st: s, grade: cc }));
        liveMon.appendChild(el('div', { class: 'cammon__tag', text: 'CAMERA ' + s.sel + ' — the one you are adjusting' }));
        liveMon.appendChild(el('div', {
          class: 'cammon__tally' + (s.program === s.sel ? ' is-pgm' : (s.preview === s.sel ? ' is-pvw' : '')),
          text: s.program === s.sel ? 'LIVE' : (s.preview === s.sel ? 'NEXT UP' : 'not on air')
        }));

        var r = s.cam[1];
        var off = [];
        if (Math.abs(cc.wb - r.wb) > 60) off.push(cc.wb > r.wb ? 'too blue' : 'too orange');
        if (Math.abs(cc.black - r.black) > 0.5) off.push(cc.black > r.black ? 'blacks washed out' : 'blacks crushed');
        if (Math.abs(cc.iris - r.iris) > 0.15) off.push(cc.iris > r.iris ? 'too dark' : 'too bright');
        if (Math.abs(cc.tint - r.tint) > 0.5) off.push('tint is off');
        clear(verdict);
        if (s.sel === 1) verdict.appendChild(el('span', { class: 'chip', text: 'This is the reference camera' }));
        else if (!off.length) verdict.appendChild(el('span', { class: 'chip chip--pvw', text: '✓ Matched — they will cut together cleanly' }));
        else off.forEach(function (o) { verdict.appendChild(el('span', { class: 'chip chip--pgm', text: o })); });
      };

      var ctrls = el('div', { class: 'camctrl' }, [
        el('div', { class: 'camctrl__t', text: 'Colour temperature — how warm or cool the picture looks. Camera 1 is on 3200.' }),
        slider('White balance', c.wb, 2500, 10000, function (v) { c.wb = v; }, 'K', 100, 'wb'),
        el('div', { class: 'camctrl__t', text: 'Black level — how dark the shadows are. Too high and the picture looks washed out.' }),
        slider('Black level', c.black, -20, 40, function (v) { c.black = v; }, '', 1, 'black'),
        el('div', { class: 'camctrl__t', text: 'Iris — how much light the lens lets in. A bigger f-number means a darker picture.' }),
        slider('Iris (f-number)', c.iris, 1.8, 16, function (v) { c.iris = v; }, '', 0.1, 'iris'),
        el('div', { class: 'camctrl__t', text: 'Tint — a green or magenta shift on top of the colour temperature.' }),
        slider('Tint', c.tint, -20, 20, function (v) { c.tint = v; }, '', 1, 'tint')
      ]);

      pane.appendChild(el('div', { class: 'camgrid' }, [
        el('div', { class: 'camgrid__mons' }, [refMon, liveMon, verdict]),
        ctrls
      ]));
      camRepaint();
      return pane;
    }

    /* ============================================================
       tasks
       ============================================================ */
    var clockEls = null;
    function paintClock() {
      if (!clockEls) return;
      var t = clockNow();
      clockEls.time.textContent = w.UI.fmtTime(t);
      var nextTask = mission.tasks.filter(function (x) { return x.phase === 2 && !doneTasks[x.id]; })[0];
      clockEls.cue.textContent = nextTask ? 'cue at ' + w.UI.fmtTime(nextTask.at) : 'show complete';
      if (nextTask) {
        var due = nextTask.at - t;
        clockEls.due.textContent = due > 0 ? 'in ' + Math.ceil(due) + 's' : Math.round(-due) + 's late';
        clockEls.due.className = 'showclk__due mono' + (due < -RUNDOWN_WINDOW ? ' is-late' : (due <= 3 ? ' is-now' : ''));
      } else { clockEls.due.textContent = ''; clockEls.due.className = 'showclk__due mono'; }
    }
    /* you are only 'off cue' if you are dramatically off - two whole minutes.
       The running order is what is being tested, not your reflexes. */
    var RUNDOWN_WINDOW = 120;

    function renderTasks() {
      if (!mission.tasks.length) { clear(taskPanel); return; }
      clear(taskPanel);

      if (mission.rundown) {
        var timeEl = el('span', { class: 'showclk__t mono', text: w.UI.fmtTime(clockNow()) });
        var cueEl = el('span', { class: 'showclk__c mono' });
        var dueEl = el('span', { class: 'showclk__due mono' });
        clockEls = { time: timeEl, cue: cueEl, due: dueEl };
        var head = el('div', { class: 'showclk' }, [
          el('div', { class: 'showclk__row' }, [timeEl, dueEl]),
          el('div', { class: 'showclk__foot' }, [cueEl, coachBox.autoEl]),
          clock.running || clock.done ? null : el('button', {
            class: 'btn btn--sm btn--block ' + (phaseOneDone() ? 'btn--go' : 'btn--ghost'),
            style: { marginTop: '10px' },
            text: phaseOneDone() ? '▶  Start the show' : 'Finish the setup first',
            onclick: startClock
          })
        ]);
        taskPanel.appendChild(head);
        taskPanel.appendChild(el('div', { class: 'simside__t', style: { marginTop: '14px' }, text: 'Running order' }));
      } else {
        taskPanel.appendChild(el('div', { class: 'simside__head' }, [
          el('span', { class: 'simside__t', text: 'Tasks — ' + mission.title }),
          coachBox.autoEl
        ]));
      }

      var list = el('div', { class: 'tasks' });
      var blocked = false;
      var lastPhase = null;
      mission.tasks.forEach(function (t, i) {
        var done = !!doneTasks[t.id];
        var lock = mission.ordered && blocked && !done;
        if (mission.ordered && !done) blocked = true;
        if (mission.phases && t.phase !== lastPhase) {
          lastPhase = t.phase;
          list.appendChild(el('div', { class: 'phasehead', text: mission.phases[t.phase - 1] }));
        }
        var label = (mission.ordered ? (i + 1) + '. ' : '') + t.label;
        var row = w.UI.taskRow({
          label: label,
          hint: lock ? '' : t.hint,
          spot: lock ? null : t.spot
        }, done, spotTask);
        if (lock) row.classList.add('is-lock');
        if (mission.rundown && t.phase === 2) {
          var cue = el('span', { class: 'cue mono', text: w.UI.fmtTime(t.at) });
          if (done && clock.hits[t.id] !== undefined) {
            var d = clock.hits[t.id] - t.at;
            var late = Math.abs(d) > RUNDOWN_WINDOW;
            cue.textContent = (late ? (d > 0 ? '+' : '') + Math.round(d) + 's' : 'on time');
            cue.classList.add(late ? 'is-late' : 'is-ontime');
          }
          row.insertBefore(cue, row.firstChild);
          row.classList.add('task--cued');
        }
        list.appendChild(row);
      });
      taskPanel.appendChild(list);
      if (mission.rundown) paintClock();

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

    /* "show me where" - open whatever palette or tab the task lives on,
       then pulse the control itself */
    function spotTask(t) {
      if (!t) return;
      if (t.pre) { try { t.pre(s); } catch (e) {} }
      render();
      setTimeout(function () {
        if (!w.UI.spotlight(spotRoot(), t.spot, { persist: coachBox.auto })) {
          w.UI.toast('That control is not on this screen yet - follow the hint first.', 'info');
        }
      }, 70);
    }

    function spotRoot() { return root.parentNode || root; }
    function currentTask() {
      for (var i = 0; i < mission.tasks.length; i++) {
        if (!doneTasks[mission.tasks[i].id]) return mission.tasks[i];
      }
      return null;
    }

    /* keeps the pinned instruction, and the highlight, on the step you are
       actually on - so you never have to hunt for the next control */
    var coachBusy = false;
    function applyCoach(force) {
      if (!ownsTasks) return;
      var t = currentTask();
      var idx = t ? mission.tasks.indexOf(t) : mission.tasks.length;
      var changed = coachBox.set(t, idx, mission.tasks.length);
      if (!t || !coachBox.auto) { if (!t) w.UI.spotlight(spotRoot(), null); return; }
      if (mission.rundown && t.phase === 2 && !clock.running && !clock.done) {
        coachBox.set({ id: 'wait', label: 'Setup done — press Start the show when you are ready.', hint: 'The clock only runs during the show itself.' }, idx, mission.tasks.length);
        w.UI.spotlight(spotRoot(), '.showclk .btn', { persist: true, quiet: true, scroll: false });
        return;
      }
      if ((changed || force) && !coachBusy) {
        coachBusy = true;
        if (t.pre) { try { t.pre(s); } catch (e) {} render(); }
        coachBusy = false;
        setTimeout(function () { w.UI.spotlight(spotRoot(), t.spot, { persist: true, quiet: true, scroll: false }); }, 60);
      } else {
        w.UI.spotlight(spotRoot(), t.spot, { persist: true, quiet: true, scroll: false });
      }
    }

    function checkTasks() {
      var blocked = false;
      var newly = [];
      for (var i = 0; i < mission.tasks.length; i++) {
        var t = mission.tasks[i];
        if (doneTasks[t.id]) continue;
        if (mission.ordered && blocked) break;
        /* the timed half does not start counting until you are rolling */
        if (mission.rundown && t.phase === 2 && !clock.running && !clock.done) { blocked = true; continue; }
        var ok = false;
        try { ok = !!t.check(s, m); } catch (e) { ok = false; }
        if (ok) { doneTasks[t.id] = true; newly.push(t); }
        else if (mission.ordered) blocked = true;
      }
      newly.forEach(function (t) {
        Sound.good();
        if (mission.rundown && t.phase === 2) {
          var when = clockNow();
          clock.hits[t.id] = when;
          var d = when - t.at;
          var late = Math.abs(d) > RUNDOWN_WINDOW;
          w.UI.toast((late ? '<b>' + (d > 0 ? 'Late.</b> ' : 'Early.</b> ') : '<b>On time.</b> ') + w.UI.esc(t.label),
            late ? 'bad' : 'ok', 2000);
        } else {
          w.UI.toast('<b>Done</b> &nbsp;' + w.UI.esc(t.label), 'ok', 2200);
        }
      });

      if (!finished && mission.tasks.length && mission.tasks.every(function (t) { return doneTasks[t.id]; })) {
        if (mission.rundown) {
          stopClock();
          clock.done = true;
          var cues = mission.tasks.filter(function (t) { return t.phase === 2; });
          var onTime = cues.filter(function (t) {
            return clock.hits[t.id] !== undefined && Math.abs(clock.hits[t.id] - t.at) <= RUNDOWN_WINDOW;
          }).length;
          var total = cues.length;
          var passed = onTime / total >= 0.8;
          renderTasks();
          setTimeout(function () {
            w.UI.modal({
              title: passed ? 'That is a show.' : 'You got through it.',
              body: el('div', {}, [
                el('p', { class: 'lede', style: { fontSize: '15px', marginBottom: '14px' },
                  text: onTime + ' of ' + total + ' cues in the right place, over ' + w.UI.fmtTime(clock.elapsed) + '.' }),
                el('p', { class: 'muted', style: { fontSize: '13.5px' },
                  text: passed
                    ? 'Every beat landed and the timing held. That is what directing a live show feels like.'
                    : 'A cue only counts as missed if you are more than two minutes off it. Run it again and follow the order.' })
              ]),
              actions: passed
                ? [{ label: 'Take the final exam →', class: 'btn--primary' }]
                : [{ label: 'Run it again', class: 'btn--primary', onClick: function () { location.reload(); } }]
            });
            if (passed && opts.onComplete) opts.onComplete();
          }, 500);
          finished = true;
          return;
        }
        finished = true;
        Sound.good();
        setTimeout(function () {
          w.UI.toast('<b>Level cleared.</b> Checked against real switcher state, not clicks.', 'brand', 4200);
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
      if (quiet) {
        if (s.tab === 'camera' && camRepaint) camRepaint();
        renderTasks();
        applyCoach();
        return;
      }
      render();
    }

    render();
    return { state: s, destroy: function () { stopClock(); clear(host); } };
  }

  w.SimATEM = { mount: mount, MISSIONS: MISSIONS, SRC: SRC, MEDIA_LIBRARY: MEDIA_LIBRARY, LOOK: LOOK };
})(window);
