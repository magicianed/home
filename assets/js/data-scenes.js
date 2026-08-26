/* ============================================================
   magicianed - Ponder scenes
   Each scene builds a stage once, then beats light parts of it up.
   Captions are hard-capped at roughly one line. If it needs a
   paragraph, it belongs in a simulation instead.
   ============================================================ */
(function (w) {
  'use strict';

  var ISO = [900, 470, 450, 250];
  var FLAT = [900, 470, 0, 0];

  /* place something at a screen position, in iso world coords */
  function at(sx, sy) { return [sy + sx * 0.5774, sy - sx * 0.5774]; }

  var SCENES = {

  /* ==========================================================
     1 - what a switcher does
     ========================================================== */
  flow: {
    title: 'One picture leaves the building',
    view: ISO,
    build: function (S) {
      var c1 = at(-250, -110), c2 = at(-250, -20), c3 = at(-250, 70);
      S.cam(c1[0], c1[1], 0, { key: 'cam1', label: 'CAM 1' });
      S.cam(c2[0], c2[1], 0, { key: 'cam2', label: 'CAM 2' });
      S.cam(c3[0], c3[1], 0, { key: 'cam3', label: 'CAM 3' });

      var h = at(-70, 40);
      S.prism(h[0], h[1], 0, 130, 62, 15, { key: 'hd8', label: 'ATEM TELEVISION STUDIO HD8', small: true, accent: 'var(--brand)' });

      var p = at(210, -110), v = at(210, 10);
      S.screen(p[0], p[1], 0, 120, 68, { key: 'pgm', label: 'PROGRAM', accent: 'var(--pgm)' });
      S.screen(v[0], v[1], 0, 120, 68, { key: 'pvw', label: 'PREVIEW', accent: 'var(--pvw)' });

      S.cable([c1[0] + 26, c1[1] + 9, 7], [h[0], h[1] + 20, 8], { key: 'w1', accent: 'var(--pvw)', sag: 16 });
      S.cable([c2[0] + 26, c2[1] + 9, 7], [h[0], h[1] + 31, 8], { key: 'w2', accent: 'var(--pvw)', sag: 12 });
      S.cable([c3[0] + 26, c3[1] + 9, 7], [h[0], h[1] + 42, 8], { key: 'w3', accent: 'var(--pvw)', sag: 8 });
      S.cable([h[0] + 130, h[1] + 20, 8], [p[0], p[1], 34], { key: 'wp', accent: 'var(--pgm)', sag: 18 });
      S.cable([h[0] + 130, h[1] + 44, 8], [v[0], v[1], 34], { key: 'wv', accent: 'var(--pvw)', sag: 14 });
    },
    beats: [
      { t: 'Eight cameras arrive at the switcher. All of them, all the time.',
        on: ['cam1', 'cam2', 'cam3', 'hd8', 'w1', 'w2', 'w3'], flow: ['w1', 'w2', 'w3'], ms: 3800 },
      { t: 'Exactly one of them leaves. That is the whole job.',
        on: ['pgm', 'wp'], hi: ['pgm'], flow: ['wp'], ms: 3600 },
      { t: 'Red is PROGRAM. Live, right now, no undo.',
        hi: ['pgm', 'cam1:tally'], flow: ['wp'], ms: 3400 },
      { t: 'Green is PREVIEW. What you are lining up next, seen by nobody.',
        on: ['pvw', 'wv'], hi: ['pvw'], flow: ['wv'], ms: 3800 },
      { t: 'Cut, and the two swap. That swap is the heartbeat of the show.',
        hi: ['pgm', 'pvw'], flow: ['wp', 'wv'], ms: 3800 },
      { t: 'The tally lamp tells the operator they are the one on air.',
        hi: ['cam1:tally'], ms: 3600 }
    ]
  },

  /* ==========================================================
     2 - the back panel
     ========================================================== */
  rear: {
    title: 'The back of the box',
    view: FLAT,
    build: function (S) {
      S.ui(40, 120, 820, 150, { key: 'body', r: 8, always: true });
      var g = function (x, wd, key, label, accent, sub) {
        S.ui(x, 150, wd, 58, { key: key, label: label, accent: accent, small: wd < 110 });
        S.note(x + wd / 2, 228, sub, { key: key + 'n', accent: accent });
      };
      g(58, 190, 'in', 'SDI IN  1 - 8', 'var(--pvw)', 'cameras + playback');
      g(258, 190, 'out', 'SDI OUT  1 - 8', 'var(--key)', 'one return per camera');
      g(458, 130, 'outs', 'PGM / AUX / MV', 'var(--pgm)', 'show + monitors');
      g(598, 100, 'audio', 'XLR / RCA', 'var(--audio)', 'mics + laptop');
      g(708, 62, 'eth', 'LAN', 'var(--info)', 'x4');
      g(780, 40, 'usb', 'USB', 'var(--iso)', 'rec');
      g(830, 12, 'pwr', '', 'var(--ink-2)', '');
      S.ui(826, 150, 26, 58, { key: 'pwr', label: '⏻', accent: 'var(--ink-2)' });
      S.note(839, 228, 'power', { key: 'pwrn', accent: 'var(--ink-2)' });
      S.note(450, 96, 'ATEM TELEVISION STUDIO HD8  ·  REAR', { key: 'ttl', accent: 'var(--ink-4)', always: true });
    },
    beats: [
      { t: 'Eight SDI inputs. Cameras and playback come in here.', on: ['in', 'inn'], hi: ['in'], ms: 3200 },
      { t: 'Eight SDI outputs. Not copies of the show - one return per camera.', on: ['out', 'outn'], hi: ['out'], ms: 3800 },
      { t: 'Program, two routable aux outputs, and multiview for your monitor.', on: ['outs', 'outsn'], hi: ['outs'], ms: 3800 },
      { t: 'Two XLRs for microphones, RCA for a laptop.', on: ['audio', 'audion'], hi: ['audio'], ms: 3200 },
      { t: 'Four ethernet ports - there is a network switch built into the box.', on: ['eth', 'ethn'], hi: ['eth'], ms: 3600 },
      { t: 'USB-C records the show straight to an SSD.', on: ['usb', 'usbn'], hi: ['usb'], ms: 3200 },
      { t: 'Mains and 12V DC. Wire both and power can fail without a reboot.', on: ['pwr', 'pwrn'], hi: ['pwr'], ms: 3800 }
    ]
  },

  /* ==========================================================
     3 - the wiring loop
     ========================================================== */
  loop: {
    title: 'Every camera is a loop',
    view: ISO,
    build: function (S) {
      var c = at(-230, -30);
      S.cam(c[0], c[1], 0, { key: 'cam', label: 'CAMERA 1', always: true });
      var h = at(20, 60);
      S.prism(h[0], h[1], 0, 130, 62, 15, { key: 'hd8', label: 'HD8', accent: 'var(--brand)', always: true });
      S.cable([c[0] + 26, c[1] + 6, 8], [h[0], h[1] + 16, 8], { key: 'wIn', accent: 'var(--pvw)', sag: 20 });
      S.cable([h[0] + 6, h[1] + 52, 8], [c[0] + 20, c[1] + 18, 4], { key: 'wRet', accent: 'var(--key)', sag: 58 });
      S.note(-215, -125, 'SDI OUT  →  IN 1', { key: 'lIn', accent: 'var(--pvw)' });
      S.note(-60, 175, 'OUT 1  →  CAMERA RETURN', { key: 'lRet', accent: 'var(--key)' });
      var m = at(215, -60);
      S.screen(m[0], m[1], 0, 96, 56, { key: 'vf', label: 'VIEWFINDER', accent: 'var(--pgm)' });
    },
    beats: [
      { t: 'One cable out of the camera, into SDI IN 1.', on: ['wIn', 'lIn'], hi: ['wIn'], flow: ['wIn'], ms: 3400 },
      { t: 'Now the cable everyone forgets: SDI OUT 1, back to the camera.', on: ['wRet', 'lRet'], hi: ['wRet'], flow: ['wRet'], ms: 4000 },
      { t: 'That return puts the live show in the operator’s viewfinder.', on: ['vf'], hi: ['vf'], flow: ['wRet'], ms: 3600 },
      { t: 'It carries tally, so the red light costs you no extra cable.', hi: ['cam:tally'], flow: ['wRet'], ms: 3600 },
      { t: 'And camera control - iris and colour, driven from the switcher.', hi: ['wRet'], flow: ['wRet'], ms: 3600 },
      { t: 'Keep the numbers matched. Camera 3 into IN 3, OUT 3 back to it.', hi: ['wIn', 'wRet'], flow: ['wIn', 'wRet'], ms: 4000 }
    ]
  },

  /* ==========================================================
     4 - video standard
     ========================================================== */
  standard: {
    title: 'One format, or nothing',
    view: FLAT,
    build: function (S) {
      S.ui(330, 190, 240, 90, { key: 'sw', label: 'SWITCHER  ·  1080p50', accent: 'var(--brand)', always: true });
      S.ui(60, 70, 200, 62, { key: 'c1', label: 'CAM 1   1080p50', accent: 'var(--pvw)' });
      S.ui(60, 204, 200, 62, { key: 'c2', label: 'CAM 2   1080p50', accent: 'var(--pvw)' });
      S.ui(60, 338, 200, 62, { key: 'c3', label: 'CAM 3   1080i50', accent: 'var(--pgm)' });
      S.ui(60, 338, 200, 62, { key: 'c3ok', label: 'CAM 3   1080p50', accent: 'var(--pvw)' });
      S.arrow(266, 101, 326, 200, { key: 'a1', accent: 'var(--pvw)' });
      S.arrow(266, 235, 326, 235, { key: 'a2', accent: 'var(--pvw)' });
      S.arrow(266, 369, 326, 270, { key: 'a3', accent: 'var(--pgm)' });
      S.arrow(266, 369, 326, 270, { key: 'a3ok', accent: 'var(--pvw)' });
      S.ui(640, 100, 200, 62, { key: 'in1', label: 'INPUT 1   OK', accent: 'var(--pvw)' });
      S.ui(640, 204, 200, 62, { key: 'in2', label: 'INPUT 2   OK', accent: 'var(--pvw)' });
      S.ui(640, 308, 200, 62, { key: 'in3', label: 'INPUT 3   NO SIGNAL', accent: 'var(--pgm)' });
      S.ui(640, 308, 200, 62, { key: 'in3ok', label: 'INPUT 3   OK', accent: 'var(--pvw)' });
      S.arrow(576, 131, 636, 131, { key: 'b1', accent: 'var(--pvw)' });
      S.arrow(576, 235, 636, 235, { key: 'b2', accent: 'var(--pvw)' });
      S.arrow(576, 339, 636, 339, { key: 'b3', accent: 'var(--pgm)' });
      S.note(450, 440, 'set the standard first, before anyone depends on the box', { key: 'foot', accent: 'var(--audio)' });
    },
    beats: [
      { t: 'The switcher runs one video standard for the whole system.', on: ['sw'], hi: ['sw'], ms: 3400 },
      { t: '50 Hz country? 1080p50. North America? 1080p59.94.', hi: ['sw'], ms: 3400 },
      { t: 'Two cameras match it, so they turn up.', on: ['c1', 'c2', 'a1', 'a2', 'in1', 'in2', 'b1', 'b2'], hi: ['in1', 'in2'], ms: 3600 },
      { t: 'Camera 3 is on 1080i50. Same numbers, different scan.', on: ['c3', 'a3'], hi: ['c3'], ms: 3600 },
      { t: 'So input 3 reads as nothing at all. There is no conversion.', on: ['in3', 'b3'], hi: ['in3'], ms: 3800 },
      { t: 'Fix the camera, and it appears.', off: ['c3', 'in3', 'a3'], on: ['c3ok', 'in3ok', 'a3ok'], hi: ['in3ok', 'c3ok'], ms: 3400 },
      { t: 'Change the standard mid-show and every input drops. Do it first.', on: ['foot'], hi: ['sw'], ms: 4200 }
    ]
  },

  /* ==========================================================
     5 - the software
     ========================================================== */
  software: {
    title: 'Four tabs, and that is it',
    view: FLAT,
    build: function (S) {
      S.ui(60, 60, 780, 350, { key: 'win', r: 8, always: true });
      S.note(450, 44, 'ATEM SOFTWARE CONTROL', { key: 'wt', accent: 'var(--ink-4)', always: true });
      S.ui(90, 84, 170, 34, { key: 'tSw', label: 'Switcher', accent: 'var(--brand)' });
      S.ui(268, 84, 170, 34, { key: 'tMe', label: 'Media', accent: 'var(--key)' });
      S.ui(446, 84, 170, 34, { key: 'tAu', label: 'Audio', accent: 'var(--audio)' });
      S.ui(624, 84, 170, 34, { key: 'tCa', label: 'Camera', accent: 'var(--pvw)' });

      S.ui(90, 140, 500, 46, { key: 'pgmRow', label: 'PROGRAM   1  2  3  4  5  6  7  8', accent: 'var(--pgm)' });
      S.ui(90, 196, 500, 46, { key: 'pvwRow', label: 'PREVIEW   1  2  3  4  5  6  7  8', accent: 'var(--pvw)' });
      S.ui(90, 256, 240, 46, { key: 'trans', label: 'MIX  DIP  WIPE  DVE', accent: 'var(--info)' });
      S.ui(340, 256, 120, 46, { key: 'cut', label: 'AUTO / CUT', accent: 'var(--pgm)' });
      S.ui(470, 256, 120, 46, { key: 'fader', label: 'FADER', accent: 'var(--info)' });
      S.ui(90, 316, 500, 46, { key: 'dsk', label: 'DSK 1     DSK 2     FTB', accent: 'var(--brand)' });
      S.ui(614, 140, 200, 222, { key: 'pals', label: 'PALETTES', accent: 'var(--ink-2)' });

      S.ui(90, 140, 724, 222, { key: 'media', label: 'MEDIA POOL   20 stills   2 clips', accent: 'var(--key)' });
      S.ui(90, 140, 724, 222, { key: 'audio', label: 'CHANNEL STRIPS   ON / AFV / OFF', accent: 'var(--audio)' });
      S.ui(90, 140, 724, 222, { key: 'cams', label: 'IRIS   BLACK   WHITE BALANCE   COLOUR', accent: 'var(--pvw)' });
    },
    beats: [
      { t: 'Four tabs. The same four on every ATEM ever made.',
        on: ['tSw', 'tMe', 'tAu', 'tCa'], hi: ['tSw', 'tMe', 'tAu', 'tCa'], ms: 3600 },
      { t: 'Switcher: the two buses, the transition, the keyers.',
        on: ['pgmRow', 'pvwRow', 'trans', 'cut', 'fader', 'dsk', 'pals'], hi: ['tSw'], ms: 3800 },
      { t: 'Everything deeper hides in the palettes down the right.',
        hi: ['pals'], ms: 3200 },
      { t: 'Media: graphics you have uploaded into the switcher itself.',
        off: ['pgmRow', 'pvwRow', 'trans', 'cut', 'fader', 'dsk', 'pals'], on: ['media'], hi: ['tMe', 'media'], ms: 3800 },
      { t: 'Audio: one strip per source, with a fader and three buttons.',
        off: ['media'], on: ['audio'], hi: ['tAu', 'audio'], ms: 3600 },
      { t: 'Camera: exposure and colour, sent back down the SDI return.',
        off: ['audio'], on: ['cams'], hi: ['tCa', 'cams'], ms: 3600 },
      { t: 'The switcher holds the state. Shut the laptop and the show carries on.',
        off: ['cams'], hi: ['win'], ms: 4200 }
    ]
  },

  /* ==========================================================
     6 - cut, auto, fader
     ========================================================== */
  take: {
    title: 'Three ways to take',
    view: FLAT,
    build: function (S) {
      S.ui(60, 60, 380, 150, { key: 'monP', label: 'PROGRAM   CAM 1', accent: 'var(--pgm)', always: true });
      S.ui(60, 60, 380, 150, { key: 'monP2', label: 'PROGRAM   CAM 2', accent: 'var(--pgm)' });
      S.ui(60, 60, 380, 150, { key: 'monMix', label: 'PROGRAM   50% MIX', accent: 'var(--audio)' });
      S.ui(60, 60, 380, 150, { key: 'monBlk', label: 'BLACK', accent: 'var(--ink-2)' });
      S.ui(470, 60, 370, 150, { key: 'monV', label: 'PREVIEW   CAM 2', accent: 'var(--pvw)', always: true });
      S.ui(470, 60, 370, 150, { key: 'monV2', label: 'PREVIEW   CAM 1', accent: 'var(--pvw)' });

      S.ui(60, 250, 170, 56, { key: 'bCut', label: 'CUT', accent: 'var(--pgm)', always: true });
      S.ui(250, 250, 170, 56, { key: 'bAuto', label: 'AUTO', accent: 'var(--info)', always: true });
      S.ui(440, 250, 170, 56, { key: 'bFade', label: 'FADER BAR', accent: 'var(--info)', always: true });
      S.ui(630, 250, 170, 56, { key: 'bFtb', label: 'FTB', accent: 'var(--pgm)', always: true });
      S.note(450, 350, '0 frames  ·  instant  ·  the default in live television', { key: 'nCut', accent: 'var(--pgm)' });
      S.note(450, 350, 'runs your transition over a set number of frames', { key: 'nAuto', accent: 'var(--info)' });
      S.note(450, 350, 'by hand, at your speed - and it does not spring back', { key: 'nFade', accent: 'var(--info)' });
      S.note(450, 350, 'video and audio to nothing, and it holds there', { key: 'nFtb', accent: 'var(--pgm)' });
      S.note(450, 392, 'walk away from a half-open fader and you broadcast a dissolve', { key: 'warn', accent: 'var(--audio)' });
    },
    beats: [
      { t: 'Line up what you want next on preview.', hi: ['monV'], ms: 3000 },
      { t: 'CUT is instant. Zero frames. Use it for almost everything.',
        on: ['nCut', 'monP2', 'monV2'], hi: ['bCut', 'monP2'], ms: 3800 },
      { t: 'AUTO runs the transition you armed, over the rate you set.',
        off: ['nCut'], on: ['nAuto'], hi: ['bAuto'], ms: 3600 },
      { t: 'The fader bar does the same thing, by hand, at your speed.',
        off: ['nAuto'], on: ['nFade', 'monMix'], hi: ['bFade', 'monMix'], ms: 3800 },
      { t: 'Stop halfway and both cameras stay on air. Forever.',
        on: ['warn'], hi: ['monMix'], ms: 3600 },
      { t: 'FTB takes video and audio to nothing. The emergency brake.',
        off: ['nFade', 'warn', 'monMix'], on: ['nFtb', 'monBlk'], hi: ['bFtb', 'monBlk'], ms: 3800 }
    ]
  },

  /* ==========================================================
     7 - the keyer stack
     ========================================================== */
  layers: {
    title: 'What sits on top of what',
    view: ISO,
    build: function (S) {
      var b = at(-30, 30);
      var lvl = function (z, key, label, accent) {
        S.plate(b[0], b[1], z, 155, 155, { key: key, label: label, accent: accent });
      };
      lvl(0, 'bg', 'BACKGROUND  ·  program bus', 'var(--ink-2)');
      lvl(44, 'usk', 'UPSTREAM KEY  ·  chroma', 'var(--key)');
      lvl(88, 'tr', 'TRANSITION', 'var(--info)');
      lvl(132, 'dsk', 'DOWNSTREAM KEY  ·  lower third', 'var(--brand)');
      lvl(176, 'ftb', 'FADE TO BLACK', 'var(--pgm)');
      lvl(220, 'out', 'PROGRAM OUT', 'var(--pgm)');
      S.note(300, -170, 'last thing before the output', { key: 'nTop', accent: 'var(--ink-4)' });
      S.note(300, 150, 'first thing in the chain', { key: 'nBot', accent: 'var(--ink-4)' });
    },
    beats: [
      { t: 'At the bottom, the background - whatever the program bus is showing.',
        on: ['bg', 'nBot'], hi: ['bg'], ms: 3800 },
      { t: 'Upstream keys stack on top. This is where a green screen is keyed.',
        on: ['usk'], hi: ['usk'], ms: 3800 },
      { t: 'The transition happens here, so upstream keys travel with it.',
        on: ['tr'], hi: ['tr'], ms: 3600 },
      { t: 'Downstream keys land above the transition.',
        on: ['dsk'], hi: ['dsk'], ms: 3200 },
      { t: 'Which is why a lower third holds while you cut cameras underneath.',
        hi: ['dsk', 'bg'], ms: 3800 },
      { t: 'Fade to black is last. Nothing survives it.',
        on: ['ftb', 'out', 'nTop'], hi: ['ftb'], ms: 3400 }
    ]
  },

  /* ==========================================================
     8 - graphics on air
     ========================================================== */
  media: {
    title: 'From your drive to on air',
    view: FLAT,
    build: function (S) {
      S.ui(40, 180, 140, 84, { key: 'file', label: 'LT_Host.png', accent: 'var(--key)' });
      S.note(110, 288, '1920 x 1080  ·  alpha', { key: 'fileN', accent: 'var(--ink-4)' });
      S.ui(230, 180, 140, 84, { key: 'slot', label: 'POOL SLOT 1', accent: 'var(--key)' });
      S.note(300, 288, 'lives inside the switcher', { key: 'slotN', accent: 'var(--ink-4)' });
      S.ui(420, 180, 140, 84, { key: 'mp', label: 'MEDIA PLAYER 1', accent: 'var(--key)' });
      S.ui(610, 180, 140, 84, { key: 'dsk', label: 'DSK 1', accent: 'var(--brand)' });
      S.note(680, 288, 'fill + key + pre-multiplied', { key: 'dskN', accent: 'var(--ink-4)' });
      S.ui(610, 60, 250, 84, { key: 'air', label: 'ON AIR', accent: 'var(--pgm)' });
      S.arrow(186, 222, 224, 222, { key: 'a1', accent: 'var(--key)' });
      S.arrow(376, 222, 414, 222, { key: 'a2', accent: 'var(--key)' });
      S.arrow(566, 222, 604, 222, { key: 'a3', accent: 'var(--brand)' });
      S.arrow(735, 174, 735, 150, { key: 'a4', accent: 'var(--pgm)' });
      S.note(450, 400, 'load everything before doors open - uploads are not instant', { key: 'foot', accent: 'var(--audio)' });
    },
    beats: [
      { t: 'Export at 1920 x 1080. PNG, with a real alpha channel.',
        on: ['file', 'fileN'], hi: ['file'], ms: 3600 },
      { t: 'Drag it into a pool slot. It uploads into the switcher’s own memory.',
        on: ['slot', 'a1', 'slotN'], hi: ['slot'], ms: 4000 },
      { t: 'Now unplug your laptop if you like. The graphic stays.',
        hi: ['slot'], ms: 3200 },
      { t: 'Point Media Player 1 at that slot.',
        on: ['mp', 'a2'], hi: ['mp'], ms: 3000 },
      { t: 'DSK 1: fill is the player, key is its alpha, tick Pre Multiplied.',
        on: ['dsk', 'a3', 'dskN'], hi: ['dsk'], ms: 4200 },
      { t: 'Miss that tick and you get a black halo round your text.',
        hi: ['dskN'], ms: 3400 },
      { t: 'ON AIR. It sits over whatever camera you cut to.',
        on: ['air', 'a4', 'foot'], hi: ['air'], ms: 3800 }
    ]
  },

  /* ==========================================================
     9 - audio states
     ========================================================== */
  audio: {
    title: 'ON, AFV, OFF',
    view: FLAT,
    build: function (S) {
      S.ui(60, 60, 340, 70, { key: 'pgm1', label: 'PROGRAM   CAM 1', accent: 'var(--pgm)', always: true });
      S.ui(60, 60, 340, 70, { key: 'pgm2', label: 'PROGRAM   AUDIENCE CAM', accent: 'var(--pgm)' });

      var strip = function (x, key, name, state, accent) {
        S.ui(x, 180, 230, 60, { key: key, label: name, accent: accent });
        S.ui(x, 250, 230, 44, { key: key + 'b', label: state, accent: accent });
      };
      strip(60, 'mic', 'HOST MIC', 'ON', 'var(--pvw)');
      strip(330, 'aud', 'AUDIENCE CAM', 'AFV', 'var(--info)');
      strip(600, 'grn', 'GREEN SCREEN CAM', 'OFF', 'var(--ink-2)');

      S.note(175, 330, 'always in the mix', { key: 'micN', accent: 'var(--pvw)' });
      S.note(445, 330, 'only when it is on air', { key: 'audN', accent: 'var(--info)' });
      S.note(715, 330, 'never', { key: 'grnN', accent: 'var(--ink-4)' });
      S.note(450, 400, 'peaks around -10, loudest moment at -6, and never zero', { key: 'lvl', accent: 'var(--audio)' });
      S.note(450, 436, 'AFV on every camera in one room = a pumping mess', { key: 'trap', accent: 'var(--pgm)' });
    },
    beats: [
      { t: 'The host must be heard whatever camera you are on. Set the mic ON.',
        on: ['mic', 'micb', 'micN'], hi: ['mic', 'micb'], ms: 4000 },
      { t: 'The audience camera should only be heard when it is live.',
        on: ['aud', 'audb'], hi: ['aud'], ms: 3400 },
      { t: 'AFV - audio follows video. It fades up with the cut.',
        on: ['audN', 'pgm2'], hi: ['audb', 'pgm2'], ms: 3800 },
      { t: 'The green screen camera has no useful microphone at all. OFF.',
        on: ['grn', 'grnb', 'grnN'], hi: ['grn', 'grnb'], ms: 3800 },
      { t: 'Do not put every camera on AFV - each cut then changes the room.',
        on: ['trap'], hi: ['trap'], ms: 4200 },
      { t: 'Aim for peaks near -10. Zero is not loud, it is broken.',
        on: ['lvl'], hi: ['lvl'], ms: 3800 }
    ]
  },

  /* ==========================================================
     10 - matching cameras
     ========================================================== */
  match: {
    title: 'Make them look like the same room',
    view: FLAT,
    build: function (S) {
      S.ui(70, 70, 340, 170, { key: 'c1', label: 'CAM 1', accent: 'var(--pvw)', always: true });
      S.ui(490, 70, 340, 170, { key: 'c2bad', label: 'CAM 2   dark + cold', accent: 'var(--pgm)' });
      S.ui(490, 70, 340, 170, { key: 'c2ok', label: 'CAM 2   matched', accent: 'var(--pvw)' });

      var row = function (y, key, label, accent) { S.ui(240, y, 420, 44, { key: key, label: label, accent: accent }); };
      row(280, 'wb', '1.  WHITE BALANCE   both to 3200K, never auto', 'var(--info)');
      row(334, 'blk', '2.  MASTER BLACK   so the shadows sit together', 'var(--brand)');
      row(388, 'iris', '3.  IRIS   until the exposure matches', 'var(--audio)');
      S.note(450, 452, 'all of it travels down the SDI return - no extra cable', { key: 'foot', accent: 'var(--key)' });
    },
    beats: [
      { t: 'Camera 2 is darker and colder than camera 1.', on: ['c2bad'], hi: ['c2bad'], ms: 3200 },
      { t: 'White balance first. Same number on both. Never auto.', on: ['wb'], hi: ['wb'], ms: 3400 },
      { t: 'Then black level - mismatched blacks are what the eye catches.', on: ['blk'], hi: ['blk'], ms: 3800 },
      { t: 'Then iris, until the exposure lines up.', on: ['iris'], hi: ['iris'], ms: 3200 },
      { t: 'Now they cut together without a jump.', off: ['c2bad'], on: ['c2ok'], hi: ['c1', 'c2ok'], ms: 3600 },
      { t: 'You did all of that from the switcher, down the return cable.', on: ['foot'], hi: ['foot'], ms: 3800 }
    ]
  },

  /* ==========================================================
     11 - stream and record
     ========================================================== */
  out: {
    title: 'Out to the world, and onto a disk',
    view: ISO,
    build: function (S) {
      var h = at(-140, 40);
      S.prism(h[0], h[1], 0, 130, 62, 15, { key: 'hd8', label: 'HD8', accent: 'var(--brand)', always: true });
      var r = at(90, -60);
      S.prism(r[0], r[1], 0, 70, 44, 12, { key: 'router', label: 'ROUTER', small: true, accent: 'var(--info)' });
      var cl = at(275, -150);
      S.screen(cl[0], cl[1], 0, 110, 62, { key: 'cloud', label: 'YOUTUBE', accent: 'var(--iso)' });
      var d = at(120, 140);
      S.prism(d[0], d[1], 0, 74, 46, 14, { key: 'ssd', label: 'SSD  exFAT', small: true, accent: 'var(--iso)' });

      S.cable([h[0] + 130, h[1] + 18, 8], [r[0], r[1] + 20, 6], { key: 'wNet', accent: 'var(--info)', sag: 14 });
      S.cable([r[0] + 70, r[1] + 20, 6], [cl[0] + 10, cl[1], 30], { key: 'wUp', accent: 'var(--iso)', sag: 16 });
      S.cable([h[0] + 100, h[1] + 62, 8], [d[0] + 10, d[1], 8], { key: 'wUsb', accent: 'var(--iso)', sag: 22 });
      S.note(-150, 195, 'ethernet', { key: 'nNet', accent: 'var(--info)' });
      S.note(150, 210, 'USB-C', { key: 'nUsb', accent: 'var(--iso)' });
    },
    beats: [
      { t: 'The streaming encoder is inside the box. No computer, no capture card.',
        hi: ['hd8'], ms: 4000 },
      { t: 'Ethernet out to the internet.', on: ['router', 'wNet', 'nNet'], hi: ['wNet'], flow: ['wNet'], ms: 3200 },
      { t: 'Paste a stream key from YouTube, press ON AIR, and you are live.',
        on: ['cloud', 'wUp'], hi: ['cloud'], flow: ['wNet', 'wUp'], ms: 4000 },
      { t: 'Test the real upload speed at the venue. Stream at about half of it.',
        hi: ['wUp'], flow: ['wUp'], ms: 4000 },
      { t: 'A USB-C SSD records the same show to disk.',
        on: ['ssd', 'wUsb', 'nUsb'], hi: ['ssd'], flow: ['wUsb'], ms: 3400 },
      { t: 'Format it exFAT so Windows and Mac can both read it afterwards.',
        hi: ['ssd'], flow: ['wUsb'], ms: 3800 },
      { t: 'End of show: fade to black, stop the stream, then stop the record.',
        hi: ['hd8'], ms: 4000 }
    ]
  },

  /* ==========================================================
     12 - the front panel
     ========================================================== */
  panel: {
    title: 'Hands on the box',
    view: FLAT,
    build: function (S) {
      S.ui(40, 100, 820, 260, { key: 'face', r: 8, always: true });
      S.note(450, 78, 'ATEM TELEVISION STUDIO HD8  ·  FRONT', { key: 'ft', accent: 'var(--ink-4)', always: true });
      S.ui(70, 130, 300, 34, { key: 'lcds', label: 'CAM1  CAM2  CAM3  WIDE  GRN  VT  SLD  RVG  BLK  BAR', accent: 'var(--pvw)', small: true });
      S.ui(70, 176, 300, 44, { key: 'rowP', label: 'PROGRAM   1 2 3 4 5 6 7 8 9 10', accent: 'var(--pgm)' });
      S.ui(70, 228, 300, 44, { key: 'rowV', label: 'PREVIEW   1 2 3 4 5 6 7 8 9 10', accent: 'var(--pvw)' });
      S.ui(70, 284, 140, 40, { key: 'shift', label: 'SHIFT', accent: 'var(--audio)' });
      S.ui(224, 284, 146, 40, { key: 'macro', label: 'MACROS 1-10', accent: 'var(--brand)' });
      S.ui(400, 176, 190, 44, { key: 'style', label: 'MIX DIP WIPE DVE', accent: 'var(--info)' });
      S.ui(400, 228, 90, 96, { key: 'auto', label: 'AUTO', accent: 'var(--info)' });
      S.ui(500, 228, 90, 96, { key: 'cut', label: 'CUT', accent: 'var(--pgm)' });
      S.ui(620, 176, 90, 148, { key: 'fader', label: 'FADER', accent: 'var(--info)' });
      S.ui(730, 176, 100, 100, { key: 'joy', label: 'JOYSTICK', accent: 'var(--brand)' });
      S.ui(730, 288, 100, 36, { key: 'rec', label: 'REC', accent: 'var(--pgm)' });
      S.note(450, 400, 'ten buttons, twenty sources - SHIFT reaches the second bank', { key: 'nShift', accent: 'var(--audio)' });
      S.note(450, 400, 'the little screens relabel themselves, so you never guess', { key: 'nLcd', accent: 'var(--pvw)' });
      S.note(450, 400, 'one button, a whole recorded sequence', { key: 'nMac', accent: 'var(--brand)' });
    },
    beats: [
      { t: 'Two rows of crosspoints. Red on top is program, green below is preview.',
        on: ['rowP', 'rowV'], hi: ['rowP', 'rowV'], ms: 4000 },
      { t: 'Ten buttons, twenty sources. SHIFT reaches the second bank.',
        on: ['shift', 'nShift'], hi: ['shift'], ms: 3800 },
      { t: 'The strip above relabels itself as your sources change.',
        off: ['nShift'], on: ['lcds', 'nLcd'], hi: ['lcds'], ms: 3800 },
      { t: 'Pick a transition type, then AUTO or CUT.',
        off: ['nLcd'], on: ['style', 'auto', 'cut'], hi: ['style', 'auto', 'cut'], ms: 3600 },
      { t: 'Or drive the fader bar yourself.', on: ['fader'], hi: ['fader'], ms: 3000 },
      { t: 'The joystick moves a picture-in-picture box around the screen.',
        on: ['joy'], hi: ['joy'], ms: 3600 },
      { t: 'Macros fire a whole show open from one press.',
        on: ['macro', 'rec', 'nMac'], hi: ['macro'], ms: 3600 }
    ]
  }
  };

  w.SCENES = SCENES;
})(window);
