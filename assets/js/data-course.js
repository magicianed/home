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
        { at: 0.55, from: 0.05, topic: 'The two rows',
          q: 'Which row of buttons is the one the audience actually sees?',
          opts: ['The red row', 'The green row', 'Both at once', 'Neither'],
          a: 0, why: 'Red is live. Green is what you have lined up next, and only you can see it.' },
        { at: 0.75, from: 0.35, topic: 'Cables',
          q: 'How many cables run between the switcher and each camera?',
          opts: ['Two — one each way', 'One', 'Three', 'None, it is wireless'],
          a: 0, why: 'Picture in, and a second cable back so the operator sees the show and gets the red lamp.' },
        { at: 0.99, from: 0.60, topic: 'Setting up',
          q: 'A camera is set to a different picture format from the switcher. What happens?',
          opts: ['That input shows nothing at all', 'It is converted automatically', 'It looks slightly worse', 'A warning appears'],
          a: 0, why: 'There is no conversion and no warning. Everything must be set to the same format.' }
      ]
    },
    extras: [
      { id: 'w4ixzY2zM0w', title: 'Full review & walkthrough', note: 'A second pass on the panel and workflow.' },
      { id: 'xfKOKfsTCkU', title: 'Overview & features', note: 'What the box does, quickly.' }
    ]
  };

  var MODULES = [
    { id: 'm01', n: '01', accent: 'brand',
      title: 'What This Box Does', blurb: 'What the box actually does, and why one row of buttons is red.',
      tags: ['Ponder', 'Watch'],
      steps: [
        { type: 'ponder', scene: 'flow', title: 'One picture leaves' },
        { type: 'video', title: 'See the real thing', video: 'primary',
          intro: 'Watch the real thing being unboxed and wired up. It pauses three times, late on, for a quick check on what you have learned — and each one lets you jump back and rewatch that whole stretch.' }
      ] },

    { id: 'm02', n: '02', accent: 'info',
      title: 'The Back Panel', blurb: 'Every socket on the back, in plain English.',
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
          intro: 'The hard one. Returns, outputs, audio, network, recording and power.' },
        { type: 'quiz', title: 'Section check', bank: 's1', mustAll: true, count: 7,
          intro: 'Seven questions on the box and the cables. You need all seven — get one wrong and it will show you exactly where to go back to.' }
      ] },

    { id: 'm04', n: '04', accent: 'audio',
      title: 'Power On', blurb: 'Picture format and network — the two settings that break everything.',
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
          intro: 'A real Windows desktop. Find the installer, run it, launch the software, connect.' },
        { type: 'quiz', title: 'Section check', bank: 's2', mustAll: true, count: 6,
          intro: 'Six questions on setting the switcher up. All six have to be right.' }
      ] },

    { id: 'm06', n: '06', accent: 'pgm',
      title: 'Switching Live', blurb: 'Changing shot: instantly, gently, or by hand.',
      tags: ['Ponder', 'ATEM sim'],
      steps: [
        { type: 'ponder', scene: 'take', title: 'Three ways to take' },
        { type: 'sim', sim: 'atem', mission: 'switching', title: 'Your first live cut',
          intro: 'This is the real control surface. Every task checks what the switcher is actually doing, not what you clicked. Stuck? Press the ? on any task.' }
      ] },

    { id: 'm07', n: '07', accent: 'key',
      title: 'Green Screens & Graphics', blurb: 'Cutting a background out, and putting a name on screen.',
      tags: ['Ponder', 'ATEM sim'],
      steps: [
        { type: 'ponder', scene: 'layers', title: 'What sits on top of what' },
        { type: 'sim', sim: 'atem', mission: 'keying', title: 'Green screen and a name strip',
          intro: 'Cut the green background out from behind your guest, then put a name strip along the bottom. Watch the pictures at the top as you go — you will see each step happen.' }
      ] },

    { id: 'm08', n: '08', accent: 'brand',
      title: 'Graphics', blurb: 'Drag a file off your drive and put it on air.',
      tags: ['Ponder', 'Windows sim'],
      steps: [
        { type: 'ponder', scene: 'media', title: 'From your drive to on air' },
        { type: 'sim', sim: 'windows-media', title: 'File Explorer to on air',
          intro: 'Drag the PNG out of Explorer, into the media pool, and onto the show.' },
        { type: 'quiz', title: 'Section check', bank: 's3', mustAll: true, count: 8,
          intro: 'Eight questions on running pictures and graphics. All eight.' }
      ] },

    { id: 'm09', n: '09', accent: 'audio',
      title: 'Audio', blurb: 'Three buttons per channel. Get them right and nobody notices you.',
      tags: ['Ponder', 'Mixer sim'],
      steps: [
        { type: 'ponder', scene: 'audio', title: 'ON, AFV, OFF' },
        { type: 'sim', sim: 'atem', mission: 'audio', title: 'Mix the show',
          intro: 'Decide which microphones are heard, and when. Then tidy up the presenter and keep the overall level safe.' }
      ] },

    { id: 'm10', n: '10', accent: 'pvw',
      title: 'Cameras & Tally', blurb: 'Make every camera look like it is in the same room.',
      tags: ['Ponder', 'ATEM sim'],
      steps: [
        { type: 'ponder', scene: 'match', title: 'Make them the same room' },
        { type: 'sim', sim: 'atem', mission: 'camera', title: 'Match camera 2',
          intro: 'Camera 2 is darker and bluer than camera 1. You will see them side by side — fix it in the right order and watch them come together.' }
      ] },

    { id: 'm11', n: '11', accent: 'iso',
      title: 'Stream & Record', blurb: 'Live to the internet, and onto a disk you can edit from.',
      tags: ['Ponder', 'ATEM sim'],
      steps: [
        { type: 'ponder', scene: 'out', title: 'Out to the world' },
        { type: 'sim', sim: 'atem', mission: 'stream', title: 'Go live, roll record',
          intro: 'Point it at YouTube, choose a sensible quality, pick the right drive, and finish the show in the right order.' }
      ] },

    { id: 'm12', n: '12', accent: 'brand',
      title: 'The Panel', blurb: 'Run the whole show with the laptop shut.',
      tags: ['Ponder', 'Panel sim'],
      steps: [
        { type: 'ponder', scene: 'panel', title: 'Hands on the box' },
        { type: 'sim', sim: 'panel', title: 'Panel drills',
          intro: 'Crosspoints, shift, fader, joystick, keypad, macros. Thirteen drills.' },
        { type: 'quiz', title: 'Section check', bank: 's4', mustAll: true, count: 9,
          intro: 'Nine questions on sound, cameras, output and the panel. All nine.' }
      ] },

    { id: 'm13', n: '13', accent: 'pgm', final: true,
      title: 'Run The Show', blurb: 'Show day, start to finish. Every single thing you have learned, in order.',
      tags: ['Wiring', 'Setup', 'Live sim', 'Written'],
      steps: [
        { type: 'sim', sim: 'wiring', level: 2, title: 'Stage 1 — rig the studio',
          intro: 'Show day starts with an empty room. Patch the whole thing from scratch: three cameras and their return cables, the outputs, the sound, the network, the recording drive and the power. Nothing is plugged in for you.' },
        { type: 'sim', sim: 'setup', title: 'Stage 2 — set the switcher up',
          intro: 'Power is on and nothing works yet. Name the switcher, pick the picture format, give it a fixed address on the network, and set your monitor layout — then save it to the box.' },
        { type: 'sim', sim: 'atem', mission: 'showtime', title: 'Stage 3 — build the show, then run it',
          intro: 'Now build the show itself: drag your graphics in, set the name strip up, key the green screen, mix the sound, match the cameras, and point the stream and the recording at the right places. When the rig is ready the clock unlocks, and you direct the whole thing live.' },
        { type: 'quiz', title: 'Stage 4 — written final', bank: 'final', pass: 0.85, count: 14, final: true,
          intro: 'Fourteen questions drawn from the whole course. 85% to pass, and then the certificate is yours.' }
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
