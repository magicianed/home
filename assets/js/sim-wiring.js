/* ============================================================
   magicianed - cable patching minigame
   Drag a cable end from a device onto the correct rear panel
   port. Wrong port buzzes and the cable snaps back.
   ============================================================ */
(function (w) {
  'use strict';
  var el = w.UI.el, clear = w.UI.clear, Sound = w.UI.Sound;

  /* rear panel ports available to patch into */
  var PORTS = [
    { id: 'sdi-in-1', g: 'SDI IN', l: '1', t: 'bnc' },
    { id: 'sdi-in-2', g: 'SDI IN', l: '2', t: 'bnc' },
    { id: 'sdi-in-3', g: 'SDI IN', l: '3', t: 'bnc' },
    { id: 'sdi-in-4', g: 'SDI IN', l: '4', t: 'bnc' },
    { id: 'sdi-out-1', g: 'SDI OUT', l: '1', t: 'bnc' },
    { id: 'sdi-out-2', g: 'SDI OUT', l: '2', t: 'bnc' },
    { id: 'sdi-out-3', g: 'SDI OUT', l: '3', t: 'bnc' },
    { id: 'sdi-out-4', g: 'SDI OUT', l: '4', t: 'bnc' },
    { id: 'pgm-out', g: 'OUTPUTS', l: 'PGM', t: 'bnc' },
    { id: 'aux-1', g: 'OUTPUTS', l: 'AUX 1', t: 'bnc' },
    { id: 'aux-2', g: 'OUTPUTS', l: 'AUX 2', t: 'bnc' },
    { id: 'mv-sdi', g: 'OUTPUTS', l: 'MV SDI', t: 'bnc' },
    { id: 'mv-hdmi', g: 'OUTPUTS', l: 'MV HDMI', t: 'hdmi' },
    { id: 'xlr-1', g: 'AUDIO', l: 'XLR 1', t: 'xlr' },
    { id: 'xlr-2', g: 'AUDIO', l: 'XLR 2', t: 'xlr' },
    { id: 'rca', g: 'AUDIO', l: 'RCA', t: 'rca' },
    { id: 'jack-out', g: 'AUDIO', l: 'JACK OUT', t: 'jack' },
    { id: 'talk', g: 'CONTROL', l: 'TALKBACK', t: 'xlr5' },
    { id: 'eth-1', g: 'CONTROL', l: 'ETH 1', t: 'rj' },
    { id: 'eth-2', g: 'CONTROL', l: 'ETH 2', t: 'rj' },
    { id: 'eth-3', g: 'CONTROL', l: 'ETH 3', t: 'rj' },
    { id: 'eth-4', g: 'CONTROL', l: 'ETH 4', t: 'rj' },
    { id: 'usb-1', g: 'CONTROL', l: 'USB-C 1', t: 'usb' },
    { id: 'usb-2', g: 'CONTROL', l: 'USB-C 2', t: 'usb' },
    { id: 'ac', g: 'POWER', l: 'AC IN', t: 'iec' },
    { id: 'dc', g: 'POWER', l: '12V DC', t: 'dc' }
  ];

  var ETH = ['eth-1', 'eth-2', 'eth-3', 'eth-4'];

  var LEVELS = {
    1: {
      title: 'A three-camera studio',
      brief: 'Six patches. Get the cameras in, one return out, the monitor, the microphone and the computer.',
      patches: [
        { id: 'c1', dev: 'Camera 1', end: 'SDI OUT', t: 'bnc', accept: ['sdi-in-1'], col: 'var(--pvw)',
          why: 'Camera 1 picture into SDI Input 1.' },
        { id: 'c2', dev: 'Camera 2', end: 'SDI OUT', t: 'bnc', accept: ['sdi-in-2'], col: 'var(--pvw)',
          why: 'Camera 2 picture into SDI Input 2. Keep the numbers matched.' },
        { id: 'c1r', dev: 'Camera 1', end: 'SDI IN (return)', t: 'bnc', accept: ['sdi-out-1'], col: 'var(--key)',
          why: 'SDI Output 1 back to camera 1 - program return, tally and camera control on one coax.' },
        { id: 'mv', dev: 'Multiview monitor', end: 'HDMI IN', t: 'hdmi', accept: ['mv-hdmi'], col: 'var(--info)',
          why: 'Multiview HDMI out to the operator display.' },
        { id: 'mic', dev: 'Host microphone', end: 'XLR OUT', t: 'xlr', accept: ['xlr-1'], col: 'var(--audio)',
          why: 'Balanced microphone into XLR Analog In 1.' },
        { id: 'pc', dev: 'Control computer', end: 'ETHERNET', t: 'rj', accept: ETH, col: 'var(--brand)',
          why: 'Any of the four RJ45 ports - they are a built-in network switch.' }
      ]
    },
    2: {
      title: 'The whole studio',
      brief: 'Eighteen patches. Three cameras and their return cables, every output, the sound, the network, the recording drive, the headset and both power leads.',
      patches: [
        { id: 'c1', dev: 'Camera 1', end: 'SDI OUT', t: 'bnc', accept: ['sdi-in-1'], col: 'var(--pvw)', why: 'Camera 1 into Input 1.' },
        { id: 'c2', dev: 'Camera 2', end: 'SDI OUT', t: 'bnc', accept: ['sdi-in-2'], col: 'var(--pvw)', why: 'Camera 2 into Input 2.' },
        { id: 'c3', dev: 'Camera 3', end: 'SDI OUT', t: 'bnc', accept: ['sdi-in-3'], col: 'var(--pvw)', why: 'Camera 3 into Input 3.' },
        { id: 'c1r', dev: 'Camera 1', end: 'SDI IN (return)', t: 'bnc', accept: ['sdi-out-1'], col: 'var(--key)', why: 'Return 1 to camera 1.' },
        { id: 'c2r', dev: 'Camera 2', end: 'SDI IN (return)', t: 'bnc', accept: ['sdi-out-2'], col: 'var(--key)', why: 'Return 2 to camera 2.' },
        { id: 'c3r', dev: 'Camera 3', end: 'SDI IN (return)', t: 'bnc', accept: ['sdi-out-3'], col: 'var(--key)', why: 'Return 3 to camera 3.' },
        { id: 'rec', dev: 'Program recorder', end: 'SDI IN', t: 'bnc', accept: ['pgm-out'], col: 'var(--pgm)', why: 'The clean program feed.' },
        { id: 'stage', dev: 'Stage screen', end: 'SDI IN', t: 'bnc', accept: ['aux-1'], col: 'var(--pgm)', why: 'An aux output - independently routable.' },
        { id: 'mv', dev: 'Multiview monitor', end: 'HDMI IN', t: 'hdmi', accept: ['mv-hdmi'], col: 'var(--info)', why: 'Multiview to the operator display.' },
        { id: 'mic', dev: 'Host microphone', end: 'XLR OUT', t: 'xlr', accept: ['xlr-1'], col: 'var(--audio)', why: 'Balanced mic into XLR In 1.' },
        { id: 'lap', dev: 'Playback laptop', end: 'AUDIO OUT', t: 'rca', accept: ['rca'], col: 'var(--audio)', why: 'Consumer stereo into the RCA inputs.' },
        { id: 'pa', dev: 'PA system', end: 'LINE IN', t: 'jack', accept: ['jack-out'], col: 'var(--audio)', why: 'Balanced 1/4 inch jack output feeds the PA.' },
        { id: 'pc', dev: 'Control computer', end: 'ETHERNET', t: 'rj', accept: ETH, col: 'var(--brand)', why: 'Any RJ45 - built-in switch.' },
        { id: 'net', dev: 'Internet router', end: 'ETHERNET', t: 'rj', accept: ETH, col: 'var(--brand)', why: 'Needed for streaming - and for a working gateway.' },
        { id: 'ssd', dev: 'Record SSD', end: 'USB-C', t: 'usb', accept: ['usb-1', 'usb-2'], col: 'var(--iso)', why: 'Record media on USB-C, formatted exFAT.' },
        { id: 'head', dev: 'Talkback headset', end: '5-PIN XLR', t: 'xlr5', accept: ['talk'], col: 'var(--brand)', why: 'Broadcast headset on the 5-pin XLR.' },
        { id: 'mains', dev: 'Mains supply', end: 'IEC', t: 'iec', accept: ['ac'], col: 'var(--ink-2)', why: 'Primary power.' },
        { id: 'batt', dev: '12V battery', end: 'DC', t: 'dc', accept: ['dc'], col: 'var(--ink-2)', why: 'Redundant power - mains can drop without a reboot.' }
      ]
    }
  };

  function mount(host, opts) {
    opts = opts || {};
    var lvl = LEVELS[opts.level || 1];
    var patched = {};   /* patchId -> portId */
    var used = {};      /* portId -> patchId */
    var wrong = 0, finished = false;

    var board = el('div', { class: 'wire' });
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'wire__svg');
    var devCol = el('div', { class: 'wire__devs' });
    var portCol = el('div', { class: 'wire__ports' });
    board.appendChild(svg); board.appendChild(devCol); board.appendChild(portCol);

    var statusBar = el('div', { class: 'wirestat' });
    var infoBar = el('div', { class: 'wireinfo', text: lvl.brief });

    var taskPanel = el('div', { class: 'card card--pad' });
    clear(host).appendChild(el('div', { class: 'simwrap' }, [
      el('div', {}, [board, statusBar, infoBar]),
      el('div', { class: 'simside' }, [taskPanel])
    ]));

    var endNodes = {}, portNodes = {};

    /* ---- devices ---- */
    var byDev = {};
    lvl.patches.forEach(function (p) { (byDev[p.dev] = byDev[p.dev] || []).push(p); });
    Object.keys(byDev).forEach(function (dev) {
      var card = el('div', { class: 'wdev' }, [el('div', { class: 'wdev__n', text: dev })]);
      byDev[dev].forEach(function (p) {
        var nub = el('button', {
          class: 'wend', data: { patch: p.id }, style: { '--c': p.col }
        }, [
          el('span', { class: 'wend__l', text: p.end }),
          el('span', { class: 'wend__p port port--' + p.t }, [el('i')])
        ]);
        endNodes[p.id] = nub;
        attachDrag(nub, p);
        card.appendChild(nub);
      });
      devCol.appendChild(card);
    });

    /* ---- ports ---- */
    var groups = {};
    PORTS.forEach(function (pt) { (groups[pt.g] = groups[pt.g] || []).push(pt); });
    Object.keys(groups).forEach(function (g) {
      var grp = el('div', { class: 'wpg' }, [el('div', { class: 'wpg__t', text: g })]);
      var row = el('div', { class: 'wpg__r' });
      groups[g].forEach(function (pt) {
        var node = el('div', { class: 'wport', data: { port: pt.id } }, [
          el('span', { class: 'port port--' + pt.t }, [el('i')]),
          el('span', { class: 'wport__l', text: pt.l })
        ]);
        portNodes[pt.id] = node;
        row.appendChild(node);
      });
      grp.appendChild(row);
      portCol.appendChild(grp);
    });

    /* ---- cable drawing ---- */
    var live = null;
    function attachDrag(node, p) {
      w.UI.drag(node, {
        start: function (e) {
          if (patched[p.id]) return;
          live = { p: p, x: e.clientX, y: e.clientY };
          node.classList.add('is-drag');
          highlight(p, true);
          draw();
        },
        move: function (e) {
          if (!live) return;
          live.x = e.clientX; live.y = e.clientY;
          draw();
        },
        end: function (e) {
          if (!live) return;
          node.classList.remove('is-drag');
          highlight(p, false);
          var hit = portUnder(e.clientX, e.clientY);
          live = null;
          if (hit) tryPatch(p, hit);
          draw();
        }
      });
    }
    function highlight(p, on) {
      p.accept.forEach(function (id) {
        if (portNodes[id] && !used[id]) portNodes[id].classList.toggle('is-hint', on);
      });
    }
    function portUnder(x, y) {
      var found = null;
      Object.keys(portNodes).forEach(function (id) {
        var r = portNodes[id].getBoundingClientRect();
        if (x >= r.left - 8 && x <= r.right + 8 && y >= r.top - 8 && y <= r.bottom + 8) found = id;
      });
      return found;
    }
    function tryPatch(p, portId) {
      if (used[portId]) {
        Sound.bad(); flash(portNodes[portId], 'bad');
        w.UI.toast('That port already has a cable in it.', 'bad');
        return;
      }
      if (p.accept.indexOf(portId) < 0) {
        wrong++;
        Sound.bad(); flash(portNodes[portId], 'bad'); flash(endNodes[p.id], 'bad');
        var pt = PORTS.filter(function (q) { return q.id === portId; })[0];
        w.UI.toast('<b>Wrong port.</b> ' + w.UI.esc(p.dev + ' ' + p.end) + ' does not belong in ' + w.UI.esc(pt.g + ' ' + pt.l) + '.', 'bad', 3000);
        paint();
        return;
      }
      patched[p.id] = portId; used[portId] = p.id;
      Sound.good(); flash(portNodes[portId], 'ok');
      w.UI.toast('<b>Patched.</b> ' + w.UI.esc(p.why), 'ok', 2600);
      paint();
    }
    function flash(node, kind) {
      if (!node) return;
      node.classList.add('is-' + kind);
      setTimeout(function () { node.classList.remove('is-' + kind); }, 620);
    }

    function draw() {
      var br = board.getBoundingClientRect();
      svg.setAttribute('viewBox', '0 0 ' + br.width + ' ' + br.height);
      svg.setAttribute('width', br.width);
      svg.setAttribute('height', br.height);
      clear(svg);
      Object.keys(patched).forEach(function (pid) {
        var p = lvl.patches.filter(function (q) { return q.id === pid; })[0];
        cable(center(endNodes[pid], br), center(portNodes[patched[pid]], br), p.col, false);
      });
      if (live) {
        cable(center(endNodes[live.p.id], br), { x: live.x - br.left, y: live.y - br.top }, live.p.col, true);
      }
    }
    function center(node, br) {
      var r = node.getBoundingClientRect();
      return { x: r.left + r.width / 2 - br.left, y: r.top + r.height / 2 - br.top };
    }
    function cable(a, b, col, dashed) {
      var dx = Math.max(50, Math.abs(b.x - a.x) * 0.55);
      var d = 'M ' + a.x + ' ' + a.y + ' C ' + (a.x + dx) + ' ' + (a.y + 24) + ', ' + (b.x - dx) + ' ' + (b.y + 24) + ', ' + b.x + ' ' + b.y;
      var shadow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      shadow.setAttribute('d', d); shadow.setAttribute('fill', 'none');
      shadow.setAttribute('stroke', '#000'); shadow.setAttribute('stroke-width', '6');
      shadow.setAttribute('stroke-linecap', 'round'); shadow.setAttribute('opacity', '.65');
      svg.appendChild(shadow);
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d); path.setAttribute('fill', 'none');
      path.setAttribute('stroke', col); path.setAttribute('stroke-width', '2.5');
      path.setAttribute('stroke-linecap', 'round');
      if (dashed) { path.setAttribute('stroke-dasharray', '7 6'); path.setAttribute('opacity', '.85'); }
      svg.appendChild(path);
    }

    function paint() {
      Object.keys(portNodes).forEach(function (id) {
        portNodes[id].classList.toggle('is-used', !!used[id]);
      });
      lvl.patches.forEach(function (p) {
        endNodes[p.id].classList.toggle('is-done', !!patched[p.id]);
      });
      draw();
      renderTasks();

      var n = Object.keys(patched).length;
      clear(statusBar);
      statusBar.appendChild(el('div', { class: 'wirestat__bar' }, [el('i', { style: { width: (n / lvl.patches.length * 100) + '%' } })]));
      statusBar.appendChild(el('span', { class: 'mono', text: n + ' / ' + lvl.patches.length + ' patched' }));
      statusBar.appendChild(el('span', { class: 'mono' + (wrong ? ' wirestat--bad' : ''), text: wrong + ' wrong' }));

      if (!finished && n === lvl.patches.length) {
        finished = true;
        var score = Math.max(40, 100 - wrong * 6);
        w.State.recordSim('wiring' + (opts.level || 1), score, true);
        setTimeout(function () {
          w.UI.toast('<b>Studio wired.</b> Score ' + score + '/100 with ' + wrong + ' wrong attempt' + (wrong === 1 ? '' : 's') + '.', 'brand', 4600);
          if (opts.onComplete) opts.onComplete();
        }, 400);
      }
    }

    function renderTasks() {
      clear(taskPanel);
      taskPanel.appendChild(el('div', { class: 'simside__t', text: 'Patch list - ' + lvl.title }));
      var list = el('div', { class: 'tasks' });
      lvl.patches.forEach(function (p) {
        var d = !!patched[p.id];
        list.appendChild(el('div', { class: 'task' + (d ? ' is-done' : '') }, [
          el('i', { class: 'task__box', text: '✓' }),
          el('div', { class: 'grow' }, [
            el('span', { text: p.dev + ' — ' + p.end }),
            d ? el('span', { class: 'task__hint', text: p.why }) : null
          ])
        ]));
      });
      taskPanel.appendChild(list);
    }

    var ro = null;
    if (w.ResizeObserver) { ro = new w.ResizeObserver(function () { draw(); }); ro.observe(board); }
    w.addEventListener('resize', draw);

    paint();
    setTimeout(draw, 60);
    return { destroy: function () { if (ro) ro.disconnect(); w.removeEventListener('resize', draw); clear(host); } };
  }

  w.SimWiring = { mount: mount, LEVELS: LEVELS, PORTS: PORTS };
})(window);
