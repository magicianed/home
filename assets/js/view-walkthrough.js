/* ============================================================
   magicianed - Setup Walkthrough view
   The manual. Same drawing kit as Ponder, but you drive it, and
   each step gets room for the detail a manual needs.
   ============================================================ */
(function (w) {
  'use strict';
  var el = w.UI.el, clear = w.UI.clear, Sound = w.UI.Sound;

  var live = null;

  function flat() {
    var out = [];
    w.WALK.forEach(function (ch, ci) {
      ch.steps.forEach(function (st, si) { out.push({ ch: ch, ci: ci, si: si, st: st }); });
    });
    return out;
  }

  function render(host) {
    var all = flat();
    var idx = 0;
    var mountedChapter = -1;
    var S = null;

    var page = el('div', { class: 'page' });
    var wrap = el('div', { class: 'wrapc wrapc--wide' });
    page.appendChild(wrap);

    wrap.appendChild(el('div', { style: { marginBottom: '22px' } }, [
      el('span', { class: 'eyebrow', text: 'Manual' }),
      el('h1', { class: 'hero__title', text: 'Setup walkthrough' }),
      el('p', { class: 'lede', text: 'From the sealed box to your first live stream, in order, with a diagram for every step. Nothing here is graded — come back to it whenever you are actually setting the thing up.' })
    ]));

    var rail = el('div', { class: 'wkrail' });
    var stage = el('div', { class: 'wkstage' });
    var cap = el('div', { class: 'wkcap' });
    var nav = el('div', { class: 'wknav' });

    wrap.appendChild(el('div', { class: 'wk' }, [
      rail,
      el('div', { class: 'wkmain' }, [stage, cap, nav])
    ]));
    clear(host).appendChild(page);

    function buildRail() {
      clear(rail);
      var n = 0;
      w.WALK.forEach(function (ch, ci) {
        rail.appendChild(el('div', { class: 'wkrail__h', text: ch.title }));
        ch.steps.forEach(function (st, si) {
          var myIdx = n++;
          rail.appendChild(el('button', {
            class: 'wkrail__s' + (myIdx === idx ? ' is-on' : '') + (myIdx < idx ? ' is-past' : ''),
            onclick: function () { goto(myIdx); }
          }, [
            el('span', { class: 'wkrail__n mono', text: String(myIdx + 1) }),
            el('span', { class: 'grow', text: st.t })
          ]));
        });
      });
    }

    function mountChapter(ci) {
      if (mountedChapter === ci) return;
      mountedChapter = ci;
      var ch = w.WALK[ci];
      S = w.Ponder.Stage.apply(null, ch.view);
      ch.build(S);
      clear(stage).appendChild(S.svg);
    }

    function apply(ci, si) {
      var ch = w.WALK[ci];
      var on = {};
      for (var k = 0; k <= si; k++) {
        (ch.steps[k].on || []).forEach(function (x) { on[x] = 1; });
        (ch.steps[k].off || []).forEach(function (x) { delete on[x]; });
      }
      var hi = {}, fl = {};
      (ch.steps[si].hi || []).forEach(function (x) { hi[x] = 1; });
      (ch.steps[si].flow || []).forEach(function (x) { fl[x] = 1; });
      Object.keys(S.reg).forEach(function (key) {
        S.reg[key].forEach(function (node) {
          if (!node.classList.contains('pn-always')) node.classList.toggle('is-on', !!on[key]);
          node.classList.toggle('is-hi', !!hi[key]);
          node.classList.toggle('is-flow', !!fl[key]);
        });
      });
    }

    function goto(n) {
      idx = w.UI.clamp(n, 0, all.length - 1);
      var e = all[idx];
      mountChapter(e.ci);
      apply(e.ci, e.si);
      buildRail();

      clear(cap);
      cap.appendChild(el('div', { class: 'wkcap__k' }, [
        el('span', { class: 'chip chip--brand', text: e.ch.title }),
        el('span', { class: 'mono', style: { fontSize: '11px', color: 'var(--ink-4)' }, text: 'step ' + (idx + 1) + ' of ' + all.length })
      ]));
      cap.appendChild(el('h2', { class: 'wkcap__t', text: e.st.t }));
      if (e.st.body) cap.appendChild(el('p', { class: 'wkcap__b', text: e.st.body }));

      clear(nav);
      nav.appendChild(el('button', {
        class: 'btn btn--ghost', text: '← Back', disabled: idx === 0,
        onclick: function () { Sound.tap(); goto(idx - 1); }
      }));
      nav.appendChild(el('button', {
        class: 'btn btn--primary', text: idx === all.length - 1 ? 'Start again' : 'Next →',
        onclick: function () { Sound.tap(); goto(idx === all.length - 1 ? 0 : idx + 1); }
      }));
      nav.appendChild(el('div', { class: 'wkbar' }, [el('i', { style: { width: ((idx + 1) / all.length * 100) + '%' } })]));

      /* keep the rail scrolled to where you are */
      var active = rail.querySelector('.wkrail__s.is-on');
      if (active) { try { active.scrollIntoView({ block: 'nearest' }); } catch (err) {} }
    }

    function onKey(ev) {
      if (ev.target && /input|textarea|select/i.test(ev.target.tagName)) return;
      if (ev.key === 'ArrowRight') goto(idx + 1);
      if (ev.key === 'ArrowLeft') goto(idx - 1);
    }
    document.addEventListener('keydown', onKey);

    goto(0);
    live = { destroy: function () { document.removeEventListener('keydown', onKey); clear(host); } };
    return live;
  }

  w.ViewWalkthrough = { render: render };
})(window);
