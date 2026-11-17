# Prompt: "Ika Kaiju Catch" — Three.js artifact

> Paste everything below the line into a new session. Attach a screenshot of the
> reference video at **10:26** if you have one (see §4, Calibration).

---

## 1. Role and goal

You are a senior creative technologist who works in Three.js and film-look rendering.
Build a **single-file Three.js artifact** that looks like a shot from a **Shōwa-era
Japanese tokusatsu (特撮) film**: practical miniatures, a puppet monster, ink-tank
clouds, pyrotechnic sparks, film grain.

**The story:** an original **kaiju-sized Japanese flying squid (スルメイカ)** falls
back from space, heavy with ink. It billows ink across the sky as it drops, jets
itself upright over the launch tower, and gets plucked out of the air by a pair of
giant **Japanese wooden chopsticks (木箸)** mounted on the tower. Once it is safely
caught, the squid **wraps its arms and tentacles around the tower in a big hug
(抱擁)**.

The squid takes the place of the Starship upper stage in the real event. Its
**silhouette, scale, descent motion and camera view must stay faithful to the real
catch as filmed.** The tokusatsu treatment and the squid sit on top of that real
choreography. A `squidIntensity` slider runs from 0 (a tokusatsu miniature of the
real Ship) to 1 (a full kaiju squid). Default it to 0.9.

## 2. Reference event (keep the choreography true to it)

- **Video:** "Historic Catch! SpaceX Starship Captured by Launch Tower After Reentry".
  https://youtu.be/A6-zruZTfOA?t=626. **The view at 10:26 is the camera reference.**
- **Event (from press reports):** Starship Flight 15, **Ship 42**. It launched Fri
  13 Nov 2026 and was caught by the tower arms on **Sat 14 Nov 2026**, about 22.5 h
  after liftoff. One report puts the catch at about 15:20 CST, but sources disagree on
  the exact time. This was the first-ever catch of the upper stage. Show **no booster**
  in the scene.
- **Not confirmed:** which pad, the weather, and the exact camera position. Expose
  all of these as parameters.
- **Approximate vehicle and mantle proportions:**
  - Total length about 52 m, diameter 9 m, with a tapered nose about 18 m long.
  - 2 small forward flaps on the nose, which become the squid's **fins**. 2 large aft
    flaps at the base.
  - An engine skirt at the base. This is where the squid's **arms, tentacles and
    siphon** emerge.
  - 2 catch pins just below the forward flaps. These rest on the chopsticks at the
    catch.
- **Approximate tower geometry:**
  - Square lattice tower about 140 m tall, plus a lightning mast.
  - A carriage that moves vertically and holds the two chopsticks. Catch height is
    about 100 m (parameter).
  - Launch mount at the base. The sea lies east of the pad, with flat tidal sand
    around it.

## 3. Art direction: Shōwa tokusatsu

- **Film stock:** a post pass emulating 1960s–70s Eastmancolor.
  - Warm, saturated reds and oranges, teal-cyan skies, slightly lifted blacks.
  - Organic film grain.
  - Red-orange **halation** around bright flames and sparks.
  - Subtle **gate weave**, 1–2 px of frame drift.
  - Soft vignette and a touch of chromatic aberration at the edges.
  - Optional dust and scratch flecks.
- **Aspect and cadence:**
  - Optional letterbox at 2.35:1 (scope), the default, or 4:3.
  - An optional 24 fps cadence: hold rendered frames to give a film judder.
- **Miniature-set feel:** everything should look like a superbly built miniature
  that was filmed to look huge.
  - **Tower:** a hard key light with a long shadow. Stylised but crisp lattice
    detail, with a slight painted-model sheen on the steel.
  - **Sky:** a **painted cyclorama backdrop**. Use a hand-painted gradient with
    soft brush texture and painted cumulus. Leave a faintly visible horizon join
    where the backdrop meets the ground set.
  - **Ground:** a sculpted miniature landscape, with tidal flats, a sea strip with
    small glossy ripples, and low pad buildings.
- **Overcranked slow motion:** tokusatsu filmed miniatures at high speed to sell
  their scale. Ramp playback to about 0.4× through the **flip** and the **catch**,
  then ramp back to 1×.
- **Practical effects vocabulary:**
  - **Ink-tank clouds:** ink billowing in water, the classic cloud and smoke effect.
  - **Gunpowder spark bursts** at mechanical contact.
  - **Flare-style flames** that are bright and slightly flickering, not
    physically accurate.
  - **Cotton-wool steam and dust** at the base of the tower.
- **Title card (optional, the first 3 s):** a bold Shōwa-style title in red and
  white, **「大烏賊 捕獲作戦」** ("Operation: Giant Squid Capture"). Show it over a
  frozen frame with grain, then cut to the action.

## 4. Camera and calibration (match the video)

**Default preset `VIDEO_MATCH`:** a ground-based long-lens tracking camera like the
ones on a launch webcast.

- Position the camera about 2,000 m from the tower, 8 m above ground. Its azimuth
  around the tower is a parameter.
- Use a telephoto lens: vertical FOV about 6–12°.
- During descent, the camera tracks the squid. Aim at it with a critically damped lag
  of about 0.3 s so it feels like a human operator. Auto-zoom so the squid fills
  about 25% of the frame height.
- For the catch, ease over 3 s to a fixed **catch framing**: tower top third plus the
  squid, filling about 60% of frame height, with the tower slightly off-centre.
- During the hug, widen slowly over about 4 s so the whole wrapped section of the
  tower stays in frame, from about 10 m up to the top.
- Add subtle operator jitter (≤ 0.02°) on top of the gate weave.

**Calibration.** If a screenshot of the 10:26 frame is attached, match it and
override the defaults. Read these values off the frame and put them in `CONFIG.camera`:

1. Horizon height, as a % of frame height.
2. Horizontal position of the tower, as a % of frame width. Note which side the
   arms point to.
3. Tower height on screen, as a % of frame height. Use this to derive FOV and distance.
4. Vehicle size and position on screen at that instant. Use this to pick the matching
   timeline `t`, and open the artifact paused there.
5. Which side of the tower and vehicle is sunlit. Use this to set the camera azimuth
   relative to the sun.

If no screenshot is attached, use the defaults and mark each guessed value with a
`// CALIBRATE` comment.

**Other presets:**

| Preset | View |
| --- | --- |
| `KAIJU_LOW` | The classic tokusatsu hero angle: 150 m from the tower, 1.5 m above ground, looking steeply up, FOV 40° |
| `TOWER_CAM` | Near the tower top, looking out along the chopsticks |
| `CHASE` | Trailing the squid |
| `FREE` | OrbitControls |

**`directorCuts`** (off by default, so the view stays aligned with the video). When
on, the camera cuts on beats between `VIDEO_MATCH` and `KAIJU_LOW`: the flip and the
catch get `KAIJU_LOW` inserts, like a film edit.

## 5. Timeline

The whole sequence lasts about 85 s at 1× and loops. **All scene state must be a pure
function of time `t`,** so scrubbing works instantly. Don't integrate physics frame by
frame. Build the trajectory from analytic segments that keep position and velocity
continuous. Seed particle spawns by time bin so the same `t` always looks the same.
Apply the slow-motion ramps as a remapping of real time to `t`.

| Phase | t (s) | Real motion (keep) | Kaiju squid layer |
| --- | --- | --- | --- |
| Return from space | 0–8 | A glowing ember high in the sky; the plasma glow fades | A fiery flare streak with an ink tail, haloed by halation |
| Belly-flop | 8–36 | Falls horizontally, belly down, at about 85 m/s from 3,000 m to 600 m | Fins ripple. Arms trail behind. A **continuous ink-tank trail** of rolling, billowing plumes |
| Flip (slow-mo) | 36–41 | The jet ignites and the body rotates 90° to vertical, overshooting about 8° before settling | Chromatophores flash, the eyes catch the light, and a **huge ink burst** mushrooms across the sky |
| Landing burn | 41–54 | Slows from about 85 to 2 m/s while sliding about 60 m sideways toward the tower | The siphon jets in pulses. Each pulse throws an ink bloom. The arms spread and reach down |
| Catch (slow-mo) | 54–60 | Descends between the chopsticks at 1–2 m/s. The chopsticks close just before arrival. The pins land on them, followed by a damped bounce of about 0.5 m over 2–3 cycles and a slight sway | **Spark bursts** where the pins hit the wood. The arms writhe, then go limp for a beat, like a fresh ika lifted by hashi |
| **Hug (抱擁)** | 60–72 | The body hangs on the chopsticks and the sway dies down | The arms and tentacles reach out and **wrap around the tower in a spiral hug**. The two long tentacles go lowest. Suckers press onto the lattice, a little dust and a few sparks fall, and the chromatophores glow a calm, warm colour |
| Aftermath | 72–85 | Steam and dust cloud drifts on the wind | The squid holds the hug. The ink clouds drift and thin out, and the camera slowly pulls back |

## 6. The kaiju squid (scaled by `squidIntensity`)

- **Material:** a well-crafted **latex puppet** look.
  - Glossy, wet sheen with clear specular highlights.
  - Slightly rubbery subsurface softness. Fake it with a wrap-lighting term.
  - Fine sculpted texture.
- **Species look:** Japanese flying squid.
  - A warm, semi-translucent body with **reddish-brown and vermilion
    chromatophores**.
  - A darker dorsal stripe. The black heat-shield side becomes this dark back.
  - Large, glassy dark eyes near the base of the arms.
  - Make it an **original creature**. Don't reference any existing kaiju franchise
    character.
- **Living skin:** animated chromatophore spots that expand and contract.
  - The rhythm follows an `excitement` curve that peaks at the flip and the catch.
  - Keep the hexagonal tile pattern faintly visible underneath as a nod to the real
    vehicle, fading with intensity.
- **Fins:** the forward flaps, reshaped into rhomboid squid fins that ripple.
- **Arms and tentacles:** 8 arms plus 2 longer tentacles growing from the base.
  - Build them as `TubeGeometry` along procedural curves driven by the velocity
    direction and the phase.
  - Keep them deterministic, with no physics.
  - Add a slight **puppeteered** quality: motion eased in small steps, like wire
    puppetry.
  - Optional `showWires` easter egg: faint wire lines above the squid.
  - **Hug pose (抱擁):** the arms start at the base of the body, about 62 m up when
    the pins sit at 100 m.
    - Blend each arm from its free curve into a helix around the tower's vertical
      axis. Set the helix radius to the tower's bounding half-width plus the arm's
      thickness, so the arms hug the outside of the lattice and never pass through
      it.
    - Give each arm its own phase and height. Spread the wrap from base to tip so
      the curl travels along each arm like a real tentacle, not all at once.
    - The 8 arms wrap about `hugTurns` (1–1.5) turns between about 60 m and 35 m.
      The 2 long tentacles wrap lower, down to about 15 m.
    - Swell the suckers slightly where they touch. Give the arms a slow
      "breathing" squeeze while the hug holds.
    - Keep the hug pose a deterministic function of `t`.
- **Ink, the hero effect.** Make it plentiful: "full of ink" is the brief.
  - Instanced billboard particles (≤ 6,000) shaded as **ink-in-water-tank plumes**:
    dense black-indigo cores, rolling billows, fractal edges, cauliflower expansion
    and curl-noise turbulence.
  - Inks evolve a little slower than real time, like an overcranked tank shot.
  - Use normal (not additive) blending. Lit plumes have a faint blue-violet rim from
    the sky.
  - Ink takes the place of most of the exhaust. Keep a bright, flickering flare-style
    flame core at the siphon during burns, with halation.
  - `inkDensity` scales the whole effect.
- **Chopsticks:** Japanese wooden chopsticks in place of the steel truss arms. Make
  them look like a beautifully made practical prop.
  - Each is about 35 m long, with a square back end tapering to fine pointed tips.
    Use a thickness ratio of about 15:1 so they read clearly at telephoto distance.
  - Pale hinoki or bamboo wood with visible grain lines and a soft satin sheen, plus
    a thin vermilion lacquer band near the back end.
  - The two chopsticks converge slightly toward the tips, like a real chopstick grip.
  - At `squidIntensity = 0` they fall back to the steel truss arms.

## 7. Environment and lighting

- **Sun:** elevation about 26°, azimuth about 225° (SW). That's the sun position for
  15:20 CST, 14 Nov, at 25.99°N 97.16°W. Make both values parameters.
  - Treat the sun as a **hard studio key light**: crisp shadows on the miniature set.
  - Add a cool blue fill from the sky side, and a warm bounce off the ground.
- **Haze:** layered haze between the camera and the tower, the way smoke was pumped
  into tokusatsu sets for depth.
- **Textures:** generate everything procedurally with canvas or shaders.

## 8. Config: one object at the top of the script

```js
const CONFIG = {
  style:    { look: 'tokusatsu', grain: 0.5, halation: 0.6, gateWeavePx: 1.5, dustScratches: true,
              aspect: '1.85', fps24: true, titleCard: true, directorCuts: false },  // 1.85 keeps the 16:9 video framing
  timeline: { duration: 85, timeScale: 1, loop: true, startAt: 0, spaceIntro: true,
              slowMoFactor: 0.4 },   // applied to the flip and the catch
  squid:    { intensity: 0.9, tentacles: true, ink: true, inkDensity: 1.6,
              chopstickStyle: 'wood', showWires: false, hug: true, hugTurns: 1.25 },
  ship:     { length: 52, diameter: 9, catchPinOffsetFromNose: 21.5 },  // frame 5: arms ~21 m below the nose
  tower:    { height: 135, chopstickLength: 32, catchHeight: 120 },     // nose ends just above the tower top
  descent:  { startAlt: 3000, bellyFlopSpeed: 84, flipAlt: 650, lateralDivert: 75, touchSpeed: 1.5 },
  sun:      { elevationDeg: 26, azimuthDeg: 225 },                      // heavy overcast: soft key, dark cloud deck
  camera:   { preset: 'VIDEO_MATCH', distance: 2000, height: 115, azimuthDeg: 0,   // calibrated from frames 2–3:
              vfovPadDeg: 16, fovCatchDeg: 4.6, horizonPct: 74, towerXPct: 49 }, // elevated long lens, horizon 74% from top,
                                                                                  // catch tower 49% from left, 2nd tower ~72%
  render:   { maxPixelRatio: 2 },
};
```

`style.look` accepts `'tokusatsu'` (the default) or `'clean'`. `'clean'` turns off
the film pass, letterbox and frame cadence, for comparison.

## 9. UI

- **Bottom timeline:** play/pause, a scrubber with phase markers, and a time-scale
  control (0.25×–4×).
- **Panel:** a compact `lil-gui` panel exposing `CONFIG`. Put the camera presets,
  `squidIntensity`, `inkDensity` and the film-look controls first.
- **HUD:** a small overlay in the style of a defence-force command-centre readout from
  a 1970s film, using a monospace font. It shows show time, altitude, vertical speed
  and the phase name, with phase names also written in Japanese:

  | Phase | Japanese |
  | --- | --- |
  | Return from space | 帰還 |
  | Belly-flop | 降下 |
  | Flip | 反転 |
  | Landing burn | 噴射 |
  | Catch | 捕獲 |
  | Hug | 抱擁 |
  | Aftermath | 余韻 |

  Use no logos or agency branding.
- **Keys:**
  - `Space`: play/pause
  - `1`–`5`: camera presets
  - `←` / `→`: scrub ±2 s
  - `S`: toggle the squid layer
  - `F`: toggle the film look
  - `C`: toggle director cuts
- **Reduced motion:** honour `prefers-reduced-motion`. Start paused and turn off
  gate weave, jitter and the 24 fps judder.

## 10. Technical constraints

- **Single self-contained `index.html`.**
- Load Three.js through an import map pinned to `three@0.160.0` from
  `cdn.jsdelivr.net/npm/`. Use the core plus `examples/jsm` addons:
  `EffectComposer`, `RenderPass`, `ShaderPass`, `UnrealBloomPass` (for halation) and
  `OrbitControls`. Also load `lil-gui@0.19.2`.
- Write the film look as one custom `ShaderPass`: grade, grain, halation tint, gate
  weave, vignette, chromatic aberration and letterbox.
- Make no other network requests and use no external models, fonts or textures.
  Build all geometry and textures procedurally.
- Stay under about 150k triangles. Pause rendering when the tab is hidden. Resize
  correctly. Make it work at a phone width of 390 px. On mobile, drop the bloom and
  halve the ink particles.
- If this is published as a Claude Artifact, follow the artifact-design skill. Give
  the page the title **"Ika Kaiju Catch"**.

## 11. Acceptance criteria

1. The artifact opens in `VIDEO_MATCH`, after the optional title card. If a
   screenshot was attached, the opening frame matches it: horizon, tower position,
   tower scale and lighting side.
2. Every frame reads as a Shōwa tokusatsu shot: film grain, halation, painted
   backdrop, a miniature set and practical effects.
3. The vehicle reads unmistakably as a Japanese flying squid kaiju, and its
   silhouette and descent motion still match the real catch.
4. Ink is plentiful and billows like an ink-tank effect, not like CG smoke. The flip
   burst is the visual peak.
5. The chopsticks read clearly as wooden Japanese chopsticks. At contact the pins rest
   on them with no interpenetration, and there are sparks plus a visible, damped
   bounce and sway.
6. After the catch, the squid clearly **hugs the tower**: its arms and tentacles
   spiral around the outside of the lattice, base to tip, without passing through
   it, and hold the hug to the end.
7. The flip and the catch play in slow motion. Scrubbing to any `t` shows the correct
   state immediately, and the same `t` always looks the same. The loop has no
   visible seam.
8. It runs at 60 fps at 1080p on an M1-class laptop and stays usable on a phone.
9. There are no console errors and no network requests beyond the pinned CDN modules.

## 12. Out of scope

- Real logos, trademarks or mission branding
- Existing kaiju or tokusatsu franchise characters, designs or title typography
- Audio
- A booster
