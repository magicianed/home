/* ============================================================
   magicianed - final exam bank
   One bank, HD8 only. Every question is something that decides
   what you do on show day; nothing is here to pad a word count.
   ============================================================ */
(function (w) {
  'use strict';

  var FINAL = [
    { q: 'The red crosspoint row is:',
      opts: ['On air right now', 'Queued next', 'The recording source', 'The multiview'],
      a: 0, why: 'Red is program. Green is preview.' },

    { q: 'Camera 3 plugs into SDI IN 3. Which output goes back to it?',
      opts: ['SDI OUT 3', 'Program out', 'Aux 1', 'Multiview'],
      a: 0, why: 'Matched numbering, or tally lights the wrong operator.' },

    { q: 'What rides back to the camera on that return cable?',
      opts: ['Program picture, tally and camera control', 'Tally only', 'Audio only', 'Nothing - it is an output'],
      a: 0, why: 'All three on one coax. Skip it and you lose all three.' },

    { q: 'You change the video standard mid-show. What happens?',
      opts: ['Every input drops and recording stops', 'Nothing, it is seamless', 'Only the multiview refreshes', 'Only new inputs are affected'],
      a: 0, why: 'Set it once, at the top of the day.' },

    { q: 'A camera is on 1080i50, the switcher on 1080p50. You see:',
      opts: ['No signal on that input', 'A converted picture', 'Wrong colours', 'A picture in multiview only'],
      a: 0, why: 'Scan type is part of the standard. There is no conversion.' },

    { q: 'You are cutting an interview. What do you use nearly every time?',
      opts: ['CUT', 'A one-second mix', 'A wipe', 'A DVE squeeze'],
      a: 0, why: 'Cutting is the default in live television. Mixes are the exception.' },

    { q: 'You leave the fader bar halfway and walk away. On air:',
      opts: ['Both sources, mixed, indefinitely', 'The program source', 'The preview source', 'Black'],
      a: 0, why: 'It does not spring back.' },

    { q: 'A lower third must survive cuts between cameras. Which keyer?',
      opts: ['A downstream keyer', 'An upstream keyer', 'The transition keyer', 'A chroma keyer'],
      a: 0, why: 'DSKs sit after the transition, so the background changes underneath them.' },

    { q: 'Your PNG lower third has a black fringe round the text. Fix:',
      opts: ['Enable Pre Multiplied Key', 'Re-export at 4K', 'Change the video standard', 'Slow the DSK rate'],
      a: 0, why: 'The classic symptom of an un-ticked pre-multiplied key.' },

    { q: 'Where does media in the pool actually live?',
      opts: ['In the switcher', 'On your laptop, streamed live', 'On the record disk', 'In the cloud'],
      a: 0, why: 'Upload it and you can unplug the laptop.' },

    { q: 'The host mic must be heard on every shot. Set it to:',
      opts: ['ON', 'AFV', 'OFF', 'Gated'],
      a: 0, why: 'ON keeps it in the mix regardless of what is live.' },

    { q: 'What does AFV do?',
      opts: ['Fades the channel up only when that source is on program', 'Boosts the level automatically', 'Applies a preset EQ', 'Mutes the master'],
      a: 0, why: 'Audio follows video. Good for audience cameras, bad as a blanket setting.' },

    { q: 'A sensible peak level for the mix:',
      opts: ['Around -10 dBFS', 'Right at 0 dBFS', 'Around -40 dBFS', 'Whatever avoids red'],
      a: 0, why: 'Leave headroom. Zero is clipping, not loudness.' },

    { q: 'Matching two cameras, what do you set first?',
      opts: ['White balance, to the same fixed kelvin on both', 'Saturation', 'Iris', 'Shutter'],
      a: 0, why: 'Fix white balance to a number - never auto - then black level, then iris.' },

    { q: 'Green tally on a camera means:',
      opts: ['It is on preview', 'It is recording', 'It has a signal fault', 'It is being colour corrected'],
      a: 0, why: 'Red on program, green on preview. Same everywhere on the system.' },

    { q: 'The venue tests at 10 Mb/s upload. Stream at:',
      opts: ['About 5 Mb/s', '10 Mb/s', '16 Mb/s', '1 Mb/s'],
      a: 0, why: 'Roughly half. A stuttering stream looks far worse than a lower-bitrate one.' },

    { q: 'Format the record SSD as:',
      opts: ['exFAT', 'NTFS', 'FAT32', 'ext4'],
      a: 0, why: 'Readable on Windows and Mac, with no practical file size limit.' },

    { q: 'Correct end-of-show order:',
      opts: ['Fade to black, stop stream, stop record, copy the media',
             'Unplug the disk, then stop the record',
             'Stop the record, then fade to black',
             'Power the switcher off first'],
      a: 0, why: 'Get off air cleanly, stop the outputs, then touch the media.' },

    { q: 'The panel has ten crosspoints but twenty sources. You reach the rest with:',
      opts: ['SHIFT', 'A double press', 'The keypad only', 'The software only'],
      a: 0, why: 'Shift swaps the bank, and the little screens relabel to match.' },

    { q: 'You close ATEM Software Control during a live show:',
      opts: ['Nothing happens - the switcher holds its own state', 'Program goes black', 'Recording stops', 'The switcher reboots'],
      a: 0, why: 'The hardware is the source of truth; the software is a window onto it.' }
  ];

  w.QUIZ = {
    bank: function () { return FINAL; },
    pick: function (id, count, seed) {
      var pool = FINAL;
      if (!count || count >= pool.length) return w.UI.shuffle(pool, seed);
      return w.UI.shuffle(pool, seed).slice(0, count);
    }
  };
})(window);
