/* ============================================================
   magicianed - curriculum
   Every module is a list of steps. A step is one of:
     prose | video | quiz | sim
   ============================================================ */
(function (w) {
  'use strict';

  /* ---------- video library ---------- */
  var VIDEO = {
    primary: {
      id: 'dRXl_okXCf8',
      title: 'Walkthrough & Set Up - Blackmagic ATEM Television Studio HD8 ISO',
      note: 'The full hands-on tour: unboxing, rear panel, wiring, first power-up and software control.',
      /* Checkpoints are placed as a fraction of the real runtime, read from the
         YouTube player at load, so they always land inside the video. */
      checkpoints: [
        {
          at: 0.10,
          topic: 'Inputs & the front panel',
          q: 'The HD8 you are watching being set up takes its camera feeds over which connector type?',
          opts: [
            '8 x SDI inputs on BNC connectors',
            '8 x HDMI inputs',
            '4 x SDI and 4 x HDMI inputs',
            'Ethernet only - all cameras are IP'
          ],
          a: 0,
          why: 'The Television Studio HD8 is an all-SDI switcher: eight SDI inputs on BNC. HDMI on this model is an output only (multiview / program monitoring). That is the big difference from an ATEM Mini, which is HDMI in.'
        },
        {
          at: 0.26,
          topic: 'Program vs Preview',
          q: 'On the crosspoint rows, what does the RED row control?',
          opts: [
            'The source that is live on air right now',
            'The source queued up to go next',
            'The multiview layout',
            'The recording source'
          ],
          a: 0,
          why: 'Red = Program = on air. Green = Preview = the source you are lining up next. You cut or auto-transition to swap them. That colour language is identical on the panel, in the software and on the multiview borders.'
        },
        {
          at: 0.44,
          topic: 'Video standard',
          q: 'What happens to a camera that is not set to the same video standard as the switcher?',
          opts: [
            'It will not appear - the input shows no valid signal',
            'It is automatically converted to match',
            'It appears but only in the multiview',
            'The switcher changes its own standard to match'
          ],
          a: 0,
          why: 'An ATEM has one video standard for the whole system. Every source must match it exactly - 1080p50 is not the same as 1080i50. There is no per-input conversion on the HD8, so a mismatched camera simply reads as no signal.'
        },
        {
          at: 0.62,
          topic: 'Control & networking',
          q: 'How does ATEM Software Control on your computer normally reach the switcher?',
          opts: [
            'Over ethernet, by the switcher IP address (USB-C also works as a direct link)',
            'Over HDMI',
            'Over the RS-422 remote port',
            'Only over Wi-Fi'
          ],
          a: 0,
          why: 'Ethernet is the main control path - the HD8 has a built-in 4-port network switch. USB-C gives you a direct point-to-point connection to one computer, handy in the field or for a firmware update.'
        },
        {
          at: 0.80,
          topic: 'Recording & ISO',
          q: 'On an HD8 ISO, what does the ISO recording actually give you?',
          opts: [
            'Every input recorded as its own file, plus a DaVinci Resolve project of your switching',
            'Only a higher-bitrate program file',
            'A backup copy of the program on a second disk',
            'Isolated audio only - video is program-only'
          ],
          a: 0,
          why: 'ISO records all eight inputs as separate H.264 files, the audio inputs as separate WAV files, and writes a DaVinci Resolve .drp project that rebuilds your live cut on a timeline. That is the whole reason to buy the ISO model.'
        },
        {
          at: 0.94,
          topic: 'Putting it together',
          q: 'Before you go live, which of these is the correct order of operations?',
          opts: [
            'Set video standard, confirm inputs, set audio, set stream key, then record + stream',
            'Set the stream key, then plug in cameras, then choose a video standard',
            'Start recording first, then set the video standard',
            'Order does not matter on an ATEM'
          ],
          a: 0,
          why: 'Video standard first - changing it later drops every input and stops recording. Then verify inputs, then audio, then the stream destination. Recording and streaming are the last thing you arm.'
        }
      ]
    },
    extras: [
      { id: 'w4ixzY2zM0w', title: 'ATEM Television Studio HD8 ISO - Full Review & Walkthrough', note: 'Long-form review; good second pass on the panel and workflow.' },
      { id: 'jet9ZJpZc-Q', title: 'ATEM Television Studio HD8 ISO & 4K8 Overview', note: 'Blackmagic overview of the range and what each model adds.' },
      { id: 'xGk4PDTCgUs', title: 'Streaming sources on the ATEM Television Studio HD8 ISO', note: 'Deep dive on RTMP streaming sources and remote cameras.' },
      { id: 'xfKOKfsTCkU', title: 'ATEM Television Studio HD8 and HD8 ISO - Overview', note: 'Features rundown with real-world thoughts.' }
    ]
  };

  /* ---------- helper to keep the content readable ---------- */
  function P(html) { return { type: 'prose', html: html }; }

  var MODULES = [

  /* ==========================================================
     01
     ========================================================== */
  {
    id: 'm01', n: '01', accent: 'brand',
    title: 'What a Switcher Actually Does',
    blurb: 'Program, preview, mix effects, and where the Television Studio HD8 sits in the ATEM family.',
    tags: ['Read', 'Video', 'Quiz'],
    steps: [
      { type: 'prose', title: 'The one idea everything else hangs off', html: [
        '<p>A vision switcher has exactly one job: <strong>choose which picture leaves the building</strong>, and make the change between pictures look deliberate. Everything else on the ATEM Television Studio HD8 - keyers, audio, streaming, ISO recording - is decoration on top of that one job.</p>',
        '<p>The whole machine is organised around two buses:</p>',
        '<ul>',
        '<li><strong>Program</strong> (red) - what is on air <em>right now</em>. Touch a red button and that source is live instantly. There is no undo.</li>',
        '<li><strong>Preview</strong> (green) - what is <em>next</em>. Nothing you do here reaches the audience. This is your workbench.</li>',
        '</ul>',
        '<p>You spend a show doing the same loop: line something up on preview, check it, then move it to program with a <code>CUT</code> or an <code>AUTO</code>. When you do, the two buses swap - the old program becomes preview. That swap is the heartbeat of live television.</p>',
        '<div class="callout callout--pro"><i class="callout__bar"></i><div><b>Muscle memory to build now</b>Never select on program during a show. Select on preview, look at it, then cut. Directors who punch program directly eventually punch the wrong thing on air.</div></div>',
        '<h3>Mix Effects (M/E)</h3>',
        '<p>The pair of buses plus its transition and keying hardware is called a <strong>Mix Effects</strong> block, or M/E. The Television Studio HD8 has one M/E, which is plenty - it feeds four upstream keyers, two downstream keyers and two DVEs into a single program output.</p>',
        '<h3>The signal path, front to back</h3>',
        '<p>Signal flows in one direction and it is worth memorising, because every problem you will ever debug is "where in this chain did it break?"</p>',
        '<table class="spectable"><thead><tr><th>Stage</th><th>What happens</th></tr></thead><tbody>',
        '<tr><td>Inputs 1-8</td><td>SDI arrives, is checked against the switcher video standard, embedded audio is split off to the mixer</td></tr>',
        '<tr><td>Background</td><td>Program / preview bus selection - the base layer</td></tr>',
        '<tr><td>Upstream Keys 1-4</td><td>Chroma, luma or pattern keys composited on top of the background; can be tied to the transition</td></tr>',
        '<tr><td>Transition</td><td>Mix, dip, wipe, stinger or DVE moves preview to program</td></tr>',
        '<tr><td>Downstream Keys 1-2</td><td>Lower thirds and bugs, layered after the transition so they survive a cut</td></tr>',
        '<tr><td>Fade to black</td><td>The last thing before output - kills picture and audio together</td></tr>',
        '<tr><td>Program out</td><td>SDI program, aux outputs, multiview, streaming encoder, recorder</td></tr>',
        '</tbody></table>',
        '<p>Note where the downstream keyers sit: <strong>after</strong> the transition. That is why a lower third stays on screen while you cut between cameras underneath it, and why an upstream key travels with the transition instead.</p>'
      ].join('') },

      { type: 'prose', title: 'HD8 vs HD8 ISO vs the rest of the family', html: [
        '<p>Blackmagic sells several things called ATEM and they are not interchangeable. Know exactly which box is in your rack.</p>',
        '<table class="spectable"><thead><tr><th>Model</th><th>Inputs</th><th>Defining feature</th></tr></thead><tbody>',
        '<tr><td>ATEM Mini / Pro</td><td>4 x HDMI</td><td>Desktop, HDMI, USB webcam out</td></tr>',
        '<tr><td>ATEM SDI series</td><td>4 x SDI</td><td>Desktop, SDI, tally over SDI</td></tr>',
        '<tr><td><strong>Television Studio HD8</strong></td><td>8 x SDI</td><td>1RU rack, built-in hardware panel, streaming, program recording</td></tr>',
        '<tr><td><strong>Television Studio HD8 ISO</strong></td><td>8 x SDI</td><td>Everything above <strong>plus</strong> isolated recording of all 8 inputs and a DaVinci Resolve project file</td></tr>',
        '<tr><td>Television Studio 4K8</td><td>8 x 12G-SDI</td><td>Ultra HD version of the same design</td></tr>',
        '</tbody></table>',
        '<h3>What the HD8 gives you</h3>',
        '<ul>',
        '<li><strong>8 SDI inputs</strong>, auto-detecting 1.5G and 3G-SDI, level A or B. HD only - the connectors are 12G-rated but the processing is HD.</li>',
        '<li><strong>A real control panel built into the chassis</strong> - crosspoints with tri-colour LEDs, a fader bar (T-bar), a 3-axis joystick, a numeric keypad, macro buttons and an LCD. No external panel required.</li>',
        '<li><strong>58-channel audio mixer</strong> with 6-band parametric EQ and full dynamics (expander, gate, compressor, limiter) on every channel.</li>',
        '<li><strong>4 upstream keyers, 2 downstream keyers, 4 advanced chroma keyers, 2 DVEs, 1 SuperSource.</strong></li>',
        '<li><strong>Built-in RTMP streaming</strong> straight to YouTube, Twitch or Facebook without a computer.</li>',
        '<li><strong>Direct recording to a USB-C disk</strong> or optional internal M.2 flash.</li>',
        '<li><strong>Talkback</strong> over SDI to Blackmagic cameras, with a 5-pin XLR headset connection and mix-minus.</li>',
        '<li><strong>4-port ethernet switch</strong> built in, so panel, computer and network all land on the one box.</li>',
        '</ul>',
        '<div class="callout callout--gotcha"><i class="callout__bar"></i><div><b>The HD in HD8 is literal</b>Supported standards top out at 1080p60. If someone hands you a 4K camera, it has to be set to an HD output or the input will read as invalid.</div></div>',
        '<h3>Why the ISO model matters</h3>',
        '<p>A plain HD8 records your program - one file, one cut, done. An <strong>HD8 ISO</strong> simultaneously records:</p>',
        '<ul>',
        '<li>All 8 SDI inputs as separate H.264 .mp4 files at up to 70 Mb/s</li>',
        '<li>Audio inputs as separate 24-bit 48 kHz .wav files</li>',
        '<li>The program mix as its own .mp4</li>',
        '<li>A <strong>DaVinci Resolve .drp project</strong> that rebuilds every cut you made, on a timeline, with all the ISO files linked</li>',
        '<li>A media folder with every still and clip you used</li>',
        '</ul>',
        '<p>That last item is the magic trick. You finish the show, open the .drp in Resolve, and you are looking at your live cut as an editable multicam timeline. You can fix the shot you punched too early. That is the whole pitch.</p>'
      ].join('') },

      { type: 'video', title: 'Watch: full walkthrough and set up', video: 'primary',
        intro: 'Watch the whole walkthrough. The video pauses at six checkpoints and asks you about the segment you just saw - answer correctly to carry on, or rewatch the segment as many times as you like.' },

      { type: 'quiz', title: 'Checkpoint quiz', bank: 'm01', pass: 0.8 }
    ]
  },

  /* ==========================================================
     02
     ========================================================== */
  {
    id: 'm02', n: '02', accent: 'info',
    title: 'Rack, Power & The Rear Panel',
    blurb: 'Every connector on the back of the unit, what it is for, and how to power it safely.',
    tags: ['Read', 'Explore', 'Quiz'],
    steps: [
      { type: 'prose', title: 'Racking and powering the unit', html: [
        '<p>The Television Studio HD8 is a <strong>1RU rackmount</strong> unit with the control panel on the front face. It ships with rack ears fitted. Two rules before you touch a cable:</p>',
        '<ol>',
        '<li><strong>Give it air.</strong> It is fan-cooled front to back. Do not sandwich it between two blank panels in a sealed case.</li>',
        '<li><strong>Power it before you power the cameras</strong>, so the switcher has already settled on its video standard when sources start arriving.</li>',
        '</ol>',
        '<h3>Two ways to power it</h3>',
        '<ul>',
        '<li><strong>IEC mains</strong> - the standard kettle lead into the AC input on the rear.</li>',
        '<li><strong>12V DC input</strong> - for a battery or a DC distribution rail in a truck.</li>',
        '</ul>',
        '<p>Connect both and you have <strong>redundancy</strong>. If mains drops, the unit keeps running on DC without a reboot. On any show that matters, wire both.</p>',
        '<div class="callout callout--warn"><i class="callout__bar"></i><div><b>There is no power switch</b>Like most Blackmagic gear, the HD8 boots the moment it has power. Your on/off switch is the mains distro or the rack PDU - plan for that when you are labelling breakers.</div></div>',
        '<h3>Grounding and SDI</h3>',
        '<p>SDI is 75-ohm coax. Use proper 75-ohm BNC cable, not 50-ohm RF patch leads that happen to fit. A mismatched cable will often <em>almost</em> work - which is worse than not working, because it fails in the middle of the show when the cable warms up.</p>'
      ].join('') },

      { type: 'sim', sim: 'rear', title: 'Explore the rear panel',
        intro: 'Click any connector to learn what it does. Find all of them to complete the step - the counter tracks how many groups you have identified.' },

      { type: 'prose', title: 'Reading the connector list', html: [
        '<p>Here is the full rear panel inventory. You are not expected to memorise the count of every port, but you should never have to guess which one a cable goes into.</p>',
        '<table class="spectable"><thead><tr><th>Connector</th><th>Count</th><th>Purpose</th></tr></thead><tbody>',
        '<tr><td>SDI In 1-8</td><td>8</td><td>Camera and playback sources. Auto-detects 1.5G / 3G-SDI level A or B, with 4 channels of embedded audio each.</td></tr>',
        '<tr><td>SDI Out 1-8</td><td>8</td><td>Return feeds to each camera - carries program, tally and camera control back down the same coax.</td></tr>',
        '<tr><td>SDI Program Out</td><td>1</td><td>The clean program feed for a recorder, a projector or house distribution.</td></tr>',
        '<tr><td>SDI Aux Out</td><td>2</td><td>Independently routable outputs - stage screens, a clean feed, a private monitor.</td></tr>',
        '<tr><td>Multiview Out</td><td>1 SDI + 1 HDMI</td><td>All inputs plus program and preview on one screen. Configurable 4, 7, 10, 13 or 16 up.</td></tr>',
        '<tr><td>XLR Analog In</td><td>2</td><td>Balanced mic or line - hosts, a mix desk feed. Phantom-capable.</td></tr>',
        '<tr><td>RCA Analog In</td><td>2 (stereo)</td><td>Consumer stereo - a laptop, a music player.</td></tr>',
        '<tr><td>1/4 inch Jack Out</td><td>4</td><td>Balanced analog outputs for monitoring or a PA feed.</td></tr>',
        '<tr><td>MADI In / Out</td><td>1 BNC each</td><td>32 channels in, 64 out - for a full audio console tie-in.</td></tr>',
        '<tr><td>Talkback</td><td>1 x 5-pin XLR + RJ45</td><td>Broadcast headset, and party-line to camera operators over SDI.</td></tr>',
        '<tr><td>Ethernet</td><td>4 x RJ45</td><td>A built-in gigabit switch: computer, network, remote panel, internet for streaming.</td></tr>',
        '<tr><td>USB-C</td><td>2</td><td>Record to an external disk, webcam output, software control, firmware updates.</td></tr>',
        '<tr><td>Reference In / Out</td><td>1 BNC each</td><td>Tri-level sync or black burst to lock the facility together.</td></tr>',
        '<tr><td>Timecode In / Out</td><td>1 BNC each</td><td>External timecode so ISO files line up with everything else on site.</td></tr>',
        '<tr><td>Remote</td><td>1 RJ12</td><td>RS-422 for external automation and control systems.</td></tr>',
        '<tr><td>Power</td><td>IEC + 12V DC</td><td>Mains and DC, redundant when both are connected.</td></tr>',
        '</tbody></table>',
        '<div class="callout"><i class="callout__bar"></i><div><b>The one to remember</b>SDI Out 1-8 are <em>return feeds</em>, one per camera. Wire them and each operator sees program in their viewfinder, gets a tally light, and can be colour-matched from the switcher. Skip them and you have thrown away half of what you paid for.</div></div>'
      ].join('') },

      { type: 'quiz', title: 'Checkpoint quiz', bank: 'm02', pass: 0.8 }
    ]
  },

  /* ==========================================================
     03
     ========================================================== */
  {
    id: 'm03', n: '03', accent: 'key',
    title: 'Wiring The Studio',
    blurb: 'Hands-on cable drills: cameras, returns, audio, network, power and the computer.',
    tags: ['Read', 'Minigame', 'Quiz'],
    steps: [
      { type: 'prose', title: 'How a three-camera studio is actually wired', html: [
        '<p>Signal wiring on an ATEM is a loop, not a line. Picture leaves the camera, arrives at the switcher, and something comes <em>back</em> down a second cable to the camera.</p>',
        '<h3>Per camera, two coax runs</h3>',
        '<ul>',
        '<li><strong>Camera SDI Out &rarr; Switcher SDI In n</strong> - the picture.</li>',
        '<li><strong>Switcher SDI Out n &rarr; Camera SDI In (return)</strong> - program return, tally and camera control travelling back on the same cable.</li>',
        '</ul>',
        '<p>Keep the numbers matched. Camera 1 into In 1, Out 1 back to camera 1. The moment you cross them, tally lights up the wrong operator and camera control adjusts the wrong iris.</p>',
        '<h3>Everything else</h3>',
        '<table class="spectable"><thead><tr><th>What</th><th>From</th><th>To</th></tr></thead><tbody>',
        '<tr><td>Multiview monitor</td><td>Multiview Out (HDMI or SDI)</td><td>Your operator display</td></tr>',
        '<tr><td>Program recorder / projector</td><td>SDI Program Out</td><td>The device</td></tr>',
        '<tr><td>Stage screen with its own feed</td><td>SDI Aux Out 1</td><td>The screen</td></tr>',
        '<tr><td>Host microphone</td><td>Mic XLR</td><td>XLR Analog In 1</td></tr>',
        '<tr><td>Laptop playback audio</td><td>3.5mm / RCA</td><td>RCA Analog In</td></tr>',
        '<tr><td>Control computer</td><td>Ethernet</td><td>Any of the 4 RJ45 ports</td></tr>',
        '<tr><td>Internet for streaming</td><td>House network</td><td>Another RJ45 port</td></tr>',
        '<tr><td>Recording disk</td><td>USB-C</td><td>USB-C port</td></tr>',
        '<tr><td>Talkback headset</td><td>Headset</td><td>5-pin XLR</td></tr>',
        '<tr><td>Power</td><td>Mains + DC</td><td>IEC and 12V DC</td></tr>',
        '</tbody></table>',
        '<div class="callout callout--pro"><i class="callout__bar"></i><div><b>Label both ends</b>Every cable, both ends, before the show. When something dies live you have seconds, not minutes, and "which of these eight identical black coax runs is camera 3" is not a question you want to be asking on air.</div></div>'
      ].join('') },

      { type: 'sim', sim: 'wiring', title: 'Cable drill: wire the studio', level: 1,
        intro: 'Drag each cable end from the device on the left onto the correct rear panel port. Wrong connections buzz and reset. Complete all patches to pass.' },

      { type: 'sim', sim: 'wiring', title: 'Cable drill: full facility', level: 2,
        intro: 'Harder run. Three cameras with returns, audio, network, recording, talkback and redundant power. Beat this and your patching is solid.' },

      { type: 'quiz', title: 'Checkpoint quiz', bank: 'm03', pass: 0.8 }
    ]
  },

  /* ==========================================================
     04
     ========================================================== */
  {
    id: 'm04', n: '04', accent: 'audio',
    title: 'First Boot: Video Standard & Network',
    blurb: 'ATEM Setup, choosing a video standard, IP addressing and the multiview layout.',
    tags: ['Read', 'Simulation', 'Quiz'],
    steps: [
      { type: 'prose', title: 'The first two decisions', html: [
        '<p>Fresh out of the box, two settings matter before anything else: the <strong>video standard</strong> and the <strong>network address</strong>. Get these right and the rest of the setup is easy. Get them wrong and nothing works and nothing tells you why.</p>',
        '<h3>Video standard</h3>',
        '<p>An ATEM runs one standard for the entire system. Every source must match it exactly, including frame rate and scan type.</p>',
        '<table class="spectable"><thead><tr><th>Family</th><th>Standards</th></tr></thead><tbody>',
        '<tr><td>720p</td><td>720p50, 720p59.94, 720p60</td></tr>',
        '<tr><td>1080i</td><td>1080i50, 1080i59.94, 1080i60</td></tr>',
        '<tr><td>1080p</td><td>1080p23.98, 24, 25, 29.97, 30, 50, 59.94, 60</td></tr>',
        '</tbody></table>',
        '<p>Pick by region and by delivery:</p>',
        '<ul>',
        '<li><strong>Europe / Australia / most of Asia</strong> - 50 Hz family. <code>1080p50</code> is the modern default.</li>',
        '<li><strong>North America / Japan</strong> - 59.94 Hz family. <code>1080p59.94</code>. Note it is 59.94, not 60 - broadcast infrastructure runs on the .94.</li>',
        '<li><strong>Legacy broadcast plant</strong> - you may be forced into <code>1080i50</code> or <code>1080i59.94</code>.</li>',
        '</ul>',
        '<div class="callout callout--gotcha"><i class="callout__bar"></i><div><b>Changing the standard is destructive</b>Every input renegotiates, the multiview blanks, and any recording or stream in progress stops. Set it once, at the top of the day, before anyone is depending on the box.</div></div>',
        '<h3>Network</h3>',
        '<p>The HD8 ships on DHCP. For a permanent install, give it a <strong>static IP</strong> so ATEM Software Control always finds it at the same address.</p>',
        '<ul>',
        '<li><strong>IP address</strong> - e.g. <code>192.168.10.240</code>, outside your DHCP pool so nothing else grabs it</li>',
        '<li><strong>Subnet mask</strong> - normally <code>255.255.255.0</code></li>',
        '<li><strong>Gateway</strong> - your router, e.g. <code>192.168.10.1</code>. Required if you are streaming to the internet.</li>',
        '</ul>',
        '<p>The switcher name matters too. On a site with three ATEMs, <code>Studio A HD8</code> beats <code>ATEM Television Studio HD8</code> three times over.</p>',
        '<h3>Multiview</h3>',
        '<p>The multiview is your window on the show. Choose a layout with enough tiles for your inputs - 10-up covers eight cameras plus program and preview neatly. Red border = on air. Green border = preview.</p>'
      ].join('') },

      { type: 'sim', sim: 'setup', title: 'Simulation: ATEM Setup utility',
        intro: 'A working recreation of Blackmagic ATEM Setup. Complete the tasks in the panel on the right to configure the switcher for a European 1080p50 studio on a static address.' },

      { type: 'quiz', title: 'Checkpoint quiz', bank: 'm04', pass: 0.8 }
    ]
  },

  /* ==========================================================
     05
     ========================================================== */
  {
    id: 'm05', n: '05', accent: 'info',
    title: 'Windows Setup & Software Control',
    blurb: 'Installing the desktop software, connecting to the switcher, and the anatomy of ATEM Software Control.',
    tags: ['Read', 'Windows sim', 'Quiz'],
    steps: [
      { type: 'prose', title: 'Getting the software onto your machine', html: [
        '<p>Blackmagic ships one installer that contains everything. On Windows you download <strong>Blackmagic ATEM Switchers</strong> from the Blackmagic Design support site, and it installs:</p>',
        '<ul>',
        '<li><strong>ATEM Software Control</strong> - the main control surface: switching, keying, media, audio, camera control, streaming.</li>',
        '<li><strong>ATEM Setup</strong> - the low-level utility: name, IP address, video standard, firmware updates.</li>',
        '<li><strong>Blackmagic ATEM Streaming Bridge</strong> and supporting components.</li>',
        '</ul>',
        '<div class="callout callout--warn"><i class="callout__bar"></i><div><b>Version match is not optional</b>The software version and the switcher firmware must match. If Software Control refuses to connect, the usual cause is a firmware mismatch - open ATEM Setup and let it push the update.</div></div>',
        '<h3>Connecting</h3>',
        '<ol>',
        '<li>Patch your computer into one of the four RJ45 ports, or straight into USB-C.</li>',
        '<li>Put the computer on the same subnet as the switcher - if the HD8 is <code>192.168.10.240 / 255.255.255.0</code>, your machine needs to be <code>192.168.10.x</code>.</li>',
        '<li>Launch ATEM Software Control. It scans and shows the switchers it can see.</li>',
        '<li>Pick yours. The window fills in with live state read from the hardware.</li>',
        '</ol>',
        '<h3>The anatomy of ATEM Software Control</h3>',
        '<p>Four tabs across the top, and they are the same four on every ATEM:</p>',
        '<table class="spectable"><thead><tr><th>Tab</th><th>What lives there</th></tr></thead><tbody>',
        '<tr><td>Switcher</td><td>Program / preview buses, transition control, keyers, and the palette column down the right side</td></tr>',
        '<tr><td>Media</td><td>File browser plus the media pool - 20 stills and 2 clips, loaded into 2 media players</td></tr>',
        '<tr><td>Audio</td><td>The Fairlight mixer - a channel strip per source with EQ, dynamics and faders</td></tr>',
        '<tr><td>Camera</td><td>Camera control - iris, focus, gain, shutter, white balance and colour wheels per camera, sent over SDI</td></tr>',
        '</tbody></table>',
        '<p>The palette column on the Switcher tab is where the depth lives: Media Players, Colour Generators, Transitions, Upstream Key 1-4, Downstream Key 1-2, SuperSource, Fade to Black, Macros, Aux outputs, Streaming, Recording and Timecode. Palettes collapse - keep the ones you use open and fold the rest away.</p>',
        '<div class="callout callout--pro"><i class="callout__bar"></i><div><b>The software is not the boss</b>The switcher holds the state, not your laptop. Close Software Control mid-show and the switcher keeps switching. Two operators can be connected at once and both see the same live state - useful, and dangerous if nobody agreed who is driving.</div></div>'
      ].join('') },

      { type: 'sim', sim: 'windows-install', title: 'Simulation: install and connect on Windows',
        intro: 'A recreation of the Windows desktop. Work through the tasks: find the installer in File Explorer, run it, launch ATEM Software Control and connect to the switcher.' },

      { type: 'quiz', title: 'Checkpoint quiz', bank: 'm05', pass: 0.8 }
    ]
  },

  /* ==========================================================
     06
     ========================================================== */
  {
    id: 'm06', n: '06', accent: 'pgm',
    title: 'Switching Live',
    blurb: 'Program, preview, cut, auto and the fader bar - in a working recreation of the software.',
    tags: ['Read', 'ATEM sim', 'Quiz'],
    steps: [
      { type: 'prose', title: 'Cut, auto, and the fader bar', html: [
        '<p>Three ways to move preview onto program. They are not interchangeable and choosing correctly is most of what makes a cut look professional.</p>',
        '<h3>CUT</h3>',
        '<p>Instant. Zero frames. Use it for anything conversational - interviews, panels, sport, anything where the audience should not notice the edit. Cutting is the default in live television; a mix is the exception.</p>',
        '<h3>AUTO</h3>',
        '<p>Performs the selected transition over the set rate - typically 25 frames (one second at 25p). Use it for scene changes, coming out of graphics, and moments that should feel soft. The rate lives in the Transitions palette and applies to whichever transition style is armed.</p>',
        '<h3>Fader bar (T-bar)</h3>',
        '<p>Manual. You drive the transition with your hand, at whatever speed you like, and you can stop halfway and hold. Two things worth knowing:</p>',
        '<ul>',
        '<li>The bar is <strong>bi-directional</strong>. It does not spring back. Push it down for one transition, then push it up for the next.</li>',
        '<li>Any transition left part-complete means both sources are on air at once. If you walk away from a half-open bar you are broadcasting a dissolve permanently.</li>',
        '</ul>',
        '<h3>Next Transition</h3>',
        '<p>The <code>BKGD</code>, <code>KEY 1-4</code> buttons decide <em>what</em> the transition affects. <code>BKGD</code> alone swaps the background. Arm <code>KEY 1</code> as well and the keyer transitions in or out at the same time - that is how you bring a graphic on with a wipe rather than snapping it on.</p>',
        '<h3>Fade to black</h3>',
        '<p><code>FTB</code> fades video and audio to nothing together, and holds. It is the emergency brake and the end of the show. Hit it again to come back up.</p>',
        '<div class="callout callout--gotcha"><i class="callout__bar"></i><div><b>Preview is a promise, not a guarantee</b>Preview shows the background and upstream keys, but downstream keyers are applied after - so a DSK already on air will not appear on your preview. If a lower third is live, remember it is sitting on top of whatever you cut to.</div></div>'
      ].join('') },

      { type: 'sim', sim: 'atem', mission: 'switching', title: 'Simulation: your first live cut',
        intro: 'This is a working recreation of ATEM Software Control. Complete each task on the right - the simulation checks your actual switcher state, not just clicks.' },

      { type: 'quiz', title: 'Checkpoint quiz', bank: 'm06', pass: 0.8 }
    ]
  },

  /* ==========================================================
     07
     ========================================================== */
  {
    id: 'm07', n: '07', accent: 'key',
    title: 'Transitions, Keyers & DVE',
    blurb: 'Mix, dip, wipe, stinger and DVE. Chroma keying a presenter. Downstream keys for lower thirds.',
    tags: ['Read', 'ATEM sim', 'Quiz'],
    steps: [
      { type: 'prose', title: 'The five transition styles', html: [
        '<table class="spectable"><thead><tr><th>Style</th><th>What it does</th><th>Use it for</th></tr></thead><tbody>',
        '<tr><td>MIX</td><td>Straight cross-dissolve between the two sources</td><td>Soft scene changes, montages, music</td></tr>',
        '<tr><td>DIP</td><td>Dissolves through a colour - usually white or black - then out to the new source</td><td>Time passing, a hard reset between segments</td></tr>',
        '<tr><td>WIPE</td><td>A geometric pattern sweeps one source over the other, with border and softness controls</td><td>Sport, entertainment, deliberately visible transitions</td></tr>',
        '<tr><td>STING</td><td>Plays a clip from the media pool as an animated wipe, using its alpha channel</td><td>Branded show opens and segment bumpers</td></tr>',
        '<tr><td>DVE</td><td>Digital video effect - squeeze, push or spin the picture off and the new one on</td><td>Slick, modern-looking changes</td></tr>',
        '</tbody></table>',
        '<h3>Upstream keyers</h3>',
        '<p>Four of them, sitting <strong>before</strong> the transition, each capable of:</p>',
        '<ul>',
        '<li><strong>Chroma key</strong> - remove a green or blue background. The HD8 has advanced chroma keying with a sampling rectangle rather than a hue slider.</li>',
        '<li><strong>Luma key</strong> - key on brightness. Good for white text on black.</li>',
        '<li><strong>Pattern key</strong> - key using a shape, for picture-in-picture and reveals.</li>',
        '<li><strong>DVE key</strong> - a scaled, positioned picture-in-picture box with an optional border and shadow.</li>',
        '</ul>',
        '<h3>Keying a presenter, in order</h3>',
        '<ol>',
        '<li>Light the green screen evenly. Nothing in software fixes bad lighting - this step is 80% of the result.</li>',
        '<li>Set <strong>Fill Source</strong> to the camera on the green screen.</li>',
        '<li>In the chroma key controls, draw the sample rectangle over a clean area of green, and click <strong>Sample</strong>.</li>',
        '<li>Adjust <strong>Foreground / Background</strong> to kill remaining green without eating the subject edges.</li>',
        '<li>Use <strong>Key Edge</strong> to tighten the fringe, and <strong>Spill</strong> to remove the green cast on skin and hair.</li>',
        '<li>Set the background - usually a media player still or a second camera - on the background bus.</li>',
        '<li>Turn the key <strong>On Air</strong>, or arm it in Next Transition so it comes in with the transition.</li>',
        '</ol>',
        '<h3>Downstream keyers</h3>',
        '<p>Two DSKs, applied <strong>after</strong> the transition, which is exactly what you want for lower thirds and logo bugs. Each has:</p>',
        '<ul>',
        '<li><strong>Fill</strong> and <strong>Key</strong> sources - typically a media player and its own alpha channel</li>',
        '<li><strong>TIE</strong> - links the DSK to the next transition so it fades in with the cut</li>',
        '<li><strong>ON AIR</strong> - punches it on or off immediately</li>',
        '<li><strong>AUTO</strong> - fades it on or off over the DSK rate</li>',
        '</ul>',
        '<div class="callout callout--pro"><i class="callout__bar"></i><div><b>Pre-multiplied key</b>Graphics exported from Photoshop, After Effects or Resolve with transparency are almost always pre-multiplied. Tick <strong>Pre Multiplied Key</strong> and the clip, gain and clip controls are handled for you. Untick it and you will spend ten minutes chasing a black halo that did not need to exist.</div></div>'
      ].join('') },

      { type: 'sim', sim: 'atem', mission: 'keying', title: 'Simulation: transitions and keys',
        intro: 'Back in the software. Set up a wipe, chroma key a presenter onto a background, and bring a lower third on with a downstream keyer.' },

      { type: 'quiz', title: 'Checkpoint quiz', bank: 'm07', pass: 0.8 }
    ]
  },

  /* ==========================================================
     08
     ========================================================== */
  {
    id: 'm08', n: '08', accent: 'brand',
    title: 'Media Pool & Importing Files',
    blurb: 'Getting graphics off your Windows drive and onto air, through File Explorer and the media pool.',
    tags: ['Read', 'Windows sim', 'Quiz'],
    steps: [
      { type: 'prose', title: 'How the media pool works', html: [
        '<p>The media pool is memory <strong>inside the switcher</strong>, not a folder on your computer. You upload files into it, and once they are there the switcher can play them with the laptop unplugged.</p>',
        '<table class="spectable"><thead><tr><th>Slot type</th><th>Capacity</th><th>Formats</th></tr></thead><tbody>',
        '<tr><td>Stills</td><td>20 slots</td><td>PNG, TGA, BMP, GIF, JPEG, TIFF</td></tr>',
        '<tr><td>Clips</td><td>2 slots, up to 1080p60</td><td>TGA sequences - 200 frames at 1080, 400 at 720</td></tr>',
        '<tr><td>Audio</td><td>Attaches to clips</td><td>WAV, MP3, AIFF</td></tr>',
        '</tbody></table>',
        '<p>Media <strong>players</strong> are separate from media <strong>pool slots</strong>. There are two players; each one is pointed at a pool slot. To change what is on screen you either change the player assignment or upload a new file into the slot.</p>',
        '<h3>Preparing graphics correctly</h3>',
        '<ul>',
        '<li>Export at your exact switcher resolution - <strong>1920 x 1080</strong> for any 1080 standard.</li>',
        '<li><strong>PNG with a real alpha channel</strong> for anything that needs transparency.</li>',
        '<li>Keep text inside title-safe - roughly 5% in from every edge.</li>',
        '<li>Name files so you can find them at speed: <code>LT_01_HostName.png</code> beats <code>final_v3_REALfinal.png</code>.</li>',
        '</ul>',
        '<h3>The import path</h3>',
        '<ol>',
        '<li>Open the <strong>Media</strong> tab in ATEM Software Control.</li>',
        '<li>The top half is a file browser onto your computer. Navigate to your graphics folder.</li>',
        '<li>Drag a file down onto an empty pool slot. A progress bar runs while it uploads to the switcher.</li>',
        '<li>Back on the <strong>Switcher</strong> tab, open the <strong>Media Players</strong> palette and point <strong>Media Player 1</strong> at that slot.</li>',
        '<li>Set <strong>DSK 1 Fill</strong> to Media Player 1 and <strong>Key</strong> to Media Player 1 Key. Tick Pre Multiplied Key.</li>',
        '<li>Hit <strong>ON AIR</strong> on DSK 1 and the graphic is live.</li>',
        '</ol>',
        '<div class="callout callout--warn"><i class="callout__bar"></i><div><b>Upload before the show, never during</b>Pushing a 1920x1080 PNG into the pool takes a moment, and pushing a clip takes considerably longer. Load every graphic you might need before doors open.</div></div>'
      ].join('') },

      { type: 'sim', sim: 'windows-media', title: 'Simulation: File Explorer to on air',
        intro: 'The full Windows path. Open File Explorer, find the graphics folder, drag a lower third into the media pool, assign it to a media player and put it on air with a downstream keyer.' },

      { type: 'quiz', title: 'Checkpoint quiz', bank: 'm08', pass: 0.8 }
    ]
  },

  /* ==========================================================
     09
     ========================================================== */
  {
    id: 'm09', n: '09', accent: 'audio',
    title: 'Audio: The Fairlight Mixer',
    blurb: 'Channel strips, AFV, EQ and dynamics, talkback and mix-minus - and why audio kills more shows than video.',
    tags: ['Read', 'Audio sim', 'Quiz'],
    steps: [
      { type: 'prose', title: 'The mixer, channel by channel', html: [
        '<p>Every SDI input carries embedded audio, and those channels appear in the mixer automatically alongside the XLR, RCA and MADI inputs - 58 channels in total on the HD8.</p>',
        '<h3>The three states of every channel</h3>',
        '<table class="spectable"><thead><tr><th>State</th><th>Behaviour</th><th>Use for</th></tr></thead><tbody>',
        '<tr><td>ON</td><td>Always in the mix regardless of what is on air</td><td>The host mic, music playback, a mix desk feed</td></tr>',
        '<tr><td>OFF</td><td>Never in the mix</td><td>A camera whose on-board mic you do not want</td></tr>',
        '<tr><td>AFV</td><td>Audio Follows Video - fades up only when that source is on program</td><td>Audience cameras, VT playback, roving reporters</td></tr>',
        '</tbody></table>',
        '<div class="callout callout--gotcha"><i class="callout__bar"></i><div><b>AFV on everything is a trap</b>If every camera is AFV and they are all pointed at the same room, every cut changes the room tone and you get a pumping, phasey mess. Put the real microphones on ON and reserve AFV for sources whose audio genuinely belongs to that shot.</div></div>',
        '<h3>Levels</h3>',
        '<ul>',
        '<li>Aim for peaks around <strong>-10 dBFS</strong> with the loudest moment touching <strong>-6</strong>.</li>',
        '<li>Never let the meter hit <strong>0 dBFS</strong>. Digital clipping is not warm, it is broken.</li>',
        '<li>Watch the <strong>master</strong> meter as well as the channels - eight channels each at a safe level still sum to a hot master.</li>',
        '</ul>',
        '<h3>EQ and dynamics on every channel</h3>',
        '<p>Six-band parametric EQ plus a full dynamics section - expander, gate, compressor and limiter. A sane starting point for a speech microphone:</p>',
        '<ul>',
        '<li><strong>High-pass around 80 Hz</strong> - removes rumble, air conditioning and handling noise you cannot hear on your headphones but the audience can.</li>',
        '<li><strong>Gentle compression</strong>, roughly 3:1 with a few dB of gain reduction on peaks, to even out a presenter who leans in and out.</li>',
        '<li><strong>Limiter as a safety net</strong> a couple of dB below your ceiling. It is there for the cough into the mic, not for everyday level control.</li>',
        '<li><strong>Gate</strong> only if you have a genuine noise problem - a badly set gate chopping the front off words is worse than the noise.</li>',
        '</ul>',
        '<h3>Talkback and mix-minus</h3>',
        '<p>The 5-pin XLR headset connection puts you on a party line with your camera operators over SDI. Mix-minus is the essential idea: <strong>each person hears the programme minus their own voice</strong>. Send someone their own audio back and you get an echo that makes conversation impossible - the classic remote-guest failure.</p>'
      ].join('') },

      { type: 'sim', sim: 'atem', mission: 'audio', title: 'Simulation: mix the show',
        intro: 'Open the Audio tab and set the show up: host mic always on, cameras following video, levels under control and the master where it should be.' },

      { type: 'quiz', title: 'Checkpoint quiz', bank: 'm09', pass: 0.8 }
    ]
  },

  /* ==========================================================
     10
     ========================================================== */
  {
    id: 'm10', n: '10', accent: 'pvw',
    title: 'Camera Control & Tally',
    blurb: 'Matching cameras from the switcher, remote iris and colour, and how tally reaches the operator.',
    tags: ['Read', 'ATEM sim', 'Quiz'],
    steps: [
      { type: 'prose', title: 'Controlling cameras down the return cable', html: [
        '<p>When you wire <strong>SDI Out n back to camera n</strong>, that coax carries three things upstream: the program return picture, tally, and camera control data. On Blackmagic cameras - Studio Camera, Pocket Cinema Camera, Micro Studio - the Camera tab in Software Control then drives the camera directly.</p>',
        '<h3>What you can change per camera</h3>',
        '<ul>',
        '<li><strong>Iris</strong> - the big control. Match exposure between cameras.</li>',
        '<li><strong>Focus</strong>, plus auto-focus on lenses that support it.</li>',
        '<li><strong>Gain / ISO</strong> and <strong>shutter angle</strong>.</li>',
        '<li><strong>White balance</strong> in kelvin, plus tint.</li>',
        '<li><strong>Lift, Gamma, Gain, Saturation</strong> colour wheels, and <strong>master black</strong> (pedestal).</li>',
        '</ul>',
        '<h3>How to actually match three cameras</h3>',
        '<ol>',
        '<li>Point every camera at the same white and grey reference in the real lighting.</li>',
        '<li>Set all cameras to the <strong>same white balance in kelvin</strong>. Not auto - a fixed number.</li>',
        '<li>Set <strong>master black</strong> so blacks sit at the same level; this is where mismatch shows first.</li>',
        '<li>Match <strong>iris</strong> until the reference reads the same on every camera in the multiview.</li>',
        '<li>Only now touch <strong>gamma</strong> and <strong>saturation</strong>, in small moves.</li>',
        '<li>Cut between the cameras and watch. If the picture jumps, you are not done.</li>',
        '</ol>',
        '<div class="callout callout--pro"><i class="callout__bar"></i><div><b>Judge on the multiview, confirm on program</b>Multiview tiles are small and heavily scaled. Get close on the multiview, then put each camera on program full-screen for the final call.</div></div>',
        '<h3>Tally</h3>',
        '<p>Tally is the red light that tells a camera operator and the talent that this camera is live.</p>',
        '<ul>',
        '<li><strong>Red</strong> - on program, live.</li>',
        '<li><strong>Green</strong> - on preview, you are next.</li>',
        '</ul>',
        '<p>It travels down the SDI return, so it is automatic once the returns are wired - no separate tally cable, no tally box. It also shows on the multiview tile borders and on the crosspoint LEDs of the front panel.</p>'
      ].join('') },

      { type: 'sim', sim: 'atem', mission: 'camera', title: 'Simulation: match the cameras',
        intro: 'Camera 2 is under-exposed and cold against camera 1. Use camera control to bring it into line, and confirm tally is reaching the right operator.' },

      { type: 'quiz', title: 'Checkpoint quiz', bank: 'm10', pass: 0.8 }
    ]
  },

  /* ==========================================================
     11
     ========================================================== */
  {
    id: 'm11', n: '11', accent: 'iso',
    title: 'Streaming, Recording & ISO Export',
    blurb: 'RTMP to YouTube, recording to a USB-C disk, and turning ISO files into a Resolve timeline.',
    tags: ['Read', 'ATEM sim', 'Quiz'],
    steps: [
      { type: 'prose', title: 'Going live to the internet', html: [
        '<p>The HD8 has an RTMP encoder built in. No computer, no OBS, no capture card - ethernet straight out of the switcher to the platform.</p>',
        '<h3>Setting up a stream</h3>',
        '<ol>',
        '<li>Give the switcher a working <strong>gateway and DNS</strong> - streaming needs real internet, not just a LAN.</li>',
        '<li>Open the <strong>Streaming</strong> palette in Software Control.</li>',
        '<li>Choose your <strong>platform</strong> - YouTube, Twitch, Facebook, or a custom RTMP server.</li>',
        '<li>Paste the <strong>stream key</strong> from the platform dashboard.</li>',
        '<li>Pick a <strong>quality</strong> preset. It sets the bitrate for both the stream and the program recording.</li>',
        '<li>Press <strong>ON AIR</strong>. The palette shows the live data rate and cache status.</li>',
        '</ol>',
        '<div class="callout callout--gotcha"><i class="callout__bar"></i><div><b>Bitrate honesty</b>Test your real upload speed at the venue, at the time of day you are broadcasting, and choose a bitrate at roughly half of it. A stream that drops frames looks far worse than a lower-bitrate stream that never stutters.</div></div>',
        '<h3>Recording</h3>',
        '<p>Two destinations: an <strong>external disk on USB-C</strong>, or optional <strong>internal M.2 flash</strong>. Format the media as <strong>exFAT</strong> so both Windows and macOS can read it.</p>',
        '<ul>',
        '<li>The program record is <strong>H.264 .mp4 with AAC audio</strong>, at the streaming quality setting.</li>',
        '<li>Use a genuinely fast SSD. A USB stick or spinning drive will drop frames under an eight-stream ISO load.</li>',
        '<li>The record palette shows remaining time on the disk. Check it before you start, not at minute fifty.</li>',
        '</ul>',
        '<h3>ISO recording, and what you get afterwards</h3>',
        '<p>On the ISO model, arming record writes:</p>',
        '<ul>',
        '<li>Eight <strong>input .mp4 files</strong>, one per SDI input, up to 70 Mb/s</li>',
        '<li>Separate <strong>24-bit 48 kHz .wav</strong> files for the audio inputs</li>',
        '<li>The <strong>program .mp4</strong></li>',
        '<li>A <strong>DaVinci Resolve .drp project file</strong></li>',
        '<li>A <strong>media folder</strong> containing every still and clip from the media pool</li>',
        '</ul>',
        '<h3>The Resolve handoff</h3>',
        '<ol>',
        '<li>Copy the <strong>entire folder</strong> off the disk. All of it - the .drp expects its neighbours.</li>',
        '<li>In DaVinci Resolve, <strong>File &rarr; Import Project</strong> and choose the .drp.</li>',
        '<li>Open the timeline. Your live cut is there, with every ISO angle linked as a multicam.</li>',
        '<li>Fix the shots you punched early, replace a graphic, remix the audio from the separate WAVs, then deliver.</li>',
        '</ol>',
        '<div class="callout callout--pro"><i class="callout__bar"></i><div><b>Copy before you celebrate</b>Do not unplug the disk the second you stop recording, and do not edit off the record disk. Copy to two places first. The show only exists once until you have copied it.</div></div>'
      ].join('') },

      { type: 'sim', sim: 'atem', mission: 'stream', title: 'Simulation: arm the stream and roll ISO',
        intro: 'Configure a YouTube stream, choose a sensible quality, check your disk, arm ISO recording and take the show live.' },

      { type: 'quiz', title: 'Checkpoint quiz', bank: 'm11', pass: 0.8 }
    ]
  },

  /* ==========================================================
     12
     ========================================================== */
  {
    id: 'm12', n: '12', accent: 'brand',
    title: 'The Hardware Panel',
    blurb: 'Driving the switcher with your hands: crosspoints, shift, fader bar, joystick, keypad and macros.',
    tags: ['Read', 'Panel sim', 'Quiz'],
    steps: [
      { type: 'prose', title: 'What is under your fingers', html: [
        '<p>The front of the HD8 is a real control panel, not a set of menu buttons. Once you know it, you can run a show with the computer closed.</p>',
        '<table class="spectable"><thead><tr><th>Control</th><th>Count</th><th>What it does</th></tr></thead><tbody>',
        '<tr><td>Crosspoint buttons</td><td>10 direct, 20 shifted</td><td>Source selection with tri-colour LEDs - red on program, green on preview</td></tr>',
        '<tr><td>Crosspoint LCDs</td><td>6 rows, 24 characters</td><td>Live source labels above the buttons, so the panel relabels itself</td></tr>',
        '<tr><td>Fader bar</td><td>1</td><td>Manual transitions, bi-directional</td></tr>',
        '<tr><td>Transition type</td><td>5</td><td>MIX / DIP / WIPE / STING / DVE</td></tr>',
        '<tr><td>Key buttons</td><td>8</td><td>Arm and take upstream keys</td></tr>',
        '<tr><td>DSK selectors</td><td>6</td><td>Tie, on-air and auto for the downstream keyers</td></tr>',
        '<tr><td>AUX buttons</td><td>12</td><td>Route any source to an aux output</td></tr>',
        '<tr><td>Macro buttons</td><td>10 + 10 shifted</td><td>Fire recorded sequences of actions</td></tr>',
        '<tr><td>Joystick</td><td>3-axis</td><td>DVE position and size, and camera control</td></tr>',
        '<tr><td>Numeric keypad</td><td>1</td><td>Direct numeric entry for rates, sources and settings</td></tr>',
        '<tr><td>Record / Stream</td><td>2 + 2</td><td>Arm and run recording and streaming from the panel</td></tr>',
        '<tr><td>Fade to black</td><td>1</td><td>The emergency brake</td></tr>',
        '<tr><td>System LCD</td><td>1</td><td>Menus, status, video standard, disk and stream state</td></tr>',
        '</tbody></table>',
        '<h3>Shift</h3>',
        '<p>Ten physical crosspoints, twenty addressable sources. <strong>SHIFT</strong> moves the row to the second bank - that is where black, colour generators, media players and SuperSource live. Hold shift and the LCD labels change to match, so you are never guessing.</p>',
        '<h3>Macros</h3>',
        '<p>A macro is a recorded sequence of switcher actions replayed by one button. Genuinely useful ones:</p>',
        '<ul>',
        '<li><strong>Show open</strong> - bars off, camera 1 to program, title graphic on DSK 1, music up, stinger.</li>',
        '<li><strong>Lower third</strong> - DSK 1 on for eight seconds, then off.</li>',
        '<li><strong>Go to break</strong> - DSK off, fade audio, dip to black, holding slide up.</li>',
        '</ul>',
        '<div class="callout callout--pro"><i class="callout__bar"></i><div><b>Test macros cold</b>Record a macro, then run it from a completely different switcher state. Macros that assume you were already on camera 1 will do something surprising at exactly the wrong moment.</div></div>'
      ].join('') },

      { type: 'sim', sim: 'panel', title: 'Simulation: the physical panel',
        intro: 'A working recreation of the HD8 front panel. Press the buttons, drag the fader bar, move the joystick. Complete the drills to pass.' },

      { type: 'quiz', title: 'Checkpoint quiz', bank: 'm12', pass: 0.8 }
    ]
  },

  /* ==========================================================
     13 - final
     ========================================================== */
  {
    id: 'm13', n: '13', accent: 'pgm', final: true,
    title: 'Final Exam: Run The Show',
    blurb: 'A timed live production from cold start to safe shutdown, then the written final.',
    tags: ['Live sim', 'Final exam'],
    steps: [
      { type: 'prose', title: 'The brief', html: [
        '<p>You are directing a one-camera-plus-panel discussion show, streamed live to YouTube and recorded ISO for edit. Doors are in ten minutes.</p>',
        '<h3>Run of show</h3>',
        '<ol>',
        '<li>Holding slide on air, music under.</li>',
        '<li>Stinger to camera 1 - the host welcome.</li>',
        '<li>Lower third for the host, eight seconds.</li>',
        '<li>Cut between cameras 1, 2 and 3 through the discussion.</li>',
        '<li>Guest on the green screen, keyed over the studio background.</li>',
        '<li>Wipe to the wide, lower third for the closing credit.</li>',
        '<li>Fade to black, stop the stream, stop the record, copy the media.</li>',
        '</ol>',
        '<p>The live simulation checks your real switcher state at each beat. Take your time on the setup - the clock only runs on the show itself.</p>',
        '<div class="callout"><i class="callout__bar"></i><div><b>Pass mark</b>Complete every beat of the live simulation, then score 85% or better on the written final. Both are required to earn the certificate.</div></div>'
      ].join('') },

      { type: 'sim', sim: 'atem', mission: 'showtime', title: 'Live simulation: run the show',
        intro: 'Everything you have learned, in order, against the clock. Complete every beat of the run of show.' },

      { type: 'quiz', title: 'Written final exam', bank: 'final', pass: 0.85, count: 24, final: true }
    ]
  }
  ];

  w.COURSE = {
    title: 'Blackmagic ATEM Television Studio HD8',
    subtitle: 'Operator Mastery Course',
    modules: MODULES,
    video: VIDEO,

    module: function (id) {
      for (var i = 0; i < MODULES.length; i++) if (MODULES[i].id === id) return MODULES[i];
      return null;
    },
    index: function (id) {
      for (var i = 0; i < MODULES.length; i++) if (MODULES[i].id === id) return i;
      return -1;
    },
    totalSteps: function () {
      return MODULES.reduce(function (n, m) { return n + m.steps.length; }, 0);
    },
    doneSteps: function () {
      var n = 0;
      MODULES.forEach(function (m) {
        m.steps.forEach(function (s, i) { if (w.State.isStepDone(m.id, i)) n++; });
      });
      return n;
    },
    moduleDone: function (m) {
      for (var i = 0; i < m.steps.length; i++) if (!w.State.isStepDone(m.id, i)) return false;
      return true;
    },
    moduleProgress: function (m) {
      var n = 0;
      for (var i = 0; i < m.steps.length; i++) if (w.State.isStepDone(m.id, i)) n++;
      return n / m.steps.length;
    },
    /* a module unlocks when the previous one is finished */
    moduleUnlocked: function (m) {
      var i = w.COURSE.index(m.id);
      if (i <= 0) return true;
      return w.COURSE.moduleDone(MODULES[i - 1]);
    },
    firstIncomplete: function () {
      for (var i = 0; i < MODULES.length; i++) {
        var m = MODULES[i];
        for (var s = 0; s < m.steps.length; s++) {
          if (!w.State.isStepDone(m.id, s)) return { mod: m, step: s };
        }
      }
      return null;
    },
    allDone: function () {
      return MODULES.every(function (m) { return w.COURSE.moduleDone(m); });
    },
    pct: function () {
      return Math.round(w.COURSE.doneSteps() / w.COURSE.totalSteps() * 100);
    }
  };
})(window);
