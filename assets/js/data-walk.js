/* ============================================================
   magicianed - Setup Walkthrough
   A manual you can step through, generated from YOUR rig rather
   than a generic one. Change the settings at the top and the
   cable counts, the socket numbers, the picture format and the
   whole diagram change with it.

   Every step has three parts:
     t     - what to do, in one line
     body  - why, and the detail a beginner needs
     check - how you know it worked before you move on
   ============================================================ */
(function (w) {
  'use strict';

  var ISO = [900, 470, 450, 250];
  var FLAT = [900, 470, 0, 0];
  function at(sx, sy) { return [sy + sx * 0.5774, sy - sx * 0.5774]; }

  /* ============================================================
     what you can tell it about your setup
     ============================================================ */
  var OPTIONS = [
    { id: 'cams', label: 'How many cameras?', type: 'number', min: 1, max: 8, def: 3,
      help: 'The switcher has eight inputs. Every camera needs one cable in.' },
    { id: 'returns', label: 'Run a return cable back to each camera?', type: 'bool', def: true,
      help: 'A second cable per camera. It shows the operator the live show, lights their red lamp, and lets you adjust the camera from the switcher.' },
    { id: 'bmd', type: 'bool', def: true, label: 'Are your cameras Blackmagic?',
      help: 'The red lamp and remote camera control only work over the return cable on cameras that support it — Blackmagic Studio and Pocket cameras do. Other makes usually need a separate tally box.' },
    { id: 'region', label: 'Where are you?', type: 'choice', def: '50',
      choices: [['50', 'UK, Europe, Australia'], ['5994', 'North America, Japan']],
      help: 'This decides the picture format everything on the system must be set to.' },
    { id: 'monitor', label: 'How is your monitor connected?', type: 'choice', def: 'hdmi',
      choices: [['hdmi', 'HDMI'], ['sdi', 'SDI'], ['none', 'No monitor yet']],
      help: 'This is the screen you direct from. It shows every camera at once.' },
    { id: 'mics', label: 'Microphones plugged into the switcher', type: 'number', min: 0, max: 2, def: 1,
      help: 'The switcher takes two. Sound already arrives from each camera down its picture cable.' },
    { id: 'laptop', label: 'Playing sound from a laptop or phone?', type: 'bool', def: false,
      help: 'Music, stings, or the sound from a video you are playing in.' },
    { id: 'stream', label: 'Streaming to the internet?', type: 'bool', def: true,
      help: 'The switcher can stream on its own. No computer needed for it.' },
    { id: 'platform', label: 'Streaming to', type: 'choice', def: 'YouTube', when: function (c) { return c.stream; },
      choices: [['YouTube', 'YouTube'], ['Twitch', 'Twitch'], ['Facebook', 'Facebook'], ['Custom', 'Somewhere else']] },
    { id: 'record', label: 'Recording onto a drive?', type: 'bool', def: true,
      help: 'A drive in the USB socket keeps a copy of the show.' },
    { id: 'talkback', label: 'Using a talkback headset?', type: 'bool', def: false,
      help: 'A headset that lets you talk to your camera operators while the show runs.' },
    { id: 'mount', label: 'Where is the switcher going?', type: 'choice', def: 'desk',
      choices: [['desk', 'On a desk'], ['rack', 'In a 19-inch rack']] }
  ];

  var DEFAULTS = {};
  OPTIONS.forEach(function (o) { DEFAULTS[o.id] = o.def; });

  /* ---------- things derived from the settings ---------- */
  function fmt(c) { return c.region === '5994' ? '1080p59.94' : '1080p50'; }
  function fmtWhy(c) {
    return c.region === '5994'
      ? 'North America and Japan run on 59.94 pictures a second. It is not 60 — the odd number is a leftover from the arrival of colour television, and every piece of broadcast kit still uses it.'
      : 'The UK, Europe and Australia run on 50 pictures a second, because that is the mains electricity frequency television was built around.';
  }
  function mvLayout(c) {
    var need = c.cams + 2;              /* every camera, plus the live and next pictures */
    var opts = [4, 7, 10, 13, 16];
    for (var i = 0; i < opts.length; i++) if (opts[i] >= need) return opts[i] + ' up';
    return '16 up';
  }
  function shown(c) { return Math.min(c.cams, 4); }   /* how many fit on the diagram */

  function cableList(c) {
    var rows = [];
    rows.push([c.cams + ' × SDI cable', 'one from each camera into the switcher']);
    if (c.returns) rows.push([c.cams + ' × SDI cable', 'one back from the switcher to each camera']);
    if (c.monitor === 'hdmi') rows.push(['1 × HDMI cable', 'switcher to your monitor']);
    if (c.monitor === 'sdi') rows.push(['1 × SDI cable', 'switcher to your monitor']);
    if (c.mics > 0) rows.push([c.mics + ' × XLR cable', c.mics === 1 ? 'your microphone' : 'your microphones']);
    if (c.laptop) rows.push(['1 × 3.5mm to twin RCA lead', 'laptop or phone sound']);
    rows.push(['1 × network cable', 'switcher to your router']);
    if (c.record) rows.push(['1 × USB-C drive', 'a solid state drive, not a memory stick']);
    if (c.talkback) rows.push(['1 × broadcast headset', 'five-pin XLR']);
    return rows;
  }
  function totalSdi(c) { return c.cams + (c.returns ? c.cams : 0) + (c.monitor === 'sdi' ? 1 : 0); }

  function list(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }

  /* ============================================================
     chapter A - out of the box
     ============================================================ */
  function chapterBox(c) {
    return {
      id: 'box', title: 'Before you start', view: FLAT,
      build: function (S) {
        S.ui(40, 46, 820, 372, { key: 'crate', r: 4, always: true });
        S.note(450, 32, 'what is in the carton, and what is not', { key: 'ttl', accent: 'var(--ink-4)', always: true });
        S.ui(76, 88, 402, 92, { key: 'unit', label: 'THE SWITCHER', accent: 'var(--brand)' });
        S.note(277, 198, 'one rack unit tall — 44 mm', { key: 'unitN', accent: 'var(--ink-4)' });
        S.ui(516, 88, 152, 92, { key: 'psu', label: 'MAINS LEAD', accent: 'var(--pgm)' });
        S.ui(688, 88, 136, 92, { key: 'ears', label: 'RACK EARS', accent: 'var(--ink-2)', small: true });
        S.ui(76, 236, 300, 92, { key: 'nocable', label: 'NO VIDEO CABLES', accent: 'var(--audio)' });
        S.note(226, 346, 'you buy these yourself — ' + totalSdi(c) + ' of them', { key: 'nocableN', accent: 'var(--audio)' });
        S.ui(400, 236, 424, 92, { key: 'note', label: 'NO DISC — the software is a free download', accent: 'var(--info)', small: true });
      },
      steps: [
        { t: 'Open the box and lay everything out before you plug anything in.',
          body: 'You are checking two things: that nothing is damaged, and that you know what is missing. A missing cable is a small problem now and a ruined show later.',
          check: 'You can see the switcher, a mains lead, and the rack ears with their screws.',
          on: ['unit', 'unitN'], hi: ['unit'] },
        { t: 'The switcher is one rack unit tall — about 44 mm — and it is fan cooled.',
          body: c.mount === 'rack'
            ? 'Screw it into the rack using the ears already fitted. Leave the space in front and behind it clear: air is pulled through front to back, and a blocked unit runs hot.'
            : 'It will sit happily on a desk. Leave the front and back clear — air is pulled through front to back. The fan is audible, so if you are recording sound in the same room, put it as far from the microphones as the cables allow.',
          check: 'It is sitting flat, with clear air at the front and the back.',
          hi: ['unit', 'unitN'] },
        { t: 'What is not in the box: a single video cable.',
          body: 'You need ' + totalSdi(c) + ' SDI cable' + (totalSdi(c) === 1 ? '' : 's') + ' for this setup. Buy proper 75-ohm SDI cable with BNC connectors — the twist-and-lock kind. Cheap television aerial lead uses the same plug and will appear to work, then fail halfway through the show once it warms up.',
          check: 'You have counted your cables against the shopping list on the next step.',
          on: ['nocable', 'nocableN'], hi: ['nocable'] },
        { t: 'Your shopping list, for this exact setup.',
          body: cableList(c).map(function (r) { return r[0] + ' — ' + r[1]; }).join('\n'),
          list: true,
          check: 'Everything on that list is in front of you.',
          hi: ['nocable'] },
        { t: 'There is no software disc. Download it before the day.',
          body: 'Go to blackmagicdesign.com, choose Support, and download "Blackmagic ATEM Switchers". It is free, and it works on Windows and on Mac. It installs two programs: ATEM Setup, for the settings you change once, and ATEM Software Control, which you use during a show.',
          check: 'Both ATEM Setup and ATEM Software Control are installed on your computer.',
          on: ['note'], hi: ['note'] }
      ]
    };
  }

  /* ============================================================
     chapter B - wiring, drawn from your camera count
     ============================================================ */
  function chapterWire(c) {
    var N = shown(c);
    return {
      id: 'wire', title: 'Plugging it in', view: ISO,
      build: function (S) {
        var h = at(-56, 66), WD = 132, DP = 64;
        S.prism(h[0], h[1], 0, WD, DP, 16, { key: 'unit', label: 'THE SWITCHER', small: true, accent: 'var(--brand)', always: true });
        var inp = function (i) { return [h[0] + 22 + i * 24, h[1] + DP, 8]; };
        var out = function (i) { return [h[0] + WD, h[1] + 10 + i * 16, 8]; };

        /* cameras, spread evenly however many there are */
        var top = -150, gap = N > 1 ? 236 / (N - 1) : 0;
        for (var i = 0; i < N; i++) {
          var cy = N === 1 ? -40 : top + i * gap;
          var cp = at(-272, cy);
          S.cam(cp[0], cp[1], 0, { key: 'cam' + i, label: 'CAMERA ' + (i + 1) });
          S.cable([cp[0] + 26, cp[1] + 9, 6], inp(i), { key: 'in' + i, accent: 'var(--pvw)', sag: 18 - i * 3 });
          if (c.returns) {
            S.cable([h[0] + 4 + i * 7, h[1] + DP, 8], [cp[0], cp[1] + 9, 6],
              { key: 'ret' + i, accent: 'var(--key)', sag: 74 - i * 10 });
          }
        }
        if (c.cams > N) {
          S.note(-272, 176, 'and ' + (c.cams - N) + ' more, wired exactly the same', { key: 'more', accent: 'var(--ink-4)' });
        }

        var pw = at(-66, 244);
        S.prism(pw[0], pw[1], 0, 58, 38, 12, { key: 'mains', label: 'MAINS', small: true, accent: 'var(--pgm)' });
        S.cable([h[0] + 112, h[1] + DP, 6], [pw[0] + 20, pw[1], 8], { key: 'wPwr', accent: 'var(--pgm)', sag: 24 });

        var mon = at(244, -148);
        S.screen(mon[0], mon[1], 0, 116, 64, { key: 'mon', label: 'YOUR MONITOR', accent: 'var(--info)' });
        S.cable(out(0), [mon[0], mon[1], 28], { key: 'wMon', accent: 'var(--info)', sag: 18 });

        var mic = at(220, 0);
        S.prism(mic[0], mic[1], 0, 54, 34, 10, { key: 'mic', label: 'MIC', small: true, accent: 'var(--audio)' });
        S.cable(out(4), [mic[0], mic[1] + 16, 6], { key: 'wMic', accent: 'var(--audio)', sag: 12 });

        var net = at(222, 112);
        S.prism(net[0], net[1], 0, 62, 38, 11, { key: 'net', label: 'ROUTER', small: true, accent: 'var(--info)' });
        S.cable(out(7), [net[0], net[1] + 18, 7], { key: 'wNet', accent: 'var(--info)', sag: 14 });

        var ssd = at(98, 228);
        S.prism(ssd[0], ssd[1], 0, 60, 38, 12, { key: 'ssd', label: 'DRIVE', small: true, accent: 'var(--iso)' });
        S.cable([h[0] + 86, h[1] + DP, 8], [ssd[0] + 10, ssd[1], 8], { key: 'wSsd', accent: 'var(--iso)', sag: 26 });
      },
      steps: (function () {
        var s = [];
        var allCams = [], allIn = [], allRet = [];
        for (var i = 0; i < N; i++) { allCams.push('cam' + i); allIn.push('in' + i); if (c.returns) allRet.push('ret' + i); }

        s.push({
          t: 'Power first, before you touch a camera.',
          body: 'Plug the mains lead into the socket on the back and into the wall. There is no on/off switch — the switcher starts the moment it has power, so your power strip is the on switch. There is a second, 12V DC socket beside it: if you have a suitable supply, plug that in as well and either one can fail without the show stopping.',
          check: 'The small screen on the front lights up and settles after about twenty seconds.',
          on: ['mains', 'wPwr'], hi: ['wPwr'], flow: ['wPwr']
        });

        s.push({
          t: 'Camera 1: one cable from the camera into the socket marked SDI IN 1.',
          body: 'The socket on the camera is usually labelled SDI OUT. The one on the switcher is SDI IN 1. Both ends twist and lock — push the plug on and turn the collar until it clicks, so it cannot be pulled out by someone walking past.',
          check: 'Both ends are locked, and a gentle tug does not move them.',
          on: [allCams[0], allIn[0]], hi: [allIn[0]], flow: [allIn[0]]
        });

        if (c.returns) {
          s.push({
            t: 'Camera 1 again: a second cable from SDI OUT 1 back to the camera.',
            body: 'This one runs from the socket marked SDI OUT 1 into the SDI IN socket on the camera. It does three jobs at once: it shows the operator the live show in their eyepiece, it lights the red lamp on their camera when they are the one on air, and it lets you change that camera\'s brightness and colour from where you are sitting.' +
              (c.bmd ? '' : '\n\nYour cameras are not Blackmagic, so the red lamp and the remote control may not work over this cable. The return picture will. If you need tally lights on other makes, you need a separate tally box.'),
            check: 'The camera operator can see the show in their eyepiece.',
            on: [allRet[0]], hi: [allRet[0]], flow: [allRet[0]]
          });
        } else {
          s.push({
            t: 'You have chosen not to run return cables. Worth knowing what that costs you.',
            body: 'Without a return cable your camera operators cannot see what is on air, they get no red lamp telling them they are live, and you cannot adjust their exposure from the switcher. If you can find the cable, run them — it is the single biggest upgrade to how a small studio feels to work in.',
            check: 'You have decided deliberately, rather than by accident.',
            hi: ['unit']
          });
        }

        if (c.cams > 1) {
          s.push({
            t: 'Now do exactly the same for ' + (c.cams === 2 ? 'camera 2' : 'cameras 2 to ' + c.cams) + '.',
            body: 'Camera 2 into IN 2' + (c.returns ? ', and OUT 2 back to camera 2' : '') + '. Camera 3 into IN 3, and so on. Keep the numbers matched all the way along — the moment you cross two of them, the red lamp lights on the wrong camera and you will chase it for an hour.\n\nLabel both ends of every cable now, while you can still see which is which.',
            check: 'Every camera number matches its socket number, at both ends.',
            on: allCams.concat(allIn, allRet, c.cams > N ? ['more'] : []),
            hi: allIn.slice(1).concat(allRet.slice(1)), flow: allIn.slice(1).concat(allRet.slice(1))
          });
        }

        if (c.monitor !== 'none') {
          s.push({
            t: 'Your monitor goes on the multi-view output.',
            body: c.monitor === 'hdmi'
              ? 'Use the socket marked MULTI VIEW on the HDMI connector, into any television or computer monitor. Multi-view means it shows every camera at once, plus the picture that is going out and the one you have lined up next. This is the screen you actually direct from — not the app on your laptop.'
              : 'Use the SDI socket marked MULTI VIEW into a monitor with an SDI input. It shows every camera at once, plus what is going out and what is next. This is the screen you actually direct from.',
            check: 'You can see all ' + c.cams + ' camera' + (c.cams === 1 ? '' : 's') + ' on one screen, each in its own box.',
            on: ['mon', 'wMon'], hi: ['wMon'], flow: ['wMon']
          });
        }

        if (c.mics > 0) {
          s.push({
            t: c.mics === 1 ? 'Your microphone goes into the XLR socket marked MIC 1.' : 'Your two microphones go into MIC 1 and MIC 2.',
            body: 'These are the three-pin XLR sockets. They take a microphone or a feed from a sound desk. Note that sound from your cameras already arrives down their picture cables, so you do not need a separate lead for those.\n\nIf your microphone needs phantom power — most condenser microphones do — you switch that on later, in the software.',
            check: 'The plug clicks home and does not pull out.',
            on: ['mic', 'wMic'], hi: ['wMic'], flow: ['wMic']
          });
        }
        if (c.laptop) {
          s.push({
            t: 'Laptop sound goes into the red and white RCA sockets.',
            body: 'Use a 3.5mm headphone lead to twin RCA. Set the laptop volume to about three quarters and leave it there — you will do the fine adjustment on the switcher, and a laptop volume that keeps changing is impossible to mix against.',
            check: 'Playing something on the laptop moves a meter in the software later on.',
            on: ['mic'], hi: ['mic']
          });
        }

        s.push({
          t: 'A network cable from the switcher to your router.',
          body: 'Any of the four network sockets will do — they are all part of one small network switch built into the box. You need this for two things: so your computer can find the switcher, and' + (c.stream ? ' so the switcher can reach the internet to stream.' : ' so you can reach it from anywhere on your network.') +
            '\n\nIf you cannot get it on your network, a USB-C cable straight from the switcher to your computer always works as a fallback.',
          check: 'A small light on the network socket is lit.',
          on: ['net', 'wNet'], hi: ['wNet'], flow: ['wNet']
        });

        if (c.record) {
          s.push({
            t: 'Plug your drive into the USB-C socket.',
            body: 'Use a proper solid state drive, not a memory stick — a stick will not keep up and will drop frames. Format it as exFAT so that both Windows and a Mac can read it afterwards, and check there is enough free space for the whole show before you start.',
            check: 'The Recording panel in the software shows the drive by name, with time remaining.',
            on: ['ssd', 'wSsd'], hi: ['wSsd'], flow: ['wSsd']
          });
        }
        if (c.talkback) {
          s.push({
            t: 'Your headset goes into the five-pin XLR socket marked TALKBACK.',
            body: 'This is a different socket from the microphone inputs — it has five pins rather than three, because it carries both the earpiece and the microphone. It puts you on a private line with your camera operators, and each person hears everyone except themselves, so there is no echo.',
            check: 'You can hear your own side tone in the earpiece.',
            hi: ['unit']
          });
        }

        s.push({
          t: 'Walk round once and tug every connector gently.',
          body: 'A cable that is nearly in is worse than one that is out, because it fails halfway through the show rather than now. Check both ends of each one. Then look at your labels: you should be able to name any cable in the room without following it.',
          check: 'Nothing moves, and every cable is labelled at both ends.',
          hi: ['unit'], flow: allIn.concat(allRet, ['wMon', 'wNet'])
        });
        return s;
      })()
    };
  }

  /* ============================================================
     chapter C - first power-up and the software
     ============================================================ */
  function chapterFirst(c) {
    var F = fmt(c);
    return {
      id: 'first', title: 'Switching it on', view: FLAT,
      build: function (S) {
        S.ui(60, 52, 780, 360, { key: 'win', r: 4, always: true });
        S.note(450, 36, 'on your computer', { key: 'wt', accent: 'var(--ink-4)', always: true });

        S.ui(92, 84, 716, 38, { key: 'suTitle', label: 'Blackmagic ATEM Setup', accent: 'var(--info)' });
        S.ui(92, 138, 340, 62, { key: 'suFound', label: 'ATEM Television Studio HD8', accent: 'var(--pvw)' });
        S.ui(456, 138, 352, 62, { key: 'suFmt', label: 'Video format:  ' + F, accent: 'var(--brand)' });
        S.ui(92, 214, 716, 54, { key: 'suNet', label: '192.168.10.240    255.255.255.0    192.168.10.1', accent: 'var(--info)', small: true });
        S.ui(92, 282, 340, 46, { key: 'suMv', label: 'Multi view:  ' + mvLayout(c), accent: 'var(--key)' });
        S.ui(660, 282, 148, 46, { key: 'suSave', label: 'SAVE', accent: 'var(--pvw)' });

        S.ui(92, 84, 716, 38, { key: 'scTitle', label: 'ATEM Software Control', accent: 'var(--brand)' });
        S.ui(92, 138, 716, 50, { key: 'scPgm', label: 'ON AIR      1   2   3   4   5   6   7   8', accent: 'var(--pgm)' });
        S.ui(92, 198, 716, 50, { key: 'scPvw', label: 'NEXT UP     1   2   3   4   5   6   7   8', accent: 'var(--pvw)' });
        S.ui(92, 262, 340, 44, { key: 'scAud', label: 'Audio — set your levels', accent: 'var(--audio)' });
        S.ui(456, 262, 352, 44, { key: 'scCam', label: 'Camera — match them up', accent: 'var(--pvw)' });
        S.ui(92, 318, 340, 46, { key: 'scRec', label: 'RECORD', accent: 'var(--pgm)' });
        S.ui(456, 318, 352, 46, { key: 'scAir', label: 'ON AIR', accent: 'var(--iso)' });
        S.note(450, 438, 'the order matters more than the speed', { key: 'foot', accent: 'var(--ink-4)' });
      },
      steps: (function () {
        var s = [];
        s.push({
          t: 'Switch the switcher on first, then the cameras.',
          body: 'Give it about twenty seconds. The little screen on the front will settle and show the picture format it is currently set to. If your cameras are already running, some inputs may show nothing at all — that is the next problem to fix, not a fault.',
          check: 'The front screen is lit and showing a format.',
          on: []
        });
        s.push({
          t: 'Open ATEM Setup — the small utility, not the big app.',
          body: 'ATEM Setup handles the handful of settings you change once and then forget. ATEM Software Control is the large window you use during a show. The single download installed both.',
          check: 'ATEM Setup is open and scanning.',
          on: ['suTitle'], hi: ['suTitle']
        });
        s.push({
          t: 'Your switcher should appear in the list. Click it.',
          body: 'If nothing appears, your computer and the switcher are on different networks. The quickest fix is a USB-C cable straight between the two, which always works. If it appears but refuses to connect, the app and the switcher are on different versions — Setup will offer to update the switcher, and you should let it.',
          check: 'The switcher is selected and its settings are showing.',
          on: ['suFound'], hi: ['suFound']
        });
        s.push({
          t: 'Set the picture format to ' + F + '. Do this before anything else.',
          body: fmtWhy(c) + '\n\nThe switcher runs one format for the whole system, and it does not convert anything. Set it here first, because changing it later drops every camera and stops any recording that is running.',
          check: 'The Video Standard box reads ' + F + '.',
          on: ['suFmt'], hi: ['suFmt']
        });
        s.push({
          t: 'Now set every camera to exactly the same format.',
          body: 'This is the step people skip, and it is the one that ruins the afternoon. Go to each of your ' + c.cams + ' camera' + (c.cams === 1 ? '' : 's') + ' and set its output to ' + F + '. Not 1080i' + (c.region === '5994' ? '59.94' : '50') + ', not ' + (c.region === '5994' ? '1080p60' : '1080p25') + ' — exactly ' + F + '. One letter or one number different and that camera simply will not appear, with no warning and no explanation.',
          check: 'Every camera menu reads ' + F + '.',
          hi: ['suFmt']
        });
        s.push({
          t: 'Give the switcher a fixed address on your network.',
          body: 'A fixed address means the app finds it in the same place every time. Set it to something outside the range your router hands out automatically — 192.168.10.240 is a typical choice — with the mask 255.255.255.0 and the gateway set to your router\'s own address.' +
            (c.stream ? '\n\nThe gateway matters: without it the switcher cannot reach the internet, and streaming will not work.' : ''),
          check: 'All three boxes are filled in and the address is one nothing else on the network is using.',
          on: ['suNet'], hi: ['suNet']
        });
        s.push({
          t: 'Set the multi-view to ' + mvLayout(c) + '.',
          body: 'You have ' + c.cams + ' camera' + (c.cams === 1 ? '' : 's') + ', and the multi-view also needs a box for the picture going out and one for the picture you have lined up next. That is ' + (c.cams + 2) + ' boxes, so ' + mvLayout(c) + ' is the smallest layout that fits them all without wasting space.',
          check: 'Your monitor shows that many boxes.',
          on: ['suMv'], hi: ['suMv']
        });
        s.push({
          t: 'Press Save, then close Setup.',
          body: 'Saving writes the settings into the switcher itself, not into your computer. Every input renegotiates as it applies them, so the pictures will blink out and come back. That is normal. From here on you should not need Setup again.',
          check: 'The pictures have come back after the blink.',
          on: ['suSave'], hi: ['suSave']
        });
        s.push({
          t: 'Open ATEM Software Control and check every camera appears.',
          body: 'Click each number along the bottom green row in turn and watch your monitor. The green row is private — nothing you touch there reaches the audience — so this is completely safe to do.',
          check: 'All ' + c.cams + ' camera' + (c.cams === 1 ? ' shows' : 's show') + ' a picture.',
          off: ['suTitle', 'suFound', 'suFmt', 'suNet', 'suMv', 'suSave'],
          on: ['scTitle', 'scPgm', 'scPvw'], hi: ['scPvw']
        });
        s.push({
          t: 'If an input is black, work through it in this order.',
          body: 'One: is the camera actually on and out of standby. Two: is its output format exactly ' + F + '. Three: is the cable locked at both ends, and is it in the socket number you think it is. Four: swap that cable with one you know works.\n\nIt is almost always the format or the cable. It is almost never the switcher.',
          check: 'Nothing is black any more.',
          hi: ['scPvw']
        });
        s.push({
          t: 'Set your sound levels on the Audio page.',
          body: (c.mics > 0 ? 'Put your microphone' + (c.mics > 1 ? 's' : '') + ' on ON, so ' + (c.mics > 1 ? 'they are' : 'it is') + ' heard whichever camera is live. ' : '') +
            'Put the cameras on AFV, which stands for Audio Follows Video — that means a camera is only heard while it is on screen. Then have someone talk at normal volume and set the slider so the loudest moments stay just below the top of the meter.\n\nDo not put every camera on AFV if they are all in one room; each cut will change the sound of the room and it will pump.',
          check: 'Talking at normal volume keeps the meter comfortably below the top.',
          on: ['scAud'], hi: ['scAud']
        });
        if (c.cams > 1) {
          s.push({
            t: 'Make your cameras look like they are in the same room.',
            body: 'On the Camera page, set every camera to the same colour temperature by hand — pick a number and use it on all of them, never automatic. Then match the black level, then the iris until they are equally bright. Cut between them and watch: if the picture jumps, you are not finished.' +
              (c.bmd ? '' : '\n\nYour cameras are not Blackmagic, so this page will not reach them. Do the same job from each camera\'s own menu instead.'),
            check: 'Cutting between cameras does not change the look of the room.',
            on: ['scCam'], hi: ['scCam']
          });
        }
        if (c.stream) {
          s.push({
            t: 'Get your stream key from ' + c.platform + ' and paste it in.',
            body: (c.platform === 'YouTube'
              ? 'In YouTube Studio choose Go Live, then Stream. It shows a stream key — a long string of characters that tells YouTube the video is yours.'
              : c.platform === 'Twitch'
                ? 'In the Twitch Creator Dashboard, under Settings then Stream, there is a primary stream key.'
                : c.platform === 'Facebook'
                  ? 'In Facebook Live Producer, choose Streaming software, and it shows a stream key.'
                  : 'Your streaming provider will give you a server address and a stream key.') +
              '\n\nPaste it into the Streaming panel. Then test your actual upload speed at the venue, at the time of day you will be broadcasting, and pick a quality setting around half of it. A stream that stutters looks far worse than a softer one that never does.\n\nTreat the key like a password. Anyone who has it can broadcast to your channel.',
            check: 'The Streaming panel shows your platform and a key, and a quality setting.',
            on: ['scAir'], hi: ['scAir']
          });
        }
        s.push({
          t: 'Rehearse one cut before anybody is watching.',
          body: 'Put camera 1 on the top row, put ' + (c.cams > 1 ? 'camera 2' : 'the colour bars') + ' on the bottom row, and press CUT. Watch it happen on your monitor. That loop — line up, look, cut — is the entire job, and doing it once cold now means your first live cut is your second cut, not your first.',
          check: 'You have cut back and forth a few times and it feels ordinary.',
          hi: ['scPgm', 'scPvw']
        });
        s.push({
          t: 'Going live: ' + (c.record ? 'start the recording first, then go on air.' : 'go on air.'),
          body: (c.record
            ? 'Press RECORD before you press ON AIR. That way the recording covers the whole show including the start, and if the stream drops out you still have the show on the drive.'
            : 'Press ON AIR when you are ready. Everything on the top row is now going out.') +
            (c.stream ? '' : '\n\nYou are not streaming on this setup, so this is just the recording.'),
          check: 'The buttons are lit and the counters are running.',
          on: ['scRec'], hi: c.record ? ['scRec', 'scAir'] : ['scAir']
        });
        s.push({
          t: 'At the end: fade to black, ' + (c.stream ? 'stop the stream, ' : '') + (c.record ? 'stop the recording, ' : '') + 'then copy the files.',
          body: 'In that order, always. Fade to black gets you off air cleanly, taking picture and sound together. ' +
            (c.record ? 'Then copy the folder off the drive to two separate places before you unplug anything, and do not edit from the drive itself. The show only exists once until you have copied it.' : 'Then pack down.'),
          check: 'You are off air, everything is stopped, and' + (c.record ? ' the show exists in two places.' : ' the kit is safe to unplug.'),
          on: ['foot'], hi: ['foot']
        });
        return s;
      })()
    };
  }

  function build(cfg) {
    var c = {};
    Object.keys(DEFAULTS).forEach(function (k) { c[k] = DEFAULTS[k]; });
    if (cfg) Object.keys(cfg).forEach(function (k) { if (cfg[k] !== undefined && cfg[k] !== null) c[k] = cfg[k]; });
    c.cams = Math.max(1, Math.min(8, parseInt(c.cams, 10) || 1));
    c.mics = Math.max(0, Math.min(2, parseInt(c.mics, 10) || 0));
    return [chapterBox(c), chapterWire(c), chapterFirst(c)];
  }

  w.WALK = { options: OPTIONS, defaults: DEFAULTS, build: build, format: fmt, multiview: mvLayout };
})(window);
