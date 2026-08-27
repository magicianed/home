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
    var first = el('input', { class: 'input', type: 'text', placeholder: 'Your first name', autocomplete: 'given-name', maxlength: '40' });
    var last = el('input', { class: 'input', type: 'text', placeholder: 'Your last name', autocomplete: 'family-name', maxlength: '40' });
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
      el('p', { class: 'gate__sub', text: 'Thirteen levels. Watch how it works, then do it yourself on a working recreation of the real switcher. Your name goes on the certificate, so spell it how you want it printed.' }),
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
          ? 'Every level cleared. Your certificate is ready.'
          : 'Thirteen levels. Watch it happen, then do it yourself on a working recreation of the real thing.' })
      ]),
      el('div', { class: 'hero__stats' }, [
        el('div', { class: 'stat stat--brand' }, [el('div', { class: 'stat__k', text: String(w.State.xp()) }), el('div', { class: 'stat__l', text: 'XP · ' + w.State.level().name })]),
        el('div', { class: 'stat stat--green' }, [el('div', { class: 'stat__k', text: doneMods + '/' + mods.length }), el('div', { class: 'stat__l', text: 'Levels cleared' })]),
        el('div', { class: 'stat stat--blue' }, [el('div', { class: 'stat__k', text: pct + '%' }), el('div', { class: 'stat__l', text: 'Complete' })])
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
            text: 'Level ' + next.mod.n + ' · ' + (next.mod.steps[next.step].title || 'Step ' + (next.step + 1)) }),
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
      track.appendChild(el('span', { class: cls, title: 'Level ' + m.n + ' - ' + m.title }));
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
          if (!unlocked) { Sound.bad(); w.UI.toast('Finish level ' + prevN(m) + ' first.', 'info'); return; }
          w.go('#/m/' + m.id + '/' + firstOpenStep(m));
        }
      });
      card.appendChild(el('div', { class: 'modcard__stripe', style: { background: done ? 'var(--pvw)' : (mp > 0 ? accentVar(m.accent) : 'var(--surface-4)'), width: done ? '100%' : mp + '%' } }));
      card.appendChild(el('div', { class: 'modcard__body' }, [
        el('div', { class: 'modcard__top' }, [
          el('span', { class: 'modcard__n', text: 'LEVEL ' + m.n }),
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
    ['Red row / green row', 'Red = program = on air. Green = preview = next. Same language on the panel, the multiview and the tally lights.'],
    ['How many SDI inputs?', 'Eight, plus eight outputs used as one return per camera.'],
    ['What the return carries', 'Program picture, tally and camera control - all on the one coax back to the camera.'],
    ['Video standards', 'HD only, up to 1080p60. 50 Hz regions use 1080p50; North America uses 1080p59.94.'],
    ['Changing the video standard', 'Drops every input, blanks the multiview, stops any recording or stream. Do it first thing.'],
    ['Upstream vs downstream keys', 'Upstream (4) sit before the transition and travel with it. Downstream (2) sit after, so lower thirds survive a cut.'],
    ['Media pool', '20 stills and 2 clips, feeding 2 media players. PNG with alpha for anything transparent.'],
    ['Pre Multiplied Key', 'Tick it for any graphic exported with an alpha channel, or you get a black halo.'],
    ['Audio channel states', 'ON = always in the mix. AFV = only when that source is live. OFF = never.'],
    ['Target audio level', 'Peaks around -10 dBFS, loudest moment near -6. Never 0.'],
    ['Matching cameras', 'White balance to a fixed kelvin, then master black, then iris. Never auto.'],
    ['Streaming', 'RTMP straight out of the box. Stream at about half your measured upload.'],
    ['Record disk', 'USB-C SSD, formatted exFAT so Windows and Mac can both read it.'],
    ['Panel shift', '10 buttons, 20 sources. SHIFT reaches the second bank and the labels follow.'],
    ['Powering the HD8', 'IEC mains and 12V DC. Wire both for redundancy. There is no power switch.'],
    ['End of show', 'Fade to black, stop the stream, stop the record, then copy the media.']
  ];

  function renderReference(host) {
    var page = el('div', { class: 'page' });
    var wrap = el('div', { class: 'wrapc' });
    wrap.appendChild(el('div', { style: { marginBottom: '28px' } }, [
      el('span', { class: 'eyebrow', text: 'Reference' }),
      el('h1', { class: 'hero__title', text: 'Cheat sheet' }),
      el('p', { class: 'lede', text: 'Sixteen cards worth keeping in your head on show day. Click one to flip it.' })
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
