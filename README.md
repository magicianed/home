# magicianed

A game that teaches you the **Blackmagic ATEM Television Studio HD8**.

Static site — no build step, no dependencies, no backend. Runs on GitHub Pages as-is.

**Live:** https://magicianed.github.io/home/

---

## How it teaches

Thirteen levels. Every one is the same two beats:

**PONDER** — an animated isometric scene plays out the idea, one short caption at a time. You can scrub, pause and replay any beat. Borrowed wholesale from Create mod's Ponder, because it works.

**PLAY** — you do the thing yourself in a working simulation. Tasks are checked against real switcher state, not against clicks.

There is no reading step. Nothing is explained in a paragraph that could be shown in a scene or learned by doing it wrong once.

| # | Level | Ponder | Play |
|---|-------|--------|------|
| 01 | Meet the HD8 | One picture leaves | The real walkthrough video, with five checkpoints that block until you answer |
| 02 | The Back Panel | The back of the box | Identify all eight connector groups |
| 03 | Wire It Up | Every camera is a loop | Cable-patching minigame, two levels |
| 04 | Power On | One format, or nothing | ATEM Setup simulation |
| 05 | The Software | Four tabs, and that is it | Windows desktop: installer, device picker, connect |
| 06 | Switching Live | Three ways to take | Program/preview, cut, auto, fader bar |
| 07 | Keys & Transitions | What sits on top of what | Wipe, chroma key, downstream key |
| 08 | Graphics | From your drive to on air | Drag a PNG out of File Explorer into the media pool |
| 09 | Audio | ON, AFV, OFF | Mix the show on the channel strips |
| 10 | Cameras & Tally | Make them the same room | Match a mis-exposed camera |
| 11 | Stream & Record | Out to the world | RTMP, bitrate, disk, clean shutdown |
| 12 | The Panel | Hands on the box | Playable front panel — 13 drills |
| 13 | Run The Show | — | Eleven beats in order, then the written final |

## Game layer

XP for every level cleared, eight ranks from **Runner** to **Showrunner**, streak tracking in the exam, and a downloadable PDF certificate with your name on it — generated in the browser by a hand-rolled vector PDF writer.

## Design

Pure black and white, no gradients. Colour is a signal, the same way it is on the switcher:
red = program, green = preview, blue = information, purple = magicianed, amber = audio, cyan = keys/media, pink = stream/record.

## Progress

Everything lives in `localStorage` under `magicianed.atem.hd8.v1`. Nothing is uploaded. "Reset progress" in the sidebar wipes it.

## Layout

```
index.html
assets/
  css/   base · app · ponder · four simulation sheets · certificate · layout-fix
  js/
    ponder.js        isometric scene engine
    data-scenes.js   the twelve scenes
    data-course.js   the thirteen levels
    data-quiz.js     final exam bank
    sim-atem.js      ATEM Software Control recreation
    sim-panel.js     rear panel explorer + HD8 front panel
    sim-windows.js   Windows desktop, File Explorer, installer, ATEM Setup
    sim-wiring.js    cable minigame
    view-*.js        video · lesson · dashboard · certificate
    lib/pdf.js       dependency-free vector PDF writer
    state.js  ui.js  app.js
```

## Deploying a change

GitHub Pages serves assets with `Cache-Control: max-age=600`, so a returning visitor can keep the old CSS/JS for ten minutes after a push. Every asset URL in `index.html` carries a `?v=N` stamp — **bump it whenever you change anything in `assets/`**:

```bash
sed -i -E 's/\?v=[0-9]+"/?v=4"/g' index.html
```

## Accuracy note

Specifications follow Blackmagic Design's published tech specs for the ATEM Television Studio HD8. The simulations are teaching tools built to behave like the real software; they are not affiliated with or endorsed by Blackmagic Design, and the certificate is a magicianed training credential, not an official Blackmagic certification.
