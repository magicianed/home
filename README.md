# magicianed

An interactive course that teaches the **Blackmagic ATEM Television Studio HD8 / HD8 ISO** from rack rails to a finished DaVinci Resolve timeline.

Static site. No build step, no dependencies, no backend. Drop it on GitHub Pages and it runs.

---

## What is in it

Thirteen modules, each mixing several teaching methods:

| # | Module | How it teaches |
|---|--------|----------------|
| 01 | What a switcher actually does | Reading + **YouTube video with six enforced checkpoints** + quiz |
| 02 | Rack, power & the rear panel | Reading + clickable rear-panel explorer + quiz |
| 03 | Wiring the studio | **Cable-patching minigame**, two levels (6 and 18 patches) |
| 04 | First boot: video standard & network | **ATEM Setup utility simulation** |
| 05 | Windows setup & Software Control | **Windows desktop simulation** — File Explorer, installer, device picker |
| 06 | Switching live | **ATEM Software Control simulation** — program/preview, cut, auto, fader bar |
| 07 | Transitions, keyers & DVE | Simulation — wipes, chroma key sampling, downstream keys |
| 08 | Media pool & importing files | **Drag a PNG from File Explorer into the media pool**, then on air |
| 09 | Audio: the Fairlight mixer | Simulation — channel strips, ON/AFV/OFF, EQ, dynamics, master |
| 10 | Camera control & tally | Simulation — match a mis-exposed camera from the switcher |
| 11 | Streaming, recording & ISO export | Simulation — RTMP, disk format, ISO, clean shutdown order |
| 12 | The hardware panel | **1RU front panel simulation** — crosspoints, shift, fader, joystick, keypad, macros |
| 13 | Final exam | Timed live-show simulation + 24-question written final |

Finish everything and you get a **downloadable PDF certificate** with your name on it, generated entirely in the browser.

## Design

Pure black and white, no gradients anywhere. Colour is used only as a signal, the same way it is on the switcher itself:

- **red** — program / on air
- **green** — preview / correct
- **blue** — information, video, transitions
- **purple** — magicianed, progress, hardware
- **amber** — audio, warnings
- **cyan** — keyers, media
- **pink** — recording, ISO, export

## Running it locally

Any static server works. For example:

```bash
npx serve .
```

Then open the address it prints. Opening `index.html` from the filesystem also works, but the YouTube embed behaves better over http.

## Progress

Everything is stored in `localStorage` under `magicianed.atem.hd8.v1` — name, completed steps, checkpoint answers, quiz scores, simulation results and the issued certificate. Nothing is uploaded anywhere. "Reset progress" in the sidebar wipes it.

## Layout

```
index.html
assets/
  css/    base, app, four simulation sheets, certificate, layout fixes
  js/
    state.js          persistence
    ui.js             dom helpers, toasts, modals, sound, drag
    data-course.js    the curriculum, video checkpoints
    data-quiz.js      question banks
    sim-atem.js       ATEM Software Control recreation
    sim-panel.js      rear panel explorer + HD8 front panel
    sim-windows.js    Windows desktop, File Explorer, installer, ATEM Setup
    sim-wiring.js     cable patching minigame
    view-*.js         video, lesson, dashboard, certificate
    lib/pdf.js        dependency-free vector PDF writer
    app.js            router + shell
```

## Accuracy note

Hardware specifications follow the published Blackmagic Design tech specs for the ATEM Television Studio HD8 and HD8 ISO. The simulations are teaching tools built to behave like the real software — they are not affiliated with or endorsed by Blackmagic Design, and the certificate is a magicianed training credential, not an official Blackmagic certification.

## Deploying a change

GitHub Pages serves assets with `Cache-Control: max-age=600`, so a returning
visitor can keep the old CSS/JS for ten minutes after a push. Every asset URL in
`index.html` therefore carries a `?v=N` stamp — **bump that number whenever you
change a file in `assets/`** and the new version is picked up immediately:

```bash
sed -i -E 's/\?v=[0-9]+"/?v=3"/g' index.html
```
