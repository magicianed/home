/* ============================================================
   magicianed - level view
   One module = a short strip of steps. Every step is a Ponder,
   a video, a simulation or the final exam. Nothing to read.
   ============================================================ */
(function (w) {
  'use strict';
  var el = w.UI.el, clear = w.UI.clear, Sound = w.UI.Sound;

  var live = null;
  function destroyLive() {
    if (live && live.destroy) { try { live.destroy(); } catch (e) {} }
    live = null;
  }

  var XP = { ponder: 40, video: 150, sim: 120, quiz: 250 };

  function accentVar(a) {
    return { brand: 'var(--brand)', info: 'var(--info)', key: 'var(--key)', audio: 'var(--audio)',
             pgm: 'var(--pgm)', pvw: 'var(--pvw)', iso: 'var(--iso)' }[a] || 'var(--brand)';
  }
  function stepIcon(t) { return { ponder: '◆', video: '▶', sim: '⚑', quiz: '★' }[t] || '•'; }
  function stepKind(t) { return { ponder: 'Ponder', video: 'Watch', sim: 'Play', quiz: 'Exam' }[t] || 'Step'; }

  function render(host, mod, stepIdx) {
    destroyLive();
    stepIdx = w.UI.clamp(stepIdx | 0, 0, mod.steps.length - 1);
    var step = mod.steps[stepIdx];

    var page = el('div', { class: 'page' });
    var wrapper = el('div', { class: 'wrapc wrapc--wide' });
    page.appendChild(wrapper);

    /* ---- head ---- */
    wrapper.appendChild(el('div', { class: 'lvhead' }, [
      el('div', { class: 'lvhead__l' }, [
        el('span', { class: 'lvhead__n mono', style: { color: accentVar(mod.accent), borderColor: accentVar(mod.accent) }, text: mod.n }),
        el('div', {}, [
          el('h1', { class: 'lvhead__t', text: mod.title }),
          el('p', { class: 'lvhead__b', text: mod.blurb })
        ])
      ]),
      el('span', { class: 'chip', style: { color: accentVar(mod.accent), borderColor: accentVar(mod.accent) },
        text: stepKind(step.type) + ' · ' + XP[step.type] + ' XP' })
    ]));

    /* ---- step strip ---- */
    var strip = el('div', { class: 'lvstrip' });
    mod.steps.forEach(function (st, i) {
      var done = w.State.isStepDone(mod.id, i);
      strip.appendChild(el('button', {
        class: 'lvpip' + (i === stepIdx ? ' is-active' : '') + (done ? ' is-done' : ''),
        onclick: function () { w.go('#/m/' + mod.id + '/' + i); }
      }, [
        el('span', { class: 'lvpip__i', text: done ? '✓' : stepIcon(st.type) }),
        el('span', { class: 'lvpip__l', text: st.title || stepKind(st.type) })
      ]));
    });
    wrapper.appendChild(strip);

    /* ---- body ---- */
    var main = el('div', { class: 'lesson__main' });
    var bodyHost = el('div', { class: 'step' });
    var nav = el('div', { class: 'stepnav' });
    main.appendChild(bodyHost); main.appendChild(nav);
    wrapper.appendChild(main);
    clear(host).appendChild(page);

    var canAdvance = w.State.isStepDone(mod.id, stepIdx);

    function complete(msg) {
      if (w.State.markStep(mod.id, stepIdx)) {
        var gained = XP[step.type] || 50;
        var up = w.State.addXP(gained);
        w.UI.toast((msg || '<b>Cleared.</b>') + ' &nbsp;<b style="color:var(--brand)">+' + gained + ' XP</b>', 'brand', 3000);
        if (up) setTimeout(function () { levelUp(up); }, 700);
      }
      canAdvance = true;
      paintNav();
      w.refreshChrome();
    }

    function levelUp(lv) {
      Sound.good();
      w.UI.modal({
        title: 'Level ' + lv.n,
        body: el('div', { class: 'lvup' }, [
          el('div', { class: 'lvup__n mono', text: lv.n }),
          el('div', { class: 'lvup__name', text: lv.name }),
          el('p', { class: 'muted', style: { fontSize: '14px' }, text: 'Promoted. ' + w.State.xp() + ' XP earned so far.' })
        ]),
        actions: [{ label: 'Back to it', class: 'btn--primary' }]
      });
    }

    /* ---- build the step ---- */
    if (step.type === 'ponder') {
      var scene = w.SCENES[step.scene];
      live = w.Ponder.mount(bodyHost, scene, { onComplete: function () { complete('<b>Ponder done.</b>'); } });
    } else if (step.type === 'video') {
      bodyHost.appendChild(el('p', { class: 'lvintro', text: step.intro }));
      var vh = el('div');
      bodyHost.appendChild(vh);
      live = w.ViewVideo.mount(vh, { video: step.video, onComplete: function () { complete('<b>Every checkpoint passed.</b>'); } });
    } else if (step.type === 'quiz') {
      bodyHost.appendChild(renderQuiz(mod, step, complete));
    } else if (step.type === 'sim') {
      if (step.intro) bodyHost.appendChild(el('p', { class: 'lvintro', text: step.intro }));
      var sh = el('div');
      bodyHost.appendChild(sh);
      var done = function () { complete('<b>Level cleared.</b>'); };
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
        nav.appendChild(el('button', { class: 'btn btn--ghost', text: '← Back',
          onclick: function () { w.go('#/m/' + mod.id + '/' + (stepIdx - 1)); } }));
      }
      if (canAdvance) {
        var idx = w.COURSE.index(mod.id);
        if (stepIdx < mod.steps.length - 1) {
          nav.appendChild(el('button', { class: 'btn btn--primary', text: 'Next →',
            onclick: function () { w.go('#/m/' + mod.id + '/' + (stepIdx + 1)); } }));
        } else if (idx < w.COURSE.modules.length - 1) {
          var nxt = w.COURSE.modules[idx + 1];
          nav.appendChild(el('button', { class: 'btn btn--primary', text: 'Level ' + nxt.n + ': ' + nxt.title + ' →',
            onclick: function () { w.go('#/m/' + nxt.id + '/0'); } }));
        } else if (w.COURSE.allDone()) {
          nav.appendChild(el('button', { class: 'btn btn--primary', text: 'Claim your certificate →',
            onclick: function () { w.go('#/certificate'); } }));
        }
      } else {
        nav.appendChild(el('span', { class: 'muted', style: { fontSize: '13px' }, text: gateMsg(step) }));
      }
      nav.appendChild(el('button', { class: 'btn btn--ghost btn--sm', text: 'All levels',
        onclick: function () { w.go('#/dashboard'); } }));
    }
    paintNav();
    return { destroy: destroyLive };
  }

  function gateMsg(step) {
    if (step.type === 'ponder') return 'Watch it through to unlock the next step.';
    if (step.type === 'video') return 'Answer every checkpoint to unlock the next step.';
    if (step.type === 'quiz') return 'Pass to earn your certificate.';
    return 'Finish every task to clear this level.';
  }

  /* ============================================================
     final exam
     ============================================================ */
  function renderQuiz(mod, step, complete) {
    var box = el('div', { class: 'quiz' });
    var pass = step.pass || 0.8;
    var seed = Date.now() % 100000;
    var qs = w.QUIZ.pick(step.bank, step.count || 14, seed);
    var i = 0, right = 0, streak = 0, best = 0, answered = false;

    var progRow = el('div', { class: 'quiz__prog' });
    var qHost = el('div');
    box.appendChild(progRow);
    box.appendChild(qHost);

    function paintProg() {
      clear(progRow);
      progRow.appendChild(el('div', { class: 'quiz__bar' }, [el('i', { style: { width: (i / qs.length * 100) + '%' } })]));
      progRow.appendChild(el('span', { class: 'quiz__count', text: Math.min(i + 1, qs.length) + ' / ' + qs.length }));
      if (streak >= 3) progRow.appendChild(el('span', { class: 'streak', text: '🔥 ' + streak + ' in a row' }));
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
          if (ok) { right++; streak++; best = Math.max(best, streak); b.classList.add('is-right'); Sound.good(); }
          else {
            streak = 0;
            b.classList.add('is-wrong', 'shake');
            Sound.bad();
            w.UI.qsa('.opt', optBox).forEach(function (o, k) { if (order[k] === q.a) o.classList.add('is-right'); });
          }
          w.UI.qsa('.opt', optBox).forEach(function (o) { o.classList.add('is-locked'); });
          card.appendChild(el('div', { class: 'explain', html: (ok ? '<b>Yes.</b> ' : '<b>No.</b> ') + w.UI.esc(q.why) }));
          card.appendChild(el('div', { class: 'stepnav', style: { marginTop: '22px' } }, [
            el('button', { class: 'btn btn--primary', text: i === qs.length - 1 ? 'See result →' : 'Next →',
              onclick: function () { i++; paintQ(); } })
          ]));
          paintProg();
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
      res.appendChild(el('h2', { class: 'h2', style: { marginBottom: '10px' }, text: passed ? 'Certified.' : 'Not yet.' }));
      res.appendChild(el('p', { class: 'lede', style: { margin: '0 auto 26px' },
        text: right + ' of ' + qs.length + (best >= 4 ? ' · best streak ' + best : '') +
          (passed ? '. That is an operator.' : '. You need ' + Math.ceil(pass * qs.length) + '. The questions reshuffle - go again.') }));
      res.appendChild(el('div', { class: 'row center gap-10 wrap', style: { justifyContent: 'center' } }, [
        el('button', { class: 'btn ' + (passed ? 'btn--ghost' : 'btn--primary'), text: 'Retake',
          onclick: function () { i = 0; right = 0; streak = 0; best = 0; seed = Date.now() % 100000; qs = w.QUIZ.pick(step.bank, step.count || 14, seed); paintQ(); } })
      ]));
      qHost.appendChild(res);
      if (passed) { Sound.good(); complete('<b>Final exam passed.</b>'); }
    }

    paintQ();
    return box;
  }

  w.ViewLesson = { render: render, destroy: destroyLive };
})(window);
