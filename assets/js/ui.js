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
      active = true;
      try { if (target.setPointerCapture) target.setPointerCapture(e.pointerId); } catch (err) {}
      handlers.start && handlers.start(e);
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

  w.UI = {
    el: el, qs: qs, qsa: qsa, clear: clear, esc: esc, append: append,
    toast: toast, modal: modal, confirm: confirmBox,
    Sound: Sound, fmtTime: fmtTime, shuffle: shuffle, clamp: clamp, drag: drag
  };
})(window);
