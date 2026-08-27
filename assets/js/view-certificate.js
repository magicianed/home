/* ============================================================
   magicianed - certificate view + PDF export
   ============================================================ */
(function (w) {
  'use strict';
  var el = w.UI.el, clear = w.UI.clear, Sound = w.UI.Sound;

  function fmtDate(ts) {
    var d = new Date(ts);
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  function averageScore() {
    var banks = w.COURSE.modules.filter(function (m) {
      return m.steps.some(function (s) { return s.type === 'quiz'; });
    }).map(function (m) {
      var q = m.steps.filter(function (s) { return s.type === 'quiz'; })[0];
      return q.bank;
    });
    var tot = 0, n = 0;
    banks.forEach(function (b) {
      var q = w.State.quiz(b);
      if (q) { tot += q.best; n++; }
    });
    return n ? Math.round(tot / n * 100) : 0;
  }

  function render(host) {
    var page = el('div', { class: 'page' });
    var wrap = el('div', { class: 'wrapc' });
    page.appendChild(wrap);

    if (!w.COURSE.allDone()) {
      var next = w.COURSE.firstIncomplete();
      var remaining = w.COURSE.totalSteps() - w.COURSE.doneSteps();
      wrap.appendChild(el('div', { style: { maxWidth: '640px' } }, [
        el('span', { class: 'eyebrow', text: 'Certificate' }),
        el('h1', { class: 'hero__title', text: 'Not yet.' }),
        el('p', { class: 'lede', style: { marginBottom: '26px' },
          text: 'The certificate is issued when all thirteen levels are cleared, including the live show and the written final. ' + remaining + ' step' + (remaining === 1 ? '' : 's') + ' to go.' }),
        el('div', { class: 'certlock' }, [
          el('div', { class: 'certlock__ring' }, [el('span', { class: 'mono', text: w.COURSE.pct() + '%' })]),
          el('div', { class: 'grow' }, [
            el('div', { style: { fontSize: '15px', fontWeight: '600' }, text: 'Next: Level ' + next.mod.n + ' · ' + (next.mod.steps[next.step].title || 'Step ' + (next.step + 1)) }),
            el('div', { class: 'muted', style: { fontSize: '13px', marginTop: '3px' }, text: next.mod.title })
          ]),
          el('button', { class: 'btn btn--primary', text: 'Continue →', onclick: function () { w.go('#/m/' + next.mod.id + '/' + next.step); } })
        ])
      ]));
      clear(host).appendChild(page);
      return;
    }

    var cert = w.State.issueCertificate();
    var score = averageScore();
    var finalQ = w.State.quiz('final');
    var finalPct = finalQ ? Math.round(finalQ.best * 100) : 0;

    wrap.appendChild(el('div', { style: { marginBottom: '26px' } }, [
      el('span', { class: 'eyebrow', text: 'Certified' }),
      el('h1', { class: 'hero__title', text: 'You can run the HD8.' }),
      el('p', { class: 'lede', text: 'Thirteen levels, twelve Ponder scenes, thirteen simulations and a written final. The PDF is generated on your machine - nothing is uploaded.' })
    ]));

    /* ---- the certificate ---- */
    var c = el('div', { class: 'cert' }, [
      el('div', { class: 'cert__frame' }, [
        el('div', { class: 'cert__inner' }, [
          el('div', { class: 'cert__top' }, [
            el('div', { class: 'cert__mark' }, [
              el('i', { style: { background: 'var(--pgm)' } }),
              el('i', { style: { background: 'var(--brand)' } }),
              el('i', { style: { background: 'var(--pvw)' } })
            ]),
            el('div', { class: 'cert__brand', text: 'MAGICIANED' })
          ]),
          el('div', { class: 'cert__eyebrow', text: 'Certificate of Completion' }),
          el('div', { class: 'cert__name', text: w.State.fullName() }),
          el('div', { class: 'cert__rule' }),
          el('div', { class: 'cert__body', text: 'has completed the operator mastery course for the' }),
          el('div', { class: 'cert__course', text: 'BLACKMAGIC ATEM' }),
          el('div', { class: 'cert__course cert__course--2', text: 'TELEVISION STUDIO HD8' }),
          el('div', { class: 'cert__meta' }, [
            metaCell('Issued', fmtDate(cert.issuedAt)),
            metaCell('Credential ID', cert.id),
            metaCell('Levels', '13 of 13'),
            metaCell('Written final', finalPct + '%'),
            metaCell('XP earned', String(w.State.xp()))
          ]),
          el('div', { class: 'cert__sig' }, [
            el('div', { class: 'cert__sigline' }),
            el('div', { class: 'cert__sigl', text: 'magicianed · operator certification' })
          ])
        ])
      ])
    ]);
    wrap.appendChild(c);

    wrap.appendChild(el('div', { class: 'row center gap-10 wrap', style: { marginTop: '26px' } }, [
      el('button', {
        class: 'btn btn--primary btn--lg', text: '↓  Download PDF certificate',
        onclick: function () { Sound.good(); makePDF(cert, score, finalPct); }
      }),
      el('button', {
        class: 'btn btn--ghost', text: 'Print this page',
        onclick: function () { w.print(); }
      }),
      el('button', {
        class: 'btn btn--ghost', text: 'Copy credential ID',
        onclick: function () {
          if (navigator.clipboard) navigator.clipboard.writeText(cert.id);
          w.UI.toast('Credential ID copied: ' + cert.id, 'ok');
        }
      })
    ]));

    wrap.appendChild(el('p', { class: 'muted', style: { fontSize: '12.5px', marginTop: '18px', maxWidth: '60ch' },
      text: 'This is a training credential issued by magicianed, not by Blackmagic Design. It records that you completed this course - it is not an official Blackmagic certification.' }));

    clear(host).appendChild(page);
  }

  function metaCell(k, v) {
    return el('div', { class: 'cert__mc' }, [
      el('div', { class: 'cert__mk', text: k }),
      el('div', { class: 'cert__mv', text: v })
    ]);
  }

  /* ============================================================
     PDF
     ============================================================ */
  function makePDF(cert, score, finalPct) {
    var W = 841.89, H = 595.28;
    var d = new w.MiniPDF.Doc(W, H);
    var BLACK = [0, 0, 0], WHITE = [1, 1, 1];
    var GREY = [0.62, 0.62, 0.66], DIM = [0.42, 0.42, 0.47];
    var RED = [0.878, 0.200, 0.169], ACCENT = [0.839, 0.863, 0.890], GREEN = [0.090, 0.655, 0.361];

    /* ground */
    d.rect(0, 0, W, H, BLACK);

    /* frames */
    d.frame(28, 28, W - 56, H - 56, [0.20, 0.20, 0.23], 1);
    d.frame(36, 36, W - 72, H - 72, [0.12, 0.12, 0.14], 0.7);

    /* mark - three bars, top left */
    var mx = 64, my = H - 92;
    d.rect(mx, my, 9, 26, RED);
    d.rect(mx + 13, my, 9, 26, ACCENT);
    d.rect(mx + 26, my, 9, 26, GREEN);
    d.text('MAGICIANED', mx + 46, my + 8, 12, WHITE, { bold: true, track: 260 });

    /* accent rule top right */
    d.rect(W - 64 - 120, my + 12, 120, 2, [0.16, 0.16, 0.19]);
    d.text('OPERATOR CERTIFICATION', W - 64, my + 24, 8, DIM, { align: 'r', track: 180 });

    /* eyebrow */
    d.text('CERTIFICATE OF COMPLETION', W / 2, H - 168, 10.5, GREY, { align: 'c', track: 340 });

    /* name - shrink to fit */
    var name = cert.name;
    var size = 46;
    while (d.textWidth(name, size, true, 0) > W - 200 && size > 20) size -= 1;
    d.text(name, W / 2, H - 232, size, WHITE, { align: 'c', bold: true });

    /* rule under the name */
    var rw = Math.min(W - 220, Math.max(260, d.textWidth(name, size, true, 0) + 80));
    d.rect(W / 2 - rw / 2, H - 256, rw, 1, [0.24, 0.24, 0.28]);
    d.rect(W / 2 - 22, H - 257, 44, 3, RED);

    /* body */
    d.text('has completed the operator mastery course for the', W / 2, H - 292, 12.5, GREY, { align: 'c' });
    d.text('BLACKMAGIC ATEM', W / 2, H - 332, 25, WHITE, { align: 'c', bold: true, track: 60 });
    d.text('TELEVISION STUDIO HD8', W / 2, H - 366, 25, WHITE, { align: 'c', bold: true, track: 60 });

    d.text('Signal flow · rear panel · SDI wiring · video standards · ATEM Setup · Software Control · live switching',
      W / 2, H - 400, 9, DIM, { align: 'c' });
    d.text('transitions and keying · media pool · audio mixing · camera control · streaming · recording · the hardware panel',
      W / 2, H - 414, 9, DIM, { align: 'c' });

    /* meta row */
    var cells = [
      ['ISSUED', fmtDate(cert.issuedAt)],
      ['CREDENTIAL ID', cert.id],
      ['LEVELS', '13 of 13'],
      ['WRITTEN FINAL', finalPct + '%'],
      ['XP EARNED', String(w.State.xp())]
    ];
    var mLeft = 74, mRight = W - 74;
    var span = (mRight - mLeft) / cells.length;
    d.rect(mLeft, 122, mRight - mLeft, 1, [0.16, 0.16, 0.19]);
    cells.forEach(function (c, i) {
      var x = mLeft + span * i;
      d.text(c[0], x, 104, 7.5, DIM, { track: 200 });
      d.text(c[1], x, 86, 11, WHITE, { bold: true });
    });

    /* signature */
    d.rect(mLeft, 60, 150, 1, [0.24, 0.24, 0.28]);
    d.text('magicianed', mLeft, 46, 8.5, DIM, { track: 160 });
    d.text('This is a training credential issued by magicianed. It is not an official Blackmagic Design certification.',
      mRight, 46, 7.5, [0.30, 0.30, 0.34], { align: 'r' });

    d.download('Blackmagic-ATEM-HD8-Certificate-' + cert.name.replace(/[^A-Za-z0-9]+/g, '-') + '.pdf');
    w.UI.toast('<b>Certificate downloaded.</b> Check your Downloads folder.', 'brand', 3600);
  }

  w.ViewCertificate = { render: render };
})(window);
