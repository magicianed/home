/* ============================================================
   magicianed - onboarding gate, dashboard, reference deck
   ============================================================ */
(function (w) {
  'use strict';
  var el = w.UI.el, clear = w.UI.clear, Sound = w.UI.Sound;

  /* ============================================================
     ONBOARDING
     ============================================================ */
  function renderGate(host, onDone) {
    var first = el('input', { class: 'input', type: 'text', placeholder: 'Liam', autocomplete: 'given-name', maxlength: '40' });
    var last = el('input', { class: 'input', type: 'text', placeholder: 'Fitzgerald', autocomplete: 'family-name', maxlength: '40' });
    var err = el('div', { class: 'gate__err' });

    function submit() {
      var f = first.value.trim(), l = last.value.trim();
      first.classList.remove('is-bad'); last.classList.remove('is-bad');
      if (f.length < 2) { first.classList.add('is-bad'); err.textContent = 'Enter your first name.'; first.focus(); Sound.bad(); return; }
      if (l.length < 2) { last.classList.add('is-bad'); err.textContent = 'Enter your last name.'; last.focus(); Sound.bad(); return; }
      if (!/^[\p{L}\p{M}'\-. ]+$/u.test(f + l)) { err.textContent = 'Letters, spaces, hyphens and apostrophes only - this goes on your certificate.'; Sound.bad(); return; }
      w.State.setIdentity(f, l);
      Sound.good();
      onDone();
    }
    [first, last].forEach(function (i) {
      i.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    });

    var box = el('div', { class: 'gate__box' }, [
      el('div', { class: 'gate__mark' }, [
        el('i', { style: { background: 'var(--pgm)', height: '12px' } }),
        el('i', { style: { background: 'var(--brand)', height: '26px' } }),
        el('i', { style: { background: 'var(--pvw)', height: '18px' } })
      ]),
      el('div', { class: 'eyebrow gate__eyebrow', text: 'magicianed · operator certification' }),
      el('h1', { class: 'gate__title', html: 'Blackmagic ATEM<br>Television Studio <em>HD8</em>' }),
      el('p', { class: 'gate__sub', text: 'Thirteen modules from rack rails to a finished Resolve timeline, taught with 1:1 simulations of the hardware and the software. Your name goes on the certificate at the end, so spell it the way you want it printed.' }),
      el('div', { class: 'gate__grid' }, [
        el('div', { class: 'field' }, [el('span', { class: 'field__label', text: 'First name' }), first]),
        el('div', { class: 'field' }, [el('span', { class: 'field__label', text: 'Last name' }), last])
      ]),
      err,
      el('button', { class: 'btn btn--primary btn--lg btn--block', text: 'Begin the course', onclick: submit }),
      el('p', { class: 'gate__note', text: 'Progress is saved in this browser only - no account, no server, nothing leaves your machine. Clearing site data clears your progress.' })
    ]);

    clear(host).appendChild(el('div', { class: 'gate' }, [box]));
    setTimeout(function () { first.focus(); }, 340);
  }

  /* ============================================================
     DASHBOARD
     ============================================================ */
  function accentVar(a) {
    return { brand: 'var(--brand)', info: 'var(--info)', key: 'var(--key)', audio: 'var(--audio)',
             pgm: 'var(--pgm)', pvw: 'var(--pvw)', iso: 'var(--iso)' }[a] || 'var(--brand)';
  }

  function renderDashboard(host) {
    var page = el('div', { class: 'page' });
    var wrap = el('div', { class: 'wrapc' });
    page.appendChild(wrap);

    var pct = w.COURSE.pct();
    var mods = w.COURSE.modules;
    var doneMods = mods.filter(function (m) { return w.COURSE.moduleDone(m); }).length;

    wrap.appendChild(el('div', { class: 'hero' }, [
      el('div', { class: 'hero__l' }, [
        el('span', { class: 'eyebrow', text: 'Operator certification' }),
        el('h1', { class: 'hero__title', text: (pct === 0 ? 'Welcome, ' : (pct === 100 ? 'Certified, ' : 'Back at it, ')) + w.State.raw.firstName + '.' }),
        el('p', { class: 'lede', text: pct === 100
          ? 'You have finished every module. Your certificate is ready to download.'
          : 'Thirteen modules covering the ATEM Television Studio HD8 end to end: the box, the wiring, the software, the audio, the stream and the edit that comes after.' })
      ]),
      el('div', { class: 'hero__stats' }, [
        el('div', { class: 'stat stat--brand' }, [el('div', { class: 'stat__k', text: pct + '%' }), el('div', { class: 'stat__l', text: 'Complete' })]),
        el('div', { class: 'stat stat--green' }, [el('div', { class: 'stat__k', text: doneMods + '/' + mods.length }), el('div', { class: 'stat__l', text: 'Modules' })]),
        el('div', { class: 'stat stat--blue' }, [el('div', { class: 'stat__k', text: w.State.timeLabel() }), el('div', { class: 'stat__l', text: 'Time on task' })])
      ])
    ]));

    /* resume */
    var next = w.COURSE.firstIncomplete();
    if (next) {
      wrap.appendChild(el('button', {
        class: 'resume', style: { width: '100%', textAlign: 'left' },
        onclick: function () { w.go('#/m/' + next.mod.id + '/' + next.step); }
      }, [
        el('div', { class: 'resume__ico', text: '▶' }),
        el('div', { class: 'grow' }, [
          el('div', { class: 'eyebrow', text: pct === 0 ? 'Start here' : 'Pick up where you left off' }),
          el('div', { style: { fontSize: '17px', fontWeight: '620', letterSpacing: '-.018em', marginTop: '4px' },
            text: 'Module ' + next.mod.n + ' · ' + (next.mod.steps[next.step].title || 'Step ' + (next.step + 1)) }),
          el('div', { class: 'muted', style: { fontSize: '13px', marginTop: '3px' }, text: next.mod.title })
        ]),
        el('span', { class: 'chip chip--brand', text: 'Continue' })
      ]));
    } else {
      wrap.appendChild(el('button', {
        class: 'resume', style: { width: '100%', textAlign: 'left', borderColor: '#17573a' },
        onclick: function () { w.go('#/certificate'); }
      }, [
        el('div', { class: 'resume__ico', style: { background: 'var(--pvw-dim)', borderColor: '#17573a', color: 'var(--pvw)' }, text: '★' }),
        el('div', { class: 'grow' }, [
          el('div', { class: 'eyebrow', text: 'Course complete' }),
          el('div', { style: { fontSize: '17px', fontWeight: '620', letterSpacing: '-.018em', marginTop: '4px' }, text: 'Your HD8 operator certificate is ready' })
        ]),
        el('span', { class: 'chip chip--pvw', text: 'View' })
      ]));
    }

    /* track bar */
    var track = el('div', { class: 'trackbar' });
    mods.forEach(function (m) {
      var cls = w.COURSE.moduleDone(m) ? 'on' : (next && next.mod.id === m.id ? 'cur' : '');
      track.appendChild(el('span', { class: cls, title: 'Module ' + m.n + ' - ' + m.title }));
    });
    wrap.appendChild(track);

    /* module grid */
    var grid = el('div', { class: 'modgrid' });
    mods.forEach(function (m) {
      var unlocked = w.COURSE.moduleUnlocked(m);
      var done = w.COURSE.moduleDone(m);
      var mp = Math.round(w.COURSE.moduleProgress(m) * 100);
      var card = el('button', {
        class: 'modcard' + (unlocked ? '' : ' is-locked'),
        onclick: function () {
          if (!unlocked) { Sound.bad(); w.UI.toast('Finish module ' + prevN(m) + ' first - each one builds on the last.', 'info'); return; }
          w.go('#/m/' + m.id + '/' + firstOpenStep(m));
        }
      });
      card.appendChild(el('div', { class: 'modcard__stripe', style: { background: done ? 'var(--pvw)' : (mp > 0 ? accentVar(m.accent) : 'var(--surface-4)'), width: done ? '100%' : mp + '%' } }));
      card.appendChild(el('div', { class: 'modcard__body' }, [
        el('div', { class: 'modcard__top' }, [
          el('span', { class: 'modcard__n', text: 'MODULE ' + m.n }),
          done ? el('span', { class: 'modcard__check', text: '✓' }) : (unlocked ? null : el('span', { class: 'modcard__n', text: 'LOCKED' }))
        ]),
        el('div', { class: 'modcard__t', text: m.title }),
        el('div', { class: 'modcard__d', text: m.blurb }),
        el('div', { class: 'modcard__foot' }, m.tags.map(function (t) {
          return el('span', { class: 'modcard__pill', text: t });
        }).concat([mp > 0 && !done ? el('span', { class: 'modcard__pill', style: { color: accentVar(m.accent), borderColor: accentVar(m.accent) }, text: mp + '%' }) : null]))
      ]));
      grid.appendChild(card);
    });
    wrap.appendChild(grid);

    clear(host).appendChild(page);
  }
  function prevN(m) {
    var i = w.COURSE.index(m.id);
    return i > 0 ? w.COURSE.modules[i - 1].n : '01';
  }
  function firstOpenStep(m) {
    for (var i = 0; i < m.steps.length; i++) if (!w.State.isStepDone(m.id, i)) return i;
    return 0;
  }

  /* ============================================================
     REFERENCE DECK
     ============================================================ */
  var CARDS = [
    ['How many SDI inputs does the HD8 have?', '8, auto-detecting 1.5G and 3G-SDI level A or B, each with 4 channels of embedded audio.'],
    ['Red row / green row', 'Red = Program = on air. Green = Preview = next. Same language on the panel, the multiview and the tally lights.'],
    ['Upstream vs downstream keyers', 'Upstream (4) sit before the transition and travel with it. Downstream (2) sit after, so lower thirds survive a cut.'],
    ['Video standards', 'HD only, up to 1080p60. 50 Hz regions use 1080p50; North America uses 1080p59.94.'],
    ['What does changing the video standard do?', 'Drops every input, blanks the multiview, and stops any recording or stream. Set it once, first thing.'],
    ['Media pool capacity', '20 stills and 2 clips, feeding 2 media players. Stills: PNG, TGA, BMP, GIF, JPEG, TIFF.'],
    ['Clip length limits', '200 frames at 1080, 400 frames at 720.'],
    ['Audio channel states', 'ON = always in the mix. AFV = audio follows video. OFF = never.'],
    ['Target audio level', 'Peaks around -10 dBFS, loudest moments touching -6. Never 0.'],
    ['Mix-minus', 'Each contributor hears programme minus their own voice. Without it you get echo.'],
    ['Mixer size', '58 channels, 6-band parametric EQ, expander, gate, compressor and limiter on every channel.'],
    ['What the SDI return carries', 'Program picture, tally, and camera control - all on the one coax back to the camera.'],
    ['Streaming protocol', 'RTMP over ethernet, or a shared internet connection over USB-C.'],
    ['Bitrate rule of thumb', 'Test the real upload at the venue and stream at about half of it.'],
    ['Record disk format', 'exFAT - readable by Windows and macOS, no meaningful file size limit.'],
    ['What ISO recording writes', '8 input .mp4 files, separate 24-bit 48 kHz .wav files, the program .mp4, a DaVinci Resolve .drp project, and a media folder.'],
    ['Getting the show into Resolve', 'Copy the whole folder, then File → Import Project and choose the .drp.'],
    ['Pre Multiplied Key', 'Tick it for any graphic exported with an alpha channel. It handles clip and gain for you.'],
    ['Transition styles', 'MIX, DIP, WIPE, STING (a media pool clip), DVE.'],
    ['Panel shift', '10 physical crosspoints, 20 addressable sources. SHIFT reaches the second bank and the LCD labels follow.'],
    ['Powering the HD8', 'IEC mains and 12V DC. Connect both for redundancy. There is no power switch.'],
    ['How many ethernet ports?', 'Four, on a built-in gigabit network switch.'],
    ['Multiview layouts', '4, 7, 10, 13 or 16 up, on both an SDI and an HDMI output.'],
    ['Chroma key order of work', 'Light the screen evenly, set the fill source, sample clean green, tune foreground/background, tighten the edge, kill the spill.'],
    ['Which keyer for a picture-in-picture?', 'A DVE key on an upstream keyer - the HD8 has two DVEs.'],
    ['End of show order', 'Fade to black, stop the stream, stop the record, then copy the media to two places.']
  ];

  function renderReference(host) {
    var page = el('div', { class: 'page' });
    var wrap = el('div', { class: 'wrapc' });
    wrap.appendChild(el('div', { style: { marginBottom: '28px' } }, [
      el('span', { class: 'eyebrow', text: 'Reference' }),
      el('h1', { class: 'hero__title', text: 'Reference deck' }),
      el('p', { class: 'lede', text: 'Twenty-six flashcards covering the facts you will want in your head on show day. Click a card to flip it.' })
    ]));
    var deck = el('div', { class: 'deck' });
    CARDS.forEach(function (c) {
      var card = el('div', { class: 'flip' }, [
        el('div', { class: 'flip__in' }, [
          el('div', { class: 'flip__f' }, [
            el('div', { class: 'flip__q', text: c[0] }),
            el('div', { class: 'flip__hint', text: 'click to reveal' })
          ]),
          el('div', { class: 'flip__b' }, [
            el('div', { class: 'flip__a', text: c[1] }),
            el('div', { class: 'flip__hint', text: 'click to flip back' })
          ])
        ])
      ]);
      card.onclick = function () { card.classList.toggle('is-flipped'); Sound.tap(); };
      deck.appendChild(card);
    });
    wrap.appendChild(deck);
    page.appendChild(wrap);
    clear(host).appendChild(page);
  }

  w.ViewDashboard = { gate: renderGate, dashboard: renderDashboard, reference: renderReference };
})(window);
