/* ============================================================
   magicianed - lesson view
   Renders one module: its step list, and whichever step is open
   (prose, video, quiz or simulation).
   ============================================================ */
(function (w) {
  'use strict';
  var el = w.UI.el, clear = w.UI.clear, Sound = w.UI.Sound;

  var live = null;   /* the currently mounted sub-simulation */

  function destroyLive() {
    if (live && live.destroy) { try { live.destroy(); } catch (e) {} }
    live = null;
  }

  function accentVar(a) {
    return { brand: 'var(--brand)', info: 'var(--info)', key: 'var(--key)', audio: 'var(--audio)',
             pgm: 'var(--pgm)', pvw: 'var(--pvw)', iso: 'var(--iso)' }[a] || 'var(--brand)';
  }

  function render(host, mod, stepIdx) {
    destroyLive();
    stepIdx = w.UI.clamp(stepIdx | 0, 0, mod.steps.length - 1);
    var step = mod.steps[stepIdx];

    /* simulations need the room - they get the full column with the
       step list collapsed into a strip under the header */
    var isSim = step.type === 'sim';
    var page = el('div', { class: 'page' });
    var wrapper = el('div', { class: isSim ? 'wrapc wrapc--wide' : 'wrapc' });
    page.appendChild(wrapper);

    /* ---- head ---- */
    var head = el('div', { class: 'lesson__head' }, [
      el('div', { class: 'row center gap-10 wrap' }, [
        el('span', { class: 'eyebrow', text: 'Module ' + mod.n }),
        el('span', { class: 'chip', style: { color: accentVar(mod.accent), borderColor: accentVar(mod.accent) }, text: mod.tags.join(' · ') })
      ]),
      el('h1', { class: 'lesson__title', text: mod.title }),
      el('p', { class: 'lede', text: mod.blurb })
    ]);

    /* ---- side step list ---- */
    var side = el('div', { class: isSim ? 'lesson__strip' : 'lesson__side' });
    var steplist = el('div', { class: 'steplist' + (isSim ? ' steplist--row' : '') },
      [el('div', { class: 'steplist__t', text: 'Steps' })]);
    mod.steps.forEach(function (st, i) {
      var done = w.State.isStepDone(mod.id, i);
      var prevDone = i === 0 || w.State.isStepDone(mod.id, i - 1);
      var b = el('button', {
        class: 'steprow' + (i === stepIdx ? ' is-active' : '') + (done ? ' is-done' : '') + (!done && !prevDone && i > stepIdx ? ' is-locked' : ''),
        onclick: function () { w.go('#/m/' + mod.id + '/' + i); }
      }, [
        el('i', { class: 'steprow__i', text: '✓' }),
        el('span', { class: 'grow', text: st.title || stepTypeName(st) })
      ]);
      steplist.appendChild(b);
    });
    side.appendChild(steplist);

    var pct = Math.round(w.COURSE.moduleProgress(mod) * 100);
    side.appendChild(el('div', { style: { marginTop: '20px' } }, [
      el('div', { class: 'simprog' }, [
        el('div', { class: 'simprog__bar' }, [el('i', { style: { width: pct + '%', background: accentVar(mod.accent) } })]),
        el('span', { class: 'mono', text: pct + '%' })
      ])
    ]));

    /* ---- body ---- */
    var main = el('div', { class: 'lesson__main' });
    var bodyHost = el('div', { class: 'step' });
    main.appendChild(bodyHost);

    var nav = el('div', { class: 'stepnav' });
    main.appendChild(nav);

    wrapper.appendChild(head);
    if (isSim) {
      wrapper.appendChild(side);
      wrapper.appendChild(main);
    } else {
      wrapper.appendChild(el('div', { class: 'lesson' }, [main, side]));
    }
    clear(host).appendChild(page);

    /* ---- build the step ---- */
    var canAdvance = w.State.isStepDone(mod.id, stepIdx);

    function complete(msg) {
      if (w.State.markStep(mod.id, stepIdx)) {
        w.UI.toast(msg || '<b>Step complete.</b>', 'brand', 3000);
      }
      canAdvance = true;
      paintNav();
      w.refreshChrome();
    }
    w.__lessonComplete = complete;

    if (step.type === 'prose') {
      bodyHost.appendChild(el('div', { class: 'step__k' }, [
        el('span', { class: 'chip chip--info', text: 'Read' }),
        el('span', { class: 'muted', style: { fontSize: '13px' }, text: step.title })
      ]));
      bodyHost.appendChild(el('div', { class: 'prose', html: step.html }));
      /* reading steps complete on an explicit acknowledgement */
    } else if (step.type === 'video') {
      bodyHost.appendChild(el('div', { class: 'step__k' }, [
        el('span', { class: 'chip chip--info', text: 'Watch' }),
        el('span', { class: 'muted', style: { fontSize: '13px' }, text: step.title })
      ]));
      bodyHost.appendChild(el('p', { class: 'lede', style: { marginBottom: '20px' }, text: step.intro }));
      var vh = el('div');
      bodyHost.appendChild(vh);
      live = w.ViewVideo.mount(vh, { video: step.video, onComplete: function () { complete('<b>Video complete.</b> Every checkpoint passed.'); } });
    } else if (step.type === 'quiz') {
      bodyHost.appendChild(renderQuiz(mod, step, complete));
    } else if (step.type === 'sim') {
      bodyHost.appendChild(el('div', { class: 'step__k' }, [
        el('span', { class: 'chip chip--brand', text: 'Simulation' }),
        el('span', { class: 'muted', style: { fontSize: '13px' }, text: step.title })
      ]));
      if (step.intro) bodyHost.appendChild(el('p', { class: 'lede', style: { marginBottom: '20px' }, text: step.intro }));
      var sh = el('div');
      bodyHost.appendChild(sh);
      var done = function () { complete('<b>Simulation passed.</b>'); };
      if (step.sim === 'rear') live = w.SimRear.mount(sh, { onComplete: done });
      else if (step.sim === 'wiring') live = w.SimWiring.mount(sh, { level: step.level || 1, onComplete: done });
      else if (step.sim === 'panel') live = w.SimPanel.mount(sh, { onComplete: done });
      else if (step.sim === 'atem') live = w.SimATEM.mount(sh, { mission: step.mission, onComplete: done });
      else live = w.SimWindows.mount(sh, { mission: step.sim, onComplete: done });
    }

    /* ---- nav ---- */
    function paintNav() {
      clear(nav);
      if (stepIdx > 0) {
        nav.appendChild(el('button', {
          class: 'btn btn--ghost', text: '← Previous',
          onclick: function () { w.go('#/m/' + mod.id + '/' + (stepIdx - 1)); }
        }));
      }
      if (step.type === 'prose' && !canAdvance) {
        nav.appendChild(el('button', {
          class: 'btn btn--primary', text: 'I have read this →',
          onclick: function () { Sound.good(); complete('<b>Noted.</b> On to the next step.'); }
        }));
      }
      if (canAdvance) {
        var idx = w.COURSE.index(mod.id);
        var isLast = stepIdx === mod.steps.length - 1;
        if (!isLast) {
          nav.appendChild(el('button', {
            class: 'btn btn--primary', text: 'Next step →',
            onclick: function () { w.go('#/m/' + mod.id + '/' + (stepIdx + 1)); }
          }));
        } else if (idx < w.COURSE.modules.length - 1) {
          var nxt = w.COURSE.modules[idx + 1];
          nav.appendChild(el('button', {
            class: 'btn btn--primary', text: 'Module ' + nxt.n + ': ' + nxt.title + ' →',
            onclick: function () { w.go('#/m/' + nxt.id + '/0'); }
          }));
        } else if (w.COURSE.allDone()) {
          nav.appendChild(el('button', {
            class: 'btn btn--primary', text: 'Claim your certificate →',
            onclick: function () { w.go('#/certificate'); }
          }));
        }
      } else if (step.type !== 'prose') {
        nav.appendChild(el('span', { class: 'muted', style: { fontSize: '13px' }, text: stepGateMessage(step) }));
      }
      nav.appendChild(el('button', {
        class: 'btn btn--ghost btn--sm', text: 'All modules',
        onclick: function () { w.go('#/dashboard'); }
      }));
    }
    paintNav();
    return { destroy: destroyLive };
  }

  function stepTypeName(st) {
    return { prose: 'Reading', video: 'Video', quiz: 'Quiz', sim: 'Simulation' }[st.type] || 'Step';
  }
  function stepGateMessage(step) {
    if (step.type === 'video') return 'Answer every checkpoint to unlock the next step.';
    if (step.type === 'quiz') return 'Pass the quiz to unlock the next step.';
    return 'Complete every task in the simulation to unlock the next step.';
  }

  /* ============================================================
     QUIZ
     ============================================================ */
  function renderQuiz(mod, step, complete) {
    var box = el('div', { class: 'quiz' });
    var pass = step.pass || 0.8;
    var seed = Date.now() % 100000;
    var qs = w.QUIZ.pick(step.bank, step.count || 8, seed);
    var i = 0, right = 0, answered = false;
    var prev = w.State.quiz(step.bank);

    var progRow = el('div', { class: 'quiz__prog' });
    var qHost = el('div');
    box.appendChild(el('div', { class: 'step__k' }, [
      el('span', { class: 'chip chip--brand', text: step.final ? 'Final exam' : 'Quiz' }),
      el('span', { class: 'muted', style: { fontSize: '13px' }, text: qs.length + ' questions · ' + Math.round(pass * 100) + '% to pass' })
    ]));
    if (prev && prev.attempts) {
      box.appendChild(el('p', { class: 'muted', style: { fontSize: '13px', marginBottom: '18px' },
        text: 'Best so far: ' + Math.round(prev.best * 100) + '% over ' + prev.attempts + ' attempt' + (prev.attempts === 1 ? '' : 's') + '.' }));
    }
    box.appendChild(progRow);
    box.appendChild(qHost);

    function paintProg() {
      clear(progRow);
      progRow.appendChild(el('div', { class: 'quiz__bar' }, [el('i', { style: { width: (i / qs.length * 100) + '%' } })]));
      progRow.appendChild(el('span', { class: 'quiz__count', text: Math.min(i + 1, qs.length) + ' / ' + qs.length }));
    }

    function paintQ() {
      paintProg();
      clear(qHost);
      if (i >= qs.length) { paintResult(); return; }
      var q = qs[i];
      answered = false;
      var card = el('div', { class: 'step' });
      card.appendChild(el('div', { class: 'quiz__q', text: q.q }));
      var optBox = el('div', { class: 'vid__opts' });
      var order = w.UI.shuffle(q.opts.map(function (o, k) { return k; }), seed + i * 31);
      order.forEach(function (origIdx, pos) {
        var b = el('button', { class: 'opt' }, [
          el('span', { class: 'opt__k', text: 'ABCD'[pos] }),
          el('span', { class: 'grow', text: q.opts[origIdx] })
        ]);
        b.onclick = function () {
          if (answered) return;
          answered = true;
          var ok = origIdx === q.a;
          if (ok) { right++; b.classList.add('is-right'); Sound.good(); }
          else {
            b.classList.add('is-wrong', 'shake');
            Sound.bad();
            w.UI.qsa('.opt', optBox).forEach(function (o, k) {
              if (order[k] === q.a) o.classList.add('is-right');
            });
          }
          w.UI.qsa('.opt', optBox).forEach(function (o) { o.classList.add('is-locked'); });
          card.appendChild(el('div', { class: 'explain', html: (ok ? '<b>Correct.</b> ' : '<b>Not quite.</b> ') + w.UI.esc(q.why) }));
          card.appendChild(el('div', { class: 'stepnav', style: { marginTop: '22px' } }, [
            el('button', {
              class: 'btn btn--primary', text: i === qs.length - 1 ? 'See result →' : 'Next question →',
              onclick: function () { i++; paintQ(); }
            })
          ]));
        };
        optBox.appendChild(b);
      });
      card.appendChild(optBox);
      qHost.appendChild(card);
    }

    function paintResult() {
      clear(qHost);
      var pctv = right / qs.length;
      var passed = pctv >= pass;
      w.State.recordQuiz(step.bank, pctv, passed);
      var res = el('div', { class: 'result' });
      var ring = el('div', { class: 'result__ring' });
      ring.innerHTML = '<svg viewBox="0 0 110 110"><circle class="result__track" cx="55" cy="55" r="50"></circle>' +
        '<circle class="result__fill' + (passed ? '' : ' is-fail') + '" cx="55" cy="55" r="50"></circle></svg>';
      ring.appendChild(el('span', { class: 'result__pct', text: Math.round(pctv * 100) + '%' }));
      res.appendChild(ring);
      setTimeout(function () {
        var c = ring.querySelector('.result__fill');
        if (c) c.style.strokeDashoffset = String(314 * (1 - pctv));
      }, 60);

      res.appendChild(el('h2', { class: 'h2', style: { marginBottom: '10px' },
        text: passed ? (step.final ? 'Final exam passed' : 'Passed') : 'Not quite there' }));
      res.appendChild(el('p', { class: 'lede', style: { margin: '0 auto 26px' },
        text: passed
          ? right + ' of ' + qs.length + ' correct. That is a working understanding of this module.'
          : right + ' of ' + qs.length + ' correct. You need ' + Math.ceil(pass * qs.length) + ' to pass. Go back over the reading and try again - the questions reshuffle.' }));

      var actions = el('div', { class: 'row center gap-10 wrap', style: { justifyContent: 'center' } });
      actions.appendChild(el('button', {
        class: 'btn ' + (passed ? 'btn--ghost' : 'btn--primary'), text: 'Retake the quiz',
        onclick: function () { i = 0; right = 0; seed = Date.now() % 100000; qs = w.QUIZ.pick(step.bank, step.count || 8, seed); paintQ(); }
      }));
      res.appendChild(actions);
      qHost.appendChild(res);

      if (passed) { Sound.good(); complete(step.final ? '<b>Final exam passed.</b>' : '<b>Quiz passed.</b>'); }
    }

    paintQ();
    return box;
  }

  w.ViewLesson = { render: render, destroy: destroyLive };
})(window);
