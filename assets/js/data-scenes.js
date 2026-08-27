/* ============================================================
   magicianed - Ponder scenes
   Rules for every caption in this file:
     - one sentence, plain words, no jargon without a definition
     - never an acronym on its own; say what it stands for
     - if it needs a second sentence, it needs another beat
   Cables always start and end on a drawn socket, so they line up.
   ============================================================ */
(function (w) {
  'use strict';

  var ISO = [900, 470, 450, 250];
  var FLAT = [900, 470, 0, 0];

  /* put something at a screen position, in isometric world coordinates */
  function at(sx, sy) { return [sy + sx * 0.5774, sy - sx * 0.5774]; }

  /* the switcher box, with sockets on the two faces you can see.
     inputs live on the face pointing down-left, outputs down-right. */
  function unit(S, sx, sy, o) {
    o = o || {};
    var h = at(sx, sy), WD = 132, DP = 64, HT = 16;
    S.prism(h[0], h[1], 0, WD, DP, HT, {
      key: o.key || 'hd8', label: o.label || 'THE SWITCHER', small: true,
      accent: o.accent || 'var(--brand)', always: o.always
    });
    return {
      /* socket i on the input face */
      inp: function (i) { return [h[0] + 26 + i * 26, h[1] + DP, 8]; },
      /* socket i on the output face */
      out: function (i) { return [h[0] + WD, h[1] + 14 + i * 18, 8]; },
      x: h[0], y: h[1], WD: WD, DP: DP, HT: HT
    };
  }

  /* camera at a screen position; its output socket is on the lens side */
  function camAt(S, sx, sy, key, label, always) {
    var c = at(sx, sy);
    S.cam(c[0], c[1], 0, { key: key, label: label, always: always });
    return { sock: [c[0] + 26, c[1] + 9, 6], back: [c[0], c[1] + 9, 6], x: c[0], y: c[1] };
  }

  var SCENES = {

  /* ==========================================================
     1 - what the box is for
     ========================================================== */
  flow: {
    title: 'What this box is for',
    view: ISO,
    build: function (S) {
      var c1 = camAt(S, -258, -118, 'cam1', 'CAMERA 1');
      var c2 = camAt(S, -258, -26, 'cam2', 'CAMERA 2');
      var c3 = camAt(S, -258, 66, 'cam3', 'CAMERA 3');
      var u = unit(S, -76, 44);

      var p = at(212, -116), v = at(212, 20);
      S.screen(p[0], p[1], 0, 118, 66, { key: 'pgm', label: 'EVERYONE SEES THIS', accent: 'var(--pgm)' });
      S.screen(v[0], v[1], 0, 118, 66, { key: 'pvw', label: 'ONLY YOU SEE THIS', accent: 'var(--pvw)' });

      S.cable(c1.sock, u.inp(0), { key: 'w1', accent: 'var(--pvw)', sag: 18 });
      S.cable(c2.sock, u.inp(1), { key: 'w2', accent: 'var(--pvw)', sag: 14 });
      S.cable(c3.sock, u.inp(2), { key: 'w3', accent: 'var(--pvw)', sag: 10 });
      S.cable(u.out(0), [p[0], p[1], 30], { key: 'wp', accent: 'var(--pgm)', sag: 20 });
      S.cable(u.out(2), [v[0], v[1], 30], { key: 'wv', accent: 'var(--pvw)', sag: 16 });

      /* sockets drawn last so they sit on top of the cable ends */
      S.port(u.inp(0)[0], u.inp(0)[1], u.inp(0)[2], { key: 'w1', accent: 'var(--pvw)' });
      S.port(u.inp(1)[0], u.inp(1)[1], u.inp(1)[2], { key: 'w2', accent: 'var(--pvw)' });
      S.port(u.inp(2)[0], u.inp(2)[1], u.inp(2)[2], { key: 'w3', accent: 'var(--pvw)' });
      S.port(u.out(0)[0], u.out(0)[1], u.out(0)[2], { key: 'wp', accent: 'var(--pgm)' });
      S.port(u.out(2)[0], u.out(2)[1], u.out(2)[2], { key: 'wv', accent: 'var(--pvw)' });
    },
    beats: [
      { t: 'Three cameras are pointing at your show.', on: ['cam1', 'cam2', 'cam3'], ms: 2800 },
      { t: 'They all plug into one box, all the time.',
        on: ['hd8', 'w1', 'w2', 'w3'], flow: ['w1', 'w2', 'w3'], ms: 3400 },
      { t: 'Only one of them can go out to the audience at once.',
        on: ['pgm', 'wp'], hi: ['pgm'], flow: ['wp'], ms: 3600 },
      { t: 'The red screen is what everybody is watching right now.',
        hi: ['pgm', 'cam1:tally'], flow: ['wp'], ms: 3400 },
      { t: 'The green screen is the shot you are lining up. Nobody sees it yet.',
        on: ['pvw', 'wv'], hi: ['pvw'], flow: ['wv'], ms: 3800 },
      { t: 'Press one button and the two swap over. That is the whole job.',
        hi: ['pgm', 'pvw'], flow: ['wp', 'wv'], ms: 3800 },
      { t: 'A red lamp on the camera tells that operator they are the one on air.',
        hi: ['cam1:tally'], ms: 3800 }
    ]
  },

  /* ==========================================================
     2 - the sockets on the back
     ========================================================== */
  rear: {
    title: 'The sockets on the back',
    view: FLAT,
    build: function (S) {
      S.ui(40, 118, 820, 150, { key: 'body', r: 8, always: true });
      S.note(450, 96, 'the back of the switcher', { key: 'ttl', accent: 'var(--ink-4)', always: true });
      var g = function (x, wd, key, label, accent, sub) {
        S.ui(x, 148, wd, 58, { key: key, label: label, accent: accent, small: wd < 130 });
        S.note(x + wd / 2, 226, sub, { key: key + 'n', accent: accent });
      };
      g(58, 196, 'in', 'CAMERAS IN  × 8', 'var(--pvw)', 'pictures come in here');
      g(264, 196, 'out', 'BACK TO CAMERAS  × 8', 'var(--key)', 'one cable to each camera');
      g(470, 132, 'outs', 'SCREENS OUT', 'var(--pgm)', 'the show + your monitor');
      g(612, 104, 'audio', 'SOUND IN', 'var(--audio)', 'microphones, laptop');
      g(726, 60, 'eth', 'NETWORK', 'var(--info)', 'internet');
      g(796, 32, 'usb', 'USB', 'var(--iso)', 'record');
      g(838, 22, 'pwr', '⏻', 'var(--ink-2)', 'power');
    },
    beats: [
      { t: 'Eight sockets take the picture from your cameras.', on: ['in', 'inn'], hi: ['in'], ms: 3200 },
      { t: 'The cable is called SDI. It screws on, so it cannot fall out mid-show.',
        hi: ['in'], ms: 3800 },
      { t: 'Eight more sockets send a picture back the other way.', on: ['out', 'outn'], hi: ['out'], ms: 3400 },
      { t: 'One goes to each camera, so its operator can see what is on air.',
        hi: ['out'], ms: 3800 },
      { t: 'Then the outputs: the finished show, and a screen showing every camera at once.',
        on: ['outs', 'outsn'], hi: ['outs'], ms: 4000 },
      { t: 'Two sockets for microphones, and a pair for a laptop.',
        on: ['audio', 'audion'], hi: ['audio'], ms: 3200 },
      { t: 'Network sockets, for the internet when you want to stream.',
        on: ['eth', 'ethn'], hi: ['eth'], ms: 3400 },
      { t: 'A USB socket records the show onto a portable drive.',
        on: ['usb', 'usbn'], hi: ['usb'], ms: 3200 },
      { t: 'Two power sockets. Plug in both and one can fail without the show stopping.',
        on: ['pwr', 'pwrn'], hi: ['pwr'], ms: 4000 }
    ]
  },

  /* ==========================================================
     3 - every camera needs two cables
     ========================================================== */
  loop: {
    title: 'Every camera needs two cables',
    view: ISO,
    build: function (S) {
      var c = camAt(S, -238, -34, 'cam', 'CAMERA 1', true);
      var u = unit(S, 10, 62, { always: true });
      var pIn = u.inp(0), pOut = [u.x + 8, u.y + u.DP, 8];

      S.cable(c.sock, pIn, { key: 'wIn', accent: 'var(--pvw)', sag: 22 });
      S.cable(pOut, c.back, { key: 'wRet', accent: 'var(--key)', sag: 66 });
      S.port(pIn[0], pIn[1], pIn[2], { key: 'wIn', accent: 'var(--pvw)' });
      S.port(pOut[0], pOut[1], pOut[2], { key: 'wRet', accent: 'var(--key)' });
      S.port(c.sock[0], c.sock[1], c.sock[2], { key: 'wIn', accent: 'var(--pvw)' });
      S.port(c.back[0], c.back[1], c.back[2], { key: 'wRet', accent: 'var(--key)' });

      S.note(-224, -132, 'cable 1  —  picture out', { key: 'lIn', accent: 'var(--pvw)' });
      S.note(-70, 186, 'cable 2  —  picture back', { key: 'lRet', accent: 'var(--key)' });
      var m = at(228, -74);
      S.screen(m[0], m[1], 0, 96, 56, { key: 'vf', label: 'WHAT THE OPERATOR SEES', accent: 'var(--pgm)' });
    },
    beats: [
      { t: 'One cable carries the picture from the camera into the switcher.',
        on: ['wIn', 'lIn'], hi: ['wIn'], flow: ['wIn'], ms: 3600 },
      { t: 'Now the one everybody forgets: a second cable, going back the other way.',
        on: ['wRet', 'lRet'], hi: ['wRet'], flow: ['wRet'], ms: 4200 },
      { t: 'It shows the camera operator what is going out, in their eyepiece.',
        on: ['vf'], hi: ['vf'], flow: ['wRet'], ms: 3800 },
      { t: 'It lights the red lamp on top when that camera is the live one.',
        hi: ['cam:tally'], flow: ['wRet'], ms: 3800 },
      { t: 'And it lets you change that camera’s brightness and colour from here.',
        hi: ['wRet'], flow: ['wRet'], ms: 3800 },
      { t: 'Camera 3 into socket 3, and socket 3 back to camera 3. Keep the numbers together.',
        hi: ['wIn', 'wRet'], flow: ['wIn', 'wRet'], ms: 4400 }
    ]
  },

  /* ==========================================================
     4 - one picture format
     ========================================================== */
  standard: {
    title: 'Everything has to be the same format',
    view: FLAT,
    build: function (S) {
      S.ui(330, 188, 246, 92, { key: 'sw', label: 'SWITCHER  ·  1080p50', accent: 'var(--brand)', always: true });
      S.ui(60, 68, 206, 62, { key: 'c1', label: 'CAMERA 1   1080p50', accent: 'var(--pvw)' });
      S.ui(60, 202, 206, 62, { key: 'c2', label: 'CAMERA 2   1080p50', accent: 'var(--pvw)' });
      S.ui(60, 336, 206, 62, { key: 'c3', label: 'CAMERA 3   1080i50', accent: 'var(--pgm)' });
      S.ui(60, 336, 206, 62, { key: 'c3ok', label: 'CAMERA 3   1080p50', accent: 'var(--pvw)' });
      S.arrow(272, 99, 326, 198, { key: 'a1', accent: 'var(--pvw)' });
      S.arrow(272, 233, 326, 233, { key: 'a2', accent: 'var(--pvw)' });
      S.arrow(272, 367, 326, 272, { key: 'a3', accent: 'var(--pgm)' });
      S.arrow(272, 367, 326, 272, { key: 'a3ok', accent: 'var(--pvw)' });
      S.ui(646, 98, 194, 62, { key: 'in1', label: 'INPUT 1   picture', accent: 'var(--pvw)' });
      S.ui(646, 202, 194, 62, { key: 'in2', label: 'INPUT 2   picture', accent: 'var(--pvw)' });
      S.ui(646, 306, 194, 62, { key: 'in3', label: 'INPUT 3   nothing', accent: 'var(--pgm)' });
      S.ui(646, 306, 194, 62, { key: 'in3ok', label: 'INPUT 3   picture', accent: 'var(--pvw)' });
      S.arrow(582, 129, 642, 129, { key: 'b1', accent: 'var(--pvw)' });
      S.arrow(582, 233, 642, 233, { key: 'b2', accent: 'var(--pvw)' });
      S.arrow(582, 337, 642, 337, { key: 'b3', accent: 'var(--pgm)' });
      S.note(450, 440, 'choose the format before you do anything else', { key: 'foot', accent: 'var(--audio)' });
    },
    beats: [
      { t: 'The switcher works in one picture format, and only one.', on: ['sw'], hi: ['sw'], ms: 3400 },
      { t: 'A format is the size and the speed of the picture, written like 1080p50.',
        hi: ['sw'], ms: 4000 },
      { t: '1080 is how tall the picture is. 50 is how many pictures every second.',
        hi: ['sw'], ms: 4000 },
      { t: 'These two cameras are set to exactly that, so they turn up.',
        on: ['c1', 'c2', 'a1', 'a2', 'in1', 'in2', 'b1', 'b2'], hi: ['in1', 'in2'], ms: 3800 },
      { t: 'This one says 1080i50. One letter different, and it does not count.',
        on: ['c3', 'a3'], hi: ['c3'], ms: 4000 },
      { t: 'So that input shows nothing at all. No warning, no explanation.',
        on: ['in3', 'b3'], hi: ['in3'], ms: 3800 },
      { t: 'Change the camera to match, and the picture appears.',
        off: ['c3', 'in3', 'a3'], on: ['c3ok', 'in3ok', 'a3ok'], hi: ['in3ok', 'c3ok'], ms: 3600 },
      { t: 'Change the format mid-show and every camera drops out. So do it first.',
        on: ['foot'], hi: ['sw'], ms: 4400 }
    ]
  },

  /* ==========================================================
     5 - the app
     ========================================================== */
  software: {
    title: 'The app on your computer',
    view: FLAT,
    build: function (S) {
      S.ui(60, 60, 780, 350, { key: 'win', r: 8, always: true });
      S.note(450, 44, 'ATEM SOFTWARE CONTROL  —  free from Blackmagic', { key: 'wt', accent: 'var(--ink-4)', always: true });
      S.ui(90, 84, 170, 34, { key: 'tSw', label: 'Switcher', accent: 'var(--brand)' });
      S.ui(268, 84, 170, 34, { key: 'tMe', label: 'Media', accent: 'var(--key)' });
      S.ui(446, 84, 170, 34, { key: 'tAu', label: 'Audio', accent: 'var(--audio)' });
      S.ui(624, 84, 170, 34, { key: 'tCa', label: 'Camera', accent: 'var(--pvw)' });

      S.ui(90, 140, 500, 46, { key: 'pgmRow', label: 'ON AIR      1  2  3  4  5  6  7  8', accent: 'var(--pgm)' });
      S.ui(90, 196, 500, 46, { key: 'pvwRow', label: 'NEXT UP     1  2  3  4  5  6  7  8', accent: 'var(--pvw)' });
      S.ui(90, 256, 240, 46, { key: 'trans', label: 'how to change shot', accent: 'var(--info)' });
      S.ui(340, 256, 120, 46, { key: 'cut', label: 'AUTO / CUT', accent: 'var(--pgm)' });
      S.ui(470, 256, 120, 46, { key: 'fader', label: 'slider', accent: 'var(--info)' });
      S.ui(90, 316, 500, 46, { key: 'dsk', label: 'graphics on / off        fade to black', accent: 'var(--brand)' });
      S.ui(614, 140, 200, 222, { key: 'pals', label: 'everything else', accent: 'var(--ink-2)' });

      S.ui(90, 140, 724, 222, { key: 'media', label: 'pictures you want on screen', accent: 'var(--key)' });
      S.ui(90, 140, 724, 222, { key: 'audio', label: 'one column per microphone or camera', accent: 'var(--audio)' });
      S.ui(90, 140, 724, 222, { key: 'cams', label: 'brightness and colour, camera by camera', accent: 'var(--pvw)' });
    },
    beats: [
      { t: 'The app is free from Blackmagic, and it has four pages across the top.',
        on: ['tSw', 'tMe', 'tAu', 'tCa'], hi: ['tSw', 'tMe', 'tAu', 'tCa'], ms: 4000 },
      { t: 'Switcher is the page you live on during a show.',
        on: ['pgmRow', 'pvwRow', 'trans', 'cut', 'fader', 'dsk', 'pals'], hi: ['tSw'], ms: 3400 },
      { t: 'Top row is what is going out. Bottom row is what you have lined up next.',
        hi: ['pgmRow', 'pvwRow'], ms: 4000 },
      { t: 'Media is where you put pictures you want on screen, like a name strip.',
        off: ['pgmRow', 'pvwRow', 'trans', 'cut', 'fader', 'dsk', 'pals'], on: ['media'], hi: ['tMe', 'media'], ms: 4000 },
      { t: 'Audio gives every microphone and camera its own column of controls.',
        off: ['media'], on: ['audio'], hi: ['tAu', 'audio'], ms: 3800 },
      { t: 'Camera changes each camera’s brightness and colour, without leaving your seat.',
        off: ['audio'], on: ['cams'], hi: ['tCa', 'cams'], ms: 4000 },
      { t: 'The switcher remembers all of it by itself. Shut the laptop and the show carries on.',
        off: ['cams'], hi: ['win'], ms: 4400 }
    ]
  },

  /* ==========================================================
     6 - three ways to change shot
     ========================================================== */
  take: {
    title: 'Three ways to change shot',
    view: FLAT,
    build: function (S) {
      S.ui(60, 60, 380, 150, { key: 'monP', label: 'ON AIR   CAMERA 1', accent: 'var(--pgm)', always: true });
      S.ui(60, 60, 380, 150, { key: 'monP2', label: 'ON AIR   CAMERA 2', accent: 'var(--pgm)' });
      S.ui(60, 60, 380, 150, { key: 'monMix', label: 'ON AIR   BOTH AT ONCE', accent: 'var(--audio)' });
      S.ui(60, 60, 380, 150, { key: 'monBlk', label: 'BLACK — no picture, no sound', accent: 'var(--ink-2)' });
      S.ui(470, 60, 370, 150, { key: 'monV', label: 'NEXT UP   CAMERA 2', accent: 'var(--pvw)', always: true });

      S.ui(60, 250, 170, 56, { key: 'bCut', label: 'CUT', accent: 'var(--pgm)', always: true });
      S.ui(250, 250, 170, 56, { key: 'bAuto', label: 'AUTO', accent: 'var(--info)', always: true });
      S.ui(440, 250, 170, 56, { key: 'bFade', label: 'THE SLIDER', accent: 'var(--info)', always: true });
      S.ui(630, 250, 170, 56, { key: 'bFtb', label: 'FTB', accent: 'var(--pgm)', always: true });
      S.note(450, 352, 'instant — no fade at all — and what you will use most', { key: 'nCut', accent: 'var(--pgm)' });
      S.note(450, 352, 'fades across, over a length you choose', { key: 'nAuto', accent: 'var(--info)' });
      S.note(450, 352, 'the same fade, but by hand, at your own speed', { key: 'nFade', accent: 'var(--info)' });
      S.note(450, 352, 'FTB is short for Fade To Black — your emergency stop', { key: 'nFtb', accent: 'var(--pgm)' });
      S.note(450, 394, 'leave the slider halfway and both shots stay on screen', { key: 'warn', accent: 'var(--audio)' });
    },
    beats: [
      { t: 'First you line up the shot you want next.', hi: ['monV'], ms: 3000 },
      { t: 'CUT swaps to it instantly. You will use this nearly every time.',
        on: ['nCut', 'monP2'], hi: ['bCut', 'monP2'], ms: 4000 },
      { t: 'AUTO fades from one shot to the other over a length you set.',
        off: ['nCut'], on: ['nAuto'], hi: ['bAuto'], ms: 3800 },
      { t: 'The tall slider does the same fade, but by hand at your own speed.',
        off: ['nAuto'], on: ['nFade', 'monMix'], hi: ['bFade', 'monMix'], ms: 4000 },
      { t: 'Stop it halfway and both shots stay on screen. It does not spring back.',
        on: ['warn'], hi: ['monMix'], ms: 4000 },
      { t: 'FTB is short for Fade To Black. Picture and sound, gone. Your emergency stop.',
        off: ['nFade', 'warn', 'monMix'], on: ['nFtb', 'monBlk'], hi: ['bFtb', 'monBlk'], ms: 4400 }
    ]
  },

  /* ==========================================================
     7 - what sits in front of what
     ========================================================== */
  layers: {
    title: 'What sits in front of what',
    view: ISO,
    build: function (S) {
      var b = at(-30, 30);
      var lvl = function (z, key, label, accent) {
        S.plate(b[0], b[1], z, 158, 158, { key: key, label: label, accent: accent });
      };
      lvl(0, 'bg', 'the camera that is live', 'var(--ink-2)');
      lvl(44, 'usk', 'green screen removed', 'var(--key)');
      lvl(88, 'tr', 'the change of shot', 'var(--info)');
      lvl(132, 'dsk', 'name strip and logo', 'var(--brand)');
      lvl(176, 'ftb', 'fade to black', 'var(--pgm)');
      lvl(220, 'out', 'what goes out', 'var(--pgm)');
      S.note(300, -172, 'last', { key: 'nTop', accent: 'var(--ink-4)' });
      S.note(300, 152, 'first', { key: 'nBot', accent: 'var(--ink-4)' });
    },
    beats: [
      { t: 'At the bottom is the shot from whichever camera is live.',
        on: ['bg', 'nBot'], hi: ['bg'], ms: 3600 },
      { t: 'On top of that go the early effects — like cutting out a green screen.',
        on: ['usk'], hi: ['usk'], ms: 3800 },
      { t: 'The change from one shot to the next happens at this level.',
        on: ['tr'], hi: ['tr'], ms: 3600 },
      { t: 'The name strip and the logo go above that.',
        on: ['dsk'], hi: ['dsk'], ms: 3200 },
      { t: 'So the name strip stays still while the camera underneath changes.',
        hi: ['dsk', 'bg'], ms: 4000 },
      { t: 'Fade to black is above everything. Nothing gets past it.',
        on: ['ftb', 'out', 'nTop'], hi: ['ftb'], ms: 3600 }
    ]
  },

  /* ==========================================================
     8 - a name strip on screen
     ========================================================== */
  media: {
    title: 'Getting a name on screen',
    view: FLAT,
    build: function (S) {
      S.ui(40, 178, 148, 86, { key: 'file', label: 'name-strip.png', accent: 'var(--key)' });
      S.note(114, 288, 'on your computer', { key: 'fileN', accent: 'var(--ink-4)' });
      S.ui(238, 178, 148, 86, { key: 'slot', label: 'SLOT 1', accent: 'var(--key)' });
      S.note(312, 288, 'now inside the switcher', { key: 'slotN', accent: 'var(--ink-4)' });
      S.ui(436, 178, 148, 86, { key: 'mp', label: 'PLAYER 1', accent: 'var(--key)' });
      S.ui(634, 178, 148, 86, { key: 'dsk', label: 'GRAPHIC LAYER', accent: 'var(--brand)' });
      S.note(708, 288, 'sits over the camera', { key: 'dskN', accent: 'var(--ink-4)' });
      S.ui(634, 58, 206, 86, { key: 'air', label: 'ON SCREEN', accent: 'var(--pgm)' });
      S.arrow(194, 221, 232, 221, { key: 'a1', accent: 'var(--key)' });
      S.arrow(392, 221, 430, 221, { key: 'a2', accent: 'var(--key)' });
      S.arrow(590, 221, 628, 221, { key: 'a3', accent: 'var(--brand)' });
      S.arrow(737, 172, 737, 148, { key: 'a4', accent: 'var(--pgm)' });
      S.note(450, 402, 'load your graphics before the audience arrives, not during the show', { key: 'foot', accent: 'var(--audio)' });
    },
    beats: [
      { t: 'Make the picture 1920 by 1080 — the same size as your show.',
        on: ['file', 'fileN'], hi: ['file'], ms: 3800 },
      { t: 'Save it as a PNG, so the empty part around the text stays see-through.',
        hi: ['file'], ms: 4000 },
      { t: 'Drag it into a slot. It copies into the switcher’s own memory.',
        on: ['slot', 'a1', 'slotN'], hi: ['slot'], ms: 4000 },
      { t: 'You can unplug your laptop now. The switcher still has the picture.',
        hi: ['slot'], ms: 3600 },
      { t: 'Point Player 1 at that slot. A player is just a slot you can put on screen.',
        on: ['mp', 'a2'], hi: ['mp'], ms: 4200 },
      { t: 'Hand the player to the graphic layer, and switch on Pre Multiplied Key.',
        on: ['dsk', 'a3', 'dskN'], hi: ['dsk'], ms: 4200 },
      { t: 'That one tick stops a black outline appearing around your text.',
        hi: ['dskN'], ms: 3800 },
      { t: 'Now put it on screen. It sits over whichever camera you cut to.',
        on: ['air', 'a4', 'foot'], hi: ['air'], ms: 4000 }
    ]
  },

  /* ==========================================================
     9 - which microphones are heard
     ========================================================== */
  audio: {
    title: 'Which microphones people hear',
    view: FLAT,
    build: function (S) {
      S.ui(60, 58, 340, 68, { key: 'pgm1', label: 'ON AIR   CAMERA 1', accent: 'var(--pgm)', always: true });
      S.ui(60, 58, 340, 68, { key: 'pgm2', label: 'ON AIR   AUDIENCE CAMERA', accent: 'var(--pgm)' });

      var strip = function (x, key, name, state, accent) {
        S.ui(x, 176, 230, 58, { key: key, label: name, accent: accent });
        S.ui(x, 244, 230, 44, { key: key + 'b', label: state, accent: accent });
      };
      strip(60, 'mic', 'PRESENTER MIC', 'ON', 'var(--pvw)');
      strip(330, 'aud', 'AUDIENCE CAMERA', 'AFV', 'var(--info)');
      strip(600, 'grn', 'GREEN SCREEN CAMERA', 'OFF', 'var(--ink-2)');

      S.note(175, 322, 'heard all the time', { key: 'micN', accent: 'var(--pvw)' });
      S.note(445, 322, 'heard only when it is on air', { key: 'audN', accent: 'var(--info)' });
      S.note(715, 322, 'never heard', { key: 'grnN', accent: 'var(--ink-4)' });
      S.note(450, 386, 'watch the bar beside each one — keep the loudest moments off the top', { key: 'lvl', accent: 'var(--audio)' });
      S.note(450, 428, 'do not set every camera to AFV, or each cut changes the sound of the room', { key: 'trap', accent: 'var(--pgm)' });
    },
    beats: [
      { t: 'Every microphone and camera has three buttons: ON, AFV and OFF.',
        on: ['mic', 'micb', 'aud', 'audb', 'grn', 'grnb'], hi: ['micb', 'audb', 'grnb'], ms: 4200 },
      { t: 'ON means heard all the time, whichever camera is live.',
        on: ['micN'], hi: ['mic', 'micb'], ms: 3600 },
      { t: 'The presenter’s microphone should be ON. They talk over every shot.',
        hi: ['mic'], ms: 3800 },
      { t: 'AFV is short for Audio Follows Video.',
        hi: ['audb'], ms: 3000 },
      { t: 'It means that source is only heard while its camera is on screen.',
        on: ['audN', 'pgm2'], hi: ['audb', 'pgm2'], ms: 4000 },
      { t: 'OFF means never heard — good for a camera with a useless built-in microphone.',
        on: ['grnN'], hi: ['grn', 'grnb'], ms: 4200 },
      { t: 'Keep the loudest moments off the top of the bar, or the sound breaks up.',
        on: ['lvl', 'trap'], hi: ['lvl'], ms: 4200 }
    ]
  },

  /* ==========================================================
     10 - matching two cameras
     ========================================================== */
  match: {
    title: 'Making two cameras look alike',
    view: FLAT,
    build: function (S) {
      S.ui(70, 68, 340, 168, { key: 'c1', label: 'CAMERA 1', accent: 'var(--pvw)', always: true });
      S.ui(490, 68, 340, 168, { key: 'c2bad', label: 'CAMERA 2 — darker and bluer', accent: 'var(--pgm)' });
      S.ui(490, 68, 340, 168, { key: 'c2ok', label: 'CAMERA 2 — matched', accent: 'var(--pvw)' });

      var row = function (y, key, label, accent) { S.ui(210, y, 480, 44, { key: key, label: label, accent: accent }); };
      row(276, 'wb', '1.  COLOUR TEMPERATURE   same number on both, never automatic', 'var(--info)');
      row(330, 'blk', '2.  BLACK LEVEL   so the dark parts match', 'var(--brand)');
      row(384, 'iris', '3.  IRIS   how much light the lens lets in', 'var(--audio)');
      S.note(450, 448, 'you do all of this from the switcher, over the cable you already ran', { key: 'foot', accent: 'var(--key)' });
    },
    beats: [
      { t: 'The second camera looks darker and bluer than the first.', on: ['c2bad'], hi: ['c2bad'], ms: 3400 },
      { t: 'Start with colour temperature — how warm or cold the picture looks.',
        on: ['wb'], hi: ['wb'], ms: 3800 },
      { t: 'Set both cameras to the same number by hand. Never leave it on automatic.',
        hi: ['wb'], ms: 4000 },
      { t: 'Then black level, so the dark parts of both pictures are equally dark.',
        on: ['blk'], hi: ['blk'], ms: 4000 },
      { t: 'Then the iris — how much light the lens lets in — until they are equally bright.',
        on: ['iris'], hi: ['iris'], ms: 4200 },
      { t: 'Now they cut together without the picture jumping.',
        off: ['c2bad'], on: ['c2ok', 'foot'], hi: ['c1', 'c2ok'], ms: 3800 }
    ]
  },

  /* ==========================================================
     11 - streaming and recording
     ========================================================== */
  out: {
    title: 'Sending it out, and keeping a copy',
    view: ISO,
    build: function (S) {
      var u = unit(S, -150, 44, { always: true });
      var r = at(88, -54);
      S.prism(r[0], r[1], 0, 72, 46, 13, { key: 'router', label: 'ROUTER', small: true, accent: 'var(--info)' });
      var cl = at(276, -156);
      S.screen(cl[0], cl[1], 0, 112, 62, { key: 'cloud', label: 'YOUTUBE', accent: 'var(--iso)' });
      var d = at(122, 150);
      S.prism(d[0], d[1], 0, 76, 48, 15, { key: 'ssd', label: 'DRIVE', small: true, accent: 'var(--iso)' });

      var pNet = u.out(0), pUsb = [u.x + 100, u.y + u.DP, 8];
      S.cable(pNet, [r[0], r[1] + 22, 7], { key: 'wNet', accent: 'var(--info)', sag: 16 });
      S.cable([r[0] + 72, r[1] + 22, 7], [cl[0] + 8, cl[1], 28], { key: 'wUp', accent: 'var(--iso)', sag: 18 });
      S.cable(pUsb, [d[0] + 12, d[1], 9], { key: 'wUsb', accent: 'var(--iso)', sag: 26 });
      S.port(pNet[0], pNet[1], pNet[2], { key: 'wNet', accent: 'var(--info)' });
      S.port(pUsb[0], pUsb[1], pUsb[2], { key: 'wUsb', accent: 'var(--iso)' });

      S.note(-160, 196, 'network cable', { key: 'nNet', accent: 'var(--info)' });
      S.note(158, 222, 'USB drive', { key: 'nUsb', accent: 'var(--iso)' });
    },
    beats: [
      { t: 'The switcher can stream on its own. No computer, no extra software.',
        hi: ['hd8'], ms: 4000 },
      { t: 'Run a network cable from the switcher to your internet router.',
        on: ['router', 'wNet', 'nNet'], hi: ['wNet'], flow: ['wNet'], ms: 3800 },
      { t: 'YouTube gives you a stream key — a long password. Paste it in and press ON AIR.',
        on: ['cloud', 'wUp'], hi: ['cloud'], flow: ['wNet', 'wUp'], ms: 4600 },
      { t: 'Check the venue’s upload speed first, and send at about half of it.',
        hi: ['wUp'], flow: ['wUp'], ms: 4000 },
      { t: 'A drive in the USB socket records the same show onto disk.',
        on: ['ssd', 'wUsb', 'nUsb'], hi: ['ssd'], flow: ['wUsb'], ms: 3800 },
      { t: 'Format that drive as exFAT, so a Windows PC and a Mac can both open it.',
        hi: ['ssd'], flow: ['wUsb'], ms: 4200 },
      { t: 'At the end: fade to black, stop the stream, then stop the recording.',
        hi: ['hd8'], ms: 4200 }
    ]
  },

  /* ==========================================================
     12 - the buttons on the box
     ========================================================== */
  panel: {
    title: 'Using the buttons on the box itself',
    view: FLAT,
    build: function (S) {
      S.ui(40, 100, 820, 260, { key: 'face', r: 8, always: true });
      S.note(450, 78, 'the front of the switcher', { key: 'ft', accent: 'var(--ink-4)', always: true });
      S.ui(70, 130, 300, 34, { key: 'lcds', label: 'CAM1  CAM2  CAM3  WIDE  GRN  VT  SLD  RVG  BLK  BAR', accent: 'var(--pvw)', small: true });
      S.ui(70, 176, 300, 44, { key: 'rowP', label: 'ON AIR    1 2 3 4 5 6 7 8 9 10', accent: 'var(--pgm)' });
      S.ui(70, 228, 300, 44, { key: 'rowV', label: 'NEXT UP   1 2 3 4 5 6 7 8 9 10', accent: 'var(--pvw)' });
      S.ui(70, 284, 140, 40, { key: 'shift', label: 'SHIFT', accent: 'var(--audio)' });
      S.ui(224, 284, 146, 40, { key: 'macro', label: 'MACROS', accent: 'var(--brand)' });
      S.ui(400, 176, 190, 44, { key: 'style', label: 'how to change shot', accent: 'var(--info)' });
      S.ui(400, 228, 90, 96, { key: 'auto', label: 'AUTO', accent: 'var(--info)' });
      S.ui(500, 228, 90, 96, { key: 'cut', label: 'CUT', accent: 'var(--pgm)' });
      S.ui(620, 176, 90, 148, { key: 'fader', label: 'SLIDER', accent: 'var(--info)' });
      S.ui(730, 176, 100, 100, { key: 'joy', label: 'JOYSTICK', accent: 'var(--brand)' });
      S.ui(730, 288, 100, 36, { key: 'rec', label: 'RECORD', accent: 'var(--pgm)' });
      S.note(450, 402, 'ten buttons, twenty things to choose from', { key: 'nShift', accent: 'var(--audio)' });
      S.note(450, 402, 'the little screens above say what each button is', { key: 'nLcd', accent: 'var(--pvw)' });
      S.note(450, 402, 'one press plays back a whole sequence you recorded earlier', { key: 'nMac', accent: 'var(--brand)' });
    },
    beats: [
      { t: 'Two rows of numbered buttons. Top row is live, bottom row is next.',
        on: ['rowP', 'rowV'], hi: ['rowP', 'rowV'], ms: 4000 },
      { t: 'There are ten buttons but twenty things you might want to pick.',
        on: ['shift', 'nShift'], hi: ['shift'], ms: 3800 },
      { t: 'Hold SHIFT and the same ten buttons become the other ten.',
        hi: ['shift'], ms: 3600 },
      { t: 'The little screens above them say what each button is right now.',
        off: ['nShift'], on: ['lcds', 'nLcd'], hi: ['lcds'], ms: 4000 },
      { t: 'Choose how you want to change shot, then press AUTO or CUT.',
        off: ['nLcd'], on: ['style', 'auto', 'cut'], hi: ['style', 'auto', 'cut'], ms: 3800 },
      { t: 'Or push the slider across yourself.', on: ['fader'], hi: ['fader'], ms: 3000 },
      { t: 'The joystick moves a small picture-in-picture box around the screen.',
        on: ['joy'], hi: ['joy'], ms: 3800 },
      { t: 'A macro button plays back a whole sequence you recorded earlier.',
        on: ['macro', 'rec', 'nMac'], hi: ['macro'], ms: 3800 }
    ]
  }
  };

  w.SCENES = SCENES;
})(window);
