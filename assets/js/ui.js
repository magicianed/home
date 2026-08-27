/* ============================================================
   magicianed - tiny UI kit: dom helpers, toasts, modals, sound
   ============================================================ */
(function (w) {
  'use strict';

  /* ---------- dom ---------- */
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') n.className = v;
        else if (k === 'html') n.innerHTML = v;
        else if (k === 'text') n.textContent = v;
        else if (k === 'style' && typeof v === 'object') { for (var s in v) n.style[s] = v[s]; }
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') n.addEventListener(k.slice(2), v);
        else if (k === 'data' && typeof v === 'object') { for (var d in v) n.dataset[d] = v[d]; }
        else n.setAttribute(k, v === true ? '' : v);
      }
    }
    append(n, children);
    return n;
  }
  function append(parent, children) {
    if (children === null || children === undefined || children === false) return;
    if (Array.isArray(children)) { children.forEach(function (c) { append(parent, c); }); return; }
    if (children instanceof Node) { parent.appendChild(children); return; }
    parent.appendChild(document.createTextNode(String(children)));
  }
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- toast ---------- */
  var toastRoot = null;
  function toast(msg, kind, ms) {
    toastRoot = toastRoot || document.getElementById('toasts');
    if (!toastRoot) return;
    var t = el('div', { class: 'toast toast--' + (kind || 'info') }, [
      el('i', { class: 'toast__bar' }),
      el('div', { class: 'grow', html: msg })
    ]);
    toastRoot.appendChild(t);
    var life = ms || 2800;
    setTimeout(function () {
      t.classList.add('is-out');
      setTimeout(function () { t.remove(); }, 320);
    }, life);
    return t;
  }

  /* ---------- modal ---------- */
  var modalRoot = null;
  var modalStack = [];
  function modal(opts) {
    modalRoot = modalRoot || document.getElementById('modalRoot');
    modalRoot.hidden = false;
    var box = el('div', { class: 'modal' + (opts.wide ? ' modal--wide' : '') });
    if (opts.title) box.appendChild(el('div', { class: 'modal__title', text: opts.title }));
    if (opts.body) append(box, opts.body);
    var actions = el('div', { class: 'modal__actions' });
    (opts.actions || [{ label: 'Close' }]).forEach(function (a) {
      actions.appendChild(el('button', {
        class: 'btn ' + (a.class || 'btn--ghost'),
        text: a.label,
        onclick: function () { if (!a.onClick || a.onClick() !== false) close(); }
      }));
    });
    box.appendChild(actions);
    clear(modalRoot).appendChild(box);
    modalStack.push(box);

    function close() {
      box.style.animation = 'modalOut .2s var(--e-inout) both';
      setTimeout(function () {
        modalStack.pop();
        modalRoot.hidden = true;
        clear(modalRoot);
      }, 180);
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    modalRoot.onclick = function (e) { if (e.target === modalRoot) close(); };
    return { close: close, box: box };
  }

  function confirmBox(title, message, onYes, yesLabel) {
    return modal({
      title: title,
      body: el('p', { class: 'lede', style: { fontSize: '14.5px' }, text: message }),
      actions: [
        { label: 'Cancel', class: 'btn--ghost' },
        { label: yesLabel || 'Confirm', class: 'btn--primary', onClick: onYes }
      ]
    });
  }

  /* ---------- sound (soft, optional) ---------- */
  var SKEY = 'magicianed.sound';
  var soundOn = (function () { try { return w.localStorage.getItem(SKEY) !== 'off'; } catch (e) { return true; } })();
  var ctx = null;
  function ac() {
    if (!ctx) { try { ctx = new (w.AudioContext || w.webkitAudioContext)(); } catch (e) { ctx = false; } }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function blip(freq, dur, type, vol) {
    if (!soundOn) return;
    var c = ac(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'square';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(vol || 0.045, c.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + (dur || 0.06));
    o.connect(g); g.connect(c.destination);
    o.start(); o.stop(c.currentTime + (dur || 0.06) + 0.02);
  }
  var Sound = {
    get on() { return soundOn; },
    toggle: function () {
      soundOn = !soundOn;
      try { w.localStorage.setItem(SKEY, soundOn ? 'on' : 'off'); } catch (e) {}
      return soundOn;
    },
    click: function () { blip(1400, 0.035, 'square', 0.03); },
    tap:   function () { blip(900, 0.03, 'triangle', 0.035); },
    good:  function () { blip(880, 0.07, 'sine', 0.05); setTimeout(function () { blip(1320, 0.1, 'sine', 0.045); }, 70); },
    bad:   function () { blip(200, 0.13, 'sawtooth', 0.035); },
    cut:   function () { blip(1800, 0.03, 'square', 0.05); },
    arm:   function () { blip(520, 0.05, 'square', 0.04); }
  };

  /* ---------- misc ---------- */
  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }
  function shuffle(arr, seed) {
    var a = arr.slice(), rnd = seed ? mulberry(seed) : Math.random;
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function mulberry(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  /* pointer drag helper shared by wiring / fader / joystick sims */
  function drag(target, handlers) {
    var active = false;
    target.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      /* start() may veto by returning false - used so that buttons sitting
         inside a drag handle still receive their click. preventDefault on
         pointerdown suppresses the click event, so it must come after. */
      if (handlers.start && handlers.start(e) === false) return;
      active = true;
      try { if (target.setPointerCapture) target.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });
    target.addEventListener('pointermove', function (e) {
      if (!active) return;
      handlers.move && handlers.move(e);
    });
    function end(e) {
      if (!active) return;
      active = false;
      handlers.end && handlers.end(e);
    }
    target.addEventListener('pointerup', end);
    target.addEventListener('pointercancel', end);
  }

  /* ---------- spotlight: "show me where" ---------- */
  var spotTimer = null;
  function spotlight(root, selector, opts) {
    opts = opts || {};
    qsa('.is-spot', document).forEach(function (n) { n.classList.remove('is-spot'); });
    if (spotTimer) { clearTimeout(spotTimer); spotTimer = null; }
    if (!selector) return false;
    var targets = qsa(selector, root);
    if (!targets.length) return false;
    targets.forEach(function (n) { n.classList.add('is-spot'); });
    if (opts.scroll !== false) {
      try { targets[0].scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {}
    }
    /* persistent spotlights stay until the task changes */
    if (!opts.persist) {
      spotTimer = setTimeout(function () {
        targets.forEach(function (n) { n.classList.remove('is-spot'); });
      }, 6000);
    }
    if (opts.quiet !== true) Sound.tap();
    return true;
  }

  /* ============================================================
     coach: the current instruction, pinned to the top, following
     you automatically so you never look back and forth
     ============================================================ */
  var AUTOKEY = 'magicianed.coach.auto';
  function coach(cfg) {
    var auto = (function () { try { return w.localStorage.getItem(AUTOKEY) !== 'off'; } catch (e) { return true; } })();
    var lastId = null;

    var num = el('span', { class: 'coach__n mono' });
    var ttl = el('div', { class: 'coach__t' });
    var hnt = el('div', { class: 'coach__h' });
    var autoBtn = el('button', {
      class: 'coach__auto', title: 'Follow along automatically',
      onclick: function () {
        auto = !auto;
        try { w.localStorage.setItem(AUTOKEY, auto ? 'on' : 'off'); } catch (e) {}
        paintAuto();
        if (auto) { lastId = null; cfg.onRefresh && cfg.onRefresh(); }
        else spotlight(cfg.root, null);
      }
    });
    var showBtn = el('button', {
      class: 'btn btn--sm btn--brand nowrap', text: 'Show me',
      onclick: function () { cfg.onSpot && cfg.onSpot(true); }
    });
    var bar = el('div', { class: 'coach' }, [
      num,
      el('div', { class: 'coach__body' }, [ttl, hnt]),
      autoBtn, showBtn
    ]);

    function paintAuto() {
      autoBtn.textContent = auto ? '● Auto' : '○ Auto';
      autoBtn.classList.toggle('is-on', auto);
      showBtn.hidden = auto;
    }
    paintAuto();

    return {
      el: bar,
      get auto() { return auto; },
      /* returns true when the current task changed */
      set: function (task, idx, total) {
        if (!task) {
          bar.classList.add('is-done');
          num.textContent = total + '/' + total;
          ttl.textContent = 'Every step done.';
          hnt.textContent = '';
          lastId = null;
          return false;
        }
        bar.classList.remove('is-done');
        num.textContent = (idx + 1) + '/' + total;
        ttl.textContent = task.label;
        hnt.textContent = task.hint || '';
        var changed = task.id !== lastId;
        lastId = task.id;
        return changed;
      }
    };
  }

  /* a task row with an optional "show me" button */
  function taskRow(t, done, onSpot) {
    var kids = [
      el('i', { class: 'task__box', text: '✓' }),
      el('div', { class: 'grow' }, [
        el('span', { text: t.label }),
        !done && t.hint ? el('span', { class: 'task__hint', text: t.hint }) : null
      ])
    ];
    if (!done && t.spot && onSpot) {
      kids.push(el('button', {
        class: 'task__q', text: '?', title: 'Show me where',
        onclick: function (e) { e.stopPropagation(); onSpot(t); }
      }));
    }
    return el('div', { class: 'task' + (done ? ' is-done' : '') }, kids);
  }

  w.UI = {
    el: el, qs: qs, qsa: qsa, clear: clear, esc: esc, append: append,
    spotlight: spotlight, taskRow: taskRow, coach: coach,
    toast: toast, modal: modal, confirm: confirmBox,
    Sound: Sound, fmtTime: fmtTime, shuffle: shuffle, clamp: clamp, drag: drag
  };
})(window);
