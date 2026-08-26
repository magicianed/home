/* ============================================================
   magicianed - Windows desktop simulation
   File Explorer, the Blackmagic installer, ATEM Setup, and
   ATEM Software Control running inside a draggable window.
   ============================================================ */
(function (w) {
  'use strict';
  var el = w.UI.el, clear = w.UI.clear, Sound = w.UI.Sound;

  var FS = {
    'C:\\Users\\Operator\\Downloads': [
      { n: 'Blackmagic_ATEM_Switchers_9.6.exe', k: 'exe', size: '412 MB', d: 'Today' },
      { n: 'DaVinci_Resolve_Studio.dmg', k: 'file', size: '3.1 GB', d: 'Yesterday' },
      { n: 'venue_riser_diagram.pdf', k: 'pdf', size: '2.4 MB', d: '3 days ago' }
    ],
    'C:\\Shows\\Graphics': [
      { n: 'LT_01_HostName.png', k: 'png', size: '318 KB', d: 'Today', media: 0 },
      { n: 'LT_02_GuestName.png', k: 'png', size: '312 KB', d: 'Today', media: 1 },
      { n: 'BUG_Logo.png', k: 'png', size: '96 KB', d: 'Today', media: 2 },
      { n: 'BG_Studio.png', k: 'jpg', size: '1.8 MB', d: 'Today', media: 3 },
      { n: 'HOLDING_Slide.png', k: 'jpg', size: '1.4 MB', d: 'Today', media: 4 },
      { n: 'STINGER_Open.tga', k: 'file', size: '86 MB', d: 'Today', media: 5 }
    ],
    'C:\\Shows': [
      { n: 'Graphics', k: 'dir' },
      { n: 'Recordings', k: 'dir' }
    ],
    'C:\\Shows\\Recordings': [
      { n: 'ATEM_2026-08-25_PGM.mp4', k: 'video', size: '4.2 GB', d: 'Today' },
      { n: 'ATEM_2026-08-25_ISO1.mp4', k: 'video', size: '3.8 GB', d: 'Today' },
      { n: 'ATEM_2026-08-25.drp', k: 'drp', size: '1.1 MB', d: 'Today' }
    ]
  };

  var MISSIONS = {
    'windows-install': {
      title: 'Install and connect',
      apps: ['explorer'],
      installed: false,
      tasks: [
        { id: 'a', label: 'Open File Explorer', hint: 'Click the folder on the taskbar.',
          check: function (c) { return c.opened.explorer; } },
        { id: 'b', label: 'Go to the Downloads folder', hint: 'Quick access, on the left.',
          check: function (c) { return c.path === 'C:\\Users\\Operator\\Downloads'; } },
        { id: 'c', label: 'Run Blackmagic_ATEM_Switchers_9.6.exe', hint: 'Double-click the installer.',
          check: function (c) { return c.opened.installer; } },
        { id: 'd', label: 'Complete the installation', hint: 'Work through the installer to Finish.',
          check: function (c) { return c.installed; } },
        { id: 'e', label: 'Launch ATEM Software Control', hint: 'Its icon appears on the desktop once installed.',
          check: function (c) { return c.opened.atem; } },
        { id: 'f', label: 'Connect to the ATEM Television Studio HD8 ISO', hint: 'Pick it from the device list.',
          check: function (c) { return c.connected; } }
      ]
    },

    'windows-media': {
      title: 'File Explorer to on air',
      apps: ['explorer', 'atem'],
      installed: true, connected: true,
      tasks: [
        { id: 'a', label: 'Open File Explorer and go to C:\\Shows\\Graphics', hint: 'Use the address bar or the sidebar.',
          check: function (c) { return c.path === 'C:\\Shows\\Graphics'; } },
        { id: 'b', label: 'Open ATEM Software Control and switch to the Media tab',
          hint: 'The tab row across the top of the application.',
          check: function (c) { return c.opened.atem && c.atem && c.atem.state.tab === 'media'; } },
        { id: 'c', label: 'Drag LT_01_HostName.png from Explorer into media pool slot 1',
          hint: 'Drag the file straight across from one window to the other.',
          check: function (c) { return c.atem && c.atem.state.pool[0] && c.atem.state.pool[0].name === 'LT_01_HostName.png'; } },
        { id: 'd', label: 'Also load HOLDING_Slide.png into slot 2', hint: 'Same drag, different slot.',
          check: function (c) { return c.atem && c.atem.state.pool[1] && c.atem.state.pool[1].name === 'HOLDING_Slide.png'; } },
        { id: 'e', label: 'On the Switcher tab, point Media Player 1 at slot 1',
          hint: 'Open the Media Players palette.',
          check: function (c) { return c.atem && c.atem.state.players[0].slot === 0; } },
        { id: 'f', label: 'Set DSK 1 fill to Media Player 1, key to Media Player 1 Key, and tick Pre Multiplied Key',
          hint: 'Downstream Key palette.',
          check: function (c) { var d = c.atem && c.atem.state.dsk[0]; return d && d.fill === 3010 && d.keySrc === 3011 && d.pre; } },
        { id: 'g', label: 'Put a camera on program and take DSK 1 on air',
          hint: 'The graphic should appear over the picture.',
          check: function (c) { var s = c.atem && c.atem.state; return s && s.dsk[0].onAir && s.program >= 1 && s.program <= 8; } }
      ]
    },

    setup: {
      title: 'Configure the switcher',
      apps: ['setup'],
      installed: true,
      tasks: [
        { id: 'a', label: 'Open ATEM Setup', hint: 'Desktop icon or taskbar.',
          check: function (c) { return c.opened.setup; } },
        { id: 'b', label: 'Select the ATEM Television Studio HD8 ISO', hint: 'The device list on the left.',
          check: function (c) { return c.setup.selected; } },
        { id: 'c', label: 'Rename it to Studio A HD8', hint: 'The Name field on the Setup tab.',
          check: function (c) { return c.setup.name === 'Studio A HD8'; } },
        { id: 'd', label: 'Set the video standard to 1080p50 for a European studio',
          hint: 'The Configure tab.',
          check: function (c) { return c.setup.standard === '1080p50'; } },
        { id: 'e', label: 'Switch the network from DHCP to a static address', hint: 'Setup tab, Configure Address.',
          check: function (c) { return c.setup.dhcp === false; } },
        { id: 'f', label: 'Set the IP to 192.168.10.240 with mask 255.255.255.0 and gateway 192.168.10.1',
          hint: 'All three fields must be right.',
          check: function (c) { return c.setup.ip === '192.168.10.240' && c.setup.mask === '255.255.255.0' && c.setup.gw === '192.168.10.1'; } },
        { id: 'g', label: 'Set the multiview to a 10-up layout', hint: 'Configure tab.',
          check: function (c) { return c.setup.mv === '10 up'; } },
        { id: 'h', label: 'Save the settings to the switcher', hint: 'The Save button, bottom right.',
          check: function (c) { return c.setup.saved; } }
      ]
    }
  };

  function icon(kind) {
    var map = {
      dir: ['#ffc861', 'FOLDER'], exe: ['#7fb2ff', 'EXE'], png: ['#00d5d5', 'PNG'],
      jpg: ['#00d5d5', 'JPG'], pdf: ['#ff6b6b', 'PDF'], video: ['#ff5fa2', 'MP4'],
      drp: ['#a259ff', 'DRP'], file: ['#9a9aa4', 'FILE']
    };
    var m = map[kind] || map.file;
    return el('div', { class: 'fi__ic fi__ic--' + kind, style: { '--c': m[0] } }, [el('span', { text: m[1] })]);
  }

  function mount(host, opts) {
    opts = opts || {};
    var mission = MISSIONS[opts.mission] || MISSIONS['windows-install'];

    var c = {
      path: 'C:\\Users\\Operator',
      opened: {},
      installed: !!mission.installed,
      connected: !!mission.connected,
      installStep: 0,
      atem: null,
      setup: { selected: false, name: 'ATEM Television Studio HD8 ISO', standard: '1080i59.94', dhcp: true, ip: '192.168.1.55', mask: '255.255.255.0', gw: '192.168.1.1', mv: '4 up', saved: false, tab: 'setup' },
      zTop: 10
    };
    var doneT = {}, finished = false;
    var wins = {};

    var desktop = el('div', { class: 'win' });
    var iconLayer = el('div', { class: 'win__icons' });
    var winLayer = el('div', { class: 'win__windows' });
    var taskbar = el('div', { class: 'win__taskbar' });
    desktop.appendChild(el('div', { class: 'win__wall' }));
    desktop.appendChild(iconLayer);
    desktop.appendChild(winLayer);
    desktop.appendChild(taskbar);

    var taskPanel = el('div', { class: 'card card--pad' });
    clear(host).appendChild(el('div', { class: 'simwrap' }, [
      el('div', { class: 'winhost' }, [desktop]),
      el('div', { class: 'simside' }, [taskPanel])
    ]));

    /* ---------------- window manager ---------------- */
    function makeWindow(id, title, iconLabel, bodyBuilder, geom) {
      if (wins[id]) { focusWin(id); return wins[id]; }
      var win = el('div', { class: 'w32 w32--' + id });
      win.style.left = (geom && geom.x || 60) + 'px';
      win.style.top = (geom && geom.y || 40) + 'px';
      win.style.width = (geom && geom.wd || 620) + 'px';
      win.style.height = (geom && geom.ht || 420) + 'px';
      win.style.zIndex = String(++c.zTop);

      var bar = el('div', { class: 'w32__bar' }, [
        el('span', { class: 'w32__ic', text: iconLabel }),
        el('span', { class: 'w32__t', text: title }),
        el('div', { class: 'w32__btns' }, [
          el('button', { class: 'w32__b', text: '\u2212', onclick: function (e) { e.stopPropagation(); win.classList.toggle('is-min'); } }),
          el('button', { class: 'w32__b', text: '\u25a1', onclick: function (e) { e.stopPropagation(); win.classList.toggle('is-max'); } }),
          el('button', { class: 'w32__b w32__b--x', text: '\u2715', onclick: function (e) { e.stopPropagation(); closeWin(id); } })
        ])
      ]);
      var body = el('div', { class: 'w32__body' });
      win.appendChild(bar); win.appendChild(body);
      win.addEventListener('pointerdown', function () { focusWin(id); });

      /* drag by title bar */
      var off = { x: 0, y: 0 };
      w.UI.drag(bar, {
        start: function (e) {
          var r = win.getBoundingClientRect(), pr = winLayer.getBoundingClientRect();
          off.x = e.clientX - r.left; off.y = e.clientY - r.top;
          win.classList.add('is-drag');
          win._pr = pr;
        },
        move: function (e) {
          if (win.classList.contains('is-max')) return;
          var pr = win._pr;
          win.style.left = w.UI.clamp(e.clientX - pr.left - off.x, -40, pr.width - 90) + 'px';
          win.style.top = w.UI.clamp(e.clientY - pr.top - off.y, 0, pr.height - 40) + 'px';
        },
        end: function () { win.classList.remove('is-drag'); }
      });

      wins[id] = { node: win, body: body, build: bodyBuilder };
      winLayer.appendChild(win);
      c.opened[id] = true;
      bodyBuilder(body);
      Sound.tap();
      check();
      renderTaskbar();
      return wins[id];
    }
    function focusWin(id) { if (wins[id]) wins[id].node.style.zIndex = String(++c.zTop); }
    function closeWin(id) {
      if (!wins[id]) return;
      wins[id].node.remove(); delete wins[id]; c.opened[id] = false;
      if (id === 'atem') c.atem = null;
      Sound.tap(); renderTaskbar();
    }
    function rebuild(id) { if (wins[id]) { clear(wins[id].body); wins[id].build(wins[id].body); } }

    /* ---------------- File Explorer ---------------- */
    function buildExplorer(body) {
      clear(body);
      var side = el('div', { class: 'fx__side' });
      side.appendChild(el('div', { class: 'fx__sh', text: 'Quick access' }));
      [['Desktop', 'C:\\Users\\Operator'], ['Downloads', 'C:\\Users\\Operator\\Downloads'], ['Shows', 'C:\\Shows'], ['Graphics', 'C:\\Shows\\Graphics'], ['Recordings', 'C:\\Shows\\Recordings']].forEach(function (p) {
        side.appendChild(el('button', {
          class: 'fx__sl' + (c.path === p[1] ? ' is-on' : ''), text: p[0],
          onclick: function () { c.path = p[1]; Sound.tap(); rebuild('explorer'); check(); }
        }));
      });
      side.appendChild(el('div', { class: 'fx__sh', text: 'This PC' }));
      side.appendChild(el('div', { class: 'fx__sl fx__sl--dim', text: 'Local Disk (C:)' }));
      side.appendChild(el('div', { class: 'fx__sl fx__sl--dim', text: 'SHOW_SSD (E:)' }));

      var main = el('div', { class: 'fx__main' });
      main.appendChild(el('div', { class: 'fx__addr' }, [
        el('button', { class: 'fx__nav', text: '\u2190', onclick: function () { c.path = 'C:\\Users\\Operator'; rebuild('explorer'); check(); } }),
        el('div', { class: 'fx__path mono', text: c.path })
      ]));

      var files = FS[c.path] || [{ n: 'Downloads', k: 'dir' }, { n: 'Documents', k: 'dir' }, { n: 'Shows', k: 'dir' }];
      var grid = el('div', { class: 'fx__grid' });
      files.forEach(function (f) {
        var item = el('div', { class: 'fi', tabindex: '0', draggable: f.media !== undefined ? 'true' : 'false' }, [
          icon(f.k),
          el('div', { class: 'fi__n', text: f.n }),
          f.size ? el('div', { class: 'fi__m', text: f.size + ' \u00b7 ' + f.d }) : null
        ]);
        if (f.media !== undefined) {
          item.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('text/plain', String(f.media));
            e.dataTransfer.effectAllowed = 'copy';
            item.classList.add('is-drag');
          });
          item.addEventListener('dragend', function () { item.classList.remove('is-drag'); });
        }
        item.addEventListener('dblclick', function () {
          if (f.k === 'dir') {
            var np = c.path.replace(/\\$/, '') + '\\' + f.n;
            if (FS[np]) { c.path = np; rebuild('explorer'); check(); }
            return;
          }
          if (f.k === 'exe') { openInstaller(); return; }
          w.UI.toast('Windows cannot preview ' + f.n + ' here - this simulation only needs the ATEM path.', 'info');
        });
        grid.appendChild(item);
      });
      main.appendChild(grid);
      main.appendChild(el('div', { class: 'fx__status mono', text: files.length + ' items' }));

      body.appendChild(el('div', { class: 'fx' }, [side, main]));
    }

    /* ---------------- Installer ---------------- */
    var INSTALL_STEPS = [
      { t: 'Blackmagic ATEM Switchers 9.6', b: 'This will install ATEM Software Control, ATEM Setup and supporting components on your computer. Close any running Blackmagic applications before continuing.', btn: 'Next' },
      { t: 'License Agreement', b: 'Blackmagic Design software licence agreement. Read it, because one day somebody will ask whether you did.', btn: 'Agree' },
      { t: 'Choose Install Location', b: 'C:\\Program Files\\Blackmagic Design\\Blackmagic ATEM Switchers\\  -  412 MB required.', btn: 'Install' },
      { t: 'Installing', b: 'Copying files and registering components...', btn: '', progress: true },
      { t: 'Installation Complete', b: 'ATEM Software Control and ATEM Setup have been installed. Shortcuts have been added to your desktop.', btn: 'Finish' }
    ];
    function openInstaller() {
      c.installStep = 0;
      makeWindow('installer', 'Blackmagic ATEM Switchers 9.6 Setup', 'BM', buildInstaller, { x: 150, y: 70, wd: 500, ht: 320 });
    }
    function buildInstaller(body) {
      clear(body);
      var st = INSTALL_STEPS[c.installStep];
      var box = el('div', { class: 'inst' }, [
        el('div', { class: 'inst__brand' }, [el('span', { text: 'Blackmagic Design' })]),
        el('div', { class: 'inst__t', text: st.t }),
        el('p', { class: 'inst__b', text: st.b })
      ]);
      if (st.progress) {
        var bar = el('div', { class: 'inst__bar' }, [el('i')]);
        box.appendChild(bar);
        var pctText = el('div', { class: 'inst__pct mono', text: '0%' });
        box.appendChild(pctText);
        var pct = 0;
        var iv = setInterval(function () {
          pct += Math.random() * 14 + 5;
          if (pct >= 100) {
            pct = 100; clearInterval(iv);
            setTimeout(function () { c.installStep++; c.installed = true; check(); rebuild('installer'); renderIcons(); }, 420);
          }
          bar.firstChild.style.width = Math.min(100, pct) + '%';
          pctText.textContent = Math.round(Math.min(100, pct)) + '%';
        }, 260);
      } else {
        box.appendChild(el('div', { class: 'inst__foot' }, [
          el('button', {
            class: 'w32btn w32btn--p', text: st.btn,
            onclick: function () {
              Sound.tap();
              if (c.installStep === INSTALL_STEPS.length - 1) {
                closeWin('installer');
                w.UI.toast('Installed. ATEM Software Control and ATEM Setup are on the desktop.', 'ok');
                renderIcons(); check(); return;
              }
              c.installStep++; rebuild('installer');
            }
          })
        ]));
      }
      body.appendChild(box);
    }

    /* ---------------- ATEM Software Control ---------------- */
    function openATEM() {
      makeWindow('atem', 'ATEM Software Control', 'AS', buildATEM, { x: 30, y: 20, wd: 900, ht: 620 });
    }
    function buildATEM(body) {
      clear(body);
      if (!c.connected) {
        var list = el('div', { class: 'devsel' }, [
          el('div', { class: 'devsel__t', text: 'Select an ATEM switcher' }),
          el('p', { class: 'devsel__b', text: 'ATEM Software Control found the following switchers on the network.' })
        ]);
        [
          { n: 'ATEM Television Studio HD8 ISO', ip: '192.168.10.240', ok: true },
          { n: 'ATEM Mini Pro (Studio B)', ip: '192.168.10.61', ok: true },
          { n: 'ATEM Television Studio HD8', ip: '192.168.10.9', ok: false, note: 'firmware 9.1 - update required' }
        ].forEach(function (d) {
          list.appendChild(el('button', {
            class: 'devrow' + (d.ok ? '' : ' is-bad'),
            onclick: function () {
              if (!d.ok) { Sound.bad(); w.UI.toast('Firmware mismatch - open ATEM Setup and update this switcher first.', 'bad', 3600); return; }
              if (d.n.indexOf('HD8 ISO') < 0) { Sound.bad(); w.UI.toast('That is a different switcher. Connect to the HD8 ISO.', 'bad'); return; }
              c.connected = true; Sound.good(); w.UI.toast('Connected to ' + d.n, 'ok');
              check(); rebuild('atem');
            }
          }, [
            el('div', { class: 'devrow__n', text: d.n }),
            el('div', { class: 'devrow__i mono', text: d.ip + (d.note ? '  \u00b7  ' + d.note : '') })
          ]));
        });
        body.appendChild(list);
        return;
      }
      var holder = el('div', { class: 'atemhost' });
      body.appendChild(holder);
      c.atem = w.SimATEM.mount(holder, {
        mission: 'freeplay', embedded: true,
        onChange: function () { check(); }
      });
      check();
    }

    /* ---------------- ATEM Setup ---------------- */
    function openSetup() {
      makeWindow('setup', 'Blackmagic ATEM Setup', 'BS', buildSetup, { x: 90, y: 40, wd: 720, ht: 470 });
    }
    function buildSetup(body) {
      clear(body);
      var st = c.setup;
      var side = el('div', { class: 'bs__side' }, [el('div', { class: 'bs__sh', text: 'ATEM SWITCHERS' })]);
      [{ n: 'ATEM Television Studio HD8 ISO', ip: '192.168.1.55' }].forEach(function (d) {
        side.appendChild(el('button', {
          class: 'bs__dev' + (st.selected ? ' is-on' : ''),
          onclick: function () { st.selected = true; Sound.tap(); check(); rebuild('setup'); }
        }, [
          el('div', { class: 'bs__devn', text: st.name }),
          el('div', { class: 'bs__devi mono', text: st.dhcp ? d.ip + ' (DHCP)' : st.ip + ' (Static)' })
        ]));
      });

      var main = el('div', { class: 'bs__main' });
      if (!st.selected) {
        main.appendChild(el('div', { class: 'bs__empty', text: 'Select a switcher from the list to configure it.' }));
        body.appendChild(el('div', { class: 'bs' }, [side, main]));
        return;
      }

      var tabs = el('div', { class: 'bs__tabs' });
      ['setup', 'configure', 'audio', 'streaming'].forEach(function (t) {
        tabs.appendChild(el('button', {
          class: 'bs__tab' + (st.tab === t ? ' is-on' : ''), text: t.charAt(0).toUpperCase() + t.slice(1),
          onclick: function () { st.tab = t; Sound.tap(); rebuild('setup'); }
        }));
      });
      main.appendChild(tabs);

      var pane = el('div', { class: 'bs__pane' });
      function field(label, node, note) {
        return el('div', { class: 'bsf' }, [
          el('label', { class: 'bsf__l', text: label }),
          node,
          note ? el('span', { class: 'bsf__n', text: note }) : null
        ]);
      }
      function txt(val, onch, ph) {
        var i = el('input', { class: 'bsf__i mono', type: 'text', value: val, placeholder: ph || '' });
        i.oninput = function () { onch(i.value); check(); };
        return i;
      }
      function sel(val, list, onch) {
        var s2 = el('select', { class: 'bsf__i' });
        list.forEach(function (o) { s2.appendChild(el('option', { value: o, text: o, selected: o === val })); });
        s2.onchange = function () { onch(s2.value); Sound.tap(); check(); rebuild('setup'); };
        return s2;
      }

      if (st.tab === 'setup') {
        pane.appendChild(field('Name', txt(st.name, function (v) { st.name = v; st.saved = false; }), 'Give every switcher on site a name you can recognise at a glance.'));
        pane.appendChild(el('div', { class: 'bsf__l', text: 'Configure Address' }));
        pane.appendChild(el('div', { class: 'bsradio' }, [
          el('button', { class: 'bsr' + (st.dhcp ? ' is-on' : ''), text: 'Using DHCP', onclick: function () { st.dhcp = true; st.saved = false; Sound.tap(); check(); rebuild('setup'); } }),
          el('button', { class: 'bsr' + (!st.dhcp ? ' is-on' : ''), text: 'Using Static IP', onclick: function () { st.dhcp = false; st.saved = false; Sound.tap(); check(); rebuild('setup'); } })
        ]));
        if (!st.dhcp) {
          pane.appendChild(field('IP Address', txt(st.ip, function (v) { st.ip = v; st.saved = false; }, '192.168.10.240')));
          pane.appendChild(field('Subnet Mask', txt(st.mask, function (v) { st.mask = v; st.saved = false; }, '255.255.255.0')));
          pane.appendChild(field('Gateway', txt(st.gw, function (v) { st.gw = v; st.saved = false; }, '192.168.10.1'), 'Required if the switcher is going to stream to the internet.'));
        } else {
          pane.appendChild(el('p', { class: 'phint', text: 'On DHCP the address can change between power cycles. For a permanent install, use a static address outside the DHCP pool.' }));
        }
      } else if (st.tab === 'configure') {
        pane.appendChild(field('Video Standard',
          sel(st.standard, ['720p50', '720p59.94', '1080i50', '1080i59.94', '1080p25', '1080p29.97', '1080p50', '1080p59.94', '1080p60'], function (v) { st.standard = v; st.saved = false; }),
          'Every source must match this exactly. Changing it drops all inputs and stops any recording or stream.'));
        pane.appendChild(field('Multiview Layout',
          sel(st.mv, ['4 up', '7 up', '10 up', '13 up', '16 up'], function (v) { st.mv = v; st.saved = false; }),
          'Ten tiles covers eight inputs plus program and preview.'));
        pane.appendChild(field('Talkback', sel('SDI + Headset', ['SDI + Headset', 'Headset only', 'Off'], function () {})));
      } else if (st.tab === 'audio') {
        pane.appendChild(field('XLR Input 1', sel('Mic', ['Mic', 'Line'], function () {})));
        pane.appendChild(field('XLR Input 2', sel('Line', ['Mic', 'Line'], function () {})));
        pane.appendChild(el('p', { class: 'phint', text: 'Mic level applies preamp gain for a microphone. Line is for a mixer or player output.' }));
      } else {
        pane.appendChild(field('Streaming Platform', sel('YouTube', ['YouTube', 'Twitch', 'Facebook', 'Custom RTMP'], function () {})));
        pane.appendChild(el('p', { class: 'phint', text: 'Stream keys are normally entered in ATEM Software Control rather than here.' }));
      }
      main.appendChild(pane);

      main.appendChild(el('div', { class: 'bs__foot' }, [
        el('span', { class: 'mono', style: { fontSize: '10px', color: 'var(--ink-4)' }, text: st.saved ? 'Settings saved to switcher' : 'Unsaved changes' }),
        el('button', { class: 'w32btn', text: 'Cancel', onclick: function () { Sound.tap(); } }),
        el('button', {
          class: 'w32btn w32btn--p', text: 'Save',
          onclick: function () {
            st.saved = true; Sound.good();
            w.UI.toast('Settings written to the switcher. It will re-negotiate every input.', 'ok', 3200);
            check(); rebuild('setup');
          }
        })
      ]));

      body.appendChild(el('div', { class: 'bs' }, [side, main]));
    }

    /* ---------------- desktop icons + taskbar ---------------- */
    function renderIcons() {
      clear(iconLayer);
      var items = [{ id: 'explorer', label: 'File Explorer', ic: 'FE', open: function () { makeWindow('explorer', 'File Explorer', 'FE', buildExplorer, { x: 40, y: 30, wd: 640, ht: 420 }); } }];
      if (c.installed) {
        items.push({ id: 'atem', label: 'ATEM Software Control', ic: 'AS', open: openATEM });
        items.push({ id: 'setup', label: 'ATEM Setup', ic: 'BS', open: openSetup });
      }
      items.push({ id: 'bin', label: 'Recycle Bin', ic: 'RB', open: function () { w.UI.toast('Nothing in here. Good.', 'info'); } });
      /* one click opens - double-clicking is fussy inside a browser sim */
      items.forEach(function (it) {
        iconLayer.appendChild(el('button', { class: 'dicon', onclick: it.open }, [
          el('span', { class: 'dicon__ic', text: it.ic }),
          el('span', { class: 'dicon__l', text: it.label })
        ]));
      });
    }
    function renderTaskbar() {
      clear(taskbar);
      taskbar.appendChild(el('button', { class: 'tbstart', text: '\u229e', onclick: function () { w.UI.toast('Start menu is out of scope - use the desktop icons.', 'info'); } }));
      var pins = [{ id: 'explorer', ic: 'FE', label: 'File Explorer', open: function () { makeWindow('explorer', 'File Explorer', 'FE', buildExplorer, { x: 40, y: 30, wd: 640, ht: 420 }); } }];
      if (c.installed) {
        pins.push({ id: 'atem', ic: 'AS', label: 'ATEM Software Control', open: openATEM });
        pins.push({ id: 'setup', ic: 'BS', label: 'ATEM Setup', open: openSetup });
      }
      pins.forEach(function (p) {
        taskbar.appendChild(el('button', {
          class: 'tbapp' + (c.opened[p.id] ? ' is-open' : ''), title: p.label, text: p.ic,
          onclick: function () { if (wins[p.id]) { wins[p.id].node.classList.remove('is-min'); focusWin(p.id); } else p.open(); }
        }));
      });
      taskbar.appendChild(el('div', { class: 'grow' }));
      var now = new Date();
      taskbar.appendChild(el('div', { class: 'tbclock mono' }, [
        el('div', { text: now.getHours() + ':' + ('0' + now.getMinutes()).slice(-2) }),
        el('div', { text: now.toLocaleDateString() })
      ]));
    }

    /* ---------------- tasks ---------------- */
    function renderTasks() {
      clear(taskPanel);
      taskPanel.appendChild(el('div', { class: 'simside__t', text: 'Tasks - ' + mission.title }));
      var list = el('div', { class: 'tasks' });
      mission.tasks.forEach(function (t) {
        var d = !!doneT[t.id];
        list.appendChild(el('div', { class: 'task' + (d ? ' is-done' : '') }, [
          el('i', { class: 'task__box', text: '\u2713' }),
          el('div', { class: 'grow' }, [el('span', { text: t.label }), !d ? el('span', { class: 'task__hint', text: t.hint }) : null])
        ]));
      });
      taskPanel.appendChild(list);
      var n = mission.tasks.filter(function (t) { return doneT[t.id]; }).length;
      taskPanel.appendChild(el('div', { class: 'simprog' }, [
        el('div', { class: 'simprog__bar' }, [el('i', { style: { width: (n / mission.tasks.length * 100) + '%' } })]),
        el('span', { class: 'mono', text: n + '/' + mission.tasks.length })
      ]));
    }
    function check() {
      var newly = [];
      mission.tasks.forEach(function (t) {
        if (doneT[t.id]) return;
        var ok = false; try { ok = !!t.check(c); } catch (e) {}
        if (ok) { doneT[t.id] = true; newly.push(t); }
      });
      newly.forEach(function (t) { Sound.good(); w.UI.toast('<b>Task complete</b> &nbsp;' + w.UI.esc(t.label), 'ok', 2200); });
      renderTasks();
      if (!finished && mission.tasks.every(function (t) { return doneT[t.id]; })) {
        finished = true;
        setTimeout(function () {
          w.UI.toast('<b>Simulation passed.</b>', 'brand', 3600);
          if (opts.onComplete) opts.onComplete();
        }, 380);
      }
    }

    renderIcons(); renderTaskbar(); renderTasks();
    return { destroy: function () { clear(host); } };
  }

  w.SimWindows = { mount: mount, MISSIONS: MISSIONS, FS: FS };
})(window);
