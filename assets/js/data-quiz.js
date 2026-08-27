/* ============================================================
   magicianed - knowledge checks
   Section checks need 100%. Every question carries a pointer back
   to the exact step that taught it, so a wrong answer becomes a
   link rather than a dead end.
   ============================================================ */
(function (w) {
  'use strict';

  var BANKS = {

  /* ---- after level 3: the box and the cables ---- */
  s1: [
    { q: 'The red row of buttons is:',
      opts: ['What the audience is watching right now', 'What you have lined up next', 'The recording', 'The sound mixer'],
      a: 0, why: 'Red is live. Green is what goes next, and nobody sees it.',
      learn: { mod: 'm01', step: 0 } },
    { q: 'How many cameras can go out to the audience at the same time?',
      opts: ['One', 'Two', 'Four', 'All eight'],
      a: 0, why: 'Choosing which single picture leaves the building is the whole job of the box.',
      learn: { mod: 'm01', step: 0 } },
    { q: 'What is the red lamp on top of a camera for?',
      opts: ['It tells that operator they are live', 'It shows the camera is recording', 'It means a fault', 'It shows the camera is charging'],
      a: 0, why: 'The switcher lights it automatically, down the cable you already ran.',
      learn: { mod: 'm01', step: 0 } },
    { q: 'The sockets marked SDI OUT on the back are for:',
      opts: ['Sending a picture back to each camera', 'Eight copies of the show', 'Connecting eight microphones', 'Recording to eight drives'],
      a: 0, why: 'One return cable per camera, so the operator can see what is on air.',
      learn: { mod: 'm02', step: 0 } },
    { q: 'Why plug in both power sockets?',
      opts: ['So one can fail without the show stopping', 'It makes the picture better', 'It charges faster', 'One is for sound'],
      a: 0, why: 'Mains and DC together means a lost plug is not a lost show.',
      learn: { mod: 'm02', step: 0 } },
    { q: 'Camera 3 plugs into input socket 3. Which socket sends a picture back to it?',
      opts: ['Output 3', 'The programme output', 'Output 1', 'The network socket'],
      a: 0, why: 'Keep the numbers together or the red lamp lights on the wrong camera.',
      learn: { mod: 'm03', step: 0 } },
    { q: 'Besides the picture, what else travels down that return cable?',
      opts: ['The red lamp signal and the camera controls', 'Only the red lamp', 'Sound only', 'Nothing else'],
      a: 0, why: 'Three jobs, one cable. That is why the return is worth running.',
      learn: { mod: 'm03', step: 0 } }
  ],

  /* ---- after level 5: setting it up ---- */
  s2: [
    { q: 'What does 1080p50 describe?',
      opts: ['The size and speed of the picture', 'The brand of camera', 'The length of the show', 'The volume'],
      a: 0, why: '1080 is how tall the picture is; 50 is how many pictures every second.',
      learn: { mod: 'm04', step: 0 } },
    { q: 'A camera is set to 1080i50 while the switcher is on 1080p50. What do you see?',
      opts: ['Nothing at all on that input', 'A slightly worse picture', 'A warning message', 'The wrong colours'],
      a: 0, why: 'One letter different and it simply does not appear. No warning, no clue.',
      learn: { mod: 'm04', step: 0 } },
    { q: 'When should you choose the picture format?',
      opts: ['First, before anything else', 'Just before you go live', 'After the cameras are plugged in', 'It does not matter'],
      a: 0, why: 'Changing it later drops every camera and stops any recording.',
      learn: { mod: 'm04', step: 0 } },
    { q: 'How many pages does the ATEM Software Control app have?',
      opts: ['Four: Switcher, Media, Audio, Camera', 'Two', 'Eight', 'One'],
      a: 0, why: 'Same four on every ATEM ever made.',
      learn: { mod: 'm05', step: 0 } },
    { q: 'You close the app on your laptop during a live show. What happens?',
      opts: ['Nothing — the switcher carries on by itself', 'The show goes black', 'Recording stops', 'The switcher restarts'],
      a: 0, why: 'The box remembers everything. The app is only a window onto it.',
      learn: { mod: 'm05', step: 0 } },
    { q: 'Which page would you use to change a camera’s brightness?',
      opts: ['Camera', 'Switcher', 'Media', 'Audio'],
      a: 0, why: 'And it travels back down the cable you already ran to that camera.',
      learn: { mod: 'm05', step: 0 } }
  ],

  /* ---- after level 8: running pictures and graphics ---- */
  s3: [
    { q: 'You are cutting between people talking. Which button do you use nearly every time?',
      opts: ['CUT', 'AUTO', 'The slider', 'FTB'],
      a: 0, why: 'An instant change is invisible to the audience. Fades are the exception.',
      learn: { mod: 'm06', step: 0 } },
    { q: 'You leave the slider halfway and walk away. What is on screen?',
      opts: ['Both shots at once, indefinitely', 'The live shot', 'The next shot', 'Black'],
      a: 0, why: 'It stays exactly where you leave it.',
      learn: { mod: 'm06', step: 0 } },
    { q: 'FTB stands for:',
      opts: ['Fade To Black', 'Full Time Broadcast', 'Fade To Blue', 'Freeze The Background'],
      a: 0, why: 'Picture and sound to nothing, and it holds there. Your emergency stop.',
      learn: { mod: 'm06', step: 0 } },
    { q: 'A name strip needs to stay on screen while you cut between cameras. It must be on:',
      opts: ['A late layer, above the change of shot', 'An early layer, below the change of shot', 'The camera itself', 'The audio page'],
      a: 0, why: 'Late layers sit above the transition, so the picture can change underneath them.',
      learn: { mod: 'm07', step: 0 } },
    { q: 'A chroma key does what?',
      opts: ['Removes one colour from a picture, usually green', 'Locks the camera settings', 'Makes the picture brighter', 'Adds a border'],
      a: 0, why: 'Sample the green, and everything that colour disappears.',
      learn: { mod: 'm07', step: 0 } },
    { q: 'Your name strip has a black outline around the text. What fixes it?',
      opts: ['Switching on Pre Multiplied Key', 'Making the file bigger', 'Changing the video format', 'Using a JPEG'],
      a: 0, why: 'One tick. It tells the switcher how the see-through part was saved.',
      learn: { mod: 'm08', step: 0 } },
    { q: 'Where does a picture live once you have dragged it into a slot?',
      opts: ['Inside the switcher', 'On your laptop', 'On the recording drive', 'On the internet'],
      a: 0, why: 'Which is why you can unplug the laptop and the graphic still works.',
      learn: { mod: 'm08', step: 0 } },
    { q: 'What size should you save a graphic for a 1080p50 show?',
      opts: ['1920 by 1080', '1280 by 720', '3840 by 2160', 'Any size'],
      a: 0, why: 'Match the show exactly, or the switcher has to stretch it.',
      learn: { mod: 'm08', step: 0 } }
  ],

  /* ---- after level 12: sound, cameras, output, panel ---- */
  s4: [
    { q: 'The presenter must be heard on every shot. Set their microphone to:',
      opts: ['ON', 'AFV', 'OFF', 'It does not matter'],
      a: 0, why: 'ON means always heard, whichever camera is live.',
      learn: { mod: 'm09', step: 0 } },
    { q: 'AFV stands for:',
      opts: ['Audio Follows Video', 'Automatic Fader Volume', 'Audio From VTR', 'Amplified Feed Voltage'],
      a: 0, why: 'That source is only heard while its camera is on screen.',
      learn: { mod: 'm09', step: 0 } },
    { q: 'Where should the loudest moment of your show sit?',
      opts: ['A little below the top of the meter', 'Right at the top', 'Halfway', 'As low as possible'],
      a: 0, why: 'Touch the top and the sound breaks up. Leave yourself room.',
      learn: { mod: 'm09', step: 0 } },
    { q: 'When matching two cameras, what do you set first?',
      opts: ['Colour temperature, by hand, the same on both', 'Saturation', 'Iris', 'Zoom'],
      a: 0, why: 'Never automatic — pick a number and use it on every camera.',
      learn: { mod: 'm10', step: 0 } },
    { q: 'A green lamp on a camera means:',
      opts: ['It is lined up to go next', 'It is recording', 'It has a fault', 'It is switched off'],
      a: 0, why: 'Red is live, green is next. Same everywhere on the system.',
      learn: { mod: 'm10', step: 0 } },
    { q: 'The venue’s internet uploads at 10 Mb/s. What should you stream at?',
      opts: ['About 5 Mb/s', '10 Mb/s', '16 Mb/s', 'As high as possible'],
      a: 0, why: 'Roughly half. A stream that stutters looks far worse than a softer one.',
      learn: { mod: 'm11', step: 0 } },
    { q: 'Format the recording drive as:',
      opts: ['exFAT', 'NTFS', 'FAT32', 'It does not matter'],
      a: 0, why: 'exFAT is the one both Windows and Mac can open.',
      learn: { mod: 'm11', step: 0 } },
    { q: 'The correct order at the end of a show:',
      opts: ['Fade to black, stop the stream, stop the recording',
             'Stop the recording, then fade to black',
             'Unplug the drive, then stop the recording',
             'Turn the switcher off'],
      a: 0, why: 'Get off air first. Touch the media last.',
      learn: { mod: 'm11', step: 0 } },
    { q: 'The panel has ten buttons but twenty things to pick. How do you reach the rest?',
      opts: ['Hold SHIFT', 'Press twice', 'Use the app instead', 'You cannot'],
      a: 0, why: 'And the little screens above relabel themselves so you never guess.',
      learn: { mod: 'm12', step: 0 } }
  ]
  };

  /* the written final draws from everything, plus a few that only make
     sense once you have run a show end to end */
  var FINAL_EXTRA = [
    { q: 'Mid-show a camera vanishes from your monitor. What do you check first?',
      opts: ['Power, the cable at both ends, and whether its format changed',
             'The stream key', 'The graphics', 'The audio page'],
      a: 0, why: 'Work the chain in order. It is nearly always power, cable or format.' },
    { q: 'Your stream is stuttering for viewers. First fix?',
      opts: ['Lower the streaming quality setting', 'Restart the switcher', 'Change the video format', 'Turn off the graphics'],
      a: 0, why: 'Stuttering is bandwidth. Send less and it steadies.' },
    { q: 'A second person wants to run graphics from their own laptop. Possible?',
      opts: ['Yes — two copies of the app can connect at once', 'No', 'Only over USB', 'Only with extra hardware'],
      a: 0, why: 'Just agree who is driving what before you do it.' },
    { q: 'Which single decision, made wrongly at the start, costs you the most time?',
      opts: ['The picture format', 'The transition length', 'The monitor layout', 'The switcher’s name'],
      a: 0, why: 'Change it later and every camera drops out.' },
    { q: 'You have stopped recording. What next?',
      opts: ['Copy the folder to two places before you unplug anything',
             'Unplug the drive', 'Start editing from the drive', 'Reformat the drive'],
      a: 0, why: 'The show only exists once until you have copied it.' }
  ];

  function all() {
    var out = [];
    Object.keys(BANKS).forEach(function (k) { out = out.concat(BANKS[k]); });
    return out.concat(FINAL_EXTRA);
  }

  w.QUIZ = {
    bank: function (id) { return id === 'final' ? all() : (BANKS[id] || []); },
    pick: function (id, count, seed) {
      var pool = w.QUIZ.bank(id);
      if (!count || count >= pool.length) return w.UI.shuffle(pool, seed);
      return w.UI.shuffle(pool, seed).slice(0, count);
    }
  };
})(window);
