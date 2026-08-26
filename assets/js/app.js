/* ============================================================
   magicianed - application shell + router
   ============================================================ */
(function (w) {
  'use strict';
  var el = w.UI.el, clear = w.UI.clear, qs = w.UI.qs, Sound = w.UI.Sound;

  var view = qs('#view');
  var app = qs('#app');
  var rail = qs('#rail');
  var railNav = qs('#railNav');
  var railUser = qs('#railUser');
  var crumbs = qs('#crumbs');
  var scrim = qs('#railScrim');
  var current = null;

  /* ---------------- navigation ---------------- */
  function go(hash) {
    if (location.hash === hash) { route(); return; }
    location.hash = hash;
  }
  w.go = go;

  function parse() {
    var h = (location.hash || '').replace(/^#\/?/, '');
    var parts = h.split('/').filter(Boolean);
    if (!parts.length) return { name: 'dashboard' };
    if (parts[0] === 'm') return { name: 'module', mod: parts[1], step: parseInt(parts[2] || '0', 10) || 0 };
    return { name: parts[0] };
  }

  function route() {
    if (!w.State.hasIdentity()) {
      app.classList.add('is-gate');
      app.hidden = false;
      destroyCurrent();
      w.ViewDashboard.gate(view, function () {
        app.classList.remove('is-gate');
        refreshChrome();
        go('#/dashboard');
      });
      return;
    }
    app.classList.remove('is-gate');

    var r = parse();
    destroyCurrent();
    view.classList.add('is-swapping');

    setTimeout(function () {
      view.classList.remove('is-swapping');
      view.scrollTop = 0;

      if (r.name === 'module') {
        var mod = w.COURSE.module(r.mod);
        if (!mod) { go('#/dashboard'); return; }
        if (!w.COURSE.moduleUnlocked(mod)) {
          w.UI.toast('That module is locked - finish the one before it first.', 'info');
          go('#/dashboard'); return;
        }
        current = w.ViewLesson.render(view, mod, r.step);
        setCrumbs([['Modules', '#/dashboard'], ['Module ' + mod.n + ' · ' + mod.title, null]]);
      } else if (r.name === 'reference') {
        w.ViewDashboard.reference(view);
        setCrumbs([['Reference deck', null]]);
      } else if (r.name === 'certificate') {
        w.ViewCertificate.render(view);
        setCrumbs([['Certificate', null]]);
      } else {
        w.ViewDashboard.dashboard(view);
        setCrumbs([['All modules', null]]);
      }

      w.State.setRoute(location.hash);
      refreshChrome();
      closeRail();
      view.focus({ preventScroll: true });
    }, 90);
  }

  function destroyCurrent() {
    if (current && current.destroy) { try { current.destroy(); } catch (e) {} }
    current = null;
  }

  function setCrumbs(list) {
    clear(crumbs);
    list.forEach(function (c, i) {
      if (i) crumbs.appendChild(el('span', { class: 'crumb-sep', text: '/' }));
      if (c[1]) crumbs.appendChild(el('a', { href: c[1], text: c[0] }));
      else crumbs.appendChild(el('b', { text: c[0] }));
    });
  }

  /* ---------------- chrome ---------------- */
  function refreshChrome() {
    /* user block */
    clear(railUser);
    railUser.appendChild(el('div', { class: 'avatar', text: w.State.initials() }));
    railUser.appendChild(el('div', { class: 'grow', style: { minWidth: '0' } }, [
      el('div', { class: 'rail__uname', text: w.State.fullName() }),
      el('div', { class: 'rail__urole', text: w.COURSE.allDone() ? 'Certified operator' : 'Trainee operator' })
    ]));

    /* nav */
    clear(railNav);
    railNav.appendChild(el('div', { class: 'navgroup__title', text: 'Course' }));
    var r = parse();
    w.COURSE.modules.forEach(function (m) {
      var unlocked = w.COURSE.moduleUnlocked(m);
      var done = w.COURSE.moduleDone(m);
      var active = r.name === 'module' && r.mod === m.id;
      var b = el('button', {
        class: 'navitem' + (active ? ' is-active' : '') + (done ? ' is-done' : '') + (unlocked ? '' : ' is-locked'),
        onclick: function () {
          if (!unlocked) { Sound.bad(); w.UI.toast('Locked - finish the previous module first.', 'info'); return; }
          go('#/m/' + m.id + '/' + firstOpen(m));
        }
      }, [
        el('span', { class: 'navitem__num', text: done ? '✓' : m.n }),
        el('span', { class: 'navitem__label', text: m.title }),
        unlocked ? null : el('span', { class: 'navitem__lock', text: '🔒' })
      ]);
      railNav.appendChild(b);
    });

    /* course ring */
    var pct = w.COURSE.pct();
    var fill = qs('.xpmeter__fill');
    if (fill) fill.style.strokeDashoffset = String(97.4 * (1 - pct / 100));
    var num = qs('#xpnum');
    if (num) num.textContent = pct + '%';

    /* level + xp meter */
    var lv = w.State.level();
    var host = qs('#lvmeter');
    if (!host) {
      host = el('div', { class: 'lvmeter', id: 'lvmeter' });
      var right = qs('.topbar__right');
      right.insertBefore(host, right.firstChild);
    }
    clear(host);
    host.appendChild(el('div', { class: 'lvmeter__b' }, [
      el('div', { class: 'lvmeter__n', html: '<b>LVL ' + lv.n + '</b> · ' + w.UI.esc(lv.name) }),
      el('div', { class: 'lvmeter__bar' }, [el('i', { style: { width: Math.round(lv.pct * 100) + '%' } })])
    ]));
    host.title = w.State.xp() + ' XP' + (lv.max ? ' · max level' : ' · ' + (lv.need - lv.into) + ' XP to level ' + (lv.n + 1));
  }
  w.refreshChrome = refreshChrome;

  function firstOpen(m) {
    for (var i = 0; i < m.steps.length; i++) if (!w.State.isStepDone(m.id, i)) return i;
    return 0;
  }

  /* ---------------- rail (mobile) ---------------- */
  function openRail() { rail.classList.add('is-open'); scrim.classList.add('is-open'); }
  function closeRail() { rail.classList.remove('is-open'); scrim.classList.remove('is-open'); }
  qs('#railOpen').onclick = openRail;
  qs('#railClose').onclick = closeRail;
  scrim.onclick = closeRail;

  /* ---------------- reset ---------------- */
  qs('#resetBtn').onclick = function () {
    w.UI.confirm('Reset all progress?',
      'This wipes your name, every completed step, every quiz score and your certificate from this browser. It cannot be undone.',
      function () {
        w.State.reset();
        w.UI.toast('Progress reset.', 'info');
        location.hash = '#/dashboard';
        route();
      }, 'Reset everything');
  };

  /* ---------------- keyboard ---------------- */
  document.addEventListener('keydown', function (e) {
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    if (e.key === 'Escape') closeRail();
    if (e.key === 'g' && !e.metaKey && !e.ctrlKey) { go('#/dashboard'); }
  });

  /* ---------------- boot ---------------- */
  w.addEventListener('hashchange', route);

  function boot() {
    app.hidden = false;
    refreshChrome();
    if (!location.hash) {
      var last = w.State.lastRoute();
      location.hash = last || '#/dashboard';
    }
    route();
    setTimeout(function () {
      var b = qs('#boot');
      if (b) { b.classList.add('is-gone'); setTimeout(function () { b.remove(); }, 620); }
    }, 620);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
