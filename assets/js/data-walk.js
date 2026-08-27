/* ============================================================
   magicianed - Setup Walkthrough
   A manual you can step through. Same drawing kit as Ponder, but
   presented as numbered instructions with a diagram that builds
   up as you go. Chapters share one stage so the wiring literally
   accumulates in front of you.
   ============================================================ */
(function (w) {
  'use strict';

  var ISO = [900, 470, 450, 250];
  var FLAT = [900, 470, 0, 0];
  function at(sx, sy) { return [sy + sx * 0.5774, sy - sx * 0.5774]; }

  var CHAPTERS = [

  /* ==========================================================
     A - what is in the box
     ========================================================== */
  {
    id: 'box', title: 'Out of the box', view: FLAT,
    build: function (S) {
      S.ui(40, 52, 820, 366, { key: 'crate', r: 10, always: true });
      S.note(450, 36, 'everything in the carton, laid out', { key: 'ttl', accent: 'var(--ink-4)', always: true });

      S.ui(78, 96, 400, 96, { key: 'unit', label: 'THE SWITCHER', accent: 'var(--brand)' });
      S.note(278, 210, 'one rack unit tall — 44 mm', { key: 'unitN', accent: 'var(--ink-4)' });

      S.ui(516, 96, 150, 96, { key: 'psu', label: 'POWER LEAD', accent: 'var(--pgm)' });
      S.ui(686, 96, 138, 96, { key: 'ears', label: 'RACK EARS + SCREWS', accent: 'var(--ink-2)', small: true });

      S.ui(78, 244, 190, 96, { key: 'card', label: 'WARRANTY CARD', accent: 'var(--ink-2)', small: true });
      S.ui(292, 244, 190, 96, { key: 'nocable', label: 'NO VIDEO CABLES', accent: 'var(--audio)', small: true });
      S.note(387, 358, 'you have to buy these separately', { key: 'nocableN', accent: 'var(--audio)' });
      S.ui(506, 244, 318, 96, { key: 'note', label: 'NO SOFTWARE DISC — you download it', accent: 'var(--info)', small: true });
    },
    steps: [
      { t: 'Open the box and lay everything out before you plug anything in.',
        body: 'You are checking two things: that nothing is damaged, and that you know what is missing. Missing pieces are much easier to solve now than an hour before a show.',
        on: ['unit', 'unitN'], hi: ['unit'] },
      { t: 'The switcher itself is one rack unit tall — about 44 mm.',
        body: 'It is designed to screw into a standard 19-inch equipment rack, but it will sit happily on a desk too. It needs air at the front and back, so do not bury it.',
        hi: ['unit', 'unitN'] },
      { t: 'A mains lead, and the rack ears with their screws.',
        body: 'The rack ears are usually already fitted. If you are putting it on a desk you can leave them on; they do no harm.',
        on: ['psu', 'ears'], hi: ['psu', 'ears'] },
      { t: 'What is NOT in the box: any video cables.',
        body: 'You need one SDI cable per camera for the picture, and a second per camera for the return. For three cameras that is six cables. Buy proper 75-ohm SDI cable, not cheap aerial lead that happens to fit.',
        on: ['nocable', 'nocableN'], hi: ['nocable'] },
      { t: 'There is no software disc either — you download the app.',
        body: 'Go to blackmagicdesign.com, choose Support, and download "Blackmagic ATEM Switchers". It is free and it works on Windows and Mac. Do this before the day of the show.',
        on: ['note'], hi: ['note'] }
    ]
  },

  /* ==========================================================
     B - plugging it in
     ========================================================== */
  {
    id: 'wire', title: 'Plugging it in', view: ISO,
    build: function (S) {
      var h = at(-60, 60), WD = 132, DP = 64;
      S.prism(h[0], h[1], 0, WD, DP, 16, { key: 'unit', label: 'THE SWITCHER', small: true, accent: 'var(--brand)', always: true });
      var inp = function (i) { return [h[0] + 24 + i * 26, h[1] + DP, 8]; };
      var out = function (i) { return [h[0] + WD, h[1] + 12 + i * 17, 8]; };

      var c1 = at(-268, -128), c2 = at(-268, -46), c3 = at(-268, 36);
      S.cam(c1[0], c1[1], 0, { key: 'cam1', label: 'CAMERA 1' });
      S.cam(c2[0], c2[1], 0, { key: 'cam2', label: 'CAMERA 2' });
      S.cam(c3[0], c3[1], 0, { key: 'cam3', label: 'CAMERA 3' });
      var sock = function (c) { return [c[0] + 26, c[1] + 9, 6]; };
      var back = function (c) { return [c[0], c[1] + 9, 6]; };

      /* power first */
      var pw = at(-70, 236);
      S.prism(pw[0], pw[1], 0, 58, 38, 12, { key: 'mains', label: 'MAINS', small: true, accent: 'var(--pgm)' });
      S.cable([h[0] + 110, h[1] + DP, 6], [pw[0] + 20, pw[1], 8], { key: 'wPwr', accent: 'var(--pgm)', sag: 24 });

      S.cable(sock(c1), inp(0), { key: 'wIn1', accent: 'var(--pvw)', sag: 18 });
      S.cable(sock(c2), inp(1), { key: 'wIn2', accent: 'var(--pvw)', sag: 14 });
      S.cable(sock(c3), inp(2), { key: 'wIn3', accent: 'var(--pvw)', sag: 10 });
      S.cable([h[0] + 6, h[1] + DP, 8], back(c1), { key: 'wRet1', accent: 'var(--key)', sag: 74 });
      S.cable([h[0] + 14, h[1] + DP, 8], back(c2), { key: 'wRet2', accent: 'var(--key)', sag: 62 });
      S.cable([h[0] + 22, h[1] + DP, 8], back(c3), { key: 'wRet3', accent: 'var(--key)', sag: 50 });

      var mon = at(238, -142);
      S.screen(mon[0], mon[1], 0, 116, 64, { key: 'mon', label: 'YOUR MONITOR', accent: 'var(--info)' });
      S.cable(out(0), [mon[0], mon[1], 28], { key: 'wMon', accent: 'var(--info)', sag: 18 });

      var mic = at(214, 6);
      S.prism(mic[0], mic[1], 0, 54, 34, 10, { key: 'mic', label: 'MIC', small: true, accent: 'var(--audio)' });
      S.cable(out(3), [mic[0], mic[1] + 16, 6], { key: 'wMic', accent: 'var(--audio)', sag: 12 });

      var net = at(216, 116);
      S.prism(net[0], net[1], 0, 62, 38, 11, { key: 'net', label: 'ROUTER', small: true, accent: 'var(--info)' });
      S.cable(out(5), [net[0], net[1] + 18, 7], { key: 'wNet', accent: 'var(--info)', sag: 14 });

      var ssd = at(96, 224);
      S.prism(ssd[0], ssd[1], 0, 60, 38, 12, { key: 'ssd', label: 'DRIVE', small: true, accent: 'var(--iso)' });
      S.cable([h[0] + 84, h[1] + DP, 8], [ssd[0] + 10, ssd[1], 8], { key: 'wSsd', accent: 'var(--iso)', sag: 26 });

    },
    steps: [
      { t: 'Power first, before any cameras.',
        body: 'Plug the mains lead into the socket on the back and into the wall. There is no on/off switch — it starts as soon as it has power. If you have a second power source, use it: the two sockets work together, so losing one does not stop the show.',
        on: ['mains', 'wPwr'], hi: ['wPwr'], flow: ['wPwr'] },
      { t: 'Camera 1: picture cable out of the camera, into input 1.',
        body: 'The socket on the camera is usually marked SDI OUT. The socket on the switcher is marked SDI IN 1. Both ends twist and lock — turn the collar until it clicks so it cannot be pulled out.',
        on: ['cam1', 'wIn1'], hi: ['wIn1'], flow: ['wIn1'] },
      { t: 'Camera 1 again: a second cable from output 1 back to the camera.',
        body: 'This one runs from SDI OUT 1 on the switcher to the SDI IN socket on the camera. It gives the operator a picture of the live show in their eyepiece, lights their red lamp when they are on air, and lets you adjust their exposure from the switcher.',
        on: ['wRet1'], hi: ['wRet1'], flow: ['wRet1'] },
      { t: 'Now do exactly the same for cameras 2 and 3.',
        body: 'Camera 2 into input 2, output 2 back to camera 2. Camera 3 into input 3, output 3 back to camera 3. Keep the numbers matched or the red lamp will light on the wrong camera. Label both ends of every cable while you are here.',
        on: ['cam2', 'cam3', 'wIn2', 'wIn3', 'wRet2', 'wRet3'],
        hi: ['wIn2', 'wIn3', 'wRet2', 'wRet3'], flow: ['wIn2', 'wIn3', 'wRet2', 'wRet3'] },
      { t: 'Your own monitor goes on the multi-view output.',
        body: 'Use the HDMI socket marked MULTI VIEW into any TV or computer monitor. It shows every camera at once, plus what is on air and what is next. This is the screen you will actually direct from.',
        on: ['mon', 'wMon'], hi: ['wMon'], flow: ['wMon'] },
      { t: 'Microphones go into the XLR sockets.',
        body: 'The presenter’s microphone plugs into MIC 1. A laptop or music player uses the small red and white sockets instead. If your cameras have their own microphones, that sound already arrives down the picture cable — you do not need a separate lead.',
        on: ['mic', 'wMic'], hi: ['wMic'], flow: ['wMic'] },
      { t: 'A network cable from the switcher to your router.',
        body: 'Any of the four network sockets will do — they are all part of one small hub inside the box. You need this for two things: for your computer to talk to the switcher, and for streaming to the internet.',
        on: ['net', 'wNet'], hi: ['wNet'], flow: ['wNet'] },
      { t: 'Last, a drive in the USB socket if you want a recording.',
        body: 'Use a proper solid state drive, not a memory stick. Format it as exFAT so both Windows and Mac can read it afterwards. Check there is enough free space for the whole show before you start.',
        on: ['ssd', 'wSsd'], hi: ['wSsd'], flow: ['wSsd'] },
      { t: 'That is the rig. Every cable in, every cable labelled.',
        body: 'Walk round once and tug gently on each connector. A cable that is nearly in is worse than one that is out, because it will fail halfway through the show instead of now.',
        hi: ['unit'], flow: ['wIn1', 'wIn2', 'wIn3', 'wRet1', 'wRet2', 'wRet3', 'wMon', 'wNet'] }
    ]
  },

  /* ==========================================================
     C - first power-up and first stream
     ========================================================== */
  {
    id: 'first', title: 'First power-up, first stream', view: FLAT,
    build: function (S) {
      S.ui(60, 56, 780, 356, { key: 'win', r: 8, always: true });
      S.note(450, 40, 'on your computer', { key: 'wt', accent: 'var(--ink-4)', always: true });

      /* setup utility */
      S.ui(92, 88, 716, 40, { key: 'suTitle', label: 'Blackmagic ATEM Setup', accent: 'var(--info)' });
      S.ui(92, 144, 340, 66, { key: 'suFound', label: 'ATEM Television Studio HD8', accent: 'var(--pvw)' });
      S.ui(456, 144, 352, 66, { key: 'suFmt', label: 'Video format:  1080p50', accent: 'var(--brand)' });
      S.ui(92, 226, 716, 56, { key: 'suNet', label: 'Address:  192.168.10.240   Mask: 255.255.255.0   Gateway: 192.168.10.1', accent: 'var(--info)', small: true });
      S.ui(660, 300, 148, 46, { key: 'suSave', label: 'SAVE', accent: 'var(--pvw)' });

      /* software control */
      S.ui(92, 88, 716, 40, { key: 'scTitle', label: 'ATEM Software Control', accent: 'var(--brand)' });
      S.ui(92, 144, 716, 52, { key: 'scPgm', label: 'ON AIR      1   2   3   4   5   6   7   8', accent: 'var(--pgm)' });
      S.ui(92, 206, 716, 52, { key: 'scPvw', label: 'NEXT UP     1   2   3   4   5   6   7   8', accent: 'var(--pvw)' });
      S.ui(92, 272, 340, 46, { key: 'scAud', label: 'Audio page — set your levels', accent: 'var(--audio)' });
      S.ui(456, 272, 352, 46, { key: 'scStream', label: 'Stream key:  live-••••-••••-••••', accent: 'var(--iso)' });
      S.ui(456, 330, 352, 48, { key: 'scAir', label: 'ON AIR', accent: 'var(--iso)' });
      S.ui(92, 330, 340, 48, { key: 'scRec', label: 'RECORD', accent: 'var(--pgm)' });

      S.note(450, 440, 'the whole job, in the order you should do it', { key: 'foot', accent: 'var(--ink-4)' });
    },
    steps: [
      { t: 'Power up and watch the small screen on the front.',
        body: 'It takes about twenty seconds to start. When it settles it will show the picture format it is currently set to. If your cameras are already on, some inputs may show nothing — that is the next problem to fix, not a fault.',
        on: [] },
      { t: 'Install the app you downloaded, then open ATEM Setup.',
        body: 'ATEM Setup is the small utility that handles the settings you only change once. ATEM Software Control is the big app you use during a show. The one installer puts both on your computer.',
        on: ['suTitle'], hi: ['suTitle'] },
      { t: 'Your switcher should appear in the list. Click it.',
        body: 'If it does not appear, your computer and the switcher are on different networks. The quickest fix is a USB-C cable straight between them, which always works. If it appears but refuses to connect, the app and the switcher are on different versions — let Setup update it.',
        on: ['suFound'], hi: ['suFound'] },
      { t: 'Set the picture format. Do this before anything else.',
        body: 'In the UK, Europe and Australia use 1080p50. In North America and Japan use 1080p59.94. Then set every camera to exactly the same thing. Changing this later drops every camera and stops any recording, so get it right now.',
        on: ['suFmt'], hi: ['suFmt'] },
      { t: 'Give it a fixed address on your network, and a name.',
        body: 'A fixed address means the app always finds it in the same place. Pick something outside the range your router hands out automatically — 192.168.10.240 is a typical choice. The gateway is your router’s own address, and you need it for streaming.',
        on: ['suNet', 'suSave'], hi: ['suNet'] },
      { t: 'Save, then close Setup and open ATEM Software Control.',
        body: 'Saving makes the switcher renegotiate every input, so the pictures will blink. That is normal. From here on you should not need Setup again.',
        on: ['suSave'], hi: ['suSave'] },
      { t: 'Check every camera actually appears on your monitor.',
        body: 'Click each number along the bottom green row in turn and watch your multi-view. Any camera showing nothing is set to the wrong picture format, is unplugged, or is off. Fix it now, while nobody is watching.',
        off: ['suTitle', 'suFound', 'suFmt', 'suNet', 'suSave'],
        on: ['scTitle', 'scPgm', 'scPvw'], hi: ['scPvw'] },
      { t: 'Go to the Audio page and set your levels.',
        body: 'Put the presenter’s microphone on ON so it is heard on every shot. Put cameras on AFV so their sound only arrives when they are on screen. Have someone talk at normal volume and set the slider so the loudest moments stay just below the top of the meter.',
        on: ['scAud'], hi: ['scAud'] },
      { t: 'Paste your stream key from YouTube.',
        body: 'In YouTube Studio choose Go Live, then Stream. It gives you a stream key — a long string of characters. Copy it into the streaming panel and pick a quality about half your measured upload speed.',
        on: ['scStream'], hi: ['scStream'] },
      { t: 'Start the recording first, then go on air.',
        body: 'Press RECORD before you press ON AIR. That way the recording covers the whole show including the start, and if the stream fails you still have the show on disk.',
        on: ['scRec', 'scAir'], hi: ['scRec'] },
      { t: 'You are live. Direct the show.',
        body: 'Line a shot up on the bottom row, look at it, then press CUT. That loop is the entire job. Everything else — graphics, green screens, camera colour — is decoration on top of it.',
        hi: ['scAir', 'scPgm'] },
      { t: 'At the end: fade to black, stop the stream, stop the recording.',
        body: 'In that order, always. Then copy the folder off the drive to two separate places before you unplug anything. The show only exists once until you have copied it.',
        on: ['foot'], hi: ['foot'] }
    ]
  }
  ];

  w.WALK = CHAPTERS;
})(window);
