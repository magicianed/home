/* ============================================================
   magicianed - curriculum
   Twelve levels plus a final. Every level is the same shape:
     PONDER  - watch it happen, ~30 seconds
     PLAY    - do it yourself in a simulation
   There is no reading step. If something needs explaining, it
   gets a Ponder beat or a hint on the task that needs it.
   ============================================================ */
(function (w) {
  'use strict';

  var VIDEO = {
    primary: {
      id: 'dRXl_okXCf8',
      title: 'Walkthrough & Set Up - Blackmagic ATEM Television Studio HD8',
      note: 'The real box, unboxed and wired up.',
      /* placed as a fraction of the true runtime, read from the player */
      checkpoints: [
        { at: 0.12, topic: 'Inputs',
          q: 'The HD8 takes its camera feeds over which connector?',
          opts: ['SDI on BNC', 'HDMI', 'USB-C', 'Ethernet only'],
          a: 0, why: 'All-SDI switcher: eight SDI inputs on BNC. HDMI here is output only.' },
        { at: 0.32, topic: 'The two buses',
          q: 'What does the RED row control?',
          opts: ['What is on air right now', 'What goes next', 'The multiview', 'The recording'],
          a: 0, why: 'Red is program - live. Green is preview - next.' },
        { at: 0.54, topic: 'Video standard',
          q: 'A camera set to a different video standard will:',
          opts: ['Show as no signal', 'Be converted automatically', 'Appear in multiview only', 'Change the switcher to match'],
          a: 0, why: 'One standard for the whole system. No per-input conversion.' },
        { at: 0.76, topic: 'Control',
          q: 'How does ATEM Software Control normally reach the switcher?',
          opts: ['Over ethernet, by IP address', 'Over HDMI', 'Over SDI', 'Bluetooth'],
          a: 0, why: 'Ethernet - the HD8 has a 4-port switch built in. USB-C works as a direct link too.' },
        { at: 0.92, topic: 'Order of work',
          q: 'Which comes first on show day?',
          opts: ['Set the video standard', 'Enter the stream key', 'Start recording', 'Load graphics'],
          a: 0, why: 'Changing the standard later drops every input and stops any recording.' }
      ]
    },
    extras: [
      { id: 'w4ixzY2zM0w', title: 'Full review & walkthrough', note: 'A second pass on the panel and workflow.' },
      { id: 'xfKOKfsTCkU', title: 'Overview & features', note: 'What the box does, quickly.' }
    ]
  };

  var MODULES = [
    { id: 'm01', n: '01', accent: 'brand',
      title: 'Meet the HD8', blurb: 'Program, preview, and the one job a switcher has.',
      tags: ['Ponder', 'Watch'],
      steps: [
        { type: 'ponder', scene: 'flow', title: 'One picture leaves' },
        { type: 'video', title: 'See the real thing', video: 'primary',
          intro: 'Five checkpoints. Answer to carry on, rewatch any segment as often as you like.' }
      ] },

    { id: 'm02', n: '02', accent: 'info',
      title: 'The Back Panel', blurb: 'Every socket you will actually touch.',
      tags: ['Ponder', 'Find'],
      steps: [
        { type: 'ponder', scene: 'rear', title: 'The back of the box' },
        { type: 'sim', sim: 'rear', title: 'Name every connector',
          intro: 'Click each group to identify it. Find all eight to clear the level.' }
      ] },

    { id: 'm03', n: '03', accent: 'key',
      title: 'Wire It Up', blurb: 'Patch a studio without crossing a single cable.',
      tags: ['Ponder', 'Minigame'],
      steps: [
        { type: 'ponder', scene: 'loop', title: 'Every camera is a loop' },
        { type: 'sim', sim: 'wiring', level: 1, title: 'Cable drill: three cameras',
          intro: 'Drag each cable end onto the right port. Wrong ports buzz.' },
        { type: 'sim', sim: 'wiring', level: 2, title: 'Cable drill: full studio',
          intro: 'The hard one. Returns, outputs, audio, network, recording and power.' }
      ] },

    { id: 'm04', n: '04', accent: 'audio',
      title: 'Power On', blurb: 'Video standard and network, the two settings that break everything.',
      tags: ['Ponder', 'Simulation'],
      steps: [
        { type: 'ponder', scene: 'standard', title: 'One format, or nothing' },
        { type: 'sim', sim: 'setup', title: 'Configure the switcher',
          intro: 'A working recreation of ATEM Setup. Work the tasks on the right.' }
      ] },

    { id: 'm05', n: '05', accent: 'info',
      title: 'The Software', blurb: 'Install it, find your switcher, connect.',
      tags: ['Ponder', 'Windows sim'],
      steps: [
        { type: 'ponder', scene: 'software', title: 'Four tabs, and that is it' },
        { type: 'sim', sim: 'windows-install', title: 'Install and connect',
          intro: 'A real Windows desktop. Find the installer, run it, launch the software, connect.' }
      ] },

    { id: 'm06', n: '06', accent: 'pgm',
      title: 'Switching Live', blurb: 'Cut, auto, fader bar. The core skill.',
      tags: ['Ponder', 'ATEM sim'],
      steps: [
        { type: 'ponder', scene: 'take', title: 'Three ways to take' },
        { type: 'sim', sim: 'atem', mission: 'switching', title: 'Your first live cut',
          intro: 'The real control surface. Tasks check actual switcher state, not clicks.' }
      ] },

    { id: 'm07', n: '07', accent: 'key',
      title: 'Keys & Transitions', blurb: 'Green screen, lower thirds, and what sits on top of what.',
      tags: ['Ponder', 'ATEM sim'],
      steps: [
        { type: 'ponder', scene: 'layers', title: 'What sits on top of what' },
        { type: 'sim', sim: 'atem', mission: 'keying', title: 'Key a guest, bug a graphic',
          intro: 'Set a wipe, chroma key the green screen, then bring a lower third on downstream.' }
      ] },

    { id: 'm08', n: '08', accent: 'brand',
      title: 'Graphics', blurb: 'Drag a file off your drive and put it on air.',
      tags: ['Ponder', 'Windows sim'],
      steps: [
        { type: 'ponder', scene: 'media', title: 'From your drive to on air' },
        { type: 'sim', sim: 'windows-media', title: 'File Explorer to on air',
          intro: 'Drag the PNG out of Explorer, into the media pool, and onto the show.' }
      ] },

    { id: 'm09', n: '09', accent: 'audio',
      title: 'Audio', blurb: 'Three buttons per channel. Get them right and nobody notices you.',
      tags: ['Ponder', 'Mixer sim'],
      steps: [
        { type: 'ponder', scene: 'audio', title: 'ON, AFV, OFF' },
        { type: 'sim', sim: 'atem', mission: 'audio', title: 'Mix the show',
          intro: 'Set every channel, clean up the host mic, and keep the master under control.' }
      ] },

    { id: 'm10', n: '10', accent: 'pvw',
      title: 'Cameras & Tally', blurb: 'Match them from the switcher, down the return cable.',
      tags: ['Ponder', 'ATEM sim'],
      steps: [
        { type: 'ponder', scene: 'match', title: 'Make them the same room' },
        { type: 'sim', sim: 'atem', mission: 'camera', title: 'Match camera 2',
          intro: 'It is dark and cold. Fix it in the right order, then check tally.' }
      ] },

    { id: 'm11', n: '11', accent: 'iso',
      title: 'Stream & Record', blurb: 'Live to the internet, and onto a disk you can edit from.',
      tags: ['Ponder', 'ATEM sim'],
      steps: [
        { type: 'ponder', scene: 'out', title: 'Out to the world' },
        { type: 'sim', sim: 'atem', mission: 'stream', title: 'Go live, roll record',
          intro: 'Set the platform, pick a sane bitrate, choose the right disk, and shut down cleanly.' }
      ] },

    { id: 'm12', n: '12', accent: 'brand',
      title: 'The Panel', blurb: 'Run the whole show with the laptop shut.',
      tags: ['Ponder', 'Panel sim'],
      steps: [
        { type: 'ponder', scene: 'panel', title: 'Hands on the box' },
        { type: 'sim', sim: 'panel', title: 'Panel drills',
          intro: 'Crosspoints, shift, fader, joystick, keypad, macros. Thirteen drills.' }
      ] },

    { id: 'm13', n: '13', accent: 'pgm', final: true,
      title: 'Run The Show', blurb: 'Everything, in order, for real.',
      tags: ['Live sim', 'Final'],
      steps: [
        { type: 'sim', sim: 'atem', mission: 'showtime', title: 'Live: run the show',
          intro: 'Eleven beats, in order, from holding slide to clean shutdown. No hints on the order - you know it by now.' },
        { type: 'quiz', title: 'Final exam', bank: 'final', pass: 0.8, count: 14, final: true }
      ] }
  ];

  w.COURSE = {
    title: 'Blackmagic ATEM Television Studio HD8',
    subtitle: 'Operator Mastery',
    modules: MODULES,
    video: VIDEO,

    module: function (id) {
      for (var i = 0; i < MODULES.length; i++) if (MODULES[i].id === id) return MODULES[i];
      return null;
    },
    index: function (id) {
      for (var i = 0; i < MODULES.length; i++) if (MODULES[i].id === id) return i;
      return -1;
    },
    totalSteps: function () { return MODULES.reduce(function (n, m) { return n + m.steps.length; }, 0); },
    doneSteps: function () {
      var n = 0;
      MODULES.forEach(function (m) { m.steps.forEach(function (s, i) { if (w.State.isStepDone(m.id, i)) n++; }); });
      return n;
    },
    moduleDone: function (m) {
      for (var i = 0; i < m.steps.length; i++) if (!w.State.isStepDone(m.id, i)) return false;
      return true;
    },
    moduleProgress: function (m) {
      var n = 0;
      for (var i = 0; i < m.steps.length; i++) if (w.State.isStepDone(m.id, i)) n++;
      return n / m.steps.length;
    },
    moduleUnlocked: function (m) {
      var i = w.COURSE.index(m.id);
      if (i <= 0) return true;
      return w.COURSE.moduleDone(MODULES[i - 1]);
    },
    firstIncomplete: function () {
      for (var i = 0; i < MODULES.length; i++) {
        var m = MODULES[i];
        for (var s = 0; s < m.steps.length; s++) if (!w.State.isStepDone(m.id, s)) return { mod: m, step: s };
      }
      return null;
    },
    allDone: function () { return MODULES.every(function (m) { return w.COURSE.moduleDone(m); }); },
    pct: function () { return Math.round(w.COURSE.doneSteps() / w.COURSE.totalSteps() * 100); }
  };
})(window);
