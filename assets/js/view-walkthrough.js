/* ============================================================
   magicianed - Setup Walkthrough view
   The manual, generated from the reader's own rig. The Configure
   button at the top rewrites every step: cable counts, socket
   numbers, the picture format, and the diagram itself.
   ============================================================ */
(function (w) {
  'use strict';
  var el = w.UI.el, clear = w.UI.clear, Sound = w.UI.Sound;

  function flat(chapters) {
    var out = [];
    chapters.forEach(function (ch, ci) {
      ch.steps.forEach(function (st, si) { out.push({ ch: ch, ci: ci, si: si, st: st }); });
    });
    return out;
  }

  function summary(cfg) {
    var bits = [cfg.cams + ' camera' + (cfg.cams === 1 ? '' : 's')];
    if (!cfg.returns) bits.push('no returns');
    bits.push(w.WALK.format(cfg));
    if (cfg.stream) bits.push(cfg.platform);
    if (cfg.record) bits.push('recording');
    return bits.join(' · ');
  }

  function render(host) {
    var cfg = w.State.rig();
    var chapters = w.WALK.build(cfg);
    var all = flat(chapters);
    var idx = 0, mountedChapter = -1, S = null;

    var page = el('div', { class: 'page' });
    var wrap = el('div', { class: 'wrapc wrapc--wide' });
    page.appendChild(wrap);

    var cfgBtn = el('button', { class: 'btn btn--ghost cfgbtn', title: 'Adjust this guide to your own setup' }, [
      w.UI.icon('sliders', 16),
      el('span', { text: 'Configure' })
    ]);
    var cfgLine = el('div', { class: 'wkcfg', text: summary(cfg) });

    wrap.appendChild(el('div', { class: 'wkhead' }, [
      el('div', { class: 'grow' }, [
        el('span', { class: 'eyebrow', text: 'Manual' }),
        el('h1', { class: 'hero__title', text: 'Setup walkthrough' }),
        el('p', { class: 'lede', text: 'From the sealed box to your first live show, in order, with a diagram for every step. Nothing here is graded — come back to it whenever you are actually setting the thing up.' }),
        cfgLine
      ]),
      cfgBtn
    ]));

    var rail = el('div', { class: 'wkrail' });
    var stage = el('div', { class: 'wkstage' });
    var cap = el('div', { class: 'wkcap' });
    var nav = el('div', { class: 'wknav' });
    wrap.appendChild(el('div', { class: 'wk' }, [rail, el('div', { class: 'wkmain' }, [stage, cap, nav])]));
    clear(host).appendChild(page);

    cfgBtn.onclick = openConfig;

    /* ---------------- the configure panel ---------------- */
    function openConfig() {
      Sound.tap();
      var draft = {};
      Object.keys(cfg).forEach(function (k) { draft[k] = cfg[k]; });
      var body = el('div', { class: 'cfgform' });

      function paint() {
        clear(body);
        w.WALK.options.forEach(function (o) {
          if (o.when && !o.when(draft)) return;
          var control;
          if (o.type === 'number') {
            var val = el('span', { class: 'cfgnum__v mono', text: String(draft[o.id]) });
            var dec = el('button', { class: 'cfgnum__b', text: '−', onclick: function () {
              draft[o.id] = Math.max(o.min, draft[o.id] - 1); paint(); Sound.tap();
            } });
            var inc = el('button', { class: 'cfgnum__b', text: '+', onclick: function () {
              draft[o.id] = Math.min(o.max, draft[o.id] + 1); paint(); Sound.tap();
            } });
            control = el('div', { class: 'cfgnum' }, [dec, val, inc]);
          } else if (o.type === 'bool') {
            control = el('div', { class: 'cfgseg' }, [['Yes', true], ['No', false]].map(function (p) {
              return el('button', {
                class: 'cfgseg__b' + (draft[o.id] === p[1] ? ' is-on' : ''), text: p[0],
                onclick: function () { draft[o.id] = p[1]; paint(); Sound.tap(); }
              });
            }));
          } else {
            control = el('div', { class: 'cfgseg cfgseg--wrap' }, o.choices.map(function (ch) {
              return el('button', {
                class: 'cfgseg__b' + (draft[o.id] === ch[0] ? ' is-on' : ''), text: ch[1],
                onclick: function () { draft[o.id] = ch[0]; paint(); Sound.tap(); }
              });
            }));
          }
          body.appendChild(el('div', { class: 'cfgrow' }, [
            el('div', { class: 'grow' }, [
              el('div', { class: 'cfgrow__l', text: o.label }),
              o.help ? el('div', { class: 'cfgrow__h', text: o.help }) : null
            ]),
            control
          ]));
        });
      }
      paint();

      w.UI.modal({
        title: 'Your setup',
        wide: true,
        body: el('div', {}, [
          el('p', { class: 'muted', style: { fontSize: '13.5px', marginBottom: '18px' },
            text: 'Tell it about your rig and the whole guide rewrites itself — the shopping list, the socket numbers, the picture format, and the diagram.' }),
          body
        ]),
        actions: [
          { label: 'Cancel', class: 'btn--ghost' },
          { label: 'Apply', class: 'btn--primary', onClick: function () {
            w.State.setRig(draft);
            w.UI.toast('<b>Guide updated</b> &nbsp;' + w.UI.esc(summary(w.State.rig())), 'ok', 3000);
            render(host);
          } }
        ]
      });
    }

    /* ---------------- rail ---------------- */
    function buildRail() {
      clear(rail);
      var n = 0;
      chapters.forEach(function (ch) {
        rail.appendChild(el('div', { class: 'wkrail__h', text: ch.title }));
        ch.steps.forEach(function (st) {
          var my = n++;
          rail.appendChild(el('button', {
            class: 'wkrail__s' + (my === idx ? ' is-on' : '') + (my < idx ? ' is-past' : ''),
            onclick: function () { goto(my); }
          }, [
            el('span', { class: 'wkrail__n mono', text: String(my + 1) }),
            el('span', { class: 'grow', text: st.t })
          ]));
        });
      });
    }

    function mountChapter(ci) {
      if (mountedChapter === ci) return;
      mountedChapter = ci;
      S = w.Ponder.Stage.apply(null, chapters[ci].view);
      chapters[ci].build(S);
      clear(stage).appendChild(S.svg);
    }

    function apply(ci, si) {
      var ch = chapters[ci], on = {};
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
        el('span', { class: 'chip', text: e.ch.title }),
        el('span', { class: 'mono', style: { fontSize: '11px', color: 'var(--ink-4)' },
          text: 'step ' + (idx + 1) + ' of ' + all.length })
      ]));
      cap.appendChild(el('h2', { class: 'wkcap__t', text: e.st.t }));

      if (e.st.body) {
        if (e.st.list) {
          var ul = el('ul', { class: 'wkshop' });
          e.st.body.split('\n').forEach(function (line) {
            if (!line.trim()) return;
            var parts = line.split(' — ');
            ul.appendChild(el('li', {}, [
              el('span', { class: 'wkshop__q', text: parts[0] }),
              el('span', { class: 'wkshop__w', text: parts[1] || '' })
            ]));
          });
          cap.appendChild(ul);
        } else {
          e.st.body.split('\n\n').forEach(function (para) {
            if (para.trim()) cap.appendChild(el('p', { class: 'wkcap__b', text: para }));
          });
        }
      }
      if (e.st.check) {
        cap.appendChild(el('div', { class: 'wkcheck' }, [
          el('span', { class: 'wkcheck__l', text: 'You know it worked when' }),
          el('span', { text: e.st.check })
        ]));
      }

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

      var active = rail.querySelector('.wkrail__s.is-on');
      if (active) { try { active.scrollIntoView({ block: 'nearest' }); } catch (err) {} }
    }

    function onKey(ev) {
      if (ev.target && /input|textarea|select/i.test(ev.target.tagName)) return;
      if (document.getElementById('modalRoot') && !document.getElementById('modalRoot').hidden) return;
      if (ev.key === 'ArrowRight') goto(idx + 1);
      if (ev.key === 'ArrowLeft') goto(idx - 1);
    }
    document.addEventListener('keydown', onKey);

    goto(0);
    return { destroy: function () { document.removeEventListener('keydown', onKey); clear(host); } };
  }

  w.ViewWalkthrough = { render: render };
})(window);
