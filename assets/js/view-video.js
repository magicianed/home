/* ============================================================
   magicianed - video lesson with enforced checkpoints
   The YouTube player is paused at each checkpoint and will not
   resume until the question is answered correctly. The segment
   can be rewatched as many times as you like.
   ============================================================ */
(function (w) {
  'use strict';
  var el = w.UI.el, clear = w.UI.clear, Sound = w.UI.Sound;

  /* ---- YouTube IFrame API loader (once) ---- */
  var ytReady = null;
  function loadYT() {
    if (ytReady) return ytReady;
    ytReady = new Promise(function (resolve) {
      if (w.YT && w.YT.Player) { resolve(w.YT); return; }
      var prev = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = function () {
        if (typeof prev === 'function') prev();
        resolve(w.YT);
      };
      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.head.appendChild(tag);
      /* if the API is blocked, fail open after 6s */
      setTimeout(function () { if (!w.YT || !w.YT.Player) resolve(null); }, 6000);
    });
    return ytReady;
  }

  function mount(host, opts) {
    opts = opts || {};
    var conf = w.COURSE.video[opts.video || 'primary'];
    var vid = opts.video || 'primary';
    var cps = conf.checkpoints || [];
    var player = null, poll = null, duration = 0;
    var gateOpen = false, current = -1, destroyed = false;
    var finished = w.State.checkpointsDone(vid, cps.length) === cps.length;

    var frame = el('div', { class: 'vid__frame' });
    var mountPoint = el('div', { id: 'yt-' + Math.random().toString(36).slice(2) });
    var gate = el('div', { class: 'vid__gate is-hidden' });
    frame.appendChild(mountPoint);
    frame.appendChild(gate);

    var dots = el('div', { class: 'ckdots' });
    var meta = el('div', { class: 'vid__meta' });

    var extras = el('div', { class: 'vidlist' });
    (w.COURSE.video.extras || []).forEach(function (x) {
      extras.appendChild(el('a', {
        class: 'vidlink', href: 'https://www.youtube.com/watch?v=' + x.id, target: '_blank', rel: 'noopener'
      }, [
        el('span', { class: 'vidlink__play', text: '▶' }),
        el('div', { class: 'grow' }, [
          el('div', { style: { fontSize: '13.5px', fontWeight: '580' }, text: x.title }),
          el('div', { style: { fontSize: '12px', color: 'var(--ink-4)', marginTop: '2px' }, text: x.note })
        ])
      ]));
    });

    clear(host).appendChild(el('div', { class: 'vid' }, [
      frame, dots, meta,
      el('h3', { class: 'h3', style: { marginTop: '30px', marginBottom: '10px' }, text: 'Further viewing' }),
      el('p', { class: 'muted', style: { fontSize: '13.5px', marginBottom: '14px' }, text: 'Optional, but each of these covers the HD8 from a different angle. They open in a new tab.' }),
      extras
    ]));

    paintDots();
    paintMeta('Loading player...');

    loadYT().then(function (YT) {
      if (destroyed) return;
      if (!YT) {
        clear(frame);
        frame.appendChild(el('div', { class: 'vid__gate' }, [
          el('div', { class: 'vid__q', text: 'The YouTube player could not load.' }),
          el('p', { class: 'muted', text: 'Your browser or network is blocking youtube.com. Open the video directly, watch it, then answer the checkpoint questions below.' }),
          el('div', { class: 'vid__foot' }, [
            el('a', { class: 'btn btn--primary', href: 'https://www.youtube.com/watch?v=' + conf.id, target: '_blank', rel: 'noopener', text: 'Open on YouTube' }),
            el('button', { class: 'btn btn--ghost', text: 'Answer checkpoints here', onclick: function () { current = -1; nextUnanswered(); } })
          ])
        ]));
        return;
      }
      player = new YT.Player(mountPoint, {
        videoId: conf.id,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: function () {
            duration = player.getDuration() || 0;
            paintMeta(null);
            startPoll();
          },
          onStateChange: function (e) {
            if (e.data === YT.PlayerState.PLAYING && gateOpen) {
              /* refuse to play through an open checkpoint */
              player.pauseVideo();
            }
            if (e.data === YT.PlayerState.ENDED) checkFinish();
          }
        }
      });
    });

    function startPoll() {
      if (poll) clearInterval(poll);
      poll = setInterval(function () {
        if (destroyed || !player || !player.getCurrentTime) return;
        if (!duration) duration = player.getDuration() || 0;
        if (!duration) return;
        var t = player.getCurrentTime();
        for (var i = 0; i < cps.length; i++) {
          if (w.State.isCheckpointDone(vid, i)) continue;
          if (t >= cps[i].at * duration) { openGate(i); break; }
        }
      }, 400);
    }
    function cpTime(i) {
      if (i >= cps.length) return duration;
      return cps[i].at * duration;
    }
    /* where 'rewatch' jumps back to: the checkpoint's own anchor if it has
       one, otherwise the previous checkpoint. Anchors sit well before the
       part being asked about, so you never land mid-sentence. */
    function segStart(i) {
      var cp = cps[i];
      if (cp && typeof cp.from === 'number' && duration) return Math.max(0, cp.from * duration);
      return i === 0 ? 0 : cpTime(i - 1);
    }

    function openGate(i) {
      if (gateOpen && current === i) return;
      current = i; gateOpen = true;
      if (player && player.pauseVideo) player.pauseVideo();
      Sound.arm();
      renderGate(i);
      gate.classList.remove('is-hidden');
      paintDots();
    }
    function closeGate() {
      gateOpen = false;
      gate.classList.add('is-hidden');
      paintDots();
    }

    function renderGate(i, state) {
      var cp = cps[i];
      clear(gate);
      gate.appendChild(el('div', { class: 'vid__gatehead' }, [
        el('span', { class: 'chip chip--info', text: 'Quick check ' + (i + 1) + ' of ' + cps.length }),
        el('span', { class: 'chip', text: cp.topic })
      ]));
      gate.appendChild(el('div', { class: 'vid__q', text: cp.q }));
      var optsBox = el('div', { class: 'vid__opts' });
      var locked = false;
      var order = w.UI.shuffle(cp.opts.map(function (o, k) { return k; }), i * 977 + 13);
      order.forEach(function (origIdx, pos) {
        var btn = el('button', { class: 'opt' }, [
          el('span', { class: 'opt__k', text: 'ABCD'[pos] }),
          el('span', { class: 'grow', text: cp.opts[origIdx] })
        ]);
        btn.onclick = function () {
          if (locked) return;
          if (origIdx === cp.a) {
            locked = true;
            var rb = gate.querySelector('.vid__retry');
            if (rb) rb.remove();
            btn.classList.add('is-right');
            w.UI.qsa('.opt', optsBox).forEach(function (o) { o.classList.add('is-locked'); if (o !== btn) o.classList.add('is-dim'); });
            Sound.good();
            w.State.markCheckpoint(vid, i);
            gate.appendChild(el('div', { class: 'explain', html: '<b>Correct.</b> ' + w.UI.esc(cp.why) }));
            gate.appendChild(el('div', { class: 'vid__foot' }, [
              el('button', {
                class: 'btn btn--primary', text: i === cps.length - 1 ? 'Finish the video' : 'Continue watching',
                onclick: function () { closeGate(); if (player) player.playVideo(); checkFinish(); }
              }),
              el('button', {
                class: 'btn btn--ghost', text: '↺ Rewatch this part',
                onclick: function () { closeGate(); if (player) { player.seekTo(segStart(i), true); player.playVideo(); } }
              })
            ]));
            paintDots();
            checkFinish();
          } else {
            btn.classList.add('is-wrong', 'shake');
            setTimeout(function () { btn.classList.remove('shake'); }, 420);
            Sound.bad();
            btn.disabled = true;
            btn.classList.add('is-locked', 'is-dim');
            if (!gate.querySelector('.vid__retry')) {
              gate.appendChild(el('div', { class: 'vid__retry' }, [
                el('div', { class: 'explain', html: '<b>Not quite.</b> Jump back and watch that part again - you cannot continue until this is right.' }),
                el('div', { class: 'vid__foot' }, [
                  el('button', {
                    class: 'btn btn--brand', text: '↺ Rewatch this part',
                    onclick: function () {
                      closeGate();
                      if (player) { player.seekTo(segStart(i), true); player.playVideo(); }
                    }
                  })
                ])
              ]));
            }
          }
        };
        optsBox.appendChild(btn);
      });
      gate.appendChild(optsBox);
    }

    function nextUnanswered() {
      for (var i = 0; i < cps.length; i++) {
        if (!w.State.isCheckpointDone(vid, i)) { openGate(i); return; }
      }
      checkFinish();
    }

    function checkFinish() {
      if (finished) return;
      if (w.State.checkpointsDone(vid, cps.length) < cps.length) return;
      finished = true;
      Sound.good();
      w.UI.toast('<b>Every checkpoint passed.</b> You can replay the video any time from this step.', 'brand', 4200);
      if (opts.onComplete) opts.onComplete();
      paintDots();
    }

    function paintDots() {
      clear(dots);
      cps.forEach(function (cp, i) {
        var d = el('button', {
          class: 'ckdot' + (w.State.isCheckpointDone(vid, i) ? ' is-done' : '') + (gateOpen && current === i ? ' is-now' : ''),
          title: 'Checkpoint ' + (i + 1) + ' - ' + cp.topic
        });
        d.onclick = function () {
          if (!player || !duration) return;
          player.seekTo(segStart(i), true);
          player.playVideo();
        };
        dots.appendChild(d);
      });
      paintMeta(null);
    }

    function paintMeta(msg) {
      clear(meta);
      var n = w.State.checkpointsDone(vid, cps.length);
      meta.appendChild(el('span', { class: 'mono', text: msg || (n + ' / ' + cps.length + ' checks passed') }));
      if (duration) meta.appendChild(el('span', { class: 'mono', text: 'runtime ' + w.UI.fmtTime(duration) }));
      meta.appendChild(el('span', { text: conf.note }));
      meta.appendChild(el('a', {
        class: 'mono', style: { color: 'var(--info)', marginLeft: 'auto' },
        href: 'https://www.youtube.com/watch?v=' + conf.id, target: '_blank', rel: 'noopener',
        text: 'open on youtube ↗'
      }));
    }

    if (finished) paintMeta(null);

    return {
      destroy: function () {
        destroyed = true;
        if (poll) clearInterval(poll);
        try { if (player && player.destroy) player.destroy(); } catch (e) {}
        clear(host);
      }
    };
  }

  w.ViewVideo = { mount: mount };
})(window);
