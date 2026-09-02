/* ============================================================
   magicianed - persistent state
   Everything lives in localStorage under one key so a single
   reset wipes the lot. Writes are debounced + fired on unload.
   ============================================================ */
(function (w) {
  'use strict';

  var KEY = 'magicianed.atem.hd8.v1';
  var EMPTY = {
    v: 1,
    firstName: '',
    lastName: '',
    startedAt: 0,
    lastSeen: 0,
    lastRoute: '',
    steps: {},        // "m3.s2" -> timestamp
    checkpoints: {},  // "v.primary.2" -> timestamp
    quizzes: {},      // "m3" -> {best, attempts, passed}
    sims: {},         // "wiring" -> {best, runs, passed}
    seconds: 0,       // time on task
    xp: 0,
    examHints: 5,     // hints remaining for the final, across all four stages
    rig: null,        // the reader's own setup, used to tailor the walkthrough
    certificate: null // {id, issuedAt, name}
  };

  var LEVELS = [
    { at: 0,    name: 'Runner' },
    { at: 150,  name: 'Cable Basher' },
    { at: 350,  name: 'Trainee Op' },
    { at: 600,  name: 'Vision Op' },
    { at: 900,  name: 'Switcher Op' },
    { at: 1250, name: 'Vision Mixer' },
    { at: 1650, name: 'Director' },
    { at: 2100, name: 'Showrunner' }
  ];

  var data = load();
  var dirty = false;

  function load() {
    try {
      var raw = w.localStorage.getItem(KEY);
      if (!raw) return clone(EMPTY);
      var parsed = JSON.parse(raw);
      var out = clone(EMPTY);
      for (var k in parsed) if (Object.prototype.hasOwnProperty.call(out, k)) out[k] = parsed[k];
      return out;
    } catch (e) {
      return clone(EMPTY);
    }
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function flush() {
    if (!dirty) return;
    try { w.localStorage.setItem(KEY, JSON.stringify(data)); dirty = false; } catch (e) {}
  }
  var timer = null;
  function save() {
    dirty = true;
    data.lastSeen = Date.now();
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, 220);
  }
  w.addEventListener('beforeunload', flush);
  w.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', function () { if (document.hidden) flush(); });

  /* ---- time on task ---- */
  var tickAcc = 0;
  setInterval(function () {
    if (document.hidden) return;
    tickAcc += 5;
    if (tickAcc >= 15) { data.seconds += tickAcc; tickAcc = 0; save(); }
  }, 5000);

  var listeners = [];

  var State = {
    KEY: KEY,

    get raw() { return data; },

    on: function (fn) { listeners.push(fn); return function () { listeners = listeners.filter(function (f) { return f !== fn; }); }; },
    emit: function (what) { listeners.forEach(function (f) { try { f(what, data); } catch (e) {} }); },

    /* ---------- identity ---------- */
    hasIdentity: function () { return !!(data.firstName && data.lastName); },
    setIdentity: function (first, last) {
      data.firstName = first.trim();
      data.lastName = last.trim();
      if (!data.startedAt) data.startedAt = Date.now();
      save(); State.emit('identity');
    },
    fullName: function () { return (data.firstName + ' ' + data.lastName).trim(); },
    initials: function () {
      return ((data.firstName[0] || '') + (data.lastName[0] || '')).toUpperCase() || '--';
    },

    /* ---------- steps ---------- */
    stepKey: function (mod, idx) { return mod + '.s' + idx; },
    isStepDone: function (mod, idx) { return !!data.steps[State.stepKey(mod, idx)]; },
    markStep: function (mod, idx) {
      var k = State.stepKey(mod, idx);
      if (data.steps[k]) return false;
      data.steps[k] = Date.now();
      save(); State.emit('step');
      return true;
    },
    unmarkStep: function (mod, idx) {
      delete data.steps[State.stepKey(mod, idx)];
      save(); State.emit('step');
    },

    /* ---------- checkpoints (video) ---------- */
    isCheckpointDone: function (vid, i) { return !!data.checkpoints['v.' + vid + '.' + i]; },
    markCheckpoint: function (vid, i) {
      data.checkpoints['v.' + vid + '.' + i] = Date.now();
      save(); State.emit('checkpoint');
    },
    checkpointsDone: function (vid, total) {
      var n = 0;
      for (var i = 0; i < total; i++) if (State.isCheckpointDone(vid, i)) n++;
      return n;
    },

    /* ---------- quizzes ---------- */
    recordQuiz: function (id, pct, passed) {
      var q = data.quizzes[id] || { best: 0, attempts: 0, passed: false };
      q.attempts++;
      q.best = Math.max(q.best, pct);
      q.passed = q.passed || passed;
      q.at = Date.now();
      data.quizzes[id] = q;
      save(); State.emit('quiz');
      return q;
    },
    quiz: function (id) { return data.quizzes[id] || null; },

    /* ---------- sims ---------- */
    recordSim: function (id, score, passed) {
      var s = data.sims[id] || { best: 0, runs: 0, passed: false };
      s.runs++;
      s.best = Math.max(s.best, score);
      s.passed = s.passed || passed;
      s.at = Date.now();
      data.sims[id] = s;
      save(); State.emit('sim');
      return s;
    },
    sim: function (id) { return data.sims[id] || null; },

    /* ---------- routing memory ---------- */
    setRoute: function (r) { data.lastRoute = r; save(); },
    lastRoute: function () { return data.lastRoute; },

    /* ---------- certificate ---------- */
    certificate: function () { return data.certificate; },
    issueCertificate: function () {
      if (data.certificate) return data.certificate;
      var id = 'MGE-HD8-' + Date.now().toString(36).toUpperCase().slice(-6) +
               '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
      data.certificate = { id: id, issuedAt: Date.now(), name: State.fullName() };
      save(); State.emit('certificate');
      return data.certificate;
    },

    /* ---------- the reader's own rig ---------- */
    rig: function () {
      var d = (w.WALK && w.WALK.defaults) || {};
      var out = {};
      Object.keys(d).forEach(function (k) { out[k] = d[k]; });
      if (data.rig) Object.keys(data.rig).forEach(function (k) {
        if (data.rig[k] !== undefined && data.rig[k] !== null) out[k] = data.rig[k];
      });
      return out;
    },
    setRig: function (patch) {
      data.rig = data.rig || {};
      Object.keys(patch).forEach(function (k) { data.rig[k] = patch[k]; });
      save(); State.emit('rig');
      return State.rig();
    },

    /* ---------- hints (the final only) ---------- */
    HINT_BUDGET: 5,
    hintsLeft: function () {
      return data.examHints === undefined ? State.HINT_BUDGET : data.examHints;
    },
    useHint: function () {
      var left = State.hintsLeft();
      if (left <= 0) return false;
      data.examHints = left - 1;
      save(); State.emit('hint');
      return true;
    },

    /* ---------- xp & levels ---------- */
    xp: function () { return data.xp || 0; },
    levelAt: function (xp) {
      var i = 0;
      for (var k = 0; k < LEVELS.length; k++) if (xp >= LEVELS[k].at) i = k;
      var next = LEVELS[i + 1];
      return {
        n: i + 1,
        name: LEVELS[i].name,
        into: xp - LEVELS[i].at,
        need: next ? next.at - LEVELS[i].at : 0,
        pct: next ? (xp - LEVELS[i].at) / (next.at - LEVELS[i].at) : 1,
        max: !next
      };
    },
    level: function () { return State.levelAt(data.xp || 0); },
    /* returns the new level object when the award crossed a threshold */
    addXP: function (n) {
      var before = State.level().n;
      data.xp = (data.xp || 0) + n;
      save(); State.emit('xp');
      var after = State.level();
      return after.n > before ? after : null;
    },

    /* ---------- time ---------- */
    seconds: function () { return data.seconds; },
    timeLabel: function () {
      var s = data.seconds;
      if (s < 60) return s + 's';
      var m = Math.floor(s / 60);
      if (m < 60) return m + 'm';
      return Math.floor(m / 60) + 'h ' + (m % 60) + 'm';
    },

    /* ---------- reset ---------- */
    reset: function () {
      data = clone(EMPTY);
      try { w.localStorage.removeItem(KEY); } catch (e) {}
      State.emit('reset');
    },

    exportJSON: function () { return JSON.stringify(data, null, 2); },
    flush: flush
  };

  w.State = State;
})(window);
